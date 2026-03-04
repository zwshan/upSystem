# 团圆学习平台

本地优先的主观题学习系统，核心入口为 `刷题` 和 `复习`，右上角提供 `设置 / 题库管理 / 备份`。

## 快速开始
```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

打开 `http://localhost:3000`

## 常用命令
```bash
npm run typecheck
npm run test
npm run e2e
```

## 题目管理（当前可用）
- 路由：`/banks`
- 能力：
  - 列表优先界面（搜索框、列表、批量工具栏）
  - 题库选择（无题库时自动创建默认题库）
  - 新建页：`/banks/new`（全屏整页编辑，`POST /api/questions`）
  - 编辑页：`/banks/:id/edit`（全屏整页编辑，`GET/PATCH /api/questions/:id`）
  - 保存成功显示屏幕居中提示“已保存”（约 1.2 秒自动消失）
  - 未保存修改离开确认
  - 题型下拉建议 + 自定义题型新增
  - 题目材料单文本框输入（按空行切分为多段材料）
  - JSON 导入两步流程：上传文件 -> 预检统计+错误明细 -> 确认导入并刷新列表
  - 批量删除真实落库（`POST /api/questions/batch-delete`）
- 相关 API：
  - `GET/POST /api/banks`
  - `POST /api/questions`
  - `GET /api/questions/list`
  - `GET/PATCH/DELETE /api/questions/:id`
  - `POST /api/questions/import`
  - `POST /api/questions/batch-update`
  - `POST /api/questions/batch-delete`
  - `GET/POST /api/question-types`

## 刷题（当前可用）
- 路由：`/practice`
- 流程：
  - 先筛选（题库 + 题型），再点 `开始刷题`
  - 进入左题右纸界面：左侧题目信息与自评，右侧真格子纸
  - 支持先 `显示参考答案`，再 `0-5 分` 自评提交
  - 提交后回到筛选区，并保留筛选条件
- 右侧格子纸：
  - 每页固定 `24 行 * 25 格`
  - 支持整段粘贴，写满自动翻到新页
  - 支持 `上一页/下一页/新增页`
  - 草稿按 `draft:{questionId}` 自动本地保存，提交后自动清理
- 相关 API：
  - `GET /api/practice/next`
  - `POST /api/practice/submit`

## 本地单用户说明
- 刷题提交依赖用户身份，当前默认自动创建/复用本地单用户。
- 默认邮箱：`local@tuanyuan.app`
- 可通过环境变量覆盖：`LOCAL_USER_EMAIL`

## 目录结构
- `src/app`：页面与 API 路由
- `src/server/domain`：核心业务逻辑
- `src/server/repo`：数据访问封装
- `prisma/schema.prisma`：数据库模型
- `docs/plans`：设计与实施计划
- `docs/runbooks`：运行手册
