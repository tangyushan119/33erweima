<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Send, RotateCcw, CheckCircle } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'
import { validateForm, validateCode, validateRequired, validateSelect, validateDateNotFuture, validateDateAfter, validatePressure, validateInspector, validatePhone, validateModel, validateSpecification, validateMaxLength, validateForbiddenChars } from '@/lib/validation'

interface FireHydrantFormData {
  hydrantCode: string
  hydrantName: string
  hydrantType: string
  model: string
  specification: string
  installationDate: string
  pressure: string
  location: string
  unitId: string
  unitName: string
  checkDate: string
  nextCheckDate: string
  manufacturer: string
  inspector: string
  inspectorPhone: string
}

const emit = defineEmits<{
  (e: 'submit', data: FireHydrantFormData): void
  (e: 'save', data: FireHydrantFormData): void
  (e: 'reset'): void
}>()

const props = defineProps<{
  editData?: FireHydrantFormData | null
}>()

const dataStore = useDataStore()

const hydrantTypes = [
  '室内消火栓',
  '室外消火栓',
  '地下消火栓',
  '地上消火栓',
  '水泵接合器',
]

const formData = reactive<FireHydrantFormData>({
  hydrantCode: '',
  hydrantName: '',
  hydrantType: '',
  model: '',
  specification: '',
  installationDate: '',
  pressure: '',
  location: '',
  unitId: '',
  unitName: '',
  checkDate: '',
  nextCheckDate: '',
  manufacturer: '',
  inspector: '',
  inspectorPhone: '',
})

const errors = reactive<Record<string, string>>({})
const showSuccess = ref(false)
const isSubmitting = ref(false)

watch(() => props.editData, (newData) => {
  if (newData) {
    Object.assign(formData, newData)
  }
}, { immediate: true })

const validateFormData = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key])

  const validateHydrantName = (value: string): string | null => {
    const result = validateRequired(value, '消火栓名称')
    if (result) return result
    const maxResult = validateMaxLength(value, 50, '消火栓名称')
    if (maxResult) return maxResult
    return validateForbiddenChars(value, '消火栓名称')
  }

  const validateLocation = (value: string): string | null => {
    const result = validateRequired(value, '安装位置')
    if (result) return result
    const maxResult = validateMaxLength(value, 100, '安装位置')
    if (maxResult) return maxResult
    return validateForbiddenChars(value, '安装位置')
  }

  const validateManufacturer = (value: string): string | null => {
    const result = validateRequired(value, '生产厂家')
    if (result) return result
    const maxResult = validateMaxLength(value, 50, '生产厂家')
    if (maxResult) return maxResult
    return validateForbiddenChars(value, '生产厂家')
  }

  const validators: Record<keyof FireHydrantFormData, (value: unknown) => string | null> = {
    hydrantCode: (value) => validateCode(value as string, '消火栓编号'),
    hydrantName: (value) => validateHydrantName(value as string),
    hydrantType: (value) => validateSelect(value as string, '消火栓类型'),
    model: (value) => validateModel(value as string),
    specification: (value) => validateSpecification(value as string),
    installationDate: (value) => validateDateNotFuture(value as string, '安装日期'),
    pressure: (value) => validatePressure(value as string),
    location: (value) => validateLocation(value as string),
    unitId: (value) => validateSelect(value as string, '所属单位'),
    unitName: () => null,
    checkDate: (value) => validateRequired(value as string, '检查日期'),
    nextCheckDate: (value) => validateDateAfter(value as string, formData.checkDate, '下次检查日期'),
    manufacturer: (value) => validateManufacturer(value as string),
    inspector: (value) => validateInspector(value as string),
    inspectorPhone: (value) => validatePhone(value as string),
  }

  const result = validateForm(formData, validators)
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
    formData[key as keyof FireHydrantFormData] = '' as FireHydrantFormData[keyof FireHydrantFormData]
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
            消火栓编号 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.hydrantCode"
            type="text"
            placeholder="请输入消火栓编号"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase"
            :class="errors.hydrantCode ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.hydrantCode" class="text-sm text-red-500">{{ errors.hydrantCode }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            消火栓名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.hydrantName"
            type="text"
            placeholder="请输入消火栓名称"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.hydrantName ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.hydrantName" class="text-sm text-red-500">{{ errors.hydrantName }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            消火栓类型 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.hydrantType"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.hydrantType ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          >
            <option value="">请选择消火栓类型</option>
            <option v-for="type in hydrantTypes" :key="type" :value="type">{{ type }}</option>
          </select>
          <p v-if="errors.hydrantType" class="text-sm text-red-500">{{ errors.hydrantType }}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            型号 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.model"
            type="text"
            placeholder="请输入型号"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.model ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.model" class="text-sm text-red-500">{{ errors.model }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            规格 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.specification"
            type="text"
            placeholder="请输入规格"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.specification ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.specification" class="text-sm text-red-500">{{ errors.specification }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            安装日期 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.installationDate"
            type="date"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.installationDate ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.installationDate" class="text-sm text-red-500">{{ errors.installationDate }}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            压力值 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.pressure"
            type="text"
            placeholder="请输入压力值，例如：0.35MPa"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.pressure ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.pressure" class="text-sm text-red-500">{{ errors.pressure }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            安装位置 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.location"
            type="text"
            placeholder="请输入安装位置"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.location" class="text-sm text-red-500">{{ errors.location }}</p>
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

      <div class="grid grid-cols-3 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            检查日期 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.checkDate"
            type="date"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.checkDate ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.checkDate" class="text-sm text-red-500">{{ errors.checkDate }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            下次检查日期 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.nextCheckDate"
            type="date"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.nextCheckDate ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.nextCheckDate" class="text-sm text-red-500">{{ errors.nextCheckDate }}</p>
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
            检查人 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.inspector"
            type="text"
            placeholder="请输入检查人姓名"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.inspector ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.inspector" class="text-sm text-red-500">{{ errors.inspector }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            检查人电话 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.inspectorPhone"
            type="tel"
            placeholder="请输入11位手机号码"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.inspectorPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.inspectorPhone" class="text-sm text-red-500">{{ errors.inspectorPhone }}</p>
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