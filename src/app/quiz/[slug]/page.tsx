import { notFound } from "next/navigation";
import QuizRunner from "@/components/QuizRunner";
import { QUIZZES, getQuiz } from "@/data/quizzes";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return QUIZZES.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = getQuiz(slug);
  if (!quiz) return {};
  const url = `https://viralisima.com/quiz/${slug}`;
  return {
    title: `${quiz.title} | Viralísima`,
    description: quiz.subtitle,
    openGraph: {
      title: quiz.title,
      description: quiz.subtitle,
      url,
      siteName: "Viralísima",
      type: "website",
      images: [{ url: `/api/og?quiz=${slug}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: quiz.title,
      description: quiz.subtitle,
      images: [`/api/og?quiz=${slug}`],
    },
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = getQuiz(slug);
  if (!quiz) notFound();
  return <QuizRunner quiz={quiz} />;
}
