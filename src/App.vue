<script setup lang="ts">
import TopNav from '@/components/TopNav.vue'
import SideMenu from '@/components/SideMenu.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const showSideMenu = () => {
  return route.path.startsWith('/data-collection') || route.path.startsWith('/operation-logs')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <TopNav />
    <SideMenu />
    <main 
      class="pt-16 min-h-screen transition-all duration-300 ease-in-out"
      :class="showSideMenu() ? 'pl-64' : 'pl-0'"
    >
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>
