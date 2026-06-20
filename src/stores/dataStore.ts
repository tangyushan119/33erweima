import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UnitRecord {
  id: string
  unitName: string
  creditCode: string
  contactName: string
  contactPhone: string
  address: string
  qrCodeUrl: string
  qrCodeId: string
  createTime: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface QrCodeRecord {
  id: string
  name: string
  description: string
  formUrl: string
  qrCodeDataUrl: string
  createTime: string
  scanCount: number
  status: 'active' | 'inactive'
}

export const useDataStore = defineStore('data', () => {
  const pendingRecords = ref<UnitRecord[]>([
    {
      id: '1',
      unitName: '示例科技有限公司',
      creditCode: '91110101MA01A1A1A1',
      contactName: '张三',
      contactPhone: '13800138000',
      address: '北京市朝阳区科技园区A座1001室',
      qrCodeUrl: '',
      createTime: '2026-06-20 10:30:00',
      status: 'pending',
    },
    {
      id: '2',
      unitName: '测试数据有限公司',
      creditCode: '91110102MA02B2B2B2',
      contactName: '李四',
      contactPhone: '13900139000',
      address: '上海市浦东新区软件园B座2002室',
      qrCodeUrl: '',
      createTime: '2026-06-19 15:45:00',
      status: 'pending',
    },
  ])

  const approvedRecords = ref<UnitRecord[]>([
    {
      id: '3',
      unitName: '演示企业管理有限公司',
      creditCode: '91110103MA03C3C3C3',
      contactName: '王五',
      contactPhone: '13700137000',
      address: '广州市天河区科技园C座3003室',
      qrCodeUrl: '',
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
      qrCodeUrl: '',
      createTime: '2026-06-17 14:20:00',
      status: 'approved',
    },
  ])

  const rejectedRecords = ref<UnitRecord[]>([])

  const qrCodeRecords = ref<QrCodeRecord[]>([
    {
      id: 'q1',
      name: '单位信息采集码',
      description: '用于采集单位基本信息的二维码',
      formUrl: '/mobile/form/q1',
      qrCodeDataUrl: '',
      createTime: '2026-06-20 09:00:00',
      scanCount: 156,
      status: 'active',
    },
  ])

  const addPendingRecord = (record: Omit<UnitRecord, 'id' | 'createTime' | 'status'>) => {
    const newRecord: UnitRecord = {
      ...record,
      id: Date.now().toString(),
      qrCodeId: '',
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
      status: 'pending',
    }
    pendingRecords.value.unshift(newRecord)
    return newRecord
  }

  const addQrCodeRecord = (record: Omit<QrCodeRecord, 'id' | 'createTime' | 'scanCount'>) => {
    const newRecord: QrCodeRecord = {
      ...record,
      id: 'q' + Date.now(),
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
      scanCount: 0,
    }
    qrCodeRecords.value.unshift(newRecord)
    return newRecord
  }

  const updateQrCodeScanCount = (id: string) => {
    const record = qrCodeRecords.value.find(r => r.id === id)
    if (record) {
      record.scanCount++
      return record
    }
    return null
  }

  const toggleQrCodeStatus = (id: string) => {
    const record = qrCodeRecords.value.find(r => r.id === id)
    if (record) {
      record.status = record.status === 'active' ? 'inactive' : 'active'
      return record
    }
    return null
  }

  const getQrCodeById = (id: string) => {
    return qrCodeRecords.value.find(r => r.id === id)
  }

  const approveRecord = (id: string) => {
    const index = pendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = pendingRecords.value.splice(index, 1)[0]
      record.status = 'approved'
      approvedRecords.value.unshift(record)
      return record
    }
    return null
  }

  const rejectRecord = (id: string) => {
    const index = pendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = pendingRecords.value.splice(index, 1)[0]
      record.status = 'rejected'
      rejectedRecords.value.unshift(record)
      return record
    }
    return null
  }

  return {
    pendingRecords,
    approvedRecords,
    rejectedRecords,
    qrCodeRecords,
    addPendingRecord,
    approveRecord,
    rejectRecord,
    addQrCodeRecord,
    updateQrCodeScanCount,
    toggleQrCodeStatus,
    getQrCodeById,
  }
})
