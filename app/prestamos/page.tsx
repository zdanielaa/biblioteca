import { supabase } from "@/lib/supabase"
import { Tabla } from "@/components/tabla"
import type { Prestamo } from "@/lib/types"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

async function getPrestamos(): Promise<Prestamo[]> {
  // Obtener préstamos básicos
  const { data: prestamosData, error } = await supabase
    .from("prestamos")
    .select("*")
    .order("fecha_prestamo", { ascending: false })

  if (error) {
    console.error("Error fetching prestamos:", error)
    return []
  }

  if (!prestamosData || prestamosData.length === 0) {
    return []
  }

  // Obtener usuarios
  const usuarioIds = [...new Set(prestamosData.map((p) => p.id_usuario).filter(Boolean))]
  const { data: usuariosData } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, apellido")
    .in("id_usuario", usuarioIds)

  // Obtener ejemplares y libros
  const ejemplarIds = [...new Set(prestamosData.map((p) => p.id_ejemplar).filter(Boolean))]
  const { data: ejemplaresData } = await supabase
    .from("ejemplares")
    .select("id_ejemplar, codigo_interno, id_libro")
    .in("id_ejemplar", ejemplarIds)

  const libroIds = [...new Set(ejemplaresData?.map((e) => e.id_libro).filter(Boolean) || [])]
  const { data: librosData } = await supabase.from("libros").select("id_libro, titulo").in("id_libro", libroIds)

  // Combinar datos
  const prestamosConDatos = prestamosData.map((prestamo) => {
    const usuario = usuariosData?.find((u) => u.id_usuario === prestamo.id_usuario)
    const ejemplar = ejemplaresData?.find((e) => e.id_ejemplar === prestamo.id_ejemplar)
    const libro = ejemplar ? librosData?.find((l) => l.id_libro === ejemplar.id_libro) : null

    return {
      ...prestamo,
      usuario,
      ejemplar: ejemplar
        ? {
            ...ejemplar,
            libro,
          }
        : null,
    }
  })

  return prestamosConDatos
}

export default async function PrestamosPage() {
  const prestamos = await getPrestamos()
  const prestamosActivos = prestamos.filter((p) => !p.fecha_devolucion_real).length

  const columns = [
    {
      key: "usuario",
      label: "Usuario",
      render: (prestamo: Prestamo) =>
        prestamo.usuario ? `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}` : "-",
    },
    {
      key: "libro",
      label: "Libro",
      render: (prestamo: Prestamo) => prestamo.ejemplar?.libro?.titulo || "-",
    },
    {
      key: "codigo_interno",
      label: "Ejemplar",
      render: (prestamo: Prestamo) => prestamo.ejemplar?.codigo_interno || "-",
    },
    {
      key: "fecha_prestamo",
      label: "Fecha Préstamo",
      render: (prestamo: Prestamo) => new Date(prestamo.fecha_prestamo).toLocaleDateString(),
    },
    {
      key: "fecha_devolucion_prevista",
      label: "Devolución Prevista",
      render: (prestamo: Prestamo) => new Date(prestamo.fecha_devolucion_prevista).toLocaleDateString(),
    },
    {
      key: "estado",
      label: "Estado",
      render: (prestamo: Prestamo) => {
        const hoy = new Date()
        const fechaDevolucion = new Date(prestamo.fecha_devolucion_prevista)
        const devuelto = !!prestamo.fecha_devolucion_real
        const atrasado = !devuelto && hoy > fechaDevolucion

        if (devuelto) {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Devuelto
            </span>
          )
        } else if (atrasado) {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Atrasado
            </span>
          )
        } else {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Clock className="h-3 w-3 mr-1" />
              Activo
            </span>
          )
        }
      },
    },
    { key: "numero_renovaciones", label: "Renovaciones" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-900">Gestión de Préstamos</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <FileText className="h-5 w-5" />
            <span>{prestamos.length} préstamos totales</span>
          </div>
          <div className="flex items-center space-x-2 text-yellow-600">
            <Clock className="h-5 w-5" />
            <span>{prestamosActivos} activos</span>
          </div>
        </div>
      </div>

      <Tabla data={prestamos} columns={columns} title="Lista de Préstamos" />
    </div>
  )
}
