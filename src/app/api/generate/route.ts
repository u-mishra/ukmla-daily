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

// All specialty source pages — each is a top-level Notion page whose children are conditions
const SPECIALTY_PAGES = [
  { id: '304c4f38-3608-809f-90cb-f08a88eed078', name: 'ENT' },
  { id: '2e6c4f38-3608-80b4-8559-ef6c08f49709', name: 'Haematology' },
  { id: '2f4c4f38-3608-8060-a6a8-d50a4fd69c51', name: 'Neurology' },
  { id: '303c4f38-3608-80ae-b778-d8aaab9a140f', name: 'Renal' },
  { id: '322c4f38-3608-8065-9953-dfc2cccb9fba', name: 'Infectious Diseases' },
];

interface NotionBlock {
  type: string;
  has_children?: boolean;
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

function hasTextContent(blocks: NotionBlock[]): boolean {
  for (const block of blocks) {
    if (block.type !== 'child_page') {
      const text = extractTextFromBlock(block);
      if (text.trim().length > 50) return true;
    }
  }
  return false;
}

async function getLeafConditionPages(parentId: string): Promise<Array<{ id: string; title: string }>> {
  const blocks = await notion.blocks.children.list({ block_id: parentId, page_size: 100 });
  const leafPages: Array<{ id: string; title: string }> = [];

  for (const block of blocks.results as Array<NotionBlock & { id: string; type: string }>) {
    if (block.type === 'child_page' && block.child_page) {
      const childBlocks = await notion.blocks.children.list({ block_id: block.id, page_size: 100 });
      const childPageBlocks = (childBlocks.results as Array<NotionBlock & { id: string; type: string }>)
        .filter(b => b.type === 'child_page');

      if (childPageBlocks.length > 0 && !hasTextContent(childBlocks.results as NotionBlock[])) {
        const nested = await getLeafConditionPages(block.id);
        leafPages.push(...nested);
      } else {
        leafPages.push({ id: block.id, title: block.child_page.title });
      }
    }
  }

  return leafPages;
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

async function generateQuestions(conditionName: string, content: string, logs: string[]): Promise<GeneratedQuestion[]> {
  const referenceBlock = buildReferenceBlock(conditionName);

  logs.push(`[API] Calling Claude for "${conditionName}" (content: ${content.length} chars)`);

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `You are an expert UK medical examiner writing UKMLA Applied Knowledge Test (AKT) questions. Your questions must match the quality and style of Passmedicine and Quesmed — the gold standard for UK medical exam preparation.

CLINICAL CONTENT ABOUT "${conditionName}":
${content}
${referenceBlock}
Generate exactly 2 high-quality UKMLA-style Single Best Answer (SBA) questions about "${conditionName}". The 2 questions MUST test DIFFERENT clinical aspects — never two questions testing the same thing.

═══════════════════════════════════════
QUESTION TOPIC DISTRIBUTION
═══════════════════════════════════════

Choose from these question types, weighted as follows:
• Diagnosis from a clinical vignette: ~35% (most common — present a case, ask "What is the most likely diagnosis?")
• Management decisions: ~30% (ask about first-line treatment, next step in management, when to refer)
• Differential diagnosis: ~15% (present an ambiguous case, ask which diagnosis best fits)
• Investigation interpretation: ~10% (give results, ask what they indicate or what to do next)
• OSCE-relevant practical knowledge / counselling / screening: ~10% (e.g. "What is the most appropriate advice?", "Which screening test is indicated?")

ABSOLUTELY NO pure pathophysiology or mechanism questions. The UKMLA tests clinical application, not recall of mechanisms. Never ask "What is the underlying mechanism?" or "Which pathological process explains this?" — instead embed the pathophysiology knowledge into a clinical scenario.

For these 2 questions, pick 2 DIFFERENT types from the list above.

═══════════════════════════════════════
VIGNETTE REQUIREMENTS
═══════════════════════════════════════

Every question MUST be a realistic clinical vignette that reads like a real UKMLA SBA. It must contain ALL of:
• Patient demographics: age, sex
• Relevant past medical history (where clinically relevant)
• Presenting complaint with a specific timeline (e.g. "3-day history of", "over the past 6 weeks")
• Examination findings (e.g. vitals, palpation, auscultation — be specific with numbers)
• Investigation results where appropriate (use the reference values above; give actual numbers, not just "raised" or "abnormal")
• At least one subtle red herring or incidental finding that might make you consider a different diagnosis — this is what makes questions challenging

The question stem must ask for a SINGLE BEST ANSWER. Acceptable stems:
• "What is the most likely diagnosis?"
• "What is the most appropriate next investigation?"
• "What is the most appropriate initial management?"
• "What is the single most important next step?"
• "What is the most appropriate advice for this patient?"

NEVER use: "Which of the following is true?", "Which is NOT a feature of?", "All of the following EXCEPT", "Which of the following is true about X?"
ALWAYS embed knowledge in a clinical scenario — never ask about a topic in the abstract.

═══════════════════════════════════════
OPTION & DISTRACTOR REQUIREMENTS
═══════════════════════════════════════

• Exactly 5 options (A–E), one correct answer
• ALL 5 options must be clinically plausible to someone who hasn't revised this topic thoroughly
• At least 2 distractors must be genuinely tempting — they should be the correct answer for a closely related but different condition, a common misconception, or the next-best management option
• NEVER include obviously wrong filler options that no student would pick
• Options should be similar in length and specificity — don't make one option obviously more detailed
• NEVER include descriptors that give away the answer:
  — Don't write "Type 4 (hyperkalaemic) RTA" when the stem mentions hyperkalaemia
  — Don't write "Addisonian crisis" when the stem describes hyperpigmentation and hypotension
  — Keep option text neutral and factual
• ANSWER DISTRIBUTION: For these 2 questions, use two DIFFERENT correct answer positions (A–E). Distribute evenly — don't favour B, C, D over A and E.

═══════════════════════════════════════
DIFFICULTY
═══════════════════════════════════════

• One question should be "medium", one should be "hard"
• Medium: requires applying clinical knowledge to a vignette, not just pattern matching a buzzword
• Hard: requires distinguishing between two or more plausible diagnoses/management options, or interpreting nuanced investigation results in context
• No trivially easy questions — every question must require genuine clinical reasoning

═══════════════════════════════════════
EXPLANATION REQUIREMENTS
═══════════════════════════════════════

Each explanation must:
• State clearly and confidently WHY the correct answer is right, with clinical reasoning (not just restating the diagnosis name)
• Explain WHY at least 2 key distractors are wrong (one sentence each — be specific about what makes them incorrect for THIS presentation)
• Reference current UK guidelines where relevant: NICE, BNF, SIGN, NICE CKS. Cite the specific source (e.g. "As per NICE CKS, first-line treatment for X is..." or "NICE guidelines recommend...")
• Use a confident, authoritative tone throughout — no hedging language ("probably", "it might be", "could potentially", "it is likely that")
• Be 4–6 sentences total
• Explicitly explain WHY each key examination finding and investigation result occurs in this condition — don't just name the diagnosis

═══════════════════════════════════════
CLINICAL ACCURACY — NON-NEGOTIABLE
═══════════════════════════════════════

Clinical errors make questions unusable.

INTERNAL CONSISTENCY:
• Every examination finding and investigation result in the vignette MUST be textbook-accurate for the intended diagnosis
• If the vignette includes blood results, those values must be consistent with the diagnosis
• The examination findings, investigation results, history, and correct answer must ALL point unambiguously to the same diagnosis. Zero contradictions.

COMPLETENESS:
• The stem must contain enough clinical detail to reason through to the single best answer
• Do not omit a critical finding that would be needed to distinguish between two plausible options

UK GUIDELINES:
• All management answers must follow current UK guidelines: NICE, BNF, SIGN, NICE CKS
• Drug doses, first-line treatments, referral criteria must match UK practice
• Specify the guideline source in the explanation

SELF-VERIFICATION — after drafting each question, check:
1. Does every examination finding match the intended diagnosis?
2. Do all investigation results support the correct answer and not a distractor?
3. Is the explanation consistent with every detail in the stem?
4. Could a reasonable student argue for a different answer? If yes, fix the stem.
5. Are findings textbook-accurate, not invented or confused with a similar condition?
6. Does the management follow current UK guidelines?

═══════════════════════════════════════

Return ONLY a JSON array with exactly 2 objects:
[
  {
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
  logs.push(`[API] Response for "${conditionName}": ${text.length} chars, usage: ${JSON.stringify(response.usage)}`);

  if (!text) {
    logs.push(`[API] ERROR: Empty response for "${conditionName}"`);
    throw new Error(`Empty AI response for "${conditionName}"`);
  }

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    logs.push(`[API] ERROR: No JSON array found in response for "${conditionName}". Raw text (first 500 chars): ${text.substring(0, 500)}`);
    throw new Error(`Failed to parse questions from AI response for "${conditionName}"`);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    logs.push(`[API] Parsed ${parsed.length} question(s) for "${conditionName}"`);
    return parsed;
  } catch (parseErr) {
    logs.push(`[API] ERROR: JSON parse failed for "${conditionName}": ${parseErr}. Raw match (first 500 chars): ${jsonMatch[0].substring(0, 500)}`);
    throw parseErr;
  }
}

export async function POST(request: NextRequest) {
  const logs: string[] = [];

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

      if (regenerate || body.regenerate) {
        const { error: rejectError } = await supabase
          .from('questions')
          .update({ status: 'rejected' })
          .eq('status', 'pending');

        if (rejectError) {
          logs.push(`[REGEN] Failed to reject pending questions: ${JSON.stringify(rejectError)}`);
        }
      }
    }

    let totalGenerated = 0;
    let skippedConditions = 0;
    let totalConditions = 0;
    let emptyContentConditions = 0;
    const MAX_QUESTIONS_PER_CONDITION = 2;
    const specialtyBreakdown: Record<string, number> = {};
    const skippedDetails: string[] = [];
    const errors: string[] = [];

    // Log existing question counts (duplicate check now happens per-condition with fresh queries)
    const { count: existingCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'approved', 'sent']);

    logs.push(`[DB] Found ${existingCount || 0} existing non-rejected questions`);

    const insertErrors: string[] = [];

    // Loop through ALL specialty pages — insert each question IMMEDIATELY after generation
    // so that if the function times out, completed questions are already in the database
    for (const specialty of SPECIALTY_PAGES) {
      logs.push(`\n[NOTION] === Processing specialty: ${specialty.name} ===`);
      let conditionsInSpecialty = 0;

      try {
        const conditionPages = await getLeafConditionPages(specialty.id);
        logs.push(`[NOTION] Found ${conditionPages.length} condition page(s) for ${specialty.name}: ${conditionPages.map(p => p.title).join(', ')}`);
        totalConditions += conditionPages.length;

        for (const page of conditionPages) {
          try {
            const conditionLower = page.title.toLowerCase();

            const keywords = conditionLower
              .split(/[\s\-\/,]+/)
              .filter(w => w.length > 3);

            // Re-fetch existing for this specialty to include questions saved earlier in this run
            const { data: freshExisting } = await supabase
              .from('questions')
              .select('vignette')
              .eq('specialty', specialty.name)
              .in('status', ['pending', 'approved', 'sent']);

            const specialtyVignettes = (freshExisting || []).map(q => q.vignette.toLowerCase());
            const matchingCount = keywords.length > 0
              ? specialtyVignettes.filter(vignette => keywords.some(kw => vignette.includes(kw))).length
              : 0;

            if (matchingCount >= MAX_QUESTIONS_PER_CONDITION) {
              const msg = `Skipped "${page.title}" (${specialty.name}) — ${matchingCount} existing question(s) match keywords [${keywords.join(', ')}]`;
              logs.push(`[SKIP] ${msg}`);
              skippedDetails.push(msg);
              skippedConditions++;
              continue;
            }

            const questionsNeeded = MAX_QUESTIONS_PER_CONDITION - matchingCount;
            logs.push(`[PROCESS] "${page.title}" (${specialty.name}) — need ${questionsNeeded} question(s), ${matchingCount} existing`);

            const content = await getPageContent(page.id);
            if (!content.trim()) {
              logs.push(`[SKIP] "${page.title}" — empty content`);
              emptyContentConditions++;
              continue;
            }

            logs.push(`[NOTION] "${page.title}" content: ${content.length} chars`);

            const questions = await generateQuestions(page.title, content, logs);

            // INSERT IMMEDIATELY after generation — don't batch
            const toInsert = questions.slice(0, questionsNeeded);
            for (const q of toInsert) {
              q.specialty = specialty.name;

              const { error: insertError, data: insertData } = await supabase.from('questions').insert({
                specialty: q.specialty,
                condition_name: page.title,
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
              }).select('id');

              if (insertError) {
                const errMsg = `Insert failed (${specialty.name} / ${page.title}): ${JSON.stringify(insertError)}`;
                logs.push(`[DB] ERROR: ${errMsg}`);
                insertErrors.push(errMsg);
              } else {
                totalGenerated++;
                conditionsInSpecialty++;
                logs.push(`[DB] Saved question (${specialty.name} / ${page.title}) — id: ${insertData?.[0]?.id} — total so far: ${totalGenerated}`);
              }
            }
          } catch (pageError) {
            const errMsg = `Failed "${page.title}" (${specialty.name}): ${pageError instanceof Error ? pageError.message : String(pageError)}`;
            logs.push(`[ERROR] ${errMsg}`);
            errors.push(errMsg);
          }
        }
      } catch (specialtyError) {
        const errMsg = `Failed specialty "${specialty.name}": ${specialtyError instanceof Error ? specialtyError.message : String(specialtyError)}`;
        logs.push(`[ERROR] ${errMsg}`);
        errors.push(errMsg);
      }

      specialtyBreakdown[specialty.name] = conditionsInSpecialty;
    }

    if (isAutoTrigger && totalGenerated > 0) {
      try {
        await resend.emails.send({
          from: 'UKMLA Daily <question@ukmladaily.co.uk>',
          to: 'mishra.u3310@gmail.com',
          subject: `${totalGenerated} new questions ready for review`,
          html: notificationEmailHtml(totalGenerated),
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    }

    // Print all logs to console
    for (const log of logs) console.log(log);

    const breakdownStr = Object.entries(specialtyBreakdown)
      .map(([name, count]) => `${name}: ${count}`)
      .join(', ');

    const messageParts = [
      `Generated ${totalGenerated} question(s) from ${totalConditions} conditions across ${SPECIALTY_PAGES.length} specialties.`,
      `Breakdown: ${breakdownStr}.`,
    ];
    if (skippedConditions > 0) messageParts.push(`Skipped ${skippedConditions} condition(s) (already have ${MAX_QUESTIONS_PER_CONDITION}+ questions).`);
    if (emptyContentConditions > 0) messageParts.push(`${emptyContentConditions} condition(s) had empty content.`);
    if (errors.length > 0) messageParts.push(`${errors.length} error(s) occurred.`);
    if (insertErrors.length > 0) messageParts.push(`${insertErrors.length} insert error(s).`);

    return NextResponse.json({
      message: messageParts.join(' '),
      count: totalGenerated,
      breakdown: specialtyBreakdown,
      totalConditions,
      skippedConditions,
      emptyContentConditions,
      errors: errors.length > 0 ? errors : undefined,
      insertErrors: insertErrors.length > 0 ? insertErrors : undefined,
      skippedDetails: skippedDetails.length > 0 ? skippedDetails : undefined,
      logs,
    });
  } catch (error) {
    for (const log of logs) console.log(log);
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Generate error:', error);
    return NextResponse.json({
      error: `Failed to generate questions: ${errMsg}`,
      logs,
    }, { status: 500 });
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
