import { d as defineComponent, c as createElementBlock, a as createBaseVNode, k as createCommentVNode, F as Fragment, r as renderList, b as createTextVNode, t as toDisplayString, u as unref, j as fmtSize, s as store, e as computed, o as openBlock, B as normalizeStyle } from "./index-DXZ3niWx.js";
const _hoisted_1 = { class: "card panel" };
const _hoisted_2 = {
  key: 0,
  class: "empty"
};
const _hoisted_3 = { style: { "display": "flex", "align-items": "flex-end", "gap": "12px", "height": "220px", "padding": "10px 0" } };
const _hoisted_4 = { style: { "font-size": "11px", "color": "var(--text-3)", "margin-bottom": "4px" } };
const _hoisted_5 = { style: { "font-size": "11px", "color": "var(--text-3)", "margin-top": "6px" } };
const _hoisted_6 = { style: { "margin-top": "16px", "color": "var(--text-2)", "font-size": "13px" } };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StatsView",
  setup(__props) {
    const done = computed(() => store.tasks.filter((t) => t.status === "completed"));
    const totalByDay = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const t of done.value) {
        const d = new Date(t.completedAt ?? t.updatedAt).toISOString().slice(0, 10);
        map.set(d, (map.get(d) ?? 0) + t.size);
      }
      return [...map.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1).slice(-14);
    });
    const max = computed(() => Math.max(1, ...totalByDay.value.map((x) => x[1])));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[2] || (_cache[2] = createBaseVNode("div", { class: "panel-title" }, "下载统计", -1)),
        !totalByDay.value.length ? (openBlock(), createElementBlock("div", _hoisted_2, "暂无完成记录")) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_3, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(totalByDay.value, ([d, v]) => {
            return openBlock(), createElementBlock("div", {
              key: d,
              style: { "flex": "1", "text-align": "center" }
            }, [
              createBaseVNode("div", _hoisted_4, toDisplayString(unref(fmtSize)(v)), 1),
              createBaseVNode("div", {
                style: normalizeStyle([{ "background": "var(--primary)", "border-radius": "4px 4px 0 0", "height": "0px" }, { height: Math.round(v / max.value * 160) + "px" }])
              }, null, 4),
              createBaseVNode("div", _hoisted_5, toDisplayString(d.slice(5)), 1)
            ]);
          }), 128))
        ]),
        createBaseVNode("div", _hoisted_6, [
          _cache[0] || (_cache[0] = createTextVNode(" 历史累计下载：", -1)),
          createBaseVNode("b", null, toDisplayString(unref(fmtSize)(unref(store).stats.totalBytesDone)), 1),
          _cache[1] || (_cache[1] = createTextVNode("（只增不减） ", -1))
        ])
      ]);
    };
  }
});
export {
  _sfc_main as default
};
