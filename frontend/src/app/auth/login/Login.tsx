import { UserServices } from "@/services/UserServices";
import { User } from "@/models/user";
import { useGlobalContext } from "../../GlobalContext";
import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, ChefHat, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { FieldInput, marketingPath } from "../../home/components/ui";
import { colorPalette } from "../../../colorPallete";

const Login = () => {
  const { setIsLoading, setUsername, setRole, setIsAuthenticated } = useGlobalContext();
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const navigate = (page: "registro" | "landing") => router.push(marketingPath(page));

  async function handleLoginButton(): Promise<void> {
    setError("");
    if (!loginUsername || !loginPassword) {
      setError("Usuario y contraseña son requeridos");
      return;
    }

    setIsLoading(true);
    try {
      let response = await UserServices.logIn(new User(loginUsername, loginPassword));

      setUsername(response.userName);
      setRole(response.role);
      setIsAuthenticated(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo iniciar sesión";
      setError(msg || "Credenciales inválidas");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-white">
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gray-900">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <span className="text-gray-900 font-bold text-2xl">
            Restaurant CRM
          </span>
        </div>

        <div className="rounded-2xl p-8 border border-gray-200 bg-white shadow-lg">
          <h1 className="text-gray-900 text-xl font-bold mb-1 text-center">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mb-8 text-center">
            Accedé al sistema de gestión
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleLoginButton();
            }}
          >
            <FieldInput
              label="Usuario"
              placeholder="Tu nombre de usuario"
              value={loginUsername}
              onChange={setLoginUsername}
            />
            <FieldInput
              label="Contraseña"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={loginPassword}
              onChange={setLoginPassword}
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
            <div className="text-right -mt-1">
              <button type="button" className="text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] w-full text-base py-4 cursor-pointer"
              style={{ backgroundColor: colorPalette.Navy }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a0096")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorPalette.Navy)}
            >
              Acceder al Sistema <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            ¿No tenés cuenta?{" "}
            <button
              onClick={() => navigate("registro")}
              className="text-gray-900 hover:underline transition-colors font-semibold cursor-pointer"
            >
              Creá tu restaurante
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
};

export default Login;