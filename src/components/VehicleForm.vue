<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Send, RotateCcw, CheckCircle } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'
import { useImageUpload } from '@/composables/useImageUpload'
import { validateForm, validateRequired, validateSelect, validatePlateNumber, validateVin, validatePhone, validateName } from '@/lib/validation'

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
  frontImage?: string
  backImage?: string
  leftImage?: string
  rightImage?: string
  frontImageId?: string
  backImageId?: string
  leftImageId?: string
  rightImageId?: string
}

const emit = defineEmits<{
  (e: 'submit', data: VehicleFormData): void
  (e: 'save', data: VehicleFormData): void
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
  frontImage: '',
  backImage: '',
  leftImage: '',
  rightImage: '',
  frontImageId: '',
  backImageId: '',
  leftImageId: '',
  rightImageId: '',
})

const { uploadErrors, handleImageUpload, removeImage, registerUploadRef, triggerUpload } = useImageUpload(formData)

const imageLabels: Record<string, string> = {
  frontImage: '车辆前方',
  backImage: '车辆后方',
  leftImage: '车辆左侧',
  rightImage: '车辆右侧',
}

const errors = reactive<Record<string, string>>({})
const showSuccess = ref(false)
const isSubmitting = ref(false)

watch(() => props.editData, (newData) => {
  if (newData) {
    Object.assign(formData, newData)
  }
}, { immediate: true })

const validators: Record<keyof VehicleFormData, (value: unknown) => string | null> = {
  plateNumber: (value) => validatePlateNumber(value as string),
  vehicleType: (value) => validateSelect(value as string, '车辆类型'),
  vehicleBrand: (value) => validateRequired(value as string, '车辆品牌'),
  vehicleModel: (value) => validateRequired(value as string, '车辆型号'),
  vehicleColor: (value) => validateSelect(value as string, '车辆颜色'),
  engineNumber: (value) => validateRequired(value as string, '发动机号'),
  vin: (value) => validateVin(value as string),
  registerDate: (value) => validateRequired(value as string, '注册日期'),
  ownerName: (value) => validateName(value as string),
  ownerPhone: (value) => validatePhone(value as string),
  unitId: (value) => validateSelect(value as string, '所属单位'),
  unitName: () => null,
  frontImage: () => null,
  backImage: () => null,
  leftImage: () => null,
  rightImage: () => null,
  frontImageId: () => null,
  backImageId: () => null,
  leftImageId: () => null,
  rightImageId: () => null,
}

const validateFormData = (): boolean => {
  const result = validateForm(formData, validators)
  Object.keys(errors).forEach(key => delete errors[key])
  Object.assign(errors, result.errors)
  return result.isValid
}

const handleUnitChange = (unitId: string) => {
  const unit = dataStore.approvedRecords.find(u => u.id === unitId)
  formData.unitName = unit?.unitName || ''
}

const handleSubmit = async () => {
  if (!validateFormData()) return

  isSubmitting.value = true

  await new Promise(resolve => setTimeout(resolve, 500))

  emit('submit', { ...formData })

  showSuccess.value = true
  isSubmitting.value = false

  setTimeout(() => {
    showSuccess.value = false
  }, 2000)
}

const handleSave = () => {
  emit('save', { ...formData })
}

const handleReset = () => {
  Object.keys(formData).forEach(key => {
    formData[key as keyof VehicleFormData] = '' as VehicleFormData[keyof VehicleFormData]
  })
  Object.keys(errors).forEach(key => delete errors[key])
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

      <div class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">车辆四方位照片</label>
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="(label, field) in imageLabels"
            :key="field"
            class="relative group"
          >
            <div
              v-if="formData[field as keyof VehicleFormData]"
              class="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors"
              @click="removeImage(field)"
            >
              <img
                :src="formData[field as keyof VehicleFormData]"
                :alt="label"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-white text-sm">点击删除</span>
              </div>
            </div>
            <div
              v-else
              class="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              @click="triggerUpload(field)"
            >
              <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm text-gray-500">{{ label }}</span>
            </div>
            <p v-if="uploadErrors[field]" class="text-sm text-red-500 mt-1">{{ uploadErrors[field] }}</p>
            <input
              :ref="(el) => registerUploadRef(field, el as HTMLInputElement)"
              type="file"
              accept="image/*"
              class="hidden"
              @change="(e) => handleImageUpload(field, e)"
            />
          </div>
        </div>
        <p class="text-xs text-gray-500">支持上传车辆前、后、左、右四个方位的实拍照片，用于完善车辆档案</p>
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
          type="button"
          @click="handleSave"
          :disabled="isSubmitting"
          class="flex items-center gap-2 px-6 py-3 border border-blue-300 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存草稿
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send class="w-4 h-4" :class="{ 'animate-pulse': isSubmitting }" />
          {{ isSubmitting ? '提交中...' : '提交审核' }}
        </button>
      </div>
    </form>
  </div>
</template>