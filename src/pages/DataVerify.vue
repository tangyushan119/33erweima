<script setup lang="ts">
import { ref } from 'vue'
import { ClipboardCheck, CheckCircle, XCircle, Search, Filter, Clock, User, MapPin } from 'lucide-vue-next'

interface VerifyRecord {
  id: string
  unitName: string
  creditCode: string
  contactName: string
  contactPhone: string
  address: string
  createTime: string
  status: 'pending' | 'approved' | 'rejected'
}

const searchKeyword = ref('')
const filterStatus = ref('all')

const records = ref<VerifyRecord[]>([
  {
    id: '1',
    unitName: '示例科技有限公司',
    creditCode: '91110101MA01A1A1A1',
    contactName: '张三',
    contactPhone: '13800138000',
    address: '北京市朝阳区科技园区A座1001室',
    createTime: '2026-06-20 10:30:00',
    status: 'pending',
  },
  {
    id: '2',
    unitName: '测试数据有限公司',
    creditCode: '91110102MA02B2B2B2',
    contactName: '李四',
    contactPhone: '13900139000',
    address: '上海市浦东新区软件园B座2002室',
    createTime: '2026-06-19 15:45:00',
    status: 'pending',
  },
  {
    id: '3',
    unitName: '演示企业管理有限公司',
    creditCode: '91110103MA03C3C3C3',
    contactName: '王五',
    contactPhone: '13700137000',
    address: '广州市天河区科技园C座3003室',
    createTime: '2026-06-18 09:00:00',
    status: 'approved',
  },
])

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
]

const filteredRecords = ref(records.value)

const handleSearch = () => {
  filteredRecords.value = records.value.filter(record => 
    record.unitName.includes(searchKeyword.value) ||
    record.contactName.includes(searchKeyword.value) ||
    record.creditCode.includes(searchKeyword.value)
  )
}

const handleFilterChange = () => {
  if (filterStatus.value === 'all') {
    filteredRecords.value = records.value
  } else {
    filteredRecords.value = records.value.filter(record => record.status === filterStatus.value)
  }
}

const handleApprove = (id: string) => {
  const record = records.value.find(r => r.id === id)
  if (record) {
    record.status = 'approved'
    handleFilterChange()
  }
}

const handleReject = (id: string) => {
  const record = records.value.find(r => r.id === id)
  if (record) {
    record.status = 'rejected'
    handleFilterChange()
  }
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
          <span class="text-sm font-medium text-yellow-700">{{ records.filter(r => r.status === 'pending').length }} 条待审核</span>
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

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
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
