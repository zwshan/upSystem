# 本地启动与备份运行手册

## 1. 初始化
```bash
npm install
npm run prisma:generate
npm run prisma:push
```

## 2. 启动服务
```bash
npm run dev
```
访问：`http://localhost:3000`

## 3. 测试
```bash
npm run typecheck
npm run test
npm run e2e -- tests/e2e/happy-path.spec.ts
npm run e2e -- tests/e2e/question-management-flow.spec.ts
npm run e2e -- tests/e2e/practice-flow.spec.ts
```

## 4. 备份操作
- 手动导出：`POST /api/backup/export`
- 查看状态：`GET /api/backup/status`
- 导入恢复：`POST /api/backup/import`（支持传 `fileName` 或完整 `snapshot`）

## 5. 备份目录
- 默认目录：`<project-root>/backups`
- 文件命名：`backup-YYYY-MM-DD-HH-mm-ss.json`

## 6. 题目管理操作
- 进入：右上角 `题库管理`
- 录题：点击 `新建题目` 进入全屏编辑页，填写摘要/材料/问题/分值/字数要求/题型后点击 `保存`
- 保存结果：屏幕中间出现 `已保存` 提示（约 1.2 秒自动消失），页面保持在当前编辑页
- 导入：点击 `导入 JSON`，上传 `.json` 文件后先 `开始预检`，确认无误再点 `确认导入`
- 批量：勾选列表后启用 `批量删除`，点击后会调用 `POST /api/questions/batch-delete`
- 编辑：点击列表行内 `编辑` 进入全屏编辑页，修改后 `保存` 即落库
- 防误关：有未保存修改时，点击 `返回题库` 会弹确认框
- 题型：可直接输入已有题型，也可用 `新增题型` 写入字典

## 7. 刷题操作
- 首页点击 `刷题` 进入 `/practice`
- 先选 `题库` 和 `题型`，点击 `开始刷题`
- 左侧为题目区（材料、问题、参考答案、自评分），右侧为真格子纸
- 格子纸规格：每页 `24x25`，支持整段粘贴、自动翻页、手动增页
- 自评提交后回到筛选区，筛选条件保留，当前题草稿自动清理
- 单用户模式：系统会自动创建本地用户（默认 `local@tuanyuan.app`，可配 `LOCAL_USER_EMAIL`）
