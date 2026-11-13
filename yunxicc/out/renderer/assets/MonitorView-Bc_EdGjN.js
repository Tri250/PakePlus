import { d as defineComponent, c as createElementBlock, a as createBaseVNode, t as toDisplayString, u as unref, A as fmtSpeed, s as store, F as Fragment, r as renderList, e as computed, o as openBlock, B as normalizeStyle, j as fmtSize, i as normalizeClass } from "./index-DXZ3niWx.js";
const _hoisted_1 = {
  class: "stat-grid",
  style: { "grid-template-columns": "repeat(3, 1fr)" }
};
const _hoisted_2 = { class: "card stat-card" };
const _hoisted_3 = { class: "stat-value" };
const _hoisted_4 = { class: "card stat-card" };
const _hoisted_5 = { class: "stat-value" };
const _hoisted_6 = { class: "card stat-card" };
const _hoisted_7 = { class: "stat-value" };
const _hoisted_8 = {
  key: 0,
  class: "card panel"
};
const _hoisted_9 = {
  key: 1,
  class: "monitor-grid"
};
const _hoisted_10 = { class: "monitor-head" };
const _hoisted_11 = { class: "name" };
const _hoisted_12 = { class: "speed" };
const _hoisted_13 = {
  class: "progress-bar",
  style: { "height": "8px" }
};
const _hoisted_14 = { class: "monitor-meta" };
const _hoisted_15 = { style: { "color": "var(--text-3)" } };
const _hoisted_16 = { class: "conn-bars" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MonitorView",
  setup(__props) {
    const active = computed(() => store.tasks.filter((t) => t.status === "downloading" || t.status === "pending" || t.status === "paused"));
    const connCount = computed(() => store.tasks.reduce((n, t) => n + (t.status === "downloading" ? t.connections : 0), 0));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1, [
          createBaseVNode("div", _hoisted_2, [
            _cache[1] || (_cache[1] = createBaseVNode("div", {
              class: "stat-icon",
              style: { "background": "var(--primary-bg)", "color": "var(--primary)" }
            }, "⚡", -1)),
            createBaseVNode("div", null, [
              _cache[0] || (_cache[0] = createBaseVNode("div", { class: "stat-label" }, "实时总速度", -1)),
              createBaseVNode("div", _hoisted_3, toDisplayString(unref(fmtSpeed)(unref(store).stats.totalSpeed) || "0 B/s"), 1)
            ])
          ]),
          createBaseVNode("div", _hoisted_4, [
            _cache[3] || (_cache[3] = createBaseVNode("div", {
              class: "stat-icon",
              style: { "background": "var(--success-bg)", "color": "var(--success)" }
            }, "⇅", -1)),
            createBaseVNode("div", null, [
              _cache[2] || (_cache[2] = createBaseVNode("div", { class: "stat-label" }, "活跃连接", -1)),
              createBaseVNode("div", _hoisted_5, toDisplayString(connCount.value), 1)
            ])
          ]),
          createBaseVNode("div", _hoisted_6, [
            _cache[5] || (_cache[5] = createBaseVNode("div", {
              class: "stat-icon",
              style: { "background": "var(--warning-bg)", "color": "var(--warning)" }
            }, "⟳", -1)),
            createBaseVNode("div", null, [
              _cache[4] || (_cache[4] = createBaseVNode("div", { class: "stat-label" }, "活跃任务", -1)),
              createBaseVNode("div", _hoisted_7, toDisplayString(active.value.length), 1)
            ])
          ])
        ]),
        !active.value.length ? (openBlock(), createElementBlock("div", _hoisted_8, [..._cache[6] || (_cache[6] = [
          createBaseVNode("div", { class: "empty" }, "当前没有进行中的任务", -1)
        ])])) : (openBlock(), createElementBlock("div", _hoisted_9, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(active.value, (t) => {
            return openBlock(), createElementBlock("div", {
              key: t.id,
              class: "card monitor-card"
            }, [
              createBaseVNode("div", _hoisted_10, [
                createBaseVNode("span", _hoisted_11, toDisplayString(t.name), 1),
                createBaseVNode("span", _hoisted_12, toDisplayString(unref(fmtSpeed)(t.speed)), 1)
              ]),
              createBaseVNode("div", _hoisted_13, [
                createBaseVNode("div", {
                  class: "progress-inner",
                  style: normalizeStyle({ width: (t.size ? Math.min(100, t.received / t.size * 100) : 0) + "%" })
                }, null, 4)
              ]),
              createBaseVNode("div", _hoisted_14, [
                createBaseVNode("span", null, toDisplayString(unref(fmtSize)(t.received)) + " / " + toDisplayString(unref(fmtSize)(t.size)), 1),
                createBaseVNode("span", null, toDisplayString(t.size ? Math.round(t.received / t.size * 1e3) / 10 : 0) + "%", 1),
                createBaseVNode("span", null, toDisplayString(t.connections) + " 连接", 1),
                createBaseVNode("span", _hoisted_15, toDisplayString(t.status === "paused" ? "已暂停" : t.status === "pending" ? "排队中" : "下载中"), 1)
              ]),
              createBaseVNode("div", _hoisted_16, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(Math.max(t.connections, 8), (i) => {
                  return openBlock(), createElementBlock("div", {
                    key: i,
                    class: normalizeClass(["conn-bar", { on: i <= t.connections }])
                  }, null, 2);
                }), 128))
              ])
            ]);
          }), 128))
        ]))
      ]);
    };
  }
});
export {
  _sfc_main as default
};
