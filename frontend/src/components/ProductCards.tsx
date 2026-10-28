import { Product } from "../models/product"

interface ProductCardsProps {
  product: Product;
}

const ProductCards = ({product} :ProductCardsProps)  => {
  return (
    <div className="rounded-xl w-full flex flex-col overflow-hidden border border-night-line bg-night-raised shadow-[0_20px_50px_-25px_rgba(0,0,0,0.65)] transition-colors hover:border-night-line-strong">
        <div className="h-32 w-full border-b border-night-line sm:h-40">
          <img 
            className="w-full h-full object-cover" 
            src={product.image || "/logoipsum-small.png"} 
            alt={product.name} 
          />
        </div>
      <div className="flex flex-row items-center p-3 min-h-0 sm:p-4 sm:min-h-20">
        <div className="flex flex-col w-full">
          <span className="mt-1 mb-1 w-fit max-w-full truncate rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-500 sm:py-1 sm:text-xs">
            {product.category?.name ?? "Sin categoría"}
          </span>
          <h2 className="text-night-title text-base font-bold sm:text-lg">{product.name}</h2>
          <h2 className="text-night-muted text-xs font-semibold sm:text-sm">${product.price.toLocaleString()}</h2>
        </div>
      </div>
      <div className="flex flex-col px-3 pb-3 flex-1 sm:px-4 sm:pb-4">
        <p className="text-night-muted text-[11px] leading-snug line-clamp-3 sm:text-xs">
          {product.description || "Sin descripción disponible."}
        </p>
        <p className="hidden text-night-ghost text-xs mt-auto pt-5 sm:block">
          PRODUCT-ID-{product.id}
        </p>
      </div>
    </div>
  )
}

export default ProductCards
