<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Bars3Icon, ChevronDownIcon, ChevronUpIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { useUiStore } from '../stores/ui'

interface NavItem {
  id: number
  icon: string
  text: string
  path?: string
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { id: 1, icon: '🏠', text: '主控台', path: '/' },
  {
    id: 2,
    icon: '🤖',
    text: '我的工具',
    children: [
      { id: 21, icon: '🔑', text: 'Base64', path: '/tools/base64' },
      { id: 22, icon: '📄', text: 'JSON Formatter', path: '/tools/json-formatter' },
      { id: 23, icon: '🖥️', text: 'HTML Previewer', path: '/tools/html-previewer' },
      { id: 24, icon: '📜', text: 'Markdown Previewer', path: '/tools/markdown-previewer' },
      { id: 25, icon: '📱', text: 'QRCode Previewer', path: '/tools/qrious' },
      { id: 26, icon: '🔐', text: 'JWT Decoder', path: '/tools/jwt-decoder' },
    ],
  },
  { id: 3, icon: '💾', text: '存檔歷史', path: '/history' },
]

const route = useRoute()
const uiStore = useUiStore()
const { isSidebarCollapsed } = storeToRefs(uiStore)
const expandedItemIds = ref<number[]>([2])
const appVersion = __APP_VERSION__

const toggleSidebar = () => {
  uiStore.toggleSidebar()
}

const itemHasActiveChild = (item: NavItem) => {
  if (!item.children) {
    return false
  }

  return item.children.some((child) => route.path === child.path)
}

const isExpanded = (itemId: number) => expandedItemIds.value.includes(itemId)

const toggleExpanded = (itemId: number) => {
  if (isExpanded(itemId)) {
    expandedItemIds.value = expandedItemIds.value.filter((id) => id !== itemId)
    return
  }

  expandedItemIds.value = [...expandedItemIds.value, itemId]
}

const navContainerClass = computed(() => ['sidebar', { collapsed: isSidebarCollapsed.value }])
</script>

<template>
  <nav :class="navContainerClass">
    <div class="sidebar-header">
      <button class="toggle-button" @click="toggleSidebar" type="button" aria-label="切換側邊欄">
        <Bars3Icon style="width: 20px; height: 20px" />
      </button>
    </div>

    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.id" class="nav-item">
        <RouterLink
          v-if="item.path"
          :to="item.path"
          class="nav-link-content"
          active-class="active"
          :class="{ active: itemHasActiveChild(item) }"
          :exact-active-class="item.path === '/' ? 'active' : ''"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="text">{{ item.text }}</span>
        </RouterLink>

        <div
          v-else
          class="nav-link-content"
          :class="{ active: itemHasActiveChild(item) }"
          @click="toggleExpanded(item.id)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="text">{{ item.text }}</span>
          <span v-if="item.children && !isSidebarCollapsed" class="submenu-toggle">
            <ChevronUpIcon v-if="isExpanded(item.id)" style="width: 16px; height: 16px" />
            <ChevronDownIcon v-else style="width: 16px; height: 16px" />
          </span>
        </div>

        <ul v-if="item.children && isExpanded(item.id)" class="sub-menu">
          <li v-for="child in item.children" :key="child.id" class="nav-item sub-item">
            <RouterLink
              :to="child.path || '/'"
              class="nav-link-content sub-link"
              active-class="active"
            >
              <span class="icon">{{ child.icon }}</span>
              <span class="text">{{ child.text }}</span>
            </RouterLink>
          </li>
        </ul>
      </li>
    </ul>

    <div class="sidebar-footer">
      <span v-if="!isSidebarCollapsed">版本 {{ appVersion }}</span>
      <a
        href="https://github.com/fujimmy/MyTools/issues"
        target="_blank"
        rel="noopener noreferrer"
        class="issue-button"
        title="回報問題"
        data-testid="issue-report-button"
      >
        <ExclamationCircleIcon style="width: 20px; height: 20px" />
        <span v-if="!isSidebarCollapsed">回報 Issue</span>
      </a>
    </div>
  </nav>
</template>
