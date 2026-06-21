<script setup lang="ts">
import { Wrench, Info, Edit2, Trash2, Eye, EyeOff } from 'lucide-vue-next'
import EquipmentForm from '@/components/EquipmentForm.vue'
import { useDataStore, type EquipmentRecord } from '@/stores/dataStore'
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
  handleToggleStatus,
  handleReset,
  getStatusText,
  getStatusClass,
} = useRecordManagement<EquipmentRecord>({
  getPendingRecords: () => dataStore.equipmentPendingRecords,
  getApprovedRecords: () => dataStore.equipmentApprovedRecords,
  getRejectedRecords: () => dataStore.equipmentRejectedRecords,
  addRecord: (data) => dataStore.addEquipmentRecord(data as Omit<EquipmentRecord, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>),
  updateRecord: (id, data) => dataStore.updateEquipmentRecord(id, data as Partial<Omit<EquipmentRecord, 'id' | 'createTime' | 'status' | 'activeStatus'>>),
  deleteRecord: (id) => dataStore.deleteEquipmentRecord(id),
  toggleActiveStatus: (id) => dataStore.toggleEquipmentActiveStatus(id),
  searchFields: (record) => [
    record.equipmentName,
    record.equipmentCode,
    record.equipmentType,
    record.userName,
    record.unitName,
  ],
})

const editingEquipment = editingRecord
const filteredEquipments = filteredRecords
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <Wrench class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">装备录入</h2>
          <p class="text-sm text-gray-500">填写装备基本信息，提交审核后正式生效</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-800">
              {{ editingEquipment ? '编辑装备信息' : '新增装备信息' }}
            </h3>
            <button
              v-if="editingEquipment"
              @click="handleReset"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              取消编辑
            </button>
          </div>
          <EquipmentForm 
            @submit="handleSubmit" 
            @save="handleSave"
            @reset="handleReset"
            :edit-data="editingEquipment || null"
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
                <li>装备编号为3-20位字母数字组合</li>
                <li>联系电话请填写11位手机号</li>
                <li>带<span class="text-red-500">*</span>为必填项</li>
                <li>保存草稿后需提交审核才生效</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-700">装备列表</h3>
            <span class="text-xs text-gray-500">共 {{ filteredEquipments.length }} 件</span>
          </div>

          <div class="flex gap-2 mb-4">
            <button
              @click="activeTab = 'pending'"
              class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              :class="activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              待审核 ({{ dataStore.equipmentPendingRecords.length }})
            </button>
            <button
              @click="activeTab = 'approved'"
              class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              :class="activeTab === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              已通过 ({{ dataStore.equipmentApprovedRecords.length }})
            </button>
            <button
              @click="activeTab = 'rejected'"
              class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              :class="activeTab === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              已驳回 ({{ dataStore.equipmentRejectedRecords.length }})
            </button>
          </div>
          
          <div class="relative mb-4">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索装备名称、编号、使用人..."
              class="w-full pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div v-if="filteredEquipments.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
            <div 
              v-for="equipment in filteredEquipments.slice(0, 10)" 
              :key="equipment.id"
              class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-800">{{ equipment.equipmentName }}</span>
                  <span 
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(equipment.status)"
                  >
                    {{ getStatusText(equipment.status) }}
                  </span>
                  <span 
                    v-if="equipment.status === 'approved'"
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="equipment.activeStatus === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ equipment.activeStatus === 'active' ? '启用' : '停用' }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <template v-if="equipment.status === 'approved'">
                    <button
                      @click="handleToggleStatus(equipment.id)"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      :title="equipment.activeStatus === 'active' ? '停用' : '启用'"
                    >
                      <Eye v-if="equipment.activeStatus === 'active'" class="w-4 h-4" />
                      <EyeOff v-else class="w-4 h-4" />
                    </button>
                  </template>
                  <template v-if="equipment.status !== 'approved'">
                    <button
                      @click="handleEdit(equipment)"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                  </template>
                  <button
                    @click="handleDelete(equipment.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="text-xs text-gray-500 space-y-1">
                <p>{{ equipment.equipmentCode }} | {{ equipment.equipmentType }}</p>
                <p>{{ equipment.specification }} | {{ equipment.manufacturer }}</p>
                <p>{{ equipment.userName }} | {{ equipment.userPhone }}</p>
                <p class="truncate">{{ equipment.unitName }} | {{ equipment.location }}</p>
                <p v-if="equipment.rejectReason" class="text-red-500">驳回原因：{{ equipment.rejectReason }}</p>
              </div>
            </div>
            <div v-if="filteredEquipments.length > 10" class="text-center text-sm text-gray-500 py-2">
              还有 {{ filteredEquipments.length - 10 }} 条记录...
            </div>
          </div>
          <div v-else class="text-center py-4">
            <Wrench class="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-400">暂无装备记录</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>