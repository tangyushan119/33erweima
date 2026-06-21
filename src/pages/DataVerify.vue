<script setup lang="ts">
import { ref, computed } from 'vue'
import { ClipboardCheck, CheckCircle, XCircle, Search, Filter, Clock, User, MapPin, CheckSquare, Square, Download, AlertCircle, Car, Building2, Wrench, Users, Droplets } from 'lucide-vue-next'
import { useDataStore, type VehicleRecord, type EquipmentRecord, type PersonnelRecord, type FireHydrantRecord, type UnitRecord } from '@/stores/dataStore'
import { exportToExcel, exportToCsv, validateExportData, type ExportFieldConfig, type ExportValidationResult } from '@/lib/export'

type RecordType = 'vehicle' | 'equipment' | 'personnel' | 'fireHydrant' | 'unit'
type AuditRecord = VehicleRecord | EquipmentRecord | PersonnelRecord | FireHydrantRecord | UnitRecord

const searchKeyword = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const selectedIds = ref<string[]>([])
const exportFormat = ref<'excel' | 'csv'>('excel')
const showExportModal = ref(false)
const validationResult = ref<ExportValidationResult | null>(null)

const dataStore = useDataStore()

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
  { value: 'equipment', label: '装备' },
  { value: 'personnel', label: '人员' },
  { value: 'fireHydrant', label: '消火栓' },
]

const getRecordType = (record: AuditRecord): RecordType => {
  if ('plateNumber' in record) return 'vehicle'
  if ('equipmentName' in record) return 'equipment'
  if ('name' in record && 'idCard' in record) return 'personnel'
  if ('hydrantName' in record) return 'fireHydrant'
  return 'unit'
}

const getRecordTypeName = (type: RecordType) => {
  const names: Record<RecordType, string> = {
    vehicle: '车辆',
    equipment: '装备',
    personnel: '人员',
    fireHydrant: '消火栓',
    unit: '单位',
  }
  return names[type]
}

const getRecordTypeIcon = (type: RecordType) => {
  const icons = {
    vehicle: Car,
    equipment: Wrench,
    personnel: Users,
    fireHydrant: Droplets,
    unit: Building2,
  }
  return icons[type]
}

const getRecordTypeColor = (type: RecordType) => {
  const colors = {
    vehicle: 'text-green-500',
    equipment: 'text-purple-500',
    personnel: 'text-blue-500',
    fireHydrant: 'text-red-500',
    unit: 'text-blue-500',
  }
  return colors[type]
}

const getRecordName = (record: AuditRecord) => {
  if ('plateNumber' in record) return record.plateNumber
  if ('equipmentName' in record) return record.equipmentName
  if ('name' in record && 'idCard' in record) return record.name
  if ('hydrantName' in record) return record.hydrantName
  if ('unitName' in record) return record.unitName
  return ''
}

const getRecordIdentifier = (record: AuditRecord) => {
  if ('vin' in record) return record.vin
  if ('equipmentCode' in record) return record.equipmentCode
  if ('idCard' in record) return record.idCard
  if ('hydrantCode' in record) return record.hydrantCode
  if ('creditCode' in record) return record.creditCode
  return ''
}

const getRecordContact = (record: AuditRecord) => {
  if ('ownerName' in record) return record.ownerName
  if ('userName' in record) return record.userName
  if ('name' in record && 'idCard' in record) return record.name
  if ('inspector' in record) return record.inspector
  if ('contactName' in record) return record.contactName
  return ''
}

const getRecordContactPhone = (record: AuditRecord) => {
  if ('ownerPhone' in record) return record.ownerPhone
  if ('userPhone' in record) return record.userPhone
  if ('phone' in record && 'idCard' in record) return record.phone
  if ('inspectorPhone' in record) return record.inspectorPhone
  if ('contactPhone' in record) return record.contactPhone
  return ''
}

