# 遴选考试复习系统 (upSystem) 设计文档

## 概述

为四川省遴选考试备考设计的本地版复习系统。前后端分离架构，苹果风格UI，支持仿真答题、题目管理、艾宾浩斯复习、统计分析等功能。

## 技术栈

- **后端**: Python + FastAPI + SQLAlchemy + SQLite
- **前端**: Vue 3 + Vite + TailwindCSS + Pinia
- **图表**: ECharts 或 Chart.js
- **备份**: Git自动备份

## 项目结构

```
upSystem/
├── backend/
│   ├── main.py              # FastAPI入口，CORS配置
│   ├── models.py            # SQLAlchemy数据模型
│   ├── database.py          # 数据库连接配置
│   ├── routers/
│   │   ├── questions.py     # 题目管理CRUD + JSON导入导出
│   │   ├── exams.py         # 套卷管理 + 答题相关
│   │   ├── answers.py       # 作答记录 + 自评反思
│   │   ├── review.py        # 艾宾浩斯复习系统
│   │   ├── notes.py         # 知识点笔记CRUD
│   │   ├── stats.py         # 统计数据API
│   │   ├── countdown.py     # 考试倒计时CRUD
│   │   └── backup.py        # 备份管理
│   ├── services/
│   │   ├── review_scheduler.py  # SM-2复习算法
│   │   └── backup_service.py    # Git备份逻辑
│   └── data/
│       └── upsystem.db
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── Dashboard.vue        # 首页：倒计时 + 今日待复习 + 快捷入口
│   │   │   ├── ExamSimulation.vue   # 套题仿真答题
│   │   │   ├── TargetedPractice.vue # 专项练习
│   │   │   ├── AnswerSheet.vue      # 答题界面（左材料右格子纸）
│   │   │   ├── QuestionManager.vue  # 题目管理
│   │   │   ├── ReviewCenter.vue     # 艾宾浩斯复习中心
│   │   │   ├── NoteManager.vue      # 知识点笔记管理
│   │   │   ├── Statistics.vue       # 统计看板
│   │   │   └── Settings.vue         # 设置（备份、倒计时管理）
│   │   ├── components/
│   │   │   ├── GridPaper.vue        # 格子纸核心组件
│   │   │   ├── Timer.vue            # 计时器组件
│   │   │   ├── CountdownCard.vue    # 倒计时卡片
│   │   │   ├── ReviewCard.vue       # 复习卡片
│   │   │   └── ...
│   │   ├── stores/
│   │   │   ├── exam.js              # 答题状态管理
│   │   │   ├── review.js            # 复习状态
│   │   │   └── app.js               # 全局状态
│   │   └── styles/
│   │       └── apple-theme.css      # 苹果风格主题变量
│   └── ...
├── start.sh                 # 一键启动前后端
└── docs/plans/
```

## 数据模型

### Exam（套卷）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| title | TEXT | 套卷标题，如"2025年四川省直遴选" |
| year | INTEGER | 年份 |
| source | TEXT | 来源：省直/市属/区县/模拟 |
| total_time_minutes | INTEGER | 考试总时长（分钟） |
| material_text | TEXT | 套卷公共材料（Markdown） |
| created_at | DATETIME | 创建时间 |

### Question（题目）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| exam_id | INTEGER FK NULL | 所属套卷ID（专项题为空） |
| category | TEXT | 一级题型：案例分析/公文写作/策论文 |
| sub_type | TEXT NULL | 二级子题型：归纳概括/对策建议/讲话稿/报告等 |
| prompt | TEXT | 题目要求 |
| word_limit | INTEGER | 字数限制 |
| score | INTEGER | 分值 |
| material_text | TEXT NULL | 单题材料（专项题或题目独立材料） |
| order_num | INTEGER | 题目在套卷中的顺序 |
| created_at | DATETIME | 创建时间 |

### Answer（作答记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| question_id | INTEGER FK | 关联题目 |
| exam_session_id | INTEGER FK NULL | 套题仿真的会话ID |
| content | TEXT | 作答文字内容 |
| time_spent_seconds | INTEGER | 答题用时（秒） |
| mode | TEXT | 套题仿真/专项练习 |
| self_score | REAL NULL | 自评分 |
| reflection | TEXT NULL | 反思笔记 |
| created_at | DATETIME | 作答时间 |

### ExamSession（套题仿真会话）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| exam_id | INTEGER FK | 关联套卷 |
| total_time_spent | INTEGER | 总用时（秒） |
| status | TEXT | 进行中/已完成 |
| created_at | DATETIME | 开始时间 |

