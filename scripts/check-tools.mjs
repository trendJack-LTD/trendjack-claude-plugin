#!/usr/bin/env node
// Fails when a skill names a tool, an argument or a field that tools.json does not list.
// A snake_case word in a skill must be a tool or an enum value from tools.json.
// A backticked camelCase word in a skill must be an argument or a field from tools.json.
// The bare tool names search and fetch are plain English words, so this script cannot police them.
// claude plugin validate passes frontmatter that YAML cannot parse, so this script refuses it.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const contract = JSON.parse(readFileSync(join(root, "tools.json"), "utf8"));
const tools = new Set(contract.tools.map((tool) => tool.name));
const enumValues = new Set(contract.enumValues ?? []);
const fields = new Set(contract.fields ?? []);

const MAX_DESCRIPTION = 1024;
const MAX_SKILL_LINES = 500;
const MAX_SKILL_NAME = 64;
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SNAKE_CASE = /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g;
const PREFIXED_TOOL = /\bmcp__[A-Za-z0-9_-]+/g;
const CAMEL_CASE_CODE = /`([a-z][a-z0-9]*[A-Z][A-Za-z0-9]*)[`:]/g;

const problems = [];

function markdownFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return entry.endsWith(".md") ? [path] : [];
  });
}

/** A plain YAML scalar cannot start with an indicator character or hold ": " or " #". */
function plainScalarProblem(value) {
  if (/^["']/.test(value)) return null;
  if (/^[-?:,[\]{}#&*!|>%@`]/.test(value)) return "starts with a YAML indicator character";
  if (value.includes(": ")) return 'contains ": ", which YAML reads as a new key';
  if (value.includes(" #")) return 'contains " #", which YAML reads as a comment';
  return null;
}

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const entries = {};
  const found = [];
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^([a-z-]+):\s*(.*)$/);
    if (!pair) {
      found.push(`frontmatter line "${line}" is not a one-line "key: value" pair`);
      continue;
    }
    if (pair[1] in entries) found.push(`frontmatter key "${pair[1]}" appears twice`);
    const problem = plainScalarProblem(pair[2]);
    if (problem) found.push(`frontmatter "${pair[1]}" ${problem}; quote the value`);
    entries[pair[1]] = pair[2].replace(/^["']|["']$/g, "");
  }
  return { entries, problems: found };
}

const pluginsDir = join(root, "plugins");
const plugins = readdirSync(pluginsDir).filter((entry) => statSync(join(pluginsDir, entry)).isDirectory());
let skillCount = 0;

for (const plugin of plugins) {
  const skillsDir = join(pluginsDir, plugin, "skills");
  const skillsRel = relative(root, skillsDir);
  const skillFolders = readdirSync(skillsDir).filter((entry) =>
    statSync(join(skillsDir, entry)).isDirectory(),
  );
  skillCount += skillFolders.length;


  for (const folder of skillFolders) {
    const skillPath = join(skillsDir, folder, "SKILL.md");
    let text;
    try {
      text = readFileSync(skillPath, "utf8");
    } catch {
      problems.push(`${skillsRel}/${folder}: SKILL.md is missing`);
      continue;
    }

    if (!SKILL_NAME.test(folder) || folder.length > MAX_SKILL_NAME) {
      problems.push(
        `${skillsRel}/${folder}: a skill name is lowercase letters, digits and single hyphens, ${MAX_SKILL_NAME} characters or fewer`,
      );
    }

    const parsed = frontmatter(text);
    if (!parsed) {
      problems.push(`${skillsRel}/${folder}/SKILL.md: frontmatter is missing`);
    } else {
      const { entries } = parsed;
      for (const problem of parsed.problems) problems.push(`${skillsRel}/${folder}/SKILL.md: ${problem}`);
      if (entries.name !== folder) {
        problems.push(`${skillsRel}/${folder}/SKILL.md: name "${entries.name}" does not match the folder`);
      }
      if (!entries.description) {
        problems.push(`${skillsRel}/${folder}/SKILL.md: description is missing`);
      } else if (entries.description.length > MAX_DESCRIPTION) {
        problems.push(
          `${skillsRel}/${folder}/SKILL.md: description has ${entries.description.length} characters, over ${MAX_DESCRIPTION}`,
        );
      }
    }

    const lines = text.split("\n").length;
    if (lines >= MAX_SKILL_LINES) {
      problems.push(`${skillsRel}/${folder}/SKILL.md: ${lines} lines, the limit is under ${MAX_SKILL_LINES}`);
    }
  }

  for (const file of markdownFiles(skillsDir)) {
    const name = relative(root, file);
    const text = readFileSync(file, "utf8");

    for (const match of text.matchAll(PREFIXED_TOOL)) {
      problems.push(`${name}: "${match[0]}" is a client-prefixed name; use the bare tool name`);
    }

    for (const match of text.matchAll(SNAKE_CASE)) {
      const word = match[0];
      if (tools.has(word) || enumValues.has(word)) continue;
      problems.push(`${name}: "${word}" is not a tool or enum value in tools.json`);
    }

    for (const match of text.matchAll(CAMEL_CASE_CODE)) {
      if (fields.has(match[1])) continue;
      problems.push(`${name}: "${match[1]}" is not an argument or field in tools.json`);
    }
  }
}

if (problems.length > 0) {
  console.error(`check-tools: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `check-tools: ${skillCount} skills in ${plugins.length} plugins name only the ${tools.size} tools and the ${fields.size} fields in tools.json`,
);
