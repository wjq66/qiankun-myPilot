// src/views/UserManagement/components/JobSelector.vue - 岗位选择器

<template>
  <div class="job-selector">
    <el-checkbox-group v-model="selectedJobIds">
      <el-checkbox
        v-for="job in jobStore.jobs"
        :key="job.id"
        :label="job.id"
      >
        {{ job.name }} ({{ job.code }})
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useJobStore } from '@/stores/job'

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const jobStore = useJobStore()
const selectedJobIds = ref<number[]>(props.modelValue || [])

watch(() => props.modelValue, (val) => {
  selectedJobIds.value = val
})

watch(selectedJobIds, (val) => {
  emit('update:modelValue', val)
})

onMounted(() => {
  jobStore.fetchJobs()
})
</script>

<style scoped>
.job-selector {
  max-height: 300px;
  overflow-y: auto;
}
</style>
