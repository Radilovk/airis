/**
 * Iridology Knowledge Base
 * Comprehensive knowledge base for iris analysis
 */

export const IRIDOLOGY_ZONES = {
  left: {
    '10:30-1:30': 'Мозък, Психика, Сетива',
    '1:30-3:30': 'Сърце, Ляв дроб (горен дял), Бронхи',
    '3:30-5:00': 'Лява ръка, Гръден кош, Ребра',
    '5:00-7:00': 'Ляв бъбрек, Пикочна система',
    '7:00-9:00': 'Слезка, Панкреас, Стомах',
    '9:00-10:30': 'Лява коремна стена, Яйчник/Тестис',
    'ring': 'Низходящ колон, Сигма, Ректум'
  },
  right: {
    '10:30-1:30': 'Мозък, Психика, Сетива',
    '1:30-3:30': 'Лице, Гърло, Щитовидна жлеза',
    '3:30-5:00': 'Дясна ръка, Гръден кош, Дроб (горен дял)',
    '5:00-7:00': 'Десен бъбрек, Пикочна система',
    '7:00-9:00': 'Черен дроб, Жлъчен мехур',
    '9:00-10:30': 'Дясна коремна стена, Яйчник/Тестис',
    'ring': 'Цекум, Възходящ и Напречен колон'
  }
} as const

export const IRIS_SIGNS = {
  lacuna: {
    name: 'Лакуна',
    description: 'Вдлъбнати области в ириса, показващи слабост в тъканта',
    severity: 'medium' as const
  },
  crypt: {
    name: 'Крипта',
    description: 'Малки тъмни дупки в стромата на ириса',
    severity: 'low' as const
  },
  pigmentation: {
    name: 'Пигментация',
    description: 'Променен цвят в определени зони',
    severity: 'medium' as const
  },
  contraction: {
    name: 'Контракционна бразда',
    description: 'Концентрични кръгове показващи напрежение',
    severity: 'high' as const
  },
  radialFurrow: {
    name: 'Радиални бразди',
    description: 'Линии излизащи от пупила към периферията',
    severity: 'medium' as const
  }
} as const

export const CONSTITUTIONAL_TYPES = {
  lymphatic: {
    name: 'Лимфатична',
    description: 'Светлосин или сив цвят, предразположение към лимфни проблеми',
    characteristics: ['Слаба имунна система', 'Склонност към алергии', 'Лимфна застой']
  },
  hematogenic: {
    name: 'Хематогенна',
    description: 'Тъмнокафяв цвят, предразположение към кръвни проблеми',
    characteristics: ['Проблеми с кръвообращението', 'Склонност към високо кръвно', 'Метаболитни проблеми']
  },
  mixed: {
    name: 'Смесена',
    description: 'Комбинация от светли и тъмни зони',
    characteristics: ['Разнообразни предразположения', 'Изисква индивидуален подход']
  }
} as const

export const SYSTEM_CONNECTIONS = {
  digestive: {
    name: 'Храносмилателна система',
    zones: ['7:00-9:00', 'ring'],
    commonIssues: ['Храносмилателни проблеми', 'Запек', 'Гастрит']
  },
  respiratory: {
    name: 'Дихателна система',
    zones: ['1:30-3:30', '3:30-5:00'],
    commonIssues: ['Астма', 'Бронхит', 'Алергии']
  },
  cardiovascular: {
    name: 'Сърдечно-съдова система',
    zones: ['1:30-3:30'],
    commonIssues: ['Високо кръвно', 'Аритмия', 'Кръвообращение']
  },
  nervous: {
    name: 'Нервна система',
    zones: ['10:30-1:30'],
    commonIssues: ['Стрес', 'Безсъние', 'Тревожност']
  },
  urinary: {
    name: 'Пикочна система',
    zones: ['5:00-7:00'],
    commonIssues: ['Бъбречни проблеми', 'Пикочни инфекции']
  },
  reproductive: {
    name: 'Репродуктивна система',
    zones: ['9:00-10:30'],
    commonIssues: ['Хормонален дисбаланс', 'Менструални проблеми']
  }
} as const

