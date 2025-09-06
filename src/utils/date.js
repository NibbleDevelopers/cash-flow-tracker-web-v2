// Utilidades de fechas en zona local

/**
 * Parsea una fecha en formato 'yyyy-MM-dd' (o similar) como fecha local
 * evitando el comportamiento de Date.parse que interpreta el string en UTC.
 */
export function parseLocalDate(input) {
  if (!input) return new Date(NaN)

  if (input instanceof Date) {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate())
  }

  const str = String(input).trim()

  // Coincide con 'yyyy-MM-dd' o 'yyyy/MM/dd'
  const m = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/)
  if (m) {
    const year = Number(m[1])
    const monthIndex = Number(m[2]) - 1
    const day = Number(m[3])
    return new Date(year, monthIndex, day)
  }

  // Fallback: intentar construir Date y normalizar a local (sin hora)
  const date = new Date(str)
  if (!isNaN(date)) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  return new Date(NaN)
}


