<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Send, RotateCcw, CheckCircle } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'
import { checkImageDuplicate, type ImageFields } from '@/lib/imageUtils'

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

const imageUploadRefs = {
  overallImage: ref<HTMLInputElement | null>(null),
  nameplateImage: ref<HTMLInputElement | null>(null),
}

const imageLabels: Record<string, string> = {
  overallImage: '装备整体实拍照片',
  nameplateImage: '装备铭牌照片',
}

const getImageIdField = (field: keyof EquipmentFormData): keyof EquipmentFormData => {
  return `${field}Id` as keyof EquipmentFormData
}

const handleImageUpload = (field: keyof EquipmentFormData, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  
  if (checkImageDuplicate(file, formData as ImageFields, field)) {
    alert('该图片已上传，请选择其他图片')
    target.value = ''
    return
  }
  
  const fileIdentifier = `${file.name}-${file.size}-${file.lastModified}`
  
  const reader = new FileReader()
  reader.onload = (e) => {
    formData[field] = e.target?.result as string
    const idField = getImageIdField(field)
    formData[idField] = fileIdentifier
  }
  reader.readAsDataURL(file)
  
  target.value = ''
}

const removeImage = (field: keyof EquipmentFormData) => {
  formData[field] = ''
  const idField = getImageIdField(field)
  formData[idField] = ''
  const input = imageUploadRefs[field as keyof typeof imageUploadRefs]
  if (input.value) {
    input.value.value = ''
  }
}

const errors = reactive<Partial<EquipmentFormData>>({})
const showSuccess = ref(false)
const isSubmitting = ref(false)

watch(() => props.editData, (newData) => {
  if (newData) {
    Object.assign(formData, newData)
  }
}, { immediate: true })

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key as keyof EquipmentFormData])

  if (!formData.equipmentName.trim()) {
    errors.equipmentName = '请输入装备名称'
  }

  if (!formData.equipmentCode.trim()) {
    errors.equipmentCode = '请输入装备编号'
  } else if (!/^[A-Za-z0-9\-]{3,20}$/.test(formData.equipmentCode)) {
    errors.equipmentCode = '装备编号格式不正确，应为3-20位字母数字组合'
  }

  if (!formData.equipmentType.trim()) {
    errors.equipmentType = '请选择装备类型'
  }

  if (!formData.specification.trim()) {
    errors.specification = '请输入规格型号'
  }

  if (!formData.manufacturer.trim()) {
    errors.manufacturer = '请输入生产厂家'
  }

  if (!formData.purchaseDate.trim()) {
    errors.purchaseDate = '请选择购买日期'
  }

  if (!formData.price.trim()) {
    errors.price = '请输入购买价格'
  } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
    errors.price = '购买价格格式不正确'
  }

  if (!formData.unitId.trim()) {
    errors.unitId = '请选择所属单位'
  }

  if (!formData.userName.trim()) {
    errors.userName = '请输入使用人姓名'
  }

  if (!formData.userPhone.trim()) {
    errors.userPhone = '请输入使用人电话'
  } else if (!/^1[3-9]\d{9}$/.test(formData.userPhone)) {
    errors.userPhone = '使用人电话格式不正确'
  }

  if (!formData.location.trim()) {
    errors.location = '请输入存放位置'
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

const handleSave = () => {
  emit('save', { ...formData })
}

const handleReset = () => {
  formData.equipmentName = ''
  formData.equipmentCode = ''
  formData.equipmentType = ''
  formData.specification = ''
  formData.manufacturer = ''
  formData.purchaseDate = ''
  formData.price = ''
  formData.unitId = ''
  formData.unitName = ''
  formData.userName = ''
  formData.userPhone = ''
  formData.location = ''
  formData.overallImage = ''
  formData.overallImageId = ''
  formData.nameplateImage = ''
  formData.nameplateImageId = ''
  Object.keys(imageUploadRefs).forEach(key => {
    const input = imageUploadRefs[key as keyof typeof imageUploadRefs]
    if (input.value) {
      input.value.value = ''
    }
  })
  Object.keys(errors).forEach(key => delete errors[key as keyof EquipmentFormData])
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
              @click="removeImage(field as keyof EquipmentFormData)"
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
              @click="imageUploadRefs[field as keyof typeof imageUploadRefs].value?.click()"
            >
              <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm text-gray-500">{{ label }}</span>
            </div>
            <input
              :ref="(el) => { imageUploadRefs[field as keyof typeof imageUploadRefs].value = el as HTMLInputElement }"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageUpload(field as keyof EquipmentFormData, $event)"
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