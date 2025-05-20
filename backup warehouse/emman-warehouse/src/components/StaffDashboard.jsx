import { NavBar } from './NavBar'
import { ProductInfo } from './ProductInfo'
import { StockMovements } from './StockMovements'
import { LowStockAlerts } from './LowStockAlerts'

export const StaffDashboard = () => (
  <>
    <NavBar />
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>
      <ProductInfo />
      <StockMovements />
      <LowStockAlerts />
    </div>
  </>
) 