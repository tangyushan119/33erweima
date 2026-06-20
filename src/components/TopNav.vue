<script setup lang="ts">
import { ref, computed } from 'vue'
import { QrCode, ClipboardCheck, BarChart3 } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  {
    name: '数据采集',
    icon: QrCode,
    path: '/data-collection/unit-entry',
  },
  {
    name: '数据核实',
    icon: ClipboardCheck,
    path: '/data-verify',
  },
  {
    name: '数据应用',
    icon: BarChart3,
    path: '/data-application',
  },
]

const currentNav = computed(() => {
  const path = route.path
  if (path.startsWith('/data-collection')) return '/data-collection/unit-entry'
  return path
})

const handleNavClick = (path: string) => {
  router.push(path)
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
    <div class="flex items-center justify-between h-full px-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
          <QrCode class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-800">二维码数据采集系统</h1>
          <p class="text-xs text-gray-500">QR Code Data Collection System</p>
        </div>
      </div>
      
      <nav class="flex items-center gap-1">
        <button
          v-for="item in navItems"
          :key="item.path"
          @click="handleNavClick(item.path)"
          class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out"
          :class="[
            currentNav === item.path
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          ]"
        >
          <component :is="item.icon" class="w-4 h-4" />
          <span>{{ item.name }}</span>
        </button>
      </nav>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span class="text-xs text-gray-600">系统运行中</span>
        </div>
      </div>
    </div>
  </header>
</template>
