# ELADMIN-WEB

ELADMIN 前端源码

#### 项目源码

|     |   后端源码  |   前端源码  |
|---  |--- | --- |
|  github   |  https://github.com/elunez/eladmin   |  https://github.com/elunez/eladmin-web   |
|  码云   |  https://gitee.com/elunez/eladmin   |  https://gitee.com/elunez/eladmin-web   |

#### 开发文档
[https://eladmin.vip](https://eladmin.vip)

#### 体验地址
[https://eladmin.vip/demo](https://eladmin.vip/demo)

#### 前端模板

初始模板基于： [https://github.com/PanJiaChen/vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)

模板文档： [https://panjiachen.github.io/vue-element-admin-site/zh/guide/](https://panjiachen.github.io/vue-element-admin-site/zh/guide/)

#### VPS推荐
<a href="https://bwh81.net/aff.php?aff=70876" target="_blank">
<img src="https://eladmin.vip/images/banner/side.jpeg" style="width: 435px;border-radius: 2px;">
</a>

使用优惠码: `BWHCGLUKKB`，可获得 6.81% 的折扣， [查看介绍](https://bwhstock.in/)

#### 开发与构建（dev-ts）

当前使用 Vite 8、Vue 3.5、Element Plus 2、Vue Router 4、Vuex 4 和 TypeScript 5.9。
需要 Node.js 22.12 或更高版本。依赖版本由 `package-lock.json` 固定。

```bash
npm ci
npm run dev        # http://127.0.0.1:8013
npm run typecheck  # 检查已迁移的 TS / Vue TS 模块
npm run lint
npm run test:unit
npm run build:prod
npm run preview
npm run test:e2e   # 先构建，再用 Playwright 检查生产产物
```

Windows 浏览器测试默认使用本机 Edge；其他平台先运行 `npx playwright install chromium`。
测试使用模拟接口，不会修改真实后端数据。

环境变量已从 `VUE_APP_*` 改为 `VITE_*`：

- `VITE_BASE_API`：后端 HTTP 地址。开发时 `/api`、`/auth` 等请求由 Vite 代理。
- `VITE_WS_API`：WebSocket 地址，`/` 表示使用当前站点的 ws/wss 地址。
- 生产环境可在 `.env.production.local` 设置这两个变量。原有生产地址保留在 `.env.production`。
- 使用同域反向代理时，两者均设为 `/`，并在 Nginx 配置 `/api`、`/auth`、文件和 WebSocket 的转发。
- Router 使用 history 模式，静态站点需配置 `try_files $uri $uri/ /index.html`。

详细迁移范围与回归要求见 [迁移记录](docs/MIGRATION.md)。

#### 特别鸣谢

- 感谢 [JetBrains](https://www.jetbrains.com/) 提供的非商业开源软件开发授权

- 感谢 [PanJiaChen](https://github.com/PanJiaChen/vue-element-admin) 大佬提供的前端模板

- 感谢 [Moxun](https://github.com/moxun1639) 大佬提供的前端 Crud 通用组件

- 感谢 [zhy6599](https://gitee.com/zhy6599) 大佬提供的后端运维管理相关功能

- 感谢 [j.yao.SUSE](https://github.com/everhopingandwaiting) 大佬提供的匿名接口与Redis限流等功能

- 感谢 [d15801543974](https://github.com/d15801543974) 大佬提供的基于注解的通用查询方式

#### 反馈交流

- QQ交流群：891137268 、947578238、659622532
