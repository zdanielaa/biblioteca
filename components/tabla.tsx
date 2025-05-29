import type React from "react"
interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
}

interface TablaProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
}

export function Tabla<T extends Record<string, any>>({ data, columns, title }: TablaProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {title && (
        <div className="bg-primary-900 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(item) : String(item[column.key as keyof T] || "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && <div className="text-center py-8 text-gray-500">No hay datos disponibles</div>}
    </div>
  )
}
