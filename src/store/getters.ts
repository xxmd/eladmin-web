import type { RootState } from './index'
const getters = {
  deployUploadApi: (state: RootState) => state.api.deployUploadApi,
  databaseUploadApi: (state: RootState) => state.api.databaseUploadApi,
  size: (state: RootState) => state.app.size,
  sidebar: (state: RootState) => state.app.sidebar,
  device: (state: RootState) => state.app.device,
  token: (state: RootState) => state.user.token,
  visitedViews: (state: RootState) => state.tagsView.visitedViews,
  cachedViews: (state: RootState) => state.tagsView.cachedViews,
  roles: (state: RootState) => state.user.roles,
  user: (state: RootState) => state.user.user,
  loadMenus: (state: RootState) => state.user.loadMenus,
  permission_routers: (state: RootState) => state.permission.routers,
  addRouters: (state: RootState) => state.permission.addRouters,
  imagesUploadApi: (state: RootState) => state.api.imagesUploadApi,
  baseApi: (state: RootState) => state.api.baseApi,
  fileUploadApi: (state: RootState) => state.api.fileUploadApi,
  updateAvatarApi: (state: RootState) => state.api.updateAvatarApi,
  s3UploadApi: (state: RootState) => state.api.s3UploadApi,
  sqlApi: (state: RootState) => state.api.sqlApi,
  swaggerApi: (state: RootState) => state.api.swaggerApi,
  sidebarRouters: (state: RootState) => state.permission.sidebarRouters
}
export default getters

