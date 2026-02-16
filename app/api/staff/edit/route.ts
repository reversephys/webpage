import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CONTENTS_DIR, getPostFolderName } from "@/lib/staff";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const slug = formData.get("slug") as string;
        const title = formData.get("title") as string;
        const tag = formData.get("tag") as string;
        const content = formData.get("content") as string;
        const deletedImagesStr = formData.get("deletedImages") as string;
        const newImages = formData.getAll("newImages") as File[];

        if (!slug || !title || !tag || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find existing folder
        const oldFolderName = getPostFolderName(slug);
        if (!oldFolderName) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const oldFolderPath = path.join(CONTENTS_DIR, oldFolderName);

        // Handle folder rename if title/tag changed?
        // Actually, renaming folder changes the timestamp prefix if we regenerate it, which messes up ordering.
        // Or we just keep the timestamp and update the suffix.
        // Let's parse the old folder name to keep the timestamp.
        const match = oldFolderName.match(/^(\d{14})_([^_]+)_(.+)$/);
        if (!match) {
            return NextResponse.json({ error: "Invalid folder structure" }, { status: 500 });
        }
        const timestamp = match[1];

        const safeTitle = title.replace(/[^a-zA-Z0-9가-힣\s-]/g, "").trim().replace(/\s+/g, "-");
        const safeTag = tag.replace(/[^a-zA-Z0-9가-힣\s-]/g, "").trim().replace(/\s+/g, "-");
        const newFolderName = `${timestamp}_${safeTag}_${safeTitle}`;
        const newFolderPath = path.join(CONTENTS_DIR, newFolderName);

        // Rename folder if needed
        if (oldFolderName !== newFolderName) {
            fs.renameSync(oldFolderPath, newFolderPath);
        }

        // Update MD file
        // Remove old MD file (if name changed)
        // Find old MD file
        const files = fs.readdirSync(newFolderPath); // Use new path
        const oldMdFile = files.find(f => f.endsWith(".md"));
        if (oldMdFile) {
            fs.unlinkSync(path.join(newFolderPath, oldMdFile));
        }

        // Write new MD file
        const mdPath = path.join(newFolderPath, `${safeTitle}.md`);
        fs.writeFileSync(mdPath, content, "utf-8");

        // Handle images
        const imagesDir = path.join(newFolderPath, "images");
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

        // Delete removed images
        if (deletedImagesStr) {
            const deletedImages = JSON.parse(deletedImagesStr) as string[];
            for (const imgName of deletedImages) {
                const imgPath = path.join(imagesDir, imgName);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
        }

        // Add new images
        for (const img of newImages) {
            const buffer = Buffer.from(await img.arrayBuffer());
            fs.writeFileSync(path.join(imagesDir, img.name), buffer);
        }

        return NextResponse.json({ success: true, redirect: `/staff/${safeTitle}` });

    } catch (error) {
        console.error("Edit error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
