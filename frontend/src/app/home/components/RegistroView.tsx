"use client";

import { useState } from "react";
import { Eye, EyeOff, ChevronLeft, ArrowRight, ChefHat } from "lucide-react";
import { PrimaryBtn, FieldInput, marketingPath } from "./ui";
import { RestaurantServices } from "../../../services/RestaurantServices";
import { useGlobalContext } from "../../GlobalContext";
import { useRouter } from "next/navigation";

export default function RegistroView() {
  const { setUsername, setRole, setRestaurantId, setIsAuthenticated } = useGlobalContext();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    restaurante: "",
    nombreEncargado: "",
    email: "",
    telefono: "",
    password: "",
    confirm: "",
  });
  const router = useRouter();
  const navigate = (page: "login" | "landing") => router.push(marketingPath(page));

  async function handleSubmit(): Promise<void> {
    setError("");
    setSuccess("");
    if (submitting) return;

    if (!form.restaurante.trim()) {
      setError("El nombre del restaurante es obligatorio");
      return;
    }
    if (!form.nombreEncargado.trim()) {
      setError("El nombre del encargado es obligatorio");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Ingresá un email válido");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setSubmitting(true);
    try {
      const result = await RestaurantServices.register({
        name: form.restaurante.trim(),
        password: form.password,
        nombreDelEncargado: form.nombreEncargado.trim(),
        email: form.email.trim(),
        phoneNumber: form.telefono.trim(),
      });

      // Start the session with the newly created restaurant's scope.
      setUsername(result.userName);
      setRole(result.role);
      setRestaurantId(result.restaurantId);
      setIsAuthenticated(true);
      setSuccess("Restaurante creado correctamente");

      // Confirm visibly, then enter the app.
      setTimeout(() => {
        router.push(`/kitchen/${result.restaurantId}/mesas`);
      }, 1500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear el restaurante";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative bg-white">
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gray-900">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="text-gray-900 font-bold text-xl">
            MyKitchen
          </span>
        </div>

        <div className="rounded-2xl p-8 border border-gray-200 bg-white shadow-lg">
          <h1 className="text-gray-900 text-2xl font-bold mb-1">Creá tu restaurante</h1>
          <p className="text-gray-500 text-sm mb-7">
            Configurá tu cuenta en menos de 2 minutos.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3 mb-6">
              {success}
            </div>
          )}

          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <FieldInput
              label="Nombre del restaurante"
              placeholder="Ej: La Parrilla del Centro"
              value={form.restaurante}
              onChange={(v) => setForm({ ...form, restaurante: v })}
            />
            <FieldInput
              label="Nombre del encargado"
              placeholder="Ej: Juan Pérez"
              value={form.nombreEncargado}
              onChange={(v) => setForm({ ...form, nombreEncargado: v })}
            />
            <FieldInput
              label="Email"
              type="email"
              placeholder="Ej: hola@turestaurante.com"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <FieldInput
              label="Teléfono"
              placeholder="Ej: 11 5555 1234"
              value={form.telefono}
              onChange={(v) => setForm({ ...form, telefono: v })}
            />
            <FieldInput
              label="Contraseña"
              type={showPass ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <FieldInput
              label="Confirmar contraseña"
              type={showConfirm ? "text" : "password"}
              placeholder="Repetí tu contraseña"
              value={form.confirm}
              onChange={(v) => setForm({ ...form, confirm: v })}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <PrimaryBtn type="submit" className="w-full text-base py-4 mt-1">
              {submitting ? "Creando restaurante..." : (
                <>Crear tu restaurante <ArrowRight className="w-4 h-4" /></>
              )}
            </PrimaryBtn>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            ¿Ya tenés cuenta?{" "}
            <button
              onClick={() => navigate("login")}
              className="text-gray-900 hover:underline transition-colors font-semibold cursor-pointer"
            >
              Iniciá sesión
            </button>
          </p>
        </div>

        <button
          onClick={() => navigate("landing")}
          className="flex items-center justify-center gap-1.5 text-gray-400 hover:text-gray-700 text-xs mt-6 mx-auto transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Volver al inicio
        </button>
      </div>
    </div>
  );
}