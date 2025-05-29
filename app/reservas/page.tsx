import { supabase } from "@/lib/supabase"
import { Tabla } from "@/components/tabla"
import type { Reserva } from "@/lib/types"
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react"

async function getReservas(): Promise<Reserva[]> {
  // Obtener reservas básicas
  const { data: reservasData, error } = await supabase
    .from("reservas")
    .select("*")
    .order("fecha_reserva", { ascending: false })

  if (error) {
    console.error("Error fetching reservas:", error)
    return []
  }

  if (!reservasData || reservasData.length === 0) {
    return []
  }

  // Obtener usuarios
  const usuarioIds = [...new Set(reservasData.map((r) => r.id_usuario).filter(Boolean))]
  const { data: usuariosData } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, apellido")
    .in("id_usuario", usuarioIds)

  // Obtener ejemplares y libros
  const ejemplarIds = [...new Set(reservasData.map((r) => r.id_ejemplar).filter(Boolean))]
  const { data: ejemplaresData } = await supabase
    .from("ejemplares")
    .select("id_ejemplar, codigo_interno, id_libro")
    .in("id_ejemplar", ejemplarIds)

  const libroIds = [...new Set(ejemplaresData?.map((e) => e.id_libro).filter(Boolean) || [])]
  const { data: librosData } = await supabase.from("libros").select("id_libro, titulo").in("id_libro", libroIds)

  // Combinar datos
  const reservasConDatos = reservasData.map((reserva) => {
    const usuario = usuariosData?.find((u) => u.id_usuario === reserva.id_usuario)
    const ejemplar = ejemplaresData?.find((e) => e.id_ejemplar === reserva.id_ejemplar)
    const libro = ejemplar ? librosData?.find((l) => l.id_libro === ejemplar.id_libro) : null

    return {
      ...reserva,
      usuario,
      ejemplar: ejemplar
        ? {
            ...ejemplar,
            libro,
          }
        : null,
    }
  })

  return reservasConDatos
}

export default async function ReservasPage() {
  const reservas = await getReservas()
  const reservasActivas = reservas.filter((r) => r.estado_reserva === "activa").length

  const columns = [
    {
      key: "usuario",
      label: "Usuario",
      render: (reserva: Reserva) => (reserva.usuario ? `${reserva.usuario.nombre} ${reserva.usuario.apellido}` : "-"),
    },
    {
      key: "libro",
      label: "Libro",
      render: (reserva: Reserva) => reserva.ejemplar?.libro?.titulo || "-",
    },
    {
      key: "codigo_interno",
      label: "Ejemplar",
      render: (reserva: Reserva) => reserva.ejemplar?.codigo_interno || "-",
    },
    {
      key: "fecha_reserva",
      label: "Fecha Reserva",
      render: (reserva: Reserva) => new Date(reserva.fecha_reserva).toLocaleDateString(),
    },
    {
      key: "fecha_expiracion",
      label: "Fecha Expiración",
      render: (reserva: Reserva) => new Date(reserva.fecha_expiracion).toLocaleDateString(),
    },
    {
      key: "estado_reserva",
      label: "Estado",
      render: (reserva: Reserva) => {
        const hoy = new Date()
        const fechaExpiracion = new Date(reserva.fecha_expiracion)
        const expirada = hoy > fechaExpiracion

        let icon, colorClass, texto

        switch (reserva.estado_reserva) {
          case "activa":
            if (expirada) {
              icon = XCircle
              colorClass = "bg-red-100 text-red-800"
              texto = "Expirada"
            } else {
              icon = Clock
              colorClass = "bg-yellow-100 text-yellow-800"
              texto = "Activa"
            }
            break
          case "completada":
            icon = CheckCircle
            colorClass = "bg-green-100 text-green-800"
            texto = "Completada"
            break
          case "cancelada":
            icon = XCircle
            colorClass = "bg-gray-100 text-gray-800"
            texto = "Cancelada"
            break
          default:
            icon = Clock
            colorClass = "bg-gray-100 text-gray-800"
            texto = reserva.estado_reserva
        }

        const Icon = icon

        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            <Icon className="h-3 w-3 mr-1" />
            {texto}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-900">Gestión de Reservas</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <span>{reservas.length} reservas totales</span>
          </div>
          <div className="flex items-center space-x-2 text-yellow-600">
            <Clock className="h-5 w-5" />
            <span>{reservasActivas} activas</span>
          </div>
        </div>
      </div>

      <Tabla data={reservas} columns={columns} title="Lista de Reservas" />
    </div>
  )
}
