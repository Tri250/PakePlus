import { d as defineComponent, c as createElementBlock, a as createBaseVNode, m as createStaticVNode, b as createTextVNode, t as toDisplayString, u as unref, f as api, o as openBlock } from "./index-DXZ3niWx.js";
const _hoisted_1 = { class: "card panel" };
const _hoisted_2 = { style: { "line-height": "2", "color": "var(--text-2)", "font-size": "14px" } };
const _hoisted_3 = { style: { "margin-top": "12px" } };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "HelpView",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[2] || (_cache[2] = createBaseVNode("div", { class: "panel-title" }, "使用帮助", -1)),
        createBaseVNode("div", _hoisted_2, [
          _cache[1] || (_cache[1] = createStaticVNode('<p><b>快速上手（3 步）：</b></p><p>1. 复制百度网盘分享链接粘贴到工作台输入框（本地演示通道可用任意 s/1xxxx 链接，提取码 <b>yuni</b>）。</p><p>2. 点击「提交」解析出文件树，勾选需要的文件并「创建下载任务」。</p><p>3. 在「下载管理」查看进度、暂停/继续；重启应用后自动从断点续传。</p><p style="margin-top:12px;"><b>通道说明：</b></p><p>· 本地演示通道 — 内建 HTTP 网盘仿真（支持 Range 分块并发），无需任何凭据即可完整体验全部下载能力。</p><p>· 网页 Cookie 通道 — 使用你自己的百度网盘登录 Cookie（BDUSS），解析自己网盘与公开分享，直链自动附带 Cookie/UA/Referer。</p><p>· 官方开放平台通道 — 使用百度网盘开放平台 AppKey + OAuth access_token，走官方 OpenAPI。</p>', 8)),
          createBaseVNode("p", _hoisted_3, [
            _cache[0] || (_cache[0] = createTextVNode(" 运行环境：", -1)),
            createBaseVNode("b", null, toDisplayString(unref(api).platform === "electron" ? "桌面应用（Electron 主进程下载引擎）" : "浏览器演示模式（模拟下载，非真实落盘）"), 1)
          ])
        ])
      ]);
    };
  }
});
export {
  _sfc_main as default
};
