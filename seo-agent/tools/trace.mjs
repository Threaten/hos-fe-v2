#!/usr/bin/env node
// Turns Claude Code's stream-json output (stdin) into a readable live log:
// one line per step the agent takes, then its final summary.
import readline from "node:readline";

const short = (value, max = 160) => {
  const text = (typeof value === "string" ? value : JSON.stringify(value) ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
};
const time = () => new Date().toTimeString().slice(0, 8);
const describe = (name, input = {}) =>
  input.command ?? input.file_path ?? input.pattern ?? input.url ?? input.query ?? short(input, 120);

let finished = false;
const lines = readline.createInterface({ input: process.stdin });
lines.on("line", (line) => {
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    if (line.trim()) console.log(line);
    return;
  }
  if (event.type === "system" && event.subtype === "init") {
    console.log(`[${time()}] started (model ${event.model})`);
  } else if (event.type === "assistant") {
    for (const part of event.message?.content ?? []) {
      if (part.type === "tool_use") console.log(`[${time()}] > ${part.name}: ${short(describe(part.name, part.input))}`);
      else if (part.type === "text" && part.text.trim()) console.log(`[${time()}]   ${short(part.text, 200)}`);
    }
  } else if (event.type === "user") {
    for (const part of event.message?.content ?? []) {
      if (part.type === "tool_result" && part.is_error) console.log(`[${time()}]   ! ${short(part.content, 200)}`);
    }
  } else if (event.type === "result") {
    finished = true;
    console.log(`\n[${time()}] done: ${event.subtype}, ${event.num_turns ?? "?"} steps\n`);
    if (event.result) console.log(event.result);
  }
});
lines.on("close", () => {
  if (!finished) console.log(`\n[${time()}] the agent stopped before finishing (see the last step above)`);
});
