"use client"

import { useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

export function SuccessMessage() {
  const searchParams = useSearchParams()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    if (searchParams.get("prestamo") === "success") {
      setShowMessage(true)
      // Ocultar el mensaje después de 5 segundos
      const timer = setTimeout(() => setShowMessage(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!showMessage) return null

  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <p className="text-green-800 font-medium">¡Préstamo realizado exitosamente!</p>
      </div>
    </div>
  )
}
