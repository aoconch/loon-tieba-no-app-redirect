/**
 * Loon http-request 脚本：百度贴吧「打开App / 下载」分流拦截
 * ------------------------------------------------------------------
 * 原理：贴吧前端会把带 obj_locate 参数的地址（/f?kw=...&obj_locate=...）导航出去，
 *      服务端检测到 obj_locate 后 302 到 /mo/q/activityDiversion/download（App 安装页）。
 *      本脚本在请求发出前，把带分流参数的贴吧地址改写回干净的吧页地址，
 *      服务端直接返回 200 网页版内容，根本不会产生 302，也不会出现重定向循环。
 *
 * 在 Loon 中：
 *   1) 把本文件放到 Loon 能取到的地方（Loon App 内“新建脚本”直接粘贴，或挂到你的 CDN）。
 *   2) [MITM] 里加 hostname = tieba.baidu.com，并在手机上信任 Loon 证书。
 *   3) [Script] 里加一条 http-request（见同目录 tieba_no_app_redirect.loon.conf）。
 */

var url = $request.url;

try {
  // 只处理贴吧分流相关请求
  if (/[?&]obj_locate=/.test(url) ||
      /tieba\.baidu\.com\/mo\/q\/activitydiversion\/download/i.test(url) ||
      /tieba\.baidu\.com\/h5activity\/download/i.test(url)) {

    var kwMatch = url.match(/[?&]kw=([^&#]+)/);
    var kw = kwMatch ? decodeURIComponent(kwMatch[1]) : '';
    var clean = kw
      ? 'https://tieba.baidu.com/f?kw=' + encodeURIComponent(kw)
      : 'https://tieba.baidu.com/';

    console.log('[贴吧防跳转] 改写分流请求 -> ' + clean);
    $done({ url: clean });
  } else {
    $done({});
  }
} catch (e) {
  $done({});
}
