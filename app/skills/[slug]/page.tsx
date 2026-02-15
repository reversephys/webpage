import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllSkills, getSkillByTitle } from "@/lib/skills";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { SkillActions } from "@/components/SkillActions";

interface SkillPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const skills = getAllSkills();
    return skills.map((skill) => ({
        slug: skill.title,
    }));
}

export default async function SkillPage({ params }: SkillPageProps) {
    const { slug } = await params;
    // Decode slug because it might contain special chars or spaces
    const title = decodeURIComponent(slug);

    const skill = getSkillByTitle(title);

    if (!skill) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <article className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <Link
                        href="/skills"
                        className="inline-flex items-center text-sm font-sans uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Skills
                    </Link>

                    <SkillActions title={skill.title} />
                </div>

                {/* Header */}
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                        {skill.title}
                    </h1>
                </header>

                {/* Markdown content */}
                <MarkdownRenderer content={skill.content} />
            </article>
        </main>
    );
}
