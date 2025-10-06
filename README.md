# 智仓云(WMS) - 前端系统

> 智能仓库管理系统前端，基于 Vue 3 + TypeScript + Element Plus 构建

## 项目简介

智仓云(WMS)前端系统是为企业提供智能、高效、可扩展的仓库管理解决方案的前端界面。通过数字化和流程优化，实现库存精准化、作业高效化、决策数据化。

## 技术栈

- **框架**: Vue 3.5+
- **构建工具**: Vite 7+
- **路由管理**: Vue Router
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **CSS 预处理器**: Scss
- **代码校验**: ESLint
- **开发语言**: TypeScript
- **包管理工具**: pnpm

## 功能模块

### 1. 数据看板
- 实时展示仓库运营数据
- 库存预警信息
- 今日作业统计
- 最近活动记录

### 2. 仓库管理
- 仓库信息维护
- 库区库位管理
- 仓库状态监控

### 3. 商品管理
- 商品SKU管理
- 商品信息维护
- 批次和保质期管理

### 4. 库存管理
- 实时库存查询
- 库存调整
- 库存转移
- 库存流水记录

### 5. 入库管理
- 入库单创建和管理
- 收货确认
- 上架任务管理

### 6. 出库管理
- 出库单创建和管理
- 库存分配
- 拣货任务生成
- 发货确认

## 项目结构

```
wms-web/
├── src/
│   ├── common/                 # 通用目录
│   │   ├── apis/              # API接口定义
│   │   │   ├── dashboard/     # 仪表板API
│   │   │   ├── warehouse/     # 仓库管理API
│   │   │   ├── product/       # 商品管理API
│   │   │   ├── inventory/     # 库存管理API
│   │   │   ├── inbound/       # 入库管理API
│   │   │   └── outbound/      # 出库管理API
│   │   ├── components/        # 通用组件
│   │   │   ├── StatusTag/     # 状态标签组件
│   │   │   ├── DataTable/     # 数据表格组件
│   │   │   ├── FormDialog/    # 表单对话框组件
│   │   │   └── StatisticsCard/# 统计卡片组件
│   │   ├── constants/         # 常量定义
│   │   ├── utils/             # 工具函数
│   │   └── assets/            # 静态资源
│   ├── pages/                 # 页面目录
│   │   ├── dashboard/         # 数据看板
│   │   ├── warehouse/         # 仓库管理
│   │   ├── product/           # 商品管理
│   │   ├── inventory/         # 库存管理
│   │   ├── inbound/           # 入库管理
│   │   └── outbound/          # 出库管理
│   ├── router/                # 路由配置
│   ├── pinia/                 # 状态管理
│   ├── http/                  # HTTP请求配置
│   └── layouts/               # 布局组件
├── public/                    # 公共资源
└── types/                     # 类型定义
```

## 开发指南

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

## 后端服务配置

前端系统需要连接到WMS后端服务，默认配置：

- 后端服务地址: `http://localhost:8080`
- API路径前缀: `/api`

### 环境配置

在 `vite.config.ts` 中配置代理：

```typescript
proxy: {
  "/api": {
    target: "http://localhost:8080",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, "/api")
  }
}
```

## API接口规范

### 请求格式

```typescript
// GET请求
GET /api/warehouse?page=1&size=10

// POST请求
POST /api/warehouse
Content-Type: application/json
{
  "name": "仓库名称",
  "code": "WH001"
}
```

### 响应格式

```typescript
// 成功响应
{
  "data": [...],
  "total": 100,
  "code": 200,
  "message": "success"
}

// 错误响应
{
  "code": 400,
  "message": "错误信息"
}
```

## 组件使用示例

### 状态标签组件

```vue
<template>
  <StatusTag :status="1" type="inbound" />
</template>
```

### 数据表格组件

```vue
<template>
  <DataTable
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :total="total"
    :page="page"
    :size="size"
    @page-change="handlePageChange"
    @size-change="handleSizeChange"
  />
</template>
```

### 统计卡片组件

```vue
<template>
  <StatisticsCard
    title="仓库总数"
    :value="10"
    suffix="个"
    icon="el-icon-office-building"
    :trend="{ value: 5, type: 'up' }"
  />
</template>
```

## 开发规范

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件命名使用 PascalCase
- 文件名使用 kebab-case

### 目录规范

- 页面组件放在 `src/pages/` 目录
- 通用组件放在 `src/common/components/` 目录
- API接口定义放在 `src/common/apis/` 目录
- 工具函数放在 `src/common/utils/` 目录

### 提交规范

使用 Git 提交规范：

- `feat`: 新功能
- `fix`: 修复错误
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 部署说明

### 生产环境构建

```bash
pnpm build
```

构建完成后，将 `dist` 目录部署到Web服务器。

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。