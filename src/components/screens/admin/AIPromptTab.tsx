import { useState, useEffect } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowClockwise, CheckCircle, FileText } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { DEFAULT_AI_PROMPT } from '@/lib/defaults'

export default function AIPromptTab() {
  const [aiPromptTemplate, setAiPromptTemplate] = useStorage<string>('ai-prompt-template', DEFAULT_AI_PROMPT)
  const [editedPrompt, setEditedPrompt] = useState(aiPromptTemplate || DEFAULT_AI_PROMPT)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    setEditedPrompt(aiPromptTemplate || DEFAULT_AI_PROMPT)
  }, [aiPromptTemplate])

  useEffect(() => {
    setHasChanges(editedPrompt !== (aiPromptTemplate || DEFAULT_AI_PROMPT))
  }, [editedPrompt, aiPromptTemplate])

  const handleSave = () => {
    setAiPromptTemplate(editedPrompt)
    const now = new Date().toLocaleString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    setLastSaved(now)
    setHasChanges(false)
    toast.success('AI Prompt шаблонът е запазен успешно')
  }

  const handleReset = () => {
    if (confirm('Сигурни ли сте, че искате да възстановите шаблона по подразбиране? Всички промени ще бъдат загубени.')) {
      setEditedPrompt(DEFAULT_AI_PROMPT)
      setAiPromptTemplate(DEFAULT_AI_PROMPT)
      setHasChanges(false)
      toast.info('Шаблонът е възстановен по подразбиране')
    }
  }

  const promptStats = {
    lines: editedPrompt.split('\n').length,
    chars: editedPrompt.length,
    words: editedPrompt.split(/\s+/).filter(w => w.length > 0).length
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" weight="duotone" />
                AI Prompt Шаблон
              </CardTitle>
              <CardDescription>
                Редактирайте промпт шаблона, който се използва за AI анализ на ирисовите изображения
              </CardDescription>
            </div>
            {hasChanges && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Незапазени промени
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Редове: {promptStats.lines}</span>
            <span>Символи: {promptStats.chars}</span>
            <span>Думи: {promptStats.words}</span>
          </div>

          {/* Editor */}
          <div className="space-y-2">
            <Textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
              placeholder="Въведете AI prompt шаблон..."
            />
            <p className="text-xs text-muted-foreground">
              Използвайте шаблонни променливи като {`{{age}}`}, {`{{gender}}`}, {`{{side}}`} и др.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {lastSaved && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" weight="fill" />
                  Последно запазване: {lastSaved}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={editedPrompt === DEFAULT_AI_PROMPT}
              >
                <ArrowClockwise className="w-4 h-4 mr-2" />
                Възстанови по подразбиране
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Запази промените
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
