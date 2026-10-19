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
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-white/40 text-sm">
            Administra el catálogo de la carta.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#22c55e] text-[#0a0a0f] hover:brightness-110 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400 border border-red-500/20 bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-white/40">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-white/40">Aún no hay productos.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {products.map((product) => (
              <li key={product.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-white/40 truncate">
                    {product.description || "Sin descripción"}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-white/60 shrink-0">
                  {product.category?.name || "Sin categoría"}
                </span>
                <span className="text-sm font-semibold shrink-0 w-20 text-right">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101014] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {modal === "create" ? "Nuevo producto" : "Editar producto"}
              </h2>
              <button
                onClick={() => setModal("closed")}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Hamburguesa clásica"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                    Precio
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm focus:outline-none focus:border-[#22c55e] text-white"
                  >
                    <option value="" className="bg-[#0a0a0f]">
                      Sin categoría
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)} className="bg-[#0a0a0f]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción corta del producto"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                  Imagen (URL, opcional)
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#22c55e] text-[#0a0a0f] hover:brightness-110 transition-colors cursor-pointer"
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