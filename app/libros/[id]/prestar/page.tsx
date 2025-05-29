"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Calendar, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Usuario, Libro, Ejemplar } from "@/lib/types"

export default function PrestarLibroPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [libro, setLibro] = useState<Libro | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [ejemplaresDisponibles, setEjemplaresDisponibles] = useState<Ejemplar[]>([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>("")
  const [ejemplarSeleccionado, setEjemplarSeleccionado] = useState<string>("")
  const [fechaDevolucion, setFechaDevolucion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    cargarLibro()
    cargarUsuarios()
    cargarEjemplaresDisponibles()

    // Establecer fecha de devolución por defecto (14 días desde hoy)
    const fechaDefault = new Date()
    fechaDefault.setDate(fechaDefault.getDate() + 14)
    setFechaDevolucion(fechaDefault.toISOString().split("T")[0])
  }, [params.id])

  const cargarLibro = async () => {
    const { data, error } = await supabase
      .from("libros")
      .select(`
        *,
        editorial:editoriales(*),
        autores:libros_autores(
          rol_autor,
          autor:autores(*)
        )
      `)
      .eq("id_libro", params.id)
      .single()

    if (data) {
      setLibro({
        ...data,
        autores: data.autores?.map((la: any) => ({ ...la.autor, rol: la.rol_autor })) || [],
      })
    }
  }

  const cargarUsuarios = async () => {
    const { data, error } = await supabase.from("usuarios").select("*").eq("usuario_activo", true).order("apellido")

    if (data) {
      setUsuarios(data)
    }
  }

  const cargarEjemplaresDisponibles = async () => {
    // Obtener ejemplares activos
    const { data, error } = await supabase
      .from("ejemplares")
      .select("*")
      .eq("id_libro", params.id)
      .eq("estado", "activo")

    if (error || !data) {
      setEjemplaresDisponibles([])
      return
    }

    // Filtrar ejemplares que no estén prestados actualmente
    const { data: prestamosActivos } = await supabase
      .from("prestamos")
      .select("id_ejemplar")
      .in(
        "id_ejemplar",
        data.map((e) => e.id_ejemplar),
      )
      .is("fecha_devolucion_real", null)

    const ejemplaresPrestados = prestamosActivos?.map((p) => p.id_ejemplar) || []
    const ejemplaresLibres = data.filter((e) => !ejemplaresPrestados.includes(e.id_ejemplar))

    setEjemplaresDisponibles(ejemplaresLibres)
  }

  const realizarPrestamo = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.from("prestamos").insert({
        id_usuario: usuarioSeleccionado,
        id_ejemplar: ejemplarSeleccionado,
        fecha_prestamo: new Date().toISOString().split("T")[0],
        fecha_devolucion_prevista: fechaDevolucion,
        estado_prestamo: "activo",
        numero_renovaciones: 0,
      })

      if (error) throw error

      // Actualizar estado del ejemplar a 'pendiente'
      await supabase.from("ejemplares").update({ estado: "pendiente" }).eq("id_ejemplar", ejemplarSeleccionado)

      router.push(`/libros/${params.id}?prestamo=success`)
    } catch (err: any) {
      setError(err.message || "Error al realizar el préstamo")
    } finally {
      setLoading(false)
    }
  }

  if (!libro) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href={`/libros/${params.id}`}
          className="flex items-center space-x-2 text-primary-900 hover:text-primary-700"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver al libro</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-primary-100 p-3 rounded-full">
            <BookOpen className="h-6 w-6 text-primary-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prestar Libro</h1>
            <p className="text-gray-600">
              {libro.titulo} - {libro.autores?.map((a) => a.nombre).join(", ")}
            </p>
          </div>
        </div>

        <form onSubmit={realizarPrestamo} className="space-y-6">
          {/* Selección de usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar usuario *</label>
            <select
              value={usuarioSeleccionado}
              onChange={(e) => setUsuarioSeleccionado(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seleccione un usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombre} {usuario.apellido} - {usuario.correo}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de ejemplar */}
          {ejemplaresDisponibles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar ejemplar *</label>
              <select
                value={ejemplarSeleccionado}
                onChange={(e) => setEjemplarSeleccionado(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Seleccione un ejemplar</option>
                {ejemplaresDisponibles.map((ejemplar) => (
                  <option key={ejemplar.id_ejemplar} value={ejemplar.id_ejemplar}>
                    {ejemplar.codigo_interno} - {ejemplar.ubicacion}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">{ejemplaresDisponibles.length} ejemplar(es) disponible(s)</p>
            </div>
          )}

          {ejemplaresDisponibles.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">No hay ejemplares disponibles para este libro en este momento.</p>
            </div>
          )}

          {/* Fecha de devolución */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de devolución prevista *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={fechaDevolucion}
                onChange={(e) => setFechaDevolucion(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !ejemplarSeleccionado || !usuarioSeleccionado}
              className="flex-1 bg-primary-900 text-white py-2 px-4 rounded-md hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Procesando..." : "Realizar Préstamo"}
            </button>
            <Link
              href={`/libros/${params.id}`}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
