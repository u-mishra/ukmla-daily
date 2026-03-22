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

const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d', 'option_e'] as const;

/**
 * Balance answer distribution across a batch of questions.
 * If any position has <15% or >25% of answers, swap options on
 * overrepresented questions to move their correct answer to an
 * underrepresented position.
 */
function balanceAnswerDistribution(questions: GeneratedQuestion[]): GeneratedQuestion[] {
  if (questions.length < 5) return questions; // too few to balance

  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const q of questions) counts[q.correct_answer]++;

  const total = questions.length;
  const minCount = Math.floor(total * 0.15);
  const maxCount = Math.ceil(total * 0.25);

  // Find over- and under-represented positions
  const over: string[] = [];
  const under: string[] = [];
  for (const letter of ANSWER_LETTERS) {
    if (counts[letter] > maxCount) over.push(letter);
    if (counts[letter] < minCount) under.push(letter);
  }

  if (over.length === 0 || under.length === 0) return questions;

  // Swap: for each overrepresented position, find questions with that answer
  // and swap with an underrepresented position
  for (const fromLetter of over) {
    while (counts[fromLetter] > maxCount && under.length > 0) {
      const toLetter = under[0];
      // Find a question with correct_answer === fromLetter
      const qi = questions.findIndex(q => q.correct_answer === fromLetter);
      if (qi === -1) break;

      const q = { ...questions[qi] };
      const fromIdx = ANSWER_LETTERS.indexOf(fromLetter as typeof ANSWER_LETTERS[number]);
      const toIdx = ANSWER_LETTERS.indexOf(toLetter as typeof ANSWER_LETTERS[number]);
      const fromKey = OPTION_KEYS[fromIdx];
      const toKey = OPTION_KEYS[toIdx];

      // Swap the option text
      const temp = q[fromKey];
      q[fromKey] = q[toKey];
      q[toKey] = temp;
      q.correct_answer = toLetter;

      questions[qi] = q;
      counts[fromLetter]--;
      counts[toLetter]++;

      // Check if toLetter is no longer under-represented
      if (counts[toLetter] >= minCount) under.shift();
    }
  }

  return questions;
}

