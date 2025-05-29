import { supabase } from "@/lib/supabase"
import { Tabla } from "@/components/tabla"
import type { Usuario } from "@/lib/types"
import { Users, UserCheck, UserX, Eye } from "lucide-react"
import Link from "next/link"

async function getUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase.from("usuarios").select("*").order("apellido", { ascending: true })

  if (error) {
    console.error("Error fetching usuarios:", error)
    return []
  }

  return data || []
}

export default async function UsuariosPage() {
  const usuarios = await getUsuarios()
  const usuariosActivos = usuarios.filter((u) => u.usuario_activo).length

  const columns = [
    {
      key: "nombre",
      label: "Nombre",
      render: (usuario: Usuario) => `${usuario.nombre} ${usuario.apellido}`,
    },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "numero_documento", label: "Documento" },
    {
      key: "fecha_registro",
      label: "Fecha Registro",
      render: (usuario: Usuario) => new Date(usuario.fecha_registro).toLocaleDateString(),
    },
    {
      key: "usuario_activo",
      label: "Estado",
      render: (usuario: Usuario) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            usuario.usuario_activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {usuario.usuario_activo ? (
            <>
              <UserCheck className="h-3 w-3 mr-1" />
              Activo
            </>
          ) : (
            <>
              <UserX className="h-3 w-3 mr-1" />
              Inactivo
            </>
          )}
        </span>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (usuario: Usuario) => (
        <Link
          href={`/usuarios/${usuario.id_usuario}`}
          className="inline-flex items-center px-2 py-1 bg-primary-900 text-white rounded text-xs hover:bg-primary-800 transition-colors"
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver detalles
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-900">Usuarios Registrados</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="h-5 w-5" />
            <span>{usuarios.length} usuarios totales</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <UserCheck className="h-5 w-5" />
            <span>{usuariosActivos} activos</span>
          </div>
        </div>
      </div>

      <Tabla data={usuarios} columns={columns} title="Lista de Usuarios" />
    </div>
  )
}
