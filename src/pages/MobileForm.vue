<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Send, CheckCircle, Building2, User, Phone, MapPin, FileText } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'

const route = useRoute()
const dataStore = useDataStore()

const qrCodeId = route.params.id as string

const formData = reactive({
  unitName: '',
  creditCode: '',
  contactName: '',
  contactPhone: '',
  address: '',
})

const errors = reactive<Partial<typeof formData>>({})
const showSuccess = ref(false)
const isSubmitting = ref(false)

onMounted(() => {
  dataStore.updateQrCodeScanCount(qrCodeId)
})

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key as keyof typeof formData])
  
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
    qrCodeUrl: '',
    qrCodeId: qrCodeId,
  })
  
  showSuccess.value = true
  isSubmitting.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-blue-600 text-white p-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Building2 class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-lg font-bold">单位信息采集</h1>
          <p class="text-blue-100 text-sm">填写单位基本信息，提交后等待审核</p>
        </div>
      </div>
    </div>

    <div class="p-4">
      <div v-if="showSuccess" class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <CheckCircle class="w-8 h-8 text-green-600 flex-shrink-0" />
        <div>
          <p class="text-green-800 font-semibold">提交成功</p>
          <p class="text-green-600 text-sm">您的信息已提交，等待管理员审核</p>
        </div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building2 class="w-4 h-4 text-blue-500" />
            单位名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.unitName"
            type="text"
            placeholder="请输入单位名称"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            :class="errors.unitName ? 'border-red-300 bg-red-50' : 'border-gray-200'"
          />
          <p v-if="errors.unitName" class="text-sm text-red-500">{{ errors.unitName }}</p>
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText class="w-4 h-4 text-blue-500" />
            统一社会信用代码 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.creditCode"
            type="text"
            placeholder="请输入18位统一社会信用代码"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
            :class="errors.creditCode ? 'border-red-300 bg-red-50' : 'border-gray-200'"
          />
          <p v-if="errors.creditCode" class="text-sm text-red-500">{{ errors.creditCode }}</p>
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User class="w-4 h-4 text-blue-500" />
            联系人姓名 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.contactName"
            type="text"
            placeholder="请输入联系人姓名"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            :class="errors.contactName ? 'border-red-300 bg-red-50' : 'border-gray-200'"
          />
          <p v-if="errors.contactName" class="text-sm text-red-500">{{ errors.contactName }}</p>
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone class="w-4 h-4 text-blue-500" />
            联系电话 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.contactPhone"
            type="tel"
            placeholder="请输入11位手机号码"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            :class="errors.contactPhone ? 'border-red-300 bg-red-50' : 'border-gray-200'"
          />
          <p v-if="errors.contactPhone" class="text-sm text-red-500">{{ errors.contactPhone }}</p>
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin class="w-4 h-4 text-blue-500" />
            单位地址 <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="formData.address"
            rows="4"
            placeholder="请输入单位详细地址"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            :class="errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'"
          ></textarea>
          <p v-if="errors.address" class="text-sm text-red-500">{{ errors.address }}</p>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          <Send class="w-5 h-5" :class="{ 'animate-pulse': isSubmitting }" />
          {{ isSubmitting ? '提交中...' : '提交' }}
        </button>

        <p class="text-xs text-gray-400 text-center">
          提交即表示您同意我们的隐私政策
        </p>
      </form>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
      <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
        <span>二维码ID:</span>
        <span class="font-mono">{{ qrCodeId }}</span>
      </div>
    </div>
  </div>
</template>