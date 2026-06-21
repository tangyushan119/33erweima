<script setup lang="ts">
import { Building2, Info } from 'lucide-vue-next'
import UnitForm from '@/components/UnitForm.vue'
import { useDataStore, type UnitRecord } from '@/stores/dataStore'
import { useRecordManagement } from '@/composables/useRecordManagement'

const dataStore = useDataStore()

const {
  searchKeyword,
  editingRecord,
  activeTab,
  filteredRecords,
  handleSubmit,
  handleSave,
  handleEdit,
  handleDelete,
  handleReset,
  getStatusText,
  getStatusClass,
} = useRecordManagement<UnitRecord>({
  getPendingRecords: () => dataStore.pendingRecords,
  getApprovedRecords: () => dataStore.approvedRecords,
  getRejectedRecords: () => dataStore.rejectedRecords,
  addRecord: (data) => dataStore.addPendingRecord(data as Omit<UnitRecord, 'id' | 'createTime' | 'status'>),
  updateRecord: (id, data) => {
    const record = dataStore.pendingRecords.find(r => r.id === id) || dataStore.rejectedRecords.find(r => r.id === id)
    if (record) {
      Object.assign(record, data)
      dataStore.saveRecords()
    }
  },
  deleteRecord: (id) => {
    dataStore.pendingRecords = dataStore.pendingRecords.filter(r => r.id !== id)
    dataStore.approvedRecords = dataStore.approvedRecords.filter(r => r.id !== id)
    dataStore.rejectedRecords = dataStore.rejectedRecords.filter(r => r.id !== id)
    dataStore.saveRecords()
  },
  toggleActiveStatus: () => {},
  searchFields: (record) => [
    record.unitName,
    record.creditCode,
    record.contactName,
    record.contactPhone,
    record.address,
  ],
})

const editingUnit = editingRecord
const filteredUnits = filteredRecords
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Building2 class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">单位录入</h2>
          <p class="text-sm text-gray-500">填写单位基本信息，提交审核后正式生效</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-800">
              {{ editingUnit ? '编辑单位信息' : '新增单位信息' }}
            </h3>
            <button
              v-if="editingUnit"
              @click="handleReset"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              取消编辑
            </button>
          </div>
          <UnitForm 
            @submit="handleSubmit" 
            @save="handleSave"
            @reset="handleReset"
            :edit-data="editingUnit || null"
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
                <li>统一社会信用代码为18位</li>
                <li>联系电话请填写11位手机号</li>
                <li>带<span class="text-red-500">*</span>为必填项</li>
                <li>保存草稿后需提交审核才生效</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">单位列表</h3>
            <span class="text-xs text-gray-500">共 {{ filteredUnits.length }} 个</span>
          </div>

          <div class="flex gap-2 mb-4">
            <button
              @click="activeTab = 'pending'"
              class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              :class="activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              待审核 ({{ dataStore.pendingRecords.length }})
            </button>
            <button
              @click="activeTab = 'approved'"
              class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              :class="activeTab === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              已通过 ({{ dataStore.approvedRecords.length }})
            </button>
            <button
              @click="activeTab = 'rejected'"
              class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              :class="activeTab === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              已驳回 ({{ dataStore.rejectedRecords.length }})
            </button>
          </div>
          
          <div class="relative mb-4">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索单位名称、信用代码..."
              class="w-full pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div v-if="filteredUnits.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
            <div 
              v-for="unit in filteredUnits.slice(0, 10)" 
              :key="unit.id"
              class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-800">{{ unit.unitName }}</span>
                  <span 
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(unit.status)"
                  >
                    {{ getStatusText(unit.status) }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <template v-if="unit.status !== 'approved'">
                    <button
                      @click="handleEdit(unit)"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                  </template>
                  <button
                    @click="handleDelete(unit.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
              <div class="text-xs text-gray-500 space-y-1">
                <p class="font-mono">{{ unit.creditCode }}</p>
                <p>{{ unit.contactName }} | {{ unit.contactPhone }}</p>
                <p class="truncate">{{ unit.address }}</p>
              </div>
            </div>
            <div v-if="filteredUnits.length > 10" class="text-center text-sm text-gray-500 py-2">
              还有 {{ filteredUnits.length - 10 }} 条记录...
            </div>
          </div>
          <div v-else class="text-center py-4">
            <Building2 class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-400">暂无单位记录</p>
          </div>
        </div>
      </div>
    </div>
  </div