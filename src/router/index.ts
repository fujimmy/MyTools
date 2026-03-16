import { createRouter, createWebHistory } from 'vue-router'
import Content from '../components/Content.vue'
import Base64Tool from '../components/tools/base64.vue'
import JsonFormatter from '../components/tools/JsonFormatter.vue'
import HtmlPreviewer from '../components/tools/HtmlPreviewer.vue'
import MarkdownPreviewer from '../components/tools/MarkdownPreviewer.vue'
import QRCodePreviewer from '../components/tools/QRious.vue'
import JwtDecoder from '../components/tools/JwtDecoder.vue'
import HistoryPage from '../components/History.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Content },
    { path: '/tools/base64', component: Base64Tool },
    { path: '/tools/json-formatter', component: JsonFormatter },
    { path: '/tools/html-previewer', component: HtmlPreviewer },
    { path: '/tools/markdown-previewer', component: MarkdownPreviewer },
    { path: '/tools/qrious', component: QRCodePreviewer },
    { path: '/tools/jwt-decoder', component: JwtDecoder },
    { path: '/history', component: HistoryPage },
    { path: '/tools/MarkdownPreviewer', redirect: '/tools/markdown-previewer' },
    { path: '/tools/QRious', redirect: '/tools/qrious' },
  ],
})

export default router
