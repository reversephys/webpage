import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SKILLS_DIR } from "@/lib/skills";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth-server";

function containsDangerousContent(content: string): boolean {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("<script")) return true;
    if (lowerContent.includes("onerror")) return true;
    return false;
}

export async function POST(request: NextRequest) {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();

    try {
        const { originalTitle, newTitle, content } = await request.json();

        if (!originalTitle || !newTitle || !content) {
            return NextResponse.json({ error: "Missing fields." }, { status: 400 });
        }

        // Security check
        if (containsDangerousContent(content) || containsDangerousContent(newTitle)) {
            return NextResponse.json({ redirect: "/skills" }, { status: 200 });
        }

        let oldPath = path.join(SKILLS_DIR, `${originalTitle}.md`);
        // Allow fallback to dynamic matching if exact match not found
        if (!fs.existsSync(oldPath)) {
            const files = fs.readdirSync(SKILLS_DIR);
            const matched = files.find(f => {
                const base = f.replace(/\.md$/, "");
                const match = base.match(/^([a-z0-9]{15})_(.+)$/i);
                return match && match[2] === originalTitle;
            });
            if (matched) oldPath = path.join(SKILLS_DIR, matched);
        }

        // Sanitize new filename
        const safeNewTitle = newTitle.replace(/[^a-zA-Z0-9\-\.\_\s]/g, "").trim();
        const safeUserId = user.id.replace(/_/g, "");
        const newPath = path.join(SKILLS_DIR, `${safeUserId}_${safeNewTitle}.md`);

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
