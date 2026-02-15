export default function StaffPage() {
    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl mb-16 font-eczar tracking-tight">Staff</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Placeholder for staff members */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 mb-4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-1 group-hover:underline decoration-1 underline-offset-4">Researcher Name</h3>
                            <p className="text-sm text-gray-500 uppercase tracking-widest">Security Researcher</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
