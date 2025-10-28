import './public-path'
import { createApp, type App as AppInstance } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { renderWithQiankun, qiankunWindow } from "vite-plugin-qiankun/dist/helper"
import { useLoginStore } from './stores/login'

import App from './App.vue'
import router from './router'

let instance: AppInstance | null = null

/**
 * 渲染函数
 */
function render(props: any = {}) {
  const { container } = props || {}
  
  // 在 qiankun 环境中，容器来自主应用
  const mountContainer = container 
    ? container.querySelector('#app') || container
    : document.querySelector('#app')
  
  if (!mountContainer) {
    console.error('[子应用] 未找到挂载容器')
    return
  }

  console.log('[子应用] 找到挂载容器:', mountContainer)

  // 如果实例已存在，先卸载
  if (instance) {
    instance.unmount()
  }

  // 清空容器内容
  if (mountContainer instanceof HTMLElement) {
    mountContainer.innerHTML = ''
  }

  // 创建应用实例
  instance = createApp(App)

  // 注册 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    instance.component(key, component)
  }

  // 注册插件
  const pinia = createPinia()
  instance.use(pinia)
  instance.use(router)
  instance.use(ElementPlus)

  // 初始化用户信息（从主应用传递的 props）
  const userStore = useLoginStore()
  if (props?.userInfo) {
    console.log('[子应用] 接收到用户信息:', props.userInfo)
    userStore.initFromProps(props)
  } else {
    // 如果没有从 props 传入，尝试从 localStorage 恢复
    userStore.restoreUserInfo()
  }

  // 挂载应用
  instance.mount(mountContainer)
  
  console.log('[子应用] 渲染完成，用户信息:', userStore.userInfo)
}

/**
 * 独立运行时
 */
console.log('qiankunWindow',qiankunWindow)
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}


renderWithQiankun({
  bootstrap() {
    console.log('[child-vue-project] 子应用启动')
  },
  mount(props) {
    console.log('[child-vue-project] 子应用挂载--props', props)
    
    render(props)
  },
  update(props) {
    console.log('[child-vue-project] 子应用更新', props)
  },
  unmount(props) {
    console.log('[child-vue-project] 子应用卸载', props)
  
    if (instance) {
      instance.unmount()
      const container = props?.container || document
      const appContainer = container.querySelector('#app')
      if (appContainer) {
        appContainer.innerHTML = ''
      }
      instance = null
    }
  }
})
