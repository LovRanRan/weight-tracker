# Weight Tracker 项目文档

## 项目简介
减肥追踪网站，支持多用户注册登录，功能包括：体重记录、饮食记录、训练计划、
饮食计划、食物热量查询、AI外卖热量识别、TDEE每日营养估算。

## 技术栈
- 前端：原生 HTML/CSS/JavaScript（单文件 index.html）
- 数据库 + 认证：Supabase
- 托管：Netlify（已上线 https://myweightlog.netlify.app）
- 域名：davidzhou.blog（待配置）

## Supabase 信息
- 项目 URL：https://ujewutykcoxcqprhqaxc.supabase.co
- Anon Key：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZXd1dHlrY294Y3FwcmhxYXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjY1ODgsImV4cCI6MjA4OTQ0MjU4OH0.bnmrdsyI_rbPAnxbJ5vhyxSvV9aBl8sh4P_IGHSf0xU

## 数据库表（全部已开启 RLS）
weights / diets / workouts / completed_workouts / meal_plan / custom_foods / user_profile

## 部署信息
- GitHub：https://github.com/LovRanRan/weight-tracker
- Netlify：https://myweightlog.netlify.app（已连接 GitHub 自动部署）
- 更新方式：修改 index.html → push 到 GitHub → Netlify 自动更新

## 当前进度
- [x] 第一阶段：Supabase 建库 + RLS 完成
- [x] 第二阶段：GitHub + Netlify 部署完成
- [ ] 第三阶段：代码改造（localStorage → Supabase + 登录注册）
- [ ] 第四阶段：绑定域名 davidzhou.blog

## 第三阶段待做
- index.html 加入 Supabase JS 客户端
- 加登录/注册页面
- 所有 localStorage 替换为 Supabase API 调用
- 加用户 session 管理（未登录跳转到登录页）
