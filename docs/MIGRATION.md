# dev-ts 迁移记录

## 已落地

- 原 Vue CLI 3 / Webpack 4 构建替换为 Vite 8；入口、别名、代理、环境变量、SVG 资源与动态导入完成迁移。
- 使用原生 Vue 3，未引入 `@vue/compat`。全量页面完成 Vue 3 插槽、生命周期、弹窗、分页和组件绑定适配。
- Element UI 替换为 Element Plus；主题颜色使用本地 CSS 变量，图标使用 SVG。采用 Element Plus 原生尺寸，默认 `Default`，支持全局切换 Small / Default / Large；移除旧版尺寸覆盖和页面固定的 small 设置。
- 修复菜单折叠、TagsView、导航栏及按钮排列等迁移布局问题；用户部门选择改为 Element Plus TreeSelect，支持懒加载和编辑回显。
- 路由升级到 Router 4；后端动态菜单由 `import.meta.glob` 映射。菜单加载失败会退出本地登录状态并回到登录页，避免导航悬挂。
- Vuex 升级为 4，保留已有模块接口；所有 Vuex 模块、RootState 和 getters 已迁移为 TS。
- 请求、身份验证、登录页、登录和岗位接口、字典核心、路由、权限、上传以及日期/主题/编辑器等公共模块已迁移为 TS。
- 岗位管理使用 `useCrud<Row, Form, Query>` 和 `useDict`，覆盖查询、分页、增删改、状态切换、导出和列显隐。
- 其余 CRUD 页面继续使用适配 Vue 3 的公共 mixin；响应式状态改为 `reactive`，移除实例事件总线，列显隐改为模板条件渲染。
- 树选择器、头像上传、图表、富文本和 Markdown 编辑器使用 Vue 3 兼容实现。旧邮件编辑器复用新的 WangEditor 组件。
- ESLint、Vitest、Playwright 与严格 TS 检查已接入；生产构建先执行类型检查。

## TS 覆盖范围

2026-11-05 完成前端应用源码的全量 TS 迁移：`src` 下不再保留 JS 文件，所有 Vue 脚本均使用 `lang="ts"`。`allowJs` 已关闭、`strict` 保持开启，未使用 `@ts-ignore`、`@ts-nocheck` 或显式 `any` 跳过检查。

- 所有 API、Vuex 模块、工具函数、布局和业务页面纳入检查；业务模型集中在 `src/types`。
- 共享 CRUD 使用 `CrudController<Row, Form, Query>` 和 `crudBindings`。页面显式指定行与表单类型；父子组件通过有类型的引用或 props/emits 交互。
- 第二个旧 mixin 转为泛型分页列表 mixin，服务于个人日志、任务日志、部署还原和代码生成配置。删除没有调用方的旧增删改分支。
- 补全树节点、文件上传、弹窗、图表及编辑器引用类型；部署表单将选择项 ID 与接口对象分开。部署上传组件清理无调用方的编辑逻辑，并在卸载时关闭 WebSocket。
- 第三方库没有可解析声明时，为实际使用的 API 添加局部声明。Vue 泛型响应式解包和旧式动态 hook 的类型转换集中在 CRUD 适配边界。

TypeScript 检查不等于运行时响应校验。懒加载表格仍使用 Element Plus 的 `store.states` 适配，组件库升级时需回归树形选择；部分图表仍有兼容的旧式配置和弃用提示，大型图表、编辑器依赖仍会触发构建体积提示。

## 验证

2026-11-05 统一验证通过：类型检查、Lint、生产构建、23 项单元测试、8 项 Playwright 浏览器回归。浏览器回归以生产产物和模拟接口运行。

- `npm run typecheck`：全部前端源码的严格检查。
- `npm run lint`：全部前端源码。
- `npm run test:unit`：请求解包、鉴权头、下载、网络错误、服务端消息；CRUD 分页、查询竞争、表单隔离、错误恢复；动态菜单层级与组件解析。
- `npm run test:e2e`：运行生产产物，模拟后端，覆盖登录和动态导航、岗位增删改、查询序列化、只读权限、菜单错误回退、共享 CRUD 的表单校验、提交、重置、字典父子关联和列显隐，以及系统、监控、运维、工具和编辑器等页面加载。

浏览器测试不等同真实后端联调。正式发布前仍需连接目标后端核验树节点懒加载、文件上传下载、头像裁剪、部署 WebSocket、邮件/支付配置与代码生成结果。

后端 `eladmin-generator/src/main/resources/template/front/` 的生成模板属于另一个仓库，本分支没有修改；其中仍使用 Vue 2 风格的生成代码，需要在使用生成结果前同步迁移模板。
