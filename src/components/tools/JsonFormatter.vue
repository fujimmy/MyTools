<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHistoryStore } from '../../stores/history'

const INDENT_SPACES = 2

type CopyStatus = 'none' | 'copied'
type JsonConversionAction = 'format' | 'minify'

interface LastJsonConversion {
  action: JsonConversionAction
  input: string
  output: string
}

const historyStore = useHistoryStore()

const jsonInput = ref('')
const error = ref('')
const copyStatus = ref<CopyStatus>('none')
const parsedJson = ref<unknown | null>(null)
const searchKeyword = ref('')
const lastConversion = ref<LastJsonConversion | null>(null)
const saveStatus = ref<'none' | 'saved'>('none')

const normalizedSearchKeyword = computed(() => searchKeyword.value.trim().toLowerCase())

const filteredPreview = computed(() => {
  if (!parsedJson.value) {
    return ''
  }

  if (!normalizedSearchKeyword.value) {
    return JSON.stringify(parsedJson.value, null, 2)
  }

  const raw = JSON.stringify(parsedJson.value, null, 2)
  const lines = raw.split('\n').filter((line) => line.toLowerCase().includes(normalizedSearchKeyword.value))
  return lines.length > 0 ? lines.join('\n') : ''
})

const parseJson = (): unknown | null => {
  if (jsonInput.value.trim() === '') {
    return null
  }

  try {
    return JSON.parse(jsonInput.value) as unknown
  } catch (e) {
    parsedJson.value = null
    lastConversion.value = null
    if (e instanceof Error) {
      error.value = `JSON 語法錯誤：${e.message}`
    } else {
      error.value = 'JSON 語法錯誤：請檢查您的輸入。'
    }
    return null
  }
}

const handleCopy = async () => {
  if (jsonInput.value.trim() === '') {
    error.value = '複製失敗：輸入內容為空。'
    return
  }

  try {
    await navigator.clipboard.writeText(jsonInput.value)
    copyStatus.value = 'copied'
    setTimeout(() => {
      copyStatus.value = 'none'
    }, 2000)
  } catch {
    error.value = '複製失敗：瀏覽器不支援或未授予權限。'
  }
}

const handleFormat = () => {
  error.value = ''
  copyStatus.value = 'none'
  saveStatus.value = 'none'

  if (jsonInput.value.trim() === '') {
    return
  }

  const sourceJson = jsonInput.value
  const parsedObject = parseJson()
  if (!parsedObject) {
    return
  }

  const formattedJson = JSON.stringify(parsedObject, null, INDENT_SPACES)
  jsonInput.value = formattedJson
  parsedJson.value = parsedObject
  searchKeyword.value = ''
  lastConversion.value = {
    action: 'format',
    input: sourceJson,
    output: formattedJson,
  }
}

const handleMinify = () => {
  error.value = ''
  copyStatus.value = 'none'
  saveStatus.value = 'none'

  if (jsonInput.value.trim() === '') {
    return
  }

  const sourceJson = jsonInput.value
  const parsedObject = parseJson()
  if (!parsedObject) {
    return
  }

  const minifiedJson = JSON.stringify(parsedObject)
  jsonInput.value = minifiedJson
  parsedJson.value = parsedObject
  searchKeyword.value = ''
  lastConversion.value = {
    action: 'minify',
    input: sourceJson,
    output: minifiedJson,
  }
}

const handleClear = () => {
  jsonInput.value = ''
  error.value = ''
  copyStatus.value = 'none'
  parsedJson.value = null
  searchKeyword.value = ''
  lastConversion.value = null
  saveStatus.value = 'none'
}

const handleSaveCurrent = () => {
  error.value = ''

  if (!lastConversion.value) {
    error.value = '尚無可儲存的轉換結果，請先執行格式化或壓縮。'
    return
  }

  historyStore.saveHistoryItem({
    tool: 'json-formatter',
    action: lastConversion.value.action,
    input: lastConversion.value.input,
    output: lastConversion.value.output,
  })

  saveStatus.value = 'saved'
  setTimeout(() => {
    saveStatus.value = 'none'
  }, 2000)
}
</script>

<template>
  <div style="padding: 20px">
    <h2>JSON 格式化 / 校驗器</h2>

    <div
      v-if="error"
      style="color: #D8000C; background-color: #FFD2D2; border: 1px solid #D8000C; padding: 10px; border-radius: 5px; margin-bottom: 15px"
    >
      <strong>錯誤：</strong> {{ error }}
    </div>

    <div style="position: relative">
      <button
        @click="handleCopy"
        style="position: absolute; top: 10px; right: 10px; z-index: 10; padding: 6px 12px; background-color: #28a745; color: white; border: none; cursor: pointer; border-radius: 4px; font-size: 12px; opacity: 0.85"
      >
        複製結果
      </button>

      <span
        v-if="copyStatus === 'copied'"
        style="position: absolute; top: 15px; right: 90px; z-index: 10; color: #28a745; background-color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; box-shadow: 0 0 5px rgba(0,0,0,0.1)"
      >
        ✅ 已複製！
      </span>

      <textarea
        v-model="jsonInput"
        rows="20"
        placeholder="請在這裡貼上 JSON 數據進行格式化或校驗..."
        style="width: 100%; padding: 10px; padding-right: 120px; box-sizing: border-box; font-family: Consolas, monospace; font-size: 14px; margin-bottom: 10px"
        @input="error = ''; copyStatus = 'none'; parsedJson = null; searchKeyword = ''; lastConversion = null; saveStatus = 'none'"
      />
    </div>

    <div style="display: flex; gap: 10px">
      <button
        @click="handleFormat"
        style="padding: 10px 15px; background-color: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 5px"
      >
        格式化 (Format)
      </button>

      <button
        @click="handleMinify"
        style="padding: 10px 15px; background-color: #008CBA; color: white; border: none; cursor: pointer; border-radius: 5px"
      >
        壓縮 (Minify)
      </button>

      <button
        @click="handleClear"
        style="padding: 10px 15px; background-color: #f44336; color: white; border: none; cursor: pointer; border-radius: 5px"
      >
        清空 (Clear)
      </button>

      <button
        @click="handleSaveCurrent"
        style="padding: 10px 15px; background-color: #2e7d32; color: white; border: none; cursor: pointer; border-radius: 5px"
      >
        儲存此次轉換
      </button>

      <span v-if="saveStatus === 'saved'" style="color: #2e7d32; align-self: center">✅ 已儲存</span>
    </div>

    <div v-if="parsedJson !== null" style="margin-top: 20px">
      <h3 style="margin: 0 0 10px 0">JSON 樹狀瀏覽</h3>

      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜尋 key 或 value..."
        style="width: 100%; box-sizing: border-box; padding: 8px 10px; margin-bottom: 10px; border: 1px solid #d0d7de; border-radius: 5px; font-size: 14px"
      >

      <div
        style="border: 1px solid #e0e0e0; border-radius: 6px; padding: 10px; background-color: #fafafa; max-height: 420px; overflow-y: auto"
      >
        <div v-if="normalizedSearchKeyword && !filteredPreview" style="color: #888; padding: 8px">
          找不到符合搜尋條件的節點。
        </div>
        <pre
          v-else
          style="margin: 0; white-space: pre-wrap; word-break: break-word; font-family: Consolas, monospace; font-size: 13px; line-height: 1.6"
        >{{ filteredPreview }}</pre>
      </div>
    </div>

    <p style="margin-top: 20px; font-size: 0.9em; color: #666">* 點擊任一按鈕即可同時進行 JSON 語法校驗。</p>
  </div>
</template>
