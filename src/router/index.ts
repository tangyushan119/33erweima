import { createRouter, createWebHistory } from 'vue-router'
import UnitEntry from '@/pages/UnitEntry.vue'
import DataVerify from '@/pages/DataVerify.vue'
import DataApplication from '@/pages/DataApplication.vue'

const routes = [
  {
    path: '/',
    redirect: '/data-collection/unit-entry',
  },
  {
    path: '/data-collection',
    redirect: '/data-collection/unit-entry',
  },
  {
    path: '/data-collection/unit-entry',
    name: 'unitEntry',
    component: UnitEntry,
  },
  {
    path: '/data-verify',
    name: 'dataVerify',
    component: DataVerify,
  },
  {
    path: '/data-application',
    name: 'dataApplication',
    component: DataApplication,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
