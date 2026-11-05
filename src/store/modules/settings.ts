import type { ActionTree, MutationTree } from 'vuex'
const variables = { theme: '#1890ff' }
import defaultSettings from '@/settings'
const { tagsView, fixedHeader, sidebarLogo, showFooter, footerTxt, caseNumber } = defaultSettings

const state = {
  theme: variables.theme,
  showSettings: false,
  tagsView: tagsView,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  showFooter: showFooter,
  footerTxt: footerTxt,
  caseNumber: caseNumber
}

export type SettingsState = typeof state
export type SettingChange = { [Key in keyof SettingsState]: { key: Key; value: SettingsState[Key] } }[keyof SettingsState]

const mutations: MutationTree<SettingsState> = {
  CHANGE_SETTING: (state, change: SettingChange) => {
    Object.assign(state, { [change.key]: change.value })
  }
}

const actions: ActionTree<SettingsState, unknown> = {
  changeSetting({ commit }, data: SettingChange) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

