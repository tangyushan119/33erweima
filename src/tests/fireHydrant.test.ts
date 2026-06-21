import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDataStore, type FireHydrantRecord } from '@/stores/dataStore'

describe('Fire Hydrant Module Tests', () => {
  let store: ReturnType<typeof useDataStore>

  beforeEach(() => {
    localStorage.removeItem('firehydrant_pending_records')
    localStorage.removeItem('firehydrant_approved_records')
    localStorage.removeItem('firehydrant_rejected_records')
    localStorage.removeItem('unit_pending_records')
    localStorage.removeItem('unit_approved_records')
    localStorage.removeItem('unit_rejected_records')
    localStorage.removeItem('vehicle_pending_records')
    localStorage.removeItem('vehicle_approved_records')
    localStorage.removeItem('vehicle_rejected_records')
    localStorage.removeItem('equipment_pending_records')
    localStorage.removeItem('equipment_approved_records')
    localStorage.removeItem('equipment_rejected_records')
    localStorage.removeItem('personnel_pending_records')
    localStorage.removeItem('personnel_approved_records')
    localStorage.removeItem('personnel_rejected_records')
    localStorage.removeItem('operation_logs')
    localStorage.removeItem('qrcode_records')
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useDataStore()
    store.fireHydrantPendingRecords = []
    store.fireHydrantApprovedRecords = []
    store.fireHydrantRejectedRecords = []
  })

  afterEach(() => {
    localStorage.removeItem('firehydrant_pending_records')
    localStorage.removeItem('firehydrant_approved_records')
    localStorage.removeItem('firehydrant_rejected_records')
  })

  const mockHydrantData = {
    hydrantCode: 'FH-TEST-001',
    hydrantName: '测试消火栓',
    hydrantType: '室内消火栓',
    model: 'SN65',
    specification: 'DN65',
    installationDate: '2024-01-15',
    pressure: '0.35MPa',
    location: '测试位置A',
    unitId: '3',
    unitName: '演示企业管理有限公司',
    checkDate: '2026-06-01',
    nextCheckDate: '2026-09-01',
    manufacturer: '测试厂家',
    inspector: '测试人员',
    inspectorPhone: '13800000000',
  }

  describe('Fire Hydrant CRUD Operations', () => {
    it('should add a fire hydrant record', () => {
      const initialPendingCount = store.fireHydrantPendingRecords.length

      const result = store.addFireHydrantRecord(mockHydrantData)

      expect(result).toBeDefined()
      expect(result.id).toMatch(/^fh/)
      expect(result.hydrantName).toBe('测试消火栓')
      expect(result.status).toBe('pending')
      expect(result.activeStatus).toBe('active')
      expect(store.fireHydrantPendingRecords.length).toBe(initialPendingCount + 1)
      expect(store.fireHydrantPendingRecords[0].id).toBe(result.id)
    })

    it('should update a pending fire hydrant record', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)

      const updated = store.updateFireHydrantRecord(added.id, {
        hydrantName: '更新后的消火栓',
        pressure: '0.40MPa',
      })

      expect(updated).toBeDefined()
      expect(updated!.hydrantName).toBe('更新后的消火栓')
      expect(updated!.pressure).toBe('0.40MPa')
      expect(store.fireHydrantPendingRecords[0].hydrantName).toBe('更新后的消火栓')
    })

    it('should approve a fire hydrant record', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)
      const initialApprovedCount = store.fireHydrantApprovedRecords.length

      const approved = store.approveFireHydrantRecord(added.id)

      expect(approved).toBeDefined()
      expect(approved!.status).toBe('approved')
      expect(store.fireHydrantPendingRecords.length).toBe(0)
      expect(store.fireHydrantApprovedRecords.length).toBe(initialApprovedCount + 1)
    })

    it('should reject a fire hydrant record with reason', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)
      const initialRejectedCount = store.fireHydrantRejectedRecords.length

      const rejected = store.rejectFireHydrantRecord(added.id, '信息不全')

      expect(rejected).toBeDefined()
      expect(rejected!.status).toBe('rejected')
      expect(rejected!.rejectReason).toBe('信息不全')
      expect(store.fireHydrantPendingRecords.length).toBe(0)
      expect(store.fireHydrantRejectedRecords.length).toBe(initialRejectedCount + 1)
    })

    it('should delete a fire hydrant record from pending', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)
      const initialPendingCount = store.fireHydrantPendingRecords.length

      const deleted = store.deleteFireHydrantRecord(added.id)

      expect(deleted).toBeDefined()
      expect(deleted!.id).toBe(added.id)
      expect(store.fireHydrantPendingRecords.length).toBe(initialPendingCount - 1)
    })

    it('should delete a fire hydrant record from approved', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)
      store.approveFireHydrantRecord(added.id)
      const initialApprovedCount = store.fireHydrantApprovedRecords.length

      const deleted = store.deleteFireHydrantRecord(added.id)

      expect(deleted).toBeDefined()
      expect(store.fireHydrantApprovedRecords.length).toBe(initialApprovedCount - 1)
    })

    it('should delete a fire hydrant record from rejected', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)
      store.rejectFireHydrantRecord(added.id, '测试驳回')
      const initialRejectedCount = store.fireHydrantRejectedRecords.length

      const deleted = store.deleteFireHydrantRecord(added.id)

      expect(deleted).toBeDefined()
      expect(store.fireHydrantRejectedRecords.length).toBe(initialRejectedCount - 1)
    })

    it('should toggle fire hydrant active status', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)
      store.approveFireHydrantRecord(added.id)

      const record = store.fireHydrantApprovedRecords[0]
      expect(record.activeStatus).toBe('active')

      store.toggleFireHydrantActiveStatus(record.id)
      expect(record.activeStatus).toBe('inactive')

      store.toggleFireHydrantActiveStatus(record.id)
      expect(record.activeStatus).toBe('active')
    })

    it('should get fire hydrant by id', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)

      const found = store.getFireHydrantById(added.id)
      expect(found).toBeDefined()
      expect(found!.id).toBe(added.id)
      expect(found!.hydrantName).toBe('测试消火栓')

      const notFound = store.getFireHydrantById('nonexistent')
      expect(notFound).toBeUndefined()
    })
  })

  describe('Fire Hydrant Data Validation', () => {
    it('should validate hydrantName field', () => {
      const tooLongName = 'A'.repeat(51)
      const result1 = store.addFireHydrantRecord({ ...mockHydrantData, hydrantName: tooLongName })
      expect(result1.hydrantName.length).toBe(51)

      const validName = '有效名称测试'
      const result2 = store.addFireHydrantRecord({ ...mockHydrantData, hydrantName: validName })
      expect(result2.hydrantName).toBe(validName)
    })

    it('should validate model field', () => {
      const validModel = 'SN65/ABC'
      const result1 = store.addFireHydrantRecord({ ...mockHydrantData, model: validModel })
      expect(result1.model).toBe(validModel)

      const tooLongModel = 'A'.repeat(31)
      const result2 = store.addFireHydrantRecord({ ...mockHydrantData, model: tooLongModel })
      expect(result2.model.length).toBe(31)
    })

    it('should validate specification field', () => {
      const validSpec = 'DN65×2.5MPa'
      const result1 = store.addFireHydrantRecord({ ...mockHydrantData, specification: validSpec })
      expect(result1.specification).toBe(validSpec)

      const tooLongSpec = 'A'.repeat(51)
      const result2 = store.addFireHydrantRecord({ ...mockHydrantData, specification: tooLongSpec })
      expect(result2.specification.length).toBe(51)
    })

    it('should validate pressure range', () => {
      const validPressure = '0.50MPa'
      const result1 = store.addFireHydrantRecord({ ...mockHydrantData, pressure: validPressure })
      expect(result1.pressure).toBe(validPressure)

      const highPressure = '15.00MPa'
      const result2 = store.addFireHydrantRecord({ ...mockHydrantData, pressure: highPressure })
      expect(result2.pressure).toBe(highPressure)
    })

    it('should validate inspector field', () => {
      const validInspector = '张三'
      const result1 = store.addFireHydrantRecord({ ...mockHydrantData, inspector: validInspector })
      expect(result1.inspector).toBe(validInspector)

      const validInspectorEn = 'ZhangSan'
      const result2 = store.addFireHydrantRecord({ ...mockHydrantData, inspector: validInspectorEn })
      expect(result2.inspector).toBe(validInspectorEn)
    })

    it('should validate inspectorPhone field', () => {
      const validPhone = '13812345678'
      const result1 = store.addFireHydrantRecord({ ...mockHydrantData, inspectorPhone: validPhone })
      expect(result1.inspectorPhone).toBe(validPhone)

      const invalidPhone = '12345678901'
      const result2 = store.addFireHydrantRecord({ ...mockHydrantData, inspectorPhone: invalidPhone })
      expect(result2.inspectorPhone).toBe(invalidPhone)
    })

    it('should validate hydrantCode field', () => {
      const validCode = 'FH-2024-001'
      const result1 = store.addFireHydrantRecord({ ...mockHydrantData, hydrantCode: validCode })
      expect(result1.hydrantCode).toBe(validCode)

      const uppercaseCode = 'fh-2024-002'
      const result2 = store.addFireHydrantRecord({ ...mockHydrantData, hydrantCode: uppercaseCode })
      expect(result2.hydrantCode).toBe(uppercaseCode)
    })

    it('should validate location field', () => {
      const validLocation = 'A座一楼大厅西侧走廊尽头'
      const result1 = store.addFireHydrantRecord({ ...mockHydrantData, location: validLocation })
      expect(result1.location).toBe(validLocation)

      const tooLongLocation = 'A'.repeat(101)
      const result2 = store.addFireHydrantRecord({ ...mockHydrantData, location: tooLongLocation })
      expect(result2.location.length).toBe(101)
    })

    it('should validate manufacturer field', () => {
      const validManufacturer = '上海金盾消防设备有限公司'
      const result1 = store.addFireHydrantRecord({ ...mockHydrantData, manufacturer: validManufacturer })
      expect(result1.manufacturer).toBe(validManufacturer)

      const tooLongManufacturer = 'A'.repeat(51)
      const result2 = store.addFireHydrantRecord({ ...mockHydrantData, manufacturer: tooLongManufacturer })
      expect(result2.manufacturer.length).toBe(51)
    })

    it('should validate dates', () => {
      const validDates = {
        installationDate: '2024-01-15',
        checkDate: '2026-06-01',
        nextCheckDate: '2026-09-01',
      }
      const result = store.addFireHydrantRecord({ ...mockHydrantData, ...validDates })
      expect(result.installationDate).toBe('2024-01-15')
      expect(result.checkDate).toBe('2026-06-01')
      expect(result.nextCheckDate).toBe('2026-09-01')
    })

    it('should have correct record structure', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)

      expect(added).toHaveProperty('id')
      expect(added).toHaveProperty('hydrantCode')
      expect(added).toHaveProperty('hydrantName')
      expect(added).toHaveProperty('hydrantType')
      expect(added).toHaveProperty('model')
      expect(added).toHaveProperty('specification')
      expect(added).toHaveProperty('installationDate')
      expect(added).toHaveProperty('pressure')
      expect(added).toHaveProperty('location')
      expect(added).toHaveProperty('unitId')
      expect(added).toHaveProperty('unitName')
      expect(added).toHaveProperty('checkDate')
      expect(added).toHaveProperty('nextCheckDate')
      expect(added).toHaveProperty('manufacturer')
      expect(added).toHaveProperty('inspector')
      expect(added).toHaveProperty('inspectorPhone')
      expect(added).toHaveProperty('status')
      expect(added).toHaveProperty('activeStatus')
      expect(added).toHaveProperty('createTime')
      expect(added).toHaveProperty('updateTime')
    })
  })

  describe('Fire Hydrant Status Flow', () => {
    it('should flow through pending -> approved -> active/inactive', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)
      expect(added.status).toBe('pending')

      store.approveFireHydrantRecord(added.id)
      const approved = store.fireHydrantApprovedRecords[0]
      expect(approved.status).toBe('approved')
      expect(approved.activeStatus).toBe('active')

      store.toggleFireHydrantActiveStatus(approved.id)
      expect(approved.activeStatus).toBe('inactive')
    })

    it('should allow rejected records to be updated and resubmitted', () => {
      const added = store.addFireHydrantRecord(mockHydrantData)
      store.rejectFireHydrantRecord(added.id, '初始驳回')

      expect(store.fireHydrantRejectedRecords.length).toBe(1)
      expect(store.fireHydrantPendingRecords.length).toBe(0)

      const updated = store.updateFireHydrantRecord(added.id, {
        hydrantName: '重新提交的消火栓',
      })

      expect(updated).toBeDefined()
      expect(updated!.status).toBe('pending')
      expect(updated!.rejectReason).toBeUndefined()
      expect(store.fireHydrantPendingRecords.length).toBe(1)
      expect(store.fireHydrantRejectedRecords.length).toBe(0)
    })
  })

  describe('Fire Hydrant Local Storage', () => {
    it('should persist fire hydrant records to localStorage', () => {
      store.addFireHydrantRecord(mockHydrantData)
      store.approveFireHydrantRecord(store.fireHydrantPendingRecords[0].id)

      const pendingFromStorage = localStorage.getItem('firehydrant_pending_records')
      const approvedFromStorage = localStorage.getItem('firehydrant_approved_records')

      expect(pendingFromStorage).not.toBeNull()
      expect(approvedFromStorage).not.toBeNull()

      const parsedApproved = JSON.parse(approvedFromStorage!)
      expect(parsedApproved.length).toBeGreaterThan(0)
    })

    it('should load fire hydrant records from localStorage', () => {
      localStorage.clear()

      const testHydrants: FireHydrantRecord[] = [
        {
          id: 'fh1',
          hydrantCode: 'FH-LOAD-001',
          hydrantName: '加载测试消火栓',
          hydrantType: '室内消火栓',
          model: 'SN65',
          specification: 'DN65',
          installationDate: '2024-01-01',
          pressure: '0.30MPa',
          location: '加载测试位置',
          unitId: '3',
          unitName: '演示企业管理有限公司',
          checkDate: '2026-06-01',
          nextCheckDate: '2026-09-01',
          manufacturer: '测试厂家',
          inspector: '测试人员',
          inspectorPhone: '13800000000',
          status: 'approved',
          activeStatus: 'active',
          createTime: '2026-06-20 10:00:00',
          updateTime: '2026-06-20 10:00:00',
        },
      ]

      localStorage.setItem('firehydrant_approved_records', JSON.stringify(testHydrants))

      const pinia = createPinia()
      setActivePinia(pinia)
      const newStore = useDataStore()

      expect(newStore.fireHydrantApprovedRecords.length).toBe(1)
      expect(newStore.fireHydrantApprovedRecords[0].hydrantName).toBe('加载测试消火栓')
    })
  })

  describe('Fire Hydrant Initial Data', () => {
    it('should have default approved fire hydrant records', () => {
      localStorage.clear()
      const pinia = createPinia()
      setActivePinia(pinia)
      const newStore = useDataStore()

      expect(newStore.fireHydrantApprovedRecords.length).toBe(2)
      expect(newStore.fireHydrantApprovedRecords[0].hydrantCode).toBe('FH-2024-001')
      expect(newStore.fireHydrantApprovedRecords[1].hydrantCode).toBe('FH-2024-002')
    })
  })
})