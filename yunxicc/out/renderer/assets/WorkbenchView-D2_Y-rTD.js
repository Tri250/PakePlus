import { d as defineComponent, c as createElementBlock, w as withModifiers, a as createBaseVNode, b as createTextVNode, t as toDisplayString, u as unref, s as store, F as Fragment, r as renderList, e as computed, n as notify, f as api, g as refreshTasks, h as refreshStats, o as openBlock, i as normalizeClass, j as fmtSize, k as createCommentVNode, l as ref, m as createStaticVNode, p as withDirectives, v as vModelText, q as withKeys, x as vModelCheckbox, y as createBlock, z as reactive } from "./index-DXZ3niWx.js";
const _hoisted_1$1 = { class: "dialog" };
const _hoisted_2$1 = { class: "dialog-head" };
const _hoisted_3$1 = { style: { "font-size": "12px", "color": "var(--text-3)", "margin-left": "8px" } };
const _hoisted_4$1 = { class: "dialog-body" };
const _hoisted_5$1 = ["onClick"];
const _hoisted_6$1 = ["checked", "onClick"];
const _hoisted_7$1 = { class: "size" };
const _hoisted_8$1 = ["onClick"];
const _hoisted_9$1 = ["onClick"];
const _hoisted_10$1 = ["checked", "onClick"];
const _hoisted_11$1 = { class: "size" };
const _hoisted_12$1 = ["onClick"];
const _hoisted_13$1 = ["onClick"];
const _hoisted_14$1 = ["checked", "onClick"];
const _hoisted_15$1 = { class: "size" };
const _hoisted_16$1 = { class: "dialog-foot" };
const _hoisted_17$1 = { style: { "margin-right": "auto", "font-size": "13px", "color": "var(--text-2)" } };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "FileTreeDialog",
  props: {
    files: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const checked = ref(/* @__PURE__ */ new Set());
    const expanded = ref(/* @__PURE__ */ new Set());
    const checkedFileCount = computed(() => {
      const all = collect(props.files);
      let n = 0;
      for (const p of checked.value) {
        const f = all.find((x) => x.path === p);
        if (f && !f.isDir) n++;
        if (f && f.isDir) n += countFiles(f);
      }
      return n;
    });
    function collect(files, out = []) {
      for (const f of files) {
        out.push(f);
        if (f.children) collect(f.children, out);
      }
      return out;
    }
    function countFiles(d) {
      return (d.children ?? []).reduce((n, c) => n + (c.isDir ? countFiles(c) : 1), 0);
    }
    function dirSize(d) {
      return (d.children ?? []).reduce((n, c) => n + (c.isDir ? dirSize(c) : c.size), 0);
    }
    function toggle(f) {
      if (checked.value.has(f.path)) checked.value.delete(f.path);
      else checked.value.add(f.path);
      checked.value = new Set(checked.value);
    }
    function toggleDir(f) {
      expanded.value.has(f.path) ? expanded.value.delete(f.path) : expanded.value.add(f.path);
      expanded.value = new Set(expanded.value);
    }
    function isChecked(f) {
      return checked.value.has(f.path);
    }
    async function create() {
      const paths = [];
      const all = collect(props.files);
      for (const p of checked.value) {
        const f = all.find((x) => x.path === p);
        if (!f) continue;
        if (f.isDir) for (const x of collect(f.children ?? [])) if (!x.isDir) paths.push(x.path);
        else paths.push(f.path);
      }
      if (!paths.length) {
        notify("请先勾选要下载的文件", "info");
        return;
      }
      const r = await api.taskCreate(paths);
      await Promise.all([refreshTasks(), refreshStats()]);
      notify(`已创建 ${r.created} 个下载任务`, "ok");
      emit("close");
      store.parsed = null;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "overlay",
        onClick: _cache[2] || (_cache[2] = withModifiers(($event) => emit("close"), ["self"]))
      }, [
        createBaseVNode("div", _hoisted_1$1, [
          createBaseVNode("div", _hoisted_2$1, [
            _cache[3] || (_cache[3] = createTextVNode("解析结果 ", -1)),
            createBaseVNode("span", _hoisted_3$1, toDisplayString(unref(store).parsed?.message), 1),
            createBaseVNode("button", {
              class: "icon-btn x",
              onClick: _cache[0] || (_cache[0] = ($event) => emit("close"))
            }, "✕")
          ]),
          createBaseVNode("div", _hoisted_4$1, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(props.files, (f) => {
              return openBlock(), createElementBlock(Fragment, {
                key: f.path
              }, [
                createBaseVNode("div", {
                  class: "tree-file-row",
                  onClick: ($event) => toggle(f)
                }, [
                  createBaseVNode("input", {
                    type: "checkbox",
                    class: "checkbox",
                    checked: isChecked(f),
                    onClick: withModifiers(($event) => toggle(f), ["stop"])
                  }, null, 8, _hoisted_6$1),
                  createBaseVNode("span", {
                    class: normalizeClass(["ficon", { dir: f.isDir }])
                  }, toDisplayString(f.isDir ? "📁" : "📄"), 3),
                  createBaseVNode("span", null, toDisplayString(f.name), 1),
                  createBaseVNode("span", _hoisted_7$1, toDisplayString(f.isDir ? unref(fmtSize)(dirSize(f)) : unref(fmtSize)(f.size)), 1),
                  f.isDir ? (openBlock(), createElementBlock("span", {
                    key: 0,
                    style: { "color": "var(--text-3)" },
                    onClick: withModifiers(($event) => toggleDir(f), ["stop"])
                  }, toDisplayString(expanded.value.has(f.path) ? "收起" : "展开"), 9, _hoisted_8$1)) : createCommentVNode("", true)
                ], 8, _hoisted_5$1),
                f.isDir && expanded.value.has(f.path) ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(f.children, (c) => {
                  return openBlock(), createElementBlock(Fragment, {
                    key: c.path
                  }, [
                    createBaseVNode("div", {
                      class: "tree-file-row",
                      style: { "padding-left": "28px" },
                      onClick: ($event) => toggle(c)
                    }, [
                      createBaseVNode("input", {
                        type: "checkbox",
                        class: "checkbox",
                        checked: isChecked(c),
                        onClick: withModifiers(($event) => toggle(c), ["stop"])
                      }, null, 8, _hoisted_10$1),
                      createBaseVNode("span", {
                        class: normalizeClass(["ficon", { dir: c.isDir }])
                      }, toDisplayString(c.isDir ? "📁" : "📄"), 3),
                      createBaseVNode("span", null, toDisplayString(c.name), 1),
                      createBaseVNode("span", _hoisted_11$1, toDisplayString(c.isDir ? unref(fmtSize)(dirSize(c)) : unref(fmtSize)(c.size)), 1),
                      c.isDir ? (openBlock(), createElementBlock("span", {
                        key: 0,
                        style: { "color": "var(--text-3)" },
                        onClick: withModifiers(($event) => toggleDir(c), ["stop"])
                      }, toDisplayString(expanded.value.has(c.path) ? "收起" : "展开"), 9, _hoisted_12$1)) : createCommentVNode("", true)
                    ], 8, _hoisted_9$1),
                    c.isDir && expanded.value.has(c.path) ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(c.children, (g) => {
                      return openBlock(), createElementBlock("div", {
                        key: g.path,
                        class: "tree-file-row",
                        style: { "padding-left": "48px" },
                        onClick: ($event) => toggle(g)
                      }, [
                        createBaseVNode("input", {
                          type: "checkbox",
                          class: "checkbox",
                          checked: isChecked(g),
                          onClick: withModifiers(($event) => toggle(g), ["stop"])
                        }, null, 8, _hoisted_14$1),
                        _cache[4] || (_cache[4] = createBaseVNode("span", { class: "ficon" }, "📄", -1)),
                        createBaseVNode("span", null, toDisplayString(g.name), 1),
                        createBaseVNode("span", _hoisted_15$1, toDisplayString(unref(fmtSize)(g.size)), 1)
                      ], 8, _hoisted_13$1);
                    }), 128)) : createCommentVNode("", true)
                  ], 64);
                }), 128)) : createCommentVNode("", true)
              ], 64);
            }), 128))
          ]),
          createBaseVNode("div", _hoisted_16$1, [
            createBaseVNode("span", _hoisted_17$1, "已选 " + toDisplayString(checkedFileCount.value) + " 个文件", 1),
            createBaseVNode("button", {
              class: "btn",
              onClick: _cache[1] || (_cache[1] = ($event) => emit("close"))
            }, "取消"),
            createBaseVNode("button", {
              class: "btn primary",
              onClick: create
            }, "创建下载任务（" + toDisplayString(checkedFileCount.value) + "）", 1)
          ])
        ])
      ]);
    };
  }
});
const _hoisted_1 = { class: "card hero" };
const _hoisted_2 = { class: "hero-links" };
const _hoisted_3 = { class: "card status-card" };
const _hoisted_4 = ["title"];
const _hoisted_5 = { key: 1 };
const _hoisted_6 = { class: "card parse-form" };
const _hoisted_7 = ["disabled"];
const _hoisted_8 = {
  key: 0,
  style: { "color": "var(--danger)", "font-size": "12px", "margin-top": "4px" }
};
const _hoisted_9 = { class: "row" };
const _hoisted_10 = { class: "field" };
const _hoisted_11 = ["disabled"];
const _hoisted_12 = { class: "field" };
const _hoisted_13 = ["disabled"];
const _hoisted_14 = ["disabled"];
const _hoisted_15 = { class: "form-foot" };
const _hoisted_16 = { class: "agree" };
const _hoisted_17 = { style: { "color": "var(--text-3)" } };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "WorkbenchView",
  setup(__props) {
    const link = ref("");
    const pwd = ref("");
    const cardKey = ref("");
    const agreed = ref(false);
    const submitting = ref(false);
    const showTree = ref(false);
    const okChannels = computed(() => store.channels.filter((c) => c.ok));
    const allOk = computed(() => okChannels.value.length > 0);
    const quota = computed(() => store.user ? "今日剩余额度：20/20" : "登录后可查看今日额度");
    const err = reactive({ link: "", pwd: "" });
    async function submit() {
      err.link = "";
      err.pwd = "";
      if (!link.value.trim()) {
        err.link = "请输入分享链接";
        return;
      }
      if (!agreed.value) {
        notify("请先勾选同意《服务协议》", "info");
        return;
      }
      submitting.value = true;
      try {
        const r = await api.parseSubmit(link.value, pwd.value, cardKey.value);
        if (r.ok) {
          store.parsed = r;
          showTree.value = true;
          notify(`解析成功（${r.channel}）`, "ok");
          void refreshChannels();
        } else {
          notify(r.message, "err");
        }
      } finally {
        submitting.value = false;
      }
    }
    async function refreshChannels() {
      store.channels = await api.channelStatus();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        _cache[18] || (_cache[18] = createBaseVNode("div", { class: "card welcome-card" }, [
          createBaseVNode("h2", null, "欢迎回来!")
        ], -1)),
        createBaseVNode("div", _hoisted_1, [
          _cache[11] || (_cache[11] = createStaticVNode('<div class="hero-title"><svg class="logo-mark" viewBox="0 0 32 32"><path d="M16 3 30 27H2z" fill="#4080ff"></path><path d="M16 12l7 13H9z" fill="#7aa7ff"></path></svg> Just Do It. </div><div class="hero-sub">基于Vite底层组件，探壳体验丝滑前端开发的乐趣。</div>', 2)),
          createBaseVNode("div", _hoisted_2, [
            createBaseVNode("a", {
              class: "clickable",
              onClick: _cache[0] || (_cache[0] = ($event) => unref(api).openExternal("https://pan.baidu.com"))
            }, "官网"),
            _cache[9] || (_cache[9] = createBaseVNode("span", { class: "divider" }, "|", -1)),
            createBaseVNode("a", {
              class: "clickable",
              onClick: _cache[1] || (_cache[1] = ($event) => unref(notify)("解析记录可在下载管理查看", "info"))
            }, "解析记录"),
            _cache[10] || (_cache[10] = createBaseVNode("span", { class: "divider" }, "|", -1)),
            createBaseVNode("a", {
              class: "clickable",
              onClick: _cache[2] || (_cache[2] = ($event) => unref(api).openExternal("https://github.com/silasmarchioriqhk/Yunxicc"))
            }, "GitHub")
          ]),
          _cache[12] || (_cache[12] = createBaseVNode("div", { class: "hero-avatars" }, [
            createBaseVNode("span", {
              class: "avatar",
              style: { "background": "#4080ff" }
            }, "Y"),
            createBaseVNode("span", {
              class: "avatar",
              style: { "background": "#52c41a" }
            }, "X"),
            createBaseVNode("span", {
              class: "avatar",
              style: { "background": "#e6a23c" }
            }, "1")
          ], -1))
        ]),
        createBaseVNode("div", _hoisted_3, [
          _cache[15] || (_cache[15] = createBaseVNode("span", { class: "spacer" }, null, -1)),
          allOk.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(store).channels, (c) => {
              return openBlock(), createElementBlock("span", {
                key: c.id,
                style: { "margin-left": "14px" },
                title: c.message
              }, [
                createBaseVNode("span", {
                  class: normalizeClass(["dot", c.ok ? "ok" : c.configured ? "warn" : "bad"])
                }, null, 2),
                createTextVNode(toDisplayString(c.name), 1)
              ], 8, _hoisted_4);
            }), 128)),
            _cache[13] || (_cache[13] = createBaseVNode("span", { style: { "margin-left": "18px", "color": "var(--success)", "font-weight": "600" } }, "正常", -1))
          ], 64)) : (openBlock(), createElementBlock("span", _hoisted_5, [..._cache[14] || (_cache[14] = [
            createBaseVNode("span", { class: "dot bad" }, null, -1),
            createTextVNode("服务异常", -1)
          ])]))
        ]),
        createBaseVNode("div", _hoisted_6, [
          createBaseVNode("div", null, [
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => link.value = $event),
              class: "input",
              placeholder: "请输入分享链接(可输入带提取码链接)",
              disabled: submitting.value,
              onKeyup: withKeys(submit, ["enter"])
            }, null, 40, _hoisted_7), [
              [vModelText, link.value]
            ]),
            err.link ? (openBlock(), createElementBlock("div", _hoisted_8, toDisplayString(err.link), 1)) : createCommentVNode("", true)
          ]),
          createBaseVNode("div", _hoisted_9, [
            createBaseVNode("div", _hoisted_10, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => pwd.value = $event),
                class: "input",
                placeholder: "提取码",
                disabled: submitting.value,
                onKeyup: withKeys(submit, ["enter"])
              }, null, 40, _hoisted_11), [
                [vModelText, pwd.value]
              ])
            ]),
            createBaseVNode("div", _hoisted_12, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => cardKey.value = $event),
                class: "input",
                placeholder: "卡密(可选,获取更多解析额度)",
                disabled: submitting.value
              }, null, 8, _hoisted_13), [
                [vModelText, cardKey.value]
              ])
            ])
          ]),
          createBaseVNode("button", {
            class: "btn primary block",
            style: { "margin-top": "16px" },
            disabled: submitting.value,
            onClick: submit
          }, toDisplayString(submitting.value ? "解析中…" : "提 交"), 9, _hoisted_14),
          createBaseVNode("div", _hoisted_15, [
            createBaseVNode("label", _hoisted_16, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => agreed.value = $event),
                type: "checkbox",
                class: "checkbox"
              }, null, 512), [
                [vModelCheckbox, agreed.value]
              ]),
              _cache[16] || (_cache[16] = createTextVNode(" 我已阅读并同意 ", -1)),
              createBaseVNode("a", {
                onClick: _cache[7] || (_cache[7] = withModifiers(($event) => unref(notify)("本工具仅供学习交流，请勿用于商业用途", "info"), ["prevent"]))
              }, "《服务协议》")
            ]),
            _cache[17] || (_cache[17] = createBaseVNode("span", { class: "spacer" }, null, -1)),
            createBaseVNode("span", _hoisted_17, toDisplayString(quota.value), 1)
          ])
        ]),
        showTree.value && unref(store).parsed ? (openBlock(), createBlock(_sfc_main$1, {
          key: 0,
          files: unref(store).parsed.files,
          onClose: _cache[8] || (_cache[8] = ($event) => showTree.value = false)
        }, null, 8, ["files"])) : createCommentVNode("", true)
      ]);
    };
  }
});
export {
  _sfc_main as default
};
