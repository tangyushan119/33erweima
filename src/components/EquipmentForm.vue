<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Send, RotateCcw, CheckCircle } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'
import { useImageUpload } from '@/composables/useImageUpload'
import { validateForm, validateRequired, validateCode, validateSelect, validatePrice, validatePhone } from '@/lib/validation'

interface EquipmentFormData {
  equipmentName: string
  equipmentCode: string
  equipmentType: string
  specification: string
  manufacturer: string
  purchaseDate: string
  price: string
  unitId: string
  unitName: string
  userName: string
  userPhone: string
  location: string
  overallImage?: string
  overallImageId?: string
  nameplateImage?: string
  nameplateImageId?: string
}

const emit = defineEmits<{
  (e: 'submit', data: EquipmentFormData): void
  (e: 'save', data: EquipmentFormData): void
  (e: 'reset'): void
}>()

const props = defineProps<{
  editData?: EquipmentFormData | null
}>()

const dataStore = useDataStore()

const equipmentTypes = [
  '电子设备',
  '办公设备',
  '机械设备',
  '仪器仪表',
  '交通工具',
  '家具',
  '其他',
]

const formData = reactive<EquipmentFormData>({
  equipmentName: '',
  equipmentCode: '',
  equipmentType: '',
  specification: '',
  manufacturer: '',
  purchaseDate: '',
  price: '',
  unitId: '',
  unitName: '',
  userName: '',
  userPhone: '',
  location: '',
  overallImage: '',
  overallImageId: '',
  nameplateImage: '',
  nameplateImageId: '',
})

const { uploadErrors, handleImageUpload, removeImage, registerUploadRef, triggerUpload } = useImageUpload(formData)

const imageLabels: Record<string, string> = {
  overallImage: '装备整体实拍照片',
  nameplateImage: '装备铭牌照片',
}

const errors = reactive<Record<string, string>>({})
const showSuccess = ref(false)
const isSubmitting = ref(false)

watch(() => props.editData, (newData) => {
  if (newData) {
    Object.assign(formData, newData)
  }
}, { immediate: true })

const validators: Record<keyof EquipmentFormData, (value: unknown) => string | null> = {
  equipmentName: (value) => validateRequired(value as string, '装备名称'),
  equipmentCode: (value) => validateCode(value as string, '装备编号'),
  equipmentType: (value) => validateSelect(value as string, '装备类型'),
  specification: (value) => validateRequired(value as string, '规格型号'),
  manufacturer: (value) => validateRequired(value as string, '生产厂家'),
  purchaseDate: (value) => validateRequired(value as string, '购买日期'),
  price: (value) => validatePrice(value as string),
  unitId: (value) => validateSelect(value as string, '所属单位'),
  userName: (value) => validateRequired(value as string, '使用人姓名'),
  userPhone: (value) => validatePhone(value as string),
  location: (value) => validateRequired(value as string, '存放位置'),
  overallImage: () => null,
  overallImageId: () => null,
  nameplateImage: () => null,
  nameplateImageId: () => null,
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
    formData[key as keyof EquipmentFormData] = '' as EquipmentFormData[keyof EquipmentFormData]
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
            装备名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.equipmentName"
            type="text"
            placeholder="请输入装备名称"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.equipmentName ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.equipmentName" class="text-sm text-red-500">{{ errors.equipmentName }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            装备编号 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.equipmentCode"
            type="text"
            placeholder="请输入装备编号"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase"
            :class="errors.equipmentCode ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.equipmentCode" class="text-sm text-red-500">{{ errors.equipmentCode }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            装备类型 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.equipmentType"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.equipmentType ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          >
            <option value="">请选择装备类型</option>
            <option v-for="type in equipmentTypes" :key="type" :value="type">{{ type }}</option>
          </select>
          <p v-if="errors.equipmentType" class="text-sm text-red-500">{{ errors.equipmentType }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            规格型号 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.specification"
            type="text"
            placeholder="请输入规格型号"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.specification ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.specification" class="text-sm text-red-500">{{ errors.specification }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            生产厂家 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.manufacturer"
            type="text"
            placeholder="请输入生产厂家"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.manufacturer ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.manufacturer" class="text-sm text-red-500">{{ errors.manufacturer }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            购买日期 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.purchaseDate"
            type="date"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.purchaseDate ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.purchaseDate" class="text-sm text-red-500">{{ errors.purchaseDate }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            购买价格 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.price"
            type="number"
            step="0.01"
            placeholder="请输入购买价格"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.price" class="text-sm text-red-500">{{ errors.price }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
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

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            存放位置 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.location"
            type="text"
            placeholder="请输入存放位置"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.location" class="text-sm text-red-500">{{ errors.location }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            使用人姓名 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.userName"
            type="text"
            placeholder="请输入使用人姓名"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.userName ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.userName" class="text-sm text-red-500">{{ errors.userName }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            使用人电话 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.userPhone"
            type="tel"
            placeholder="请输入11位手机号码"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.userPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.userPhone" class="text-sm text-red-500">{{ errors.userPhone }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">装备资料存档照片</label>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="(label, field) in imageLabels"
            :key="field"
            class="relative group"
          >
            <div
              v-if="formData[field as keyof EquipmentFormData]"
              class="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors"
              @click="removeImage(field)"
            >
              <img
                :src="formData[field as keyof EquipmentFormData]"
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
        <p class="text-xs text-gray-500">支持上传装备整体实拍照片和装备铭牌照片，用于完善装备资料存档素材</p>
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