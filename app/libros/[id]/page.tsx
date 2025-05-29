import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { ArrowLeft, Book, Calendar, Building, MapPin, DollarSign, BookOpen } from "lucide-react"
import Link from "next/link"
import type { Libro, Ejemplar } from "@/lib/types"
import { SuccessMessage } from "./success-message"

async function getLibro(id: string): Promise<Libro | null> {
  // Obtener el libro básico
  const { data: libroData, error: libroError } = await supabase.from("libros").select("*").eq("id_libro", id).single()

  if (libroError || !libroData) {
    return null
  }

  // Obtener la editorial
  let editorial = null
  if (libroData.id_editorial) {
    const { data: editorialData } = await supabase
      .from("editoriales")
      .select("*")
      .eq("id_editorial", libroData.id_editorial)
      .single()

    editorial = editorialData
  }

  // Obtener los autores
  const { data: autoresData } = await supabase
    .from("libros_autores")
    .select(`
      rol_autor,
      autores (
        id_autor,
        nombre,
        nacionalidad,
        fecha_nacimiento,
        biografia
      )
    `)
    .eq("id_libro", id)

  const autores =
    autoresData?.map((la: any) => ({
      ...la.autores,
      rol: la.rol_autor,
    })) || []

  return {
    ...libroData,
    editorial,
    autores,
  }
}

async function getEjemplares(libroId: string): Promise<Ejemplar[]> {
  const { data, error } = await supabase.from("ejemplares").select("*").eq("id_libro", libroId).order("codigo_interno")

  if (error) return []
  return data || []
}

// Función para contar ejemplares disponibles
async function getEjemplaresDisponibles(libroId: string): Promise<number> {
  // Obtener todos los ejemplares activos
  const { data: ejemplaresActivos, error: errorEjemplares } = await supabase
    .from("ejemplares")
    .select("id_ejemplar")
    .eq("id_libro", libroId)
    .eq("estado", "activo")

  if (errorEjemplares || !ejemplaresActivos) return 0

  // Obtener ejemplares en préstamo activo
  const { data: prestamosActivos, error: errorPrestamos } = await supabase
    .from("prestamos")
    .select("id_ejemplar")
    .in(
      "id_ejemplar",
      ejemplaresActivos.map((e) => e.id_ejemplar),
    )
    .is("fecha_devolucion_real", null)

  if (errorPrestamos) return 0

  // Calcular disponibles: activos menos prestados
  return ejemplaresActivos.length - (prestamosActivos?.length || 0)
}

export default async function LibroDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const libro = await getLibro(params.id)
  const ejemplares = await getEjemplares(params.id)
  const ejemplaresDisponibles = await getEjemplaresDisponibles(params.id)

  if (!libro) {
    notFound()
  }

  const estadoColors = {
    activo: "bg-green-100 text-green-800",
    inactivo: "bg-red-100 text-red-800",
    pendiente: "bg-yellow-100 text-yellow-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2 text-primary-900 hover:text-primary-700">
          <ArrowLeft className="h-5 w-5" />
          <span>Volver al catálogo</span>
        </Link>
      </div>

      <SuccessMessage />

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{libro.titulo}</h1>

              {ejemplaresDisponibles > 0 && (
                <Link
                  href={`/libros/${libro.id_libro}/prestar`}
                  className="bg-primary-900 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-800 transition-colors flex items-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Prestar Libro</span>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">ISBN:</span>
                  <span>{libro.isbn}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Año:</span>
                  <span>{libro.año_publicacion}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Editorial:</span>
                  <span>{libro.editorial?.nombre}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Páginas:</span>
                  <span className="ml-2">{libro.numero_paginas}</span>
                </div>
                <div>
                  <span className="font-medium">Clasificación Dewey:</span>
                  <span className="ml-2">{libro.clasificacion_dewey}</span>
                </div>
                <div>
                  <span className="font-medium">País Editorial:</span>
                  <span className="ml-2">{libro.editorial?.pais}</span>
                </div>
              </div>
            </div>

            {libro.autores && libro.autores.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Autores</h3>
                <div className="space-y-2">
                  {libro.autores.map((autor: any) => (
                    <div key={autor.id_autor} className="flex items-center space-x-4">
                      <span className="font-medium">{autor.nombre}</span>
                      <span className="text-gray-600">({autor.nacionalidad})</span>
                      {autor.rol && <span className="bg-gray-100 px-2 py-1 rounded text-sm">{autor.rol}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3">Descripción</h3>
              <p className="text-gray-700 leading-relaxed">{libro.descripcion}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ejemplares</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${ejemplaresDisponibles > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {ejemplaresDisponibles} disponibles
              </span>
            </div>

            <div className="space-y-3">
              {ejemplares.map((ejemplar) => (
                <div key={ejemplar.id_ejemplar} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{ejemplar.codigo_interno}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[ejemplar.estado]}`}>
                      {ejemplar.estado}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{ejemplar.ubicacion}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>${ejemplar.precio_adquisicion}</span>
                    </div>
                    <div className="text-xs">
                      Adquirido: {new Date(ejemplar.fecha_adquisicion).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {ejemplares.length === 0 && (
              <div className="text-center py-8 text-gray-500">No hay ejemplares disponibles</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
