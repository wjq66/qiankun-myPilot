// src/views/MicroAppView.vue - 微应用容器页面

<template>
  <div class="micro-app-view">
    <div id="container" class="micro-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { registerQiankunApps } from '@/qiankun'

// 组件挂载后，确保容器存在后再注册（如果还没注册）
onMounted(async () => {
  await nextTick() // 等待 DOM 渲染完成
  const container = document.querySelector('#container')
  if (container) {
    console.log('[MicroAppView] 容器已创建，确保 qiankun 已注册')
    // 如果还没注册，这里会注册（但通常已经在 main.ts 中注册过了）
    registerQiankunApps()
  }
})
</script>

<style scoped>
.micro-app-view {
  width: 100%;
  height: 100%;
}

.micro-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
