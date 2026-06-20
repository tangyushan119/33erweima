<script setup lang="ts">
import { ref, computed } from 'vue'
import { BarChart3, Download, Search, TrendingUp, Users, Building2, Calendar } from 'lucide-vue-next'

interface ApplicationRecord {
  id: string
  unitName: string
  creditCode: string
  contactName: string
  contactPhone: string
  address: string
  createTime: string
  status: 'approved'
}

const searchKeyword = ref('')

const records = ref<ApplicationRecord[]>([
  {
    id: '1',
    unitName: '示例科技有限公司',
    creditCode: '91110101MA01A1A1A1',
    contactName: '张三',
    contactPhone: '13800138000',
    address: '北京市朝阳区科技园区A座1001室',
    createTime: '2026-06-20 10:30:00',
    status: 'approved',
  },
  {
    id: '2',
    unitName: '测试数据有限公司',
    creditCode: '91110102MA02B2B2B2',
    contactName: '李四',
    contactPhone: '13900139000',
    address: '上海市浦东新区软件园B座2002室',
    createTime: '2026-06-19 15:45:00',
    status: 'approved',
  },
  {
    id: '3',
    unitName: '演示企业管理有限公司',
    creditCode: '91110103MA03C3C3C3',
    contactName: '王五',
    contactPhone: '13700137000',
    address: '广州市天河区科技园C座3003室',
    createTime: '2026-06-18 09:00:00',
    status: 'approved',
  },
  {
    id: '4',
    unitName: '示范信息技术有限公司',
    creditCode: '91110104MA04D4D4D4',
    contactName: '赵六',
    contactPhone: '13600136000',
    address: '深圳市南山区科技园D座4004室',
    createTime: '2026-06-17 14:20:00',
    status: 'approved',
  },
])

const filteredRecords = computed(() => {
  if (!searchKeyword.value) return records.value
  return records.value.filter(record => 
    record.unitName.includes(searchKeyword.value) ||
    record.contactName.includes(searchKeyword.value) ||
    record.creditCode.includes(searchKeyword.value)
  )
})

const stats = computed(() => [
  {
    label: '已审核单位',
    value: records.value.length,
    icon: Building2,
    color: 'blue',
  },
  {
    label: '本月新增',
    value: 4,
    icon: TrendingUp,
    color: 'green',
  },
  {
    label: '联系人总数',
    value: records.value.length,
    icon: Users,
    color: 'purple',
  },
  {
    label: '数据采集天数',
    value: '7',
    icon: Calendar,
    color: 'orange',
  },
])

const handleExport = () => {
  const data = records.value.map(r => ({
    '单位名称': r.unitName,
    '统一社会信用代码': r.creditCode,
    '联系人': r.contactName,
    '联系电话': r.contactPhone,
    '地址': r.address,
    '创建时间': r.createTime,
  }))
  
  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `单位数据_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <BarChart3 class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">数据应用</h2>
          <p class="text-sm text-gray-500">查询和统计已审核的数据</p>
        </div>
      </div>
      
      <button
        @click="handleExport"
        class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <Download class="w-4 h-4" />
        导出数据
      </button>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ stat.value }}</p>
          </div>
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            :class="{
              'bg-blue-100': stat.color === 'blue',
              'bg-green-100': stat.color === 'green',
              'bg-purple-100': stat.color === 'purple',
              'bg-orange-100': stat.color === 'orange',
            }"
          >
            <component 
              :is="stat.icon" 
              class="w-6 h-6"
              :class="{
                'text-blue-600': stat.color === 'blue',
                'text-green-600': stat.color === 'green',
                'text-purple-600': stat.color === 'purple',
                'text-orange-600': stat.color === 'orange',
              }"
            />
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
          placeholder="搜索单位名称、联系人或信用代码"
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="record in filteredRecords" 
          :key="record.id"
          class="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ record.unitName }}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">信用代码:</span>
              <span class="text-gray-700 font-mono">{{ record.creditCode }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">联系人:</span>
              <span class="text-gray-700">{{ record.contactName }} ({{ record.contactPhone }})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">地址:</span>
              <span class="text-gray-700">{{ record.address }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">创建时间:</span>
              <span class="text-gray-500">{{ record.createTime }}</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <TrendingUp class="w-3 h-3" />
              已审核通过
            </span>
          </div>
        </div>
      </div>

      <div v-if="filteredRecords.length === 0" class="py-12 text-center">
        <BarChart3 class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">暂无数据</p>
      </div>
    </div>
  </div>
</template>
