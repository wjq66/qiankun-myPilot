// src/views/HomeView.vue - 首页

<template>
  <div class="home-view">
    <el-row>
      <el-col :span="24">
        <h1>欢迎回来，{{ userInfo?.username }}</h1>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">👤</div>
            <div class="stat-info">
              <div class="stat-value">{{ userCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">💼</div>
            <div class="stat-info">
              <div class="stat-value">{{ jobCount }}</div>
              <div class="stat-label">岗位总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">🏢</div>
            <div class="stat-info">
              <div class="stat-value">{{ departmentCount }}</div>
              <div class="stat-label">部门总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">🎭</div>
            <div class="stat-info">
              <div class="stat-value">{{ roleCount }}</div>
              <div class="stat-label">角色总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <h3>功能导航</h3>
          </template>
          <div class="feature-grid">
            <router-link to="/user-management" class="feature-card">
              <div class="feature-icon">👤</div>
              <div class="feature-title">用户管理</div>
              <div class="feature-desc">管理系统用户信息</div>
            </router-link>
            
            <router-link to="/job-management" class="feature-card">
              <div class="feature-icon">💼</div>
              <div class="feature-title">岗位管理</div>
              <div class="feature-desc">管理岗位信息</div>
            </router-link>
            
            <router-link to="/department-management" class="feature-card">
              <div class="feature-icon">🏢</div>
              <div class="feature-title">部门管理</div>
              <div class="feature-desc">管理组织架构</div>
            </router-link>
            
            <router-link to="/role-management" class="feature-card">
              <div class="feature-icon">🎭</div>
              <div class="feature-title">角色管理</div>
              <div class="feature-desc">管理角色权限</div>
            </router-link>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <h3>系统信息</h3>
          </template>
          <div class="system-info">
            <p><strong>技术栈：</strong></p>
            <ul>
              <li>Vue 3 + TypeScript</li>
              <li>Vite 构建工具</li>
              <li>Pinia 状态管理</li>
              <li>Vue Router 路由</li>
              <li>Element Plus UI</li>
            </ul>
            
            <p style="margin-top: 20px"><strong>功能特性：</strong></p>
            <ul>
              <li>✅ 用户管理（增删改查）</li>
              <li>✅ 岗位管理</li>
              <li>✅ 部门层级管理</li>
              <li>✅ 角色权限管理</li>
              <li>✅ 批量操作</li>
              <li>✅ RBAC 权限控制</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted , computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useJobStore } from '@/stores/job'
import { useDepartmentStore } from '@/stores/department'
import { useRoleStore } from '@/stores/role'
import { useLoginStore } from '@/stores/login'

const userStore = useUserStore()
const jobStore = useJobStore()
const departmentStore = useDepartmentStore()
const roleStore = useRoleStore()
const loginStore = useLoginStore()

const userInfo = computed(() => loginStore.userInfo)
console.log('userInfo',userInfo.value)
const userCount = ref(0)
const jobCount = ref(0)
const departmentCount = ref(0)
const roleCount = ref(0)

onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    jobStore.fetchJobs(),
    departmentStore.fetchDepartments(),
    roleStore.fetchRoles()
  ])
  
  userCount.value = userStore.users.length
  jobCount.value = jobStore.jobs.length
  departmentCount.value = departmentStore.departments.length
  roleCount.value = roleStore.roles.length
})
</script>

<style scoped>
.home-view {
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  height: 80px;
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
  line-height: 1;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.feature-card {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.feature-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.feature-desc {
  font-size: 12px;
  color: #909399;
}

.system-info ul {
  margin: 10px 0;
  padding-left: 20px;
}

.system-info li {
  margin: 5px 0;
  line-height: 1.8;
}

h3 {
  margin: 0;
  font-size: 18px;
}

p {
  margin: 10px 0;
}
</style>
