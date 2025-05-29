import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { ArrowLeft, User, Calendar, Mail, Phone, MapPin, AlertCircle, DollarSign, Clock } from "lucide-react"
import Link from "next/link"
import type { Usuario, Multa, Prestamo } from "@/lib/types"

async function getUsuario(id: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      *,
      tipo_documento:tipo_documento(nombre_tipo_documento)
    `)
    .eq("id_usuario", id)
    .single()

  if (error) return null
  return data
}

async function getMultasUsuario(id: string): Promise<Multa[]> {
  const { data, error } = await supabase
    .from("multas")
    .select(`
      *,
      prestamo:prestamos(
        id_prestamo,
        fecha_prestamo,
        fecha_devolucion_prevista,
        fecha_devolucion_real,
        ejemplar:ejemplares(
          codigo_interno,
          libro:libros(titulo)
        )
      )
    `)
    .eq("prestamo.id_usuario", id)
    .order("pagada", { ascending: true })
    .order("fecha_pago", { ascending: false })

  if (error) return []
  return data || []
}

async function getPrestamosUsuario(id: string): Promise<Prestamo[]> {
  const { data, error } = await supabase
    .from("prestamos")
    .select(`
      *,
      ejemplar:ejemplares(
        codigo_interno,
        libro:libros(titulo)
      )
    `)
    .eq("id_usuario", id)
    .order("fecha_prestamo", { ascending: false })

  if (error) return []
  return data || []
}

export default async function UsuarioDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const usuario = await getUsuario(params.id)
  const multas = await getMultasUsuario(params.id)
  const prestamos = await getPrestamosUsuario(params.id)

  if (!usuario) {
    notFound()
  }

  // Calcular estadísticas
  const multasPendientes = multas.filter((m) => !m.pagada).length
  const totalAdeudado = multas
    .filter((m) => !m.pagada)
    .reduce((total, multa) => total + Number.parseFloat(multa.monto_total.toString()), 0)
  const prestamosActivos = prestamos.filter((p) => !p.fecha_devolucion_real).length

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/usuarios" className="flex items-center space-x-2 text-primary-900 hover:text-primary-700">
          <ArrowLeft className="h-5 w-5" />
          <span>Volver a usuarios</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-primary-100 p-4 rounded-full">
            <User className="h-8 w-8 text-primary-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {usuario.nombre} {usuario.apellido}
            </h1>
            <p className="text-gray-600">
              {usuario.tipo_documento?.nombre_tipo_documento}: {usuario.numero_documento}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Préstamos Activos</span>
              </div>
              <span className="text-2xl font-bold text-blue-800">{prestamosActivos}</span>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Multas Pendientes</span>
              </div>
              <span className="text-2xl font-bold text-yellow-800">{multasPendientes}</span>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Total Adeudado</span>
              </div>
              <span className="text-2xl font-bold text-red-800">${totalAdeudado.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Correo Electrónico</p>
                  <p className="text-gray-600">{usuario.correo}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Teléfono</p>
                  <p className="text-gray-600">{usuario.telefono || "No registrado"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Dirección</p>
                  <p className="text-gray-600">{usuario.direccion || "No registrada"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Fecha de Nacimiento</p>
                  <p className="text-gray-600">
                    {usuario.fecha_nacimiento
                      ? new Date(usuario.fecha_nacimiento).toLocaleDateString()
                      : "No registrada"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Fecha de Registro</p>
                  <p className="text-gray-600">{new Date(usuario.fecha_registro).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Historial de Multas</h2>
            {multas.length > 0 ? (
              <div className="space-y-4">
                {multas.map((multa) => (
                  <div
                    key={multa.id_multa}
                    className={`border rounded-lg p-4 ${
                      multa.pagada ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {multa.prestamo?.ejemplar?.libro?.titulo || "Libro no disponible"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Ejemplar: {multa.prestamo?.ejemplar?.codigo_interno || "N/A"}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          multa.pagada ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                        }`}
                      >
                        {multa.pagada ? "Pagada" : "Pendiente"}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Días de retraso:</span> {multa.dias_retraso}
                      </div>
                      <div>
                        <span className="font-medium">Monto:</span> $
                        {Number.parseFloat(multa.monto_total.toString()).toLocaleString()}
                      </div>
                      {multa.fecha_pago && (
                        <div className="col-span-2">
                          <span className="font-medium">Fecha de pago:</span>{" "}
                          {new Date(multa.fecha_pago).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No hay multas registradas</div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Historial de Préstamos</h2>
          {prestamos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Libro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ejemplar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Préstamo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Devolución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prestamos.map((prestamo) => {
                    const hoy = new Date()
                    const fechaDevolucion = new Date(prestamo.fecha_devolucion_prevista)
                    const devuelto = !!prestamo.fecha_devolucion_real
                    const atrasado = !devuelto && hoy > fechaDevolucion

                    let estadoClass = ""
                    let estadoTexto = ""

                    if (devuelto) {
                      estadoClass = "bg-green-100 text-green-800"
                      estadoTexto = "Devuelto"
                    } else if (atrasado) {
                      estadoClass = "bg-red-100 text-red-800"
                      estadoTexto = "Atrasado"
                    } else {
                      estadoClass = "bg-yellow-100 text-yellow-800"
                      estadoTexto = "Activo"
                    }

                    return (
                      <tr key={prestamo.id_prestamo}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {prestamo.ejemplar?.libro?.titulo || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prestamo.ejemplar?.codigo_interno || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(prestamo.fecha_prestamo).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prestamo.fecha_devolucion_real
                            ? new Date(prestamo.fecha_devolucion_real).toLocaleDateString()
                            : new Date(prestamo.fecha_devolucion_prevista).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoClass}`}
                          >
                            {estadoTexto}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No hay préstamos registrados</div>
          )}
        </div>
      </div>
    </div>
  )
}
