import Link from "next/link";

export default function NewsPage() {
    const news = [
        {
            id: 1,
            title: "Physical Lab Presents at BlackHat 2025",
            excerpt: "Our team will be showcasing a new technique for exploiting secure boot on legacy automotive chips...",
            date: "Nov 02, 2025",
        },
        {
            id: 2,
            title: "New Research Paper Published",
            excerpt: "Read our latest contribution to the hardware security community regarding glitch attacks...",
            date: "Oct 15, 2025",
        }
    ];

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-bold mb-16 tracking-tight">News</h1>

                <div className="space-y-12">
                    {news.map((item) => (
                        <div key={item.id} className="group border-b border-gray-100 dark:border-gray-800 pb-12">
                            <div className="flex items-center gap-4 mb-3 text-xs tracking-[0.2em] text-gray-400 uppercase font-sans">
                                <span>{item.date}</span>
                                <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700" />
                                <span>Press</span>
                            </div>

                            <Link href={`/news/${item.id}`}>
                                <h2 className="text-3xl font-bold mb-4 group-hover:underline decoration-1 underline-offset-4 cursor-pointer">
                                    {item.title}
                                </h2>
                            </Link>

                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                                {item.excerpt}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
