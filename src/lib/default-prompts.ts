/**
 * Default AI Prompt Templates
 * Adapted for Cloudflare Workers AI
 */

export const DEFAULT_SYSTEM_PROMPT = `Ти си професионален иридолог и системен анализатор с над 20 години опит.`

export const DEFAULT_ANALYSIS_PROMPT = `
Анализирай {{side}} ирис, като следваш стриктно стъпките и структурата по-долу.

ПРОФИЛ НА ПАЦИЕНТА:
- Възраст: {{age}} години
- Пол: {{gender}}
- BMI: {{bmi}}
- Оплаквания: {{complaints}}

Използвай съответната топографска карта за {{side}} ирис.
`

export const DEFAULT_SUMMARY_PROMPT = `
Обобщи анализа на ириса в кратък, разбираем формат.
Фокусирай се върху:
1. Основни находки
2. Приоритетни препоръки
3. Необходими действия
`

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  variables: string[]
  category: 'analysis' | 'summary' | 'recommendations' | 'system'
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'default-analysis',
    name: 'Стандартен анализ',
    description: 'Основен шаблон за анализ на ирис',
    template: DEFAULT_ANALYSIS_PROMPT,
    variables: ['side', 'age', 'gender', 'bmi', 'complaints'],
    category: 'analysis'
  },
  {
    id: 'detailed-analysis',
    name: 'Детайлен анализ',
    description: 'Разширен анализ с всички параметри',
    template: `
Извърши детайлен анализ на {{side}} ирис.

ПЪЛЕН ПРОФИЛ:
- Възраст: {{age}} години
- Пол: {{gender}}
- Тегло: {{weight}} кг, Ръст: {{height}} см
- BMI: {{bmi}}
- Цели: {{goals}}
- Оплаквания: {{complaints}}
- Хранителни навици: {{dietaryHabits}}
- Ниво на стрес: {{stressLevel}}
- Сън: {{sleepHours}} часа ({{sleepQuality}})
- Физическа активност: {{activityLevel}}
- Медикаменти: {{medications}}
- Алергии: {{allergies}}

Анализирай всяка зона и предостави конкретни препоръки.
    `,
    variables: ['side', 'age', 'gender', 'weight', 'height', 'bmi', 'goals', 'complaints', 'dietaryHabits', 'stressLevel', 'sleepHours', 'sleepQuality', 'activityLevel', 'medications', 'allergies'],
    category: 'analysis'
  },
  {
    id: 'quick-summary',
    name: 'Бърз преглед',
    description: 'Кратко резюме на находките',
    template: DEFAULT_SUMMARY_PROMPT,
    variables: [],
    category: 'summary'
  },
  {
    id: 'recommendation-focus',
    name: 'Фокус върху препоръки',
    description: 'Шаблон фокусиран върху практически препоръки',
    template: `
Базирайки се на анализа на {{side}} ирис, предостави:

1. ТОП 5 ПРЕПОРЪКИ ЗА ХРАНА
2. ТОП 5 ДОБАВКИ
3. ТОП 3 ПРОМЕНИ В НАЧИНА НА ЖИВОТ

Приоритизирай препоръките според тежестта на находките.
    `,
    variables: ['side'],
    category: 'recommendations'
  }
]

/**
 * Replace template variables with actual values
 */
export function fillTemplate(template: string, variables: Record<string, any>): string {
  let result = template
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, String(value))
  }
  
  return result
}

/**
 * Extract variable names from template
 */
export function extractVariables(template: string): string[] {
  const regex = /{{(\w+)}}/g
  const matches = [...template.matchAll(regex)]
  return matches.map(match => match[1])
}

/**
 * Validate that all required variables are provided
 */
export function validateTemplate(template: string, variables: Record<string, any>): {
  valid: boolean
  missing: string[]
} {
  const required = extractVariables(template)
  const provided = Object.keys(variables)
  const missing = required.filter(v => !provided.includes(v))
  
  return {
    valid: missing.length === 0,
    missing
  }
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(t => t.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(t => t.category === category)
}

/**
 * Create a custom template
 */
export function createCustomTemplate(
  name: string,
  description: string,
  template: string,
  category: PromptTemplate['category']
): PromptTemplate {
  return {
    id: `custom-${Date.now()}`,
    name,
    description,
    template,
    variables: extractVariables(template),
    category
  }
}
