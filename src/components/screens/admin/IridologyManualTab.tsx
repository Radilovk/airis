import { useState, useEffect } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowClockwise, CheckCircle, BookOpen, ClockCounterClockwise } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { DEFAULT_IRIDOLOGY_MANUAL } from '@/lib/defaults'

interface ManualVersion {
  timestamp: string
  content: string
  stats: {
    lines: number
    chars: number
    words: number
  }
}

export default function IridologyManualTab() {
  const [iridologyManual, setIridologyManual] = useStorage<string>('iridology-manual', DEFAULT_IRIDOLOGY_MANUAL)
  const [manualVersions, setManualVersions] = useStorage<ManualVersion[]>('iridology-manual-versions', [])
  const [editedManual, setEditedManual] = useState(iridologyManual || DEFAULT_IRIDOLOGY_MANUAL)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [showVersions, setShowVersions] = useState(false)

  useEffect(() => {
    setEditedManual(iridologyManual || DEFAULT_IRIDOLOGY_MANUAL)
  }, [iridologyManual])

  useEffect(() => {
    setHasChanges(editedManual !== (iridologyManual || DEFAULT_IRIDOLOGY_MANUAL))
  }, [editedManual, iridologyManual])

  const calculateStats = (text: string) => ({
    lines: text.split('\n').length,
    chars: text.length,
    words: text.split(/\s+/).filter(w => w.length > 0).length
  })

  const handleSave = () => {
    // Save current version to history
    const newVersion: ManualVersion = {
      timestamp: new Date().toISOString(),
      content: editedManual,
      stats: calculateStats(editedManual)
    }
    
    const updatedVersions = [newVersion, ...manualVersions].slice(0, 10) // Keep last 10 versions
    setManualVersions(updatedVersions)
    
    setIridologyManual(editedManual)
    const now = new Date().toLocaleString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    setLastSaved(now)
    setHasChanges(false)
    toast.success('Иридологичното ръководство е запазено успешно')
  }

  const handleReset = () => {
    if (confirm('Сигурни ли сте, че искате да възстановите ръководството по подразбиране? Всички промени ще бъдат загубени.')) {
      setEditedManual(DEFAULT_IRIDOLOGY_MANUAL)
      setIridologyManual(DEFAULT_IRIDOLOGY_MANUAL)
      setHasChanges(false)
      toast.info('Ръководството е възстановено по подразбиране')
    }
  }

  const handleRestoreVersion = (version: ManualVersion) => {
    if (confirm('Искате ли да възстановите тази версия?')) {
      setEditedManual(version.content)
      setHasChanges(true)
      toast.info('Версията е възстановена. Не забравяйте да запазите промените.')
    }
  }

  const manualStats = calculateStats(editedManual)

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
                <BookOpen className="w-5 h-5" weight="duotone" />
                Иридологично Ръководство
              </CardTitle>
              <CardDescription>
                Редактирайте иридологичното ръководство, което се използва като база знания за AI анализа
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                  Незапазени промени
                </Badge>
              )}
              {manualVersions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersions(!showVersions)}
                >
                  <ClockCounterClockwise className="w-4 h-4 mr-2" />
                  Версии ({manualVersions.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Редове: {manualStats.lines}</span>
            <span>Символи: {manualStats.chars}</span>
            <span>Думи: {manualStats.words}</span>
          </div>

          {/* Version History */}
          {showVersions && manualVersions.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">История на версиите</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {manualVersions.map((version, index) => (
                    <div
                      key={version.timestamp}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Версия {manualVersions.length - index}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(version.timestamp).toLocaleString('bg-BG')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {version.stats.lines} реда, {version.stats.words} думи
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreVersion(version)}
                      >
                        Възстанови
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Editor */}
          <div className="space-y-2">
            <Textarea
              value={editedManual}
              onChange={(e) => setEditedManual(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
              placeholder="Въведете иридологично ръководство..."
            />
            <p className="text-xs text-muted-foreground">
              Markdown форматиране се поддържа. Ръководството се използва като контекст за AI анализа.
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
                disabled={editedManual === DEFAULT_IRIDOLOGY_MANUAL}
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
