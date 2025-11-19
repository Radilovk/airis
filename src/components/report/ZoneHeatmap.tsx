import { useState } from 'react'
import type { IrisZone } from '@/types'
import { motion } from 'framer-motion'

interface ZoneHeatmapProps {
  zones: IrisZone[]
  side: 'left' | 'right'
}

export default function ZoneHeatmap({ zones, side }: ZoneHeatmapProps) {
  const [selectedZone, setSelectedZone] = useState<IrisZone | null>(null)

  const getZoneColor = (status: 'normal' | 'attention' | 'concern') => {
    switch (status) {
      case 'normal':
        return '#10b981' // green
      case 'attention':
        return '#f59e0b' // amber
      case 'concern':
        return '#ef4444' // red
    }
  }

  const getZoneOpacity = (status: 'normal' | 'attention' | 'concern') => {
    switch (status) {
      case 'normal':
        return 0.3
      case 'attention':
        return 0.6
      case 'concern':
        return 0.9
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {side === 'left' ? 'Ляв' : 'Десен'} Ирис - Зонална Карта
        </h3>
        <p className="text-sm text-muted-foreground">
          Интерактивна визуализация на иридологичните зони
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg">
          <svg 
            viewBox="0 0 400 400" 
            className="w-full max-w-[350px] h-auto"
          >
            {/* Outer circle */}
            <circle
              cx="200"
              cy="200"
              r="180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.2"
            />
            
            {/* Middle circle */}
            <circle
              cx="200"
              cy="200"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.2"
            />
            
            {/* Inner circle (pupil) */}
            <circle
              cx="200"
              cy="200"
              r="60"
              fill="currentColor"
              opacity="0.1"
            />

            {/* Zone segments */}
            {zones.map((zone) => {
              const [startAngle, endAngle] = zone.angle
              const angleSpan = endAngle - startAngle
              const middleAngle = startAngle + angleSpan / 2
              
              // Convert to SVG coordinates (0° is at 3 o'clock, rotate counter-clockwise)
              const startRad = ((startAngle - 90) * Math.PI) / 180
              const endRad = ((endAngle - 90) * Math.PI) / 180
              
              // Outer radius
              const outerR = 180
              const innerR = 60
              
              // Calculate path points
              const x1 = 200 + innerR * Math.cos(startRad)
              const y1 = 200 + innerR * Math.sin(startRad)
              const x2 = 200 + outerR * Math.cos(startRad)
              const y2 = 200 + outerR * Math.sin(startRad)
              const x3 = 200 + outerR * Math.cos(endRad)
              const y3 = 200 + outerR * Math.sin(endRad)
              const x4 = 200 + innerR * Math.cos(endRad)
              const y4 = 200 + innerR * Math.sin(endRad)
              
              const largeArcFlag = angleSpan > 180 ? 1 : 0
              
              const pathData = `
                M ${x1} ${y1}
                L ${x2} ${y2}
                A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x3} ${y3}
                L ${x4} ${y4}
                A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x1} ${y1}
                Z
              `
              
              const labelRad = ((middleAngle - 90) * Math.PI) / 180
              const labelR = 140
              const labelX = 200 + labelR * Math.cos(labelRad)
              const labelY = 200 + labelR * Math.sin(labelRad)

              return (
                <g key={zone.id}>
                  <path
                    d={pathData}
                    fill={getZoneColor(zone.status)}
                    fillOpacity={getZoneOpacity(zone.status)}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                    className="cursor-pointer hover:brightness-110 transition-all"
                    onMouseEnter={() => setSelectedZone(zone)}
                    onMouseLeave={() => setSelectedZone(null)}
                    onClick={() => setSelectedZone(zone === selectedZone ? null : zone)}
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium pointer-events-none"
                    fill="currentColor"
                  >
                    {zone.id}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="space-y-4">
          {selectedZone ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border rounded-lg bg-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-base">{selectedZone.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedZone.organ}</p>
                </div>
                <div 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: getZoneColor(selectedZone.status) + '20',
                    color: getZoneColor(selectedZone.status)
                  }}
                >
                  {selectedZone.status === 'normal' ? 'Норма' : 
                   selectedZone.status === 'attention' ? 'Внимание' : 'Притеснение'}
                </div>
              </div>
              <p className="text-sm leading-relaxed">{selectedZone.findings}</p>
            </motion.div>
          ) : (
            <div className="p-8 border rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">
                Натиснете на зона за детайлна информация
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Легенда</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
                <span className="text-sm">Норма</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }} />
                <span className="text-sm">Внимание</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
                <span className="text-sm">Притеснение</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
