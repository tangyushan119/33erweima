<script setup lang="ts">
import { computed } from 'vue'
import { Building2, FileText, Car, Wrench, Users, Droplets } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const sideMenuItems = [
  {
    name: '单位录入',
    icon: Building2,
    path: '/data-collection/unit-entry',
  },
  {
    name: '车辆录入',
    icon: Car,
    path: '/data-collection/vehicle-entry',
  },
  {
    name: '装备录入',
    icon: Wrench,
    path: '/data-collection/equipment-entry',
  },
  {
    name: '人员录入',
    icon: Users,
    path: '/data-collection/personnel-entry',
  },
  {
    name: '消火栓录入',
    icon: Droplets,
    path: '/data-collection/firehydrant-entry',
  },
  {
    name: '操作日志',
    icon: FileText,
    path: '/operation-logs',
  },
]

const isActive = computed(() => {
  const path = route.path
  return path.startsWith('/data-collection') || path.startsWith('/operation-logs')
})

const handleMenuClick = (path: string) => {
  router.push(path)
}
</script>

<template>
  <aside 
    class="fixed left-0 top-16 bottom-0 w-64 bg-gray-50 border-r border-gray-200 z-40 transition-all duration-300 ease-in-out"
    :class="[isActive ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0']"
  >
    <div class="h-full flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">数据采集</h2>
      </div>
      
      <nav class="flex-1 p-2">
        <ul class="space-y-1">
          <li v-for="item in sideMenuItems" :key="item.path">
            <button
              @click="handleMenuClick(item.path)"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out"
              :class="[
                route.path === item.path
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.name }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-200">
        <div class="bg-blue-50 rounded-lg p-3">
          <p class="text-xs text-blue-600 font-medium mb-1">快捷操作</p>
          <p class="text-xs text-blue-500">点击单位或车辆录入开始采集数据</p>
        </div>
      </div>
    </div>
  </aside>
</template>
