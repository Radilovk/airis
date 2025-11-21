import { useState } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Download, FileArrowDown, Database, Gear, FileText } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { calculateBMI } from '@/lib/utils'

export default function ProjectExportTab() {
  const [reports] = useStorage<any[]>('analysis-reports', [])
  const [aiConfig] = useStorage<any>('ai-model-config', null)
  const [aiPrompt] = useStorage<string>('ai-prompt-template', '')
  const [iridologyManual] = useStorage<string>('iridology-manual', '')
  const [strategies] = useStorage<any[]>('ai-model-strategies', [])
  const [editorConfig] = useStorage<any>('editor-mode-config', null)

  const [exportOptions, setExportOptions] = useState({
    reports: true,
    aiConfig: true,
    aiPrompt: true,
    iridologyManual: true,
    strategies: true,
    editorConfig: true,
    metadata: true
  })

  const exportData = {
    reports: {
      label: 'Репорти от анализи',
      icon: FileText,
      count: reports.length,
      size: JSON.stringify(reports).length
    },
    aiConfig: {
      label: 'AI Конфигурация',
      icon: Gear,
      count: aiConfig ? 1 : 0,
      size: JSON.stringify(aiConfig).length
    },
    aiPrompt: {
      label: 'AI Prompt шаблон',
      icon: FileText,
      count: aiPrompt ? 1 : 0,
      size: aiPrompt.length
    },
    iridologyManual: {
      label: 'Иридологично ръководство',
      icon: FileText,
      count: iridologyManual ? 1 : 0,
      size: iridologyManual.length
    },
    strategies: {
      label: 'AI Стратегии',
      icon: Database,
      count: strategies.length,
      size: JSON.stringify(strategies).length
    },
    editorConfig: {
      label: 'Editor Mode настройки',
      icon: Gear,
      count: editorConfig ? 1 : 0,
      size: JSON.stringify(editorConfig).length
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
  }

  const handleExportJSON = () => {
    const exportPackage: any = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      application: 'AIRIS - AI Iris Analysis System'
    }

    if (exportOptions.reports) exportPackage.reports = reports
    if (exportOptions.aiConfig) exportPackage.aiConfig = aiConfig
    if (exportOptions.aiPrompt) exportPackage.aiPrompt = aiPrompt
    if (exportOptions.iridologyManual) exportPackage.iridologyManual = iridologyManual
    if (exportOptions.strategies) exportPackage.strategies = strategies
    if (exportOptions.editorConfig) exportPackage.editorConfig = editorConfig

    if (exportOptions.metadata) {
      exportPackage.metadata = {
        totalReports: reports.length,
        totalStrategies: strategies.length,
        exportedBy: 'admin',
        systemVersion: '16.0'
      }
    }

    const json = JSON.stringify(exportPackage, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `airis-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Експортът е завършен успешно')
  }

  const handleExportCSV = () => {
    if (!exportOptions.reports || reports.length === 0) {
      toast.error('Няма репорти за експорт')
      return
    }

    // CSV headers
    const headers = ['Дата', 'Възраст', 'Пол', 'BMI', 'Оплаквания', 'Обща здравност']
    let csv = headers.join(',') + '\n'

    // CSV rows
    reports.forEach(report => {
      const bmi = report.questionnaireData?.weight && report.questionnaireData?.height
        ? calculateBMI(report.questionnaireData.weight, report.questionnaireData.height)
        : 'N/A'
      
      const row = [
        new Date(report.timestamp).toLocaleDateString('bg-BG'),
        report.questionnaireData?.age || 'N/A',
        report.questionnaireData?.gender || 'N/A',
        bmi,
        `"${report.questionnaireData?.complaints?.substring(0, 50) || 'N/A'}"`,
        report.leftIris?.overallHealth || report.rightIris?.overallHealth || 'N/A'
      ]
      csv += row.join(',') + '\n'
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `airis-reports-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('CSV експортът е завършен успешно')
  }

  const handleExportTXT = () => {
    let text = '═══════════════════════════════════════════════════════\n'
    text += '         AIRIS - Експорт на конфигурация\n'
    text += '═══════════════════════════════════════════════════════\n\n'
    text += `Дата на експорт: ${new Date().toLocaleString('bg-BG')}\n\n`

    if (exportOptions.aiConfig && aiConfig) {
      text += '───────────────────────────────────────────────────────\n'
      text += 'AI КОНФИГУРАЦИЯ\n'
      text += '───────────────────────────────────────────────────────\n'
      text += `Доставчик: ${aiConfig.provider}\n`
      text += `Модел: ${aiConfig.model}\n`
      text += `Персонален API ключ: ${aiConfig.useCustomKey ? 'Да' : 'Не'}\n\n`
    }

    if (exportOptions.strategies && strategies.length > 0) {
      text += '───────────────────────────────────────────────────────\n'
      text += 'AI СТРАТЕГИИ\n'
      text += '───────────────────────────────────────────────────────\n'
      strategies.forEach((strategy, index) => {
        text += `\n${index + 1}. ${strategy.name}\n`
        text += `   Описание: ${strategy.description}\n`
        text += `   Доставчик: ${strategy.provider}\n`
        text += `   Модел: ${strategy.model}\n`
        text += `   Temperature: ${strategy.temperature}\n`
        text += `   Max Tokens: ${strategy.maxTokens}\n`
        if (strategy.isDefault) text += `   По подразбиране: Да\n`
      })
      text += '\n'
    }

    if (exportOptions.editorConfig && editorConfig) {
      text += '───────────────────────────────────────────────────────\n'
      text += 'EDITOR MODE НАСТРОЙКИ\n'
      text += '───────────────────────────────────────────────────────\n'
      text += `Активиран: ${editorConfig.enabled ? 'Да' : 'Не'}\n`
      text += `Разрешено пренареждане: ${editorConfig.allowReordering ? 'Да' : 'Не'}\n`
      text += `Разрешени коментари: ${editorConfig.allowComments ? 'Да' : 'Не'}\n`
      text += `Разрешено скриване: ${editorConfig.allowHiding ? 'Да' : 'Не'}\n`
      text += `Разрешено редактиране: ${editorConfig.allowEditing ? 'Да' : 'Не'}\n`
      text += `Показване на метаданни: ${editorConfig.showMetadata ? 'Да' : 'Не'}\n\n`
    }

    if (exportOptions.reports) {
      text += '───────────────────────────────────────────────────────\n'
      text += 'СТАТИСТИКА НА РЕПОРТИ\n'
      text += '───────────────────────────────────────────────────────\n'
      text += `Общо репорти: ${reports.length}\n`
      if (reports.length > 0) {
        text += `Първи репорт: ${new Date(reports[reports.length - 1].timestamp).toLocaleDateString('bg-BG')}\n`
        text += `Последен репорт: ${new Date(reports[0].timestamp).toLocaleDateString('bg-BG')}\n`
      }
      text += '\n'
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `airis-config-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('TXT експортът е завършен успешно')
  }

  const totalSize = Object.entries(exportOptions)
    .filter(([key, enabled]) => enabled && key !== 'metadata')
    .reduce((sum, [key]) => {
      return sum + (exportData[key as keyof typeof exportData]?.size || 0)
    }, 0)

  const selectedCount = Object.values(exportOptions).filter(Boolean).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Експорт на проекта
          </CardTitle>
          <CardDescription>
            Експортирайте данни, конфигурация и репорти в различни формати
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Изберете данни за експорт
            </h3>

            <div className="space-y-3">
              {Object.entries(exportData).map(([key, data]) => {
                const Icon = data.icon
                return (
                  <Card key={key}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            id={key}
                            checked={exportOptions[key as keyof typeof exportOptions]}
                            onCheckedChange={(checked) =>
                              setExportOptions({
                                ...exportOptions,
                                [key]: checked as boolean
                              })
                            }
                          />
                          <Label htmlFor={key} className="cursor-pointer flex items-center gap-2 flex-1">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="font-medium">{data.label}</span>
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{data.count} елемента</Badge>
                          <Badge variant="secondary">{formatBytes(data.size)}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="metadata"
                      checked={exportOptions.metadata}
                      onCheckedChange={(checked) =>
                        setExportOptions({ ...exportOptions, metadata: checked as boolean })
                      }
                    />
                    <Label htmlFor="metadata" className="cursor-pointer flex items-center gap-2">
                      <FileArrowDown className="w-4 h-4 text-primary" />
                      <span className="font-medium">Включи метаданни</span>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Export Summary */}
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <h3 className="font-semibold mb-3">Обобщение на експорта</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Избрани елементи</div>
                <div className="font-semibold">{selectedCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Общ размер</div>
                <div className="font-semibold">{formatBytes(totalSize)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Репорти</div>
                <div className="font-semibold">{exportOptions.reports ? reports.length : 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Стратегии</div>
                <div className="font-semibold">{exportOptions.strategies ? strategies.length : 0}</div>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Изберете формат
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleExportJSON}
                  className="w-full h-auto py-4 flex-col gap-2"
                  disabled={selectedCount === 0}
                >
                  <FileArrowDown className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">JSON</div>
                    <div className="text-xs opacity-80">Пълен експорт на данни</div>
                  </div>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleExportCSV}
                  className="w-full h-auto py-4 flex-col gap-2"
                  variant="secondary"
                  disabled={!exportOptions.reports || reports.length === 0}
                >
                  <FileArrowDown className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">CSV</div>
                    <div className="text-xs opacity-80">Табличен формат за репорти</div>
                  </div>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleExportTXT}
                  className="w-full h-auto py-4 flex-col gap-2"
                  variant="outline"
                  disabled={selectedCount === 0}
                >
                  <FileArrowDown className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">TXT</div>
                    <div className="text-xs opacity-80">Текстов формат за преглед</div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
