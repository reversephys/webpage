import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getPostFolderName, CONTENTS_DIR } from "@/lib/blog";

function containsDangerousContent(content: string): boolean {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("<script")) return true;
    if (lowerContent.includes("onerror")) return true;
    return false;
}

function generateUUID(): string {
    return crypto.randomUUID();
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const slug = formData.get("slug") as string;
        const title = formData.get("title") as string;
        const tag = formData.get("tag") as string;
        const content = formData.get("content") as string;
        const newImageFiles = formData.getAll("newImages") as File[];
        const deletedImagesRaw = formData.get("deletedImages") as string;
        const deletedImages: string[] = deletedImagesRaw ? JSON.parse(deletedImagesRaw) : [];

        if (!slug || !title || !tag || !content) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        // Security check
        if (containsDangerousContent(content) || containsDangerousContent(title)) {
            return NextResponse.json({ redirect: "/blog" }, { status: 200 });
        }

        const folderName = getPostFolderName(slug);
        if (!folderName) {
            return NextResponse.json({ error: "Post not found." }, { status: 404 });
        }

        const folderPath = path.join(CONTENTS_DIR, folderName);
        const imagesDir = path.join(folderPath, "images");

        // Ensure images/ exists
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Delete removed images
        for (const imgName of deletedImages) {
            const imgPath = path.join(imagesDir, imgName);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }

        // Process new images: save with UUID names and build rename mapping
        const imageRenameMap: Record<string, string> = {};

        for (const file of newImageFiles) {
            const ext = path.extname(file.name).toLowerCase() || ".png";
            const uuid = generateUUID();
            const newFilename = `${uuid}${ext}`;

            imageRenameMap[file.name] = newFilename;

            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(path.join(imagesDir, newFilename), buffer);
        }

        // Replace new image references in content
        let processedContent = content;
        for (const [originalName, uuidName] of Object.entries(imageRenameMap)) {
            const escaped = originalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "g");
            processedContent = processedContent.replace(regex, uuidName);
        }

        // Find the existing .md file and overwrite it
        const files = fs.readdirSync(folderPath);
        const mdFile = files.find((f) => f.endsWith(".md"));

        if (mdFile) {
            fs.writeFileSync(path.join(folderPath, mdFile), processedContent, "utf-8");
        } else {
            // Create new md file with UUID name
            const uuid = generateUUID();
            fs.writeFileSync(path.join(folderPath, `${uuid}.md`), processedContent, "utf-8");
        }

        return NextResponse.json({ redirect: `/blog/${slug}`, success: true });
    } catch (error) {
        console.error("Edit error:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
