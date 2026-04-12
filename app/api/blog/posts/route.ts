import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAllPosts } from "@/lib/blog";
import { getUserMap } from "@/lib/users";

const CONTENTS_DIR = path.join(process.cwd(), "Contents", "BLOG");

export async function GET() {
    const posts = getAllPosts();
    const userMap = await getUserMap();

    // Attach raw content for search
    const postsWithContent = posts.map((post) => {
        const folders = fs.readdirSync(CONTENTS_DIR, { withFileTypes: true })
            .filter((d) => d.isDirectory());

        let content = "";
        for (const folder of folders) {
            if (folder.name.endsWith(`_${post.slug}`)) {
                const folderPath = path.join(CONTENTS_DIR, folder.name);
                const files = fs.readdirSync(folderPath);
                const mdFile = files.find((f) => f.endsWith(".md"));
                if (mdFile) {
                    content = fs.readFileSync(path.join(folderPath, mdFile), "utf-8");
                }
                break;
            }
        }

        const authorName = post.userId ? (userMap.get(post.userId) || "Unknown") : "Unknown";
        return { ...post, content, authorName };
    });

    return NextResponse.json(postsWithContent);
}
