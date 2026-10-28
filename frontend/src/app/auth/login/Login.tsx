import { UserServices } from "@/services/UserServices";
import { User } from "@/models/user";
import { useGlobalContext } from "../../GlobalContext";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, ChefHat, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { FieldInput, marketingPath } from "../../home/components/ui";
import { colorPalette } from "../../../colorPallete";

const Login = () => {
  const { setIsLoading, setUsername, setRole, setRestaurantId, setRestaurantName, setIsAuthenticated } = useGlobalContext();
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
      let response = await UserServices.logIn(new User(loginUsername, loginPassword, 0));

      setUsername(response.userName);
      setRole(response.role);
      setRestaurantId(response.restaurantId ?? 0);
      setRestaurantName(response.restaurantName ?? "");
      setIsAuthenticated(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo iniciar sesión";
      setError(msg || "Credenciales inválidas");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-orange-500">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2">
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
              <h1 className="text-gray-900 text-xl sm:text-2xl font-bold mb-1 text-center lg:text-left">Iniciar sesión</h1>
              <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 text-center lg:text-left">
                Accedé al sistema de gestión
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mb-4">
                  {error}
                </div>
              )}

              <form
                className="flex flex-col gap-4 sm:gap-5"
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
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] w-full text-sm sm:text-base py-3 sm:py-3.5 cursor-pointer"
                  style={{ backgroundColor: colorPalette.Navy }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a0096")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorPalette.Navy)}
                >
                  Acceder al Sistema <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-gray-500 text-xs sm:text-sm mt-4 sm:mt-5">
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
              className="flex items-center justify-center gap-1.5 text-white/90 hover:text-white text-xs mt-4 mx-auto transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Volver al inicio
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center p-8 xl:p-12 relative">
          <div className="max-w-md xl:max-w-lg w-full">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Restaurante ilustración"
              className="w-full h-auto rounded-3xl shadow-2xl object-cover"
            />
            <div className="mt-6 text-white">
              <h2 className="text-2xl xl:text-3xl font-bold mb-2">Control total desde cualquier lugar</h2>
              <p className="text-white/90 text-sm xl:text-base">Administrá tu negocio con una plataforma rápida, simple y pensada para restaurantes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
