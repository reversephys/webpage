import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { PostActions } from "@/components/PostActions";

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <article className="max-w-3xl mx-auto">
                {/* Top bar: Back link + Actions */}
                <div className="flex items-center justify-between mb-12">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-sm font-sans uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Posts
                    </Link>
                    <PostActions slug={post.slug} />
                </div>

                {/* Post header */}
                <header className="mb-12 text-center">
                    <div className="flex justify-center items-center gap-4 mb-6 text-xs tracking-[0.2em] text-gray-400 uppercase font-sans">
                        <span>{post.date}</span>
                        <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700" />
                        <span>{post.tag}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                        {post.title}
                    </h1>
                </header>

                {/* Markdown content */}
                <MarkdownRenderer content={post.content || ""} />
            </article>
        </main>
    );
}
