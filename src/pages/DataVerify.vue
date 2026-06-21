<script setup lang="ts">
import { ref, computed } from 'vue'
import { ClipboardCheck, CheckCircle, XCircle, Search, Filter, Clock, User, MapPin, CheckSquare, Square, Download, AlertCircle, Car, Building2 } from 'lucide-vue-next'
import { useDataStore, type VehicleRecord } from '@/stores/dataStore'
import { exportToExcel, exportToCsv, validateExportData, type ExportFieldConfig, type ExportValidationResult } from '@/lib/export'

const searchKeyword = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const selectedIds = ref<string[]>([])
const exportFormat = ref<'excel' | 'csv'>('excel')
const showExportModal = ref(false)
const validationResult = ref<ExportValidationResult | null>(null)

const dataStore = useDataStore()

interface AuditRecord extends VehicleRecord {
  recordType?: 'vehicle' | 'unit'
}

const allRecords = computed((): AuditRecord[] => [
  ...dataStore.pendingRecords.map(r => ({ ...r, recordType: 'unit' as const })),
  ...dataStore.approvedRecords.map(r => ({ ...r, recordType: 'unit' as const })),
  ...dataStore.rejectedRecords.map(r => ({ ...r, recordType: 'unit' as const })),
  ...dataStore.vehiclePendingRecords.map(r => ({ ...r, recordType: 'vehicle' as const })),
  ...dataStore.vehicleApprovedRecords.map(r => ({ ...r, recordType: 'vehicle' as const })),
  ...dataStore.vehicleRejectedRecords.map(r => ({ ...r, recordType: 'vehicle' as const })),
])

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
]

const typeOptions = [
  { value: 'all', label: '全部' },
  { value: 'unit', label: '单位' },
  { value: 'vehicle', label: '车辆' },
]

const filteredRecords = computed(() => {
  let result = allRecords.value
  
  if (filterStatus.value !== 'all') {
    result = result.filter(record => record.status === filterStatus.value)
  }
  
  if (filterType.value !== 'all') {
    result = result.filter(record => record.recordType === filterType.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(record => {
      if (record.recordType === 'vehicle') {
        return record.plateNumber.toLowerCase().includes(keyword) ||
               record.vehicleBrand.toLowerCase().includes(keyword) ||
               record.ownerName.toLowerCase().includes(keyword) ||
               record.unitName.toLowerCase().includes(keyword)
      } else {
        return record.unitName.toLowerCase().includes(keyword) ||
               record.contactName.toLowerCase().includes(keyword) ||
               record.creditCode.toLowerCase().includes(keyword)
      }
    })
  }
  
  return result
})

const pendingCount = computed(() => 
  dataStore.pendingRecords.length + dataStore.vehiclePendingRecords.length
)

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

const handleApprove = (id: string, recordType: 'unit' | 'vehicle') => {
  if (recordType === 'vehicle') {
    dataStore.approveVehicleRecord(id)
  } else {
    dataStore.approveRecord(id)
  }
  selectedIds.value = selectedIds.value.filter(i => i !== id)
}

const handleReject = (id: string, recordType: 'unit' | 'vehicle') => {
  const reason = prompt('请输入驳回原因：')
  if (reason !== null) {
    if (recordType === 'vehicle') {
      dataStore.rejectVehicleRecord(id, reason)
    } else {
      dataStore.rejectRecord(id)
    }
  }
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
  const unitIds: string[] = []
  const vehicleIds: string[] = []
  
  pendingRecords.value.forEach(r => {
    if (r.recordType === 'vehicle') {
      vehicleIds.push(r.id)
    } else {
      unitIds.push(r.id)
    }
  })
  
  if (unitIds.length > 0) {
    dataStore.batchApproveRecords(unitIds)
  }
  if (vehicleIds.length > 0) {
    vehicleIds.forEach(id => dataStore.approveVehicleRecord(id))
  }
  
  selectedIds.value = []
}

const handleBatchReject = () => {
  if (selectedIds.value.length === 0) return
  const reason = prompt('请输入驳回原因：')
  if (reason === null) return
  
  const unitIds: string[] = []
  const vehicleIds: string[] = []
  
  pendingRecords.value.forEach(r => {
    if (r.recordType === 'vehicle') {
      vehicleIds.push(r.id)
    } else {
      unitIds.push(r.id)
    }
  })
  
  if (unitIds.length > 0) {
    dataStore.batchRejectRecords(unitIds)
  }
  if (vehicleIds.length > 0) {
    vehicleIds.forEach(id => dataStore.rejectVehicleRecord(id, reason))
  }
  
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

const exportFields: ExportFieldConfig[] = [
  { key: 'recordType', label: '记录类型', formatter: (v) => (v === 'vehicle' ? '车辆' : '单位') },
  { key: 'unitName', label: '单位名称' },
  { key: 'plateNumber', label: '车牌号' },
  { key: 'creditCode', label: '统一社会信用代码' },
  { key: 'contactName', label: '联系人/车主' },
  { key: 'contactPhone', label: '联系电话/车主电话' },
  { key: 'address', label: '地址' },
  { key: 'vehicleType', label: '车辆类型' },
  { key: 'vehicleBrand', label: '车辆品牌' },
  { key: 'vehicleModel', label: '车辆型号' },
  { key: 'createTime', label: '创建时间' },
  { key: 'status', label: '状态', formatter: (v) => getStatusText(v as string) },
]

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
      fileName: '数据核实记录',
      sheetName: '审核列表',
    })
  } else {
    exportToCsv({
      data: filteredRecords.value,
      fields: exportFields,
      fileName: '数据核实记录',
    })
  }
  
  showExportModal.value = false
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
        <button
          @click="handleExport"
          class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Download class="w-4 h-4" />
          导出数据
        </button>
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
            placeholder="搜索单位名称、车牌号、联系人..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-gray-400" />
          <select
            v-model="filterType"
            @change="handleFilterChange"
            class="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
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
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">记录类型</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">名称/车牌号</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">信用代码/VIN</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">联系人/车主</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">地址/类型</th>
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
                <div class="flex items-center gap-2">
                  <Building2 v-if="record.recordType === 'unit'" class="w-4 h-4 text-blue-500" />
                  <Car v-else class="w-4 h-4 text-green-500" />
                  <span class="text-sm font-medium text-gray-700">{{ record.recordType === 'unit' ? '单位' : '车辆' }}</span>
                </div>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm font-medium text-gray-800">
                  {{ record.recordType === 'vehicle' ? record.plateNumber : record.unitName }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm text-gray-600 font-mono">
                  {{ record.recordType === 'vehicle' ? record.vin : record.creditCode }}
                </span>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <User class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">
                    {{ record.recordType === 'vehicle' ? record.ownerName : record.contactName }}
                  </span>
                  <span class="text-sm text-gray-400">
                    {{ record.recordType === 'vehicle' ? record.ownerPhone : record.contactPhone }}
                  </span>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <MapPin class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600 truncate max-w-[200px]">
                    {{ record.recordType === 'vehicle' ? (record.vehicleType + ' ' + record.vehicleBrand + ' ' + record.vehicleModel) : record.address }}
                  </span>
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
                    @click="handleApprove(record.id, record.recordType || 'unit')"
                    class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle class="w-4 h-4" />
                    通过
                  </button>
                  <button
                    v-if="record.status === 'pending'"
                    @click="handleReject(record.id, record.recordType || 'unit')"
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
