import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/staff";
import { getUserMap } from "@/lib/users";

export const dynamic = 'force-dynamic';

export async function GET() {
    const posts = await getAllPosts();
    const userMap = await getUserMap();

    const postsWithAuthor = posts.map(post => {
        const authorName = post.userId ? (userMap.get(post.userId) || "Unknown") : "Unknown";
        return { ...post, authorName };
    });

    return NextResponse.json(postsWithAuthor);
}
