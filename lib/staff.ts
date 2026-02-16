import fs from "fs";
import path from "path";

export interface StaffPost {
    slug: string;
    title: string;
    date: string;        // formatted date string e.g. "Feb 10, 2026"
    rawDate: string;     // yyyymmdd
    tag: string;
    excerpt: string;
    thumbnail: string | null;  // API route path to thumbnail image
    content?: string;    // full MD content (only in detail view)
}

const CONTENTS_DIR = path.join(process.cwd(), "Contents", "STAFF");

/**
 * Parse folder name: {yyyymmdd}_{title}_{tag}
 */
function parseFolderName(folderName: string): { rawDate: string; title: string; tag: string } | null {
    // Match pattern: 14 digits _ tag _ title
    // Note: Blog uses 14 digits (YYYYMMDDHHMMSS) or 8 digits?
    // Let's check blog.ts regex: /^(\d{14})_([^_]+)_(.+)$/
    // It expects 14 digits.
    const match = folderName.match(/^(\d{14})_([^_]+)_(.+)$/);
    if (!match) return null;
    return {
        rawDate: match[1],
        tag: match[2],
        title: match[3],
    };
}

/**
 * Format yyyymmdd → "Feb 10, 2026"
 */
function formatDate(raw: string): string {
    const year = raw.slice(0, 4);
    const month = parseInt(raw.slice(4, 6), 10) - 1;
    const day = parseInt(raw.slice(6, 8), 10);
    const date = new Date(parseInt(year), month, day);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Extract excerpt from MD content
 */
function extractExcerpt(content: string): string {
    const lines = content.split("\n");
    const bodyLines: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (
            trimmed.startsWith("#") ||
            trimmed === "" ||
            trimmed.startsWith("![") ||
            trimmed.startsWith("```") ||
            trimmed.startsWith("- ") ||
            trimmed.startsWith("| ") ||
            trimmed.startsWith("> ")
        ) {
            continue;
        }
        bodyLines.push(trimmed);
        if (bodyLines.length >= 2) break;
    }

    if (bodyLines.length === 0) return "";

    const fullText = bodyLines.join(" ");
    const sentences = fullText.match(/[^.!?]+[.!?]+/g);
    if (!sentences) return fullText.slice(0, 200);

    if (sentences[0].length > 100) {
        return sentences[0].trim();
    }

    return sentences.slice(0, 2).join(" ").trim();
}

/**
 * Find first image in the images/ subdirectory
 */
function findThumbnail(folderPath: string, slug: string): string | null {
    const imagesDir = path.join(folderPath, "images");
    if (!fs.existsSync(imagesDir)) return null;

    const files = fs.readdirSync(imagesDir);
    const imageFile = files.find((f) =>
        /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f)
    );

    if (!imageFile) return null;
    return `/api/staff-image/${slug}/${imageFile}`;
}

/**
 * Get all staff posts, sorted by date descending
 */
export function getAllPosts(): StaffPost[] {
    if (!fs.existsSync(CONTENTS_DIR)) return [];

    const folders = fs.readdirSync(CONTENTS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory());

    const posts: StaffPost[] = [];

    for (const folder of folders) {
        const parsed = parseFolderName(folder.name);
        if (!parsed) continue;

        const folderPath = path.join(CONTENTS_DIR, folder.name);

        // Find the .md file inside the folder
        const files = fs.readdirSync(folderPath);
        const mdFile = files.find((f) => f.endsWith(".md"));
        if (!mdFile) continue;

        const mdPath = path.join(folderPath, mdFile);
        const content = fs.readFileSync(mdPath, "utf-8");

        const slug = parsed.title;
        const thumbnail = findThumbnail(folderPath, slug);
        const excerpt = extractExcerpt(content);

        posts.push({
            slug,
            title: parsed.title.replace(/-/g, " "),
            date: formatDate(parsed.rawDate),
            rawDate: parsed.rawDate,
            tag: parsed.tag,
            excerpt,
            thumbnail,
        });
    }

    // Sort by date descending
    posts.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
    return posts;
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(slug: string): StaffPost | null {
    if (!fs.existsSync(CONTENTS_DIR)) return null;

    const folders = fs.readdirSync(CONTENTS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory());

    for (const folder of folders) {
        const parsed = parseFolderName(folder.name);
        if (!parsed) continue;
        if (parsed.title !== slug) continue;

        const folderPath = path.join(CONTENTS_DIR, folder.name);
        const files = fs.readdirSync(folderPath);
        const mdFile = files.find((f) => f.endsWith(".md"));
        if (!mdFile) continue;

        const mdPath = path.join(folderPath, mdFile);
        const rawContent = fs.readFileSync(mdPath, "utf-8");

        // Replace relative image references with API route
        const content = rawContent.replace(
            /!\[([^\]]*)\]\(images\/([^)]+)\)/g,
            `![$1](/api/staff-image/${slug}/$2)`
        );

        const thumbnail = findThumbnail(folderPath, slug);
        const excerpt = extractExcerpt(rawContent);

        return {
            slug,
            title: parsed.title.replace(/-/g, " "),
            date: formatDate(parsed.rawDate),
            rawDate: parsed.rawDate,
            tag: parsed.tag,
            excerpt,
            thumbnail,
            content,
        };
    }

    return null;
}

/**
 * Get latest N posts
 */
export function getLatestPosts(count: number): StaffPost[] {
    return getAllPosts().slice(0, count);
}

/**
 * Find the folder name for a given slug
 */
export function getPostFolderName(slug: string): string | null {
    if (!fs.existsSync(CONTENTS_DIR)) return null;

    const folders = fs.readdirSync(CONTENTS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory());

    for (const folder of folders) {
        const parsed = parseFolderName(folder.name);
        if (!parsed) continue;
        if (parsed.title === slug) return folder.name;
    }
    return null;
}

/**
 * Get list of images in a post's images/ directory
 */
export function getPostImages(slug: string): string[] {
    const folderName = getPostFolderName(slug);
    if (!folderName) return [];

    const imagesDir = path.join(CONTENTS_DIR, folderName, "images");
    if (!fs.existsSync(imagesDir)) return [];

    return fs.readdirSync(imagesDir)
        .filter((f) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f));
}

export { CONTENTS_DIR };
