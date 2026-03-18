# Weight Tracker 项目文档

## 项目简介
减肥追踪网站，支持多用户注册登录，功能包括：体重记录、饮食记录、训练计划、
饮食计划、食物热量查询、AI外卖热量识别、TDEE每日营养估算。

## 技术栈
- 前端：原生 HTML/CSS/JavaScript（单文件）
- 数据库 + 认证：Supabase
- 托管：Netlify（待配置）
- 域名：davidzhou.blog（Wix DNS，待指向 Netlify）

## Supabase 信息
- 项目名：weight-tracker
- 项目 URL：https://ujewutykcoxcqprhqaxc.supabase.co
- 数据库 Region：West US (Oregon)

## 数据库表
weights / diets / workouts / completed_workouts / meal_plan / custom_foods / user_profile
全部已开启 RLS，每个用户只能读写自己的数据。

## 当前进度
- [x] 第一阶段：Supabase 建库 + RLS 完成
- [ ] 第二阶段：GitHub 仓库 + Netlify 部署
- [ ] 第三阶段：代码改造（localStorage → Supabase + 登录注册）
- [ ] 第四阶段：绑定域名 davidzhou.blog

## 待做事项
- 把现有 HTML 文件上传到 GitHub
- 连接 Netlify 自动部署
- 代码加入 Supabase JS 客户端
- 加登录/注册页面
- 所有 localStorage 替换为 Supabase API 调用
