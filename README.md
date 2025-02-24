# 活动组织小助手

## 项目简介
活动组织小助手是一个微信小程序，旨在为用户提供便捷的活动组织和管理平台。用户可以轻松创建活动、邀请好友、管理报名和费用分摊。

## 核心功能（V1.0）

### 1. 用户系统
- 微信一键登录
- 手机号授权登录
- 个人中心
  - 基本信息展示（头像、昵称），若使用微信登录，则展示用户的微信头像及昵称，若使用手机号登录，则展示用户的手机号
  - 我创建的活动列表
  - 我参与的活动列表

### 2. 活动管理
- 活动创建
  - 活动基本信息（标题、时间、地点、描述、活动封面），活动封面支持从相册中选择图片上传，若未上传图片，则自动生成由标题生成的随机图片
  - 人数限制设置
  - 活动类型选择（聚会、运动、聚餐等）
- 活动列表（首页）
  - 活动卡片展示，按照活动创建时间排序，展示活动的标题、时间、地点、活动类型、参与者人数、活动状态（报名中、已结束等）
  - 支持分类筛选
- 活动详情
  - 基本信息展示
  - 参与者列表
  - 活动状态（报名中、已结束等）

### 3. 报名管理
- 活动报名
  - 一键报名
  - 取消报名
- 报名列表
  - 参与者信息展示
  - 报名状态展示

### 4. 费用管理（基础版）
- 活动费用设置
  - 总费用录入
  - AA分摊方式
- 费用明细展示
  - 每人应付金额
  - 支付状态

## 技术栈
- 前端：微信小程序原生开发
- 后端：微信云开发
- 数据库：云开发数据库
- 存储：云存储

## 数据库设计（核心表）

### 用户表(user)
- _id: string
- openid: string
- nickName: string
- avatarUrl: string
- createTime: datetime

### 活动表(activity)
- _id: string
- title: string
- description: string
- type: string
- startTime: datetime
- endTime: datetime
- location: string
- maxParticipants: number
- currentParticipants: number
- creatorId: string
- status: string
- createTime: datetime

### 报名表(enrollment)
- _id: string
- activityId: string
- userId: string
- status: string
- createTime: datetime

### 费用表(payment)
- _id: string
- activityId: string
- totalAmount: number
- perPersonAmount: number
- createTime: datetime

## 项目规划

### 第一阶段（MVP）
1. 用户系统搭建
2. 活动的基础CRUD功能
3. 简单的报名功能
4. 基础的AA收款功能

### 后续规划
1. 活动模板功能
2. 高级费用分摊
3. 活动群聊功能
4. 活动提醒功能
5. 活动评价系统

## 注意事项
1. 本项目使用微信小程序云开发，需要开通云开发功能
2. 首次使用需要在微信开发者工具中配置云开发环境
3. 项目遵循微信小程序的规范和限制

## 开发环境准备
1. 微信开发者工具
2. Node.js 环境
3. 微信小程序云开发环境

## 如何启动
1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 配置云开发环境ID
4. 上传并部署云函数
5. 编译运行