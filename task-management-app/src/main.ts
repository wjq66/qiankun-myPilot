import './public-path'

import {createApp, type App as AppInstance} from 'vue'
import {createPinia} from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useLoginStore } from './stores/login'

// AG Grid 样式 - 使用新的主题 API（v33+），不导入 CSS 文件
// 如果使用 theme="quartz" 等新主题，不需要导入 CSS
// import 'ag-grid-community/styles/ag-grid.css'
// import 'ag-grid-community/styles/ag-theme-alpine.css'

import {qiankunWindow, renderWithQiankun} from "vite-plugin-qiankun/dist/helper"

import App from './App.vue'
import router from './router'  

// const app = createApp(App)

// app.use(createPinia())
// app.use(router)
// app.use(ElementPlus)

// app.mount('#app')

let instance: AppInstance | null = null;

function render(props: any = {}) {
    const container = props.container ? 
    props.container.querySelector('#app') : document.querySelector('#app')
    if (!container) {
        console.error('[task-management-app] 未找到挂载容器')
        return
    }
    if(instance) {
        instance.unmount()
    }


    if(container instanceof HTMLElement) {
        container.innerHTML = ''
    }

    instance = createApp(App)
    instance.use(createPinia())
    instance.use(router)
    instance.use(ElementPlus)

    // 初始化用户信息
    const userStore = useLoginStore()
    if (props?.userInfo) {
        userStore.initFromProps(props)
    } else {
        userStore.restoreUserInfo()
    }

    instance.mount(container)
}

if(!qiankunWindow.__POWERED_BY_QIANKUN__) {
    render()
}


// qiankun 生命周期

renderWithQiankun({
    bootstrap() {
        console.log('[child-vue-project] 子应用启动')
      },
      mount(props) {
        console.log('[child-vue-project] 子应用挂载', props)
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