const getRecordLocation = (record: AuditRecord) => {
  if ('vehicleType' in record) return `${record.vehicleType} ${record.vehicleBrand} ${record.vehicleModel}`
  if ('equipmentType' in record) return `${record.equipmentType} ${record.specification}`
  if ('hydrantType' in record) return record.location
  if ('address' in record) return record.address
  if ('department' in record) return `${record.department} ${record.position}`
  return ''
}

const allRecords = computed((): (AuditRecord & { recordType: RecordType })[] => [
  ...dataStore.pendingRecords.map(r => ({ ...r, recordType: 'unit' as const })),
  ...dataStore.approvedRecords.map(r => ({ ...r, recordType: 'unit' as const })),
  ...dataStore.rejectedRecords.map(r => ({ ...r, recordType: 'unit' as const })),
  ...dataStore.vehiclePendingRecords.map(r => ({ ...r, recordType: 'vehicle' as const })),
  ...dataStore.vehicleApprovedRecords.map(r => ({ ...r, recordType: 'vehicle' as const })),
  ...dataStore.vehicleRejectedRecords.map(r => ({ ...r, recordType: 'vehicle' as const })),
  ...dataStore.equipmentPendingRecords.map(r => ({ ...r, recordType: 'equipment' as const })),
  ...dataStore.equipmentApprovedRecords.map(r => ({ ...r, recordType: 'equipment' as const })),
  ...dataStore.equipmentRejectedRecords.map(r => ({ ...r, recordType: 'equipment' as const })),
  ...dataStore.personnelPendingRecords.map(r => ({ ...r, recordType: 'personnel' as const })),
  ...dataStore.personnelApprovedRecords.map(r => ({ ...r, recordType: 'personnel' as const })),
  ...dataStore.personnelRejectedRecords.map(r => ({ ...r, recordType: 'personnel' as const })),
  ...dataStore.fireHydrantPendingRecords.map(r => ({ ...r, recordType: 'fireHydrant' as const })),
  ...dataStore.fireHydrantApprovedRecords.map(r => ({ ...r, recordType: 'fireHydrant' as const })),
  ...dataStore.fireHydrantRejectedRecords.map(r => ({ ...r, recordType: 'fireHydrant' as const })),
])

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
      const name = getRecordName(record).toLowerCase()
      const identifier = getRecordIdentifier(record).toLowerCase()
      const contact = getRecordContact(record).toLowerCase()
      const location = getRecordLocation(record).toLowerCase()
      const unitName = 'unitName' in record ? record.unitName.toLowerCase() : ''

      return name.includes(keyword) ||
             identifier.includes(keyword) ||
             contact.includes(keyword) ||
             location.includes(keyword) ||
             unitName.includes(keyword)
    })
  }

  return result
})

const pendingCount = computed(() => 
  dataStore.pendingRecords.length + 
  dataStore.vehiclePendingRecords.length + 
  dataStore.equipmentPendingRecords.length +
  dataStore.personnelPendingRecords.length +
  dataStore.fireHydrantPendingRecords.length
)

const pendingRecords = computed(() => {
  return filteredRecords.value.filter(r => r.status === 'pending')
})

const isAllSelected = computed(() => {
  return pendingRecords.value.length > 0 && 
         pendingRecords.value.every(r => selectedIds.value.includes(r.id))
})

const handleFilterChange = () => {
  selectedIds.value = []
}

const approveRecord = (id: string, recordType: RecordType) => {
  switch (recordType) {
    case 'vehicle':
      dataStore.approveVehicleRecord(id)
      break
    case 'equipment':
      dataStore.approveEquipmentRecord(id)
      break
    case 'personnel':
      dataStore.approvePersonnelRecord(id)
      break
    case 'fireHydrant':
      dataStore.approveFireHydrantRecord(id)
      break
    case 'unit':
      dataStore.approveRecord(id)
      break
  }
  selectedIds.value = selectedIds.value.filter(i => i !== id)
}

