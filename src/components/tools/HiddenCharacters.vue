<script setup lang="ts">
import { computed, ref } from 'vue'

interface CharacterEntry {
  position: number
  line: number
  column: number
  character: string
  display: string
  name: string
  codePoint: string
  isHidden: boolean
}

const inputText = ref('')
const showOnlyHidden = ref(false)

const specialCharacters: Record<string, { display: string; name: string }> = {
  ' ': { display: '·', name: '空白 (Space)' },
  '\t': { display: '→', name: '定位字元 (Tab)' },
  '\n': { display: '↵\n', name: '換行 (Line Feed)' },
  '\r': { display: '␍', name: '歸位 (Carriage Return)' },
  '\u00a0': { display: '⍽', name: '不換行空白 (No-Break Space)' },
  '\u200b': { display: '⟪ZWSP⟫', name: '零寬空白 (Zero Width Space)' },
  '\u200c': { display: '⟪ZWNJ⟫', name: '零寬非連接符 (Zero Width Non-Joiner)' },
  '\u200d': { display: '⟪ZWJ⟫', name: '零寬連接符 (Zero Width Joiner)' },
  '\u200e': { display: '⟪LRM⟫', name: '由左至右標記 (Left-to-Right Mark)' },
  '\u200f': { display: '⟪RLM⟫', name: '由右至左標記 (Right-to-Left Mark)' },
  '\u2028': { display: '⟪LS⟫', name: '行分隔符 (Line Separator)' },
  '\u2029': { display: '⟪PS⟫', name: '段落分隔符 (Paragraph Separator)' },
  '\u2060': { display: '⟪WJ⟫', name: '文字連接符 (Word Joiner)' },
  '\ufeff': { display: '⟪BOM⟫', name: '位元組順序標記 (Byte Order Mark)' },
}

const createCharacterEntry = (character: string, position: number, line: number, column: number): CharacterEntry => {
  const specialCharacter = specialCharacters[character]
  const isUnicodeWhitespace = /\p{Zs}/u.test(character)
  const isControlCharacter = /\p{Cc}/u.test(character)
  const isFormatCharacter = /\p{Cf}/u.test(character)
  const codePoint = character.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0') ?? '0000'

  if (specialCharacter) {
    return { position, line, column, character, codePoint: `U+${codePoint}`, isHidden: true, ...specialCharacter }
  }

  if (isUnicodeWhitespace || isControlCharacter || isFormatCharacter) {
    return {
      position,
      line,
      column,
      character,
      display: `⟪U+${codePoint}⟫`,
      name: isUnicodeWhitespace ? 'Unicode 空白字元' : isControlCharacter ? '控制字元' : 'Unicode 格式字元',
      codePoint: `U+${codePoint}`,
      isHidden: true,
    }
  }

  return {
    position,
    line,
    column,
    character,
    display: character,
    name: '可見字元',
    codePoint: `U+${codePoint}`,
    isHidden: false,
  }
}

const characters = computed(() => {
  const entries: CharacterEntry[] = []
  let line = 1
  let column = 1

  const inputCharacters = Array.from(inputText.value)

  inputCharacters.forEach((character, index) => {
    entries.push(createCharacterEntry(character, index + 1, line, column))
    if (character === '\r' || character === '\u2028' || character === '\u2029') {
      line += 1
      column = 1
    } else if (character === '\n') {
      if (inputCharacters[index - 1] !== '\r') {
        line += 1
      }
      column = 1
    } else {
      column += 1
    }
  })

  return entries
})

const hiddenCharacters = computed(() => characters.value.filter((entry) => entry.isHidden))
const visibleEntries = computed(() => (showOnlyHidden.value ? hiddenCharacters.value : characters.value))

const clearText = () => {
  inputText.value = ''
}
</script>

