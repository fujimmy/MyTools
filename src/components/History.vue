<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useHistoryStore } from '../stores/history'
import type { ConversionHistoryItem, ToolType } from '../utils/historyStore'

const historyStore = useHistoryStore()
const historyItems = computed(() => historyStore.historyItems)

const TOOL_NAME_MAP: Record<ToolType, string> = {
  base64: 'Base64 編解碼',
  'json-formatter': 'JSON Formatter',
  'html-previewer': 'HTML Previewer',
  'markdown-previewer': 'Markdown Previewer',
  qrious: 'QRCode Previewer',
  'jwt-decoder': 'JWT Decoder',
  'xslt-diff': 'XSLT 比較器',
  'sql-compare': 'SQL 比較器',
  'sql-practice': 'SQL Practice',
}

const formatTime = (isoTime: string): string => {
  try {
    return new Date(isoTime).toLocaleString('zh-TW', { hour12: false })
  } catch {
    return isoTime
  }
}

const renderMetadata = (item: ConversionHistoryItem) => {
  if (!item.metadata || Object.keys(item.metadata).length === 0) {
    return [] as Array<[string, string | number | boolean | null]>
  }

  return Object.entries(item.metadata)
}

const handleDelete = (id: string) => {
  historyStore.deleteHistoryItem(id)
}

onMounted(() => {
  historyStore.refresh()
})
</script>

<template>
  <div style="padding: 20px">
    <h2>存檔歷史</h2>
    <p style="color: #666; margin-bottom: 15px">顯示各工具手動儲存的 raw data 轉換紀錄。</p>

    <div
      v-if="historyItems.length === 0"
      style="border: 1px dashed #c8c8c8; border-radius: 8px; padding: 20px; color: #666; background-color: #fafafa"
    >
      目前沒有任何存檔紀錄。請先到任一工具按下「儲存此次轉換」。
    </div>

    <div v-else style="display: flex; flex-direction: column; gap: 12px">
      <div
        v-for="item in historyItems"
        :key="item.id"
        style="border: 1px solid #ddd; border-radius: 8px; background-color: #fff; padding: 14px"
      >
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 10px"
        >
          <div style="display: flex; flex-direction: column; gap: 4px">
            <strong>{{ TOOL_NAME_MAP[item.tool] }} / {{ item.action }}</strong>
            <span style="color: #888; font-size: 0.85em">{{ formatTime(item.createdAt) }}</span>
          </div>
          <button
            @click="handleDelete(item.id)"
            class="tool-button tool-button--compact"
            style="--tool-button-bg: #f44336"
          >
            刪除
          </button>
        </div>

        <div v-if="renderMetadata(item).length" style="margin-bottom: 10px; color: #666; font-size: 0.9em">
          <span v-for="[key, value] in renderMetadata(item)" :key="key" style="margin-right: 12px">
            {{ key }}: {{ String(value) }}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
          <div>
            <div style="font-weight: 600; margin-bottom: 4px">Input (Raw)</div>
            <pre
              style="margin: 0; max-height: 180px; overflow: auto; background-color: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 6px; padding: 8px; white-space: pre-wrap; word-break: break-word"
            >{{ item.input }}</pre>
          </div>

          <div>
            <div style="font-weight: 600; margin-bottom: 4px">Output (Raw)</div>
            <pre
              style="margin: 0; max-height: 180px; overflow: auto; background-color: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 6px; padding: 8px; white-space: pre-wrap; word-break: break-word"
            >{{ item.output }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
