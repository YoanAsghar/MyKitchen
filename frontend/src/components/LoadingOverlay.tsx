import { type FC } from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;        // Mensaje opcional debajo del spinner
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ isVisible, message = "Cargando..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-14 h-14 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        
        {/* Mensaje opcional */}
        {message && (
          <p className="mt-6 text-white text-lg font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
