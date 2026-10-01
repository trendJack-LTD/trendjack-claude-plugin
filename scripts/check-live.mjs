#!/usr/bin/env node
// Fails when the live trendJack server does not serve every tool, field and enum value in tools.json.
// It lists tools without a token, so the server must answer tools/list before sign-in.
// MCP_URL overrides the tools.json url, for example to check a preview deployment.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const contract = JSON.parse(readFileSync(join(root, "tools.json"), "utf8"));
const url = process.env.MCP_URL || contract.url;

async function rpc(id, method, params) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "mcp-protocol-version": "2025-11-25",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, ...(params ? { params } : {}) }),
    signal: AbortSignal.timeout(15_000),
  });

  const text = await response.text();
  if (response.status === 401) {
    throw new Error(`${url} answered ${method} with 401: it needs a token before sign-in, so it has no lazy authentication`);
  }
  if (!response.ok) throw new Error(`${url} answered ${method} with ${response.status}: ${text.slice(0, 200)}`);

  const line = text.split("\n").find((candidate) => candidate.startsWith("data:"));
  const body = JSON.parse(line ? line.slice(5) : text);
  if (body.error) throw new Error(`${method} failed: ${body.error.message}`);
  return body.result;
}

const served = { tools: new Set(), fields: new Set(), enumValues: new Set() };

function walk(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach(walk);
  if (node.properties) for (const key of Object.keys(node.properties)) served.fields.add(key);
  if (Array.isArray(node.enum)) for (const value of node.enum) served.enumValues.add(value);
  if ("const" in node) served.enumValues.add(node.const);
  for (const value of Object.values(node)) walk(value);
}

try {
  const initialized = await rpc(1, "initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: { name: "trendjack-plugin-check", version: "1.0.0" },
  });

  let cursor;
  let id = 2;
  do {
    const page = await rpc(id++, "tools/list", cursor ? { cursor } : undefined);
    for (const tool of page.tools) {
      served.tools.add(tool.name);
      walk(tool.inputSchema);
      walk(tool.outputSchema);
    }
    cursor = page.nextCursor;
  } while (cursor);

  const problems = [];
  if (initialized.serverInfo?.name !== contract.server) {
    problems.push(`the server calls itself "${initialized.serverInfo?.name}", not "${contract.server}"`);
  }
  for (const tool of contract.tools) {
    if (!served.tools.has(tool.name)) problems.push(`tool ${tool.name} is not served`);
  }
  for (const field of contract.fields ?? []) {
    if (!served.fields.has(field)) problems.push(`field ${field} is in no served tool schema`);
  }
  for (const value of contract.enumValues ?? []) {
    if (!served.enumValues.has(value)) problems.push(`enum value ${value} is in no served tool schema`);
  }

  if (problems.length > 0) {
    console.error(`check-live: ${url} does not match tools.json, ${problems.length} problem(s)`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  console.log(
    `check-live: ${url} serves all ${contract.tools.length} tools, ${contract.fields.length} fields and ${contract.enumValues.length} enum values in tools.json`,
  );
} catch (error) {
  console.error(`check-live: ${error.message}`);
  process.exit(1);
}
