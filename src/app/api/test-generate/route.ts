import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Client } from '@notionhq/client';
import Anthropic from '@anthropic-ai/sdk';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ENT_PAGE_ID = '304c4f38-3608-809f-90cb-f08a88eed078';

export async function GET() {
  const steps: Record<string, unknown> = {};

  // Step 1: Read child pages from ENT
  const blocks = await notion.blocks.children.list({ block_id: ENT_PAGE_ID, page_size: 100 });
  const childPages = blocks.results
    .filter((b: any) => b.type === 'child_page')
    .map((b: any) => ({ id: b.id, title: b.child_page?.title }));

  steps.step1_childPages = childPages.map(p => p.title);
  steps.step1_count = childPages.length;

  if (childPages.length === 0) {
    return NextResponse.json({ ...steps, error: 'No child pages found under ENT page' });
  }

  // Step 2: Read content of first child page
  const firstPage = childPages[0];
  steps.step2_conditionName = firstPage.title;
  steps.step2_conditionId = firstPage.id;

  // Recursively read ALL content including nested toggle/callout children
  async function readBlocksRecursive(blockId: string, depth = 0): Promise<string> {
    if (depth > 5) return '';
    let text = '';
    let cursor: string | undefined;
    do {
      const res = await notion.blocks.children.list({ block_id: blockId, page_size: 100, start_cursor: cursor });
      for (const block of res.results) {
        const b = block as any;
        if (b.type === 'child_page') continue;
        const types = ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item', 'toggle', 'callout', 'quote', 'to_do'];
        for (const type of types) {
          if (b[type]?.rich_text) {
            const t = b[type].rich_text.map((r: any) => r.plain_text).join('');
            if (t) text += t + '\n';
          }
        }
        if (b.has_children) {
          text += await readBlocksRecursive(b.id, depth + 1);
        }
      }
      cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
    } while (cursor);
    return text;
  }

  const content = await readBlocksRecursive(firstPage.id);

  steps.step3_contentLength = content.length;
  steps.step3_contentPreview = content.substring(0, 500);

  if (!content.trim()) {
    return NextResponse.json({ ...steps, error: 'Page has no text content (even after recursive read)' });
  }

  // Step 3: Call Claude
  const apiResponse = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `You are an expert UK medical examiner. Generate exactly 1 UKMLA-style SBA question about "${firstPage.title}" based on this content:

${content}

Return ONLY a JSON array with exactly 1 object:
[
  {
    "difficulty": "medium" or "hard",
    "vignette": "the full clinical vignette ending with the question stem",
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

  const rawText = apiResponse.content[0].type === 'text' ? apiResponse.content[0].text : '';

  steps.step4_apiUsage = apiResponse.usage;
  steps.step4_stopReason = apiResponse.stop_reason;
  steps.step4_rawResponseLength = rawText.length;
  steps.step4_rawResponseFirst500 = rawText.substring(0, 500);

  // Step 4: Parse JSON
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    steps.step5_jsonParseSuccess = false;
    steps.step5_error = 'No JSON array found in response';
    steps.step5_fullRawResponse = rawText;
    return NextResponse.json(steps);
  }

  let parsed: any[];
  try {
    parsed = JSON.parse(jsonMatch[0]);
    steps.step5_jsonParseSuccess = true;
    steps.step5_parsedCount = parsed.length;
    steps.step5_parsedQuestion = parsed[0];
  } catch (e: any) {
    steps.step5_jsonParseSuccess = false;
    steps.step5_error = e.message;
    steps.step5_rawJsonMatch = jsonMatch[0].substring(0, 500);
    return NextResponse.json(steps);
  }

  // Step 5: Insert into Supabase
  const q = parsed[0];
  const insertPayload = {
    specialty: 'ENT',
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
  };

  steps.step6_insertPayloadKeys = Object.keys(insertPayload);
  steps.step6_insertPayloadValues = Object.fromEntries(
    Object.entries(insertPayload).map(([k, v]) => [k, typeof v === 'string' ? v.substring(0, 100) + (v.length > 100 ? '...' : '') : v])
  );

  const { data: insertData, error: insertError } = await supabase
    .from('questions')
    .insert(insertPayload)
    .select('id, specialty, difficulty, status, created_at');

  steps.step7_insertSuccess = !insertError;
  steps.step7_insertData = insertData;
  steps.step7_insertError = insertError;

  return NextResponse.json(steps);
}
