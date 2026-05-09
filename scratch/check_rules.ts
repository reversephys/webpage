import PocketBase from "pocketbase";

const PB_URL = "http://127.0.0.1:8090";

async function checkCollection() {
    try {
        const pb = new PocketBase(PB_URL);
        // We need to authenticate as admin to view collection rules
        // But the previous session said: 
        // admin@physicallab.com
        // pw : 1234567890
        await pb.collection("_superusers").authWithPassword("admin@physicallab.com", "1234567890");
        
        const collection = await pb.collections.getOne("post_tags");
        console.log("--- post_tags collection rules ---");
        console.log("List Rule:", collection.listRule);
        console.log("View Rule:", collection.viewRule);
        console.log("Create Rule:", collection.createRule);
        console.log("Update Rule:", collection.updateRule);
        console.log("Delete Rule:", collection.deleteRule);
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

checkCollection();
