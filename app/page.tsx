import { supabase } from "@/lib/supabase"
import { LibroCard } from "@/components/libro-card"
import type { Libro } from "@/lib/types"
import { Search } from "lucide-react"

async function getLibros(): Promise<Libro[]> {
  // Primero obtenemos los libros básicos
  const { data: librosData, error: librosError } = await supabase.from("libros").select("*").order("titulo")

  if (librosError) {
    console.error("Error fetching libros:", librosError)
    return []
  }

  if (!librosData || librosData.length === 0) {
    return []
  }

  // Obtenemos las editoriales
  const editorialIds = [...new Set(librosData.map((libro) => libro.id_editorial).filter(Boolean))]
  const { data: editorialesData } = await supabase.from("editoriales").select("*").in("id_editorial", editorialIds)

  // Obtenemos los autores
  const { data: librosAutoresData } = await supabase
    .from("libros_autores")
    .select(`
      id_libro,
      rol_autor,
      autores (
        id_autor,
        nombre,
        nacionalidad
      )
    `)
    .in(
      "id_libro",
      librosData.map((libro) => libro.id_libro),
    )

  // Combinamos los datos
  const librosConDatos = librosData.map((libro) => {
    const editorial = editorialesData?.find((e) => e.id_editorial === libro.id_editorial)
    const autoresDelLibro = librosAutoresData?.filter((la) => la.id_libro === libro.id_libro) || []

    return {
      ...libro,
      editorial,
      autores: autoresDelLibro.map((la: any) => ({
        ...la.autores,
        rol: la.rol_autor,
      })),
    }
  })

  return librosConDatos
}

export default async function LibrosPage() {
  const libros = await getLibros()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-900">Catálogo de Libros</h1>
        <div className="flex items-center space-x-2 text-gray-600">
          <Search className="h-5 w-5" />
          <span>{libros.length} libros disponibles</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {libros.map((libro) => (
          <LibroCard key={libro.id_libro} libro={libro} />
        ))}
      </div>

      {libros.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No hay libros disponibles en el catálogo</div>
        </div>
      )}
    </div>
  )
}