async function generateQuestions(conditionName: string, content: string): Promise<GeneratedQuestion[]> {
  const referenceBlock = buildReferenceBlock(conditionName);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
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
• ANSWER DISTRIBUTION: Distribute correct answers evenly across positions A, B, C, D, and E. For every batch of 10 questions, each position should appear approximately twice. Options A and E must appear just as often as B, C, and D. Never have 3 or more consecutive questions with the same correct answer position. For these 2 questions, use two DIFFERENT correct answer positions.

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
CLINICAL ACCURACY — NON-NEGOTIABLE
═══════════════════════════════════════

This is the most important section. Clinical errors make questions unusable.

INTERNAL CONSISTENCY:
• Every examination finding and investigation result in the vignette MUST be textbook-accurate for the intended diagnosis. Do not invent findings that do not match the pathophysiology.
• If the diagnosis involves conductive hearing loss on the LEFT, Weber MUST lateralise to the LEFT (the affected ear). If it is sensorineural hearing loss on the LEFT, Weber MUST lateralise to the RIGHT (the unaffected ear). Rinne is negative (bone > air) on the side with conductive loss, and positive bilaterally in sensorineural loss.
• If the vignette includes blood results, those values must be consistent with the diagnosis — e.g. raised CRP in infection, raised TSH with low free T4 in hypothyroidism.
• The examination findings, investigation results, history, and correct answer must ALL point unambiguously to the same diagnosis. There must be zero contradiction between any elements.

COMPLETENESS:
• The stem must contain enough clinical detail to reason through to the single best answer. No ambiguity — a competent final-year student should be able to arrive at the answer from the information given.
• Do not omit a critical finding that would be needed to distinguish between two plausible options.

ACCURACY:
• Every clinical fact must be correct and verifiable against standard medical textbooks.
• The correct answer must DEFINITELY be correct — there must be no reasonable argument for another option being better.
• Use current UK guidelines and standard UK practice (NICE, BNF, SIGN).
• Investigation values must match the reference ranges provided above.

SELF-VERIFICATION — after drafting each question, re-read it and check:
1. Does every examination finding match the intended diagnosis? (e.g. if the answer is a left-sided conductive pathology, does Weber lateralise left?)
2. Do all investigation results support the correct answer and not a distractor?
3. Is the explanation consistent with every detail in the stem?
4. Could a reasonable student argue for a different answer given the information? If yes, fix the stem.
5. Are the examination findings and investigation results textbook-accurate for this condition, not invented or confused with a similar condition?

EXPLANATION MUST EXPLAIN THE FINDINGS:
• The explanation must explicitly state WHY each key examination finding and investigation result occurs in this condition — not just name the diagnosis. For example: "Weber lateralises to the left because otitis externa causes conductive hearing loss, and in conductive loss the tuning fork sound is heard louder in the affected ear."

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

      // If regenerate flag is set, mark all pending questions as rejected
      if (regenerate || body.regenerate) {
        const { error: rejectError } = await supabase
          .from('questions')
          .update({ status: 'rejected' })
          .eq('status', 'pending');

        if (rejectError) {
          console.error('Failed to reject pending questions:', rejectError);
        }
      }
    }

    const childPages = await getChildPages();

    if (childPages.length === 0) {
      return NextResponse.json({ error: 'No condition pages found in Notion.' }, { status: 404 });
    }

    let totalGenerated = 0;
    let skippedConditions = 0;
    const MAX_QUESTIONS_PER_CONDITION = 2;

    // Fetch all existing non-rejected questions to check for duplicates
    const { data: existingQuestions } = await supabase
      .from('questions')
      .select('vignette')
      .in('status', ['pending', 'approved', 'sent']);

    const existingVignettes = (existingQuestions || []).map(q =>
      q.vignette.toLowerCase()
    );

    // Collect all generated questions for batch answer balancing
    const allGenerated: { question: GeneratedQuestion; specialty: string }[] = [];

    for (const page of childPages) {
      try {
        const conditionLower = page.title.toLowerCase();

        // Count existing questions that mention this condition in the vignette
        const keywords = conditionLower
          .split(/[\s\-\/,]+/)
          .filter(w => w.length > 2);

        const existingCount = existingVignettes.filter(vignette =>
          keywords.every(kw => vignette.includes(kw))
        ).length;

        if (existingCount >= MAX_QUESTIONS_PER_CONDITION) {
          console.log(`Skipping "${page.title}" — already has ${existingCount} question(s)`);
          skippedConditions++;
          continue;
        }

        const questionsNeeded = MAX_QUESTIONS_PER_CONDITION - existingCount;

        const content = await getPageContent(page.id);
        if (!content.trim()) continue;

        const questions = await generateQuestions(page.title, content);

        // Override specialty with Notion page title (not the AI's guess)
        const toInsert = questions.slice(0, questionsNeeded);
        for (const q of toInsert) {
          q.specialty = page.title;
          allGenerated.push({ question: q, specialty: page.title });
        }
      } catch (pageError) {
        console.error(`Failed to process page "${page.title}":`, pageError);
      }
    }

    // Post-process: balance answer distribution across the whole batch
    const questionsOnly = allGenerated.map(g => g.question);
    const balanced = balanceAnswerDistribution(questionsOnly);

    // Insert all balanced questions
    for (let i = 0; i < balanced.length; i++) {
      const q = balanced[i];
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

    const skippedMsg = skippedConditions > 0 ? ` Skipped ${skippedConditions} condition(s) that already have ${MAX_QUESTIONS_PER_CONDITION}+ questions.` : '';
    return NextResponse.json({ message: `Generated ${totalGenerated} questions from ${childPages.length} conditions.${skippedMsg}`, count: totalGenerated });
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
