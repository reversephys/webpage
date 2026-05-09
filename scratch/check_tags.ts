import PocketBase from "pocketbase";

const PB_URL = "http://127.0.0.1:8090";

async function checkTags() {
    try {
        const pb = new PocketBase(PB_URL);
        const records = await pb.collection("post_tags").getFullList();
        console.log("--- post_tags contents ---");
        console.log(JSON.stringify(records, null, 2));
    } catch (e: any) {
        console.error("Error fetching tags:", e.message);
    }
}

checkTags();
