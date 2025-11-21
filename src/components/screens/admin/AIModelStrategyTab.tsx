import { useState, useEffect } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Brain, Plus, Trash, Star, FloppyDisk, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AIModelStrategy } from '@/types'

export default function AIModelStrategyTab() {
  const [strategies, setStrategies] = useStorage<AIModelStrategy[]>('ai-model-strategies', [])
  const [editingStrategy, setEditingStrategy] = useState<AIModelStrategy | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<AIModelStrategy>>({
    name: '',
    description: '',
    provider: 'cloudflare',
    model: '@cf/meta/llama-3.1-8b-instruct',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
    isDefault: false
  })

  const providers = [
    { value: 'cloudflare', label: 'Cloudflare Workers AI' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Google Gemini' }
  ] as const

  const modelsByProvider = {
    cloudflare: [
      '@cf/meta/llama-3.1-8b-instruct',
      '@cf/meta/llama-3.1-70b-instruct',
      '@cf/mistral/mistral-7b-instruct-v0.1'
    ],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    gemini: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash']
  }

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      name: '',
      description: '',
      provider: 'cloudflare',
      model: '@cf/meta/llama-3.1-8b-instruct',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      systemPrompt: '',
      isDefault: false
    })
  }

  const handleEdit = (strategy: AIModelStrategy) => {
    setEditingStrategy(strategy)
    setFormData(strategy)
  }

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.provider || !formData.model) {
      toast.error('Моля попълнете всички задължителни полета')
      return
    }

    const newStrategy: AIModelStrategy = {
      id: editingStrategy?.id || `strategy-${Date.now()}`,
      name: formData.name!,
      description: formData.description!,
      provider: formData.provider!,
      model: formData.model!,
      temperature: formData.temperature!,
      maxTokens: formData.maxTokens!,
      topP: formData.topP!,
      frequencyPenalty: formData.frequencyPenalty!,
      presencePenalty: formData.presencePenalty!,
      systemPrompt: formData.systemPrompt,
      isDefault: formData.isDefault
    }

    if (editingStrategy) {
      // Update existing
      setStrategies(strategies.map(s => s.id === editingStrategy.id ? newStrategy : s))
      toast.success('Стратегията е обновена успешно')
    } else {
      // Create new
      setStrategies([...strategies, newStrategy])
      toast.success('Новата стратегия е създадена успешно')
    }

    handleCancel()
  }

  const handleCancel = () => {
    setEditingStrategy(null)
    setIsCreating(false)
    setFormData({
      name: '',
      description: '',
      provider: 'cloudflare',
      model: '@cf/meta/llama-3.1-8b-instruct',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      systemPrompt: '',
      isDefault: false
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете тази стратегия?')) {
      setStrategies(strategies.filter(s => s.id !== id))
      toast.success('Стратегията е изтрита успешно')
    }
  }

  const handleSetDefault = (id: string) => {
    setStrategies(strategies.map(s => ({ ...s, isDefault: s.id === id })))
    toast.success('Стратегията по подразбиране е променена')
  }

  const isEditing = editingStrategy !== null || isCreating

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Модел Стратегии
              </CardTitle>
              <CardDescription>
                Конфигурирайте различни AI стратегии за различни сценарии
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Нова Стратегия
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Име на стратегията *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="напр. Бърз анализ"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provider">Доставчик *</Label>
                      <Select
                        value={formData.provider}
                        onValueChange={(value) => {
                          const provider = value as AIModelStrategy['provider']
                          setFormData({
                            ...formData,
                            provider,
                            model: modelsByProvider[provider][0]
                          })
                        }}
                      >
                        <SelectTrigger id="provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Опишете за какво се използва тази стратегия"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Модел *</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(value) => setFormData({ ...formData, model: value })}
                    >
                      <SelectTrigger id="model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modelsByProvider[formData.provider as keyof typeof modelsByProvider].map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">
                        Temperature: {formData.temperature?.toFixed(2)}
                      </Label>
                      <Slider
                        id="temperature"
                        min={0}
                        max={2}
                        step={0.1}
                        value={[formData.temperature || 0.7]}
                        onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Max Tokens: {formData.maxTokens}</Label>
                      <Slider
                        id="maxTokens"
                        min={256}
                        max={4096}
                        step={256}
                        value={[formData.maxTokens || 2048]}
                        onValueChange={([value]) => setFormData({ ...formData, maxTokens: value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topP">Top P: {formData.topP?.toFixed(2)}</Label>
                      <Slider
                        id="topP"
                        min={0}
                        max={1}
                        step={0.05}
                        value={[formData.topP || 0.9]}
                        onValueChange={([value]) => setFormData({ ...formData, topP: value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequencyPenalty">
                        Frequency Penalty: {formData.frequencyPenalty?.toFixed(2)}
                      </Label>
                      <Slider
                        id="frequencyPenalty"
                        min={0}
                        max={2}
                        step={0.1}
                        value={[formData.frequencyPenalty || 0]}
                        onValueChange={([value]) => setFormData({ ...formData, frequencyPenalty: value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="presencePenalty">
                        Presence Penalty: {formData.presencePenalty?.toFixed(2)}
                      </Label>
                      <Slider
                        id="presencePenalty"
                        min={0}
                        max={2}
                        step={0.1}
                        value={[formData.presencePenalty || 0]}
                        onValueChange={([value]) => setFormData({ ...formData, presencePenalty: value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">Системен Prompt (опционален)</Label>
                    <Textarea
                      id="systemPrompt"
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      placeholder="Персонализиран системен prompt за тази стратегия"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">
                      Задай като стратегия по подразбиране
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Откажи
                    </Button>
                    <Button onClick={handleSave}>
                      <FloppyDisk className="w-4 h-4 mr-2" />
                      Запази
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {strategies.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Няма дефинирани стратегии. Създайте първата си AI стратегия.</p>
                  </div>
                ) : (
                  strategies.map((strategy) => (
                    <Card key={strategy.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{strategy.name}</CardTitle>
                              {strategy.isDefault && (
                                <Badge variant="default" className="flex items-center gap-1">
                                  <Star className="w-3 h-3" weight="fill" />
                                  По подразбиране
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mt-1">
                              {strategy.description}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {!strategy.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(strategy.id)}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(strategy)}
                            >
                              Редактирай
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(strategy.id)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Доставчик</div>
                            <div className="font-medium">{strategy.provider}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Модел</div>
                            <div className="font-medium font-mono text-xs">{strategy.model}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Temperature</div>
                            <div className="font-medium">{strategy.temperature.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Max Tokens</div>
                            <div className="font-medium">{strategy.maxTokens}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
