'use client';

import { useState, useMemo } from "react";
import ProductCards from "../../../../components/ProductCards";
import { Product } from "../../../../models/product";
import { colorPalette } from "../../../../colorPallete";

interface MenuContentProps {
  products: Product[];
  productCategories: string[];
}

const MenuContent = ({ products, productCategories }: MenuContentProps) => {
  // Searchbar status
  const [searchQuery, setSearchQuery] = useState("");

  // Current category tab
  const [currentCategoryTab, setCurrentCategoryTab] = useState<string>("");

  // Show images toggle state
  const [showImages, setShowImages] = useState(false);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = currentCategoryTab === "" || p.category === currentCategoryTab;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, currentCategoryTab]);

  return (
    <div
      className="h-full w-full overflow-auto min-h-screen"
      style={{ backgroundColor: colorPalette.DeepTwilight }}
    >
      <div className="p-0">
        <div
          className="flex flex-col w-full"
          style={{ backgroundColor: colorPalette.Navy }}
        >
          {/* Menu top part */}
          <div className="mb-4 h-12 relative flex flex-row items-center m-8">
            <img
              src="/search_icon_white.png"
              alt="Search"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            />
            <input
              type="text"
              className="w-full text-white rounded-lg p-3 pl-12 focus:outline-none"
              placeholder="Nombre del producto..."
              style={{ backgroundColor: colorPalette.Charcoal }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {/* Toggle show images button */}
            <div className="flex flex-row items-center ml-10">
              <h2 className="text-white text-sm font-bold w-30">Mostrar imagenes</h2>
              <div
                onClick={() => setShowImages(!showImages)}
                className={`relative w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  showImages ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    showImages ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div className="flex flex-row ml-8 mb-4">
            <button
              onClick={() => setCurrentCategoryTab("")}
              className={`font-bold m-2 rounded-lg p-3 transition-transform hover:scale-90 cursor-pointer ${
                currentCategoryTab === "" ? "text-black" : "text-white"
              }`}
              style={{
                backgroundColor:
                  currentCategoryTab === "" ? colorPalette.White : colorPalette.Charcoal,
              }}
            >
              Todas
            </button>
            {productCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => setCurrentCategoryTab(category)}
                className={`font-bold m-2 rounded-lg p-3 transition-transform hover:scale-90 cursor-pointer ${
                  currentCategoryTab === category ? "text-black" : "text-white"
                }`}
                style={{
                  backgroundColor:
                    currentCategoryTab === category
                      ? colorPalette.White
                      : colorPalette.Charcoal,
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu cards */}
        <div className="flex flex-wrap p-4">
          {filteredProducts.map((product) => (
            <ProductCards
              key={product.id}
              product={product}
              showImages={showImages}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuContent;