<template>
  <main class="tool-page">
    <header class="tool-header">
      <div>
        <h1>Hidden Characters</h1>
        <p>貼上文字，即時標示空白、換行、Tab 與零寬字元。</p>
      </div>
      <button v-if="inputText" class="secondary-button" type="button" @click="clearText">清除</button>
    </header>

    <section class="input-section">
      <label for="hidden-character-input">文字內容</label>
      <textarea id="hidden-character-input" v-model="inputText" placeholder="在此貼上或輸入文字..." spellcheck="false" />
    </section>

    <template v-if="inputText">
      <section class="summary" aria-label="統計資訊">
        <div><strong>{{ characters.length }}</strong><span>字元總數</span></div>
        <div><strong>{{ hiddenCharacters.length }}</strong><span>隱藏字元</span></div>
        <div><strong>{{ characters.length - hiddenCharacters.length }}</strong><span>可見字元</span></div>
      </section>

      <section class="result-section">
        <h2>標記預覽</h2>
        <pre class="preview"><span v-for="entry in characters" :key="entry.position" :class="{ hidden: entry.isHidden }">{{ entry.display }}</span></pre>
      </section>

      <section class="result-section">
        <div class="table-header">
          <h2>字元明細</h2>
          <label class="filter-label"><input v-model="showOnlyHidden" type="checkbox" />只顯示隱藏字元</label>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>位置</th><th>行:欄</th><th>顯示</th><th>名稱</th><th>碼點</th></tr></thead>
            <tbody>
              <tr v-for="entry in visibleEntries" :key="entry.position" :class="{ 'hidden-row': entry.isHidden }">
                <td>{{ entry.position }}</td><td>{{ entry.line }}:{{ entry.column }}</td><td class="character-cell">{{ entry.display }}</td><td>{{ entry.name }}</td><td>{{ entry.codePoint }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.tool-page { max-width: 1100px; margin: 0 auto; padding: 28px; color: #1f2937; }
.tool-header, .table-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
h1, h2 { margin: 0; color: #172554; } h1 { font-size: 28px; } h2 { font-size: 18px; }
.tool-header p { margin: 8px 0 0; color: #64748b; }
.input-section, .result-section { margin-top: 24px; } label { display: block; margin-bottom: 8px; font-weight: 600; }
textarea { width: 100%; min-height: 180px; box-sizing: border-box; resize: vertical; padding: 12px; border: 1px solid #94a3b8; border-radius: 6px; font: 14px/1.55 Consolas, monospace; color: #1f2937; background: #fff; }
textarea:focus { outline: 2px solid #38bdf8; outline-offset: 1px; border-color: #0284c7; }
.secondary-button { padding: 8px 14px; border: 1px solid #64748b; border-radius: 5px; background: #fff; color: #334155; cursor: pointer; }
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; }
.summary div { padding: 14px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; }.summary strong, .summary span { display: block; }.summary strong { font-size: 22px; color: #0369a1; }.summary span { margin-top: 2px; color: #64748b; font-size: 13px; }
.preview { min-height: 52px; margin: 10px 0 0; padding: 12px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; font: 14px/1.6 Consolas, monospace; }.hidden { padding: 1px 2px; border-radius: 3px; background: #fef3c7; color: #92400e; }
.filter-label { margin: 0; font-size: 14px; font-weight: 500; white-space: nowrap; }.filter-label input { margin-right: 6px; }
.table-wrapper { margin-top: 10px; overflow: auto; border: 1px solid #cbd5e1; border-radius: 6px; } table { width: 100%; min-width: 660px; border-collapse: collapse; font-size: 14px; } th, td { padding: 9px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; } th { background: #f1f5f9; color: #334155; } tbody tr:last-child td { border-bottom: 0; }.hidden-row { background: #fffbeb; }.character-cell { font-family: Consolas, monospace; color: #9a3412; }
@media (max-width: 640px) { .tool-page { padding: 18px; }.tool-header, .table-header { align-items: flex-start; flex-direction: column; }.summary { grid-template-columns: 1fr; } }
</style>