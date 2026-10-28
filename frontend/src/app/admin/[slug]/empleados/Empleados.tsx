"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { UserServices } from "../../../../services/UserServices";
import { User } from "../../../../models/user";
import { useGlobalContext } from "../../../GlobalContext";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-brand-subtle text-brand-700 border-brand-line",
  owner: "bg-gold-subtle text-amber-text border-[#f5b301]/30",
  user: "bg-canvas-deep text-muted border-line",
};

export default function Empleados() {
  const { role: myRole, restaurantId } = useGlobalContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ userName: "", password: "", role: "user" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await UserServices.getAll());
    } catch {
      setError("No se pudieron cargar los empleados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const roleOptions = myRole === "admin" ? ["user", "owner", "admin"] : ["user", "owner"];

  const openCreate = () => {
    setEditingId(null);
    setForm({ userName: "", password: "", role: "user" });
    setModal("create");
  };

  const openEdit = (user: User) => {
    setEditingId(user.id ?? null);
    setForm({ userName: user.userName, password: "", role: user.role });
    setModal("edit");
  };

  const handleSave = async () => {
    setError("");
    if (!form.userName.trim()) return setError("El usuario es obligatorio.");
    if (modal === "create" && form.password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres.");

    const user = new User(form.userName.trim(), form.password, restaurantId || 1);
    user.role = form.role;

    try {
      if (modal === "create") {
        await UserServices.createUser(user);
      } else if (editingId != null) {
        await UserServices.editUser(editingId, user);
      }
      setModal("closed");
      load();
    } catch {
      setError("No se pudo guardar el empleado.");
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`¿Eliminar a ${user.userName}?`)) return;
    try {
      await UserServices.deleteUser(user.id!);
      load();
    } catch {
      setError("No se pudo eliminar el empleado.");
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">Empleados</h1>
          <p className="mt-1 text-muted text-sm">
            Gestiona los usuarios del restaurante y sus roles.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo empleado
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-700 border border-red-line bg-red-subtle rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-muted">Cargando empleados...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-muted">Aún no hay empleados.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-canvas-deep flex items-center justify-center text-sm font-semibold shrink-0 text-ink">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-ink">{user.userName}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium uppercase tracking-wide ${
                    ROLE_BADGE[user.role] ?? ROLE_BADGE.user
                  }`}
                >
                  {user.role}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(user)}
                    className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas-deep cursor-pointer transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
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
                {modal === "create" ? "Nuevo empleado" : "Editar empleado"}
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
                  Usuario (email)
                </label>
                <input
                  type="email"
                  value={form.userName}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                  placeholder="correo@restaurante.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-line text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                />
              </div>

              <div>
                <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">
                  Contraseña{modal === "edit" ? " (vacía para no cambiar)" : ""}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={modal === "create" ? "Mínimo 6 caracteres" : "••••••"}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-line text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                />
              </div>

              <div>
                <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">
                  Rol
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-line text-sm text-ink focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
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