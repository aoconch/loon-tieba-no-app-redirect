# 贴吧防跳转 · Loon 插件

阻止手机浏览器（Safari / Edge 等）在打开百度贴吧吧页时被前端脚本跳转到「贴吧 App 安装 / 打开」落地页。

## 原理

抓包分析发现：贴吧网页版加载后，前端 JS 会把地址改写成带分流参数的形式

```
/f?kw=...&obj_locate=f_w_silence|f_w_publish&obj_source=wise&fr=bpushFrsAppGuideOpenApp...
```

然后导航过去；**服务端检测到 `obj_locate` 后返回 302**，跳到 `/mo/q/activityDiversion/download`（App 安装页）。

本插件在 **Loon 网络层**（`http-request`）于请求发出前拦截，把带分流参数的贴吧地址改写回干净的吧页 `https://tieba.baidu.com/f?kw=...`，服务端直接返回 200 网页版，根本不会产生 302，也不会出现重定向循环。与用哪个浏览器无关，手机端 100% 生效。

## 安装（Loon）

1. 手机安装并配置好 Loon，在 **Loon → 证书** 中安装 CA 证书，并到系统「设置 → 通用 → 关于本机 → 证书信任设置」**完全信任**该证书（否则 https 解密不生效）。
2. 在 Loon 中添加本插件，任选一种：
   - **插件 URL（推荐）**：在 Loon「插件」里添加订阅地址（自动拉取最新 plugin）：
     ```
     https://cdn.jsdelivr.net/gh/aoconch/loon-tieba-no-app-redirect@main/tieba-no-app-redirect.plugin
     ```
   - **手动新建**：复制 `tieba-no-app-redirect.plugin` 全文，在 Loon「插件」里新建并粘贴。
3. 插件使用 `%APPEND%` 自动把 `tieba.baidu.com` 追加进 `[Mitm] hostname`，无需手动改 MITM。
4. 保持 Loon 代理开启（至少保证对 `tieba.baidu.com` 走 MITM 解密）。

## 验证

用手机浏览器打开任意贴吧吧页（如 `https://tieba.baidu.com/f?kw=英雄联盟`），应停留在网页版，不再弹出 App 安装 / 打开页。可在 Loon 日志里看到 `[贴吧防跳转] 改写分流请求 -> ...` 的条目。

## 文件说明

- `tieba-no-app-redirect.plugin` — Loon 插件本体（含 `[Mitm]` + `[Script]` 配置）。
- `tieba_no_app_redirect.loon.js` — 插件引用的拦截脚本（已固定到 commit SHA，绕开 CDN 缓存）。
- `tieba_no_app_redirect.loon.conf` — 等价的 Loon 配置片段，供手动合并参考。

## 备注

- 若不方便用 Loon，也可在 **Safari** 中用 Tampermonkey / Userscripts 注入用户脚本版（见工作区 `tieba_no_app_redirect.user.js`）。注意 iOS 的 Edge 等第三方浏览器无法运行用户脚本。
- 贴吧若改版、不再使用 `obj_locate` 参数触发跳转，需同步更新脚本里的匹配规则。
