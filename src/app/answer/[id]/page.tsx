import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import AnswerClient from './AnswerClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: question } = await supabase
    .from('questions')
    .select('day_number, specialty')
    .eq('id', id)
    .single();

  const dayText = question?.day_number ? `Day ${question.day_number}` : 'Practice Question';
  const specialty = question?.specialty || 'Clinical Medicine';

  return {
    title: `UKMLA Daily — ${dayText}`,
    description: `Can you answer today's ${specialty} question?`,
    openGraph: {
      title: `UKMLA Daily — ${dayText}`,
      description: `Can you answer today's ${specialty} question?`,
      type: 'website',
      siteName: 'UKMLA Daily',
    },
    twitter: {
      card: 'summary',
      title: `UKMLA Daily — ${dayText}`,
      description: `Can you answer today's ${specialty} question?`,
    },
  };
}

export default async function AnswerPage({ params }: Props) {
  const { id } = await params;
  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Question not found</h1>
          <p className="text-gray-500">This question may have been removed or the link is incorrect.</p>
          <a href="/" className="mt-4 inline-block gradient-text font-semibold">← Back to UKMLA Daily</a>
        </div>
      </div>
    );
  }

  // Get initial stats
  const { data: clicks } = await supabase
    .from('answer_clicks')
    .select('got_it_right')
    .eq('question_id', id)
    .not('got_it_right', 'is', null);

  const total = clicks?.length || 0;
  const correct = clicks?.filter(c => c.got_it_right).length || 0;
  const initialPercentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <AnswerClient
      question={question}
      initialPercentage={initialPercentage}
      initialTotal={total}
    />
  );
}
