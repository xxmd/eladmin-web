import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

export type AppRoute = RouteRecordRaw & { hidden?: boolean; alwaysShow?: boolean }
export const constantRouterMap: AppRoute[] = [
  { path: '/:pathMatch(.*)*', component: () => import('@/views/features/404.vue'), hidden: true },
  { path: '/login', meta: { title: '登录', noCache: true }, component: () => import('@/views/login.vue'), hidden: true },
  { path: '/404', component: () => import('@/views/features/404.vue'), hidden: true },
  { path: '/401', component: () => import('@/views/features/401.vue'), hidden: true },
  { path: '/redirect', component: Layout, hidden: true, children: [
    { path: '/redirect/:path(.*)', component: () => import('@/views/features/redirect.vue') }
  ] },
  { path: '/', component: Layout, redirect: '/dashboard', children: [
    { path: 'dashboard', component: () => import('@/views/home.vue'), name: 'Dashboard', meta: { title: '首页', icon: 'index', affix: true, noCache: true } }
  ] },
  { path: '/user', component: Layout, hidden: true, children: [
    { path: 'center', component: () => import('@/views/system/user/center.vue'), name: '个人中心', meta: { title: '个人中心' } }
  ] }
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRouterMap
})
