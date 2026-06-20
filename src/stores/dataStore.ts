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

export interface OperationLog {
  id: string
  operationType: 'create' | 'approve' | 'reject' | 'batch_approve' | 'batch_reject' | 'scan' | 'toggle_qrcode'
  targetId: string
  targetName: string
  detail: string
  operator: string
  createTime: string
}

const STORAGE_KEYS = {
  PENDING_RECORDS: 'unit_pending_records',
  APPROVED_RECORDS: 'unit_approved_records',
  REJECTED_RECORDS: 'unit_rejected_records',
  QRCODE_RECORDS: 'qrcode_records',
  OPERATION_LOGS: 'operation_logs',
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn(`Failed to save to localStorage: ${key}`)
  }
}

const defaultPendingRecords: UnitRecord[] = [
  {
    id: '1',
    unitName: '示例科技有限公司',
    creditCode: '91110101MA01A1A1A1',
    contactName: '张三',
    contactPhone: '13800138000',
    address: '北京市朝阳区科技园区A座1001室',
    qrCodeUrl: '',
    qrCodeId: '',
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
    qrCodeId: '',
    createTime: '2026-06-19 15:45:00',
    status: 'pending',
  },
]

const defaultApprovedRecords: UnitRecord[] = [
  {
    id: '3',
    unitName: '演示企业管理有限公司',
    creditCode: '91110103MA03C3C3C3',
    contactName: '王五',
    contactPhone: '13700137000',
    address: '广州市天河区科技园C座3003室',
    qrCodeUrl: '',
    qrCodeId: '',
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
    qrCodeId: '',
    createTime: '2026-06-17 14:20:00',
    status: 'approved',
  },
]

const defaultQrCodeRecords: QrCodeRecord[] = [
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
]

export const useDataStore = defineStore('data', () => {
  const pendingRecords = ref<UnitRecord[]>(loadFromStorage(STORAGE_KEYS.PENDING_RECORDS, defaultPendingRecords))
  const approvedRecords = ref<UnitRecord[]>(loadFromStorage(STORAGE_KEYS.APPROVED_RECORDS, defaultApprovedRecords))
  const rejectedRecords = ref<UnitRecord[]>(loadFromStorage(STORAGE_KEYS.REJECTED_RECORDS, []))
  const qrCodeRecords = ref<QrCodeRecord[]>(loadFromStorage(STORAGE_KEYS.QRCODE_RECORDS, defaultQrCodeRecords))
  const operationLogs = ref<OperationLog[]>(loadFromStorage(STORAGE_KEYS.OPERATION_LOGS, []))

  const operator = ref('管理员')

  const addOperationLog = (
    operationType: OperationLog['operationType'],
    targetId: string,
    targetName: string,
    detail: string
  ) => {
    const log: OperationLog = {
      id: Date.now().toString(),
      operationType,
      targetId,
      targetName,
      detail,
      operator: operator.value,
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
    }
    operationLogs.value.unshift(log)
    if (operationLogs.value.length > 1000) {
      operationLogs.value = operationLogs.value.slice(0, 1000)
    }
    saveToStorage(STORAGE_KEYS.OPERATION_LOGS, operationLogs.value)
  }

  const saveRecords = () => {
    saveToStorage(STORAGE_KEYS.PENDING_RECORDS, pendingRecords.value)
    saveToStorage(STORAGE_KEYS.APPROVED_RECORDS, approvedRecords.value)
    saveToStorage(STORAGE_KEYS.REJECTED_RECORDS, rejectedRecords.value)
    saveToStorage(STORAGE_KEYS.QRCODE_RECORDS, qrCodeRecords.value)
  }

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
    saveRecords()
    addOperationLog('create', newRecord.id, newRecord.unitName, `创建单位记录：${newRecord.unitName}`)
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
    saveRecords()
    addOperationLog('create', newRecord.id, newRecord.name, `创建二维码：${newRecord.name}`)
    return newRecord
  }

  const updateQrCodeScanCount = (id: string) => {
    const record = qrCodeRecords.value.find(r => r.id === id)
    if (record) {
      record.scanCount++
      saveRecords()
      addOperationLog('scan', record.id, record.name, `扫码次数+1，当前：${record.scanCount}`)
      return record
    }
    return null
  }

  const toggleQrCodeStatus = (id: string) => {
    const record = qrCodeRecords.value.find(r => r.id === id)
    if (record) {
      const newStatus = record.status === 'active' ? 'inactive' : 'active'
      record.status = newStatus
      saveRecords()
      addOperationLog('toggle_qrcode', record.id, record.name, `状态变更为：${newStatus === 'active' ? '启用' : '禁用'}`)
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
      saveRecords()
      addOperationLog('approve', record.id, record.unitName, `审核通过：${record.unitName}`)
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
      saveRecords()
      addOperationLog('reject', record.id, record.unitName, `审核驳回：${record.unitName}`)
      return record
    }
    return null
  }

  const batchApproveRecords = (ids: string[]) => {
    const approved: UnitRecord[] = []
    ids.forEach(id => {
      const index = pendingRecords.value.findIndex(r => r.id === id)
      if (index !== -1) {
        const record = pendingRecords.value.splice(index, 1)[0]
        record.status = 'approved'
        approvedRecords.value.unshift(record)
        approved.push(record)
      }
    })
    saveRecords()
    if (approved.length > 0) {
      const names = approved.map(r => r.unitName).join('、')
      addOperationLog('batch_approve', ids.join(','), names, `批量通过 ${approved.length} 条记录：${names}`)
    }
    return approved
  }

  const batchRejectRecords = (ids: string[]) => {
    const rejected: UnitRecord[] = []
    ids.forEach(id => {
      const index = pendingRecords.value.findIndex(r => r.id === id)
      if (index !== -1) {
        const record = pendingRecords.value.splice(index, 1)[0]
        record.status = 'rejected'
        rejectedRecords.value.unshift(record)
        rejected.push(record)
      }
    })
    saveRecords()
    if (rejected.length > 0) {
      const names = rejected.map(r => r.unitName).join('、')
      addOperationLog('batch_reject', ids.join(','), names, `批量驳回 ${rejected.length} 条记录：${names}`)
    }
    return rejected
  }

  const clearLogs = () => {
    operationLogs.value = []
    saveToStorage(STORAGE_KEYS.OPERATION_LOGS, operationLogs.value)
  }

  return {
    pendingRecords,
    approvedRecords,
    rejectedRecords,
    qrCodeRecords,
    operationLogs,
    operator,
    addPendingRecord,
    approveRecord,
    rejectRecord,
    batchApproveRecords,
    batchRejectRecords,
    addQrCodeRecord,
    updateQrCodeScanCount,
    toggleQrCodeStatus,
    getQrCodeById,
    clearLogs,
  }
})
