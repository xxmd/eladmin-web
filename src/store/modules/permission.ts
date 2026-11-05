import type { Module } from 'vuex'
import type { AppRoute } from '@/router/routers'
export interface PermissionState { routers: AppRoute[]; addRouters: AppRoute[]; sidebarRouters: AppRoute[] }
import { constantRouterMap } from '@/router/routers'

const permission: Module<PermissionState, unknown> = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    sidebarRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers: AppRoute[]) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    SET_SIDEBAR_ROUTERS: (state, routers: AppRoute[]) => {
      state.sidebarRouters = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, asyncRouter: AppRoute[]) {
      commit('SET_ROUTERS', asyncRouter)
    },
    SetSidebarRouters({ commit }, sidebarRouter: AppRoute[]) {
      commit('SET_SIDEBAR_ROUTERS', sidebarRouter)
    }
  }
}

export default permission
