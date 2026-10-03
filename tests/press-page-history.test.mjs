import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(
  new URL("../src/components/elements/PressPage.tsx", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
});

// Exercise the component's element tree and callbacks without a browser dependency.
function harness(length) {
  let visible;
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (name === "react")
        return {
          useState(initial) {
            visible ??= initial;
            return [
              visible,
              (update) => {
                visible = update(visible);
              },
            ];
          },
        };
      if (name === "react/jsx-runtime") return require(name);
      return {};
    },
  });
  const selected = [];
  const pressed = [];
  const history = Array.from({ length }, (_, index) => ({
    url: `https://example.com/page-${index}`,
    title: `Dummy page ${index + 1}`,
    at: "10:00",
    assets: index,
    updatedAt: "2026-10-03T10:00:00.000Z",
  }));
  return {
    selected,
    pressed,
    history,
    render: () =>
      exports.PressPage({
        url: "",
        setUrl: (url) => selected.push(url),
        status: "idle",
        error: "",
        result: null,
        tab: "preview",
        setTab() {},
        history,
        markdown: "",
        onPress: (url) => pressed.push(url),
        onDownload() {},
      }),
  };
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object") return [];
  return [node, ...elements(node.props?.children)];
}
const list = (tree) => elements(tree).find((node) => node.props?.id === "recent-history-list");
const more = (tree) =>
  elements(tree).find((node) => node.props?.["aria-controls"] === "recent-history-list");

test("40 dummy entries load 16 at a time, enable scrolling, and preserve selection", () => {
  const app = harness(40);
  let tree = app.render();
  assert.equal(list(tree).props.children.length, 16);
  assert.ok(!list(tree).props.className.includes("overflow-y-auto"));
  more(tree).props.onClick();
  tree = app.render();
  assert.equal(list(tree).props.children.length, 32);
  assert.ok(list(tree).props.className.includes("max-h-[48rem] overflow-y-auto"));
  assert.equal(list(tree).props.tabIndex, 0);
  more(tree).props.onClick();
  tree = app.render();
  assert.equal(list(tree).props.children.length, 40);
  assert.equal(more(tree), undefined);
  list(tree).props.children[39].props.children.props.onClick();
  assert.deepEqual(app.selected, [app.history[39].url]);
  assert.deepEqual(app.pressed, app.selected);
});

for (const count of [0, 1, 16, 17]) {
  test(`history boundary: ${count} entries`, () => {
    const tree = harness(count).render();
    assert.equal(list(tree)?.props.children.length ?? 0, Math.min(count, 16));
    assert.equal(Boolean(more(tree)), count > 16);
    if (!count)
      assert.ok(elements(tree).some((node) => node.props?.children === "Nothing pressed yet."));
  });
}
