"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { pb } from "@/lib/pocketbase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Pencil, X, Save } from "lucide-react";

type Tab = "write" | "preview";

interface ProfileData {
    id: string;
    username: string;
    email: string;
    introduction: string;
    created: string;
    updated: string;
}

const TOOLBAR_ACTIONS = [
    { label: "B", title: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
    { label: "I", title: "Italic", prefix: "_", suffix: "_", placeholder: "italic text" },
    { label: "S", title: "Strikethrough", prefix: "~~", suffix: "~~", placeholder: "strikethrough" },
    { label: "H1", title: "Heading 1", prefix: "# ", suffix: "", placeholder: "heading", newline: true },
    { label: "H2", title: "Heading 2", prefix: "## ", suffix: "", placeholder: "heading", newline: true },
    { label: "H3", title: "Heading 3", prefix: "### ", suffix: "", placeholder: "heading", newline: true },
    { label: "<>", title: "Inline Code", prefix: "`", suffix: "`", placeholder: "code" },
    { label: "```", title: "Code Block", prefix: "```\n", suffix: "\n```", placeholder: "code block", newline: true },
    { label: "—", title: "Horizontal Rule", prefix: "\n---\n", suffix: "", placeholder: "" },
    { label: "🔗", title: "Link", prefix: "[", suffix: "](url)", placeholder: "link text" },
    { label: "•", title: "Bullet List", prefix: "- ", suffix: "", placeholder: "list item", newline: true },
    { label: "1.", title: "Numbered List", prefix: "1. ", suffix: "", placeholder: "list item", newline: true },
    { label: ">", title: "Blockquote", prefix: "> ", suffix: "", placeholder: "quote", newline: true },
];

export default function ProfilePage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    // Profile data from server (fetched once)
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [tab, setTab] = useState<Tab>("write");
    const [editIntro, setEditIntro] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Fetch the full profile from server API once
    useEffect(() => {
        if (user && !profile) {
            fetch("/api/profile", {
                headers: { Authorization: `Bearer ${pb.authStore.token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.id) {
                        setProfile(data);
                        setEditIntro(data.introduction || "");
                    }
                })
                .catch((err) => console.error("Failed to fetch profile:", err))
                .finally(() => setProfileLoading(false));
        }
    }, [user, profile]);

    const insertToolbar = useCallback(
        (action: (typeof TOOLBAR_ACTIONS)[0]) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = editIntro.slice(start, end) || action.placeholder;

            let insertion = `${action.prefix}${selected}${action.suffix}`;
            if (action.newline && start > 0 && editIntro[start - 1] !== "\n") {
                insertion = "\n" + insertion;
            }

            const newContent = editIntro.slice(0, start) + insertion + editIntro.slice(end);
            setEditIntro(newContent);

            setTimeout(() => {
                textarea.focus();
                const offset = action.newline && start > 0 && editIntro[start - 1] !== "\n" ? 1 : 0;
                const cursorPos = start + action.prefix.length + offset;
                textarea.setSelectionRange(cursorPos, cursorPos + selected.length);
            }, 0);
        },
        [editIntro]
    );

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage(null);

        try {
            const res = await fetch("/api/profile/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${pb.authStore.token}`,
                },
                body: JSON.stringify({ introduction: editIntro }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Update authStore with refreshed token/record
                pb.authStore.save(data.token, data.record);
                // Update local profile state
                setProfile((prev) => (prev ? { ...prev, introduction: editIntro } : prev));
                setSaveMessage("Saved successfully.");
                setIsEditing(false);
                setTab("write");
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage(data.error || "Failed to save.");
            }
        } catch {
            setSaveMessage("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditIntro(profile?.introduction || "");
        setIsEditing(false);
        setTab("write");
    };

    if (loading || profileLoading) {
        return (
            <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
                <div className="max-w-2xl mx-auto text-center text-gray-400">Loading...</div>
            </main>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-eczar mb-12 tracking-tight text-center">Profile</h1>

                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-xs font-sans uppercase tracking-widest text-gray-500">Unique ID</span>
                            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{profile?.id || user.id}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-xs font-sans uppercase tracking-widest text-gray-500">Username</span>
                            <span className="text-lg font-bold tracking-wider">{profile?.username || user.username}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-xs font-sans uppercase tracking-widest text-gray-500">Created</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(profile?.created || user.created).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Introduction Section */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-sans uppercase tracking-widest text-gray-500 font-bold">Introduction</span>
                        </div>

                        {isEditing ? (
                            /* ── Edit Mode ── */
                            <div className="space-y-4">
                                <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
                                    {/* Toolbar */}
                                    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        {TOOLBAR_ACTIONS.map((action) => (
                                            <button
                                                key={action.title}
                                                title={action.title}
                                                onClick={() => {
                                                    setTab("write");
                                                    insertToolbar(action);
                                                }}
                                                className="px-2.5 py-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Write / Preview tabs */}
                                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => setTab("write")}
                                            className={`flex-1 py-3 text-sm font-sans uppercase tracking-widest text-center transition-colors ${tab === "write"
                                                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                }`}
                                        >
                                            Write
                                        </button>
                                        <button
                                            onClick={() => setTab("preview")}
                                            className={`flex-1 py-3 text-sm font-sans uppercase tracking-widest text-center transition-colors ${tab === "preview"
                                                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                }`}
                                        >
                                            Preview
                                        </button>
                                    </div>

                                    {/* Editor / Preview */}
                                    <div className="min-h-[200px]">
                                        {tab === "write" ? (
                                            <textarea
                                                ref={textareaRef}
                                                value={editIntro}
                                                onChange={(e) => setEditIntro(e.target.value)}
                                                placeholder="Write your introduction in Markdown..."
                                                className="w-full h-[200px] px-6 py-5 bg-transparent text-base font-mono leading-relaxed resize-y focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                            />
                                        ) : (
                                            <div className="px-6 py-5">
                                                {editIntro.trim() ? (
                                                    <MarkdownRenderer content={editIntro} />
                                                ) : (
                                                    <p className="text-gray-400 italic">Nothing to preview yet.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Save / Cancel */}
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-sans uppercase tracking-widest text-gray-500 hover:text-foreground border border-gray-200 dark:border-gray-700 rounded transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center gap-1.5 px-6 py-2 bg-foreground text-background font-sans uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-50 transition-opacity rounded"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── View Mode ── */
                            <div>
                                {profile?.introduction?.trim() ? (
                                    <MarkdownRenderer content={profile.introduction} />
                                ) : (
                                    <p className="text-gray-400 italic text-sm">No introduction yet.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Save message */}
                    {saveMessage && (
                        <div
                            className={`px-4 py-2 text-sm font-sans rounded ${saveMessage.includes("success")
                                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                                }`}
                        >
                            {saveMessage}
                        </div>
                    )}

                    {/* Edit Profile button (above Sign Out) */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full mt-4 py-3 inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-sans uppercase tracking-widest text-sm transition-colors rounded"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Profile
                        </button>
                    )}

                    {/* Sign Out */}
                    <button
                        onClick={() => {
                            logout();
                            router.push("/");
                        }}
                        className="w-full mt-2 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-sans uppercase tracking-widest text-sm transition-colors rounded"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </main>
    );
}
