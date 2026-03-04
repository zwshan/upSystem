# 遴选学习平台设计文档

## 1. 背景与目标
- 目标产品：个人使用的遴选学习平台（Web）。
- 核心原则：首页最醒目只保留两个核心动作：`刷题`、`复习`。
- 右上角弱化入口：`设置`、`题库管理`、`备份`。

## 2. 约束与范围
- 部署形态：本地运行（非云端），但必须具备备份能力。
- 账号模式：固定单账号（邮箱+密码）。
- 题型特征：主观题为主，复习依赖“参考答案对照 + 自评”。
- 评分体系：`0-5` 六档自评分。
- 题目来源：后台录题 + JSON 导入。

## 3. 总体方案（可拆分单体）
- 技术：`Next.js + TypeScript + SQLite + Prisma`。
- 结构：单仓单体，但严格按 API 边界分层，保证未来可拆分：
  - `src/app` 页面层
  - `src/server/api` 接口层
  - `src/server/domain` 业务层
  - `src/server/repo` 数据访问层
- 迁移路线：未来拆分为前后端分离时，优先迁出 `api/domain/repo`，前端页面保持 API 调用方式不变，仅改 base URL。

## 4. 信息架构与关键页面

### 4.1 首页
- 中央大按钮：`刷题`、`复习`。
- 右上角小入口：`设置`、`题库管理`、`备份`。
- 不展示复杂统计，避免分散注意力。

### 4.2 刷题
- 流程：选择条件 -> 展示题目 -> 作答 -> 查看参考答案 -> 自评 `0-5` -> 写入日志并更新复习计划。
- 记录：`practice_session`、`practice_item_log`、`review_card`。

### 4.3 复习
- 默认拉取到期队列（`due_at <= now`）。
- 评分后立即重算下次复习时间，连续推进下一题。
- 完成后展示简要结果（完成数、平均分、次日预计到期）。

### 4.4 题库管理
- 题库增删改查。
- 录题表单（支持多段材料）。
- JSON 导入（字段映射预览、错误项提示、可跳过错误项）。

### 4.5 设置
- 邮箱/密码维护。
- 刷题默认参数。
- `0-5` 自评标准说明。

### 4.6 备份
- 自动备份状态展示。
- 手动导出 JSON。
- 导入恢复（预检 + 覆盖确认）。

## 5. 数据模型（按用户 JSON 字段优先）

### 5.1 用户与题库
- `user(id, email, password_hash, created_at)`
- `question_bank(id, name, description, created_at)`

### 5.2 题目
- `question`
  - `id`
  - `bank_id`
  - `summary`（题目摘要）
  - `prompt`（题目问题）
  - `score_value`（题目分值）
  - `word_limit`（题目字数要求）
  - `question_type`（题目类型）
  - `tags`（JSON）
  - `created_at`
  - `updated_at`
- `question_material`
  - `id`
  - `question_id`
  - `seq`（顺序）
  - `content`（材料内容）
  - `created_at`
  - `updated_at`

### 5.3 复习与练习
- `review_card`
  - `id, question_id, user_id`
  - `stability, difficulty`
  - `last_score`
  - `due_at`
  - `review_count, lapse_count`
  - `created_at, updated_at`
- `review_log(id, review_card_id, score, reviewed_at, note)`
- `practice_session(id, user_id, mode, started_at, ended_at, duration_sec)`
- `practice_item_log(id, session_id, question_id, self_score, spent_sec, created_at)`

## 6. 复习算法（MVP）
- 方法：艾宾浩斯思路 + 主观题自评分驱动。
- 基础规则：
  - `score 0-1`：遗忘，间隔约 `1天`，`lapse_count + 1`
  - `score 2`：间隔约 `2-3天`
  - `score 3`：间隔约 `5-7天`
  - `score 4`：间隔约 `10-14天`
  - `score 5`：间隔约 `20-30天`
- 队列排序：`due_at` 升序，同到期按 `last_score` 升序。

## 7. 异常处理
- JSON 导入失败：返回到题目级、字段级错误信息。
- 复习队列为空：提示并引导到刷题。
- 备份失败：展示原因（权限/磁盘空间）且不阻塞主功能。
- 一致性：评分日志写入失败时不更新 `due_at`。

## 8. 验收标准（MVP）
- 首页视觉层级满足“刷题/复习”双主入口。
- 主观题完整闭环跑通：作答 -> 参考答案 -> 自评 -> 下次复习更新。
- 多段材料可录入、可导入、可正确展示。
- 自动备份有效，手动导入导出可恢复数据。
- 关键 API 与排程规则有自动化测试覆盖。
