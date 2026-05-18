"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { getOneUserByEmail } from "@/actions/user.actions";

/**
 * Login page content component
 */
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123");

  const error = searchParams?.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await getOneUserByEmail(email);
      if (!data.user) {
        toast.error("Usuario no encontrado");
        router.push("/login");
      }
      if (data && data.user && !data.user.isActive) {
        toast.error("Usuario inactivo. Contacta al administrador.");
        router.push("/login");
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Credenciales inválidas");
        } else if (result?.ok) {
          toast.success("Sesión iniciada");
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            MORIKAWA
            <br />
            <span className="text-green-400">FERRE+</span>
          </h1>
          <p className="text-slate-400">Gestión de Inventario</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-center text-white">
              Iniciar Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-900/50 border-red-700">
                <AlertDescription className="text-red-200">
                  Error: {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="usuario@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                {isLoading ? "Iniciando..." : "Iniciar Sesión"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-400 mb-3">
                Credenciales de prueba:
              </p>
              <div className="space-y-2 text-xs text-slate-400">
                <div>
                  <p className="text-slate-300 font-medium">Admin:</p>
                  <p>admin@example.com / Admin123</p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Almacenista:</p>
                  <p>almacenista@example.com / Alm123</p>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Vendedor:</p>
                  <p>vendedor@example.com / Vend123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          © 2026 MORIKAWA FERRE+ - Sistema de Gestión de Inventario
        </p>
      </div>
    </div>
  );
}

/**
 * Login page with Suspense boundary for useSearchParams
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <p className="text-white">Cargando...</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
