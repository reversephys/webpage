import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen font-sans bg-background text-foreground">

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/hero.png"
            alt="Physical Lab Hardware Hacking"
            fill
            className="object-cover brightness-50 contrast-125"
            priority
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-chomsky tracking-tighter mb-6 drop-shadow-2xl">
            Physical Lab
          </h1>
          <p className="text-xl md:text-2xl font-serif italic tracking-widest uppercase opacity-90 mb-8">
            Reverse Engineering & Hardware Security
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/blog" className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
              Read Journal
            </Link>
          </div>
        </div>
      </section>


      {/* Design System Grid / Content Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left Column: Intro */}
          <div className="space-y-8 sticky top-24">
            <h2 className="text-5xl md:text-6xl font-serif font-bold leading-tight">
              Unlocking the <br /> <span className="italic">Unknown.</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-serif leading-relaxed">
              We explore the depths of embedded systems, dissecting hardware to understand the soul of the machine.
              Our research focuses on hardware security, side-channel analysis, and fault injection.
            </p>
            <Link href="/about" className="inline-flex items-center text-lg uppercase tracking-widest border-b border-black dark:border-white pb-1 hover:pb-2 transition-all">
              About the Lab <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* Right Column: Latest Updates (Placeholder for now) */}
          <div className="space-y-16">

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 group cursor-pointer">
              <span className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Latest News</span>
              <h3 className="text-3xl font-serif font-bold mb-4 group-hover:underline decoration-1 underline-offset-4">
                Analysis of the XYZ Chip Security Flaw
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                A deep dive into the recent vulnerability discovered in widespread IoT microcontrollers...
              </p>
              <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {/* Visual placeholder for post */}
                <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-colors" />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 group cursor-pointer">
              <span className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Blog</span>
              <h3 className="text-3xl font-serif font-bold mb-4 group-hover:underline decoration-1 underline-offset-4">
                Setting up the Glitch Kit
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our guide to building a low-cost voltage glitching rig for educational purposes...
              </p>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
