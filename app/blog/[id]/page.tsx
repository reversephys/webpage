export default function BlogPost({ params }: { params: { id: string } }) {
    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <article className="max-w-3xl mx-auto">
                <header className="mb-12 text-center">
                    <div className="flex justify-center items-center gap-4 mb-6 text-xs tracking-[0.2em] text-gray-400 uppercase font-sans">
                        <span>Oct 12, 2025</span>
                        <span className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700" />
                        <span>Hardware</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                        Setting up the Glitch Kit
                    </h1>
                </header>

                <div className="prose prose-lg dark:prose-invert mx-auto">
                    <p className="lead text-xl md:text-2xl italic text-gray-500 mb-8">
                        Voltage glitching is an art form. It requires patience, precision, and the right tools. Here is how we built our rig.
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    {/* Content would be dynamically fetched based on params.id */}
                    <div className="bg-gray-100 dark:bg-gray-800 p-8 my-8 text-center text-sm font-sans text-gray-500">
                        [Content for Post ID: {params.id}]
                    </div>
                </div>
            </article>
        </main>
    );
}
