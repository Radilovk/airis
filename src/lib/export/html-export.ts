import type { AnalysisReport } from '@/types'

export function generateHTMLReport(report: AnalysisReport): string {
  const { questionnaireData, leftIris, rightIris, recommendations, summary, nutritionData } = report
  
  const avgHealth = Math.round((leftIris.overallHealth + rightIris.overallHealth) / 2)
  const date = new Date(report.timestamp).toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const bmi = (questionnaireData.weight / ((questionnaireData.height / 100) ** 2)).toFixed(1)

  const genderLabel = questionnaireData.gender === 'male' ? 'Мъж' : 
                       questionnaireData.gender === 'female' ? 'Жена' : 'Друго'

  const statusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10b981'
      case 'attention': return '#f59e0b'
      case 'concern': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'normal': return 'Нормално'
      case 'attention': return 'Внимание'
      case 'concern': return 'Притеснение'
      default: return 'Неизвестно'
    }
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const priorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Висок приоритет'
      case 'medium': return 'Среден приоритет'
      case 'low': return 'Нисък приоритет'
      default: return 'Приоритет'
    }
  }

  // Group recommendations by category
  const dietRecommendations = recommendations.filter(r => r.category === 'diet')
  const supplementRecommendations = recommendations.filter(r => r.category === 'supplement')
  const lifestyleRecommendations = recommendations.filter(r => r.category === 'lifestyle')

  const html = `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Иридологичен Доклад - ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 2rem; margin-bottom: 2rem; }
    .header h1 { font-size: 2.5rem; color: #1e40af; margin-bottom: 0.5rem; }
    .header .date { color: #6b7280; font-size: 1.1rem; }
    .section { margin-bottom: 2.5rem; }
    .section-title { font-size: 1.8rem; color: #1e40af; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .info-card { background: #f3f4f6; padding: 1.25rem; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .info-card .label { font-weight: 600; color: #4b5563; font-size: 0.9rem; margin-bottom: 0.25rem; }
    .info-card .value { font-size: 1.1rem; color: #111827; }
    .summary-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
    .health-score { text-align: center; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; margin: 2rem 0; }
    .health-score .score { font-size: 4rem; font-weight: bold; margin-bottom: 0.5rem; }
    .health-score .label { font-size: 1.2rem; opacity: 0.9; }
    .iris-analysis { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
    .iris-card { background: #f9fafb; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb; }
    .iris-card h3 { color: #1e40af; margin-bottom: 1rem; font-size: 1.4rem; }
    .zone { background: white; padding: 1rem; margin-bottom: 1rem; border-radius: 6px; border-left: 4px solid; }
    .zone-title { font-weight: 600; margin-bottom: 0.5rem; }
    .zone-findings { color: #6b7280; font-size: 0.95rem; }
    .recommendations-grid { display: grid; gap: 1.5rem; }
    .recommendation { background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb; border-left: 4px solid; }
    .recommendation-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .recommendation-title { font-size: 1.1rem; font-weight: 600; color: #111827; flex: 1; }
    .recommendation-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 500; margin-left: 1rem; }
    .recommendation-description { color: #4b5563; line-height: 1.6; }
    .nutrition-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; }
    .nutrition-card { padding: 1.5rem; border-radius: 8px; }
    .nutrition-card.recommended { background: #f0fdf4; border: 2px solid #86efac; }
    .nutrition-card.avoid { background: #fef2f2; border: 2px solid #fca5a5; }
    .nutrition-card h4 { font-size: 1.2rem; margin-bottom: 1rem; }
    .nutrition-card.recommended h4 { color: #15803d; }
    .nutrition-card.avoid h4 { color: #b91c1c; }
    .food-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .food-tag { padding: 0.4rem 0.8rem; border-radius: 9999px; font-size: 0.9rem; font-weight: 500; }
    .food-tag.recommended { background: #dcfce7; color: #166534; }
    .food-tag.avoid { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.9rem; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; padding: 1rem; } .iris-analysis { page-break-inside: avoid; } }
    @media (max-width: 768px) { .iris-analysis, .nutrition-grid, .info-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👁️ Иридологичен Доклад</h1>
      <div class="date">Генериран на: ${date}</div>
    </div>
    <div class="health-score">
      <div class="score">${avgHealth}/100</div>
      <div class="label">Общо здравословно състояние</div>
    </div>
    <div class="section">
      <h2 class="section-title">📋 Биометрични Данни</h2>
      <div class="info-grid">
        <div class="info-card"><div class="label">Възраст</div><div class="value">${questionnaireData.age} години</div></div>
        <div class="info-card"><div class="label">Пол</div><div class="value">${genderLabel}</div></div>
        <div class="info-card"><div class="label">Тегло</div><div class="value">${questionnaireData.weight} кг</div></div>
        <div class="info-card"><div class="label">Ръст</div><div class="value">${questionnaireData.height} см</div></div>
        <div class="info-card"><div class="label">BMI</div><div class="value">${bmi}</div></div>
      </div>
      ${questionnaireData.goals.length > 0 ? `<div class="info-card" style="margin-top: 1rem;"><div class="label">Здравни Цели</div><div class="value">${questionnaireData.goals.map(g => `• ${g}`).join('<br>')}</div></div>` : ''}
      ${questionnaireData.complaints ? `<div class="info-card" style="margin-top: 1rem;"><div class="label">Оплаквания</div><div class="value">${questionnaireData.complaints}</div></div>` : ''}
    </div>
    <div class="section">
      <h2 class="section-title">📊 Обобщение</h2>
      <div class="summary-box">${summary}</div>
    </div>
    <div class="section">
      <h2 class="section-title">👁️ Иридологичен Анализ</h2>
      <div class="iris-analysis">
        <div class="iris-card">
          <h3>Ляв Ирис (${leftIris.overallHealth}/100)</h3>
          ${(leftIris.zones || []).filter(z => z.status !== 'normal').map(zone => `<div class="zone" style="border-color: ${statusColor(zone.status)}"><div class="zone-title" style="color: ${statusColor(zone.status)}">${zone.name} - ${zone.organ}</div><div class="zone-findings">${zone.findings}</div><div style="margin-top: 0.5rem;"><span style="color: ${statusColor(zone.status)}; font-weight: 600; font-size: 0.85rem;">${statusLabel(zone.status)}</span></div></div>`).join('')}
          ${(leftIris.zones || []).filter(z => z.status !== 'normal').length === 0 ? '<p style="color: #10b981; font-weight: 600;">✓ Няма зони с отклонения</p>' : ''}
        </div>
        <div class="iris-card">
          <h3>Десен Ирис (${rightIris.overallHealth}/100)</h3>
          ${(rightIris.zones || []).filter(z => z.status !== 'normal').map(zone => `<div class="zone" style="border-color: ${statusColor(zone.status)}"><div class="zone-title" style="color: ${statusColor(zone.status)}">${zone.name} - ${zone.organ}</div><div class="zone-findings">${zone.findings}</div><div style="margin-top: 0.5rem;"><span style="color: ${statusColor(zone.status)}; font-weight: 600; font-size: 0.85rem;">${statusLabel(zone.status)}</span></div></div>`).join('')}
          ${(rightIris.zones || []).filter(z => z.status !== 'normal').length === 0 ? '<p style="color: #10b981; font-weight: 600;">✓ Няма зони с отклонения</p>' : ''}
        </div>
      </div>
    </div>
    ${nutritionData ? `<div class="section"><h2 class="section-title">🍎 Хранителни Насоки</h2><div class="nutrition-grid"><div class="nutrition-card recommended"><h4>✓ Препоръчани храни</h4><div class="food-tags">${nutritionData.recommended.map(food => `<span class="food-tag recommended">${food}</span>`).join('')}</div></div><div class="nutrition-card avoid"><h4>✗ Храни за избягване</h4><div class="food-tags">${nutritionData.avoid.map(food => `<span class="food-tag avoid">${food}</span>`).join('')}</div></div></div></div>` : ''}
    ${dietRecommendations.length > 0 ? `<div class="section"><h2 class="section-title">🥗 Хранителни Препоръки</h2><div class="recommendations-grid">${dietRecommendations.map(rec => `<div class="recommendation" style="border-left-color: ${priorityColor(rec.priority)}"><div class="recommendation-header"><div class="recommendation-title">${rec.title}</div><span class="recommendation-badge" style="background: ${priorityColor(rec.priority)}20; color: ${priorityColor(rec.priority)}">${priorityLabel(rec.priority)}</span></div><div class="recommendation-description">${rec.description}</div></div>`).join('')}</div></div>` : ''}
    ${supplementRecommendations.length > 0 ? `<div class="section"><h2 class="section-title">💊 Препоръки за Хранителни Добавки</h2><div class="recommendations-grid">${supplementRecommendations.map(rec => `<div class="recommendation" style="border-left-color: ${priorityColor(rec.priority)}"><div class="recommendation-header"><div class="recommendation-title">${rec.title}</div><span class="recommendation-badge" style="background: ${priorityColor(rec.priority)}20; color: ${priorityColor(rec.priority)}">${priorityLabel(rec.priority)}</span></div><div class="recommendation-description">${rec.description}</div></div>`).join('')}</div></div>` : ''}
    ${lifestyleRecommendations.length > 0 ? `<div class="section"><h2 class="section-title">🧘 Препоръки за Начин на Живот</h2><div class="recommendations-grid">${lifestyleRecommendations.map(rec => `<div class="recommendation" style="border-left-color: ${priorityColor(rec.priority)}"><div class="recommendation-header"><div class="recommendation-title">${rec.title}</div><span class="recommendation-badge" style="background: ${priorityColor(rec.priority)}20; color: ${priorityColor(rec.priority)}">${priorityLabel(rec.priority)}</span></div><div class="recommendation-description">${rec.description}</div></div>`).join('')}</div></div>` : ''}
    <div class="footer">
      <p>Този доклад е генериран от AIRIS - Иридологичен анализ с изкуствен интелект</p>
      <p style="margin-top: 0.5rem;">Докладът е със информационна цел и не заменя професионална медицинска консултация</p>
    </div>
  </div>
</body>
</html>`

  return html
}

export function downloadHTMLReport(report: AnalysisReport, filename?: string) {
  const html = generateHTMLReport(report)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `iridology-report-${Date.now()}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
