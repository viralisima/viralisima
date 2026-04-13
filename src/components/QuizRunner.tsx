"use client";

import { useState } from "react";
import type { Quiz, QuizResult } from "@/data/quizzes";
import Link from "next/link";
import ShareButtons from "./ShareButtons";

function computeResult(quiz: Quiz, answers: number[]): QuizResult {
  if (quiz.type === "trivia") {
    const correct = answers.reduce((acc, ai, qi) => {
      const opt = quiz.questions[qi]?.options[ai];
      return acc + (opt?.isCorrect ? 1 : 0);
    }, 0);
    const total = quiz.questions.length;
    const pct = correct / total;
    if (pct >= 0.9) return quiz.results.find((r) => r.id === "legend") ?? quiz.results[0];
    if (pct >= 0.7) return quiz.results.find((r) => r.id === "master") ?? quiz.results[0];
    if (pct >= 0.4) return quiz.results.find((r) => r.id === "fan") ?? quiz.results[0];
    return quiz.results.find((r) => r.id === "novato") ?? quiz.results[quiz.results.length - 1];
  }
  const scores: Record<string, number> = {};
  answers.forEach((ai, qi) => {
    const opt = quiz.questions[qi]?.options[ai];
    if (!opt?.points) return;
    for (const [k, v] of Object.entries(opt.points)) {
      scores[k] = (scores[k] || 0) + v;
    }
  });
  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
  return quiz.results.find((r) => r.id === winner) ?? quiz.results[0];
}

export default function QuizRunner({ quiz }: { quiz: Quiz }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  const total = quiz.questions.length;
  const progress = step / total;

  if (result) {
    if (typeof window !== "undefined") {
      const target = `/quiz/${quiz.slug}/resultado/${result.id}`;
      if (window.location.pathname !== target) window.history.replaceState({}, "", target);
    }
    return (
      <ResultCard
        quiz={quiz}
        result={result}
        onRestart={() => {
          setStep(0);
          setAnswers([]);
          setResult(null);
          if (typeof window !== "undefined")
            window.history.replaceState({}, "", `/quiz/${quiz.slug}`);
        }}
      />
    );
  }

  const q = quiz.questions[step];
  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    if (step + 1 >= total) {
      setResult(computeResult(quiz, newAnswers));
    } else {
      setAnswers(newAnswers);
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="mt-6 mb-8">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${quiz.coverGradient} transition-all duration-500`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Pregunta {step + 1} de {total}
          </p>
        </div>

        <div className="text-center mb-8">
          {q.emoji && <div className="text-6xl mb-4">{q.emoji}</div>}
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {q.text}
          </h2>
        </div>

        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-fuchsia-500 hover:shadow-md transition-all font-medium text-slate-800"
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  quiz,
  result,
  onRestart,
}: {
  quiz: Quiz;
  result: QuizResult;
  onRestart: () => void;
}) {
  const shareUrl = `https://viralisima.com/quiz/${quiz.slug}/resultado/${result.id}`;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${result.bgGradient} text-white`}>
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
        <Link href="/" className="text-sm opacity-80 hover:opacity-100">
          ← Viralísima
        </Link>

        <div className="text-center mt-12">
          <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
            Tu resultado
          </div>
          <div className="text-9xl mb-4">{result.emoji}</div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">{result.title}</h1>
          <p className="text-lg md:text-xl opacity-95 max-w-lg mx-auto leading-relaxed">
            {result.description}
          </p>
        </div>

        <ShareButtons text={result.shareText} url={shareUrl} />

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRestart}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all"
          >
            🔄 Volver a hacer el test
          </button>
          <Link
            href="/"
            className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-center hover:scale-105 transition-all"
          >
            🎯 Probar otros quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}
