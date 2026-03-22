import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Client } from '@notionhq/client';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { notificationEmailHtml } from '@/lib/email-templates';
import { getReferenceValuesForSpecialty } from '@/lib/reference-values';

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

function buildReferenceBlock(conditionName: string): string {
  const refs = getReferenceValuesForSpecialty(conditionName);
  if (!refs) return '';
  const lines = refs.map(r => `  ${r.name}: ${r.value}`).join('\n');
  return `\nREFERENCE VALUES (use these when including investigation results in vignettes):\n${lines}\n`;
}

async function generateQuestions(conditionName: string, content: string): Promise<GeneratedQuestion[]> {
  const referenceBlock = buildReferenceBlock(conditionName);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 6000,
    messages: [
      {
        role: 'user',
        content: `You are an expert UK medical examiner writing UKMLA Applied Knowledge Test (AKT) questions. Your questions must match the quality and style of Passmedicine and Quesmed — the gold standard for UK medical exam preparation.

CLINICAL CONTENT ABOUT "${conditionName}":
${content}
${referenceBlock}
Generate exactly 2 high-quality UKMLA-style Single Best Answer (SBA) questions about "${conditionName}". Each question must test a DIFFERENT clinical aspect (e.g. one on diagnosis, one on management — never two questions testing the same thing).

═══════════════════════════════════════
VIGNETTE REQUIREMENTS
═══════════════════════════════════════

Every question MUST be a realistic clinical vignette containing ALL of:
• Patient demographics: age, sex
• Relevant past medical history (where clinically relevant)
• Presenting complaint with a specific timeline (e.g. "3-day history of", "over the past 6 weeks")
• Examination findings (e.g. vitals, palpation, auscultation — be specific)
• Investigation results where appropriate (use the reference values above; give actual numbers, not just "raised" or "abnormal")

The question stem must ask for a SINGLE BEST ANSWER. Acceptable stems:
• "What is the most likely diagnosis?"
• "What is the most appropriate next investigation?"
• "What is the most appropriate initial management?"
• "What is the most likely underlying mechanism?" (only if testing applied pathophysiology, not pure recall)
• "What is the single most important next step?"

NEVER use: "Which of the following is true?", "Which is NOT a feature of?", "All of the following EXCEPT"

Weight questions towards: diagnosis from vignette (most common), investigation choice, management decisions, differential diagnosis. Minimal pure pathophysiology.

═══════════════════════════════════════
OPTION REQUIREMENTS
═══════════════════════════════════════

• Exactly 5 options (A–E), one correct answer
• ALL 5 options must be clinically plausible for the scenario presented
• At least 2 distractors must be genuinely tempting — common misconceptions, adjacent diagnoses, or the correct management for a related but different condition
• Options should be similar in length and specificity — don't make one option obviously more detailed
• NEVER include descriptors that give away the answer. For example:
  — Don't write "Type 4 (hyperkalaemic) RTA" when the stem mentions hyperkalaemia
  — Don't write "Addisonian crisis" when the stem describes hyperpigmentation and hypotension
  — Keep option text neutral and factual
• Distribute the correct answer: one question should have the answer in A or B, the other in D or E. Never both on C.

═══════════════════════════════════════
DIFFICULTY
═══════════════════════════════════════

• One question should be "medium", one should be "hard"
• Medium: requires applying clinical knowledge to a vignette, not just pattern matching a buzzword
• Hard: requires distinguishing between two or more plausible diagnoses/management options, or interpreting investigation results in context
• No trivially easy questions — every question must require genuine clinical reasoning

═══════════════════════════════════════
EXPLANATION REQUIREMENTS
═══════════════════════════════════════

Each explanation must:
• State clearly and confidently WHY the correct answer is right (with clinical reasoning, not just restating the fact)
• Explain WHY 2–3 key distractors are wrong (briefly — one sentence each)
• Reference current UK guidelines (NICE, BNF, SIGN) where relevant
• Use no hedging language — no "probably", "it might be", "could potentially"
• Be 4–6 sentences total

═══════════════════════════════════════
CLINICAL ACCURACY
═══════════════════════════════════════

• Every clinical fact must be correct and verifiable
• The correct answer must DEFINITELY be correct — there must be no reasonable argument for another option being better
• Use current UK guidelines and standard UK practice
• The vignette, correct answer, and explanation must all be internally consistent
• Investigation values must match the reference ranges provided

═══════════════════════════════════════

Return ONLY a JSON array with exactly 2 objects:
[
  {
    "specialty": "string (use the medical specialty, e.g. Cardiology, Respiratory, etc.)",
    "difficulty": "medium" or "hard",
    "vignette": "string (the full clinical vignette ending with the question stem)",
    "option_a": "string",
    "option_b": "string",
    "option_c": "string",
    "option_d": "string",
    "option_e": "string",
    "correct_answer": "A", "B", "C", "D", or "E",
    "explanation": "string"
  }
]

Return ONLY the JSON array. No markdown, no code fences, no other text.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse questions from AI response');

  return JSON.parse(jsonMatch[0]);
}

export async function POST(request: NextRequest) {
  try {
    const isAutoTrigger = new URL(request.url).searchParams.get('auto') === 'true';
    const url = new URL(request.url);
    const regenerate = url.searchParams.get('regenerate') === 'true';

    if (isAutoTrigger) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.replace('Bearer ', '') !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .is('sent_date', null);

      if ((count || 0) >= 30) {
        return NextResponse.json({ message: 'Sufficient approved questions in queue. No generation needed.' });
      }
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // If regenerate flag is set, delete all pending questions first
      if (regenerate || body.regenerate) {
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('status', 'pending');

        if (deleteError) {
          console.error('Failed to delete pending questions:', deleteError);
        }
      }
    }

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
