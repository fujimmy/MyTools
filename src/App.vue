<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Sidebar from './components/Sidebar.vue'
import { useUiStore } from './stores/ui'

const uiStore = useUiStore()
const { isSidebarCollapsed } = storeToRefs(uiStore)
</script>

<template>
  <div class="app-container">
    <div :class="['main-wrapper', { collapsed: isSidebarCollapsed }]">
      <Sidebar />
      <main class="content-area">
        <RouterView />
      </main>
    </div>
  </div>
</template>
