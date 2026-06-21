import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import UnitEntry from '@/pages/UnitEntry.vue'
import VehicleEntry from '@/pages/VehicleEntry.vue'
import EquipmentEntry from '@/pages/EquipmentEntry.vue'
import PersonnelEntry from '@/pages/PersonnelEntry.vue'
import DataVerify from '@/pages/DataVerify.vue'
import DataApplication from '@/pages/DataApplication.vue'
import QrCodeGenerator from '@/pages/QrCodeGenerator.vue'
import MobileForm from '@/pages/MobileForm.vue'
import OperationLogs from '@/pages/OperationLogs.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/data-collection/unit-entry',
  },
  {
    path: '/data-collection',
    redirect: '/data-collection/unit-entry',
  },
  {
    path: '/data-collection/unit-entry',
    name: 'unitEntry',
    component: UnitEntry,
  },
  {
    path: '/data-collection/vehicle-entry',
    name: 'vehicleEntry',
    component: VehicleEntry,
  },
  {
    path: '/data-collection/equipment-entry',
    name: 'equipmentEntry',
    component: EquipmentEntry,
  },
  {
    path: '/data-collection/personnel-entry',
    name: 'personnelEntry',
    component: PersonnelEntry,
  },
  {
    path: '/data-verify',
    name: 'dataVerify',
    component: DataVerify,
  },
  {
    path: '/operation-logs',
    name: 'operationLogs',
    component: OperationLogs,
  },
  {
    path: '/data-application',
    name: 'dataApplication',
    component: DataApplication,
  },
  {
    path: '/qr-code-collection',
    name: 'qrCodeGenerator',
    component: QrCodeGenerator,
  },
  {
    path: '/mobile/form/:id',
    name: 'mobileForm',
    component: MobileForm,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
