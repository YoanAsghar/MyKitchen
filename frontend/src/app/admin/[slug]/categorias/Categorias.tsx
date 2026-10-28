"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { CategoryServices } from "../../../../services/CategoryServices";
import { Category } from "../../../../models/category";
import { useGlobalContext } from "../../../GlobalContext";

export default function Categorias() {
  const { restaurantId } = useGlobalContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCategories(await CategoryServices.getAll());
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "" });
    setModal("create");
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({ name: category.name });
    setModal("edit");
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) return setError("El nombre es obligatorio.");

    const category = new Category(editingId ?? 0, form.name.trim(), restaurantId || 1);

    try {
      if (modal === "create") {
        await CategoryServices.createCategory(category);
      } else if (editingId != null) {
        await CategoryServices.editCategory(category);
      }
      setModal("closed");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la categoría.");
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    setError("");
    try {
      await CategoryServices.deleteCategory(category.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar la categoría.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">Categorías</h1>
          <p className="mt-1 text-muted text-sm">
            Administra las categorías de la carta y asígnalas a los productos.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-700 border border-red-line bg-red-subtle rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-muted">Cargando categorías...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-muted">Aún no hay categorías.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-lg bg-canvas-deep flex items-center justify-center shrink-0">
                  <Tags className="w-4 h-4 text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-ink">{category.name}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(category)}
                    className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas-deep cursor-pointer transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
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
                {modal === "create" ? "Nueva categoría" : "Editar categoría"}
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
                  onChange={(e) => setForm({ name: e.target.value })}
                  placeholder="Ej: Bebidas"
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
