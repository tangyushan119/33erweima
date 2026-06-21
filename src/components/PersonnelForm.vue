<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Send, RotateCcw, CheckCircle } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'

interface PersonnelFormData {
  name: string
  idCard: string
  phone: string
  gender: string
  age: string
  department: string
  position: string
  unitId: string
  unitName: string
}

const emit = defineEmits<{
  (e: 'submit', data: PersonnelFormData): void
  (e: 'save', data: PersonnelFormData): void
  (e: 'reset'): void
}>()

const props = defineProps<{
  editData?: PersonnelFormData | null
}>()

const dataStore = useDataStore()

const genders = ['男', '女']

const formData = reactive<PersonnelFormData>({
  name: '',
  idCard: '',
  phone: '',
  gender: '',
  age: '',
  department: '',
  position: '',
  unitId: '',
  unitName: '',
})

const errors = reactive<Partial<PersonnelFormData>>({})
const showSuccess = ref(false)
const isSubmitting = ref(false)

watch(() => props.editData, (newData) => {
  if (newData) {
    Object.assign(formData, newData)
  }
}, { immediate: true })

const parseIdCard = (idCard: string) => {
  if (!idCard) return
  
  const cleanIdCard = idCard.replace(/\s/g, '').toUpperCase()
  
  if (cleanIdCard.length === 18 && /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(cleanIdCard)) {
    const year = parseInt(cleanIdCard.substring(6, 10))
    const month = parseInt(cleanIdCard.substring(10, 12))
    const day = parseInt(cleanIdCard.substring(12, 14))
    
    const today = new Date()
    let age = today.getFullYear() - year
    
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) {
      age--
    }
    
    formData.age = age.toString()
    
    const genderCode = parseInt(cleanIdCard.substring(16, 17))
    formData.gender = genderCode % 2 === 1 ? '男' : '女'
  }
}

watch(() => formData.idCard, (newIdCard) => {
  parseIdCard(newIdCard)
})

const validateForm = (): boolean => {
    Object.keys(errors).forEach(key => delete errors[key as keyof PersonnelFormData])

    if (!formData.name.trim()) {
      errors.name = '请输入姓名'
    } else if (!/^[\u4e00-\u9fa5]{2,4}(·[\u4e00-\u9fa5]{2,4})?$/.test(formData.name)) {
      errors.name = '请输入2-4个汉字的中文姓名（少数民族姓名可带间隔号）'
    }

    if (!formData.idCard.trim()) {
      errors.idCard = '请输入身份证号'
    } else if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(formData.idCard)) {
      errors.idCard = '身份证号格式不正确'
    }

  if (!formData.phone.trim()) {
    errors.phone = '请输入联系电话'
  } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    errors.phone = '联系电话格式不正确'
  }

  if (!formData.gender.trim()) {
    errors.gender = '请选择性别'
  }

  if (!formData.age.trim()) {
    errors.age = '请输入年龄'
  } else if (!/^\d{1,3}$/.test(formData.age) || parseInt(formData.age) <= 0 || parseInt(formData.age) > 150) {
    errors.age = '年龄格式不正确'
  }

  if (!formData.department.trim()) {
    errors.department = '请输入部门'
  }

  if (!formData.position.trim()) {
    errors.position = '请输入职位'
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

const handleSave = () => {
  emit('save', { ...formData })
}

const handleReset = () => {
  formData.name = ''
  formData.idCard = ''
  formData.phone = ''
  formData.gender = ''
  formData.age = ''
  formData.department = ''
  formData.position = ''
  formData.unitId = ''
  formData.unitName = ''
  Object.keys(errors).forEach(key => delete errors[key as keyof PersonnelFormData])
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
            姓名 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="请输入姓名"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            身份证号 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.idCard"
            type="text"
            placeholder="请输入18位身份证号"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase"
            :class="errors.idCard ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.idCard" class="text-sm text-red-500">{{ errors.idCard }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            联系电话 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.phone"
            type="tel"
            placeholder="请输入11位手机号码"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.phone" class="text-sm text-red-500">{{ errors.phone }}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            性别 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.gender"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          >
            <option value="">请选择性别</option>
            <option v-for="gender in genders" :key="gender" :value="gender">{{ gender }}</option>
          </select>
          <p v-if="errors.gender" class="text-sm text-red-500">{{ errors.gender }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            年龄 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.age"
            type="text"
            inputmode="numeric"
            placeholder="请输入年龄"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.age" class="text-sm text-red-500">{{ errors.age }}</p>
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
            部门 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.department"
            type="text"
            placeholder="请输入部门"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.department" class="text-sm text-red-500">{{ errors.department }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            职位 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.position"
            type="text"
            placeholder="请输入职位"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :class="errors.position ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.position" class="text-sm text-red-500">{{ errors.position }}</p>
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