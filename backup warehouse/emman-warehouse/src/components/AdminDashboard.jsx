import { NavBar } from './NavBar'
import { ManageUsers } from './ManageUsers'
import { ManageRoles } from './ManageRoles'
import { Reports } from './Reports'
import { OrderFulfillment } from './OrderFulfillment'
import { Suppliers } from './Suppliers'
import { PurchaseOrders } from './PurchaseOrders'
import { AuditTrail } from './AuditTrail'

export const AdminDashboard = () => (
  <>
    <NavBar />
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <ManageUsers />
      <ManageRoles />
      <OrderFulfillment />
      <Suppliers />
      <PurchaseOrders />
      <AuditTrail />
      <Reports />
    </div>
  </>
) 