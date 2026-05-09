import PocketBase from "pocketbase";

const PB_URL = "http://127.0.0.1:8090";

async function listCollections() {
    try {
        const pb = new PocketBase(PB_URL);
        // Try both superusers and admins
        try {
            await pb.collection("_superusers").authWithPassword("admin@physicallab.com", "1234567890");
            console.log("Logged in as superuser");
        } catch (e) {
            console.log("Superuser login failed, trying legacy admins...");
            await pb.admins.authWithPassword("admin@physicallab.com", "1234567890");
            console.log("Logged in as admin");
        }
        
        const collections = await pb.collections.getFullList();
        console.log("--- Collections ---");
        collections.forEach(c => console.log(`${c.name} (ID: ${c.id})`));
        
        const postTags = collections.find(c => c.name === "post_tags");
        if (postTags) {
            console.log("\n--- post_tags details ---");
            console.log(JSON.stringify(postTags, null, 2));
        }
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

listCollections();
