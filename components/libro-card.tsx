import Link from "next/link"
import { Book, Calendar, Building } from "lucide-react"
import type { Libro } from "@/lib/types"

interface LibroCardProps {
  libro: Libro
}

export function LibroCard({ libro }: LibroCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{libro.titulo}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Book className="h-4 w-4" />
              <span>ISBN: {libro.isbn}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Año: {libro.año_publicacion}</span>
            </div>
            {libro.editorial && (
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>{libro.editorial.nombre}</span>
              </div>
            )}
            {libro.autores && libro.autores.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Autores: </span>
                {libro.autores.map((autor, index) => (
                  <span key={autor.id_autor}>
                    {autor.nombre}
                    {index < libro.autores!.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-gray-700 mt-3 line-clamp-3">{libro.descripcion}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">Dewey: {libro.clasificacion_dewey}</span>
        <Link
          href={`/libros/${libro.id_libro}`}
          className="bg-primary-900 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-800 transition-colors"
        >
          Ver detalles
        </Link>
      </div>
    </div>
  )
}
