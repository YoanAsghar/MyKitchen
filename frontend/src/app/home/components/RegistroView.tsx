"use client";

import { useState } from "react";
import { Eye, EyeOff, ChevronLeft, ArrowRight, ChefHat } from "lucide-react";
import { PrimaryBtn, FieldInput, marketingPath } from "./ui";
import { RestaurantServices } from "../../../services/RestaurantServices";
import { useGlobalContext } from "../../GlobalContext";
import { restaurantSlug } from "../../../restaurantSlug";
import { useRouter } from "next/navigation";

export default function RegistroView() {
  const { setUsername, setRole, setRestaurantId, setRestaurantName, setIsAuthenticated } = useGlobalContext();
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
      setRestaurantName(result.restaurant?.name ?? "");
      setIsAuthenticated(true);
      setSuccess("Restaurante creado correctamente");

      // Confirm visibly, then enter the app under the restaurant's slug.
      setTimeout(() => {
        router.push(`/kitchen/${restaurantSlug(result.restaurant?.name, result.restaurantId)}/mesas`);
      }, 1500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear el restaurante";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-orange-500">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex items-center justify-center p-8 xl:p-12 relative">
          <div className="max-w-md xl:max-w-lg w-full">
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Restaurante ilustración"
              className="w-full h-auto rounded-3xl shadow-2xl object-cover"
            />
            <div className="mt-6 text-white">
              <h2 className="text-2xl xl:text-3xl font-bold mb-2">Gestioná tu restaurante con facilidad</h2>
              <p className="text-white/90 text-sm xl:text-base">Todo lo que necesitás para administrar mesas, pedidos y cocina en un solo lugar.</p>
            </div>
          </div>
        </div>

        <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-y-auto">
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-md relative z-10 py-4 sm:py-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-900 flex-shrink-0">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg sm:text-xl">
                MyKitchen
              </span>
            </div>

            <div className="rounded-2xl p-5 sm:p-6 lg:p-7 border border-white/20 bg-white shadow-2xl">
              <h1 className="text-gray-900 text-xl sm:text-2xl font-bold mb-1">Creá tu restaurante</h1>
              <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-5">
                Configurá tu cuenta en menos de 2 minutos.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-4">
                  {success}
                </div>
              )}

              <form
                className="flex flex-col gap-3 sm:gap-4"
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
                <PrimaryBtn type="submit" className="w-full text-sm sm:text-base py-3 sm:py-3.5 mt-1">
                  {submitting ? "Creando restaurante..." : (
                    <>Crear tu restaurante <ArrowRight className="w-4 h-4" /></>
                  )}
                </PrimaryBtn>
              </form>

              <p className="text-center text-gray-500 text-xs sm:text-sm mt-4 sm:mt-5">
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
              className="flex items-center justify-center gap-1.5 text-white/90 hover:text-white text-xs mt-4 mx-auto transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}