import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/notice";

export const dynamic = 'force-dynamic';

export async function GET() {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
}
