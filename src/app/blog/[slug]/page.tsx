import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { BLOG, getPost } from "@/data/blog";
import ShareButtons from "@/components/ShareButtons";

export async function generateStaticParams() {
  return BLOG.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `https://viralisima.com/blog/${slug}`;
  return {
    title: `${post.title} | Viralísima`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      siteName: "Viralísima",
      images: [{ url: `/api/og?blog=${slug}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      images: [`/api/og?blog=${slug}`],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `https://viralisima.com/blog/${slug}`;
  const shareText = `Me encantó este post: ${post.title}`;

  return (
    <main className="min-h-screen bg-white">
      <div
        className={`bg-gradient-to-br ${post.coverGradient} text-white`}
      >
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-12">
          <Link href="/blog" className="text-sm opacity-80 hover:opacity-100">
            ← Blog Viralísima
          </Link>
          <div className="text-center mt-8">
            <div className="text-7xl mb-4">{post.emoji}</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
              {post.category} · {new Date(post.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">{post.title}</h1>
            <p className="mt-3 text-lg opacity-95">{post.description}</p>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate prose-lg prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-fuchsia-600">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-fuchsia-500 to-orange-500 rounded-3xl p-6 text-white">
          <ShareButtons text={shareText} url={url} />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all"
          >
            📝 Más del blog
          </Link>
        </div>
      </div>
    </main>
  );
}
