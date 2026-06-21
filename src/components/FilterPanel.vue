<script setup lang="ts">
import { ref, computed } from 'vue'
import { Filter, X, Search, Calendar, ChevronDown } from 'lucide-vue-next'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  type: 'input' | 'select' | 'date' | 'dateRange'
  key: string
  label: string
  placeholder?: string
  options?: FilterOption[]
  default?: string | string[]
}

const props = defineProps<{
  filters: FilterConfig[]
}>()

const emit = defineEmits<{
  (e: 'filter', values: Record<string, string | string[]>): void
  (e: 'reset'): void
}>()

const isExpanded = ref(false)
const filterValues = ref<Record<string, string | string[]>>({})

const activeFilters = computed(() => {
  return Object.entries(filterValues.value).filter(
    ([, value]) => value !== '' && value !== undefined && value !== null
  ).length
})

const handleInputChange = (key: string, value: string | string[]) => {
  filterValues.value[key] = value
  emit('filter', { ...filterValues.value })
}

const handleReset = () => {
  filterValues.value = {}
  emit('reset')
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <div 
      class="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
      @click="toggleExpand"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Filter class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">筛选条件</h3>
          <p class="text-sm text-gray-500">
            <span v-if="activeFilters > 0" class="text-blue-600 font-medium">{{ activeFilters }}</span>
            <span v-else>0</span> 个筛选条件
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="activeFilters > 0"
          @click.stop="handleReset"
          class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X class="w-4 h-4" />
          重置
        </button>
        <ChevronDown 
          class="w-5 h-5 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </div>

    <div 
      v-show="isExpanded"
      class="px-6 pb-6"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="filter in filters" :key="filter.key" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">{{ filter.label }}</label>
          
          <div v-if="filter.type === 'input'" class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              :value="(filterValues[filter.key] as string) || ''"
              @input="handleInputChange(filter.key, ($event.target as HTMLInputElement).value)"
              type="text"
              :placeholder="filter.placeholder || ''"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div v-else-if="filter.type === 'select'" class="relative">
            <select
              :value="(filterValues[filter.key] as string) || ''"
              @change="handleInputChange(filter.key, ($event.target as HTMLSelectElement).value)"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">请选择</option>
              <option 
                v-for="option in filter.options" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div v-else-if="filter.type === 'date'" class="relative">
            <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              :value="(filterValues[filter.key] as string) || ''"
              @input="handleInputChange(filter.key, ($event.target as HTMLInputElement).value)"
              type="date"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div v-else-if="filter.type === 'dateRange'" class="flex gap-2">
            <div class="relative flex-1">
              <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                :value="((filterValues[filter.key] as string[]) || [])[0] || ''"
                @input="handleInputChange(filter.key, [($event.target as HTMLInputElement).value, ((filterValues[filter.key] as string[]) || [])[1] || ''])"
                type="date"
                placeholder="开始日期"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div class="relative flex-1">
              <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                :value="((filterValues[filter.key] as string[]) || [])[1] || ''"
                @input="handleInputChange(filter.key, [((filterValues[filter.key] as string[]) || [])[0] || '', ($event.target as HTMLInputElement).value])"
                type="date"
                placeholder="结束日期"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
