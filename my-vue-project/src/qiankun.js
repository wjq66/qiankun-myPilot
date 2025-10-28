import { registerMicroApps, start } from 'qiankun';
import {useAuthStore} from './stores/auth'

export function registerQiankunApps() {
  const authStore = useAuthStore()
  registerMicroApps([
    {
      name: 'son-vue3',
      entry: '//localhost:5174',
      container: '#container',
      activeRule: (location) => location.pathname.startsWith('/son-vue3'),
      props: {
        userInfo: authStore.userInfo
      },
      loader: (loading) => {
        console.log('子应用加载中...', loading)
      }
    }
  ], {
    beforeLoad: [app => console.log('[主应用] 开始加载', app.name)],
    beforeMount: [app => console.log('[主应用] 开始挂载', app.name)],
    afterMount: [app => console.log('[主应用] 挂载完成', app.name)],
    beforeUnmount: [app => console.log('[主应用] 开始卸载', app.name)],
    afterUnmount: [app => console.log('[主应用] 卸载完成', app.name)]
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
}
