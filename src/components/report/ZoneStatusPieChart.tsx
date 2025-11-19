import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { IrisZone } from '@/types'

interface ZoneStatusPieChartProps {
  leftZones: IrisZone[]
  rightZones: IrisZone[]
}

export default function ZoneStatusPieChart({ leftZones, rightZones }: ZoneStatusPieChartProps) {
  const allZones = [...leftZones, ...rightZones]
  
  const statusCounts = {
    normal: allZones.filter(z => z.status === 'normal').length,
    attention: allZones.filter(z => z.status === 'attention').length,
    concern: allZones.filter(z => z.status === 'concern').length
  }

  const data = [
    { 
      name: 'Норма', 
      value: statusCounts.normal, 
      color: 'oklch(0.60 0.12 150)',
      percentage: Math.round((statusCounts.normal / allZones.length) * 100)
    },
    { 
      name: 'Внимание', 
      value: statusCounts.attention, 
      color: 'oklch(0.75 0.15 85)',
      percentage: Math.round((statusCounts.attention / allZones.length) * 100)
    },
    { 
      name: 'Притеснение', 
      value: statusCounts.concern, 
      color: 'oklch(0.65 0.20 25)',
      percentage: Math.round((statusCounts.concern / allZones.length) * 100)
    }
  ].filter(item => item.value > 0)

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Статус на Зоните</h3>
        <p className="text-sm text-muted-foreground">
          Обобщение на състоянието на всички иридологични зони
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                color: 'hsl(var(--foreground))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <span className="text-2xl font-bold text-primary">{item.value}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {item.percentage}% от всички зони
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{statusCounts.normal}</div>
            <div className="text-xs text-muted-foreground">В Норма</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.attention}</div>
            <div className="text-xs text-muted-foreground">За Внимание</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{statusCounts.concern}</div>
            <div className="text-xs text-muted-foreground">Притеснителни</div>
          </div>
        </div>
      </div>
    </div>
  )
}