### ReviewItem（艾宾浩斯复习项）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| type | TEXT | question/note |
| reference_id | INTEGER | 关联题目ID或笔记ID |
| next_review_at | DATETIME | 下次复习时间 |
| review_count | INTEGER | 已复习次数 |
| ease_factor | REAL | 难度因子，默认2.5 |
| last_reviewed_at | DATETIME NULL | 上次复习时间 |
| created_at | DATETIME | 加入复习队列时间 |

### Note（知识点笔记）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| title | TEXT | 标题 |
| content | TEXT | 内容（Markdown） |
| tags | TEXT | 标签（JSON数组） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### ExamCountdown（考试倒计时）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| name | TEXT | 考试名称 |
| target_date | DATE | 目标日期 |
| is_active | BOOLEAN | 是否激活 |

## 核心模块设计

### 1. 仿真答题系统

#### 套题仿真模式

- **布局**: 左右分栏（左40%材料 + 右60%格子纸）
- **顶部工具栏**: 全局倒计时 | 当前题号/总题数 | 单题用时 | 上下题切换 | 交卷
- **流程**: 选择套卷 → 阅读材料 → 逐题作答 → 交卷 → 逐题自评+反思
- **计时**: 全局倒计时（总时长）+ 每题用时实时记录

#### 专项练习模式

- **入口**: 选择一级题型 → 可进一步选二级子题型
- **布局**: 同套题仿真，但无全局倒计时
- **计时**: 仅单题计时
- **流程**: 选题型 → 随机抽题或手动选题 → 作答 → 自评+反思

#### 格子纸组件 (GridPaper.vue)

- 25列 × 24行 CSS Grid
- 每格一个字符，通过隐藏textarea捕获键盘输入
- 光标自动前进，支持退格、方向键
- 标点符号不出现在行首（自动调整）
- 多页翻页：格子纸张数 = ceil(word_limit / 600)
- 实时字数统计
- 视觉风格：浅灰格线，纸张质感

### 2. 题目管理系统

- 题目列表：按年份、来源、题型筛选排序
- 新增/编辑表单：分类、子题型、材料、要求、字数、分值
- 套卷管理：创建套卷 → 填写材料 → 添加多个题目
- JSON批量导入/导出

#### JSON导入格式

```json
{
  "year": 2025,
  "source": "四川省直",
  "total_time_minutes": 150,
  "material": "材料正文...",
  "questions": [
    {
      "category": "案例分析",
      "sub_type": "归纳概括",
      "prompt": "结合材料，概括A市城市社区嵌入式服务设施建设的做法",
      "word_limit": 300,
      "score": 20
    }
  ]
}
```

### 3. 艾宾浩斯遗忘曲线复习系统

#### 复习内容

- **题目卡片**: 答完题后自动加入复习队列
- **知识点卡片**: 手动创建，Markdown格式

#### 复习算法（简化SM-2）

```
复习间隔: 1天 → 3天 → 7天 → 15天 → 30天 → 之后 × ease_factor
```

每次复习后自评记忆程度（1-5分）：
- 1-2分: 重置为第1次，ease_factor下调
- 3分: 保持当前间隔
- 4-5分: 进入下一间隔，ease_factor上调

#### 界面

- **复习主页**: 今日待复习数量 + 逾期数量 + 复习日历热力图
- **复习流程**: 显示卡片正面 → 回忆 → 查看背面 → 自评 → 自动排期

### 4. 统计看板

- **总览**: 总练习题数、总练习时间、本周/本月练习量
- **题型统计**: 各题型练习量、平均用时、平均自评分（柱状图/雷达图）
- **趋势图**: 每周练习量、自评分变化趋势（折线图）
- **套卷成绩**: 历次套卷总分对比

### 5. 考试倒计时

- 首页卡片展示：考试名称 + 倒计时天数（大字体）+ 目标日期
- 支持多个倒计时，新增/编辑/删除/归档

### 6. 数据备份（Git自动备份）

- 后端定时任务：退出时或每小时将SQLite导出为JSON
- 自动执行 git add + commit + push
- 前端提供手动备份按钮 + 从备份恢复
- JSON格式导出，可读性好，便于灾难恢复

## UI风格

苹果风格设计系统：
- 圆角卡片、毛玻璃效果、柔和阴影
- SF Pro风格字体（系统字体栈）
- 蓝色主色调，浅灰背景
- 大量留白，清晰的信息层级
- 平滑过渡动画
