import { useState } from 'react'
import { CheckCircle, Circle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { TimelinePhase, Recommendation } from '@/types'

interface ActionTimelineProps {
  timeline?: TimelinePhase[]
  recommendations: Recommendation[]
}

export default function ActionTimeline({ timeline, recommendations }: ActionTimelineProps) {
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set())

  // Generate default timeline if not provided
  const generateDefaultTimeline = (): TimelinePhase[] => {
    const highPriority = recommendations.filter(r => r.priority === 'high')
    const mediumPriority = recommendations.filter(r => r.priority === 'medium')
    const lowPriority = recommendations.filter(r => r.priority === 'low')

    return [
      {
        phase: 1,
        title: 'Незабавни действия',
        duration: 'Седмица 1-2',
        actions: highPriority.slice(0, 3).map(r => r.title)
      },
      {
        phase: 2,
        title: 'Кратко-срочни промени',
        duration: 'Седмица 3-6',
        actions: [
          ...highPriority.slice(3).map(r => r.title),
          ...mediumPriority.slice(0, 2).map(r => r.title)
        ]
      },
      {
        phase: 3,
        title: 'Средно-срочна адаптация',
        duration: 'Месец 2-3',
        actions: mediumPriority.slice(2).map(r => r.title)
      },
      {
        phase: 4,
        title: 'Дълго-срочно поддържане',
        duration: 'Месец 4+',
        actions: lowPriority.map(r => r.title)
      }
    ].filter(phase => phase.actions.length > 0)
  }

  const timelineData = timeline || generateDefaultTimeline()

  const togglePhase = (phase: number) => {
    const newCompleted = new Set(completedPhases)
    if (newCompleted.has(phase)) {
      newCompleted.delete(phase)
    } else {
      newCompleted.add(phase)
    }
    setCompletedPhases(newCompleted)
  }

  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 1:
        return 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800'
      case 2:
        return 'bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-800'
      case 3:
        return 'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-800'
      case 4:
        return 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800'
      default:
        return 'bg-gray-100 dark:bg-gray-950 border-gray-300 dark:border-gray-800'
    }
  }

  const getPhaseIcon = (phase: number) => {
    switch (phase) {
      case 1:
        return '🚨'
      case 2:
        return '⚡'
      case 3:
        return '🎯'
      case 4:
        return '🌱'
      default:
        return '📋'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">План за Действие</h3>
        <p className="text-sm text-muted-foreground">
          Поетапна програма за реализация на препоръките
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-8">
          {timelineData.map((phase, idx) => {
            const isCompleted = completedPhases.has(phase.phase)
            
            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-16"
              >
                {/* Phase indicator */}
                <div 
                  className={`absolute left-0 w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl cursor-pointer transition-all ${
                    isCompleted 
                      ? 'bg-primary border-primary text-primary-foreground scale-110' 
                      : getPhaseColor(phase.phase)
                  }`}
                  onClick={() => togglePhase(phase.phase)}
                >
                  {isCompleted ? '✓' : getPhaseIcon(phase.phase)}
                </div>

                <div className={`border-2 rounded-lg p-5 transition-all ${
                  isCompleted 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-card border-border'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-base flex items-center gap-2">
                        Фаза {phase.phase}: {phase.title}
                        {isCompleted && (
                          <CheckCircle size={20} weight="fill" className="text-primary" />
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">{phase.duration}</p>
                    </div>
                  </div>

                  {phase.actions.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {phase.actions.map((action, actionIdx) => (
                        <div 
                          key={actionIdx} 
                          className="flex items-start gap-2 text-sm p-2 rounded hover:bg-muted/50 transition-colors"
                        >
                          <Circle 
                            size={16} 
                            weight="fill" 
                            className="text-primary flex-shrink-0 mt-0.5" 
                          />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Съвет:</strong> Натиснете на иконата на фаза, за да я отбележите като завършена.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ 
                width: `${(completedPhases.size / timelineData.length) * 100}%` 
              }}
            />
          </div>
          <span className="text-sm font-semibold">
            {completedPhases.size}/{timelineData.length}
          </span>
        </div>
      </div>
    </div>
  )
}
