"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { UserServices } from "../../../../services/UserServices";
import { User } from "../../../../models/user";
import { useGlobalContext } from "../../../GlobalContext";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-red-500/15 text-red-400 border-red-500/20",
  owner: "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/20",
  user: "bg-white/10 text-white/60 border-white/10",
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
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Empleados</h1>
          <p className="mt-1 text-white/40 text-sm">
            Gestiona los usuarios del restaurante y sus roles.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#22c55e] text-[#0a0a0f] hover:brightness-110 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo empleado
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400 border border-red-500/20 bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-white/40">Cargando empleados...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-white/40">Aún no hay empleados.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold shrink-0">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.userName}</p>
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
                    className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
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
                {modal === "create" ? "Nuevo empleado" : "Editar empleado"}
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
                  Usuario (email)
                </label>
                <input
                  type="email"
                  value={form.userName}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                  placeholder="correo@restaurante.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                  Contraseña{modal === "edit" ? " (vacía para no cambiar)" : ""}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={modal === "create" ? "Mínimo 6 caracteres" : "••••••"}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                  Rol
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm focus:outline-none"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r} className="bg-[#101014]">
                      {r}
                    </option>
                  ))}
                </select>
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