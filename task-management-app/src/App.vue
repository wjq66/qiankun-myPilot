<template>
  <div id="app">
    <el-container>
      <!-- 顶部导航 -->
      <el-header>
        <h1>🏢 用户中心管理系统</h1>
        <nav>
          <router-link to="/" class="nav-link">🏠 任务管理看板</router-link>
        </nav>
      </el-header>

      <!-- 主内容区 -->
      <el-main>
        <router-view />
      </el-main>

      <!-- 底部 -->
      <el-footer>
        <p>© 2024 用户中心管理系统 - 使用 Vue 3 + Vite + Pinia + Element Plus 构建</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {

}
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
    
    #app {
      min-height: 100vh;
      background: #f5f5f5;
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