import { ref, computed } from 'vue'
import type { AuditableRecord } from '@/stores/dataStore'

interface RecordConfig<T extends AuditableRecord> {
  getPendingRecords: () => T[]
  getApprovedRecords: () => T[]
  getRejectedRecords: () => T[]
  addRecord: (data: Partial<T>) => void
  updateRecord: (id: string, data: Partial<T>) => void
  deleteRecord: (id: string) => void
  toggleActiveStatus: (id: string) => void
  searchFields: (record: T) => string[]
}

export const useRecordManagement = <T extends AuditableRecord>(config: RecordConfig<T>) => {
  const searchKeyword = ref('')
  const editingRecord = ref<T | null>(null)
  const activeTab = ref<'pending' | 'approved' | 'rejected'>('pending')

  const currentRecords = computed(() => {
    switch (activeTab.value) {
      case 'pending':
        return config.getPendingRecords()
      case 'approved':
        return config.getApprovedRecords()
      case 'rejected':
        return config.getRejectedRecords()
      default:
        return []
    }
  })

  const filteredRecords = computed(() => {
    let records = currentRecords.value

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      records = records.filter(record =>
        config.searchFields(record).some(field =>
          field.toLowerCase().includes(keyword)
        )
      )
    }

    return records
  })

  const handleSubmit = (data: Partial<T>) => {
    if (editingRecord.value) {
      config.updateRecord(editingRecord.value.id, data)
      editingRecord.value = null
    } else {
      config.addRecord(data)
    }
  }

  const handleSave = (data: Partial<T>) => {
    if (editingRecord.value) {
      config.updateRecord(editingRecord.value.id, data)
    } else {
      config.addRecord(data)
    }
    alert('草稿已保存')
  }

  const handleEdit = (record: T) => {
    editingRecord.value = record
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      config.deleteRecord(id)
    }
  }

  const handleToggleStatus = (id: string) => {
    config.toggleActiveStatus(id)
  }

  const handleReset = () => {
    editingRecord.value = null
  }

  const getStatusText = (status: T['status']) => {
    switch (status) {
      case 'pending': return '待审核'
      case 'approved': return '已通过'
      case 'rejected': return '已驳回'
      default: return ''
    }
  }

  const getStatusClass = (status: T['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return {
    searchKeyword,
    editingRecord,
    activeTab,
    currentRecords,
    filteredRecords,
    handleSubmit,
    handleSave,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    handleReset,
    getStatusText,
    getStatusClass,
  }
}