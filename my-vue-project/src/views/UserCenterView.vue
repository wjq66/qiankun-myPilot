// src/views/UserCenterView.vue - 用户中心页面

<template>
  <div class="user-center-view">
    <div class="page-header">
      <h1>👤 用户中心</h1>
      <p>点击下方按钮跳转到完整的用户中心管理系统</p>
    </div>
    
    <div class="action-section">
      <button class="jump-button" @click="goToUserManagement">
        🚀 进入用户中心管理系统
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToUserManagement = () => {
  router.push('/son-vue3')
}
</script>

<style scoped>
.user-center-view {
  padding: 40px;
  text-align: center;
}

.page-header {
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 16px;
}

.action-section {
  margin-top: 40px;
}

.jump-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.jump-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}
</style>
