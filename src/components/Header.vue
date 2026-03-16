<script setup lang="ts">
defineProps<{
  toggleSidebar: () => void
}>()
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button class="toggle-button" @click="toggleSidebar">▶</button>
      <span class="logo-text">工作工具網站</span>
    </div>
    <div class="header-right">
      <span>👤 User Profile</span>
    </div>
  </header>
</template>
