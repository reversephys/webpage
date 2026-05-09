import { getPostBySlug } from "@/lib/notice";
import { getTagsForPosts } from "@/lib/tags";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import NoticePostActions from "@/components/NoticePostActions";
import { CommentsList } from "@/components/CommentsList";

interface NoticePostPageProps {
    params: Promise<{ slug: string }>;
}

export default async function NoticePostPage({ params }: NoticePostPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const tags = post.tag.split(",").map(t => t.trim()).filter(Boolean);

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <article className="max-w-3xl mx-auto">
                {/* Top bar: Back link + Actions */}
                <div className="flex items-center justify-between mb-12">
                    <Link
                        href="/notice"
                        className="inline-flex items-center text-sm font-sans uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Notice
                    </Link>
                    <NoticePostActions slug={post.slug} />
                </div>

                {/* Post header */}
                <header className="mb-12 text-center">
                    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mb-6 text-xs tracking-[0.2em] text-gray-400 uppercase font-sans">
                        <span>{post.date}</span>
                        <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700 hidden sm:inline-block" />
                        <div className="flex flex-wrap gap-2">
                            {tags.map(t => (
                                <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-sm">{t}</span>
                            ))}
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                        {post.title}
                    </h1>
                </header>

                {/* Markdown content */}
                <MarkdownRenderer content={post.content || ""} />

                {/* Comments section */}
                <CommentsList postUuid={post.slug} />
            </article>
        </main>
    );
}

