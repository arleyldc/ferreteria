"use client";

import { useState } from "react";
import { toast } from "sonner";
import { activateUser } from "@/actions/user.actions";

interface UserDeleteButtonProps {
  userId: string;
  onSuccess: () => void;
}

export function UserActiveButton({ userId, onSuccess }: UserDeleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const result = await activateUser(userId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Usuario activado correctamente");
        setShowConfirm(false);
        onSuccess();
      }
    } catch (error) {
      toast.error("Error al activar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-green-600 hover:text-green-700 font-medium text-sm"
      >
        Activar
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              Activar Usuario
            </h2>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas activar este usuario?
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-md hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "Procesando..." : "Activar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
