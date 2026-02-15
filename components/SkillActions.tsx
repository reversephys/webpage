"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SkillActionsProps {
    title: string;
}

export function SkillActions({ title }: SkillActionsProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this skill?")) return;

        setDeleting(true);
        try {
            const res = await fetch("/api/skills/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });

            const data = await res.json();
            if (data.redirect) {
                router.push(data.redirect);
            }
        } catch {
            alert("Failed to delete skill.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex gap-3">
            <Link
                href={`/api/skills/download?title=${encodeURIComponent(title)}`}
                className="text-xs font-sans uppercase tracking-widest border border-gray-300 dark:border-gray-600 px-4 py-1.5 hover:bg-foreground hover:text-background transition-colors"
            >
                Download
            </Link>
            <Link
                href={`/skills/write?edit=${encodeURIComponent(title)}`}
                className="text-xs font-sans uppercase tracking-widest border border-gray-300 dark:border-gray-600 px-4 py-1.5 hover:bg-foreground hover:text-background transition-colors"
            >
                Edit
            </Link>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-sans uppercase tracking-widest border border-gray-300 dark:border-gray-600 px-4 py-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors disabled:opacity-50"
            >
                {deleting ? "Deleting..." : "Delete"}
            </button>
        </div>
    );
}
