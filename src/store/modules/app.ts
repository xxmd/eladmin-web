import type { ActionTree, MutationTree } from 'vuex'
export type LayoutSize = 'small' | 'default' | 'large'
export interface AppState { sidebar: { opened: boolean; withoutAnimation: boolean }; device: 'desktop' | 'mobile'; size: LayoutSize }
import Cookies from 'js-cookie'

// Separate native Element Plus preferences from the previous compact theme.
const sizeCookie = 'element-plus-size'

const state: AppState = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? Cookies.get('sidebarStatus') === '1' : true,
    withoutAnimation: false
  },
  device: 'desktop',
  size: (['small', 'default', 'large'].includes(Cookies.get(sizeCookie) || '') ? Cookies.get(sizeCookie) : 'default') as LayoutSize
}

const mutations: MutationTree<AppState> = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', '1')
    } else {
      Cookies.set('sidebarStatus', '0')
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation: boolean) => {
    Cookies.set('sidebarStatus', '0')
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device: AppState['device']) => {
    state.device = device
  },
  SET_SIZE: (state, size: LayoutSize) => {
    state.size = size
    Cookies.set(sizeCookie, size)
  }
}

const actions: ActionTree<AppState, unknown> = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }: { withoutAnimation: boolean }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device: AppState['device']) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size: LayoutSize) {
    commit('SET_SIZE', size)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
