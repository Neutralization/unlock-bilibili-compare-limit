# 解除创作中心稿件对比数量限制

用于 B 站创作中心「稿件分析 → 稿件对比」的油猴脚本。打开稿件选择器后，脚本会自动加载并选中最多 200 个稿件，同时将对比请求中的 `size` 参数改为 200；仍需自行检查选择结果并点击「确定」。

## 安装与使用

1. 安装 Tampermonkey 等用户脚本管理器，导入 [`unlock-bilibili-compare-limit.user.js`](./unlock-bilibili-compare-limit.user.js)。
2. 登录 B 站创作中心，打开[稿件分析页面](https://member.bilibili.com/platform/data-up/video/)并进入「稿件对比」选择器。
3. 等待脚本加载并选中稿件，核对数量后点击「确定」。需要调整数量时，修改脚本顶部的 `MAX` 常量。

脚本只匹配数据中心内嵌页 `member.bilibili.com/york/data-center-web*`，无需填写 Cookie。