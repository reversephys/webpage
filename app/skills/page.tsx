"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Skill {
    title: string;
    content: string;
}

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/skills/list");
                const data = await res.json();
                setSkills(data);
            } catch {
                console.error("Failed to load skills.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = query.trim()
        ? skills.filter((skill) => {
            const q = query.toLowerCase();
            return (
                skill.title.toLowerCase().includes(q) ||
                skill.content.toLowerCase().includes(q)
            );
        })
        : skills;

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                    <h1 className="text-5xl md:text-7xl font-eczar tracking-tight">Skills.md / Prompt </h1>
                    <Link
                        href="/skills/write"
                        className="text-sm font-sans uppercase tracking-widest border border-gray-300 dark:border-gray-600 px-5 py-2 hover:bg-foreground hover:text-background transition-colors"
                    >
                        Write
                    </Link>
                </div>

                {/* Search bar */}
                <div className="flex gap-2 mb-16">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search skills.md..."
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-sans focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                    />
                </div>

                {loading ? (
                    <p className="text-gray-500 text-center py-20 text-lg">Loading skills...</p>
                ) : (
                    <div className="grid gap-4">
                        {filtered.map((skill) => (
                            <Link
                                key={skill.title}
                                href={`/skills/${encodeURIComponent(skill.title)}`}
                                className="block border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors group bg-white dark:bg-black/20"
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold font-serif group-hover:underline decoration-1 underline-offset-4">{skill.title}</h2>
                                    <span className="text-xs font-sans uppercase tracking-widest text-gray-400 group-hover:text-foreground transition-colors">
                                        View
                                    </span>
                                </div>
                            </Link>
                        ))}

                        {filtered.length === 0 && !loading && (
                            <p className="text-gray-500 text-center py-20 text-lg">
                                {query.trim() ? "No skills.md match your search." : "No skills yet."}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
