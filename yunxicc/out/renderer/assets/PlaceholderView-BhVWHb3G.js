import { o as openBlock, c as createElementBlock, a as createBaseVNode } from "./index-DXZ3niWx.js";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main = {};
const _hoisted_1 = { class: "card panel" };
function _sfc_render(_ctx, _cache) {
  return openBlock(), createElementBlock("div", _hoisted_1, [..._cache[0] || (_cache[0] = [
    createBaseVNode("div", {
      class: "empty",
      style: { "padding": "80px 0" }
    }, [
      createBaseVNode("div", { style: { "font-size": "40px", "margin-bottom": "12px" } }, "🚧"),
      createBaseVNode("div", null, "模块建设中，敬请期待")
    ], -1)
  ])]);
}
const PlaceholderView = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
export {
  PlaceholderView as default
};
