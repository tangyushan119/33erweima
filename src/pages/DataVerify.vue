<script setup lang="ts">
import { ref, computed } from 'vue'
import { ClipboardCheck, CheckCircle, XCircle, Search, Filter, Clock, User, MapPin, CheckSquare, Square } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'

const searchKeyword = ref('')
const filterStatus = ref('all')
const selectedIds = ref<string[]>([])

const dataStore = useDataStore()

const allRecords = computed(() => [
  ...dataStore.pendingRecords,
  ...dataStore.approvedRecords,
  ...dataStore.rejectedRecords,
])

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
]

const filteredRecords = computed(() => {
  let result = allRecords.value
  
  if (filterStatus.value !== 'all') {
    result = result.filter(record => record.status === filterStatus.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(record => 
      record.unitName.toLowerCase().includes(keyword) ||
      record.contactName.toLowerCase().includes(keyword) ||
      record.creditCode.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const pendingCount = computed(() => dataStore.pendingRecords.length)

const pendingRecords = computed(() => {
  return filteredRecords.value.filter(r => r.status === 'pending')
})

const isAllSelected = computed(() => {
  return pendingRecords.value.length > 0 && 
         pendingRecords.value.every(r => selectedIds.value.includes(r.id))
})

const handleSearch = () => {}

const handleFilterChange = () => {
  selectedIds.value = []
}

const handleApprove = (id: string) => {
  dataStore.approveRecord(id)
  selectedIds.value = selectedIds.value.filter(i => i !== id)
}

const handleReject = (id: string) => {
  dataStore.rejectRecord(id)
  selectedIds.value = selectedIds.value.filter(i => i !== id)
}

const handleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = pendingRecords.value.map(r => r.id)
  }
}

const handleSelectOne = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const handleBatchApprove = () => {
  if (selectedIds.value.length === 0) return
  dataStore.batchApproveRecords(selectedIds.value)
  selectedIds.value = []
}

const handleBatchReject = () => {
  if (selectedIds.value.length === 0) return
  dataStore.batchRejectRecords(selectedIds.value)
  selectedIds.value = []
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'approved':
      return 'bg-green-100 text-green-700'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待审核'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已驳回'
    default:
      return '未知'
  }
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <ClipboardCheck class="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">数据核实</h2>
          <p class="text-sm text-gray-500">审核采集的数据，确保信息准确</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
          <Clock class="w-4 h-4 text-yellow-600" />
          <span class="text-sm font-medium text-yellow-700">{{ pendingCount }} 条待审核</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索单位名称、联系人或信用代码"
            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-gray-400" />
          <select
            v-model="filterStatus"
            @change="handleFilterChange"
            class="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="selectedIds.length > 0" class="mb-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
        <span class="text-sm font-medium text-blue-700">已选择 {{ selectedIds.length }} 条记录</span>
        <div class="flex items-center gap-2">
          <button
            @click="handleBatchApprove"
            class="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle class="w-4 h-4" />
            批量通过
          </button>
          <button
            @click="handleBatchReject"
            class="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <XCircle class="w-4 h-4" />
            批量驳回
          </button>
          <button
            @click="selectedIds = []"
            class="px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消选择
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-3 px-4">
                <button
                  v-if="pendingRecords.length > 0"
                  @click="handleSelectAll"
                  class="flex items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <CheckSquare v-if="isAllSelected" class="w-5 h-5" />
                  <Square v-else class="w-5 h-5" />
                </button>
              </th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">单位名称</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">统一社会信用代码</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">联系人</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">地址</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">创建时间</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
              <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in filteredRecords" :key="record.id" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="py-4 px-4">
                <button
                  v-if="record.status === 'pending'"
                  @click="handleSelectOne(record.id)"
                  class="flex items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <CheckSquare v-if="selectedIds.includes(record.id)" class="w-5 h-5 text-blue-600" />
                  <Square v-else class="w-5 h-5" />
                </button>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm font-medium text-gray-800">{{ record.unitName }}</span>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm text-gray-600 font-mono">{{ record.creditCode }}</span>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <User class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">{{ record.contactName }}</span>
                  <span class="text-sm text-gray-400">{{ record.contactPhone }}</span>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <MapPin class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600 truncate max-w-[200px]">{{ record.address }}</span>
                </div>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm text-gray-500">{{ record.createTime }}</span>
              </td>
              <td class="py-4 px-4">
                <span 
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusStyle(record.status)"
                >
                  {{ getStatusText(record.status) }}
                </span>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="record.status === 'pending'"
                    @click="handleApprove(record.id)"
                    class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle class="w-4 h-4" />
                    通过
                  </button>
                  <button
                    v-if="record.status === 'pending'"
                    @click="handleReject(record.id)"
                    class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <XCircle class="w-4 h-4" />
                    驳回
                  </button>
                  <span v-else class="text-sm text-gray-400">已处理</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredRecords.length === 0" class="py-12 text-center">
          <ClipboardCheck class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">暂无数据</p>
        </div>
      </div>
    </div>
  </div>
</template>