const rejectRecord = (id: string, recordType: RecordType) => {
  const reason = prompt('请输入驳回原因：')
  if (reason === null) return

  switch (recordType) {
    case 'vehicle':
      dataStore.rejectVehicleRecord(id, reason)
      break
    case 'equipment':
      dataStore.rejectEquipmentRecord(id, reason)
      break
    case 'personnel':
      dataStore.rejectPersonnelRecord(id, reason)
      break
    case 'fireHydrant':
      dataStore.rejectFireHydrantRecord(id, reason)
      break
    case 'unit':
      dataStore.rejectRecord(id)
      break
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

  const typeGroups: Record<RecordType, string[]> = {
    vehicle: [],
    equipment: [],
    personnel: [],
    fireHydrant: [],
    unit: [],
  }

  pendingRecords.value.forEach(r => {
    if (selectedIds.value.includes(r.id)) {
      typeGroups[r.recordType].push(r.id)
    }
  })

  typeGroups.vehicle.forEach(id => dataStore.approveVehicleRecord(id))
  typeGroups.equipment.forEach(id => dataStore.approveEquipmentRecord(id))
  typeGroups.personnel.forEach(id => dataStore.approvePersonnelRecord(id))
  typeGroups.fireHydrant.forEach(id => dataStore.approveFireHydrantRecord(id))
  
  if (typeGroups.unit.length > 0) {
    dataStore.batchApproveRecords(typeGroups.unit)
  }

  selectedIds.value = []
}

const handleBatchReject = () => {
  if (selectedIds.value.length === 0) return
  const reason = prompt('请输入驳回原因：')
  if (reason === null) return

  const typeGroups: Record<RecordType, string[]> = {
    vehicle: [],
    equipment: [],
    personnel: [],
    fireHydrant: [],
    unit: [],
  }

  pendingRecords.value.forEach(r => {
    if (selectedIds.value.includes(r.id)) {
      typeGroups[r.recordType].push(r.id)
    }
  })

  typeGroups.vehicle.forEach(id => dataStore.rejectVehicleRecord(id, reason))
  typeGroups.equipment.forEach(id => dataStore.rejectEquipmentRecord(id, reason))
  typeGroups.personnel.forEach(id => dataStore.rejectPersonnelRecord(id, reason))
  typeGroups.fireHydrant.forEach(id => dataStore.rejectFireHydrantRecord(id, reason))
  
  if (typeGroups.unit.length > 0) {
    dataStore.batchRejectRecords(typeGroups.unit)
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
  { key: 'recordType', label: '记录类型', formatter: (v) => getRecordTypeName(v as RecordType) },
  { key: 'unitName', label: '单位名称' },
  { key: 'plateNumber', label: '车牌号' },
  { key: 'equipmentName', label: '装备名称' },
  { key: 'name', label: '姓名' },
  { key: 'hydrantName', label: '消火栓名称' },
  { key: 'creditCode', label: '统一社会信用代码' },
  { key: 'equipmentCode', label: '装备编号' },
  { key: 'idCard', label: '身份证号' },
  { key: 'hydrantCode', label: '消火栓编号' },
  { key: 'contactName', label: '联系人' },
  { key: 'contactPhone', label: '联系电话' },
  { key: 'address', label: '地址/位置' },
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
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">编号/VIN</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">联系人</th>
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
                  <component :is="getRecordTypeIcon(record.recordType)" class="w-4 h-4" :class="getRecordTypeColor(record.recordType)" />
                  <span class="text-sm font-medium text-gray-700">{{ getRecordTypeName(record.recordType) }}</span>
                </div>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm font-medium text-gray-800">{{ getRecordName(record) }}</span>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm text-gray-600 font-mono">{{ getRecordIdentifier(record) }}</span>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <User class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">{{ getRecordContact(record) }}</span>
                  <span class="text-sm text-gray-400">{{ getRecordContactPhone(record) }}</span>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <MapPin class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600 truncate max-w-[200px]">{{ getRecordLocation(record) }}</span>
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
                    @click="approveRecord(record.id, record.recordType)"
                    class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle class="w-4 h-4" />
                    通过
                  </button>
                  <button
                    v-if="record.status === 'pending'"
                    @click="rejectRecord(record.id, record.recordType)"
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
</template