import Link from "next/link";

export default function BlogPage() {
    const posts = [
        {
            id: 1,
            title: "Setting up the Glitch Kit",
            excerpt: "Our guide to building a low-cost voltage glitching rig for educational purposes. We explore the implementation of varying pulse widths...",
            date: "Oct 12, 2025",
            image: "bg-gray-200"
        },
        {
            id: 2,
            title: "Understanding Side-Channel Attacks",
            excerpt: "Power analysis is a potent tool in the hardware hacker's arsenal. In this post, we demonstrate how simple power traces can reveal secret keys...",
            date: "Sep 28, 2025",
            image: "bg-gray-300"
        },
        {
            id: 3,
            title: "Reverse Engineering the XYZ Router",
            excerpt: "A step-by-step walkthrough of identifying UART ports, dumping firmware, and analyzing the localized filesystem...",
            date: "Sep 15, 2025",
            image: "bg-gray-400"
        }
    ];

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-bold mb-16 tracking-tight">Journal</h1>

                <div className="space-y-12">
                    {posts.map((post) => (
                        <div key={post.id} className="group grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start border-b border-gray-100 dark:border-gray-800 pb-12">

                            {/* Thumbnail */}
                            <div className={`w-full h-[150px] md:h-[150px] ${post.image} rounded-sm overflow-hidden`}>
                                {/* Image Placeholder - would be next/image */}
                                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 group-hover:scale-105 transition-transform duration-500" />
                            </div>

                            {/* Content */}
                            <div>
                                <div className="flex items-center gap-4 mb-3 text-xs tracking-[0.2em] text-gray-400 uppercase font-sans">
                                    <span>{post.date}</span>
                                    <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700" />
                                    <span>Hardware</span>
                                </div>

                                <Link href={`/blog/${post.id}`}>
                                    <h2 className="text-3xl font-bold mb-4 group-hover:underline decoration-1 underline-offset-4 cursor-pointer">
                                        {post.title}
                                    </h2>
                                </Link>

                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                                    {post.excerpt}
                                </p>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
