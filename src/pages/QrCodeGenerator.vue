<script setup lang="ts">
import { ref, computed } from 'vue'
import QRCode from 'qrcode'
import { QrCode, Plus, Download, Copy, Eye, ToggleLeft, ToggleRight, Search } from 'lucide-vue-next'
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()

const searchKeyword = ref('')
const showCreateModal = ref(false)

const formData = ref({
  name: '',
  description: '',
})

const selectedQrCode = ref<typeof dataStore.qrCodeRecords.value[0] | null>(null)

const filteredQrCodes = computed(() => {
  let result = dataStore.qrCodeRecords
  if (!searchKeyword.value) return result
  const keyword = searchKeyword.value.toLowerCase()
  return result.filter(r => 
    r.name.toLowerCase().includes(keyword) ||
    r.description.toLowerCase().includes(keyword)
  )
})

const generateQrCode = async () => {
  const baseUrl = window.location.origin
  const qrCodeId = Date.now().toString()
  const formUrl = `/mobile/form/${qrCodeId}`
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(baseUrl + formUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
    
    const newRecord = dataStore.addQrCodeRecord({
      name: formData.value.name,
      description: formData.value.description,
      formUrl: formUrl,
      qrCodeDataUrl: qrCodeDataUrl,
      status: 'active',
    })
    
    selectedQrCode.value = newRecord
    showCreateModal.value = false
    
    formData.value = { name: '', description: '' }
  } catch (error) {
    console.error('二维码生成失败:', error)
  }
}

const handleDownload = async (qrCodeDataUrl: string, name: string) => {
  const link = document.createElement('a')
  link.href = qrCodeDataUrl
  link.download = `${name}_${Date.now()}.png`
  link.click()
}

const handleCopy = async (qrCodeDataUrl: string) => {
  try {
    const response = await fetch(qrCodeDataUrl)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const handleToggleStatus = (id: string) => {
  dataStore.toggleQrCodeStatus(id)
}

const handlePreview = (record: typeof dataStore.qrCodeRecords.value[0]) => {
  selectedQrCode.value = record
}

const getStatusStyle = (status: string) => {
  return status === 'active' 
    ? 'bg-green-100 text-green-700' 
    : 'bg-gray-100 text-gray-700'
}

const getStatusText = (status: string) => {
  return status === 'active' ? '启用中' : '已停用'
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <QrCode class="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">二维码管理</h2>
          <p class="text-sm text-gray-500">生成和管理数据采集二维码</p>
        </div>
      </div>
      
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <Plus class="w-4 h-4" />
        生成二维码
      </button>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">二维码总数</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ dataStore.qrCodeRecords.length }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <QrCode class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">启用中</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ dataStore.qrCodeRecords.filter(r => r.status === 'active').length }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <ToggleRight class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">总扫码量</p>
            <p class="text-2xl font-bold text-purple-600 mt-1">{{ dataStore.qrCodeRecords.reduce((sum, r) => sum + r.scanCount, 0) }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Eye class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">待审核数据</p>
            <p class="text-2xl font-bold text-yellow-600 mt-1">{{ dataStore.pendingRecords.length }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Search class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="relative flex-1 max-w-md mb-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索二维码名称或描述"
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div 
          v-for="record in filteredQrCodes" 
          :key="record.id"
          class="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-800 truncate flex-1">{{ record.name }}</h3>
            <span 
              class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ml-2"
              :class="getStatusStyle(record.status)"
            >
              {{ getStatusText(record.status) }}
            </span>
          </div>
          
          <div class="bg-white rounded-lg p-3 border border-gray-200 mb-3">
            <img 
              :src="record.qrCodeDataUrl" 
              :alt="record.name"
              class="w-full h-auto max-h-32 object-contain"
            />
          </div>
          
          <p class="text-xs text-gray-500 mb-3 line-clamp-2">{{ record.description }}</p>
          
          <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
            <span>扫码量: {{ record.scanCount }}</span>
            <span>{{ record.createTime }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <button
              @click="handlePreview(record)"
              class="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Eye class="w-4 h-4" />
              预览
            </button>
            <button
              @click="handleToggleStatus(record.id)"
              class="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <component :is="record.status === 'active' ? ToggleLeft : ToggleRight" class="w-4 h-4" />
              {{ record.status === 'active' ? '停用' : '启用' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredQrCodes.length === 0" class="py-12 text-center">
        <QrCode class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">暂无二维码记录</p>
        <button
          @click="showCreateModal = true"
          class="mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          生成第一个二维码
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div 
        v-if="showCreateModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showCreateModal = false"
      >
        <div class="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in">
          <h3 class="text-lg font-bold text-gray-800 mb-4">生成采集二维码</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                二维码名称 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="请输入二维码名称"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="请输入二维码描述"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              ></textarea>
            </div>
          </div>
          
          <div class="flex items-center justify-end gap-4 mt-6">
            <button
              @click="showCreateModal = false"
              class="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              @click="generateQrCode"
              :disabled="!formData.name.trim()"
              class="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              生成
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div 
        v-if="selectedQrCode" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="selectedQrCode = null"
      >
        <div class="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">{{ selectedQrCode.name }}</h3>
            <button 
              @click="selectedQrCode = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="bg-gray-50 rounded-xl p-6 mb-4">
            <img 
              :src="selectedQrCode.qrCodeDataUrl" 
              :alt="selectedQrCode.name"
              class="w-64 h-64 mx-auto object-contain"
            />
          </div>
          
          <p class="text-sm text-gray-600 mb-4">{{ selectedQrCode.description }}</p>
          
          <div class="flex items-center justify-between text-xs text-gray-400 mb-4">
            <span>扫码量: {{ selectedQrCode.scanCount }}</span>
            <span>{{ selectedQrCode.createTime }}</span>
          </div>
          
          <div class="flex items-center gap-3">
            <button
              @click="handleDownload(selectedQrCode.qrCodeDataUrl, selectedQrCode.name)"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Download class="w-4 h-4" />
              下载
            </button>
            <button
              @click="handleCopy(selectedQrCode.qrCodeDataUrl)"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Copy class="w-4 h-4" />
              复制
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>