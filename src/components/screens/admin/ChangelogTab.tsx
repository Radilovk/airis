import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ListChecks, CheckCircle, Sparkles, Bug, Zap } from '@phosphor-icons/react'

export default function ChangelogTab() {
  const changes = [
    {
      version: 'v16',
      date: '21.11.2025',
      type: 'feature',
      items: [
        'AI Model Strategy система за advanced AI конфигурация',
        'Editor Mode с пълна контролна конфигурация',
        'Нова библиотека с утилити за знания за иридология',
        'Multi-layer storage система с fallback механизми',
        'Startup checks за валидиране на системата',
        'Storage cleanup за автоматично управление на памет',
        'Error logger за централизирано проследяване на грешки',
        'Upload diagnostics за валидиране на качени файлове'
      ]
    },
    {
      version: 'v15',
      date: '19.11.2025',
      type: 'feature',
      items: [
        'Пълна система за редактиране на репорт модулите в реално време',
        'Включване/изключване на Editor Mode от админ панела',
        'Drag & drop преподреждане на модули',
        'Коментиране на всеки контейнер',
        'Експорт на коментари в JSON и TXT формат'
      ]
    },
    {
      version: 'v14',
      date: '15.11.2025',
      type: 'feature',
      items: [
        'Интерактивна визуализация на 12-те иридологични зони',
        'Canvas-базиран редактор за прецизно подравняване',
        'Оптимизирана AI база знания (намален prompt размер)',
        '7 типа интерактивни графики (HealthProgressChart, NutritionChart и др.)',
        'Responsive дизайн за всички устройства'
      ]
    },
    {
      version: 'v13',
      date: '12.11.2025',
      type: 'feature',
      items: [
        'Табова организация за по-добра навигация',
        'AI Модел конфигурация',
        'Редактируемо иридологично ръководство',
        'Редактируем AI Prompt шаблон',
        'Управление на въпросника',
        'Changelog лог'
      ]
    },
    {
      version: 'v12',
      date: '10.11.2025',
      type: 'improvement',
      items: [
        'Професионално форматиране с bullet points и икони',
        'Accordion компоненти за дълги текстове',
        'Пълен превод на български',
        'Storage оптимизация и автоматично почистване',
        'Подобрено error handling и debugging'
      ]
    },
    {
      version: 'v11',
      date: '08.11.2025',
      type: 'fix',
      items: [
        '60-70% намаление на prompt размера',
        'Screen transition защита',
        'QuickDebugPanel за real-time мониторинг',
        'Diagnostic Screen за системна диагностика',
        'Upload diagnostics система'
      ]
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-4 h-4" weight="fill" />
      case 'improvement':
        return <Zap className="w-4 h-4" weight="fill" />
      case 'fix':
        return <Bug className="w-4 h-4" weight="fill" />
      default:
        return <CheckCircle className="w-4 h-4" weight="fill" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'feature':
        return <Badge className="bg-green-500">Нова функция</Badge>
      case 'improvement':
        return <Badge className="bg-blue-500">Подобрение</Badge>
      case 'fix':
        return <Badge className="bg-orange-500">Поправка</Badge>
      default:
        return <Badge>Промяна</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            Лог на промени
          </CardTitle>
          <CardDescription>
            Преглед на последните промени и функции в системата
          </CardDescription>
          <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-primary">
              Последна актуализация: {changes[0].date} | {changes.reduce((sum, c) => sum + c.items.length, 0)} промени общо
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md border p-6">
            <div className="space-y-8">
              {changes.map((change, index) => (
                <div key={index} className="relative">
                  {/* Timeline line */}
                  {index < changes.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary relative z-10">
                      {getTypeIcon(change.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{change.version}</h3>
                        {getTypeBadge(change.type)}
                        <span className="text-sm text-muted-foreground">{change.date}</span>
                      </div>

                      <ul className="space-y-2 mt-3">
                        {change.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" weight="fill" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Историята на промените се актуализира автоматично</p>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
