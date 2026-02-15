import fs from "fs";
import path from "path";

export interface Skill {
    title: string;
    content: string;
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
        const title = file.replace(/\.md$/, "");
        return { title, content };
    });
}

export function getSkillByTitle(title: string): Skill | null {
    const filePath = path.join(SKILLS_DIR, `${title}.md`);
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, "utf-8");
    return { title, content };
}

export { SKILLS_DIR };
