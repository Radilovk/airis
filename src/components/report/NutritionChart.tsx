import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { NutritionData } from '@/types'

interface NutritionChartProps {
  nutritionData?: NutritionData
  recommendations: Array<{ category: string; title: string; description: string }>
}

export default function NutritionChart({ nutritionData, recommendations }: NutritionChartProps) {
  // Extract nutrition information from recommendations if nutritionData is not provided
  const extractNutritionFromRecommendations = () => {
    const dietRecs = recommendations.filter(r => r.category === 'diet')
    
    const recommended: string[] = []
    const avoid: string[] = []
    
    dietRecs.forEach(rec => {
      const text = `${rec.title} ${rec.description}`.toLowerCase()
      
      // Extract foods to recommend
      if (text.includes('консумирайте') || text.includes('добавете') || text.includes('яжте')) {
        const foods = extractFoods(text)
        recommended.push(...foods)
      }
      
      // Extract foods to avoid
      if (text.includes('избягвайте') || text.includes('намалете') || text.includes('ограничете')) {
        const foods = extractFoods(text)
        avoid.push(...foods)
      }
    })
    
    return {
      recommended: recommended.slice(0, 10), // Limit to top 10
      avoid: avoid.slice(0, 10)
    }
  }
  
  const extractFoods = (text: string): string[] => {
    const foodKeywords = [
      'зеленчуци', 'плодове', 'ядки', 'риба', 'месо', 'млечни продукти',
      'зърнени храни', 'бобови растения', 'семена', 'яйца', 'вода',
      'захар', 'сол', 'мазнини', 'алкохол', 'кафе', 'обработени храни',
      'червено месо', 'брашно', 'газирани напитки'
    ]
    
    const found: string[] = []
    foodKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        found.push(keyword.charAt(0).toUpperCase() + keyword.slice(1))
      }
    })
    
    return found
  }

  const nutrition = nutritionData || extractNutritionFromRecommendations()
  
  const chartData = [
    {
      category: 'Препоръчани',
      count: nutrition.recommended.length,
      color: 'oklch(0.55 0.15 230)'
    },
    {
      category: 'Избягвайте',
      count: nutrition.avoid.length,
      color: 'oklch(0.70 0.18 45)'
    }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Хранителни Препоръки</h3>
        <p className="text-sm text-muted-foreground">
          Обобщение на препоръчаните и неподходящи храни
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            <span className="text-lg">✅</span> Препоръчани храни
          </h4>
          <div className="space-y-2">
            {nutrition.recommended.length > 0 ? (
              nutrition.recommended.map((food, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md">
                  <span className="text-sm">{food}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Няма специфични препоръки</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <span className="text-lg">⚠️</span> Избягвайте
          </h4>
          <div className="space-y-2">
            {nutrition.avoid.length > 0 ? (
              nutrition.avoid.map((food, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-md">
                  <span className="text-sm">{food}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Няма специфични ограничения</p>
            )}
          </div>
        </div>
      </div>

      {(nutrition.recommended.length > 0 || nutrition.avoid.length > 0) && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
            <XAxis type="number" tick={{ fill: 'currentColor', fontSize: 12 }} />
            <YAxis 
              type="category" 
              dataKey="category" 
              tick={{ fill: 'currentColor', fontSize: 12 }}
              width={100}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Bar dataKey="count" name="Брой храни" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
