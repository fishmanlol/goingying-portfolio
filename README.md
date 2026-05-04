# Gongying Pu — Portfolio

静态作品集网站，无需构建步骤。所有内容（个人简介 + 项目）都存在 `content/` 文件夹的 Markdown 文件里。

## 文件结构

```
.
├── index.html
├── style.css
├── app.js              # 主逻辑
├── content-loader.js   # Markdown 加载器
├── images/             # 上传的图片放这里（CMS 自动管理）
├── content/
│   ├── site.md         # 个人简介
│   ├── manifest.js     # 项目文件清单（新增项目时要更新这里）
│   └── projects/
│       ├── 01-vermont-triangle.md
│       ├── 02-echo-park-edge.md
│       └── ...         # 一个项目一个 .md 文件
└── .pages.yml          # Pages CMS 配置
```

## 本地预览

不能直接双击 `index.html` 打开（浏览器会拦截 fetch）。在 `hifi/` 文件夹里跑：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 部署到 GitHub Pages

代码已经在 GitHub 上了，每次 `git push` 后 GitHub Pages 自动重新部署，1–2 分钟生效。

---

## 接入 Pages CMS（可视化编辑后台）

Pages CMS 是免费的、托管在 pagescms.org 的可视化编辑器，让你在浏览器里改文字、上传图片，保存后自动 commit 到 GitHub。

### 一次性设置

1. 打开 https://app.pagescms.org/
2. 用 GitHub 账号登录，授权它访问你的 repo（`fishmanlol/goingying-portfolio`）
3. 点 "Add project" → 选这个 repo
4. **Project root** 设置成 `hifi`（因为 `.pages.yml` 在这个子文件夹里）
5. 完成

### 日常使用

打开 `app.pagescms.org`，进入项目后能看到：

- **Site / Bio** — 一个表单，编辑姓名、简介、肖像照等
- **Projects** — 项目列表，点 "+ New" 添加新项目，或点已有项目编辑
- **Media** — 图片库（对应 `images/` 文件夹），可以拖拽上传

每次保存都会自动 commit 到 GitHub。GitHub Pages 1–2 分钟后更新线上网站。

---

## 手动新增项目（不通过 CMS）

如果你想直接写 Markdown：

1. 在 `content/projects/` 里新建一个 `.md` 文件（比如 `13-new-project.md`），照着已有的格式写
2. 提交 + push 后，GitHub Actions 会自动更新 `manifest.js`，网站上会出现新项目

> 不需要手动改 `manifest.js`，也不需要别人要求 CMS 使用者去改 — 都是自动的。

---

## 现在的状态

- ✅ 所有项目数据已经从 `data.js` 拆成 12 个 Markdown 文件
- ✅ 个人简介从 HTML 里拆出来了，存在 `content/site.md`
- ✅ Pages CMS 配置文件 `.pages.yml` 已就位
- ✅ **项目自动扫描**：别人在 CMS 里加项目后， GitHub Actions 会自动重生成 `manifest.js`，不需要手改
- ✅ **"Years licensed" 自动计算**：`site.md` 里填 `licensed_since: 2018`，网页上显示今年 - 2018 的差
- ⚠️ 图片目前还是 Unsplash 链接 — 如果想换成本地图片，把图片放进 `images/`，然后在 CMS 后台或 Markdown 里改成 `images/xxx.jpg` 即可
