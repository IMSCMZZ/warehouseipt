import { NavBar } from './NavBar'
import { ManageProducts } from './ManageProducts'
import { ManageWarehouses } from './ManageWarehouses'
import { StockMovements } from './StockMovements'
import { StockReconciliation } from './StockReconciliation'
import { Reports } from './Reports'
import { StockLevels } from './StockLevels'
import { OrderFulfillment } from './OrderFulfillment'
import { LowStockAlerts } from './LowStockAlerts'
import { Suppliers } from './Suppliers'
import { PurchaseOrders } from './PurchaseOrders'
import { AuditTrail } from './AuditTrail'

export const ManagerDashboard = () => (
  <>
    <NavBar />
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Warehouse Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ManageProducts />
        <ManageWarehouses />
        <StockLevels />
        <StockMovements />
        <OrderFulfillment />
        <LowStockAlerts />
        <Suppliers />
        <PurchaseOrders />
        <AuditTrail />
        <StockReconciliation />
        <Reports />
      </div>
    </div>
  </>
) 