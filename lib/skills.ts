import fs from "fs";
import path from "path";

export interface Skill {
    title: string;
    content: string;
    userId?: string;
    authorName?: string;
}

const SKILLS_DIR = path.join(process.cwd(), "Contents", "SKILLS");

// Ensure directory exists
if (!fs.existsSync(SKILLS_DIR)) {
    fs.mkdirSync(SKILLS_DIR, { recursive: true });
}

export function getAllSkills(): Skill[] {
    if (!fs.existsSync(SKILLS_DIR)) return [];

    const files = fs.readdirSync(SKILLS_DIR)
        .filter((f) => f.endsWith(".md") && !f.startsWith("_"));

    return files.map((file) => {
        const filePath = path.join(SKILLS_DIR, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const fileBase = file.replace(/\.md$/, "");

        // Attempt to extract userId (PocketBase IDs are 15 chars alphanumeric)
        const match = fileBase.match(/^([a-z0-9]{15})_(.+)$/i);
        let userId = "";
        let title = fileBase;

        if (match) {
            userId = match[1];
            title = match[2];
        }

        return { title, content, userId };
    });
}

export function getSkillByTitle(title: string): Skill | null {
    if (!fs.existsSync(SKILLS_DIR)) return null;

    const files = fs.readdirSync(SKILLS_DIR)
        .filter((f) => f.endsWith(".md") && !f.startsWith("_"));

    for (const file of files) {
        const fileBase = file.replace(/\.md$/, "");
        const match = fileBase.match(/^([a-z0-9]{15})_(.+)$/i);
        let currentTitle = fileBase;
        let userId = "";

        if (match) {
            userId = match[1];
            currentTitle = match[2];
        }

        if (currentTitle === title) {
            const filePath = path.join(SKILLS_DIR, file);
            const content = fs.readFileSync(filePath, "utf-8");
            return { title, content, userId };
        }
    }
    return null;
}

export { SKILLS_DIR };
