<template>
  <div id="app">
    <div class="app-container">
      <!-- 顶部导航 -->
      <!-- <el-header>
        <h1>🏢 用户中心管理系统</h1>
        <nav>
          <router-link to="/" class="nav-link">🏠 首页</router-link>
          <router-link to="/task-list" class="nav-link">🏠 任务列表</router-link>
        </nav>
      </el-header> -->

     <el-row :span="24">
      <el-col :span="4">
        <el-menu
          :default-active="activeIndex"
          class="el-menu-vertical-demo"
          @select="handleSelect"
        >
          <el-menu-item index="2">
            <el-icon><icon-menu /></el-icon>
            <router-link to="/">任务管理看板</router-link>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><document /></el-icon>
            <router-link to="/task-list">任务列表</router-link>
          </el-menu-item>
          <el-menu-item index="4">
            <el-icon><setting /></el-icon>
            <router-link to="/work-plan">工作计划</router-link>
          </el-menu-item>
        </el-menu>
      </el-col>
      <!-- 主内容区 -->
      <el-col :span="20">
        <router-view />
      </el-col>
     </el-row>

      
    </div>
    <!-- 底部 -->
    <div class="el-footer">
      <p>© 2024 用户中心管理系统 - 使用 Vue 3 + Vite + Pinia + Element Plus 构建</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 当前激活的菜单项索引
const activeIndex = ref('2');

// 菜单项点击事件处理（这是菜单项点击的主要事件）
const handleSelect = (key) => {
  console.log('菜单项被点击:', key);
  activeIndex.value = key;
  
  // 根据菜单项索引进行路由跳转
  switch (key) {
    case '2':
      // 首页路由
      router.push('/');
      break;
    case '3':
      // 任务列表路由（如果启用的话）
      // router.push('/task-list');
      break;
    case '4':
      // 工作计划路由
      // router.push('/work-plan');
      break;
    default:
      console.log('未配置的路由:', key);
  }
};
 
</script>

<style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .content-wrapper{
      padding: 12px;
    }
    #app {
      height: 100%;
      min-height: 90vh;
      background: #f5f5f5;
    }
    
    .app-container {
      height: calc(90vh - 60px);
      display: flex;
      flex-direction: column;
    }

    a{
      color: #333;
      text-decoration: auto;
    }
    
    /* 确保 el-row 和 el-col 能够填充高度 */
    .app-container .el-row {
      flex: 1;
      height: 100%;
    }
    
    .app-container .el-col {
      height: 100%;
      overflow: auto;
    }
    
    .el-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
    
    .el-header h1 {
      font-size: 24px;
      margin: 0;
    }
    
    nav {
      display: flex;
      gap: 0;
    }
    
    .nav-link {
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .nav-link.router-link-active {
      background-color: rgba(255, 255, 255, 0.3);
    }
    
    .el-main {
      min-height: calc(100vh - 120px);
      padding: 20px;
    }
    
    .el-footer {
      background: #333;
      color: white;
      text-align: center;
      padding: 20px;
      margin-top: 12px;
    }
    
    .el-footer p {
      margin: 0;
      opacity: 0.8;
    }
    
    /* 路由过渡效果 */
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.3s;
    }
    
    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
    </style>