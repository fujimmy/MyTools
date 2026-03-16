<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { html as htmlBeautify } from 'js-beautify'
import { useHistoryStore } from '../../stores/history'
import { EditorView, basicSetup } from 'codemirror'
import { html as htmlLang } from '@codemirror/lang-html'
import { EditorState } from '@codemirror/state'

const beautifyOptions = {
  indent_size: 2,
  space_in_empty_paren: true,
  preserve_newlines: true,
  max_preserve_newlines: 1,
  end_with_newline: true,
}

const historyStore = useHistoryStore()

const htmlInput = ref('<h1>Hello, MyTools!</h1>\n<p style="color: blue;">在這裡輸入你的 HTML 和 CSS 代碼。</p>')
const saveStatus = ref<'none' | 'saved'>('none')
const errorMessage = ref('')
const iframeRef = ref<HTMLIFrameElement | null>(null)
const editorContainer = ref<HTMLDivElement | null>(null)
let editorView: EditorView | null = null

// Flag to avoid recursive watch ↔ editor sync
let updatingFromOutside = false

const formatHtmlContent = (content: string): string => {
  if (content.trim() === '') return content
  return htmlBeautify(content, beautifyOptions)
}

const buildPreviewHtml = (content: string): string => `<!DOCTYPE html>
<html>
  <head>
    <title>HTML 預覽</title>
    <style>body { margin: 10px; font-family: sans-serif; }</style>
  </head>
  <body>
    ${content}
  </body>
</html>`

const updatePreview = () => {
  if (!iframeRef.value) return
  const iframeDoc = iframeRef.value.contentDocument || iframeRef.value.contentWindow?.document
  if (!iframeDoc) return
  iframeDoc.open()
  iframeDoc.write(buildPreviewHtml(htmlInput.value))
  iframeDoc.close()
}

const handleSaveCurrent = () => {
  errorMessage.value = ''
  if (htmlInput.value.trim() === '') {
    errorMessage.value = '尚無可儲存資料，請先輸入 HTML。'
    return
  }
  historyStore.saveHistoryItem({
    tool: 'html-previewer',
    action: 'preview',
    input: htmlInput.value,
    output: buildPreviewHtml(htmlInput.value),
  })
  saveStatus.value = 'saved'
  setTimeout(() => { saveStatus.value = 'none' }, 2000)
}

const handleFormat = () => {
  saveStatus.value = 'none'
  errorMessage.value = ''
  if (htmlInput.value.trim() === '') return
  try {
    htmlInput.value = formatHtmlContent(htmlInput.value)
  } catch {
    errorMessage.value = 'HTML 格式化失敗，請檢查代碼是否有嚴重錯誤。'
  }
}

// When htmlInput is changed externally (e.g. format button), push to editor
watch(htmlInput, (newVal) => {
  errorMessage.value = ''
  saveStatus.value = 'none'
  updatePreview()
  if (editorView && !updatingFromOutside) {
    const current = editorView.state.doc.toString()
    if (current !== newVal) {
      editorView.dispatch({
        changes: { from: 0, to: current.length, insert: newVal },
      })
    }
  }
})

onMounted(() => {
  if (editorContainer.value) {
    editorView = new EditorView({
      state: EditorState.create({
        doc: htmlInput.value,
        extensions: [
          basicSetup,
          htmlLang(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              updatingFromOutside = true
              htmlInput.value = update.state.doc.toString()
              updatingFromOutside = false
            }
          }),
          EditorView.theme({
            '&': { height: '100%', fontSize: '14px' },
            '.cm-scroller': { overflow: 'auto', fontFamily: 'Consolas, monospace' },
          }),
        ],
      }),
      parent: editorContainer.value,
    })
  }
  updatePreview()
})

onUnmounted(() => {
  editorView?.destroy()
})
</script>

<template>
  <div style="padding: 20px; width: 100%; box-sizing: border-box">
    <h2>HTML 預覽器</h2>
    <p style="margin-bottom: 15px">在左側輸入 HTML/CSS 代碼，右側即時查看渲染結果。</p>

    <p
      v-if="errorMessage"
      style="color: #d32f2f; border: 1px solid #d32f2f; padding: 8px; border-radius: 5px"
    >
      {{ errorMessage }}
    </p>

    <div style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center">
      <button
        @click="handleSaveCurrent"
        style="padding: 8px 15px; background-color: #2e7d32; color: white; border: none; cursor: pointer; border-radius: 5px"
      >
        儲存此次轉換
      </button>

      <button
        @click="handleFormat"
        style="padding: 8px 15px; background-color: #1565c0; color: white; border: none; cursor: pointer; border-radius: 5px"
      >
        格式化 HTML
      </button>

      <span v-if="saveStatus === 'saved'" style="color: #2e7d32">✅ 已儲存</span>
    </div>

    <div style="display: flex; gap: 20px; height: 600px; width: 100%; min-width: 0; overflow: hidden">
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column">
        <label style="margin-bottom: 5px">HTML/CSS 代碼輸入區:</label>
        <div
          ref="editorContainer"
          style="flex: 1; min-width: 0; border: 1px solid #ccc; border-radius: 5px; overflow: hidden"
        />
      </div>

      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column">
        <label style="margin-bottom: 5px">預覽結果:</label>
        <iframe
          ref="iframeRef"
          title="HTML Preview"
          style="flex: 1; width: 100%; border: 1px solid #ccc; background-color: white"
          sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
        />
      </div>
    </div>
  </div>
</template>
