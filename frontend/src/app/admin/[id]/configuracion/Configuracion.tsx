"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Check, Lock, Save } from "lucide-react";
import { RestaurantServices } from "../../../../services/RestaurantServices";
import { useGlobalContext } from "../../../GlobalContext";

const inputClassName =
  "w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm focus:outline-none focus:border-[#22c55e] disabled:opacity-60 disabled:cursor-not-allowed";

export default function Configuracion() {
  const { role, restaurantId } = useGlobalContext();
  const canEdit = role === "owner";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creationDate, setCreationDate] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    nombreDelEncargado: "",
    email: "",
    phoneNumber: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const restaurant = await RestaurantServices.getMy();
      setForm({
        name: restaurant.name ?? "",
        nombreDelEncargado: restaurant.nombreDelEncargado ?? "",
        email: restaurant.email ?? "",
        phoneNumber: restaurant.phoneNumber ?? "",
      });
      setCreationDate(restaurant.creationDate ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el restaurante.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (!canEdit) return;

    if (!form.name.trim()) return setError("El nombre del restaurante es obligatorio.");
    if (!form.nombreDelEncargado.trim()) return setError("El nombre del encargado es obligatorio.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Ingresá un email válido.");

    setSaving(true);
    try {
      const updated = await RestaurantServices.update(restaurantId, {
        name: form.name.trim(),
        nombreDelEncargado: form.nombreDelEncargado.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });
      setForm({
        name: updated.name ?? "",
        nombreDelEncargado: updated.nombreDelEncargado ?? "",
        email: updated.email ?? "",
        phoneNumber: updated.phoneNumber ?? "",
      });
      setSuccess("Cambios guardados correctamente.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="mt-1 text-white/40 text-sm">
          Datos del restaurante: nombre, encargado, email y teléfono.
        </p>
      </div>

      {!canEdit && (
        <p className="mt-4 flex items-start gap-2 text-sm text-white/50 border border-white/10 bg-white/[0.02] rounded-lg px-3 py-2.5">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          Solo el <span className="text-white/70">owner</span> del restaurante puede editar
          estos datos. Estás viendo la información en modo lectura.
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400 border border-red-500/20 bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 flex items-center gap-2 text-sm text-[#4ade80] border border-[#22c55e]/20 bg-[#22c55e]/10 rounded-lg px-3 py-2">
          <Check className="w-4 h-4" /> {success}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-6">
        {loading ? (
          <p className="text-sm text-white/40">Cargando restaurante...</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <p className="text-sm font-medium">{form.name || "Mi restaurante"}</p>
                <p className="text-xs text-white/40">
                  ID #{restaurantId}
                  {creationDate
                    ? ` · Creado el ${new Date(creationDate).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                Nombre del restaurante
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: La Parrilla del Centro"
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                Nombre del encargado
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={form.nombreDelEncargado}
                onChange={(e) => setForm({ ...form, nombreDelEncargado: e.target.value })}
                placeholder="Ej: Juan Pérez"
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                type="email"
                disabled={!canEdit}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Ej: hola@turestaurante.com"
                className={inputClassName}
              />
              <p className="mt-1.5 text-xs text-white/30">
                Este email es también el usuario con el que iniciás sesión.
              </p>
            </div>

            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">
                Teléfono
              </label>
              <input
                type="tel"
                disabled={!canEdit}
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder="Ej: 11 5555 1234"
                className={inputClassName}
              />
            </div>

            {canEdit && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold bg-[#22c55e] text-[#0a0a0f] hover:brightness-110 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
