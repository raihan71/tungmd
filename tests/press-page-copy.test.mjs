import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { outputText } = ts.transpileModule(
  readFileSync(new URL("../src/components/elements/PressPage.tsx", import.meta.url), "utf8"),
  { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } },
);

function harness(clipboard) {
  const states = [];
  let cursor = 0;
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    navigator: { clipboard },
    require(name) {
      if (name === "react") return {
        useState(initial) {
          const index = cursor++;
          states[index] ??= initial;
          return [states[index], (value) => { states[index] = value; }];
        },
      };
      if (name === "react/jsx-runtime") return require(name);
      return {};
    },
  });
  return (props = {}) => {
    cursor = 0;
    return exports.PressPage({
      status: "done", history: [], tab: "raw", markdown: "# Hello\n\n```js\nconst x = 1;\n```",
      result: { colors: [], type: [], images: [] }, ...props,
    });
  };
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object") return [];
  return [node, ...elements(node.props?.children)];
}
const copy = (tree) => elements(tree).find((node) => node.props?.children === "Copy markdown");
const feedback = (tree) => elements(tree).find((node) => node.props?.role === "status");

test("Raw copy writes exact markdown and reports success only after completion", async () => {
  let copied;
  const render = harness({ async writeText(text) { copied = text; } });
  await copy(render()).props.onClick();
  assert.equal(copied, "# Hello\n\n```js\nconst x = 1;\n```");
  assert.equal(feedback(render()).props.children, "Copied!");
  assert.equal(feedback(render({ markdown: "new content" })).props.children, "");
  assert.equal(copy(render({ tab: "preview" })), undefined);
  assert.equal(copy(render({ tab: "ui" })), undefined);
  assert.equal(copy(render({ result: null })), undefined);
});

for (const clipboard of [undefined, { async writeText() { throw new Error("Denied"); } }]) {
  test("Unavailable or denied clipboard offers manual copying", async () => {
    const render = harness(clipboard);
    await copy(render()).props.onClick();
    assert.match(feedback(render()).props.children, /Could not copy/);
  });
}
