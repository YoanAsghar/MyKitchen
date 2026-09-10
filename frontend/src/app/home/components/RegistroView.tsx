"use client";

import { useState } from "react";
import { Eye, EyeOff, ChevronLeft, ArrowRight, ChefHat } from "lucide-react";
import { PrimaryBtn, FieldInput, marketingPath } from "./ui";
import { useRouter } from "next/navigation";

export default function RegistroView() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    restaurante: "",
    usuario: "",
    password: "",
    confirm: "",
  });
  const router = useRouter();
  const navigate = (page: "login" | "landing") => router.push(marketingPath(page));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative bg-white">
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gray-900">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="text-gray-900 font-bold text-xl">
            Restaurant CRM
          </span>
        </div>

        <div className="rounded-2xl p-8 border border-gray-200 bg-white shadow-lg">
          <h1 className="text-gray-900 text-2xl font-bold mb-1">Creá tu restaurante</h1>
          <p className="text-gray-500 text-sm mb-7">
            Configurá tu cuenta en menos de 2 minutos.
          </p>

          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <FieldInput
              label="Nombre del restaurante"
              placeholder="Ej: La Parrilla del Centro"
              value={form.restaurante}
              onChange={(v) => setForm({ ...form, restaurante: v })}
            />
            <FieldInput
              label="Nombre de usuario (admin)"
              placeholder="Ej: admin_laparrilla"
              value={form.usuario}
              onChange={(v) => setForm({ ...form, usuario: v })}
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
              Crear tu restaurante <ArrowRight className="w-4 h-4" />
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