'use client';
import { useState, useEffect } from 'react';
import MenuContent from './MenuContent';
import { ProductServices } from '../../../../services/ProductServices';
import { CategoryServices } from '../../../../services/CategoryServices';
import { useGlobalContext } from '../../../GlobalContext';
import { Product } from '../../../../models/product';
import { Category } from '../../../../models/category';

export default function InventarioPage() {
  const { isAuthenticated } = useGlobalContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    ProductServices.getAll().then(setProducts).catch(() => setProducts([]));
    CategoryServices.getAll().then(setCategories).catch(() => setCategories([]));
  }, [isAuthenticated]);

  return <MenuContent products={products} categories={categories} />;
}
