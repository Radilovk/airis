import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  CaretDown, 
  CaretUp, 
  CheckCircle, 
  Circle,
  Apple,
  Pill,
  Brain,
  Star,
  Flask
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Recommendation, NutritionData, TimelinePhase } from '@/types'

interface PlanTabProps {
  recommendations: Recommendation[]
  nutritionData?: NutritionData
  timeline?: TimelinePhase[]
  onToggleRecommendation?: (index: number) => void
  completedRecommendations?: Set<number>
}

export default function PlanTab({
  recommendations,
  nutritionData,
  timeline,
  onToggleRecommendation,
  completedRecommendations = new Set()
}: PlanTabProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['food', 'supplements']))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  // Group recommendations by category
  const foodRecommendations = recommendations.filter(r => r.category === 'diet')
  const supplementRecommendations = recommendations.filter(r => r.category === 'supplement')
  const lifestyleRecommendations = recommendations.filter(r => r.category === 'lifestyle')

  // Additional recommendation types from problem statement
  const psychologicalRecommendations = lifestyleRecommendations.filter(r => 
    r.title.toLowerCase().includes('психо') || 
    r.title.toLowerCase().includes('стрес') ||
    r.title.toLowerCase().includes('медитация')
  )
  
  const specialRecommendations = lifestyleRecommendations.filter(r => 
    !psychologicalRecommendations.includes(r) &&
    (r.priority === 'high' || r.title.toLowerCase().includes('специален'))
  )

  const testRecommendations = lifestyleRecommendations.filter(r =>
    r.title.toLowerCase().includes('тест') ||
    r.title.toLowerCase().includes('изследване') ||
    r.title.toLowerCase().includes('анализ')
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Висок приоритет'
      case 'medium': return 'Среден приоритет'
      case 'low': return 'Нисък приоритет'
      default: return 'Приоритет'
    }
  }

  const RecommendationSection = ({
    title,
    icon: Icon,
    items,
    sectionKey,
    description
  }: {
    title: string
    icon: any
    items: Recommendation[]
    sectionKey: string
    description?: string
  }) => {
    const isExpanded = expandedSections.has(sectionKey)
    
    if (items.length === 0) return null

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleSection(sectionKey)}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" weight="duotone" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{items.length}</Badge>
                  {isExpanded ? (
                    <CaretUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <CaretDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="pt-0 space-y-3">
                    {items.map((item, index) => {
                      const globalIndex = recommendations.indexOf(item)
                      const isCompleted = completedRecommendations.has(globalIndex)
                      
                      return (
                        <motion.div
                          key={globalIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all",
                            isCompleted ? "bg-green-50 border-green-200" : "bg-background border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {onToggleRecommendation && (
                              <button
                                onClick={() => onToggleRecommendation(globalIndex)}
                                className="mt-1 shrink-0"
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                )}
                              </button>
                            )}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={cn(
                                  "font-semibold",
                                  isCompleted && "line-through text-muted-foreground"
                                )}>
                                  {item.title}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={cn("shrink-0", getPriorityColor(item.priority))}
                                >
                                  {getPriorityLabel(item.priority)}
                                </Badge>
                              </div>
                              <p className={cn(
                                "text-sm text-muted-foreground",
                                isCompleted && "line-through"
                              )}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }

  return (
    <div className="space-y-4">
      {/* Food Recommendations */}
      <RecommendationSection
        title="Хранителни Препоръки"
        icon={Apple}
        items={foodRecommendations}
        sectionKey="food"
        description="Персонализирани хранителни насоки за подобряване на здравето"
      />

      {/* Nutrition Data */}
      {nutritionData && (
        <Collapsible open={expandedSections.has('nutrition')} onOpenChange={() => toggleSection('nutrition')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Apple className="w-5 h-5 text-primary" weight="duotone" />
                    </div>
                    <CardTitle className="text-lg">Хранителна Категоризация</CardTitle>
                  </div>
                  {expandedSections.has('nutrition') ? (
                    <CaretUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <CaretDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 grid md:grid-cols-2 gap-4">
                {/* Recommended Foods */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" weight="fill" />
                    Препоръчани храни
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {nutritionData.recommended.map((food, i) => (
                      <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Foods to Avoid */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700 flex items-center gap-2">
                    <Circle className="w-4 h-4" weight="fill" />
                    Храни за избягване
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {nutritionData.avoid.map((food, i) => (
                      <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Supplement Recommendations */}
      <RecommendationSection
        title="Хранителни Добавки"
        icon={Pill}
        items={supplementRecommendations}
        sectionKey="supplements"
        description="Препоръчани добавки за оптимално здраве"
      />

      {/* Psychological Recommendations */}
      {psychologicalRecommendations.length > 0 && (
        <RecommendationSection
          title="Психологически Препоръки"
          icon={Brain}
          items={psychologicalRecommendations}
          sectionKey="psychological"
          description="Препоръки за психическо здраве и емоционално благосъстояние"
        />
      )}

      {/* Special/Individual Recommendations */}
      {specialRecommendations.length > 0 && (
        <RecommendationSection
          title="Специални Препоръки"
          icon={Star}
          items={specialRecommendations}
          sectionKey="special"
          description="Индивидуални препоръки специфични за вашия случай"
        />
      )}

      {/* Test Recommendations */}
      {testRecommendations.length > 0 && (
        <RecommendationSection
          title="Препоръчани Изследвания"
          icon={Flask}
          items={testRecommendations}
          sectionKey="tests"
          description="Медицински тестове и изследвания за задълбочена диагностика"
        />
      )}

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <Collapsible open={expandedSections.has('timeline')} onOpenChange={() => toggleSection('timeline')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CheckCircle className="w-5 h-5 text-primary" weight="duotone" />
                    </div>
                    <CardTitle className="text-lg">План за Действие</CardTitle>
                  </div>
                  {expandedSections.has('timeline') ? (
                    <CaretUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <CaretDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {timeline.map((phase, i) => (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {phase.phase}
                      </div>
                      <div>
                        <h4 className="font-semibold">{phase.title}</h4>
                        <p className="text-sm text-muted-foreground">{phase.duration}</p>
                      </div>
                    </div>
                    <ul className="space-y-1 ml-11">
                      {phase.actions.map((action, j) => (
                        <li key={j} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
}