export const INTERPRETATION_GUIDELINES = {
  status: {
    normal: 'Нормално състояние - няма забележими отклонения',
    attention: 'Изисква внимание - леки отклонения или потенциални проблеми',
    concern: 'Загриженост - значителни отклонения, препоръчва се допълнително изследване'
  },
  severity: {
    low: 'Нисък риск - минимални отклонения',
    medium: 'Среден риск - умерени отклонения',
    high: 'Висок риск - значителни отклонения'
  }
} as const

/**
 * Get zone information by angle for a specific side
 */
export function getZoneByAngle(angle: number, side: 'left' | 'right'): string {
  const zones = IRIDOLOGY_ZONES[side]
  
  // Normalize angle to 0-360
  const normalizedAngle = ((angle % 360) + 360) % 360
  
  // Convert clock positions to angles (0° is 3 o'clock, 90° is 12 o'clock)
  if (normalizedAngle >= 75 && normalizedAngle < 135) {
    return zones['10:30-1:30']
  } else if (normalizedAngle >= 135 && normalizedAngle < 195) {
    return zones['1:30-3:30']
  } else if (normalizedAngle >= 195 && normalizedAngle < 240) {
    return zones['3:30-5:00']
  } else if (normalizedAngle >= 240 && normalizedAngle < 300) {
    return zones['5:00-7:00']
  } else if (normalizedAngle >= 300 && normalizedAngle < 345) {
    return zones['7:00-9:00']
  } else {
    return zones['9:00-10:30']
  }
}

/**
 * Analyze iris sign severity based on multiple factors
 */
export function analyzeSignSeverity(
  signType: keyof typeof IRIS_SIGNS,
  size: number,
  depth: number,
  location: string
): 'low' | 'medium' | 'high' {
  const baseSign = IRIS_SIGNS[signType]
  let severityScore = 0
  
  // Size factor (0-1)
  severityScore += size * 0.4
  
  // Depth factor (0-1)
  severityScore += depth * 0.4
  
  // Location factor - critical zones increase severity
  if (location.includes('Мозък') || location.includes('Сърце')) {
    severityScore += 0.2
  }
  
  if (severityScore > 0.7) return 'high'
  if (severityScore > 0.4) return 'medium'
  return 'low'
}

/**
 * Get recommendations based on zone status
 */
export function getZoneRecommendations(
  zone: string,
  status: 'normal' | 'attention' | 'concern'
): string[] {
  const recommendations: string[] = []
  
  if (status === 'normal') return recommendations
  
  // System-specific recommendations
  if (zone.includes('Храносмилателна') || zone.includes('Стомах') || zone.includes('колон')) {
    recommendations.push('Включете пробиотици в диетата')
    recommendations.push('Увеличете приема на фибри')
    recommendations.push('Избягвайте преработени храни')
  }
  
  if (zone.includes('Дихателна') || zone.includes('Дроб') || zone.includes('Бронхи')) {
    recommendations.push('Практикувайте дълбоко дишане')
    recommendations.push('Избягвайте алергени')
    recommendations.push('Разгледайте добавки с витамин C')
  }
  
  if (zone.includes('Сърце') || zone.includes('Кръв')) {
    recommendations.push('Редовна физическа активност')
    recommendations.push('Намалете прием на сол')
    recommendations.push('Omega-3 мастни киселини')
  }
  
  if (zone.includes('Бъбрек') || zone.includes('Пикочна')) {
    recommendations.push('Пийте достатъчно вода')
    recommendations.push('Намалете протеини от животински произход')
    recommendations.push('Избягвайте прекомерна сол')
  }
  
  if (zone.includes('Нервна') || zone.includes('Мозък') || zone.includes('Психика')) {
    recommendations.push('Управление на стреса')
    recommendations.push('Достатъчен сън')
    recommendations.push('Магнезий и витамини от група B')
  }
  
  return recommendations
}
