<template>
  <div class="micro-app-view">
    <div id="testManageContainer" class="micro-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick} from 'vue'
import { registerQiankunApps } from '@/qiankun'

onMounted(async () => {
    console.log('testManage mounted')  
    await nextTick()
    const container = document.querySelector("#testManageContainer")
    if( container ) {
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