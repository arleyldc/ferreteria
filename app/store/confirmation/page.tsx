"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const saleNumber = searchParams.get("saleNumber");

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">¡Compra Completada!</h1>
          <p className="text-gray-600">
            Gracias por tu compra en nuestra ferretería
          </p>
        </div>

        {saleNumber && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Número de Pedido:</p>
            <p className="text-2xl font-bold text-blue-600">{saleNumber}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
          <h3 className="font-semibold mb-3">Próximos pasos:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              Recibirás una confirmación por correo electrónico
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              Nuestro equipo procesará tu pedido
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              Te contactaremos para confirmar los detalles de entrega
            </li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/store">
            <Button variant="outline">Seguir Comprando</Button>
          </Link>
          {saleNumber && (
            <Button disabled className="cursor-default">
              Pedido: {saleNumber}
            </Button>
          )}
        </div>
      </Card>

      <p className="text-center text-gray-600 text-sm mt-8">
        ¿Preguntas? Contáctanos a través de nuestro sitio web
      </p>
    </div>
  );
}
