<script setup lang="ts">
import { ref, computed } from 'vue'
import { Car, Info, Edit2, Trash2, Eye, EyeOff } from 'lucide-vue-next'
import VehicleForm from '@/components/VehicleForm.vue'
import { useDataStore, type VehicleRecord } from '@/stores/dataStore'

interface VehicleFormData {
  plateNumber: string
  vehicleType: string
  vehicleBrand: string
  vehicleModel: string
  vehicleColor: string
  engineNumber: string
  vin: string
  registerDate: string
  ownerName: string
  ownerPhone: string
  unitId: string
  unitName: string
}

const dataStore = useDataStore()
const searchKeyword = ref('')
const editingVehicle = ref<VehicleRecord | null>(null)
const activeTab = ref<'pending' | 'approved' | 'rejected'>('pending')

const currentRecords = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return dataStore.vehiclePendingRecords
    case 'approved':
      return dataStore.vehicleApprovedRecords
    case 'rejected':
      return dataStore.vehicleRejectedRecords
    default:
      return []
  }
})

const filteredVehicles = computed(() => {
  let vehicles = currentRecords.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    vehicles = vehicles.filter(v =>
      v.plateNumber.toLowerCase().includes(keyword) ||
      v.vehicleBrand.toLowerCase().includes(keyword) ||
      v.vehicleModel.toLowerCase().includes(keyword) ||
      v.ownerName.toLowerCase().includes(keyword) ||
      v.unitName.toLowerCase().includes(keyword)
    )
  }
  
  return vehicles
})

const handleSubmit = (data: VehicleFormData) => {
  if (editingVehicle.value) {
    dataStore.updateVehicleRecord(editingVehicle.value.id, data)
    editingVehicle.value = null
  } else {
    dataStore.addVehicleRecord(data)
  }
}

const handleSave = (data: VehicleFormData) => {
  if (editingVehicle.value) {
    dataStore.updateVehicleRecord(editingVehicle.value.id, data)
    alert('草稿已保存')
  } else {
    dataStore.addVehicleRecord(data)
    alert('草稿已保存')
  }
}

const handleEdit = (vehicle: VehicleRecord) => {
  editingVehicle.value = vehicle
}

const handleDelete = (id: string) => {
  if (confirm('确定要删除这条车辆记录吗？')) {
    dataStore.deleteVehicleRecord(id)
  }
}

const handleToggleStatus = (id: string) => {
  dataStore.toggleVehicleActiveStatus(id)
}

const handleReset = () => {
  editingVehicle.value = null
}

const getStatusText = (status: VehicleRecord['status']) => {
  switch (status) {
    case 'pending': return '待审核'
    case 'approved': return '已通过'
    case 'rejected': return '已驳回'
    default: return ''
  }
}

const getStatusClass = (status: VehicleRecord['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'approved': return 'bg-green-100 text-green-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <Car class="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">车辆录入</h2>
          <p class="text-sm text-gray-500">填写车辆基本信息，提交审核后正式生效</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-800">
              {{ editingVehicle ? '编辑车辆信息' : '新增车辆信息' }}
            </h3>
            <button
              v-if="editingVehicle"
              @click="handleReset"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              取消编辑
            </button>
          </div>
          <VehicleForm 
            @submit="handleSubmit" 
            @save="handleSave"
            @reset="handleReset"
            :edit-data="editingVehicle || null"
          />
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <div class="flex items-start gap-3">
            <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="text-sm font-semibold text-blue-800 mb-1">录入说明</h3>
              <ul class="text-xs text-blue-600 space-y-1.5">
                <li>车牌号需符合国标格式</li>
                <li>VIN码为17位字母数字组合</li>
                <li>联系电话请填写11位手机号</li>
                <li>带<span class="text-red-500">*</span>为必填项</li>
                <li>保存草稿后需提交审核才生效</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">车辆列表</h3>
            <span class="text-xs text-gray-500">共 {{ filteredVehicles.length }} 辆</span>
          </div>

          <div class="flex gap-2 mb-4">
            <button
              @click="activeTab = 'pending'"
              class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              :class="activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              待审核 ({{ dataStore.vehiclePendingRecords.length }})
            </button>
            <button
              @click="activeTab = 'approved'"
              class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              :class="activeTab === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              已通过 ({{ dataStore.vehicleApprovedRecords.length }})
            </button>
            <button
              @click="activeTab = 'rejected'"
              class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              :class="activeTab === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              已驳回 ({{ dataStore.vehicleRejectedRecords.length }})
            </button>
          </div>
          
          <div class="relative mb-4">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索车牌、品牌、车主..."
              class="w-full pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div v-if="filteredVehicles.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
            <div 
              v-for="vehicle in filteredVehicles.slice(0, 10)" 
              :key="vehicle.id"
              class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-800">{{ vehicle.plateNumber }}</span>
                  <span 
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(vehicle.status)"
                  >
                    {{ getStatusText(vehicle.status) }}
                  </span>
                  <span 
                    v-if="vehicle.status === 'approved'"
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="vehicle.activeStatus === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ vehicle.activeStatus === 'active' ? '启用' : '停用' }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <template v-if="vehicle.status === 'approved'">
                    <button
                      @click="handleToggleStatus(vehicle.id)"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      :title="vehicle.activeStatus === 'active' ? '停用' : '启用'"
                    >
                      <Eye v-if="vehicle.activeStatus === 'active'" class="w-4 h-4" />
                      <EyeOff v-else class="w-4 h-4" />
                    </button>
                  </template>
                  <template v-if="vehicle.status !== 'approved'">
                    <button
                      @click="handleEdit(vehicle)"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                  </template>
                  <button
                    @click="handleDelete(vehicle.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="text-xs text-gray-500 space-y-1">
                <p>{{ vehicle.vehicleBrand }} {{ vehicle.vehicleModel }} | {{ vehicle.vehicleType }}</p>
                <p>{{ vehicle.ownerName }} | {{ vehicle.ownerPhone }}</p>
                <p class="truncate">{{ vehicle.unitName }}</p>
                <p v-if="vehicle.rejectReason" class="text-red-500">驳回原因：{{ vehicle.rejectReason }}</p>
              </div>
            </div>
            <div v-if="filteredVehicles.length > 10" class="text-center text-sm text-gray-500 py-2">
              还有 {{ filteredVehicles.length - 10 }} 条记录...
            </div>
          </div>
          <div v-else class="text-center py-4">
            <Car class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-400">暂无车辆记录</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
