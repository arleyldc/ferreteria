"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProduct, deleteProduct } from "@/actions/product.actions";
import { getCategories } from "@/actions/category.actions";

/**
 * Edit product page
 */
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProduct();
    loadCategories();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Producto no encontrado");
      const data = await response.json();
      setProduct(data.data);
      setImageUrl(data.data.imageUrl || undefined);
      setImagePreview(data.data.imageUrl || undefined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingProduct(false);
    }
  };

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
        throw new Error(errorResponse?.message || "Error subiendo la imagen");
      }

      const data = await response.json();
      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Error subiendo la imagen");
      setImagePreview(undefined);
      setImageUrl(undefined);
    } finally {
      setUploadingImage(false);
    }
  };

  const loadCategories = async () => {
    const result = await getCategories();
    if (result.success) {
      setCategories(result.data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);

      const result = await updateProduct(productId, {
        name: formData.get("name") as string,
        categoryId: formData.get("categoryId") as string,
        description: (formData.get("description") as string) || undefined,
        unitBase: (formData.get("baseUnit") as string) || "UNIDAD",
        stockMin: parseFloat(formData.get("minimumStock") as string) || 0,
        stockCurrent: parseFloat(formData.get("stockCurrent") as string) || 0,
        isFractionable: formData.get("fractionalQuantity") === "on",
        imageUrl,
      });

      if (!result.success) {
        setError(result.message || "Error al actualizar producto");
        return;
      }

      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message || "Error al actualizar producto");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      const result = await deleteProduct(productId);
      if (!result.success) {
        setError(result.message || "No se puede eliminar este producto");
        return;
      }
      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loadingProduct) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-slate-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            ✏️ Editar Producto
          </h1>
          <p className="text-slate-600 mt-1">Modifica los datos del producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Actualiza los datos principales del producto
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
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Código (No editable)
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                  placeholder="PRD-001"
                  defaultValue={product?.code || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Clavo 2 pulgadas"
                  defaultValue={product?.name || ""}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Categoría *
              </label>
              <select
                name="categoryId"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                defaultValue={product?.categoryId || ""}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Descripción detallada del producto (opcional)"
                defaultValue={product?.description || ""}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
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
              <h3 className="font-semibold text-slate-900 mb-4">
                Stock y Unidades
              </h3>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Unidad Base (No editable)
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                    placeholder="UNIDAD"
                    defaultValue={product?.baseUnit || ""}
                  />{" "}
                  <input
                    type="hidden"
                    name="baseUnit"
                    value={product?.unitBase || ""}
                  />{" "}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Stock Actual *
                  </label>
                  <input
                    type="number"
                    name="stockCurrent"
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="0"
                    defaultValue={product?.stockCurrent || 0}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Se actualiza automáticamente con movimientos
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    name="minimumStock"
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="0"
                    defaultValue={product?.minimumStock || 0}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="fractionalQuantity"
                    className="w-4 h-4 border border-slate-300 rounded focus:outline-none"
                    defaultChecked={product?.isFractionable}
                  />
                  <span className="text-sm text-slate-900">
                    Permite cantidades fraccionadas (decimales)
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-slate-900 mb-4">Costos</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Costo Promedio Ponderado (No editable)
                  </label>
                  <input
                    type="number"
                    disabled
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                    placeholder="0.00"
                    defaultValue={product?.costPriceAvg?.toFixed(2) || "0.00"}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Se calcula automáticamente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Notas de Costo
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Observaciones sobre el costo"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 font-medium"
              >
                {loading ? "Actualizando..." : "Guardar Cambios"}
              </button>
              <Link
                href="/dashboard/products"
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 font-medium text-center"
              >
                Cancelar
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Estas acciones no se pueden deshacer. Por favor confirma antes de
              eliminar.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              🗑️ Eliminar Producto
            </button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
