import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SKILLS_DIR } from "@/lib/skills";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get("title");

    if (!title) {
        return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const filename = `${title}.md`;
    const filePath = path.join(SKILLS_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
            "Content-Type": "text/markdown",
        },
    });
}
