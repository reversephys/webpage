export default function SkillsPage() {
    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6 font-serif">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl mb-16 font-eczar tracking-tight">Skills</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Hardware Section */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Hardware</h2>
                        <ul className="space-y-4 text-lg text-gray-600 dark:text-gray-400">
                            <li>PCB Reverse Engineering</li>
                            <li>Signal Analysis & Glitching</li>
                            <li>FPGA Development</li>
                            <li>Side-Channel Analysis</li>
                        </ul>
                    </div>

                    {/* Software/Firmware Section */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Firmware</h2>
                        <ul className="space-y-4 text-lg text-gray-600 dark:text-gray-400">
                            <li>Embedded Linux & Kernel Hacking</li>
                            <li>Bootloader Analysis (U-Boot)</li>
                            <li>Firmware Extraction & Decryption</li>
                            <li>RTOS Security Assessment</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
