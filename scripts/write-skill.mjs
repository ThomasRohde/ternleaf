// Write the Copilot skill from the guide in apps/agent/guide.mjs. Run it after
// a change to the guide: node scripts/write-skill.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { skill } from "../apps/agent/guide.mjs";

const target = fileURLToPath(new URL("../.github/skills/ternleaf/SKILL.md", import.meta.url));
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, skill);
console.log(target);
