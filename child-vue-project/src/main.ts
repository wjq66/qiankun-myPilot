import './public-path'
import { createApp, type App as AppInstance } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { renderWithQiankun, qiankunWindow } from "vite-plugin-qiankun/dist/helper"
import { useLoginStore } from './stores/login'
import { eventManager, AppEvents } from './utils/eventManager'

import App from './App.vue'
import router from './router'

let instance: AppInstance | null = null

/**
 * 设置事件处理器（统一管理）
 */
function setupEventHandlers(userStore: any) {
  // 监听退出登录事件
  eventManager.on(AppEvents.USER_LOGOUT, (data) => {
    console.log('[子应用] 收到退出登录事件', data)
    userStore.clearUserInfo()
    
    // 可以在这里执行其他清理操作
    // 例如：清空缓存、跳转到登录页等
  })

  // 监听登录事件
  eventManager.on(AppEvents.USER_LOGIN, (data) => {
    console.log('[子应用] 收到登录事件', data)
    if (data?.userInfo) {
      userStore.initFromProps({ userInfo: data.userInfo })
    }
  })

  // 监听用户信息更新事件
  eventManager.on(AppEvents.USER_INFO_UPDATE, (data) => {
    console.log('[子应用] 收到用户信息更新事件', data)
    if (data?.userInfo) {
      userStore.userInfo = data.userInfo
    }
  })

  // 监听数据同步事件
  eventManager.on(AppEvents.DATA_SYNC, (data) => {
    console.log('[子应用] 收到数据同步事件', data)
    // 处理数据同步逻辑
  })

  console.log('[子应用] 事件处理器注册完成')
}

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
    userStore.initFromProps(props)
  } else {
    // 如果没有从 props 传入，尝试从 localStorage 恢复
    userStore.restoreUserInfo()
  }

  // 监听主应用的全局状态变化（退出登录等事件）
  if (props?.onGlobalStateChange) {
    props.onGlobalStateChange((state: any, prev: any) => {
      console.log('[子应用] 全局状态变化:', state)
      console.log('[子应用] 上一状态:', prev)
      
      // 通过事件管理器处理各种事件
      if (state?.event) {
        eventManager.emit(state.event, state.data)
      }
    }, true) // true 表示立即触发一次
  }

  // 注册事件处理器（统一管理）
  setupEventHandlers(userStore)

  // 挂载应用
  instance.mount(mountContainer)
  
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
    props.onGlobalStateChange(
      (newState, oldState) => {
        console.log('  Vue子应用监听到:', newState);
      },
      true // true 表示立刻用当前状态触发一次上面的回调
    ); 
    
    render(props)
  },
  update(props) {
  },
  unmount(props) {
  
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
