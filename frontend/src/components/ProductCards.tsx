import { Product } from "../models/product"

interface ProductCardsProps {
  product: Product;
  showImages: boolean;
}

const ProductCards = ({product, showImages} :ProductCardsProps)  => {
  return (
    <div className="rounded-xl w-70 flex flex-col overflow-hidden border border-night-line bg-night-raised shadow-[0_20px_50px_-25px_rgba(0,0,0,0.65)] transition-colors hover:border-night-line-strong">
      {showImages && (
        <div className="h-40 w-full border-b border-night-line">
          <img 
            className="w-full h-full object-cover" 
            src={product.image || "/logoipsum-small.png"} 
            alt={product.name} 
          />
        </div>
      )}
      <div className="flex flex-row items-center p-5 min-h-20">
        <div className="flex flex-col w-full">
          <span className="mt-1 mb-1 w-fit rounded-md bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-500">
            {product.category?.name ?? "Sin categoría"}
          </span>
          <h2 className="text-night-title text-lg font-bold">{product.name}</h2>
          <h2 className="text-night-muted text-sm font-semibold">${product.price.toLocaleString()}</h2>
        </div>
      </div>
      <div className="flex flex-col px-5 pb-5 flex-1">
        <p className="text-night-muted text-xs line-clamp-3">
          {product.description || "Sin descripción disponible."}
        </p>
        <p className="text-night-ghost text-xs line-clamp-3 mt-auto pt-5">
          PRODUCT-ID-{product.id}
        </p>
      </div>
    </div>
  )
}

export default ProductCards
