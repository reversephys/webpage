import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SKILLS_DIR } from "@/lib/skills";

export async function POST(request: NextRequest) {
    try {
        const { title } = await request.json();

        if (!title) {
            return NextResponse.json({ error: "Title is required." }, { status: 400 });
        }

        const filePath = path.join(SKILLS_DIR, `${title}.md`);

        if (fs.existsSync(filePath)) {
            const newPath = path.join(SKILLS_DIR, `_${title}.md`);
            fs.renameSync(filePath, newPath);
        }

        return NextResponse.json({ redirect: "/skills", success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
