import { useState, useEffect } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Pencil, CheckCircle, Info } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { EditorModeConfig } from '@/types'

export default function EditorModeTab() {
  const [editorConfig, setEditorConfig] = useStorage<EditorModeConfig>('editor-mode-config', {
    enabled: false,
    allowReordering: true,
    allowComments: true,
    allowHiding: true,
    allowEditing: true,
    showMetadata: false
  })

  const [localConfig, setLocalConfig] = useState<EditorModeConfig>(editorConfig)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalConfig(editorConfig)
  }, [editorConfig])

  useEffect(() => {
    setHasChanges(JSON.stringify(localConfig) !== JSON.stringify(editorConfig))
  }, [localConfig, editorConfig])

  const handleSave = () => {
    setEditorConfig(localConfig)
    toast.success('Editor Mode настройките са запазени успешно')
    setHasChanges(false)
  }

  const handleToggleEnabled = (enabled: boolean) => {
    setLocalConfig({ ...localConfig, enabled })
    // Auto-save when toggling main switch
    setEditorConfig({ ...localConfig, enabled })
    if (enabled) {
      toast.success('Editor Mode е активиран')
    } else {
      toast.info('Editor Mode е деактивиран')
    }
  }

  const configOptions = [
    {
      id: 'allowReordering',
      label: 'Разрешено пренареждане',
      description: 'Позволява drag & drop пренареждане на модули и контейнери',
      icon: '↕️'
    },
    {
      id: 'allowComments',
      label: 'Разрешени коментари',
      description: 'Позволява добавяне на коментари към модули и контейнери',
      icon: '💬'
    },
    {
      id: 'allowHiding',
      label: 'Разрешено скриване',
      description: 'Позволява временно скриване на модули от репорта',
      icon: '👁️'
    },
    {
      id: 'allowEditing',
      label: 'Разрешено редактиране',
      description: 'Позволява директно редактиране на съдържанието на модулите',
      icon: '✏️'
    },
    {
      id: 'showMetadata',
      label: 'Показване на метаданни',
      description: 'Показва допълнителна информация като ID, дати, автори',
      icon: 'ℹ️'
    }
  ] as const

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary" />
                Editor Mode Конфигурация
              </CardTitle>
              <CardDescription>
                Управлявайте режима за редактиране на репорти
              </CardDescription>
            </div>
            {editorConfig.enabled && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" weight="fill" />
                Активен
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Enable Switch */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">
                    Активирай Editor Mode
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Включва режим за редактиране на репорти с всички активирани функции по-долу
                  </p>
                </div>
                <Switch
                  checked={localConfig.enabled}
                  onCheckedChange={handleToggleEnabled}
                  className="ml-4"
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Feature Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Функции на Editor Mode
            </h3>

            <div className="space-y-3">
              {configOptions.map((option) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: localConfig.enabled ? 1 : 0.4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={localConfig.enabled ? '' : 'opacity-50'}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-2xl">{option.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium mb-1">{option.label}</div>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={localConfig[option.id as keyof EditorModeConfig] as boolean}
                          onCheckedChange={(checked) =>
                            setLocalConfig({ ...localConfig, [option.id]: checked })
                          }
                          disabled={!localConfig.enabled}
                          className="ml-4"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Info Section */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium">Как работи Editor Mode?</p>
                  <ul className="space-y-1 list-disc list-inside text-blue-800 dark:text-blue-200">
                    <li>Активирайте режима, за да можете да редактирате репорти</li>
                    <li>Пренареждайте модули с drag & drop функционалност</li>
                    <li>Добавяйте коментари за бележки и препоръки</li>
                    <li>Скривайте временно несъществени модули</li>
                    <li>Редактирайте директно съдържанието на модулите</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-end gap-2 pt-4 border-t"
            >
              <Button variant="outline" onClick={() => setLocalConfig(editorConfig)}>
                Откажи промените
              </Button>
              <Button onClick={handleSave}>
                <CheckCircle className="w-4 h-4 mr-2" weight="fill" />
                Запази настройките
              </Button>
            </motion.div>
          )}

          {/* Current Status */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-3">Текущо състояние</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Editor Mode</div>
                <div className="font-semibold">
                  {editorConfig.enabled ? (
                    <span className="text-green-600">Активен</span>
                  ) : (
                    <span className="text-gray-600">Неактивен</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Активни функции</div>
                <div className="font-semibold">
                  {Object.values(editorConfig).filter(v => v === true).length} / {Object.keys(editorConfig).length}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Несъхранени промени</div>
                <div className="font-semibold">
                  {hasChanges ? (
                    <span className="text-orange-600">Да</span>
                  ) : (
                    <span className="text-gray-600">Не</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
