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
  operationType: 'create' | 'approve' | 'reject' | 'batch_approve' | 'batch_reject' | 'scan' | 'toggle_qrcode' | 'create_vehicle' | 'update_vehicle' | 'delete_vehicle' | 'submit_vehicle' | 'create_equipment' | 'update_equipment' | 'delete_equipment'
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

  const addVehicleRecord = (record: Omit<VehicleRecord, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>) => {
    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-')

    const newRecord: VehicleRecord = {
      ...record,
      id: 'v' + Date.now(),
      status: 'pending',
      activeStatus: 'active',
      createTime: now,
      updateTime: now,
    }
    vehiclePendingRecords.value.unshift(newRecord)
    saveRecords()
    addOperationLog('create_vehicle', newRecord.id, newRecord.plateNumber, `创建车辆记录待审核：${newRecord.plateNumber}`)
    return newRecord
  }

  const updateVehicleRecord = (id: string, record: Partial<Omit<VehicleRecord, 'id' | 'createTime' | 'status' | 'activeStatus'>>) => {
    const pendingIndex = vehiclePendingRecords.value.findIndex(r => r.id === id)
    if (pendingIndex !== -1) {
      const updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')

      vehiclePendingRecords.value[pendingIndex] = {
        ...vehiclePendingRecords.value[pendingIndex],
        ...record,
        updateTime,
      }
      saveRecords()
      const vehicle = vehiclePendingRecords.value[pendingIndex]
      addOperationLog('update_vehicle', vehicle.id, vehicle.plateNumber, `更新车辆待审核记录：${vehicle.plateNumber}`)
      return vehicle
    }

    const rejectedIndex = vehicleRejectedRecords.value.findIndex(r => r.id === id)
    if (rejectedIndex !== -1) {
      const updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')

      vehicleRejectedRecords.value[rejectedIndex] = {
        ...vehicleRejectedRecords.value[rejectedIndex],
        ...record,
        updateTime,
        status: 'pending',
        rejectReason: undefined,
      }
      vehiclePendingRecords.value.unshift(vehicleRejectedRecords.value.splice(rejectedIndex, 1)[0])
      saveRecords()
      const vehicle = vehiclePendingRecords.value[0]
      addOperationLog('update_vehicle', vehicle.id, vehicle.plateNumber, `修改驳回车辆并重新提交审核：${vehicle.plateNumber}`)
      return vehicle
    }

    return null
  }

  const approveVehicleRecord = (id: string) => {
    const index = vehiclePendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = vehiclePendingRecords.value.splice(index, 1)[0]
      record.status = 'approved'
      vehicleApprovedRecords.value.unshift(record)
      saveRecords()
      addOperationLog('approve', record.id, record.plateNumber, `车辆审核通过：${record.plateNumber}`)
      return record
    }
    return null
  }

  const rejectVehicleRecord = (id: string, reason?: string) => {
    const index = vehiclePendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = vehiclePendingRecords.value.splice(index, 1)[0]
      record.status = 'rejected'
      record.rejectReason = reason
      vehicleRejectedRecords.value.unshift(record)
      saveRecords()
      addOperationLog('reject', record.id, record.plateNumber, `车辆审核驳回：${record.plateNumber}，原因：${reason || '无'}`)
      return record
    }
    return null
  }

  const deleteVehicleRecord = (id: string) => {
    const pendingIndex = vehiclePendingRecords.value.findIndex(r => r.id === id)
    if (pendingIndex !== -1) {
      const record = vehiclePendingRecords.value.splice(pendingIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_vehicle', record.id, record.plateNumber, `删除车辆待审核记录：${record.plateNumber}`)
      return record
    }

    const approvedIndex = vehicleApprovedRecords.value.findIndex(r => r.id === id)
    if (approvedIndex !== -1) {
      const record = vehicleApprovedRecords.value.splice(approvedIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_vehicle', record.id, record.plateNumber, `删除车辆记录：${record.plateNumber}`)
      return record
    }

    const rejectedIndex = vehicleRejectedRecords.value.findIndex(r => r.id === id)
    if (rejectedIndex !== -1) {
      const record = vehicleRejectedRecords.value.splice(rejectedIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_vehicle', record.id, record.plateNumber, `删除车辆驳回记录：${record.plateNumber}`)
      return record
    }

    return null
  }

  const toggleVehicleActiveStatus = (id: string) => {
    const record = vehicleApprovedRecords.value.find(r => r.id === id)
    if (record) {
      const newStatus = record.activeStatus === 'active' ? 'inactive' : 'active'
      record.activeStatus = newStatus
      record.updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')
      saveRecords()
      addOperationLog('update_vehicle', record.id, record.plateNumber, `车辆启用状态变更为：${newStatus === 'active' ? '启用' : '停用'}`)
      return record
    }
    return null
  }

  const getVehicleById = (id: string) => {
    return vehiclePendingRecords.value.find(r => r.id === id) ||
           vehicleApprovedRecords.value.find(r => r.id === id) ||
           vehicleRejectedRecords.value.find(r => r.id === id)
  }

  const addEquipmentRecord = (record: Omit<EquipmentRecord, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>) => {
    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-')

    const newRecord: EquipmentRecord = {
      ...record,
      id: 'e' + Date.now(),
      status: 'pending',
      activeStatus: 'active',
      createTime: now,
      updateTime: now,
    }
    equipmentPendingRecords.value.unshift(newRecord)
    saveRecords()
    addOperationLog('create_equipment', newRecord.id, newRecord.equipmentName, `创建装备记录待审核：${newRecord.equipmentName}`)
    return newRecord
  }

  const updateEquipmentRecord = (id: string, record: Partial<Omit<EquipmentRecord, 'id' | 'createTime' | 'status' | 'activeStatus'>>) => {
    const pendingIndex = equipmentPendingRecords.value.findIndex(r => r.id === id)
    if (pendingIndex !== -1) {
      const updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')

      equipmentPendingRecords.value[pendingIndex] = {
        ...equipmentPendingRecords.value[pendingIndex],
        ...record,
        updateTime,
      }
      saveRecords()
      const equipment = equipmentPendingRecords.value[pendingIndex]
      addOperationLog('update_equipment', equipment.id, equipment.equipmentName, `更新装备待审核记录：${equipment.equipmentName}`)
      return equipment
    }

    const rejectedIndex = equipmentRejectedRecords.value.findIndex(r => r.id === id)
    if (rejectedIndex !== -1) {
      const updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')

      equipmentRejectedRecords.value[rejectedIndex] = {
        ...equipmentRejectedRecords.value[rejectedIndex],
        ...record,
        updateTime,
        status: 'pending',
        rejectReason: undefined,
      }
      equipmentPendingRecords.value.unshift(equipmentRejectedRecords.value.splice(rejectedIndex, 1)[0])
      saveRecords()
      const equipment = equipmentPendingRecords.value[0]
      addOperationLog('update_equipment', equipment.id, equipment.equipmentName, `修改驳回装备并重新提交审核：${equipment.equipmentName}`)
      return equipment
    }

    return null
  }

  const approveEquipmentRecord = (id: string) => {
    const index = equipmentPendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = equipmentPendingRecords.value.splice(index, 1)[0]
      record.status = 'approved'
      equipmentApprovedRecords.value.unshift(record)
      saveRecords()
      addOperationLog('approve', record.id, record.equipmentName, `装备审核通过：${record.equipmentName}`)
      return record
    }
    return null
  }

  const rejectEquipmentRecord = (id: string, reason?: string) => {
    const index = equipmentPendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = equipmentPendingRecords.value.splice(index, 1)[0]
      record.status = 'rejected'
      record.rejectReason = reason
      equipmentRejectedRecords.value.unshift(record)
      saveRecords()
      addOperationLog('reject', record.id, record.equipmentName, `装备审核驳回：${record.equipmentName}，原因：${reason || '无'}`)
      return record
    }
    return null
  }

  const deleteEquipmentRecord = (id: string) => {
    const pendingIndex = equipmentPendingRecords.value.findIndex(r => r.id === id)
    if (pendingIndex !== -1) {
      const record = equipmentPendingRecords.value.splice(pendingIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_equipment', record.id, record.equipmentName, `删除装备待审核记录：${record.equipmentName}`)
      return record
    }

    const approvedIndex = equipmentApprovedRecords.value.findIndex(r => r.id === id)
    if (approvedIndex !== -1) {
      const record = equipmentApprovedRecords.value.splice(approvedIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_equipment', record.id, record.equipmentName, `删除装备记录：${record.equipmentName}`)
      return record
    }

    const rejectedIndex = equipmentRejectedRecords.value.findIndex(r => r.id === id)
    if (rejectedIndex !== -1) {
      const record = equipmentRejectedRecords.value.splice(rejectedIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_equipment', record.id, record.equipmentName, `删除装备驳回记录：${record.equipmentName}`)
      return record
    }

    return null
  }

  const toggleEquipmentActiveStatus = (id: string) => {
    const record = equipmentApprovedRecords.value.find(r => r.id === id)
    if (record) {
      const newStatus = record.activeStatus === 'active' ? 'inactive' : 'active'
      record.activeStatus = newStatus
      record.updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')
      saveRecords()
      addOperationLog('update_equipment', record.id, record.equipmentName, `装备启用状态变更为：${newStatus === 'active' ? '启用' : '停用'}`)
      return record
    }
    return null
  }

  const getEquipmentById = (id: string) => {
    return equipmentPendingRecords.value.find(r => r.id === id) ||
           equipmentApprovedRecords.value.find(r => r.id === id) ||
           equipmentRejectedRecords.value.find(r => r.id === id)
  }

  const addPersonnelRecord = (record: Omit<PersonnelRecord, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>) => {
    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-')

    const newRecord: PersonnelRecord = {
      ...record,
      id: 'p' + Date.now(),
      status: 'pending',
      activeStatus: 'active',
      createTime: now,
      updateTime: now,
    }
    personnelPendingRecords.value.unshift(newRecord)
    saveRecords()
    addOperationLog('create_equipment', newRecord.id, newRecord.name, `创建人员记录待审核：${newRecord.name}`)
    return newRecord
  }

  const updatePersonnelRecord = (id: string, record: Partial<Omit<PersonnelRecord, 'id' | 'createTime' | 'status' | 'activeStatus'>>) => {
    const pendingIndex = personnelPendingRecords.value.findIndex(r => r.id === id)
    if (pendingIndex !== -1) {
      const updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')

      personnelPendingRecords.value[pendingIndex] = {
        ...personnelPendingRecords.value[pendingIndex],
        ...record,
        updateTime,
      }
      saveRecords()
      const personnel = personnelPendingRecords.value[pendingIndex]
      addOperationLog('update_equipment', personnel.id, personnel.name, `更新人员待审核记录：${personnel.name}`)
      return personnel
    }

    const rejectedIndex = personnelRejectedRecords.value.findIndex(r => r.id === id)
    if (rejectedIndex !== -1) {
      const updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')

      personnelRejectedRecords.value[rejectedIndex] = {
        ...personnelRejectedRecords.value[rejectedIndex],
        ...record,
        updateTime,
        status: 'pending',
        rejectReason: undefined,
      }
      personnelPendingRecords.value.unshift(personnelRejectedRecords.value.splice(rejectedIndex, 1)[0])
      saveRecords()
      const personnel = personnelPendingRecords.value[0]
      addOperationLog('update_equipment', personnel.id, personnel.name, `修改驳回人员并重新提交审核：${personnel.name}`)
      return personnel
    }

    return null
  }

  const approvePersonnelRecord = (id: string) => {
    const index = personnelPendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = personnelPendingRecords.value.splice(index, 1)[0]
      record.status = 'approved'
      personnelApprovedRecords.value.unshift(record)
      saveRecords()
      addOperationLog('approve', record.id, record.name, `人员审核通过：${record.name}`)
      return record
    }
    return null
  }

  const rejectPersonnelRecord = (id: string, reason?: string) => {
    const index = personnelPendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = personnelPendingRecords.value.splice(index, 1)[0]
      record.status = 'rejected'
      record.rejectReason = reason
      personnelRejectedRecords.value.unshift(record)
      saveRecords()
      addOperationLog('reject', record.id, record.name, `人员审核驳回：${record.name}，原因：${reason || '无'}`)
      return record
    }
    return null
  }

  const deletePersonnelRecord = (id: string) => {
    const pendingIndex = personnelPendingRecords.value.findIndex(r => r.id === id)
    if (pendingIndex !== -1) {
      const record = personnelPendingRecords.value.splice(pendingIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_equipment', record.id, record.name, `删除人员待审核记录：${record.name}`)
      return record
    }

    const approvedIndex = personnelApprovedRecords.value.findIndex(r => r.id === id)
    if (approvedIndex !== -1) {
      const record = personnelApprovedRecords.value.splice(approvedIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_equipment', record.id, record.name, `删除人员记录：${record.name}`)
      return record
    }

    const rejectedIndex = personnelRejectedRecords.value.findIndex(r => r.id === id)
    if (rejectedIndex !== -1) {
      const record = personnelRejectedRecords.value.splice(rejectedIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_equipment', record.id, record.name, `删除人员驳回记录：${record.name}`)
      return record
    }

    return null
  }

  const togglePersonnelActiveStatus = (id: string) => {
    const record = personnelApprovedRecords.value.find(r => r.id === id)
    if (record) {
      const newStatus = record.activeStatus === 'active' ? 'inactive' : 'active'
      record.activeStatus = newStatus
      record.updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')
      saveRecords()
      addOperationLog('update_equipment', record.id, record.name, `人员启用状态变更为：${newStatus === 'active' ? '启用' : '停用'}`)
      return record
    }
    return null
  }

  const getPersonnelById = (id: string) => {
    return personnelPendingRecords.value.find(r => r.id === id) ||
           personnelApprovedRecords.value.find(r => r.id === id) ||
           personnelRejectedRecords.value.find(r => r.id === id)
  }

  const addFireHydrantRecord = (record: Omit<FireHydrantRecord, 'id' | 'createTime' | 'updateTime' | 'status' | 'activeStatus'>) => {
    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-')

    const newRecord: FireHydrantRecord = {
      ...record,
      id: 'fh' + Date.now(),
      status: 'pending',
      activeStatus: 'active',
      createTime: now,
      updateTime: now,
    }
    fireHydrantPendingRecords.value.unshift(newRecord)
    saveRecords()
    addOperationLog('create_equipment', newRecord.id, newRecord.hydrantName, `创建消火栓记录待审核：${newRecord.hydrantName}`)
    return newRecord
  }

  const updateFireHydrantRecord = (id: string, record: Partial<Omit<FireHydrantRecord, 'id' | 'createTime' | 'status' | 'activeStatus'>>) => {
    const pendingIndex = fireHydrantPendingRecords.value.findIndex(r => r.id === id)
    if (pendingIndex !== -1) {
      const updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')

      fireHydrantPendingRecords.value[pendingIndex] = {
        ...fireHydrantPendingRecords.value[pendingIndex],
        ...record,
        updateTime,
      }
      saveRecords()
      const hydrant = fireHydrantPendingRecords.value[pendingIndex]
      addOperationLog('update_equipment', hydrant.id, hydrant.hydrantName, `更新消火栓待审核记录：${hydrant.hydrantName}`)
      return hydrant
    }

    const rejectedIndex = fireHydrantRejectedRecords.value.findIndex(r => r.id === id)
    if (rejectedIndex !== -1) {
      const updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')

      fireHydrantRejectedRecords.value[rejectedIndex] = {
        ...fireHydrantRejectedRecords.value[rejectedIndex],
        ...record,
        updateTime,
        status: 'pending',
        rejectReason: undefined,
      }
      fireHydrantPendingRecords.value.unshift(fireHydrantRejectedRecords.value.splice(rejectedIndex, 1)[0])
      saveRecords()
      const hydrant = fireHydrantPendingRecords.value[0]
      addOperationLog('update_equipment', hydrant.id, hydrant.hydrantName, `修改驳回消火栓并重新提交审核：${hydrant.hydrantName}`)
      return hydrant
    }

    return null
  }

  const approveFireHydrantRecord = (id: string) => {
    const index = fireHydrantPendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = fireHydrantPendingRecords.value.splice(index, 1)[0]
      record.status = 'approved'
      fireHydrantApprovedRecords.value.unshift(record)
      saveRecords()
      addOperationLog('approve', record.id, record.hydrantName, `消火栓审核通过：${record.hydrantName}`)
      return record
    }
    return null
  }

  const rejectFireHydrantRecord = (id: string, reason?: string) => {
    const index = fireHydrantPendingRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = fireHydrantPendingRecords.value.splice(index, 1)[0]
      record.status = 'rejected'
      record.rejectReason = reason
      fireHydrantRejectedRecords.value.unshift(record)
      saveRecords()
      addOperationLog('reject', record.id, record.hydrantName, `消火栓审核驳回：${record.hydrantName}，原因：${reason || '无'}`)
      return record
    }
    return null
  }

  const deleteFireHydrantRecord = (id: string) => {
    const pendingIndex = fireHydrantPendingRecords.value.findIndex(r => r.id === id)
    if (pendingIndex !== -1) {
      const record = fireHydrantPendingRecords.value.splice(pendingIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_equipment', record.id, record.hydrantName, `删除消火栓待审核记录：${record.hydrantName}`)
      return record
    }

    const approvedIndex = fireHydrantApprovedRecords.value.findIndex(r => r.id === id)
    if (approvedIndex !== -1) {
      const record = fireHydrantApprovedRecords.value.splice(approvedIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_equipment', record.id, record.hydrantName, `删除消火栓记录：${record.hydrantName}`)
      return record
    }

    const rejectedIndex = fireHydrantRejectedRecords.value.findIndex(r => r.id === id)
    if (rejectedIndex !== -1) {
      const record = fireHydrantRejectedRecords.value.splice(rejectedIndex, 1)[0]
      saveRecords()
      addOperationLog('delete_equipment', record.id, record.hydrantName, `删除消火栓驳回记录：${record.hydrantName}`)
      return record
    }

    return null
  }

  const toggleFireHydrantActiveStatus = (id: string) => {
    const record = fireHydrantApprovedRecords.value.find(r => r.id === id)
    if (record) {
      const newStatus = record.activeStatus === 'active' ? 'inactive' : 'active'
      record.activeStatus = newStatus
      record.updateTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-')
      saveRecords()
      addOperationLog('update_equipment', record.id, record.hydrantName, `消火栓启用状态变更为：${newStatus === 'active' ? '启用' : '停用'}`)
      return record
    }
    return null
  }

  const getFireHydrantById = (id: string) => {
    return fireHydrantPendingRecords.value.find(r => r.id === id) ||
           fireHydrantApprovedRecords.value.find(r => r.id === id) ||
           fireHydrantRejectedRecords.value.find(r => r.id === id)
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
