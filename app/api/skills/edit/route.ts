import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SKILLS_DIR } from "@/lib/skills";

function containsDangerousContent(content: string): boolean {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("<script")) return true;
    if (lowerContent.includes("onerror")) return true;
    return false;
}

export async function POST(request: NextRequest) {
    try {
        const { originalTitle, newTitle, content } = await request.json();

        if (!originalTitle || !newTitle || !content) {
            return NextResponse.json({ error: "Missing fields." }, { status: 400 });
        }

        // Security check
        if (containsDangerousContent(content) || containsDangerousContent(newTitle)) {
            return NextResponse.json({ redirect: "/skills" }, { status: 200 });
        }

        const oldPath = path.join(SKILLS_DIR, `${originalTitle}.md`);

        // Sanitize new filename
        const safeNewTitle = newTitle.replace(/[^a-zA-Z0-9\-\.\_\s]/g, "").trim();
        const newPath = path.join(SKILLS_DIR, `${safeNewTitle}.md`);

        if (!fs.existsSync(oldPath)) {
            return NextResponse.json({ error: "Original skill not found." }, { status: 404 });
        }

        // Rename if title changed
        if (oldPath !== newPath) {
            if (fs.existsSync(newPath)) {
                return NextResponse.json({ error: "New title already exists." }, { status: 409 });
            }
            fs.renameSync(oldPath, newPath);
        }

        // Write content
        fs.writeFileSync(newPath, content, "utf-8");

        return NextResponse.json({ redirect: "/skills", success: true });
    } catch (error) {
        console.error("Edit error:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
