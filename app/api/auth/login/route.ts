import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

/**
 * POST /api/auth/login
 * Server-side login: receives username/password, authenticates against PocketBase,
 * and returns the token + record to the client.
 */
export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required." },
                { status: 400 }
            );
        }

        const pb = new PocketBase("http://127.0.0.1:8090");
        const authData = await pb.collection("users").authWithPassword(username, password);

        return NextResponse.json({
            token: authData.token,
            record: authData.record,
        });
    } catch (error: unknown) {
        console.error("Login error:", error);
        const message =
            error instanceof Error ? error.message : "Invalid credentials.";
        return NextResponse.json({ error: message }, { status: 401 });
    }
}
