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
  operationType: 'create' | 'approve' | 'reject' | 'batch_approve' | 'batch_reject' | 'scan' | 'toggle_qrcode' | 'create_vehicle' | 'update_vehicle' | 'delete_vehicle' | 'submit_vehicle' | 'create_equipment' | 'update_equipment' | 'delete_equipment' | 'create_personnel' | 'update_personnel' | 'delete_personnel' | 'create_firehydrant' | 'update_firehydrant' | 'delete_firehydrant'
  targetId: string
  targetName: string
  detail: string
  operator: string
  createTime: string
}

export interface VehicleRecord {
  id: string
  plateNumber: string
  vehicleType: string
  vehicleBrand: string
  vehicleModel: string
  vehicleColor: string
  engineNumber: string
  vin: string
  registerDate: string
  ownerName: string
  ownerPhone: string
  unitId: string
  unitName: string
  frontImage?: string
  backImage?: string
  leftImage?: string
  rightImage?: string
  status: 'pending' | 'approved' | 'rejected'
  activeStatus: 'active' | 'inactive'
  createTime: string
  updateTime: string
  rejectReason?: string
}

export interface EquipmentRecord {
  id: string
  equipmentName: string
  equipmentCode: string
  equipmentType: string
  specification: string
  manufacturer: string
  purchaseDate: string
  price: string
  unitId: string
  unitName: string
  userName: string
  userPhone: string
  location: string
  overallImage?: string
  overallImageId?: string
  nameplateImage?: string
  nameplateImageId?: string
  status: 'pending' | 'approved' | 'rejected'
  activeStatus: 'active' | 'inactive'
  createTime: string
  updateTime: string
  rejectReason?: string
}

export interface PersonnelRecord {
  id: string
  name: string
  idCard: string
  phone: string
  gender: string
  age: string
  department: string
  position: string
  unitId: string
  unitName: string
  status: 'pending' | 'approved' | 'rejected'
  activeStatus: 'active' | 'inactive'
  createTime: string
  updateTime: string
  rejectReason?: string
}

export interface FireHydrantRecord {
  id: string
  hydrantCode: string
  hydrantName: string
  hydrantType: string
  model: string
  specification: string
  installationDate: string
  pressure: string
  status: 'pending' | 'approved' | 'rejected'
  activeStatus: 'active' | 'inactive'
  createTime: string
  updateTime: string
  rejectReason?: string
  location: string
  unitId: string
  unitName: string
  checkDate: string
  nextCheckDate: string
  manufacturer: string
  inspector: string
  inspectorPhone: string
}

