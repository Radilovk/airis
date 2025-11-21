import type { AnalysisReport, IrisZone } from '@/types'

export function generateComprehensiveHTMLReport(report: AnalysisReport): string {
  const { questionnaireData, leftIris, rightIris, recommendations, summary, nutritionData, timeline } = report
  
  const avgHealth = Math.round((leftIris.overallHealth + rightIris.overallHealth) / 2)
  const date = new Date(report.timestamp).toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const bmi = (questionnaireData.weight / ((questionnaireData.height / 100) ** 2)).toFixed(1)
  const genderLabel = questionnaireData.gender === 'male' ? 'Мъж' : 
                       questionnaireData.gender === 'female' ? 'Жена' : 'Друго'

  // Group recommendations
  const dietRecommendations = recommendations.filter(r => r.category === 'diet')
  const supplementRecommendations = recommendations.filter(r => r.category === 'supplement')
  const lifestyleRecommendations = recommendations.filter(r => r.category === 'lifestyle')

  const generateZoneCard = (zone: IrisZone, side: string) => {
    const statusColors = {
      normal: { bg: '#10b981', text: '#fff', border: '#059669' },
      attention: { bg: '#f59e0b', text: '#fff', border: '#d97706' },
      concern: { bg: '#ef4444', text: '#fff', border: '#dc2626' }
    }
    const colors = statusColors[zone.status] || statusColors.normal
    
    return `
      <div class="zone-card" data-status="${zone.status}" onclick="toggleZoneDetails(${zone.id})">
        <div class="zone-card-header" style="background: ${colors.bg}; color: ${colors.text}">
          <div class="zone-icon">${side === 'left' ? '👁️' : '👁'}</div>
          <div class="zone-title">
            <h4>${zone.name}</h4>
            <p>${zone.organ}</p>
          </div>
          <div class="zone-status-badge">${zone.status === 'normal' ? '✓' : zone.status === 'attention' ? '⚠' : '⚠'}</div>
        </div>
        <div class="zone-card-body" id="zone-${zone.id}">
          <p class="zone-findings">${zone.findings}</p>
          <div class="zone-angle">Позиция: ${zone.angle[0]}° - ${zone.angle[1]}°</div>
        </div>
      </div>
    `
  }

  const html = `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Иридологичен Доклад - ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; min-height: 100vh; }
    .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem; text-align: center; }
    .header h1 { font-size: 3rem; margin-bottom: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .header .subtitle { font-size: 1.2rem; opacity: 0.95; }
    .content { padding: 3rem; }
    .section { margin-bottom: 3rem; }
    .section-title { font-size: 2rem; color: #1e40af; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 3px solid #e5e7eb; display: flex; align-items: center; gap: 0.75rem; }
    .health-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
    .metric-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: transform 0.3s; }
    .metric-card:hover { transform: translateY(-4px); }
    .metric-value { font-size: 3rem; font-weight: bold; margin: 0.5rem 0; }
    .metric-label { font-size: 1rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .info-card { background: #f9fafb; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #667eea; transition: all 0.3s; }
    .info-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateX(4px); }
    .info-label { font-weight: 600; color: #4b5563; font-size: 0.9rem; margin-bottom: 0.5rem; }
    .info-value { font-size: 1.2rem; color: #111827; font-weight: 500; }
    .iris-zones { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
    .zone-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s; cursor: pointer; }
    .zone-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.15); transform: translateY(-4px); }
    .zone-card-header { padding: 1.5rem; display: flex; align-items: center; gap: 1rem; }
    .zone-icon { font-size: 2rem; }
    .zone-title { flex: 1; }
    .zone-title h4 { font-size: 1.1rem; margin-bottom: 0.25rem; }
    .zone-title p { font-size: 0.9rem; opacity: 0.9; }
    .zone-status-badge { font-size: 1.5rem; }
    .zone-card-body { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.95); }
    .zone-card-body.collapsed { display: none; }
    .zone-findings { color: #4b5563; margin-bottom: 1rem; }
    .zone-angle { font-size: 0.85rem; color: #6b7280; font-weight: 600; }
    .recommendations-grid { display: grid; gap: 1.5rem; }
    .recommendation { background: white; padding: 2rem; border-radius: 12px; border-left: 6px solid; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; }
    .recommendation:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateX(4px); }
    .recommendation.high { border-left-color: #ef4444; background: linear-gradient(to right, #fee2e2 0%, white 50%); }
    .recommendation.medium { border-left-color: #f59e0b; background: linear-gradient(to right, #fef3c7 0%, white 50%); }
    .recommendation.low { border-left-color: #3b82f6; background: linear-gradient(to right, #dbeafe 0%, white 50%); }
    .recommendation-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; }
    .recommendation-title { font-size: 1.3rem; font-weight: 600; color: #111827; }
    .recommendation-badge { padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; }
    .recommendation.high .recommendation-badge { background: #fee2e2; color: #991b1b; }
    .recommendation.medium .recommendation-badge { background: #fef3c7; color: #92400e; }
    .recommendation.low .recommendation-badge { background: #dbeafe; color: #1e40af; }
    .recommendation-description { color: #4b5563; line-height: 1.8; }
    .nutrition-section { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
    .nutrition-card { padding: 2rem; border-radius: 12px; }
    .nutrition-card.recommended { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 3px solid #10b981; }
    .nutrition-card.avoid { background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%); border: 3px solid #ef4444; }
    .nutrition-card h3 { font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .food-tags { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .food-tag { padding: 0.6rem 1.2rem; border-radius: 9999px; font-size: 0.95rem; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .food-tag.recommended { background: white; color: #047857; }
    .food-tag.avoid { background: white; color: #dc2626; }
    .timeline { margin: 2rem 0; }
    .timeline-item { display: flex; gap: 2rem; margin-bottom: 2rem; }
    .timeline-marker { display: flex; flex-direction: column; align-items: center; }
    .timeline-circle { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
    .timeline-line { width: 4px; flex: 1; background: linear-gradient(to bottom, #667eea, #e5e7eb); margin-top: 1rem; }
    .timeline-content { flex: 1; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .timeline-content h4 { font-size: 1.4rem; color: #1e40af; margin-bottom: 0.5rem; }
    .timeline-content .duration { color: #6b7280; margin-bottom: 1rem; font-weight: 600; }
    .timeline-content ul { list-style: none; padding: 0; }
    .timeline-content li { padding: 0.5rem 0; color: #4b5563; display: flex; gap: 0.75rem; align-items: start; }
    .timeline-content li:before { content: "✓"; color: #10b981; font-weight: bold; font-size: 1.2rem; }
    .footer { background: #f9fafb; padding: 2rem; text-align: center; color: #6b7280; border-top: 2px solid #e5e7eb; }
    .summary-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #3b82f6; padding: 2rem; border-radius: 12px; margin: 2rem 0; line-height: 1.8; color: #1e40af; }
    @media print { body { background: white; padding: 0; } .zone-card-body { display: block !important; } }
    @media (max-width: 768px) { .iris-zones, .nutrition-section, .info-grid { grid-template-columns: 1fr; } .timeline-item { flex-direction: column; gap: 1rem; } .timeline-line { display: none; } }
  </style>
  <script>
    function toggleZoneDetails(id) {
      const element = document.getElementById('zone-' + id);
      if (element) {
        element.classList.toggle('collapsed');
      }
    }
    window.onload = function() {
      // Collapse all zone bodies initially except those with concerns
      document.querySelectorAll('.zone-card-body').forEach(el => {
        const card = el.closest('.zone-card');
        if (card && card.dataset.status === 'normal') {
          el.classList.add('collapsed');
        }
      });
    };
  </script>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👁️ Иридологичен Доклад</h1>
      <p class="subtitle">Детайлен анализ на здравословното състояние</p>
      <p class="subtitle">Генериран на: ${date}</p>
    </div>
    
    <div class="content">
      <!-- Health Dashboard -->
      <div class="health-dashboard">
        <div class="metric-card">
          <div class="metric-label">Общо Здраве</div>
          <div class="metric-value">${avgHealth}/100</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Ляв Ирис</div>
          <div class="metric-value">${leftIris.overallHealth}/100</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Десен Ирис</div>
          <div class="metric-value">${rightIris.overallHealth}/100</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">BMI</div>
          <div class="metric-value">${bmi}</div>
        </div>
      </div>

      <!-- Personal Info -->
      <div class="section">
        <h2 class="section-title">📋 Лични Данни</h2>
        <div class="info-grid">
          <div class="info-card"><div class="info-label">Възраст</div><div class="info-value">${questionnaireData.age} години</div></div>
          <div class="info-card"><div class="info-label">Пол</div><div class="info-value">${genderLabel}</div></div>
          <div class="info-card"><div class="info-label">Тегло / Ръст</div><div class="info-value">${questionnaireData.weight} кг / ${questionnaireData.height} см</div></div>
          ${questionnaireData.goals.length > 0 ? `<div class="info-card"><div class="info-label">Здравни Цели</div><div class="info-value">${questionnaireData.goals.join(', ')}</div></div>` : ''}
        </div>
        ${questionnaireData.complaints ? `<div class="info-card" style="margin-top: 1.5rem;"><div class="info-label">Оплаквания</div><div class="info-value">${questionnaireData.complaints}</div></div>` : ''}
      </div>

      <!-- Summary -->
      <div class="section">
        <h2 class="section-title">📊 Обобщение</h2>
        <div class="summary-box">${summary}</div>
      </div>

      <!-- Iris Zones - Interactive Cards -->
      <div class="section">
        <h2 class="section-title">👁️ Ляв Ирис - Зони</h2>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">Кликнете на картата за да видите повече детайли</p>
        <div class="iris-zones">
          ${(leftIris.zones || []).map(zone => generateZoneCard(zone, 'left')).join('')}
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">👁 Десен Ирис - Зони</h2>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">Кликнете на картата за да видите повече детайли</p>
        <div class="iris-zones">
          ${(rightIris.zones || []).map(zone => generateZoneCard(zone, 'right')).join('')}
        </div>
      </div>

      <!-- Nutrition -->
      ${nutritionData ? `
      <div class="section">
        <h2 class="section-title">🍎 Хранителни Препоръки</h2>
        <div class="nutrition-section">
          <div class="nutrition-card recommended">
            <h3>✓ Препоръчани храни</h3>
            <div class="food-tags">
              ${nutritionData.recommended.map(food => `<span class="food-tag recommended">${food}</span>`).join('')}
            </div>
          </div>
          <div class="nutrition-card avoid">
            <h3>✗ Храни за избягване</h3>
            <div class="food-tags">
              ${nutritionData.avoid.map(food => `<span class="food-tag avoid">${food}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Diet Recommendations -->
      ${dietRecommendations.length > 0 ? `
      <div class="section">
        <h2 class="section-title">🥗 Детайлни Хранителни Препоръки</h2>
        <div class="recommendations-grid">
          ${dietRecommendations.map(rec => `
            <div class="recommendation ${rec.priority}">
              <div class="recommendation-header">
                <div class="recommendation-title">${rec.title}</div>
                <span class="recommendation-badge">${rec.priority === 'high' ? 'Висок приоритет' : rec.priority === 'medium' ? 'Среден приоритет' : 'Нисък приоритет'}</span>
              </div>
              <div class="recommendation-description">${rec.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Supplement Recommendations -->
      ${supplementRecommendations.length > 0 ? `
      <div class="section">
        <h2 class="section-title">💊 Хранителни Добавки</h2>
        <div class="recommendations-grid">
          ${supplementRecommendations.map(rec => `
            <div class="recommendation ${rec.priority}">
              <div class="recommendation-header">
                <div class="recommendation-title">${rec.title}</div>
                <span class="recommendation-badge">${rec.priority === 'high' ? 'Висок приоритет' : rec.priority === 'medium' ? 'Среден приоритет' : 'Нисък приоритет'}</span>
              </div>
              <div class="recommendation-description">${rec.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Lifestyle Recommendations -->
      ${lifestyleRecommendations.length > 0 ? `
      <div class="section">
        <h2 class="section-title">🧘 Начин на Живот</h2>
        <div class="recommendations-grid">
          ${lifestyleRecommendations.map(rec => `
            <div class="recommendation ${rec.priority}">
              <div class="recommendation-header">
                <div class="recommendation-title">${rec.title}</div>
                <span class="recommendation-badge">${rec.priority === 'high' ? 'Висок приоритет' : rec.priority === 'medium' ? 'Среден приоритет' : 'Нисък приоритет'}</span>
              </div>
              <div class="recommendation-description">${rec.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Timeline -->
      ${timeline && timeline.length > 0 ? `
      <div class="section">
        <h2 class="section-title">📅 План за Действие</h2>
        <div class="timeline">
          ${timeline.map((phase, i) => `
            <div class="timeline-item">
              <div class="timeline-marker">
                <div class="timeline-circle">${phase.phase}</div>
                ${i < timeline.length - 1 ? '<div class="timeline-line"></div>' : ''}
              </div>
              <div class="timeline-content">
                <h4>${phase.title}</h4>
                <p class="duration">${phase.duration}</p>
                <ul>
                  ${phase.actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p><strong>AIRIS - Иридологичен анализ с изкуствен интелект</strong></p>
      <p style="margin-top: 0.5rem;">Този доклад е със информационна цел и не заменя професионална медицинска консултация</p>
      <p style="margin-top: 0.5rem; font-size: 0.85rem;">© ${new Date().getFullYear()} AIRIS. Всички права запазени.</p>
    </div>
  </div>
</body>
</html>`

  return html
}

export function downloadComprehensiveHTMLReport(report: AnalysisReport, filename?: string) {
  const html = generateComprehensiveHTMLReport(report)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `iridology-report-comprehensive-${Date.now()}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
