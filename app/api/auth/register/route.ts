import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

/**
 * POST /api/auth/register
 * Server-side registration: creates a new user in PocketBase,
 * auto-logs in, and returns the token + record.
 */
export async function POST(request: NextRequest) {
    try {
        const { username, password, passwordConfirm } = await request.json();

        if (!username || !password || !passwordConfirm) {
            return NextResponse.json(
                { error: "All fields are required." },
                { status: 400 }
            );
        }

        const pb = new PocketBase("http://127.0.0.1:8090");

        // Create the user
        await pb.collection("users").create({
            username,
            password,
            passwordConfirm,
        });

        // Auto-login after registration
        const authData = await pb.collection("users").authWithPassword(username, password);

        return NextResponse.json({
            token: authData.token,
            record: authData.record,
        });
    } catch (error: unknown) {
        console.error("Register error:", error);
        const message =
            error instanceof Error ? error.message : "Registration failed.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
