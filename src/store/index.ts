import { createStore, useStore as useVuexStore } from 'vuex'
import type { Store } from 'vuex'
import getters from './getters'
import app, { type AppState } from './modules/app'
import api, { type ApiState } from './modules/api'
import settings, { type SettingsState } from './modules/settings'
import tagsView, { type TagsState } from './modules/tagsView'
import permission, { type PermissionState } from './modules/permission'
import user, { type UserState } from './modules/user'
export interface RootState { app: AppState; api: ApiState; settings: SettingsState; tagsView: TagsState; permission: PermissionState; user: UserState }
const store = createStore<RootState>({ modules: { app, api, settings, tagsView, permission, user }, getters })
export function useStore(): Store<RootState> { return useVuexStore<RootState>() }
export default store
