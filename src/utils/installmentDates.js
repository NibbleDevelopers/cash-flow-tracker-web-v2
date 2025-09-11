import { format, addMonths, endOfMonth, setDate, isAfter, isBefore } from 'date-fns'

/**
 * Crea una fecha ajustada si el día excede el fin de mes
 * @param {Date} monthStart - Primer día del mes
 * @param {number} day - Día deseado (1-31)
 * @returns {Date} - Fecha ajustada
 */
function createAdjustedDate(monthStart, day) {
  const maxDay = endOfMonth(monthStart).getDate()
  const adjustedDay = Math.min(day, maxDay)
  return setDate(monthStart, adjustedDay)
}

/**
 * Calcula la fecha recomendada de pago basada en el día de vencimiento y corte
 * @param {number} dueDay - Día de vencimiento (1-31)
 * @param {number} cutOffDay - Día de corte (1-31)
 * @param {Date} baseDate - Fecha base para el cálculo (por defecto: hoy)
 * @returns {Object} - Objeto con fecha recomendada y explicación
 */
export function calculateRecommendedPaymentDate(dueDay, cutOffDay, baseDate = new Date()) {
  const today = baseDate
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // Crear fechas base para el mes actual
  const monthStart = new Date(currentYear, currentMonth, 1)
  
  // Calcular fechas ajustando si el día excede el fin de mes
  const currentDueDate = createAdjustedDate(monthStart, dueDay)
  const currentCutOffDate = createAdjustedDate(monthStart, cutOffDay)
  
  let recommendedDate
  let explanation
  
  // Lógica para determinar la fecha recomendada
  if (isAfter(today, currentCutOffDate)) {
    // Si ya pasó el día de corte, el pago debe ser para el próximo mes
    recommendedDate = addMonths(currentDueDate, 1)
    explanation = `Pago para el próximo mes (ya pasó el día de corte ${cutOffDay})`
  } else if (isBefore(today, currentCutOffDate)) {
    // Si aún no llega el día de corte, el pago puede ser para este mes
    if (isAfter(today, currentDueDate)) {
      // Si ya pasó el día de vencimiento, usar el próximo mes
      recommendedDate = addMonths(currentDueDate, 1)
      explanation = `Pago para el próximo mes (ya pasó el día de vencimiento ${dueDay})`
    } else {
      // Si no ha pasado el día de vencimiento, usar este mes
      recommendedDate = currentDueDate
      explanation = `Pago para este mes (antes del día de vencimiento ${dueDay})`
    }
  } else {
    // Si estamos en el día de corte, usar el próximo mes
    recommendedDate = addMonths(currentDueDate, 1)
    explanation = `Pago para el próximo mes (hoy es día de corte ${cutOffDay})`
  }
  
  return {
    date: recommendedDate,
    explanation,
    dueDay,
    cutOffDay,
    isCurrentMonth: recommendedDate.getMonth() === currentMonth && recommendedDate.getFullYear() === currentYear
  }
}

/**
 * Calcula las fechas de pago para un plan de cuotas
 * @param {number} dueDay - Día de vencimiento
 * @param {number} cutOffDay - Día de corte
 * @param {number} numberOfInstallments - Número de cuotas
 * @param {Date} startDate - Fecha de inicio (opcional)
 * @returns {Array} - Array de fechas de pago
 */
export function calculateInstallmentDates(dueDay, cutOffDay, numberOfInstallments, startDate = null) {
  const dates = []
  
  // Si no se proporciona fecha de inicio, calcular la fecha recomendada
  const firstPaymentDate = startDate || calculateRecommendedPaymentDate(dueDay, cutOffDay).date
  
  for (let i = 0; i < numberOfInstallments; i++) {
    const paymentDate = addMonths(firstPaymentDate, i)
    dates.push({
      period: i + 1,
      date: format(paymentDate, 'yyyy-MM-dd'),
      displayDate: format(paymentDate, 'dd/MM/yyyy'),
      month: format(paymentDate, 'MMMM yyyy')
    })
  }
  
  return dates
}

/**
 * Determina si una fecha de pago es óptima basada en el día de vencimiento
 * @param {Date} paymentDate - Fecha de pago
 * @param {number} dueDay - Día de vencimiento
 * @returns {Object} - Información sobre la optimización de la fecha
 */
export function analyzePaymentDate(paymentDate, dueDay) {
  const paymentDay = paymentDate.getDate()
  const daysDifference = Math.abs(paymentDay - dueDay)
  
  let optimization = 'optimal'
  let message = `Fecha óptima (día ${paymentDay}, vencimiento día ${dueDay})`
  
  if (daysDifference > 5) {
    optimization = 'suboptimal'
    message = `Fecha subóptima (diferencia de ${daysDifference} días con el vencimiento)`
  } else if (daysDifference > 2) {
    optimization = 'acceptable'
    message = `Fecha aceptable (diferencia de ${daysDifference} días con el vencimiento)`
  }
  
  return {
    optimization,
    message,
    daysDifference,
    isOptimal: optimization === 'optimal'
  }
}
