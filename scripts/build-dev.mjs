#!/usr/bin/env node
// Builds plugins/trendjack-dev from plugins/trendjack. With --check, fails when the committed copy is stale.

import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = join(root, "plugins", "trendjack");
const target = join(root, "plugins", "trendjack-dev");
const DEV_MCP_URL = "https://app.dev.trendjack.io/api/mcp";

const README = `# TrendJack (dev)

This is the development build of the TrendJack plugin. It is generated from \`plugins/trendjack\` by \`scripts/build-dev.mjs\`, so do not edit it by hand. It has the same skills, but its connector points at ${DEV_MCP_URL} instead of the production server. Use it to test skill and server changes on the dev deployment before they reach the production plugin. It is for the TrendJack team only. Sign in with your account on the dev deployment, not your production account.
`;

function build(dir) {
  rmSync(dir, { recursive: true, force: true });
  cpSync(source, dir, { recursive: true });

  const mcpPath = join(dir, ".mcp.json");
  const mcp = JSON.parse(readFileSync(mcpPath, "utf8"));
  mcp.mcpServers.trendjack.url = DEV_MCP_URL;
  writeFileSync(mcpPath, JSON.stringify(mcp, null, 2) + "\n");

  const manifestPath = join(dir, ".claude-plugin", "plugin.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.name = "trendjack-dev";
  manifest.displayName = "TrendJack (dev)";
  manifest.description = `Development build that connects to app.dev.trendjack.io. ${manifest.description}`;
  // Without a version, a Git-hosted marketplace versions the plugin by commit, so every push reaches testers.
  delete manifest.version;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  writeFileSync(join(dir, "README.md"), README);
}

function files(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

function snapshot(dir) {
  return new Map(files(dir).map((path) => [relative(dir, path), readFileSync(path, "utf8")]));
}

if (process.argv.includes("--check")) {
  const scratch = mkdtempSync(join(tmpdir(), "trendjack-dev-"));
  const expected = join(scratch, "trendjack-dev");
  build(expected);
  const want = snapshot(expected);
  let have;
  try {
    have = snapshot(target);
  } catch {
    have = new Map();
  }
  rmSync(scratch, { recursive: true, force: true });

  const stale = [...new Set([...want.keys(), ...have.keys()])].filter((path) => want.get(path) !== have.get(path));
  if (stale.length > 0) {
    console.error("build-dev: plugins/trendjack-dev is stale. Run node scripts/build-dev.mjs and commit the result.");
    for (const path of stale.sort()) console.error(`  - ${path}`);
    process.exit(1);
  }
  console.log("build-dev: plugins/trendjack-dev matches plugins/trendjack");
} else {
  build(target);
  console.log(`build-dev: wrote ${relative(root, target)}`);
}
