<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Send, RotateCcw, CheckCircle } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'

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

const emit = defineEmits<{
  (e: 'submit', data: VehicleFormData): void
  (e: 'reset'): void
}>()

const props = defineProps<{
  editData?: VehicleFormData | null
}>()

const dataStore = useDataStore()

const vehicleTypes = [
  '小型客车',
  '中型客车',
  '大型客车',
  '小型货车',
  '中型货车',
  '大型货车',
  '牵引车',
  '挂车',
  '专项作业车',
]

const vehicleColors = [
  '黑色',
  '白色',
  '银色',
  '灰色',
  '红色',
  '蓝色',
  '黄色',
  '绿色',
  '棕色',
  '紫色',
]

const formData = reactive<VehicleFormData>({
  plateNumber: '',
  vehicleType: '',
  vehicleBrand: '',
  vehicleModel: '',
  vehicleColor: '',
  engineNumber: '',
  vin: '',
  registerDate: '',
  ownerName: '',
  ownerPhone: '',
  unitId: '',
  unitName: '',
})

const errors = reactive<Partial<VehicleFormData>>({})
const showSuccess = ref(false)
const isSubmitting = ref(false)

watch(() => props.editData, (newData) => {
  if (newData) {
    Object.assign(formData, newData)
  }
}, { immediate: true })

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key as keyof VehicleFormData])

  if (!formData.plateNumber.trim()) {
    errors.plateNumber = '请输入车牌号'
  } else if (!/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/.test(formData.plateNumber.toUpperCase())) {
    errors.plateNumber = '车牌号格式不正确'
  }

  if (!formData.vehicleType.trim()) {
    errors.vehicleType = '请选择车辆类型'
  }

  if (!formData.vehicleBrand.trim()) {
    errors.vehicleBrand = '请输入车辆品牌'
  }

  if (!formData.vehicleModel.trim()) {
    errors.vehicleModel = '请输入车辆型号'
  }

  if (!formData.vehicleColor.trim()) {
    errors.vehicleColor = '请选择车辆颜色'
  }

  if (!formData.engineNumber.trim()) {
    errors.engineNumber = '请输入发动机号'
  }

  if (!formData.vin.trim()) {
    errors.vin = '请输入车辆识别代号(VIN)'
  } else if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(formData.vin.toUpperCase())) {
    errors.vin = '车辆识别代号(VIN)格式不正确，应为17位'
  }

  if (!formData.registerDate.trim()) {
    errors.registerDate = '请选择注册日期'
  }

  if (!formData.ownerName.trim()) {
    errors.ownerName = '请输入车主姓名'
  }

  if (!formData.ownerPhone.trim()) {
    errors.ownerPhone = '请输入车主电话'
  } else if (!/^1[3-9]\d{9}$/.test(formData.ownerPhone)) {
    errors.ownerPhone = '车主电话格式不正确'
  }

  if (!formData.unitId.trim()) {
    errors.unitId = '请选择所属单位'
  }

  return Object.keys(errors).length === 0
}

const handleUnitChange = (unitId: string) => {
  const unit = dataStore.approvedRecords.find(u => u.id === unitId)
  formData.unitName = unit?.unitName || ''
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  await new Promise(resolve => setTimeout(resolve, 500))

  emit('submit', { ...formData })

  showSuccess.value = true
  isSubmitting.value = false

  setTimeout(() => {
    showSuccess.value = false
  }, 2000)
}

const handleReset = () => {
  formData.plateNumber = ''
  formData.vehicleType = ''
  formData.vehicleBrand = ''
  formData.vehicleModel = ''
  formData.vehicleColor = ''
  formData.engineNumber = ''
  formData.vin = ''
  formData.registerDate = ''
  formData.ownerName = ''
  formData.ownerPhone = ''
  formData.unitId = ''
  formData.unitName = ''
  Object.keys(errors).forEach(key => delete errors[key as keyof VehicleFormData])
  emit('reset')
}
</script>

<template>
  <div class="animate-fade-in">
    <div 
      v-if="showSuccess" 
      class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-slide-down"
    >
      <CheckCircle class="w-6 h-6 text-green-600" />
      <span class="text-green-700 font-medium">数据提交成功！</span>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-3 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            车牌号 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.plateNumber"
            type="text"
            placeholder="请输入车牌号"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase"
            :class="errors.plateNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.plateNumber" class="text-sm text-red-500">{{ errors.plateNumber }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            车辆类型 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.vehicleType"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.vehicleType ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          >
            <option value="">请选择车辆类型</option>
            <option v-for="type in vehicleTypes" :key="type" :value="type">{{ type }}</option>
          </select>
          <p v-if="errors.vehicleType" class="text-sm text-red-500">{{ errors.vehicleType }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            车辆颜色 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.vehicleColor"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.vehicleColor ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          >
            <option value="">请选择车辆颜色</option>
            <option v-for="color in vehicleColors" :key="color" :value="color">{{ color }}</option>
          </select>
          <p v-if="errors.vehicleColor" class="text-sm text-red-500">{{ errors.vehicleColor }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            车辆品牌 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.vehicleBrand"
            type="text"
            placeholder="请输入车辆品牌"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.vehicleBrand ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.vehicleBrand" class="text-sm text-red-500">{{ errors.vehicleBrand }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            车辆型号 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.vehicleModel"
            type="text"
            placeholder="请输入车辆型号"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.vehicleModel ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.vehicleModel" class="text-sm text-red-500">{{ errors.vehicleModel }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            发动机号 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.engineNumber"
            type="text"
            placeholder="请输入发动机号"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase"
            :class="errors.engineNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.engineNumber" class="text-sm text-red-500">{{ errors.engineNumber }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            车辆识别代号(VIN) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.vin"
            type="text"
            placeholder="请输入17位VIN码"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase"
            :class="errors.vin ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.vin" class="text-sm text-red-500">{{ errors.vin }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            注册日期 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.registerDate"
            type="date"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.registerDate ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.registerDate" class="text-sm text-red-500">{{ errors.registerDate }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            所属单位 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.unitId"
            @change="handleUnitChange(formData.unitId)"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.unitId ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          >
            <option value="">请选择所属单位</option>
            <option v-for="unit in dataStore.approvedRecords" :key="unit.id" :value="unit.id">{{ unit.unitName }}</option>
          </select>
          <p v-if="errors.unitId" class="text-sm text-red-500">{{ errors.unitId }}</p>
          <p v-if="formData.unitName" class="text-sm text-gray-500 mt-1">{{ formData.unitName }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            车主姓名 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.ownerName"
            type="text"
            placeholder="请输入车主姓名"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.ownerName ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.ownerName" class="text-sm text-red-500">{{ errors.ownerName }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            车主电话 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.ownerPhone"
            type="tel"
            placeholder="请输入11位手机号码"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.ownerPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.ownerPhone" class="text-sm text-red-500">{{ errors.ownerPhone }}</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          @click="handleReset"
          class="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
        >
          <RotateCcw class="w-4 h-4" />
          重置
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send class="w-4 h-4" :class="{ 'animate-pulse': isSubmitting }" />
          {{ isSubmitting ? '提交中...' : '提交' }}
        </button>
      </div>
    </form>
  </div>
</template>
