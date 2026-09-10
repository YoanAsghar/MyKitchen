'use client';
import { useState, useEffect } from 'react';
import MenuContent from './MenuContent';
import { ProductServices } from '../../../../services/ProductServices';
import { useGlobalContext } from '../../../GlobalContext';
import { Product } from '../../../../models/product';

export default function InventarioPage() {
  const { isAuthenticated } = useGlobalContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);

  useEffect(() => {
    ProductServices.getAll().then(setProducts);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!products) return;
    const categories = [
      ...new Set(
        products.map((p) => p.category).filter((c) => c && c.trim() !== ''),
      ),
    ];
    setProductCategories(categories.sort());
  }, [products]);

  return (
    <MenuContent
      products={products}
      productCategories={productCategories}
    />
  );
}
