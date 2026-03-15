import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Client } from '@notionhq/client';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { notificationEmailHtml } from '@/lib/email-templates';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const PARENT_PAGE_ID = '304c4f38-3608-809f-90cb-f08a88eed078';

interface NotionBlock {
  type: string;
  paragraph?: { rich_text: Array<{ plain_text: string }> };
  heading_1?: { rich_text: Array<{ plain_text: string }> };
  heading_2?: { rich_text: Array<{ plain_text: string }> };
  heading_3?: { rich_text: Array<{ plain_text: string }> };
  bulleted_list_item?: { rich_text: Array<{ plain_text: string }> };
  numbered_list_item?: { rich_text: Array<{ plain_text: string }> };
  toggle?: { rich_text: Array<{ plain_text: string }> };
  child_page?: { title: string };
}

function extractTextFromBlock(block: NotionBlock): string {
  const types = ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item', 'toggle'] as const;
  for (const type of types) {
    const content = block[type];
    if (content && 'rich_text' in content) {
      return content.rich_text.map((t: { plain_text: string }) => t.plain_text).join('');
    }
  }
  return '';
}

async function getPageContent(pageId: string): Promise<string> {
  const blocks = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  let content = '';

  for (const block of blocks.results) {
    const text = extractTextFromBlock(block as NotionBlock);
    if (text) content += text + '\n';
  }

  return content;
}

async function getChildPages(): Promise<Array<{ id: string; title: string }>> {
  const blocks = await notion.blocks.children.list({ block_id: PARENT_PAGE_ID, page_size: 100 });
  const pages: Array<{ id: string; title: string }> = [];

  for (const block of blocks.results as Array<NotionBlock & { id: string; type: string }>) {
    if (block.type === 'child_page' && block.child_page) {
      pages.push({ id: block.id, title: block.child_page.title });
    }
  }

  return pages;
}

interface GeneratedQuestion {
  specialty: string;
  difficulty: string;
  vignette: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
}

async function generateQuestions(conditionName: string, content: string): Promise<GeneratedQuestion[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are generating UKMLA-style Single Best Answer (SBA) questions based on the following clinical content about "${conditionName}".

CLINICAL CONTENT:
${content}

Generate exactly 5 UKMLA-style SBA questions. Requirements:

1. Each question must have a realistic clinical vignette (2-3 sentences) including age, sex, presenting complaint, and key clinical findings.
2. Exactly 5 options (A-E), with ONE correct answer.
3. A concise explanation (2-3 sentences) justifying the correct answer.
4. Mix question types across: diagnosis from presentation, first-line investigation, appropriate management, complication recognition, and "which is NOT a feature of" questions.
5. Difficulty must be medium or hard — require genuine clinical reasoning, not simple recall.
6. Options must be plausible and non-leading. NEVER include descriptors in option text that give away the answer (e.g., don't write "Type 4 (hyperkalaemic) RTA" when the stem features hyperkalaemia).
7. Distribute the correct answer position evenly across A-E (each question should have a different correct answer letter if possible).
8. Tag each with the specialty name and difficulty level (medium or hard).

Return ONLY a JSON array with exactly 5 objects, each with these fields:
{
  "specialty": "string",
  "difficulty": "medium" or "hard",
  "vignette": "string",
  "option_a": "string",
  "option_b": "string",
  "option_c": "string",
  "option_d": "string",
  "option_e": "string",
  "correct_answer": "A", "B", "C", "D", or "E",
  "explanation": "string"
}

Return ONLY the JSON array, no other text.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse questions from AI response');

  return JSON.parse(jsonMatch[0]);
}

export async function POST(request: NextRequest) {
  try {
    const isAutoTrigger = new URL(request.url).searchParams.get('auto') === 'true';

    if (isAutoTrigger) {
      // Auto-trigger from cron — check CRON_SECRET
      const authHeader = request.headers.get('authorization');
      if (authHeader?.replace('Bearer ', '') !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Check if we need more questions
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .is('sent_date', null);

      if ((count || 0) >= 30) {
        return NextResponse.json({ message: 'Sufficient approved questions in queue. No generation needed.' });
      }
    } else {
      // Manual trigger — check admin password
      const body = await request.json().catch(() => ({}));
      if (body.password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Read child pages from Notion
    const childPages = await getChildPages();

    if (childPages.length === 0) {
      return NextResponse.json({ error: 'No condition pages found in Notion.' }, { status: 404 });
    }

    let totalGenerated = 0;

    for (const page of childPages) {
      try {
        const content = await getPageContent(page.id);
        if (!content.trim()) continue;

        const questions = await generateQuestions(page.title, content);

        for (const q of questions) {
          const { error } = await supabase.from('questions').insert({
            specialty: q.specialty,
            difficulty: q.difficulty,
            vignette: q.vignette,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            option_e: q.option_e,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            status: 'pending',
          });
          if (!error) totalGenerated++;
        }
      } catch (pageError) {
        console.error(`Failed to process page "${page.title}":`, pageError);
      }
    }

    // If auto-triggered, send notification email
    if (isAutoTrigger && totalGenerated > 0) {
      try {
        await resend.emails.send({
          from: 'UKMLA Daily <question@ukmladaily.co.uk>',
          to: 'mishra.u3310@gmail.com',
          subject: `📋 ${totalGenerated} new questions ready for review`,
          html: notificationEmailHtml(totalGenerated),
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    }

    return NextResponse.json({ message: `Generated ${totalGenerated} questions from ${childPages.length} conditions.`, count: totalGenerated });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 });
  }
}

// Handle GET for Vercel cron
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.replace('Bearer ', '') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fakeReq = new NextRequest(request.url + (request.url.includes('?') ? '&' : '?') + 'auto=true', {
    method: 'POST',
    headers: request.headers,
  });
  return POST(fakeReq);
}