const STORAGE_KEYS = {
  PENDING_RECORDS: 'unit_pending_records',
  APPROVED_RECORDS: 'unit_approved_records',
  REJECTED_RECORDS: 'unit_rejected_records',
  QRCODE_RECORDS: 'qrcode_records',
  OPERATION_LOGS: 'operation_logs',
  VEHICLE_PENDING_RECORDS: 'vehicle_pending_records',
  VEHICLE_APPROVED_RECORDS: 'vehicle_approved_records',
  VEHICLE_REJECTED_RECORDS: 'vehicle_rejected_records',
  EQUIPMENT_PENDING_RECORDS: 'equipment_pending_records',
  EQUIPMENT_APPROVED_RECORDS: 'equipment_approved_records',
  EQUIPMENT_REJECTED_RECORDS: 'equipment_rejected_records',
  PERSONNEL_PENDING_RECORDS: 'personnel_pending_records',
  PERSONNEL_APPROVED_RECORDS: 'personnel_approved_records',
  PERSONNEL_REJECTED_RECORDS: 'personnel_rejected_records',
  FIREHYDRANT_PENDING_RECORDS: 'firehydrant_pending_records',
  FIREHYDRANT_APPROVED_RECORDS: 'firehydrant_approved_records',
  FIREHYDRANT_REJECTED_RECORDS: 'firehydrant_rejected_records',
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

const formatDateTime = (): string => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(/\//g, '-')
}

interface AuditableRecord {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  activeStatus?: 'active' | 'inactive'
  updateTime?: string
  rejectReason?: string
}

interface AuditableRecordWithName extends AuditableRecord {
  [nameField: string]: unknown
}

function createNewRecord<T extends AuditableRecord>(
  baseRecord: Omit<T, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>,
  idPrefix: string
): T {
  const now = formatDateTime()
  return {
    ...baseRecord,
    id: `${idPrefix}${Date.now()}`,
    status: 'pending',
    activeStatus: 'active',
    createTime: now,
    updateTime: now,
  } as T
}

function approveRecordInternal<T extends AuditableRecordWithName>(
  pendingList: T[],
  approvedList: T[],
  id: string,
  nameField: keyof T
): T | null {
  const index = pendingList.findIndex(r => r.id === id)
  if (index === -1) return null

  const record = pendingList.splice(index, 1)[0]
  record.status = 'approved'
  approvedList.unshift(record)
  return record
}

function rejectRecordInternal<T extends AuditableRecordWithName>(
  pendingList: T[],
  rejectedList: T[],
  id: string,
  nameField: keyof T,
  reason?: string
): T | null {
  const index = pendingList.findIndex(r => r.id === id)
  if (index === -1) return null

  const record = pendingList.splice(index, 1)[0]
  record.status = 'rejected'
  record.rejectReason = reason
  rejectedList.unshift(record)
  return record
}

function updateRecordInternal<T extends AuditableRecordWithName>(
  pendingList: T[],
  rejectedList: T[],
  id: string,
  updates: Partial<Omit<T, 'id' | 'createTime' | 'status' | 'activeStatus'>>
): T | null {
  const pendingIndex = pendingList.findIndex(r => r.id === id)
  if (pendingIndex !== -1) {
    pendingList[pendingIndex] = {
      ...pendingList[pendingIndex],
      ...updates,
      updateTime: formatDateTime(),
    }
    return pendingList[pendingIndex]
  }

  const rejectedIndex = rejectedList.findIndex(r => r.id === id)
  if (rejectedIndex !== -1) {
    rejectedList[rejectedIndex] = {
      ...rejectedList[rejectedIndex],
      ...updates,
      updateTime: formatDateTime(),
      status: 'pending',
      rejectReason: undefined,
    }
    const record = rejectedList.splice(rejectedIndex, 1)[0]
    pendingList.unshift(record)
    return record
  }

  return null
}

function deleteRecordInternal<T extends AuditableRecordWithName>(
  pendingList: T[],
  approvedList: T[],
  rejectedList: T[],
  id: string
): T | null {
  const pendingIndex = pendingList.findIndex(r => r.id === id)
  if (pendingIndex !== -1) return pendingList.splice(pendingIndex, 1)[0]

  const approvedIndex = approvedList.findIndex(r => r.id === id)
  if (approvedIndex !== -1) return approvedList.splice(approvedIndex, 1)[0]

  const rejectedIndex = rejectedList.findIndex(r => r.id === id)
  if (rejectedIndex !== -1) return rejectedList.splice(rejectedIndex, 1)[0]

  return null
}

function toggleActiveStatusInternal<T extends AuditableRecord>(
  approvedList: T[],
  id: string
): T | null {
  const record = approvedList.find(r => r.id === id)
  if (!record || !record.activeStatus) return null

  record.activeStatus = record.activeStatus === 'active' ? 'inactive' : 'active'
  record.updateTime = formatDateTime()
  return record
}

function getRecordById<T>(
  pendingList: T[],
  approvedList: T[],
  rejectedList: T[],
  id: string
): T | undefined {
  return pendingList.find(r => (r as { id: string }).id === id) ||
         approvedList.find(r => (r as { id: string }).id === id) ||
         rejectedList.find(r => (r as { id: string }).id === id)
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

const defaultVehiclePendingRecords: VehicleRecord[] = []

const defaultVehicleApprovedRecords: VehicleRecord[] = [
  {
    id: 'v1',
    plateNumber: '京A12345',
    vehicleType: '小型客车',
    vehicleBrand: '奔驰',
    vehicleModel: 'C级',
    vehicleColor: '黑色',
    engineNumber: 'M2749201234567',
    vin: 'WDDWF4DBXJR123456',
    registerDate: '2024-01-15',
    ownerName: '张三',
    ownerPhone: '13800138000',
    unitId: '3',
    unitName: '演示企业管理有限公司',
    status: 'approved',
    activeStatus: 'active',
    createTime: '2026-06-20 11:00:00',
    updateTime: '2026-06-20 11:00:00',
  },
  {
    id: 'v2',
    plateNumber: '粤B67890',
    vehicleType: '大型货车',
    vehicleBrand: '东风',
    vehicleModel: '天龙KL',
    vehicleColor: '红色',
    engineNumber: 'DCI1142012345678',
    vin: 'LGAX5C13XJM123456',
    registerDate: '2023-06-20',
    ownerName: '李四',
    ownerPhone: '13900139000',
    unitId: '4',
    unitName: '示范信息技术有限公司',
    status: 'approved',
    activeStatus: 'active',
    createTime: '2026-06-19 14:30:00',
    updateTime: '2026-06-19 14:30:00',
  },
]

const defaultVehicleRejectedRecords: VehicleRecord[] = []

const defaultEquipmentPendingRecords: EquipmentRecord[] = []

const defaultEquipmentApprovedRecords: EquipmentRecord[] = [
  {
    id: 'e1',
    equipmentName: '笔记本电脑',
    equipmentCode: 'EQ-2024-001',
    equipmentType: '电子设备',
    specification: 'ThinkPad X1 Carbon',
    manufacturer: '联想',
    purchaseDate: '2024-03-15',
    price: '12000',
    unitId: '3',
    unitName: '演示企业管理有限公司',
    userName: '张三',
    userPhone: '13800138000',
    location: 'A座1001室',
    status: 'approved',
    activeStatus: 'active',
    createTime: '2026-06-20 10:00:00',
    updateTime: '2026-06-20 10:00:00',
  },
]

const defaultEquipmentRejectedRecords: EquipmentRecord[] = []

const defaultPersonnelPendingRecords: PersonnelRecord[] = []

const defaultPersonnelApprovedRecords: PersonnelRecord[] = [
  {
    id: 'p1',
    name: '张三',
    idCard: '110101199001011234',
    phone: '13800138000',
    gender: '男',
    age: '36',
    department: '技术部',
    position: '工程师',
    unitId: '3',
    unitName: '演示企业管理有限公司',
    status: 'approved',
    activeStatus: 'active',
    createTime: '2026-06-20 09:00:00',
    updateTime: '2026-06-20 09:00:00',
  },
  {
    id: 'p2',
    name: '李四',
    idCard: '110102199202022345',
    phone: '13900139000',
    gender: '女',
    age: '34',
    department: '财务部',
    position: '会计',
    unitId: '4',
    unitName: '示范信息技术有限公司',
    status: 'approved',
    activeStatus: 'active',
    createTime: '2026-06-19 10:30:00',
    updateTime: '2026-06-19 10:30:00',
  },
]

const defaultPersonnelRejectedRecords: PersonnelRecord[] = []

const defaultFireHydrantPendingRecords: FireHydrantRecord[] = []

const defaultFireHydrantApprovedRecords: FireHydrantRecord[] = [
  {
    id: 'fh1',
    hydrantCode: 'FH-2024-001',
    hydrantName: 'A座一楼消火栓',
    hydrantType: '室内消火栓',
    model: 'SN65',
    specification: 'DN65',
    installationDate: '2024-03-15',
    pressure: '0.35MPa',
    status: 'approved',
    activeStatus: 'active',
    createTime: '2026-06-20 09:00:00',
    updateTime: '2026-06-20 09:00:00',
    location: 'A座一楼大厅西侧',
    unitId: '3',
    unitName: '演示企业管理有限公司',
    checkDate: '2026-06-10',
    nextCheckDate: '2026-09-10',
    manufacturer: '上海金盾',
    inspector: '王五',
    inspectorPhone: '13700137000',
  },
  {
    id: 'fh2',
    hydrantCode: 'FH-2024-002',
    hydrantName: 'B座二楼消火栓',
    hydrantType: '室内消火栓',
    model: 'SN65',
    specification: 'DN65',
    installationDate: '2024-03-20',
    pressure: '0.32MPa',
    status: 'approved',
    activeStatus: 'active',
    createTime: '2026-06-19 10:30:00',
    updateTime: '2026-06-19 10:30:00',
    location: 'B座二楼走廊北侧',
    unitId: '4',
    unitName: '示范信息技术有限公司',
    checkDate: '2026-06-05',
    nextCheckDate: '2026-09-05',
    manufacturer: '北京泰和',
    inspector: '赵六',
    inspectorPhone: '13600136000',
  },
]

const defaultFireHydrantRejectedRecords: FireHydrantRecord[] = []

export const useDataStore = defineStore('data', () => {
  const pendingRecords = ref<UnitRecord[]>(loadFromStorage(STORAGE_KEYS.PENDING_RECORDS, defaultPendingRecords))
  const approvedRecords = ref<UnitRecord[]>(loadFromStorage(STORAGE_KEYS.APPROVED_RECORDS, defaultApprovedRecords))
  const rejectedRecords = ref<UnitRecord[]>(loadFromStorage(STORAGE_KEYS.REJECTED_RECORDS, []))
  const qrCodeRecords = ref<QrCodeRecord[]>(loadFromStorage(STORAGE_KEYS.QRCODE_RECORDS, defaultQrCodeRecords))
  const operationLogs = ref<OperationLog[]>(loadFromStorage(STORAGE_KEYS.OPERATION_LOGS, []))
  const vehiclePendingRecords = ref<VehicleRecord[]>(loadFromStorage(STORAGE_KEYS.VEHICLE_PENDING_RECORDS, defaultVehiclePendingRecords))
  const vehicleApprovedRecords = ref<VehicleRecord[]>(loadFromStorage(STORAGE_KEYS.VEHICLE_APPROVED_RECORDS, defaultVehicleApprovedRecords))
  const vehicleRejectedRecords = ref<VehicleRecord[]>(loadFromStorage(STORAGE_KEYS.VEHICLE_REJECTED_RECORDS, defaultVehicleRejectedRecords))
  const equipmentPendingRecords = ref<EquipmentRecord[]>(loadFromStorage(STORAGE_KEYS.EQUIPMENT_PENDING_RECORDS, defaultEquipmentPendingRecords))
  const equipmentApprovedRecords = ref<EquipmentRecord[]>(loadFromStorage(STORAGE_KEYS.EQUIPMENT_APPROVED_RECORDS, defaultEquipmentApprovedRecords))
  const equipmentRejectedRecords = ref<EquipmentRecord[]>(loadFromStorage(STORAGE_KEYS.EQUIPMENT_REJECTED_RECORDS, defaultEquipmentRejectedRecords))
  const personnelPendingRecords = ref<PersonnelRecord[]>(loadFromStorage(STORAGE_KEYS.PERSONNEL_PENDING_RECORDS, defaultPersonnelPendingRecords))
  const personnelApprovedRecords = ref<PersonnelRecord[]>(loadFromStorage(STORAGE_KEYS.PERSONNEL_APPROVED_RECORDS, defaultPersonnelApprovedRecords))
  const personnelRejectedRecords = ref<PersonnelRecord[]>(loadFromStorage(STORAGE_KEYS.PERSONNEL_REJECTED_RECORDS, defaultPersonnelRejectedRecords))
  const fireHydrantPendingRecords = ref<FireHydrantRecord[]>(loadFromStorage(STORAGE_KEYS.FIREHYDRANT_PENDING_RECORDS, defaultFireHydrantPendingRecords))
  const fireHydrantApprovedRecords = ref<FireHydrantRecord[]>(loadFromStorage(STORAGE_KEYS.FIREHYDRANT_APPROVED_RECORDS, defaultFireHydrantApprovedRecords))
  const fireHydrantRejectedRecords = ref<FireHydrantRecord[]>(loadFromStorage(STORAGE_KEYS.FIREHYDRANT_REJECTED_RECORDS, defaultFireHydrantRejectedRecords))

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
      createTime: formatDateTime(),
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
    saveToStorage(STORAGE_KEYS.VEHICLE_PENDING_RECORDS, vehiclePendingRecords.value)
    saveToStorage(STORAGE_KEYS.VEHICLE_APPROVED_RECORDS, vehicleApprovedRecords.value)
    saveToStorage(STORAGE_KEYS.VEHICLE_REJECTED_RECORDS, vehicleRejectedRecords.value)
    saveToStorage(STORAGE_KEYS.EQUIPMENT_PENDING_RECORDS, equipmentPendingRecords.value)
    saveToStorage(STORAGE_KEYS.EQUIPMENT_APPROVED_RECORDS, equipmentApprovedRecords.value)
    saveToStorage(STORAGE_KEYS.EQUIPMENT_REJECTED_RECORDS, equipmentRejectedRecords.value)
    saveToStorage(STORAGE_KEYS.PERSONNEL_PENDING_RECORDS, personnelPendingRecords.value)
    saveToStorage(STORAGE_KEYS.PERSONNEL_APPROVED_RECORDS, personnelApprovedRecords.value)
    saveToStorage(STORAGE_KEYS.PERSONNEL_REJECTED_RECORDS, personnelRejectedRecords.value)
    saveToStorage(STORAGE_KEYS.FIREHYDRANT_PENDING_RECORDS, fireHydrantPendingRecords.value)
    saveToStorage(STORAGE_KEYS.FIREHYDRANT_APPROVED_RECORDS, fireHydrantApprovedRecords.value)
    saveToStorage(STORAGE_KEYS.FIREHYDRANT_REJECTED_RECORDS, fireHydrantRejectedRecords.value)
  }

  const addPendingRecord = (record: Omit<UnitRecord, 'id' | 'createTime' | 'status'>) => {
    const newRecord: UnitRecord = {
      ...record,
      id: Date.now().toString(),
      qrCodeId: '',
      createTime: formatDateTime(),
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
      createTime: formatDateTime(),
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
    const result = approveRecordInternal(pendingRecords.value, approvedRecords.value, id, 'unitName')
    if (result) {
      saveRecords()
      addOperationLog('approve', result.id, result.unitName, `审核通过：${result.unitName}`)
    }
    return result
  }

  const rejectRecord = (id: string) => {
    const result = rejectRecordInternal(pendingRecords.value, rejectedRecords.value, id, 'unitName')
    if (result) {
      saveRecords()
      addOperationLog('reject', result.id, result.unitName, `审核驳回：${result.unitName}`)
    }
    return result
  }

  const batchApproveRecords = (ids: string[]) => {
    const approved: UnitRecord[] = []
    ids.forEach(id => {
      const result = approveRecordInternal(pendingRecords.value, approvedRecords.value, id, 'unitName')
      if (result) approved.push(result)
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
      const result = rejectRecordInternal(pendingRecords.value, rejectedRecords.value, id, 'unitName')
      if (result) rejected.push(result)
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

  const addVehicleRecord = (record: Omit<VehicleRecord, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>) => {
    const newRecord = createNewRecord<VehicleRecord>(record, 'v')
    vehiclePendingRecords.value.unshift(newRecord)
    saveRecords()
    addOperationLog('create_vehicle', newRecord.id, newRecord.plateNumber, `创建车辆记录待审核：${newRecord.plateNumber}`)
    return newRecord
  }

  const updateVehicleRecord = (id: string, record: Partial<Omit<VehicleRecord, 'id' | 'createTime' | 'status' | 'activeStatus'>>) => {
    const result = updateRecordInternal(vehiclePendingRecords.value, vehicleRejectedRecords.value, id, record)
    if (result) {
      saveRecords()
      addOperationLog('update_vehicle', result.id, result.plateNumber, result.status === 'pending' ? `更新车辆待审核记录：${result.plateNumber}` : `修改驳回车辆并重新提交审核：${result.plateNumber}`)
    }
    return result
  }

  const approveVehicleRecord = (id: string) => {
    const result = approveRecordInternal(vehiclePendingRecords.value, vehicleApprovedRecords.value, id, 'plateNumber')
    if (result) {
      saveRecords()
      addOperationLog('approve', result.id, result.plateNumber, `车辆审核通过：${result.plateNumber}`)
    }
    return result
  }

  const rejectVehicleRecord = (id: string, reason?: string) => {
    const result = rejectRecordInternal(vehiclePendingRecords.value, vehicleRejectedRecords.value, id, 'plateNumber', reason)
    if (result) {
      saveRecords()
      addOperationLog('reject', result.id, result.plateNumber, `车辆审核驳回：${result.plateNumber}，原因：${reason || '无'}`)
    }
    return result
  }

  const deleteVehicleRecord = (id: string) => {
    const result = deleteRecordInternal(vehiclePendingRecords.value, vehicleApprovedRecords.value, vehicleRejectedRecords.value, id)
    if (result) {
      saveRecords()
      addOperationLog('delete_vehicle', result.id, result.plateNumber, `删除车辆记录：${result.plateNumber}`)
    }
    return result
  }

  const toggleVehicleActiveStatus = (id: string) => {
    const result = toggleActiveStatusInternal(vehicleApprovedRecords.value, id)
    if (result) {
      saveRecords()
      addOperationLog('update_vehicle', result.id, result.plateNumber, `车辆启用状态变更为：${result.activeStatus === 'active' ? '启用' : '停用'}`)
    }
    return result
  }

  const getVehicleById = (id: string) => {
    return getRecordById(vehiclePendingRecords.value, vehicleApprovedRecords.value, vehicleRejectedRecords.value, id)
  }

  const addEquipmentRecord = (record: Omit<EquipmentRecord, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>) => {
    const newRecord = createNewRecord<EquipmentRecord>(record, 'e')
    equipmentPendingRecords.value.unshift(newRecord)
    saveRecords()
    addOperationLog('create_equipment', newRecord.id, newRecord.equipmentName, `创建装备记录待审核：${newRecord.equipmentName}`)
    return newRecord
  }

  const updateEquipmentRecord = (id: string, record: Partial<Omit<EquipmentRecord, 'id' | 'createTime' | 'status' | 'activeStatus'>>) => {
    const result = updateRecordInternal(equipmentPendingRecords.value, equipmentRejectedRecords.value, id, record)
    if (result) {
      saveRecords()
      addOperationLog('update_equipment', result.id, result.equipmentName, result.status === 'pending' ? `更新装备待审核记录：${result.equipmentName}` : `修改驳回装备并重新提交审核：${result.equipmentName}`)
    }
    return result
  }

  const approveEquipmentRecord = (id: string) => {
    const result = approveRecordInternal(equipmentPendingRecords.value, equipmentApprovedRecords.value, id, 'equipmentName')
    if (result) {
      saveRecords()
      addOperationLog('approve', result.id, result.equipmentName, `装备审核通过：${result.equipmentName}`)
    }
    return result
  }

  const rejectEquipmentRecord = (id: string, reason?: string) => {
    const result = rejectRecordInternal(equipmentPendingRecords.value, equipmentRejectedRecords.value, id, 'equipmentName', reason)
    if (result) {
      saveRecords()
      addOperationLog('reject', result.id, result.equipmentName, `装备审核驳回：${result.equipmentName}，原因：${reason || '无'}`)
    }
    return result
  }

  const deleteEquipmentRecord = (id: string) => {
    const result = deleteRecordInternal(equipmentPendingRecords.value, equipmentApprovedRecords.value, equipmentRejectedRecords.value, id)
    if (result) {
      saveRecords()
      addOperationLog('delete_equipment', result.id, result.equipmentName, `删除装备记录：${result.equipmentName}`)
    }
    return result
  }

  const toggleEquipmentActiveStatus = (id: string) => {
    const result = toggleActiveStatusInternal(equipmentApprovedRecords.value, id)
    if (result) {
      saveRecords()
      addOperationLog('update_equipment', result.id, result.equipmentName, `装备启用状态变更为：${result.activeStatus === 'active' ? '启用' : '停用'}`)
    }
    return result
  }

  const getEquipmentById = (id: string) => {
    return getRecordById(equipmentPendingRecords.value, equipmentApprovedRecords.value, equipmentRejectedRecords.value, id)
  }

  const addPersonnelRecord = (record: Omit<PersonnelRecord, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>) => {
    const newRecord = createNewRecord<PersonnelRecord>(record, 'p')
    personnelPendingRecords.value.unshift(newRecord)
    saveRecords()
    addOperationLog('create_personnel', newRecord.id, newRecord.name, `创建人员记录待审核：${newRecord.name}`)
    return newRecord
  }

  const updatePersonnelRecord = (id: string, record: Partial<Omit<PersonnelRecord, 'id' | 'createTime' | 'status' | 'activeStatus'>>) => {
    const result = updateRecordInternal(personnelPendingRecords.value, personnelRejectedRecords.value, id, record)
    if (result) {
      saveRecords()
      addOperationLog('update_personnel', result.id, result.name, result.status === 'pending' ? `更新人员待审核记录：${result.name}` : `修改驳回人员并重新提交审核：${result.name}`)
    }
    return result
  }

  const approvePersonnelRecord = (id: string) => {
    const result = approveRecordInternal(personnelPendingRecords.value, personnelApprovedRecords.value, id, 'name')
    if (result) {
      saveRecords()
      addOperationLog('approve', result.id, result.name, `人员审核通过：${result.name}`)
    }
    return result
  }

  const rejectPersonnelRecord = (id: string, reason?: string) => {
    const result = rejectRecordInternal(personnelPendingRecords.value, personnelRejectedRecords.value, id, 'name', reason)
    if (result) {
      saveRecords()
      addOperationLog('reject', result.id, result.name, `人员审核驳回：${result.name}，原因：${reason || '无'}`)
    }
    return result
  }

  const deletePersonnelRecord = (id: string) => {
    const result = deleteRecordInternal(personnelPendingRecords.value, personnelApprovedRecords.value, personnelRejectedRecords.value, id)
    if (result) {
      saveRecords()
      addOperationLog('delete_personnel', result.id, result.name, `删除人员记录：${result.name}`)
    }
    return result
  }

  const togglePersonnelActiveStatus = (id: string) => {
    const result = toggleActiveStatusInternal(personnelApprovedRecords.value, id)
    if (result) {
      saveRecords()
      addOperationLog('update_personnel', result.id, result.name, `人员启用状态变更为：${result.activeStatus === 'active' ? '启用' : '停用'}`)
    }
    return result
  }

  const getPersonnelById = (id: string) => {
    return getRecordById(personnelPendingRecords.value, personnelApprovedRecords.value, personnelRejectedRecords.value, id)
  }

  const addFireHydrantRecord = (record: Omit<FireHydrantRecord, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>) => {
    const newRecord = createNewRecord<FireHydrantRecord>(record, 'fh')
    fireHydrantPendingRecords.value.unshift(newRecord)
    saveRecords()
    addOperationLog('create_firehydrant', newRecord.id, newRecord.hydrantName, `创建消火栓记录待审核：${newRecord.hydrantName}`)
    return newRecord
  }

  const updateFireHydrantRecord = (id: string, record: Partial<Omit<FireHydrantRecord, 'id' | 'createTime' | 'status' | 'activeStatus'>>) => {
    const result = updateRecordInternal(fireHydrantPendingRecords.value, fireHydrantRejectedRecords.value, id, record)
    if (result) {
      saveRecords()
      addOperationLog('update_firehydrant', result.id, result.hydrantName, result.status === 'pending' ? `更新消火栓待审核记录：${result.hydrantName}` : `修改驳回消火栓并重新提交审核：${result.hydrantName}`)
    }
    return result
  }

  const approveFireHydrantRecord = (id: string) => {
    const result = approveRecordInternal(fireHydrantPendingRecords.value, fireHydrantApprovedRecords.value, id, 'hydrantName')
    if (result) {
      saveRecords()
      addOperationLog('approve', result.id, result.hydrantName, `消火栓审核通过：${result.hydrantName}`)
    }
    return result
  }

  const rejectFireHydrantRecord = (id: string, reason?: string) => {
    const result = rejectRecordInternal(fireHydrantPendingRecords.value, fireHydrantRejectedRecords.value, id, 'hydrantName', reason)
    if (result) {
      saveRecords()
      addOperationLog('reject', result.id, result.hydrantName, `消火栓审核驳回：${result.hydrantName}，原因：${reason || '无'}`)
    }
    return result
  }

  const deleteFireHydrantRecord = (id: string) => {
    const result = deleteRecordInternal(fireHydrantPendingRecords.value, fireHydrantApprovedRecords.value, fireHydrantRejectedRecords.value, id)
    if (result) {
      saveRecords()
      addOperationLog('delete_firehydrant', result.id, result.hydrantName, `删除消火栓记录：${result.hydrantName}`)
    }
    return result
  }

  const toggleFireHydrantActiveStatus = (id: string) => {
    const result = toggleActiveStatusInternal(fireHydrantApprovedRecords.value, id)
    if (result) {
      saveRecords()
      addOperationLog('update_firehydrant', result.id, result.hydrantName, `消火栓启用状态变更为：${result.activeStatus === 'active' ? '启用' : '停用'}`)
    }
    return result
  }

  const getFireHydrantById = (id: string) => {
    return getRecordById(fireHydrantPendingRecords.value, fireHydrantApprovedRecords.value, fireHydrantRejectedRecords.value, id)
  }

  return {
    pendingRecords,
    approvedRecords,
    rejectedRecords,
    qrCodeRecords,
    operationLogs,
    vehiclePendingRecords,
    vehicleApprovedRecords,
    vehicleRejectedRecords,
    equipmentPendingRecords,
    equipmentApprovedRecords,
    equipmentRejectedRecords,
    personnelPendingRecords,
    personnelApprovedRecords,
    personnelRejectedRecords,
    fireHydrantPendingRecords,
    fireHydrantApprovedRecords,
    fireHydrantRejectedRecords,
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
    addVehicleRecord,
    updateVehicleRecord,
    approveVehicleRecord,
    rejectVehicleRecord,
    deleteVehicleRecord,
    toggleVehicleActiveStatus,
    getVehicleById,
    addEquipmentRecord,
    updateEquipmentRecord,
    approveEquipmentRecord,
    rejectEquipmentRecord,
    deleteEquipmentRecord,
    toggleEquipmentActiveStatus,
    getEquipmentById,
    addPersonnelRecord,
    updatePersonnelRecord,
    approvePersonnelRecord,
    rejectPersonnelRecord,
    deletePersonnelRecord,
    togglePersonnelActiveStatus,
    getPersonnelById,
    addFireHydrantRecord,
    updateFireHydrantRecord,
    approveFireHydrantRecord,
    rejectFireHydrantRecord,
    deleteFireHydrantRecord,
    toggleFireHydrantActiveStatus,
    getFireHydrantById,
  }
})