"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose prose-lg dark:prose-invert mx-auto max-w-none
      prose-headings:font-serif prose-headings:tracking-tight
      prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12
      prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-gray-200 prose-h2:dark:border-gray-700 prose-h2:pb-3
      prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
      prose-p:leading-relaxed prose-p:text-gray-700 prose-p:dark:text-gray-300 prose-p:mb-6
      prose-a:text-blue-600 prose-a:dark:text-blue-400 prose-a:underline prose-a:underline-offset-2
      prose-strong:text-foreground
      prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
      prose-pre:bg-gray-900 prose-pre:dark:bg-gray-950 prose-pre:border prose-pre:border-gray-200 prose-pre:dark:border-gray-700 prose-pre:rounded-lg prose-pre:overflow-x-auto
      prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:dark:border-gray-600 prose-blockquote:italic
      prose-img:rounded-lg prose-img:shadow-md
      prose-table:border-collapse
      prose-th:bg-gray-100 prose-th:dark:bg-gray-800 prose-th:px-4 prose-th:py-2 prose-th:border prose-th:border-gray-300 prose-th:dark:border-gray-600
      prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-300 prose-td:dark:border-gray-600
      prose-li:text-gray-700 prose-li:dark:text-gray-300
      prose-ul:list-disc prose-ol:list-decimal
    ">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-4xl font-bold font-serif tracking-tight mt-12 mb-6">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-3xl font-bold font-serif tracking-tight mt-10 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-2xl font-semibold font-serif tracking-tight mt-8 mb-3">{children}</h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-xl font-semibold font-serif tracking-tight mt-6 mb-2">{children}</h4>
                    ),
                    h5: ({ children }) => (
                        <h5 className="text-lg font-semibold font-serif tracking-tight mt-4 mb-2">{children}</h5>
                    ),
                    h6: ({ children }) => (
                        <h6 className="text-base font-semibold font-serif tracking-tight mt-4 mb-2 text-gray-500">{children}</h6>
                    ),
                    img: ({ src, alt }) => {
                        if (!src) return null;
                        return (
                            <span className="block my-8">
                                <Image
                                    src={src}
                                    alt={alt || ""}
                                    width={800}
                                    height={450}
                                    className="w-full h-auto rounded-lg shadow-md"
                                    unoptimized
                                />
                            </span>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed my-6">
                            {children}
                        </pre>
                    ),
                    code: ({ children, className }) => {
                        const isBlock = className?.includes("language-");
                        if (isBlock) {
                            return <code className={className}>{children}</code>;
                        }
                        return (
                            <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                            </code>
                        );
                    },
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                                {children}
                            </table>
                        </div>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
