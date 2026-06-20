<script setup lang="ts">
import { ref } from 'vue'
import { Building2, Info } from 'lucide-vue-next'
import UnitForm from '@/components/UnitForm.vue'

interface UnitData {
  unitName: string
  creditCode: string
  contactName: string
  contactPhone: string
  address: string
  qrCodeUrl: string
}

const recentRecords = ref<UnitData[]>([
  {
    unitName: '示例科技有限公司',
    creditCode: '91110101MA01A1A1A1',
    contactName: '张三',
    contactPhone: '13800138000',
    address: '北京市朝阳区科技园区A座1001室',
    qrCodeUrl: '',
  },
])

const handleSubmit = (data: UnitData) => {
  recentRecords.value.unshift(data)
}
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
          <p class="text-sm text-gray-500">填写单位基本信息，完成数据采集</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <UnitForm @submit="handleSubmit" />
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
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">最近录入</h3>
          <div v-if="recentRecords.length > 0" class="space-y-3">
            <div 
              v-for="(record, index) in recentRecords.slice(0, 3)" 
              :key="index"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <p class="text-sm font-medium text-gray-800 truncate">{{ record.unitName }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ record.contactName }} - {{ record.contactPhone }}</p>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <p class="text-sm text-gray-400">暂无录入记录</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
