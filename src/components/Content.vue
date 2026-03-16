<script setup lang="ts">
interface ToolCard {
  id: string
  name: string
  icon: string
  path: string
  description: string
  category: string
}

const toolCards: ToolCard[] = [
  {
    id: 'base64',
    name: 'Base64',
    icon: '🔑',
    path: '/tools/base64',
    description: '文本與 Base64 互相轉換',
    category: '編碼轉換',
  },
  {
    id: 'qrcode',
    name: 'QRCode',
    icon: '📱',
    path: '/tools/qrious',
    description: '生成與解析二維碼',
    category: '編碼轉換',
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    icon: '🔐',
    path: '/tools/jwt-decoder',
    description: '解析 JWT Header/Payload 與時間欄位',
    category: '編碼轉換',
  },
  {
    id: 'json',
    name: 'JSON Formatter',
    icon: '📄',
    path: '/tools/json-formatter',
    description: 'JSON 格式化與壓縮',
    category: '數據格式化',
  },
  {
    id: 'html',
    name: 'HTML Previewer',
    icon: '🖥️',
    path: '/tools/html-previewer',
    description: '即時預覽 HTML 代碼',
    category: '內容預覽',
  },
  {
    id: 'markdown',
    name: 'Markdown Previewer',
    icon: '📜',
    path: '/tools/markdown-previewer',
    description: 'Markdown 即時預覽',
    category: '內容預覽',
  },
]

const categories = ['編碼轉換', '數據格式化', '內容預覽']
</script>

<template>
  <div class="content-inner">
    <div class="tools-container">
      <div v-for="category in categories" :key="category" class="category-section">
        <h2 class="category-title">{{ category }}</h2>
        <div class="tools-grid">
          <RouterLink
            v-for="tool in toolCards.filter((item) => item.category === category)"
            :key="tool.id"
            :to="tool.path"
            class="tool-card"
            :data-testid="`tool-card-${tool.id}`"
          >
            <div class="tool-icon">{{ tool.icon }}</div>
            <div class="tool-name">{{ tool.name }}</div>
            <div class="tool-description">{{ tool.description }}</div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
