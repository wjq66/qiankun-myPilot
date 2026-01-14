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

// 标记是否已注册，避免重复注册
let isRegistered = false

export function registerQiankunApps() {
  // 如果已经注册过，直接返回
  if (isRegistered) {
    console.log('[qiankun] 已经注册过，跳过重复注册')
    return actions
  }
  
  const authStore = useAuthStore()
  
  console.log('[qiankun] 开始注册微应用')
  
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
    },
    {
      name: 'task-management',
      entry: '//localhost:5175',
      container: '#testManageContainer',
      activeRule: (location) => location.pathname.startsWith('/task-management'),
      props: {
        userInfo: authStore.userInfo,
        setGlobalState: actions.setGlobalState,
        onGlobalStateChange: actions.onGlobalStateChange
      },
      loader: (loading) => {
        console.log('任务管理应用加载中...', loading)
      }
    }
  ]);

  // 启动 qiankun
  start({
    sandbox: {
      strictStyleIsolation: false, // CSS 沙箱隔离
      experimentalStyleIsolation: false
    },
    singular: false, // 允许同时激活多个微应用
    prefetch: false // 改为 false，避免预加载时容器不存在的问题
  });
  
  isRegistered = true
  console.log('[qiankun] 微应用注册完成')
  
  // 导出 actions，方便在其他地方使用
  return actions
}

// 导出 actions 供其他地方使用
export { actions }
