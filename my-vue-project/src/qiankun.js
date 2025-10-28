import { registerMicroApps, start, initGlobalState } from 'qiankun';
import {useAuthStore} from './stores/auth'

// 初始化全局状态
const actions = initGlobalState({
  event: null,
  data: null,
  timestamp: Date.now()
})

// 监听全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 全局状态变化:', state)
  console.log('[主应用] 上一状态:', prev)
})

export function registerQiankunApps() {
  // 确保容器存在
  if (!document.querySelector('#container')) {
    console.warn('[qiankun] 容器不存在，延迟注册')
    // setTimeout(registerQiankunApps, 100)
    return
  }
  
  const authStore = useAuthStore()
  
  registerMicroApps([
    {
      name: 'son-vue3',
      entry: '//localhost:5174',
      container: '#container',
      activeRule: (location) => location.pathname.startsWith('/son-vue3'),
      props: {
        userInfo: authStore.userInfo,
        // 传递 Actions 方法给子应用
        setGlobalState: actions.setGlobalState,
        onGlobalStateChange: actions.onGlobalStateChange
      },
      loader: (loading) => {
        console.log('子应用加载中...', loading)
      }
    }
  ], {
    // beforeLoad: [app => console.log('[主应用] 开始加载', app.name)],
    // beforeMount: [app => console.log('[主应用] 开始挂载', app.name)],
    // afterMount: [app => console.log('[主应用] 挂载完成', app.name)],
    // beforeUnmount: [app => console.log('[主应用] 开始卸载', app.name)],
    // afterUnmount: [app => console.log('[主应用] 卸载完成', app.name)]
  });

  // 启动 qiankun
  start({
    sandbox: {
      strictStyleIsolation: false, // CSS 沙箱隔离
      experimentalStyleIsolation: false
    },
    singular: false, // 允许同时激活多个微应用
    prefetch: 'all' // 预加载所有微应用
  });
  
  // 导出 actions，方便在其他地方使用
  return actions
}

// 导出 actions 供其他地方使用
export { actions }
