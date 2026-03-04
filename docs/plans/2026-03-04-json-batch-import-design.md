# JSON 批量导入（两步预检）设计稿

## 1. 背景与目标
- 背景：当前后端已支持 `POST /api/questions/import`（`dryRun`、`skipInvalid`），但前端导入弹窗仍是占位壳。
- 目标：在 `/banks` 完成可用的 JSON 批量导入闭环，满足“上传文件 -> 预检 -> 确认导入 -> 列表刷新”。
- 非目标（本阶段不做）：
  - 分片导入/断点续传
  - 错误报告下载
  - 拖拽上传与历史导入记录

## 2. 已确认决策
- 导入入口：仅支持上传 `.json` 文件。
- 导入流程：两步模式（先预检，再确认导入）。
- 预检结果展示：顶部统计 + 下方错误明细。
- 风格：保持当前 VSCode dark + 纯色毛玻璃 + 简洁一致。

## 3. 交互流程
1. 用户在 `/banks` 点击 `导入 JSON` 打开导入弹窗。
2. 选择本地 `.json` 文件，前端读取并解析。
3. 点击 `开始预检`：调用导入接口（`dryRun=true`）。
4. 弹窗显示预检报告：
   - 总数（文件题目数）
   - 可导入数（`validCount`）
   - 错误数（`errorCount`）
   - 错误明细（`index + message`）
5. 点击 `确认导入`：调用导入接口（`dryRun=false`）。
6. 导入完成后显示结果摘要（`已导入 X 条，跳过 Y 条`），关闭弹窗并刷新列表。

## 4. 数据流与接口契约
### 4.1 前端请求
- 预检请求：
  - `POST /api/questions/import`
  - body: `{ bankId, items, dryRun: true, skipInvalid: true }`
- 正式导入请求：
  - `POST /api/questions/import`
  - body: `{ bankId, items, dryRun: false, skipInvalid: true }`

### 4.2 响应字段（复用现有）
- `importedCount`
- `importedIds[]`
- `validCount`
- `skippedCount`
- `errorCount`
- `errors[]`（`{ index, message }`）
- `dryRun`

### 4.3 页面联动
- `ImportModal` 增加 `onImported` 回调。
- `/banks` 在回调中执行 `loadQuestions(activeBankId)` 完成刷新。

## 5. 状态机（前端）
- `idle`：未选文件。
- `fileSelected`：已选文件，等待预检。
- `previewing`：预检中。
- `previewReady`：预检完成，可确认导入。
- `importing`：导入中。
- `done`：导入结束（成功/部分成功）。
- `error`：本地解析错误或接口请求失败。

关键约束：
- 未选文件时 `开始预检` 禁用。
- 未完成预检时 `确认导入` 禁用。
- `previewing/importing` 时禁用重复提交。

## 6. 异常处理
- 非 `.json` 文件：提示“仅支持 JSON 文件”。
- JSON 解析失败：提示“JSON 解析失败”。
- 根结构非法：提示“导入文件必须是题目数组”。
- 预检/导入接口失败：优先展示后端 `message`，否则“导入失败，请重试”。

## 7. 可测试验收标准
1. 上传合法 JSON 后，能看到预检统计和错误明细。
2. 点击确认导入后，显示导入结果并刷新 `/banks` 列表。
3. `skipInvalid=true` 下，错误项不阻断合法项导入。
4. 按钮禁用状态与请求阶段一致（防重复提交）。
5. 深色毛玻璃风格与当前项目一致。

## 8. 风险与后续
- 风险：超大 JSON 文件在浏览器解析会有卡顿。
- 后续演进（第二阶段）：
  - 错误明细筛选/下载
  - 导入历史
  - 分片导入与进度条
