"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Plus, ExternalLink, Rss, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

interface Article {
    title: string;
    link: string;
    pubDate: string;
    isoDate: string;
    snippet: string;
    source: string;
    feedUrl?: string;
}

interface FeedData {
    title: string;
    articles: Article[];
    loading: boolean;
    error?: boolean;
}

export default function NewsPage() {
    const [feeds, setFeeds] = useState<string[]>([]);
    const [feedData, setFeedData] = useState<Record<string, FeedData>>({});
    const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

    // Feed Management
    const [newFeedUrl, setNewFeedUrl] = useState("");
    const [addingFeed, setAddingFeed] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const refreshFeed = async (url: string) => {
        setFeedData(prev => ({
            ...prev,
            [url]: { ...prev[url], loading: true, title: prev[url]?.title || url, articles: prev[url]?.articles || [] }
        }));

        try {
            const res = await fetch(`/api/news/articles?url=${encodeURIComponent(url)}`);
            const articles: Article[] = await res.json();

            // Get title from first article or fallback to URL
            const title = articles.length > 0 ? articles[0].source : url;

            setFeedData(prev => ({
                ...prev,
                [url]: { title, articles, loading: false }
            }));
        } catch (error) {
            console.error(`Failed to load feed: ${url}`, error);
            setFeedData(prev => ({
                ...prev,
                [url]: { ...prev[url], loading: false, error: true }
            }));
        }
    };

    const fetchFeeds = async () => {
        setInitialLoading(true);
        try {
            const res = await fetch("/api/news/feeds");
            const urls: string[] = await res.json();
            setFeeds(urls);

            // Initialize feed data structure
            const initialData: Record<string, FeedData> = {};
            urls.forEach(url => {
                initialData[url] = { title: url, articles: [], loading: true };
            });
            setFeedData(initialData);

            // Trigger fetches in background
            urls.forEach(url => refreshFeed(url));

        } catch (error) {
            console.error("Failed to load feeds list", error);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds();
    }, []);

    const handleAddFeed = async () => {
        if (!newFeedUrl.trim()) return;
        setAddingFeed(true);
        try {
            const res = await fetch("/api/news/feeds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: newFeedUrl }),
            });
            if (res.ok) {
                setNewFeedUrl("");
                // Fetch updated list and refresh
                const feedListRes = await fetch("/api/news/feeds");
                const newFeeds = await feedListRes.json();
                setFeeds(newFeeds);

                // If it's a new feed, trigger fetch
                if (!feedData[newFeedUrl]) {
                    refreshFeed(newFeedUrl);
                }
            } else {
                alert("Failed to add feed. Check URL or it might already exist.");
            }
        } catch {
            alert("Error adding feed.");
        } finally {
            setAddingFeed(false);
        }
    };

    const handleRemoveFeed = async (url: string) => {
        if (!confirm(`Remove feed: ${url}?`)) return;
        try {
            await fetch("/api/news/feeds", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            // Update state safely
            setFeeds(prev => prev.filter(f => f !== url));
            setFeedData(prev => {
                const next = { ...prev };
                delete next[url];
                return next;
            });
        } catch {
            alert("Error removing feed.");
        }
    };

    const toggleSource = (url: string) => {
        const newSet = new Set(expandedSources);
        if (newSet.has(url)) newSet.delete(url);
        else newSet.add(url);
        setExpandedSources(newSet);
    };

    const trackClick = async (article: Article) => {
        try {
            // Fire and forget, don't await response to speed up UX
            fetch("/api/news/click", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    link: article.link,
                    title: article.title,
                    snippet: article.snippet || ""
                }),
            });
        } catch (e) {
            console.error("Tracking error", e);
        }
    };

    return (
        <main className="min-h-screen bg-background pt-32 pb-10 px-6 font-serif">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex items-center gap-4">
                    <h1 className="text-5xl md:text-7xl font-eczar tracking-tight">News</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Articles Grouped by Feed URL */}
                    <div className="md:col-span-2 space-y-4">
                        {initialLoading && feeds.length === 0 ? (
                            <p className="text-gray-500 text-lg">Loading feeds...</p>
                        ) : feeds.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                <p className="text-gray-500 mb-2">No feeds registered.</p>
                                <p className="text-sm text-gray-400">Add an RSS feed on the right to get started.</p>
                            </div>
                        ) : (
                            feeds.map((url) => {
                                const data = feedData[url] || { title: url, articles: [], loading: false };
                                const isExpanded = expandedSources.has(url);
                                const isEmpty = !data.loading && data.articles.length === 0;

                                return (
                                    <section key={url} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden transition-all duration-200">
                                        <button
                                            onClick={() => toggleSource(url)}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {isExpanded ? <ChevronDown className="w-5 h-5 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 flex-shrink-0" />}

                                                <div className="flex flex-col items-start truncate">
                                                    <h2 className="text-xl font-bold font-sans uppercase tracking-wider truncate max-w-[300px] md:max-w-md">
                                                        {data.title}
                                                    </h2>
                                                    {data.title !== url && (
                                                        <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{url}</span>
                                                    )}
                                                </div>

                                                {data.loading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-2" />
                                                ) : (
                                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 ml-2">
                                                        {data.articles.length}
                                                    </span>
                                                )}
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-background animate-in slide-in-from-top-2 duration-200">
                                                {data.loading && data.articles.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-400 italic">
                                                        Fetching articles...
                                                    </div>
                                                ) : isEmpty ? (
                                                    <div className="p-8 text-center text-gray-400 italic">
                                                        No articles found or failed to load.
                                                    </div>
                                                ) : (
                                                    data.articles.map((article, idx) => (
                                                        <article key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                                            <div className="text-xs font-sans uppercase tracking-widest text-gray-400 mb-1">
                                                                <time>{new Date(article.isoDate || article.pubDate).toLocaleDateString()}</time>
                                                            </div>
                                                            <h3 className="text-lg font-bold mb-1">
                                                                <Link
                                                                    href={article.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={() => trackClick(article)}
                                                                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                                >
                                                                    {article.title}
                                                                </Link>
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2 line-clamp-2">
                                                                {article.snippet}
                                                            </p>
                                                            <Link
                                                                href={article.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={() => trackClick(article)}
                                                                className="inline-flex items-center text-xs font-sans uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors"
                                                            >
                                                                Read More <ExternalLink className="ml-1 w-3 h-3" />
                                                            </Link>
                                                        </article>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </section>
                                );
                            })
                        )}
                    </div>

                    {/* Right Column: Feed Manager */}
                    <div className="space-y-8">
                        <div className="sticky top-32">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                                <h3 className="text-sm font-sans uppercase tracking-widest text-gray-500 mb-6 font-bold">Manage Feeds</h3>

                                <div className="flex gap-2 mb-6">
                                    <input
                                        type="url"
                                        value={newFeedUrl}
                                        onChange={(e) => setNewFeedUrl(e.target.value)}
                                        placeholder="https://example.com/rss"
                                        className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 rounded"
                                    />
                                    <button
                                        onClick={handleAddFeed}
                                        disabled={addingFeed || !newFeedUrl}
                                        className="bg-foreground text-background px-3 py-2 rounded hover:opacity-90 disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {feeds.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No feeds registered.</p>
                                    ) : (
                                        feeds.map((url) => (
                                            <div key={url} className="flex justify-between items-center group">
                                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]" title={url}>
                                                    {url}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveFeed(url)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
