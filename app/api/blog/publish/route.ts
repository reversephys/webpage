import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const CONTENTS_DIR = path.join(process.cwd(), "Contents", "BLOG");

/**
 * Check for dangerous patterns: <script, onerror
 */
function containsDangerousContent(content: string): boolean {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("<script")) return true;
    if (lowerContent.includes("onerror")) return true;
    return false;
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
    return crypto.randomUUID();
}

/**
 * Format current date as YYYYMMDDhhmmss
 */
function getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
        now.getFullYear().toString() +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds())
    );
}

/**
 * Sanitize folder name: replace spaces/special chars with hyphens
 */
function sanitizeFolderName(name: string): string {
    return name
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9\-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const title = formData.get("title") as string;
        const tag = formData.get("tag") as string;
        const content = formData.get("content") as string;
        const imageFiles = formData.getAll("images") as File[];

        // Validate required fields
        if (!title || !tag || !content) {
            return NextResponse.json(
                { error: "Title, tag, and content are required." },
                { status: 400 }
            );
        }

        // Security check: reject <script> and onerror
        if (containsDangerousContent(content) || containsDangerousContent(title)) {
            return NextResponse.json(
                { redirect: "/blog" },
                { status: 200 }
            );
        }

        // Generate folder name
        const timestamp = getTimestamp();
        const sanitizedTag = sanitizeFolderName(tag);
        const sanitizedTitle = sanitizeFolderName(title);
        const folderName = `${timestamp}_${sanitizedTag}_${sanitizedTitle}`;
        const folderPath = path.join(CONTENTS_DIR, folderName);

        // Create directories
        fs.mkdirSync(folderPath, { recursive: true });
        fs.mkdirSync(path.join(folderPath, "images"), { recursive: true });

        // Process images: save with UUID names and build rename mapping
        const imageRenameMap: Record<string, string> = {};

        for (const file of imageFiles) {
            const ext = path.extname(file.name).toLowerCase() || ".png";
            const uuid = generateUUID();
            const newFilename = `${uuid}${ext}`;

            imageRenameMap[file.name] = newFilename;

            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(path.join(folderPath, "images", newFilename), buffer);
        }

        // Replace image references in markdown content
        let processedContent = content;
        for (const [originalName, uuidName] of Object.entries(imageRenameMap)) {
            // Escape special regex characters in original filename
            const escaped = originalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "g");
            processedContent = processedContent.replace(regex, uuidName);
        }

        // Save markdown file with UUID name
        const mdUUID = generateUUID();
        const mdFilename = `${mdUUID}.md`;
        fs.writeFileSync(
            path.join(folderPath, mdFilename),
            processedContent,
            "utf-8"
        );

        return NextResponse.json(
            { redirect: "/blog", success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Publish error:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}
