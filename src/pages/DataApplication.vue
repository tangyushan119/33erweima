<script setup lang="ts">
import { ref, computed } from 'vue'
import { BarChart3, Download, Search, TrendingUp, Users, Building2, Calendar, AlertCircle, CheckCircle } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'
import FilterPanel, { type FilterConfig } from '@/components/FilterPanel.vue'
import { exportToExcel, exportToCsv, validateExportData, type ExportFieldConfig, type ExportValidationResult } from '@/lib/export'

const searchKeyword = ref('')
const exportFormat = ref<'excel' | 'csv'>('excel')
const showExportModal = ref(false)
const validationResult = ref<ExportValidationResult | null>(null)

const dataStore = useDataStore()

const filterConfig: FilterConfig[] = [
  { type: 'input', key: 'unitName', label: '单位名称', placeholder: '输入单位名称' },
  { type: 'input', key: 'creditCode', label: '统一社会信用代码', placeholder: '输入信用代码' },
  { type: 'input', key: 'contactName', label: '联系人', placeholder: '输入联系人姓名' },
  { type: 'input', key: 'contactPhone', label: '联系电话', placeholder: '输入联系电话' },
  { type: 'input', key: 'address', label: '地址', placeholder: '输入地址关键词' },
  { type: 'dateRange', key: 'dateRange', label: '创建时间' },
]

const filterValues = ref<Record<string, string | string[]>>({})

const filteredRecords = computed(() => {
  let records = dataStore.approvedRecords
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    records = records.filter(record => 
      record.unitName.toLowerCase().includes(keyword) ||
      record.contactName.toLowerCase().includes(keyword) ||
      record.creditCode.toLowerCase().includes(keyword)
    )
  }
  
  if (filterValues.value.unitName) {
    records = records.filter(r => 
      r.unitName.toLowerCase().includes((filterValues.value.unitName as string).toLowerCase())
    )
  }
  
  if (filterValues.value.creditCode) {
    records = records.filter(r => 
      r.creditCode.toLowerCase().includes((filterValues.value.creditCode as string).toLowerCase())
    )
  }
  
  if (filterValues.value.contactName) {
    records = records.filter(r => 
      r.contactName.toLowerCase().includes((filterValues.value.contactName as string).toLowerCase())
    )
  }
  
  if (filterValues.value.contactPhone) {
    records = records.filter(r => 
      r.contactPhone.includes(filterValues.value.contactPhone as string)
    )
  }
  
  if (filterValues.value.address) {
    records = records.filter(r => 
      r.address.toLowerCase().includes((filterValues.value.address as string).toLowerCase())
    )
  }
  
  if (filterValues.value.dateRange) {
    const [startDate, endDate] = filterValues.value.dateRange as string[]
    if (startDate) records = records.filter(r => r.createTime >= startDate)
    if (endDate) records = records.filter(r => r.createTime <= endDate + ' 23:59:59')
  }
  
  return records
})

const stats = computed(() => [
  {
    label: '已审核单位',
    value: dataStore.approvedRecords.length,
    icon: Building2,
    color: 'blue',
  },
  {
    label: '本月新增',
    value: dataStore.approvedRecords.length,
    icon: TrendingUp,
    color: 'green',
  },
  {
    label: '联系人总数',
    value: dataStore.approvedRecords.length,
    icon: Users,
    color: 'purple',
  },
  {
    label: '数据采集天数',
    value: '7',
    icon: Calendar,
    color: 'orange',
  },
])

const exportFields: ExportFieldConfig[] = [
  { key: 'unitName', label: '单位名称', required: true },
  { key: 'creditCode', label: '统一社会信用代码', required: true },
  { key: 'contactName', label: '联系人', required: true },
  { key: 'contactPhone', label: '联系电话', required: true },
  { key: 'address', label: '地址' },
  { key: 'createTime', label: '创建时间' },
]

const handleFilter = (values: Record<string, string | string[]>) => {
  filterValues.value = values
}

const handleFilterReset = () => {
  filterValues.value = {}
}

const handleExport = () => {
  if (filteredRecords.value.length === 0) {
    alert('暂无数据可导出')
    return
  }
  
  validationResult.value = validateExportData(filteredRecords.value, exportFields)
  
  if (!validationResult.value.isValid) {
    showExportModal.value = true
    return
  }
  
  performExport()
}

