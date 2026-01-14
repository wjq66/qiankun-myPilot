import {createRouter, createWebHistory, createWebHashHistory} from 'vue-router'
import {qiankunWindow} from 'vite-plugin-qiankun/dist/helper'

const router = createRouter({
    history: qiankunWindow.__POWERED_BY_QIANKUN__ 
    ? createWebHashHistory('/task-management/') 
    : createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'task-management-board',
            component: () => import('@/views/TaskManagement/TaskBoardView.vue')
        }
    ]
})

export default router