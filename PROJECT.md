# Weight Tracker 项目文档

## 项目概述
减肥追踪 Web App，多页面架构 + Supabase 后端（Auth + PostgreSQL + RLS），Netlify 自动部署。

## 技术栈
- 前端：纯 HTML/CSS/JS（多页面，非 SPA）
- 后端：Supabase（Auth、Database、RLS）
- 图表：Chart.js 4.4.1
- AI：Anthropic API（claude-haiku-4-5-20251001）用于食物热量识别
- 部署：GitHub → Netlify 自动部署
- 开发环境：VS Code + Live Server

## 项目结构
```
weight-tracker/
├── css/
│   └── main.css            # 全局样式
├── js/
│   ├── supabase.js         # Supabase 初始化、Auth 守卫、工具函数
│   ├── db.js               # 所有数据库操作封装
│   └── fooddb.js           # 静态数据（食物库、运动库、饮食模板）
├── index.html              # 登录/注册页
├── dashboard.html          # 概览页（统计、目标、TDEE、体重图表、今日训练）
├── weight.html             # 体重记录页
├── diet.html               # 饮食记录页（AI识别、食物查询、自定义食物、手动记录）
├── training.html           # 训练计划页（运动库、周计划、完成打卡）
├── mealplan.html           # 饮食计划页（模板、周计划、营养目标）
├── supabase_setup.sql      # 数据库建表脚本（仅参考，实际表已建好）
└── project.md              # 本文档
```

## Supabase 数据库表结构

所有表启用 RLS，策略：`auth.uid() = user_id`

### user_profile
| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 自动生成 |
| user_id | uuid (UNIQUE) | 关联 auth.users |
| height | numeric(5,1) | 身高 cm |
| age | integer | 年龄 |
| gender | text | male/female |
| activity | text | 活动系数（如 "1.55"） |
| goal | text | 目标（fast_loss/loss/maintain/gain） |
| start_weight | numeric(5,1) | 起始体重 |
| target_weight | numeric(5,1) | 目标体重 |
| target_date | date | 目标日期 |
| kcal_target | integer | 每日热量目标 |
| protein_target | integer | 蛋白质目标 g |
| carb_target | integer | 碳水目标 g |
| fat_target | integer | 脂肪目标 g |
| updated_at | timestamptz | 更新时间 |

### weights
| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 自动生成 |
| user_id | uuid | 关联 auth.users |
| date | date | 日期 |
| value | numeric(5,1) | 体重 kg |
| note | text | 备注 |
| created_at | timestamptz | 创建时间 |

### diets
| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 自动生成 |
| user_id | uuid | 关联 auth.users |
| date | date | 日期 |
| meal | text | 餐次（早餐/午餐/晚餐/加餐） |
| food | text | 食物名称 |
| kcal | integer | 热量 |
| created_at | timestamptz | 创建时间 |

### workouts
| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 自动生成 |
| user_id | uuid | 关联 auth.users |
| name | text | 训练名称 |
| day | integer | 星期几（1=周一, 7=周日） |
| duration | text | 时长 |
| intensity | text | 强度（低强度/中等/高强度） |
| detail | text | 详情备注 |
| kcal | integer | 消耗热量 |
| created_at | timestamptz | 创建时间 |

### completed_workouts
| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 自动生成 |
| user_id | uuid | 关联 auth.users |
| week_key | text | 周标识（如 "2026-W12"） |
| workout_id | uuid | 关联 workouts.id |
| created_at | timestamptz | 创建时间 |

### meal_plan
| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 自动生成 |
| user_id | uuid | 关联 auth.users |
| date | date | 计划日期 |
| meal_name | text | 餐次 |
| food_name | text | 食物名称 |
| kcal | integer | 热量 |
| protein | numeric(6,1) | 蛋白质 g |
| carb | numeric(6,1) | 碳水 g |
| fat | numeric(6,1) | 脂肪 g |
| created_at | timestamptz | 创建时间 |

### custom_foods
| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 自动生成 |
| user_id | uuid | 关联 auth.users |
| name | text | 食物名称 |
| cat | text | 分类 |
| kcal | integer | 每100g热量 |
| protein | numeric(6,1) | 每100g蛋白质 |
| carb | numeric(6,1) | 每100g碳水 |
| fat | numeric(6,1) | 每100g脂肪 |
| created_at | timestamptz | 创建时间 |

## 开发进度

### Phase 1 — 原型 ✅
- 单文件 index.html（2912行）
- localStorage 存储
- 全部功能原型完成

### Phase 2 — Supabase 基础设施 ✅
- 创建 Supabase 项目
- 建立 7 张表 + RLS 策略
- 注册 Netlify，GitHub 自动部署

### Phase 3 — 多页面迁移 ✅
- 拆分为 10 个文件（css + js模块 + 6个HTML页面）
- 所有数据操作迁移到 Supabase
- Auth 守卫（每页 requireAuth）
- 代码适配实际数据库表结构（UUID主键、独立列）
- 文件清单：
  - [x] css/main.css
  - [x] js/supabase.js
  - [x] js/db.js（适配实际表结构）
  - [x] js/fooddb.js
  - [x] index.html（登录/注册）
  - [x] dashboard.html（概览）
  - [x] weight.html（体重）
  - [x] diet.html（饮食）
  - [x] training.html（训练）
  - [x] mealplan.html（饮食计划）

### Phase 4 — 测试与部署（待开始）
- [ ] 本地 Live Server 测试完整流程
- [ ] 注册账号测试 Auth
- [ ] 各页面 CRUD 功能测试
- [ ] Git commit & push
- [ ] Netlify 部署验证
- [ ] 移动端适配检查

### 未来可能的优化
- 数据导出/导入
- PWA 离线支持
- 体重预测曲线
- 社交分享
- 深色模式