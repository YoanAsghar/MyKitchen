import { Product } from "../../../../models/product";

interface InventoryContentPromps {
  products: Product[];
  setProducts: (product: Product[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  productCategories: string[];
}

const AdminPanel = () => {
  return (
    <div className="flex flex-row">
    </div>
  )
}

export default AdminPanel
