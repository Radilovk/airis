import { useState, useEffect } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Brain, 
  Key, 
  BookOpen, 
  Upload, 
  Trash, 
  CheckCircle,
  Warning,
  FileText,
  ClipboardText,
  ListChecks
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { AIModelConfig, IridologyTextbook } from '@/types'
import { DEFAULT_AI_PROMPT, DEFAULT_IRIDOLOGY_MANUAL } from '@/lib/defaults'

interface AdminScreenProps {
  onBack: () => void
}

export default function AdminScreen({ onBack }: AdminScreenProps) {
  const [aiConfig, setAiConfig] = useStorage<AIModelConfig>('ai-model-config', {
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: '',
    useCustomKey: false
  })
  
  const [textbooks, setTextbooks] = useStorage<IridologyTextbook[]>('iridology-textbooks', [])
  const [iridologyManual, setIridologyManual] = useStorage<string>('iridology-manual', DEFAULT_IRIDOLOGY_MANUAL)
  const [aiPromptTemplate, setAiPromptTemplate] = useStorage<string>('ai-prompt-template', DEFAULT_AI_PROMPT)
  const [loading, setLoading] = useState(false)
  
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'cloudflare'>(aiConfig?.provider || 'openai')
  const [model, setModel] = useState(aiConfig?.model || 'gpt-4o')
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey || '')
  const [useCustomKey, setUseCustomKey] = useState(aiConfig?.useCustomKey || false)
  const [cloudflareAccountId, setCloudflareAccountId] = useState(aiConfig?.cloudflareAccountId || '')
  
  const [textbookName, setTextbookName] = useState('')
  const [textbookContent, setTextbookContent] = useState('')
  
  const [editedManual, setEditedManual] = useState(iridologyManual || DEFAULT_IRIDOLOGY_MANUAL)
  const [editedPrompt, setEditedPrompt] = useState(aiPromptTemplate || DEFAULT_AI_PROMPT)

  // Define model lists as constants
  const openaiModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']
  const geminiModels = ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash']
  const cloudflareModels = ['@cf/meta/llama-3.1-8b-instruct', '@cf/meta/llama-3.1-70b-instruct', '@cf/mistral/mistral-7b-instruct-v0.1']

  const getValidModelsForProvider = (prov: 'openai' | 'gemini' | 'cloudflare'): string[] => {
    if (prov === 'openai') return openaiModels
    if (prov === 'gemini') return geminiModels
    if (prov === 'cloudflare') return cloudflareModels
    return openaiModels
  }

  useEffect(() => {
    if (aiConfig) {
      setProvider(aiConfig.provider)
      setModel(aiConfig.model)
      setApiKey(aiConfig.apiKey)
      setUseCustomKey(aiConfig.useCustomKey)
      setCloudflareAccountId(aiConfig.cloudflareAccountId || '')
    }
  }, [aiConfig])
  
  useEffect(() => {
    setEditedManual(iridologyManual || DEFAULT_IRIDOLOGY_MANUAL)
  }, [iridologyManual])
  
  useEffect(() => {
    setEditedPrompt(aiPromptTemplate || DEFAULT_AI_PROMPT)
  }, [aiPromptTemplate])

  // Update model when provider changes to ensure valid model selection
  useEffect(() => {
    const validModels = getValidModelsForProvider(provider)
    
    // If current model is not valid for the selected provider, set to first valid model
    if (!validModels.includes(model)) {
      setModel(validModels[0])
    }
    
    // Gemini and Cloudflare require custom API keys (GitHub Spark only supports OpenAI)
    if (provider === 'gemini' || provider === 'cloudflare') {
      setUseCustomKey(true)
    }
  }, [provider])

  const handleSaveConfig = async () => {
    // Gemini and Cloudflare require custom API keys
    if ((provider === 'gemini' || provider === 'cloudflare') && !useCustomKey) {
      toast.error(`${provider === 'gemini' ? 'Gemini' : 'Cloudflare'} изисква собствен API ключ. GitHub Spark поддържа само OpenAI модели.`)
      return
    }
    
    if (useCustomKey && !apiKey.trim()) {
      toast.error('Моля, въведете API ключ')
      return
    }

    if (provider === 'cloudflare' && useCustomKey && !cloudflareAccountId.trim()) {
      toast.error('Моля, въведете Cloudflare Account ID')
      return
    }

    // Validate model is compatible with provider
    const validModels = getValidModelsForProvider(provider)
    
    if (!validModels.includes(model)) {
      toast.error(`Моделът "${model}" не е валиден за ${provider}. Моля, изберете валиден модел.`)
      return
    }

    try {
      const config: AIModelConfig = {
        provider,
        model,
        apiKey: useCustomKey ? apiKey : '',
        useCustomKey,
        cloudflareAccountId: provider === 'cloudflare' ? cloudflareAccountId : undefined
      }
      
      await setAiConfig(config)
      toast.success('Конфигурацията е запазена успешно')
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Грешка при запазване на конфигурацията')
    }
  }

  const handleAddTextbook = async () => {
    if (!textbookName.trim() || !textbookContent.trim()) {
      toast.error('Моля, попълнете име и съдържание на учебника')
      return
    }

    try {
      const newTextbook: IridologyTextbook = {
        id: `textbook-${Date.now()}`,
        name: textbookName,
        content: textbookContent,
        uploadDate: new Date().toISOString(),
        fileSize: new Blob([textbookContent]).size
      }

      await setTextbooks((current) => [...(current || []), newTextbook])
      
      setTextbookName('')
      setTextbookContent('')
      toast.success('Учебникът е добавен успешно')
    } catch (error) {
      console.error('Error adding textbook:', error)
      toast.error('Грешка при добавяне на учебника')
    }
  }

  const handleDeleteTextbook = async (id: string) => {
    try {
      await setTextbooks((current) => (current || []).filter(tb => tb.id !== id))
      toast.success('Учебникът е изтрит успешно')
    } catch (error) {
      console.error('Error deleting textbook:', error)
      toast.error('Грешка при изтриване на учебника')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast.error('Моля, качете текстов файл (.txt или .md)')
      return
    }

    try {
      const content = await file.text()
      setTextbookName(file.name.replace(/\.(txt|md)$/, ''))
      setTextbookContent(content)
      toast.success('Файлът е зареден успешно')
    } catch (error) {
      console.error('Error reading file:', error)
      toast.error('Грешка при четене на файла')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
  
  const handleSaveManual = async () => {
    try {
      await setIridologyManual(editedManual)
      toast.success('Иридологичното ръководство е запазено успешно')
    } catch (error) {
      console.error('Error saving manual:', error)
      toast.error('Грешка при запазване на ръководството')
    }
  }
  
  const handleRestoreManual = () => {
    setEditedManual(DEFAULT_IRIDOLOGY_MANUAL)
    toast.info('Ръководството е възстановено към默認ната версия')
  }
  
  const handleSavePrompt = async () => {
    try {
      await setAiPromptTemplate(editedPrompt)
      toast.success('AI Prompt шаблонът е запазен успешно')
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Грешка при запазване на промпта')
    }
  }
  
  const handleRestorePrompt = () => {
    setEditedPrompt(DEFAULT_AI_PROMPT)
    toast.info('Промптът е възстановен към默認ната версия')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Административен панел</h1>
            <p className="text-muted-foreground">
              Управление на AI модели, промптове и иридологично ръководство
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>

        <Tabs defaultValue="ai-model" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
            <TabsTrigger value="ai-model" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Модел</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Ръководство</span>
            </TabsTrigger>
            <TabsTrigger value="prompt" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">AI Prompt</span>
            </TabsTrigger>
            <TabsTrigger value="changelog" className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">Changelog</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Model Configuration Tab */}
          <TabsContent value="ai-model" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Настройки на AI модел
              </CardTitle>
              <CardDescription>
                Изберете AI модел и конфигурирайте API достъп за анализ на ирисите
              </CardDescription>
              {aiConfig && (
                <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    ✓ Активна конфигурация: {aiConfig.useCustomKey ? (
                      <span className="font-mono">{aiConfig.provider} / {aiConfig.model}</span>
                    ) : (
                      <span className="font-mono">GitHub Spark (вграден модел)</span>
                    )}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Доставчик на AI модел</Label>
                  <RadioGroup value={provider} onValueChange={(v) => setProvider(v as 'openai' | 'gemini' | 'cloudflare')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="openai" id="openai" />
                      <Label htmlFor="openai" className="font-normal cursor-pointer">
                        OpenAI (GPT-4o, GPT-4 Turbo)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gemini" id="gemini" />
                      <Label htmlFor="gemini" className="font-normal cursor-pointer">
                        Google Gemini (Gemini 2.0, Gemini 1.5)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cloudflare" id="cloudflare" />
                      <Label htmlFor="cloudflare" className="font-normal cursor-pointer">
                        Cloudflare Workers AI (Llama, Mistral)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Модел</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Изберете модел" />
                    </SelectTrigger>
                    <SelectContent>
                      {provider === 'openai' ? (
                        <>
                          {openaiModels.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </>
                      ) : provider === 'gemini' ? (
                        <>
                          {geminiModels.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </>
                      ) : (
                        <>
                          {cloudflareModels.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="use-custom-key">Използвай собствен API ключ</Label>
                      <p className="text-sm text-muted-foreground">
                        {provider === 'openai' 
                          ? 'Активирайте, за да използвате собствения си API ключ'
                          : '⚠️ Задължително за Gemini и Cloudflare (GitHub Spark поддържа само OpenAI)'}
                      </p>
                    </div>
                    <Switch
                      id="use-custom-key"
                      checked={useCustomKey}
                      onCheckedChange={setUseCustomKey}
                      disabled={provider === 'gemini' || provider === 'cloudflare'}
                    />
                  </div>

                  {!useCustomKey && (
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground">
                        ⚠️ <strong>Използва се GitHub Spark вграден модел</strong><br/>
                        Избраният модел ({model}) ще се използва чрез GitHub Spark.<br/>
                        Анализът ще отнеме по-дълго време (2-3 минути) и може да срещнете rate limit грешки при много заявки. За по-бързо и стабилно изпълнение, използвайте собствен API ключ.
                        <br/><br/>
                        <strong>⚠️ Важно:</strong> GitHub Spark поддържа САМО OpenAI модели. За Gemini или Cloudflare е необходим собствен API ключ.
                      </p>
                    </div>
                  )}

                  {useCustomKey && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="api-key" className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          API ключ
                        </Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder={
                            provider === 'openai' ? 'sk-...' : 
                            provider === 'gemini' ? 'AIza...' :
                            'cloudflare-api-token'
                          }
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          {provider === 'openai' 
                            ? 'Вашият OpenAI API ключ (започва с sk-)'
                            : provider === 'gemini'
                            ? 'Вашият Google AI API ключ'
                            : 'Вашият Cloudflare API Token'
                          }
                        </p>
                      </div>

                      {provider === 'cloudflare' && (
                        <div className="space-y-2">
                          <Label htmlFor="cloudflare-account-id" className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Cloudflare Account ID
                          </Label>
                          <Input
                            id="cloudflare-account-id"
                            type="text"
                            placeholder="32-character account ID"
                            value={cloudflareAccountId}
                            onChange={(e) => setCloudflareAccountId(e.target.value)}
                            className="font-mono"
                          />
                          <p className="text-xs text-muted-foreground">
                            Намерете го в Cloudflare Dashboard → Workers & Pages → Overview
                          </p>
                        </div>
                      )}

                      <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-xs text-accent-foreground">
                          💡 <strong>Предимства на собствен API ключ:</strong>
                        </p>
                        <ul className="text-xs text-accent-foreground/80 mt-2 space-y-1 list-disc list-inside">
                          <li>По-бързо време за анализ (30-60 сек. вместо 90-150 сек.)</li>
                          <li>Без GitHub Spark rate limit ограничения</li>
                          <li>Възможност за избор на различни модели</li>
                          {provider === 'cloudflare' && (
                            <li>Cloudflare Workers AI е безплатен за малък обем заявки</li>
                          )}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button onClick={handleSaveConfig} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Запази настройките
                </Button>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Iridology Manual Tab */}
          <TabsContent value="manual" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Иридологично ръководство
                </CardTitle>
                <CardDescription>
                  Редактирайте иридологичното ръководство, което се използва от AI за анализ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-editor">Съдържание на ръководството</Label>
                  <Textarea
                    id="manual-editor"
                    value={editedManual}
                    onChange={(e) => setEditedManual(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Иридологично ръководство..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Това ръководство се използва от AI при анализ на ирисовите изображения
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSaveManual} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Запази промените
                  </Button>
                  <Button onClick={handleRestoreManual} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Възстанови по подразбиране
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Prompt Template Tab */}
          <TabsContent value="prompt" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  AI Prompt шаблон
                </CardTitle>
                <CardDescription>
                  Редактирайте AI prompt шаблона за персонализиране на анализа
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs text-accent-foreground">
                    💡 <strong>Променливи, които можете да използвате:</strong>
                  </p>
                  <ul className="text-xs text-accent-foreground/80 mt-2 space-y-1 list-disc list-inside">
                    <li>{`{{side}}`} - ляв или десен ирис</li>
                    <li>{`{{age}}, {{gender}}, {{weight}}, {{height}}, {{bmi}}`} - данни за пациента</li>
                    <li>{`{{goals}}, {{complaints}}, {{healthStatus}}`} - здравна информация</li>
                    <li>{`{{imageHash}}`} - уникален идентификатор на изображението</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt-editor">Съдържание на промпта</Label>
                  <Textarea
                    id="prompt-editor"
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="AI Prompt шаблон..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Този промпт определя как AI интерпретира и анализира ирисовите изображения
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSavePrompt} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Запази промените
                  </Button>
                  <Button onClick={handleRestorePrompt} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Възстанови по подразбиране
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Changelog Tab */}
          <TabsContent value="changelog" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-primary" />
                  Лог на промени
                </CardTitle>
                <CardDescription>
                  Преглед на последните промени и функции
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                  <div className="prose prose-sm max-w-none">
                    <h3>📝 Лог на промени от 12 ноември до момента</h3>
                    <p className="text-muted-foreground">Последна актуализация: 19.11.2025 г. | 24 промени</p>
                    
                    <h4 className="flex items-center gap-2 mt-6">✏️ Editor Mode</h4>
                    <ul>
                      <li>Пълна система за редактиране на репорт модулите в реално време</li>
                      <li>Включване/изключване на Editor Mode от админ панела</li>
                      <li>Drag & drop преподреждане на модули</li>
                      <li>Коментиране на всеки контейнер</li>
                      <li>Експорт на коментари в JSON и TXT формат</li>
                    </ul>

                    <h4 className="flex items-center gap-2 mt-6">👁️ Иридологичен Анализ</h4>
                    <ul>
                      <li>Интерактивна визуализация на 12-те иридологични зони</li>
                      <li>Canvas-базиран редактор за прецизно подравняване</li>
                      <li>Оптимизирана AI база знания (намален prompt размер)</li>
                    </ul>

                    <h4 className="flex items-center gap-2 mt-6">📊 Визуализации и Графики</h4>
                    <ul>
                      <li>7 типа интерактивни графики (HealthProgressChart, NutritionChart и др.)</li>
                      <li>Responsive дизайн за всички устройства</li>
                    </ul>

                    <h4 className="flex items-center gap-2 mt-6">⚙️ Административен Панел</h4>
                    <ul>
                      <li>Табова организация за по-добра навигация</li>
                      <li>AI Модел конфигурация</li>
                      <li>Редактируемо иридологично ръководство</li>
                      <li>Редактируем AI Prompt шаблон</li>
                      <li>Управление на въпросника</li>
                      <li>Changelog лог</li>
                    </ul>

                    <h4 className="flex items-center gap-2 mt-6">📄 Репорт Система</h4>
                    <ul>
                      <li>Професионално форматиране с bullet points и икони</li>
                      <li>Accordion компоненти за дълги текстове</li>
                      <li>Пълен превод на български</li>
                    </ul>

                    <h4 className="flex items-center gap-2 mt-6">🔧 Технически Подобрения</h4>
                    <ul>
                      <li>Storage оптимизация и автоматично почистване</li>
                      <li>Подобрено error handling и debugging</li>
                      <li>60-70% намаление на prompt размера</li>
                      <li>Screen transition защита</li>
                    </ul>

                    <h4 className="flex items-center gap-2 mt-6">🩺 Диагностични Инструменти</h4>
                    <ul>
                      <li>QuickDebugPanel за real-time мониторинг</li>
                      <li>Diagnostic Screen за системна диагностика</li>
                      <li>Upload diagnostics система</li>
                    </ul>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
