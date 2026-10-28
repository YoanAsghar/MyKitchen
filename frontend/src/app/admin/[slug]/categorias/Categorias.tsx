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
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="mt-1 text-white/40 text-sm">
            Administra las categorías de la carta y asígnalas a los productos.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#22c55e] text-[#0a0a0f] hover:brightness-110 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400 border border-red-500/20 bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-white/40">Cargando categorías...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-white/40">Aún no hay categorías.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Tags className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{category.name}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(category)}
                    className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
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
                {modal === "create" ? "Nueva categoría" : "Editar categoría"}
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
                  onChange={(e) => setForm({ name: e.target.value })}
                  placeholder="Ej: Bebidas"
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
