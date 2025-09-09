// Detector de tipo de tarjeta basado en los primeros dígitos
export const CARD_TYPES = {
  VISA: {
    name: 'Visa',
    pattern: /^4/,
    lengths: [13, 16, 19],
    color: '#1A1F71'
  },
  MASTERCARD: {
    name: 'Mastercard',
    pattern: /^5[1-5]|^2[2-7]/,
    lengths: [16],
    color: '#EB001B'
  },
  AMERICAN_EXPRESS: {
    name: 'American Express',
    pattern: /^3[47]/,
    lengths: [15],
    color: '#006FCF'
  },
  DISCOVER: {
    name: 'Discover',
    pattern: /^6(?:011|5)/,
    lengths: [16],
    color: '#FF6000'
  },
  DINERS_CLUB: {
    name: 'Diners Club',
    pattern: /^3[0689]/,
    lengths: [14],
    color: '#0079BE'
  },
  JCB: {
    name: 'JCB',
    pattern: /^35/,
    lengths: [15, 16],
    color: '#003B7C'
  }
}

export const detectCardType = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return null
  }
  
  // Limpiar espacios y guiones
  const cleanNumber = cardNumber.replace(/[\s-]/g, '')
  
  // Buscar coincidencia con patrones
  for (const [type, config] of Object.entries(CARD_TYPES)) {
    if (config.pattern.test(cleanNumber)) {
      return {
        type,
        name: config.name,
        color: config.color,
        isValidLength: config.lengths.includes(cleanNumber.length)
      }
    }
  }
  
  return null
}

export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return ''
  
  // Limpiar y mantener solo dígitos
  const cleanNumber = cardNumber.replace(/\D/g, '')
  
  // Formatear según el tipo detectado
  const cardType = detectCardType(cleanNumber)
  
  if (cardType?.type === 'AMERICAN_EXPRESS') {
    // Amex: XXXX XXXXXX XXXXX
    return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
  } else {
    // Visa, Mastercard, etc: XXXX XXXX XXXX XXXX
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
  }
}

export const maskCardNumber = (cardNumber, visibleDigits = 4) => {
  if (!cardNumber) return ''
  
  const cleanNumber = cardNumber.replace(/\D/g, '')
  if (cleanNumber.length <= visibleDigits) return cleanNumber
  
  const masked = '*'.repeat(cleanNumber.length - visibleDigits)
  const lastDigits = cleanNumber.slice(-visibleDigits)
  
  return `${masked}${lastDigits}`
}

export const validateCardNumber = (cardNumber) => {
  if (!cardNumber) return { isValid: false, error: 'Número de tarjeta requerido' }
  
  const cleanNumber = cardNumber.replace(/\D/g, '')
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return { isValid: false, error: 'Número de tarjeta inválido' }
  }
  
  const cardType = detectCardType(cleanNumber)
  if (!cardType) {
    return { isValid: false, error: 'Tipo de tarjeta no reconocido' }
  }
  
  if (!cardType.isValidLength) {
    return { isValid: false, error: `Longitud inválida para ${cardType.name}` }
  }
  
  // Algoritmo de Luhn
  let sum = 0
  let isEven = false
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  const isValid = sum % 10 === 0
  
  return {
    isValid,
    error: isValid ? null : 'Número de tarjeta inválido',
    cardType: isValid ? cardType : null
  }
}
