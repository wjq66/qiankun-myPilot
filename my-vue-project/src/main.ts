import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerQiankunApps } from './qiankun.js'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 路由挂载完成后再注册 qiankun，确保容器已存在
router.isReady().then(() => {
  registerQiankunApps()
})

app.mount('#app')


