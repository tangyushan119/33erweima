<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Send, RotateCcw, CheckCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'

interface UnitFormData {
  unitName: string
  creditCode: string
  contactName: string
  contactPhone: string
  address: string
  qrCodeUrl: string
}

const emit = defineEmits<{
  (e: 'submit', data: UnitFormData): void
}>()

const router = useRouter()
const dataStore = useDataStore()

const formData = reactive<UnitFormData>({
  unitName: '',
  creditCode: '',
  contactName: '',
  contactPhone: '',
  address: '',
  qrCodeUrl: '',
})

const errors = reactive<Partial<UnitFormData>>({})
const showSuccess = ref(false)
const isSubmitting = ref(false)

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key as keyof UnitFormData])
  
  if (!formData.unitName.trim()) {
    errors.unitName = '请输入单位名称'
  }
  
  if (!formData.creditCode.trim()) {
    errors.creditCode = '请输入统一社会信用代码'
  } else if (!/^[0-9A-Z]{18}$/.test(formData.creditCode)) {
    errors.creditCode = '统一社会信用代码格式不正确'
  }
  
  if (!formData.contactName.trim()) {
    errors.contactName = '请输入联系人姓名'
  }
  
  if (!formData.contactPhone.trim()) {
    errors.contactPhone = '请输入联系电话'
  } else if (!/^1[3-9]\d{9}$/.test(formData.contactPhone)) {
    errors.contactPhone = '联系电话格式不正确'
  }
  
  if (!formData.address.trim()) {
    errors.address = '请输入单位地址'
  }
  
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  dataStore.addPendingRecord({
    unitName: formData.unitName,
    creditCode: formData.creditCode,
    contactName: formData.contactName,
    contactPhone: formData.contactPhone,
    address: formData.address,
    qrCodeUrl: formData.qrCodeUrl,
  })
  
  emit('submit', { ...formData })
  
  showSuccess.value = true
  isSubmitting.value = false
  
  setTimeout(() => {
    router.push('/data-verify')
  }, 1500)
}

const handleReset = () => {
  formData.unitName = ''
  formData.creditCode = ''
  formData.contactName = ''
  formData.contactPhone = ''
  formData.address = ''
  formData.qrCodeUrl = ''
  Object.keys(errors).forEach(key => delete errors[key as keyof UnitFormData])
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
      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            单位名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.unitName"
            type="text"
            placeholder="请输入单位名称"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.unitName ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.unitName" class="text-sm text-red-500">{{ errors.unitName }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            统一社会信用代码 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.creditCode"
            type="text"
            placeholder="请输入18位统一社会信用代码"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase"
            :class="errors.creditCode ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.creditCode" class="text-sm text-red-500">{{ errors.creditCode }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            联系人姓名 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.contactName"
            type="text"
            placeholder="请输入联系人姓名"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.contactName ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.contactName" class="text-sm text-red-500">{{ errors.contactName }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            联系电话 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.contactPhone"
            type="tel"
            placeholder="请输入11位手机号码"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.contactPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.contactPhone" class="text-sm text-red-500">{{ errors.contactPhone }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          单位地址 <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="formData.address"
          rows="3"
          placeholder="请输入单位详细地址"
          class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
          :class="errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'"
        ></textarea>
        <p v-if="errors.address" class="text-sm text-red-500">{{ errors.address }}</p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          二维码URL
        </label>
        <input
          v-model="formData.qrCodeUrl"
          type="url"
          placeholder="请输入二维码图片地址（可选）"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
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
