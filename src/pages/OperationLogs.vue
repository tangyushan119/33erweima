<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText, Search, Filter, Trash2, User, Clock, Target, Info } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'

const searchKeyword = ref('')
const filterType = ref('all')

const dataStore = useDataStore()

const operationTypeOptions = [
  { value: 'all', label: '全部' },
  { value: 'create', label: '创建' },
  { value: 'approve', label: '审核通过' },
  { value: 'reject', label: '审核驳回' },
  { value: 'batch_approve', label: '批量通过' },
  { value: 'batch_reject', label: '批量驳回' },
  { value: 'scan', label: '扫码' },
  { value: 'toggle_qrcode', label: '二维码状态变更' },
]

const filteredLogs = computed(() => {
  let result = dataStore.operationLogs
  
  if (filterType.value !== 'all') {
    result = result.filter(log => log.operationType === filterType.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(log => 
      log.targetName.toLowerCase().includes(keyword) ||
      log.detail.toLowerCase().includes(keyword) ||
      log.operator.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const getOperationTypeStyle = (type: string) => {
  switch (type) {
    case 'create':
      return 'bg-blue-100 text-blue-700'
    case 'approve':
    case 'batch_approve':
      return 'bg-green-100 text-green-700'
    case 'reject':
    case 'batch_reject':
      return 'bg-red-100 text-red-700'
    case 'scan':
      return 'bg-purple-100 text-purple-700'
    case 'toggle_qrcode':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getOperationTypeText = (type: string) => {
  switch (type) {
    case 'create':
      return '创建'
    case 'approve':
      return '审核通过'
    case 'reject':
      return '审核驳回'
    case 'batch_approve':
      return '批量通过'
    case 'batch_reject':
      return '批量驳回'
    case 'scan':
      return '扫码'
    case 'toggle_qrcode':
      return '二维码状态变更'
    default:
      return '未知'
  }
}

const handleClearLogs = () => {
  if (confirm('确定要清空所有操作日志吗？此操作不可恢复。')) {
    dataStore.clearLogs()
  }
}
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
          <FileText class="w-7 h-7 text-blue-600" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">操作日志</h2>
          <p class="text-sm text-gray-500 mt-1">记录系统操作历史，便于追溯与审计</p>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-lg">
          <FileText class="w-4 h-4 text-gray-500" />
          <span class="text-sm font-medium text-gray-600">{{ dataStore.operationLogs.length }} 条日志</span>
        </div>
        
        <button
          @click="handleClearLogs"
          class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 class="w-4 h-4" />
          清空日志
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="relative flex-1 max-w-lg">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索操作对象、详情或操作人"
            class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-gray-400" />
          <select
            v-model="filterType"
            class="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="option in operationTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="log in filteredLogs"
          :key="log.id"
          class="p-5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-200"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3 flex-wrap">
              <span 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                :class="getOperationTypeStyle(log.operationType)"
              >
                {{ getOperationTypeText(log.operationType) }}
              </span>
              <span class="text-sm text-gray-400">ID: {{ log.targetId }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-sm text-gray-400">
              <Clock class="w-4 h-4" />
              {{ log.createTime }}
            </div>
          </div>
          
          <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 flex items-center justify-center bg-blue-50 rounded-lg flex-shrink-0">
              <Target class="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">操作对象</span>
              <p class="text-base font-medium text-gray-800 mt-0.5 break-all">{{ log.targetName }}</p>
            </div>
          </div>
          
          <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg flex-shrink-0">
              <Info class="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">操作详情</span>
              <p class="text-sm text-gray-600 mt-0.5 leading-relaxed whitespace-pre-wrap break-all">{{ log.detail }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 pt-3 border-t border-gray-100">
            <div class="w-8 h-8 flex items-center justify-center bg-green-50 rounded-lg flex-shrink-0">
              <User class="w-4 h-4 text-green-500" />
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">操作人</span>
              <p class="text-sm text-gray-700 mt-0.5">{{ log.operator }}</p>
            </div>
          </div>
        </div>

        <div v-if="filteredLogs.length === 0" class="py-16 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText class="w-8 h-8 text-gray-300" />
          </div>
          <p class="text-gray-500">暂无操作日志</p>
        </div>
      </div>
    </div>
  </div>
</template>
