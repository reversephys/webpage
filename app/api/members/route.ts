import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function GET() {
    try {
        const pb = new PocketBase("http://127.0.0.1:8090");

        // Log in as Admin using native fetch to bypass SDK version issues (pb.admins removed in JS SDK v0.23+)
        const authRes = await fetch("http://127.0.0.1:8090/api/admins/auth-with-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identity: "physicallab.in.seoul@gmail.com", password: "1234567890" })
        });
        const authData = await authRes.json();
        if (!authRes.ok) throw new Error("Admin auth failed");

        pb.authStore.save(authData.token, authData.admin);

        // Fetch users where permission_group is 1, 2, 3, or 4
        // Sort by permission_group ascending, then created descending
        const records = await pb.collection("users").getFullList({
            filter: "permission_group >= 1 && permission_group <= 4",
            sort: "permission_group,-created",
        });

        const members = records.map(r => ({
            id: r.id,
            name: r.name || r.username,
            avatar: r.avatar ? `http://127.0.0.1:8090/api/files/_pb_users_auth_/${r.id}/${r.avatar}` : null,
            introduction: r.introduction || "",
            permission_group: r.permission_group
        }));

        return NextResponse.json({ success: true, members });
    } catch (error: any) {
        console.error("Failed to fetch members:", error);
        return NextResponse.json({ error: "Failed to load members" }, { status: 500 });
    }
}
