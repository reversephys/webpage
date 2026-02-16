import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/staff";

export const dynamic = 'force-dynamic';

export async function GET() {
    const posts = getAllPosts();
    return NextResponse.json(posts);
}
