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
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Brain, 
  Key, 
  BookOpen, 
  Upload, 
  Trash, 
  CheckCircle,
  Warning
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { AIModelConfig, IridologyTextbook } from '@/types'

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
  const [loading, setLoading] = useState(false)
  
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'cloudflare'>(aiConfig?.provider || 'openai')
  const [model, setModel] = useState(aiConfig?.model || 'gpt-4o')
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey || '')
  const [useCustomKey, setUseCustomKey] = useState(aiConfig?.useCustomKey || false)
  const [cloudflareAccountId, setCloudflareAccountId] = useState(aiConfig?.cloudflareAccountId || '')
  
  const [textbookName, setTextbookName] = useState('')
  const [textbookContent, setTextbookContent] = useState('')

  useEffect(() => {
    if (aiConfig) {
      setProvider(aiConfig.provider)
      setModel(aiConfig.model)
      setApiKey(aiConfig.apiKey)
      setUseCustomKey(aiConfig.useCustomKey)
      setCloudflareAccountId(aiConfig.cloudflareAccountId || '')
    }
  }, [aiConfig])

  const handleSaveConfig = async () => {
    if (useCustomKey && !apiKey.trim()) {
      toast.error('Моля, въведете API ключ')
      return
    }

    if (provider === 'cloudflare' && useCustomKey && !cloudflareAccountId.trim()) {
      toast.error('Моля, въведете Cloudflare Account ID')
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

  const openaiModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']
  const geminiModels = ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash']
  const cloudflareModels = ['@cf/meta/llama-3.1-8b-instruct', '@cf/meta/llama-3.1-70b-instruct', '@cf/mistral/mistral-7b-instruct-v0.1']

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Административен панел</h1>
            <p className="text-muted-foreground">
              Управление на AI модели и учебници по иридология
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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
                        Активирайте, за да използвате собствения си API ключ
                      </p>
                    </div>
                    <Switch
                      id="use-custom-key"
                      checked={useCustomKey}
                      onCheckedChange={setUseCustomKey}
                    />
                  </div>

                  {!useCustomKey && (
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground">
                        ⚠️ <strong>Използва се GitHub Spark вграден модел</strong><br/>
                        Избраният модел ({model}) ще се използва чрез GitHub Spark.<br/>
                        Анализът ще отнеме по-дълго време (2-3 минути) и може да срещнете rate limit грешки при много заявки. За по-бързо и стабилно изпълнение, използвайте собствен API ключ.
                        <br/><br/>
                        <strong>⚠️ Важно:</strong> Приложението е конфигурирано за автономна работа. Ако GitHub Spark не е наличен, анализът няма да работи. Моля, конфигурирайте собствен API ключ.
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Учебници по иридология
              </CardTitle>
              <CardDescription>
                Качете учебници и референтни материали за подобряване на анализа
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="textbook-file" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Качи файл (опционално)
                  </Label>
                  <Input
                    id="textbook-file"
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-muted-foreground">
                    Поддържани формати: .txt, .md
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textbook-name">Име на учебника</Label>
                  <Input
                    id="textbook-name"
                    placeholder="напр. Основи на иридологията - Д-р Иванов"
                    value={textbookName}
                    onChange={(e) => setTextbookName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textbook-content">Съдържание</Label>
                  <Textarea
                    id="textbook-content"
                    placeholder="Въведете или поставете текста от учебника..."
                    value={textbookContent}
                    onChange={(e) => setTextbookContent(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Този текст ще бъде използван като контекст при AI анализа
                  </p>
                </div>

                <Button onClick={handleAddTextbook} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Добави учебник
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Налични учебници ({textbooks?.length || 0})</Label>
                </div>

                {textbooks && textbooks.length > 0 ? (
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-3">
                      {textbooks.map((textbook) => (
                        <motion.div
                          key={textbook.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{textbook.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">
                                {formatFileSize(textbook.fileSize)}
                              </Badge>
                              <span>•</span>
                              <span>
                                {new Date(textbook.uploadDate).toLocaleDateString('bg-BG')}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTextbook(textbook.id)}
                          >
                            <Trash className="w-4 h-4 text-destructive" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Все още няма качени учебници
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
