export interface QuestionnaireData {
  age: number
  gender: 'male' | 'female' | 'other'
  weight: number
  height: number
  goals: string[]
  complaints: string
}

export interface IrisImage {
  dataUrl: string
  side: 'left' | 'right'
}

export interface IrisZone {
  id: number
  name: string
  organ: string
  status: 'normal' | 'attention' | 'concern'
  findings: string
  angle: [number, number]
}

export interface IrisAnalysis {
  side: 'left' | 'right'
  zones: IrisZone[]
  artifacts: Artifact[]
  overallHealth: number
  systemScores: SystemScore[]
}

export interface Artifact {
  type: string
  location: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface SystemScore {
  system: string
  score: number
  description: string
}

export interface Recommendation {
  category: 'diet' | 'supplement' | 'lifestyle'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  completed?: boolean
}

export interface NutritionData {
  recommended: string[]
  avoid: string[]
}

export interface TimelinePhase {
  phase: number
  title: string
  duration: string
  actions: string[]
}

export interface AnalysisReport {
  timestamp: string
  questionnaireData: QuestionnaireData
  leftIris: IrisAnalysis
  rightIris: IrisAnalysis
  recommendations: Recommendation[]
  summary: string
  nutritionData?: NutritionData
  timeline?: TimelinePhase[]
}

export interface AIModelConfig {
  provider: 'openai' | 'gemini' | 'cloudflare'
  model: string
  apiKey: string
  useCustomKey: boolean
  cloudflareAccountId?: string // For Cloudflare Workers AI
}

export interface IridologyTextbook {
  id: string
  name: string
  content: string
  uploadDate: string
  fileSize: number
}

// PRIORITY 4: Enhanced Types for airis1.0 improvements

export interface AIPromptTemplate {
  id: string
  name: string
  content: string
  version: number
  createdAt: string
  updatedAt: string
  isDefault?: boolean
}

export interface IridologyManual {
  id: string
  content: string
  version: number
  createdAt: string
  updatedAt: string
  stats: {
    lines: number
    chars: number
    words: number
  }
}

export interface ReportModuleComment {
  id: string
  moduleId: string
  containerId: string
  text: string
  createdAt: string
  updatedAt?: string
  author?: string
}

export interface ReportModule {
  id: string
  type: 'text' | 'chart' | 'table' | 'image' | 'custom'
  title: string
  content: any
  order: number
  visible: boolean
  editable: boolean
  comments?: ReportModuleComment[]
}

export interface ReportContainer {
  id: string
  name: string
  modules: ReportModule[]
  order: number
  collapsed: boolean
  visible: boolean
  comments?: ReportModuleComment[]
}

export interface EditorModeConfig {
  enabled: boolean
  allowReordering: boolean
  allowComments: boolean
  allowHiding: boolean
  allowEditing: boolean
  showMetadata: boolean
}

export interface AIModelStrategy {
  id: string
  name: string
  description: string
  provider: 'openai' | 'gemini' | 'cloudflare'
  model: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  systemPrompt?: string
  isDefault?: boolean
}
