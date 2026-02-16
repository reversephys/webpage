"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";

export default function StaffPostActions({ slug }: { slug: string }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        setDeleting(true);
        try {
            await fetch("/api/staff/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug }),
            });
            router.push("/staff");
            router.refresh();
        } catch {
            alert("Failed to delete post.");
            setDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <Link
                href={`/staff/write?edit=${encodeURIComponent(slug)}`}
                className="inline-flex items-center text-xs font-sans uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit Post"
            >
                <Edit className="w-4 h-4 mr-1" />
                Edit
            </Link>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center text-xs font-sans uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete Post"
            >
                <Trash2 className="w-4 h-4 mr-1" />
                {deleting ? "Deleting..." : "Delete"}
            </button>
        </div>
    );
}
