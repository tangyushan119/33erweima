import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDataStore } from '@/stores/dataStore'

describe('Data Store Tests', () => {
  let store: ReturnType<typeof useDataStore>

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    localStorage.clear()
    store = useDataStore()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Batch Operations', () => {
    it('should batch approve pending records', () => {
      const pendingCount = store.pendingRecords.length
      const approvedCount = store.approvedRecords.length
      
      const idsToApprove = store.pendingRecords.map(r => r.id)
      const approved = store.batchApproveRecords(idsToApprove)
      
      expect(approved.length).toBe(pendingCount)
      expect(store.pendingRecords.length).toBe(0)
      expect(store.approvedRecords.length).toBe(approvedCount + pendingCount)
    })

    it('should batch reject pending records', () => {
      const pendingCount = store.pendingRecords.length
      const rejectedCount = store.rejectedRecords.length
      
      const idsToReject = store.pendingRecords.map(r => r.id)
      const rejected = store.batchRejectRecords(idsToReject)
      
      expect(rejected.length).toBe(pendingCount)
      expect(store.pendingRecords.length).toBe(0)
      expect(store.rejectedRecords.length).toBe(rejectedCount + pendingCount)
    })
  })

  describe('Operation Logs', () => {
    it('should create logs when approving records', () => {
      const initialLogCount = store.operationLogs.length
      
      store.addPendingRecord({
        unitName: '审批测试单位',
        creditCode: '91110000MA00000002',
        contactName: '审批测试用户',
        contactPhone: '13800000002',
        address: '审批测试地址',
        qrCodeUrl: '',
        qrCodeId: '',
      })
      
      const recordId = store.pendingRecords[0].id
      store.approveRecord(recordId)
      
      expect(store.operationLogs.length).toBe(initialLogCount + 2)
      const log = store.operationLogs.find(l => l.operationType === 'approve')
      expect(log).toBeDefined()
      expect(log!.targetId).toBe(recordId)
    })

    it('should create logs when rejecting records', () => {
      const initialLogCount = store.operationLogs.length
      
      store.addPendingRecord({
        unitName: '驳回测试单位',
        creditCode: '91110000MA00000003',
        contactName: '驳回测试用户',
        contactPhone: '13800000003',
        address: '驳回测试地址',
        qrCodeUrl: '',
        qrCodeId: '',
      })
      
      const recordId = store.pendingRecords[0].id
      store.rejectRecord(recordId)
      
      expect(store.operationLogs.length).toBe(initialLogCount + 2)
      const log = store.operationLogs.find(l => l.operationType === 'reject')
      expect(log).toBeDefined()
      expect(log!.targetId).toBe(recordId)
    })

    it('should create logs for batch operations', () => {
      const initialLogCount = store.operationLogs.length
      
      store.addPendingRecord({
        unitName: '批量测试单位1',
        creditCode: '91110000MA00000004',
        contactName: '批量测试用户1',
        contactPhone: '13800000004',
        address: '批量测试地址1',
        qrCodeUrl: '',
        qrCodeId: '',
      })
      
      const ids = store.pendingRecords.map(r => r.id)
      store.batchApproveRecords(ids)
      
      expect(store.operationLogs.length).toBeGreaterThan(initialLogCount)
      const log = store.operationLogs.find(l => l.operationType === 'batch_approve')
      expect(log).toBeDefined()
    })

    it('should create logs when adding records', () => {
      const initialLogCount = store.operationLogs.length
      
      store.addPendingRecord({
        unitName: '测试单位',
        creditCode: '91110000MA00000000',
        contactName: '测试用户',
        contactPhone: '13800000000',
        address: '测试地址',
        qrCodeUrl: '',
        qrCodeId: '',
      })
      
      expect(store.operationLogs.length).toBe(initialLogCount + 1)
      const log = store.operationLogs[0]
      expect(log.operationType).toBe('create')
      expect(log.targetName).toBe('测试单位')
    })

    it('should clear logs', () => {
      store.addPendingRecord({
        unitName: '测试单位',
        creditCode: '91110000MA00000000',
        contactName: '测试用户',
        contactPhone: '13800000000',
        address: '测试地址',
        qrCodeUrl: '',
        qrCodeId: '',
      })
      
      expect(store.operationLogs.length).toBeGreaterThan(0)
      
      store.clearLogs()
      
      expect(store.operationLogs.length).toBe(0)
    })
  })

  describe('Local Storage', () => {
    it('should persist logs to localStorage', () => {
      store.addPendingRecord({
        unitName: '存储测试单位',
        creditCode: '91110000MA00000001',
        contactName: '存储测试用户',
        contactPhone: '13800000001',
        address: '存储测试地址',
        qrCodeUrl: '',
        qrCodeId: '',
      })
      
      const logsFromStorage = localStorage.getItem('operation_logs')
      expect(logsFromStorage).not.toBeNull()
      
      const parsedLogs = JSON.parse(logsFromStorage!)
      expect(parsedLogs.length).toBeGreaterThan(0)
      expect(parsedLogs[0].targetName).toBe('存储测试单位')
    })

    it('should load logs from localStorage', () => {
      localStorage.clear()
      
      const testLogs = [
        {
          id: '1',
          operationType: 'create',
          targetId: 'test1',
          targetName: '测试单位1',
          detail: '测试详情',
          operator: '管理员',
          createTime: '2026-06-20 10:00:00',
        },
      ]
      
      localStorage.setItem('operation_logs', JSON.stringify(testLogs))
      
      const pinia = createPinia()
      setActivePinia(pinia)
      const newStore = useDataStore()
      
      expect(newStore.operationLogs.length).toBe(1)
      expect(newStore.operationLogs[0].targetName).toBe('测试单位1')
    })
  })
})
