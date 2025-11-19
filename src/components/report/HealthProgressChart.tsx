import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface HealthProgressChartProps {
  currentHealth: number
}

export default function HealthProgressChart({ currentHealth }: HealthProgressChartProps) {
  // Generate 6-month forecast data
  const generateForecastData = () => {
    const months = ['Текущо', 'Месец 1', 'Месец 2', 'Месец 3', 'Месец 4', 'Месец 5', 'Месец 6']
    const data: Array<{ month: string; projected: number; optimal: number }> = []
    
    let health = currentHealth
    const improvementRate = (100 - currentHealth) / 6 * 0.7 // 70% improvement potential over 6 months
    
    for (let i = 0; i < months.length; i++) {
      if (i > 0) {
        health = Math.min(100, health + improvementRate)
      }
      
      data.push({
        month: months[i],
        projected: Math.round(health),
        optimal: Math.round(Math.min(100, currentHealth + (100 - currentHealth) * (i / 6)))
      })
    }
    
    return data
  }

  const data = generateForecastData()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Прогноза за Здравословно Състояние</h3>
        <p className="text-sm text-muted-foreground">
          Очаквано подобрение при спазване на препоръките
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'currentColor', fontSize: 12 }}
            stroke="currentColor"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            stroke="currentColor"
            label={{ value: 'Здраве (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="projected"
            name="Прогнозирано подобрение"
            stroke="oklch(0.55 0.15 230)"
            strokeWidth={2}
            dot={{ fill: 'oklch(0.55 0.15 230)', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="optimal"
            name="Оптимално подобрение"
            stroke="oklch(0.70 0.18 45)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: 'oklch(0.70 0.18 45)', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="bg-muted/50 p-4 rounded-lg text-sm">
        <p className="text-muted-foreground">
          💡 <strong>Забележка:</strong> Прогнозата е ориентировъчна и зависи от индивидуалното спазване на препоръките.
        </p>
      </div>
    </div>
  )
}
