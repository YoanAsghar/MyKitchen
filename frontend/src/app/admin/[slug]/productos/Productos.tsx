"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { ProductServices } from "../../../../services/ProductServices";
import { CategoryServices } from "../../../../services/CategoryServices";
import { Product } from "../../../../models/product";
import { Category } from "../../../../models/category";
import { useGlobalContext } from "../../../GlobalContext";

export default function Productos() {
  const { restaurantId } = useGlobalContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    categoryId: "",
    description: "",
    image: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsData, categoriesData] = await Promise.all([
        ProductServices.getAll(),
        CategoryServices.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", price: "", categoryId: "", description: "", image: "" });
    setModal("create");
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      categoryId: product.categoryId != null ? String(product.categoryId) : "",
      description: product.description,
      image: product.image,
    });
    setModal("edit");
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) return setError("El nombre es obligatorio.");
    const price = Number(form.price);
    if (isNaN(price) || price < 0) return setError("Precio inválido.");

    const categoryId = form.categoryId === "" ? null : Number(form.categoryId);

    const product = new Product(
      editingId ?? 0,
      form.name.trim(),
      price,
      categoryId,
      null,
      form.description.trim(),
      form.image.trim(),
      restaurantId || 1
    );

    try {
      if (modal === "create") {
        await ProductServices.createProduct(product);
      } else if (editingId != null) {
        product.id = editingId;
        await ProductServices.editProduct(product);
      }
      setModal("closed");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el producto.");
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      await ProductServices.deleteProduct(product.id);
      load();
    } catch {
      setError("No se pudo eliminar el producto.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">Productos</h1>
          <p className="mt-1 text-muted text-sm">
            Administra el catálogo de la carta.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-700 border border-red-line bg-red-subtle rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-muted">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-muted">Aún no hay productos.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {products.map((product) => (
              <li key={product.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-ink">{product.name}</p>
                  <p className="text-xs text-muted truncate">
                    {product.description || "Sin descripción"}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full border border-line bg-canvas-deep text-muted shrink-0">
                  {product.category?.name || "Sin categoría"}
                </span>
                <span className="text-sm font-semibold shrink-0 w-20 text-right text-ink">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas-deep cursor-pointer transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 rounded-lg text-muted hover:text-red-700 hover:bg-red-subtle cursor-pointer transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-ink">
                {modal === "create" ? "Nuevo producto" : "Editar producto"}
              </h2>
              <button
                onClick={() => setModal("closed")}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas-deep cursor-pointer transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Hamburguesa clásica"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-line text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">
                  Precio
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-line text-sm text-ink focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                />
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">
                  Categoría
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-line text-sm text-ink focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                >
                  <option value="">
                    Sin categoría
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              </div>

              <div>
                <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción corta del producto"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-line text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                />
              </div>

              <div>
                <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">
                  Imagen (URL, opcional)
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-line text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                />
              </div>

              {error && (
                <p className="text-sm text-red-700 border border-red-line bg-red-subtle rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}