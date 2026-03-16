import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ConversionHistoryDraft, ConversionHistoryItem } from '../utils/historyStore'

const STORAGE_KEY = 'mytools:conversion-history'
const MAX_HISTORY_ITEMS = 100

const isBrowser = typeof window !== 'undefined'

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const loadHistoryItems = (): ConversionHistoryItem[] => {
  if (!isBrowser) {
    return []
  }

  const rawItems = window.localStorage.getItem(STORAGE_KEY)
  if (!rawItems) {
    return []
  }

  try {
    const parsed = JSON.parse(rawItems)
    return Array.isArray(parsed) ? (parsed as ConversionHistoryItem[]) : []
  } catch {
    return []
  }
}

const persistHistoryItems = (items: ConversionHistoryItem[]) => {
  if (!isBrowser) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const useHistoryStore = defineStore('history', () => {
  const items = ref<ConversionHistoryItem[]>(loadHistoryItems())

  const historyItems = computed(() => items.value)

  const refresh = () => {
    items.value = loadHistoryItems()
  }

  const saveHistoryItem = (draft: ConversionHistoryDraft): ConversionHistoryItem => {
    const newItem: ConversionHistoryItem = {
      ...draft,
      id: createId(),
      createdAt: new Date().toISOString(),
    }

    items.value = [newItem, ...items.value].slice(0, MAX_HISTORY_ITEMS)
    persistHistoryItems(items.value)
    return newItem
  }

  const deleteHistoryItem = (id: string) => {
    items.value = items.value.filter((item) => item.id !== id)
    persistHistoryItems(items.value)
  }

  const clearHistoryItems = () => {
    items.value = []
    persistHistoryItems(items.value)
  }

  return {
    historyItems,
    refresh,
    saveHistoryItem,
    deleteHistoryItem,
    clearHistoryItems,
  }
})