const performExport = () => {
  if (exportFormat.value === 'excel') {
    exportToExcel({
      data: filteredRecords.value,
      fields: exportFields,
      fileName: '单位数据',
      sheetName: '单位列表',
    })
  } else {
    exportToCsv({
      data: filteredRecords.value,
      fields: exportFields,
      fileName: '单位数据',
    })
  }
  
  showExportModal.value = false
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <BarChart3 class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">数据应用</h2>
          <p class="text-sm text-gray-500">查询和统计已审核的数据</p>
        </div>
      </div>
      
      <button
        @click="handleExport"
        class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <Download class="w-4 h-4" />
        一键导出
      </button>
    </div>

    <div class="mb-6">
      <FilterPanel 
        :filters="filterConfig" 
        @filter="handleFilter"
        @reset="handleFilterReset"
      />
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ stat.value }}</p>
          </div>
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            :class="{
              'bg-blue-100': stat.color === 'blue',
              'bg-green-100': stat.color === 'green',
              'bg-purple-100': stat.color === 'purple',
              'bg-orange-100': stat.color === 'orange',
            }"
          >
            <component 
              :is="stat.icon" 
              class="w-6 h-6"
              :class="{
                'text-blue-600': stat.color === 'blue',
                'text-green-600': stat.color === 'green',
                'text-purple-600': stat.color === 'purple',
                'text-orange-600': stat.color === 'orange',
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="relative flex-1 max-w-md mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索单位名称、联系人或信用代码"
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="record in filteredRecords" 
          :key="record.id"
          class="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ record.unitName }}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">信用代码:</span>
              <span class="text-gray-700 font-mono">{{ record.creditCode }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">联系人:</span>
              <span class="text-gray-700">{{ record.contactName }} ({{ record.contactPhone }})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">地址:</span>
              <span class="text-gray-700">{{ record.address }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">创建时间:</span>
              <span class="text-gray-500">{{ record.createTime }}</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <TrendingUp class="w-3 h-3" />
              已审核通过
            </span>
          </div>
        </div>
      </div>

      <div v-if="filteredRecords.length === 0" class="py-12 text-center">
        <BarChart3 class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">暂无数据</p>
      </div>
    </div>

    <Teleport to="body">
      <div 
        v-if="showExportModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showExportModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle class="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">导出校验提醒</h3>
              <p class="text-sm text-gray-500">检测到数据存在以下问题</p>
            </div>
          </div>

          <div class="px-6 py-4 max-h-60 overflow-y-auto">
            <div v-if="validationResult?.missingFields?.length" class="mb-4">
              <p class="text-sm font-medium text-gray-700 mb-2">缺少必填字段:</p>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="field in validationResult.missingFields" 
                  :key="field"
                  class="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm"
                >
                  {{ exportFields.find(f => f.key === field)?.label || field }}
                </span>
              </div>
            </div>
            
            <div v-if="validationResult?.invalidRows?.length" class="space-y-3">
              <p class="text-sm font-medium text-gray-700">数据行问题:</p>
              <div 
                v-for="row in validationResult.invalidRows.slice(0, 10)" 
                :key="row.index"
                class="p-3 bg-gray-50 rounded-lg"
              >
                <p class="text-sm font-medium text-gray-700">第 {{ row.index }} 行:</p>
                <ul class="mt-1 space-y-1">
                  <li v-for="issue in row.issues" :key="issue" class="text-sm text-red-600">
                    - {{ issue }}
                  </li>
                </ul>
              </div>
              <p v-if="validationResult.invalidRows.length > 10" class="text-sm text-gray-500">
                还有 {{ validationResult.invalidRows.length - 10 }} 行存在问题...
              </p>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="exportFormat" 
                  type="radio" 
                  value="excel" 
                  class="w-4 h-4 text-blue-600"
                />
                <span class="text-sm text-gray-700">Excel (.xlsx)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  v-model="exportFormat" 
                  type="radio" 
                  value="csv" 
                  class="w-4 h-4 text-blue-600"
                />
                <span class="text-sm text-gray-700">CSV (.csv)</span>
              </label>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="showExportModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                @click="performExport"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle class="w-4 h-4" />
                继续导出
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
