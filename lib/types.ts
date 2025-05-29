export interface TipoDocumento {
  id_tipo_documento: string
  nombre_tipo_documento: string
}

export interface Usuario {
  id_usuario: string
  nombre: string
  apellido: string
  correo: string
  password_hash: string
  direccion: string
  telefono: string
  fecha_nacimiento: string
  numero_documento: string
  tipo_documento: string
  fecha_registro: string
  usuario_activo: boolean
}

export interface Autor {
  id_autor: string
  nombre: string
  nacionalidad: string
  fecha_nacimiento: string
  biografia: string
}

export interface Editorial {
  id_editorial: string
  nombre: string
  pais: string
  año_fundacion: number
  sitio_web: string
}

export interface Libro {
  id_libro: string
  titulo: string
  isbn: string
  año_publicacion: number
  id_editorial: string
  numero_paginas: number
  descripcion: string
  clasificacion_dewey: string
  created_at: string
  updated_at: string
  editorial?: Editorial
  autores?: Autor[]
}

export interface LibroAutor {
  id_libro: string
  id_autor: string
  rol_autor: string
}

export interface Ejemplar {
  id_ejemplar: string
  id_libro: string
  codigo_interno: string
  estado: "activo" | "inactivo" | "pendiente"
  ubicacion: string
  fecha_adquisicion: string
  precio_adquisicion: number
  libro?: Libro
}

export interface Prestamo {
  id_prestamo: string
  id_usuario: string
  id_ejemplar: string
  fecha_prestamo: string
  fecha_devolucion_prevista: string
  fecha_devolucion_real?: string
  estado_prestamo: "activo" | "inactivo" | "pendiente"
  numero_renovaciones: number
  usuario?: Usuario
  ejemplar?: Ejemplar
}

export interface Reserva {
  id_reserva: string
  id_usuario: string
  id_ejemplar: string
  fecha_reserva: string
  fecha_expiracion: string
  estado_reserva: "activo" | "inactivo" | "pendiente"
  usuario?: Usuario
  ejemplar?: Ejemplar
}

export interface Tarifa {
  id_tarifa: string
  dias_retraso_min: number
  dias_retraso_max: number
  monto_por_dia: number
  descripcion: string
}

export interface Multa {
  id_multa: string
  id_prestamo: string
  id_tarifa: string
  dias_retraso: number
  monto_total: number
  fecha_pago?: string
  pagada: boolean
}
