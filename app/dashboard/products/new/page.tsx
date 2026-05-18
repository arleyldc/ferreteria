"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createProduct } from "@/actions/product.actions";
import { getCategories } from "@/actions/category.actions";

/**
 * Create new product page
 */
export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    };
    loadCategories();
  }, []);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploadingImage(true);

    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse?.message || "Error uploading image");
      }

      const data = await response.json();
      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Error uploading image");
      setImagePreview(undefined);
      setImageUrl(undefined);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);

      const result = await createProduct({
        name: formData.get("name") as string,
        categoryId: formData.get("categoryId") as string,
        description: (formData.get("description") as string) || undefined,
        unitBase: (formData.get("baseUnit") as string) || "UNIDAD",
        isFractionable: formData.get("fractionalQuantity") === "on",
        stockMin: parseFloat(formData.get("minimumStock") as string) || 0,
        stockCurrent: parseFloat(formData.get("stockCurrent") as string) || 0,
        costPriceAvg: parseFloat(formData.get("costPriceAvg") as string) || 0,
        imageUrl,
      });

      if (!result.success) {
        setError(result.message || "Error al crear producto");
        return;
      }

      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message || "Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            ➕ Crear Producto
          </h1>
          <p className="text-slate-600 mt-1">
            Agrega un nuevo producto al catálogo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Rellena los datos principales del producto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Clavo 2 pulgadas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Descripción detallada del producto (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Imagen del producto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadingImage && (
                <p className="mt-2 text-sm text-slate-500">
                  Subiendo imagen...
                </p>
              )}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500 mb-2">
                    Previsualización
                  </p>
                  <img
                    src={imagePreview}
                    alt="Vista previa de imagen"
                    className="h-40 w-full object-contain rounded-lg border border-slate-200"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-300 mb-4">
                Stock y Unidades
              </h3>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Unidad Base *
                  </label>
                  <select
                    name="baseUnit"
                    required
                    className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecciona</option>
                    <option value="UNIDAD">Unidad</option>
                    <option value="KILOGRAMO">Kilogramo</option>
                    <option value="LITRO">Litro</option>
                    <option value="METRO">Metro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    name="stockCurrent"
                    min={0}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    name="minimumStock"
                    required
                    min={0}
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="fractionalQuantity"
                    className="w-4 h-4 border border-slate-300 rounded focus:outline-none"
                  />
                  <span className="text-sm text-slate-300">
                    Permitir cantidades fraccionadas (decimales)
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-300 mb-4">Costos</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Costo Unitario *
                  </label>
                  <input
                    type="number"
                    name="costPriceAvg"
                    min={0}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Costo promedio ponderado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Costo Envío (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 font-medium"
              >
                {loading ? "Creando..." : "Crear Producto"}
              </button>
              <Link
                href="/dashboard/products"
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-300 rounded-lg hover:bg-slate-500 font-medium text-center"
              >
                Cancelar
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
