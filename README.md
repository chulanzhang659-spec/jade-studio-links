# JADE STUDIO

[打开完整网站](https://chulanzhang659-spec.github.io/jade-studio-links/)

唯一公开版本：弧形开头 → 字体压缩 → 流动阶梯作品栏 → 六个业务作品集 → 水波翻阅 → 封面图缩入水流 → 联系方式。

每页作品集右上角都有「联系我们」按钮，与翻完作品集共用同一转场：当前封面缩小融入水流，随后向下浏览 TEL / EMAIL，不会直接跳到底部；返回会回到刚才查看的作品页。联系方式暂用「待补充」占位。

## 发布

`jade-site-v9.tar.gz.part-*` 是当前完整静态站点的分包，包含页面源文件、图片、PDF 和视频。GitHub Actions 合并分包、校验 SHA-256 后解压并发布到 GitHub Pages。`website.zip` 仅保留为旧版备份，不再用于发布。

原 `journal/`、`motion/`、`creative/` 三个独立发布目录和三站导航已从当前发布包移除。旧版本仍保留在仓库 Git 历史中，可恢复；本地设计源文件未删除。

配色：Forest Canopy `#474329` / Pale Jade `#BCB893`。

第二幕初始只显示文字，滚动后出现六张阶梯作品封面。作品内容统一放在可翻阅的报纸内，桌面三栏、手机单栏，支持二级分类、网页内视频播放和原文链接。向左滑动保留纸张波纹翻页；联系我们将当前分类封面缩入对应河流位置，再向下查看联系方式。

六个作品集大标题使用封面同款粗衬线油墨字体；中文标题下为对应英文小字，纸底为 Pale Jade，标题为 Forest Canopy。

本次同步来源：Sites 版本 9，源提交 `1a0ee272fcaccd9f2891d2a62cc0f97528b88fae`。发布包与该版本逐字节一致。

需要本地查看源码时：

```sh
cat jade-site-v9.tar.gz.part-* > jade-site.tar.gz
tar -xzf jade-site.tar.gz
```

更新：2026-11-16
