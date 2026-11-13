import { d as defineComponent, c as createElementBlock, a as createBaseVNode, t as toDisplayString, u as unref, s as store, A as fmtSpeed, k as createCommentVNode, j as fmtSize, i as normalizeClass, b as createTextVNode, F as Fragment, r as renderList, l as ref, e as computed, f as api, g as refreshTasks, h as refreshStats, o as openBlock, B as normalizeStyle } from "./index-DXZ3niWx.js";
const _hoisted_1 = { class: "stat-grid" };
const _hoisted_2 = { class: "card stat-card" };
const _hoisted_3 = { class: "stat-value" };
const _hoisted_4 = { class: "card stat-card" };
const _hoisted_5 = { class: "stat-value" };
const _hoisted_6 = { class: "card stat-card" };
const _hoisted_7 = { class: "stat-value" };
const _hoisted_8 = {
  key: 0,
  class: "stat-extra"
};
const _hoisted_9 = { class: "card stat-card" };
const _hoisted_10 = { class: "stat-value" };
const _hoisted_11 = { class: "card panel" };
const _hoisted_12 = { class: "tabs" };
const _hoisted_13 = {
  key: 0,
  class: "badge"
};
const _hoisted_14 = { class: "toolbar" };
const _hoisted_15 = ["disabled"];
const _hoisted_16 = {
  key: 0,
  style: { "align-self": "center", "font-size": "12px", "color": "var(--text-3)" }
};
const _hoisted_17 = { class: "table" };
const _hoisted_18 = { style: { "width": "36px" } };
const _hoisted_19 = ["checked"];
const _hoisted_20 = ["checked", "onClick"];
const _hoisted_21 = ["title"];
const _hoisted_22 = { class: "progress-wrap" };
const _hoisted_23 = { class: "progress-bar" };
const _hoisted_24 = { class: "progress-text" };
const _hoisted_25 = {
  key: 0,
  style: { "color": "var(--danger)", "font-size": "11px" }
};
const _hoisted_26 = ["onClick"];
const _hoisted_27 = ["onClick"];
const _hoisted_28 = ["onClick"];
const _hoisted_29 = ["onClick"];
const _hoisted_30 = { key: 0 };
const _hoisted_31 = { colspan: "6" };
const _hoisted_32 = { class: "empty" };
const _hoisted_33 = { class: "pagination" };
const _hoisted_34 = ["disabled"];
const _hoisted_35 = ["onClick"];
const _hoisted_36 = ["disabled"];
const pageSize = 10;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DownloadView",
  setup(__props) {
    const tab = ref("active");
    const page = ref(1);
    const selected = ref(/* @__PURE__ */ new Set());
    const filtered = computed(() => {
      const kw = store.keyword.toLowerCase();
      return store.tasks.filter((t) => t.name.toLowerCase().includes(kw));
    });
    const activeTasks = computed(() => filtered.value.filter((t) => t.status !== "completed"));
    const doneTasks = computed(() => filtered.value.filter((t) => t.status === "completed"));
    const shown = computed(() => tab.value === "active" ? activeTasks.value : doneTasks.value);
    const paged = computed(() => shown.value.slice((page.value - 1) * pageSize, page.value * pageSize));
    const totalPages = computed(() => Math.max(1, Math.ceil(shown.value.length / pageSize)));
    function statusText(t) {
      if (t.status === "downloading") return fmtSpeed(t.speed) || "下载中";
      const map = { pending: "排队中", paused: "已暂停", completed: "已完成", failed: "失败", canceled: "已取消", parsing: "解析中", ready: "已就绪" };
      return map[t.status] ?? t.status;
    }
    function statusColor(t) {
      if (t.status === "downloading") return "var(--primary)";
      if (t.status === "completed") return "var(--success)";
      if (t.status === "failed") return "var(--danger)";
      return "var(--text-3)";
    }
    function toggleSel(id) {
      selected.value.has(id) ? selected.value.delete(id) : selected.value.add(id);
      selected.value = new Set(selected.value);
    }
    function toggleAll() {
      if (selected.value.size === paged.value.length) selected.value = /* @__PURE__ */ new Set();
      else selected.value = new Set(paged.value.map((t) => t.id));
    }
    async function pause(t) {
      await api.taskPause(t.id);
      await sync();
    }
    async function resume(t) {
      await api.taskResume(t.id);
      await sync();
    }
    async function remove(t) {
      await api.taskRemove(t.id);
      selected.value.delete(t.id);
      await sync();
    }
    async function retry(t) {
      await api.taskRetry(t.id);
      await sync();
    }
    async function batchRemove() {
      if (!selected.value.size) return;
      for (const id of selected.value) await api.taskRemove(id);
      selected.value = /* @__PURE__ */ new Set();
      await sync();
    }
    async function pauseAll() {
      for (const t of store.tasks.filter((t2) => t2.status === "downloading" || t2.status === "pending")) await api.taskPause(t.id);
      await sync();
    }
    async function resumeAll() {
      for (const t of store.tasks.filter((t2) => t2.status === "paused")) await api.taskResume(t.id);
      await sync();
    }
    async function sync() {
      await Promise.all([refreshTasks(), refreshStats()]);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1, [
          createBaseVNode("div", _hoisted_2, [
            _cache[5] || (_cache[5] = createBaseVNode("div", {
              class: "stat-icon",
              style: { "background": "var(--hover)", "color": "var(--text-2)" }
            }, "⬇", -1)),
            createBaseVNode("div", null, [
              _cache[4] || (_cache[4] = createBaseVNode("div", { class: "stat-label" }, "任务总数", -1)),
              createBaseVNode("div", _hoisted_3, toDisplayString(unref(store).stats.totalTasks), 1)
            ])
          ]),
          createBaseVNode("div", _hoisted_4, [
            _cache[7] || (_cache[7] = createBaseVNode("div", {
              class: "stat-icon",
              style: { "background": "var(--success-bg)", "color": "var(--success)" }
            }, "✔", -1)),
            createBaseVNode("div", null, [
              _cache[6] || (_cache[6] = createBaseVNode("div", { class: "stat-label" }, "已完成", -1)),
              createBaseVNode("div", _hoisted_5, toDisplayString(unref(store).stats.completed), 1)
            ])
          ]),
          createBaseVNode("div", _hoisted_6, [
            _cache[9] || (_cache[9] = createBaseVNode("div", {
              class: "stat-icon",
              style: { "background": "var(--primary-bg)", "color": "var(--primary)" }
            }, "⏳", -1)),
            createBaseVNode("div", null, [
              _cache[8] || (_cache[8] = createBaseVNode("div", { class: "stat-label" }, "下载中", -1)),
              createBaseVNode("div", _hoisted_7, toDisplayString(unref(store).stats.downloading), 1),
              unref(store).stats.totalSpeed > 0 ? (openBlock(), createElementBlock("div", _hoisted_8, toDisplayString(unref(fmtSpeed)(unref(store).stats.totalSpeed)), 1)) : createCommentVNode("", true)
            ])
          ]),
          createBaseVNode("div", _hoisted_9, [
            _cache[11] || (_cache[11] = createBaseVNode("div", {
              class: "stat-icon",
              style: { "background": "var(--warning-bg)", "color": "var(--warning)" }
            }, "▤", -1)),
            createBaseVNode("div", null, [
              _cache[10] || (_cache[10] = createBaseVNode("div", { class: "stat-label" }, "总下载量", -1)),
              createBaseVNode("div", _hoisted_10, toDisplayString(unref(fmtSize)(unref(store).stats.totalBytesDone)), 1)
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_11, [
          _cache[18] || (_cache[18] = createBaseVNode("div", { class: "panel-title" }, "下载管理", -1)),
          createBaseVNode("div", _hoisted_12, [
            createBaseVNode("div", {
              class: normalizeClass(["tab", { active: tab.value === "active" }]),
              onClick: _cache[0] || (_cache[0] = ($event) => {
                tab.value = "active";
                page.value = 1;
              })
            }, [
              _cache[12] || (_cache[12] = createTextVNode(" 正在下载 ", -1)),
              activeTasks.value.length ? (openBlock(), createElementBlock("span", _hoisted_13, toDisplayString(activeTasks.value.length), 1)) : createCommentVNode("", true)
            ], 2),
            createBaseVNode("div", {
              class: normalizeClass(["tab", { active: tab.value === "done" }]),
              onClick: _cache[1] || (_cache[1] = ($event) => {
                tab.value = "done";
                page.value = 1;
              })
            }, "已完成", 2)
          ]),
          createBaseVNode("div", _hoisted_14, [
            createBaseVNode("button", {
              class: "btn danger-plain",
              disabled: !selected.value.size,
              onClick: batchRemove
            }, "🗑 批量删除", 8, _hoisted_15),
            createBaseVNode("button", {
              class: "btn",
              onClick: pauseAll
            }, "⏸ 全部暂停"),
            createBaseVNode("button", {
              class: "btn",
              onClick: resumeAll
            }, "▶ 全部继续"),
            unref(store).keyword ? (openBlock(), createElementBlock("span", _hoisted_16, "筛选：" + toDisplayString(unref(store).keyword) + "（在顶栏搜索框修改）", 1)) : createCommentVNode("", true)
          ]),
          createBaseVNode("table", _hoisted_17, [
            createBaseVNode("thead", null, [
              createBaseVNode("tr", null, [
                createBaseVNode("th", _hoisted_18, [
                  createBaseVNode("input", {
                    type: "checkbox",
                    class: "checkbox",
                    checked: selected.value.size === paged.value.length && paged.value.length > 0,
                    onClick: toggleAll
                  }, null, 8, _hoisted_19)
                ]),
                _cache[13] || (_cache[13] = createBaseVNode("th", null, "文件名", -1)),
                _cache[14] || (_cache[14] = createBaseVNode("th", { style: { "width": "110px" } }, "大小", -1)),
                _cache[15] || (_cache[15] = createBaseVNode("th", { style: { "width": "240px" } }, "进度", -1)),
                _cache[16] || (_cache[16] = createBaseVNode("th", { style: { "width": "130px" } }, "状态", -1)),
                _cache[17] || (_cache[17] = createBaseVNode("th", { style: { "width": "130px" } }, "操作", -1))
              ])
            ]),
            createBaseVNode("tbody", null, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(paged.value, (t) => {
                return openBlock(), createElementBlock("tr", {
                  key: t.id
                }, [
                  createBaseVNode("td", null, [
                    createBaseVNode("input", {
                      type: "checkbox",
                      class: "checkbox",
                      checked: selected.value.has(t.id),
                      onClick: ($event) => toggleSel(t.id)
                    }, null, 8, _hoisted_20)
                  ]),
                  createBaseVNode("td", {
                    class: "name",
                    title: t.remotePath
                  }, toDisplayString(t.name), 9, _hoisted_21),
                  createBaseVNode("td", null, toDisplayString(unref(fmtSize)(t.size)), 1),
                  createBaseVNode("td", null, [
                    createBaseVNode("div", _hoisted_22, [
                      createBaseVNode("div", _hoisted_23, [
                        createBaseVNode("div", {
                          class: normalizeClass(["progress-inner", { done: t.status === "completed" }]),
                          style: normalizeStyle({ width: (t.size ? Math.min(100, t.received / t.size * 100) : 0) + "%" })
                        }, null, 6)
                      ]),
                      createBaseVNode("span", _hoisted_24, toDisplayString(t.size ? Math.round(t.received / t.size * 1e3) / 10 : 0) + "%", 1)
                    ])
                  ]),
                  createBaseVNode("td", null, [
                    createBaseVNode("span", {
                      class: "status-pill",
                      style: normalizeStyle({ color: statusColor(t) })
                    }, toDisplayString(statusText(t)), 5),
                    t.error ? (openBlock(), createElementBlock("div", _hoisted_25, toDisplayString(t.error), 1)) : createCommentVNode("", true)
                  ]),
                  createBaseVNode("td", null, [
                    t.status === "downloading" ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      class: "link-btn",
                      onClick: ($event) => pause(t)
                    }, "暂停", 8, _hoisted_26)) : createCommentVNode("", true),
                    t.status === "paused" || t.status === "pending" ? (openBlock(), createElementBlock("button", {
                      key: 1,
                      class: "link-btn",
                      onClick: ($event) => resume(t)
                    }, "继续", 8, _hoisted_27)) : createCommentVNode("", true),
                    t.status === "failed" ? (openBlock(), createElementBlock("button", {
                      key: 2,
                      class: "link-btn",
                      onClick: ($event) => retry(t)
                    }, "重试", 8, _hoisted_28)) : createCommentVNode("", true),
                    createBaseVNode("button", {
                      class: "link-btn danger",
                      onClick: ($event) => remove(t)
                    }, "删除", 8, _hoisted_29)
                  ])
                ]);
              }), 128)),
              !paged.value.length ? (openBlock(), createElementBlock("tr", _hoisted_30, [
                createBaseVNode("td", _hoisted_31, [
                  createBaseVNode("div", _hoisted_32, toDisplayString(tab.value === "active" ? "暂无进行中的任务" : "暂无已完成任务"), 1)
                ])
              ])) : createCommentVNode("", true)
            ])
          ]),
          createBaseVNode("div", _hoisted_33, [
            createBaseVNode("span", null, "共 " + toDisplayString(shown.value.length) + " 条", 1),
            createBaseVNode("button", {
              class: "page-btn",
              disabled: page.value <= 1,
              onClick: _cache[2] || (_cache[2] = ($event) => page.value--)
            }, "<", 8, _hoisted_34),
            (openBlock(true), createElementBlock(Fragment, null, renderList(totalPages.value, (p) => {
              return openBlock(), createElementBlock("button", {
                key: p,
                class: normalizeClass(["page-btn", { active: p === page.value }]),
                onClick: ($event) => page.value = p
              }, toDisplayString(p), 11, _hoisted_35);
            }), 128)),
            createBaseVNode("button", {
              class: "page-btn",
              disabled: page.value >= totalPages.value,
              onClick: _cache[3] || (_cache[3] = ($event) => page.value++)
            }, ">", 8, _hoisted_36)
          ])
        ])
      ]);
    };
  }
});
export {
  _sfc_main as default
};
