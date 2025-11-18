# 🚀 Автономно Развъртане (Autonomous Deployment)

## Преглед

Приложението за иридологичен анализ сега е напълно автономно и може да работи независимо от GitHub. Може да бъде хоствано на всяка платформа за статично хостване.

## ✨ Нови Възможности

### Пълна Автономност
- ✅ **Локално съхранение**: Използва browser localStorage вместо GitHub Spark KV
- ✅ **Без GitHub зависимости**: Не изисква GitHub authentication
- ✅ **Универсални AI модели**: Поддръжка за OpenAI, Google Gemini и Cloudflare Workers AI
- ✅ **Статично хостване**: Работи на всяка платформа за статични сайтове

### Поддържани AI Провайдери

#### 1. OpenAI
- **Модели**: GPT-4o, GPT-4o-mini, GPT-4-turbo
- **API Key**: Вземете от [platform.openai.com](https://platform.openai.com/api-keys)
- **Формат**: Започва с `sk-`
- **Цена**: ~$0.005-0.03 на анализ

#### 2. Google Gemini
- **Модели**: Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash
- **API Key**: Вземете от [ai.google.dev](https://ai.google.dev)
- **Формат**: Започва с `AIza`
- **Цена**: Безплатен до определен лимит

#### 3. Cloudflare Workers AI ⭐ НОВО
- **Модели**: Llama 3.1 (8B, 70B), Mistral 7B
- **API Token**: Вземете от Cloudflare Dashboard
- **Account ID**: Намерете в Workers & Pages → Overview
- **Цена**: Безплатен за малък обем (10,000 заявки/ден)

## 📦 Стъпки за Развъртане

### Вариант 1: Cloudflare Pages (Препоръчително)

Cloudflare Pages предлага перфектна интеграция с Cloudflare Workers AI:

```bash
# 1. Инсталирайте Wrangler CLI
npm install -g wrangler

# 2. Login в Cloudflare
wrangler login

# 3. Build проекта
npm install
npm run build

# 4. Deploy към Cloudflare Pages
wrangler pages deploy dist --project-name=airis
```

**Предимства:**
- ✅ Безплатно хостване
- ✅ Глобален CDN
- ✅ Автоматичен SSL
- ✅ Директна интеграция с Workers AI
- ✅ Unlimited bandwidth

**След deployment:**
1. Отворете приложението на URL-а (напр. `airis.pages.dev`)
2. Отидете в Настройки (Settings)
3. Изберете Cloudflare като провайдер
4. Въведете API Token и Account ID
5. Изберете модел (препоръчваме `@cf/meta/llama-3.1-8b-instruct`)

### Вариант 2: Netlify

```bash
# 1. Инсталирайте Netlify CLI
npm install -g netlify-cli

# 2. Build проекта
npm install
npm run build

# 3. Deploy
netlify deploy --prod --dir=dist
```

### Вариант 3: Vercel

```bash
# 1. Инсталирайте Vercel CLI
npm install -g vercel

# 2. Build проекта
npm install
npm run build

# 3. Deploy
vercel --prod
```

### Вариант 4: GitHub Pages

GitHub Pages workflow е вече конфигуриран:

1. Отидете в Settings → Pages
2. Изберете "GitHub Actions" като source
3. Приложението ще бъде достъпно на `https://<username>.github.io/airis/`

### Вариант 5: Статичен Сървър

```bash
# 1. Build проекта
npm install
npm run build

# 2. Хоствайте dist/ папката на вашия сървър
# Използвайте nginx, Apache, или друг web сървър

# Пример с nginx:
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/airis/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## ⚙️ Конфигурация на AI Модели

### Първоначална Настройка

1. **Отворете приложението**
2. **Кликнете на "Настройки" (Settings)**
3. **Изберете AI провайдер:**

#### За OpenAI:
```
Провайдер: OpenAI
Модел: gpt-4o (или gpt-4o-mini за по-евтино)
API Ключ: sk-proj-xxxxxxxxxxxx
```

#### За Google Gemini:
```
Провайдер: Google Gemini
Модел: gemini-1.5-flash (безплатен до лимит)
API Ключ: AIzaxxxxxxxxxxxxxxxxx
```

#### За Cloudflare Workers AI:
```
Провайдер: Cloudflare Workers AI
Модел: @cf/meta/llama-3.1-8b-instruct
API Token: your-cloudflare-api-token
Account ID: your-32-char-account-id
```

### Как да получите Cloudflare API Token:

1. Логнете се в [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Отидете на My Profile → API Tokens
3. Кликнете "Create Token"
4. Изберете "Edit Cloudflare Workers" template
5. За Account Resources: Изберете вашия account
6. За Zone Resources: All zones
7. Кликнете "Continue to summary" → "Create Token"
8. Копирайте токена (показва се само веднъж!)

### Как да намерите Account ID:

1. В Cloudflare Dashboard
2. Отидете на Workers & Pages
3. Overview → Account ID се показва в дясно

## 💾 Данни и Съхранение

### Локално Съхранение
Всички данни се съхраняват в браузъра чрез localStorage:

- **Настройки на AI**: `ai-model-config`
- **История на анализи**: `analysis-history`
- **Учебници**: `iridology-textbooks`
- **Временни данни**: `questionnaire-data`, `left-iris`, `right-iris`, `analysis-report`

### Изтриване на Данни
За да изтриете всички данни:

1. Отворете Developer Console (F12)
2. Изпълнете:
```javascript
localStorage.clear()
location.reload()
```

### Експортиране на Данни
```javascript
// В Developer Console
const data = {
  config: localStorage.getItem('ai-model-config'),
  history: localStorage.getItem('analysis-history'),
  textbooks: localStorage.getItem('iridology-textbooks')
}
console.log(JSON.stringify(data, null, 2))
```

## 🔒 Сигурност

### API Ключове
- ✅ Съхраняват се само в браузъра на потребителя
- ✅ Никога не се изпращат към сървъри на приложението
- ✅ Всеки потребител използва собствените си ключове
- ⚠️ Не споделяйте API ключовете си

### Best Practices
1. Използвайте API ключове със scope ограничения
2. Мониторирайте използването на API в съответния dashboard
3. Ротирайте ключовете периодично
4. За production: Използвайте rate limiting на API level

## 📊 Производителност

### Време за Анализ

| Провайдер | Модел | Време | Забележки |
|-----------|-------|-------|-----------|
| OpenAI | GPT-4o | ~30-45s | Най-качествен |
| OpenAI | GPT-4o-mini | ~20-30s | По-бърз, добро качество |
| Gemini | Gemini 1.5 Flash | ~25-40s | Безплатен до лимит |
| Cloudflare | Llama 3.1 8B | ~40-60s | Безплатен, добър |
| Cloudflare | Llama 3.1 70B | ~60-90s | Най-качествен от Cloudflare |

### Цени (приблизително)

| Провайдер | Модел | Цена на анализ |
|-----------|-------|----------------|
| OpenAI | GPT-4o | ~$0.02-0.03 |
| OpenAI | GPT-4o-mini | ~$0.002-0.005 |
| Gemini | 1.5 Flash | Безплатен до 1500 заявки/ден |
| Gemini | 1.5 Pro | Безплатен до 50 заявки/ден |
| Cloudflare | Всички | Безплатен до 10,000 заявки/ден |

## 🌍 Multi-платформен Deployment

### Docker
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t airis .
docker run -p 8080:80 airis
```

### AWS S3 + CloudFront
```bash
# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Configure S3 bucket for static website hosting
aws s3 website s3://your-bucket-name --index-document index.html
```

## ❓ Често Задавани Въпроси

### 1. Работи ли приложението offline?
Да, след първоначално зареждане основните функции работат offline. AI анализът обаче изисква интернет връзка.

### 2. Мога ли да използвам собствен домейн?
Да! Всички платформи (Cloudflare Pages, Netlify, Vercel, GitHub Pages) поддържат custom domains.

### 3. Колко струва хостването?
Всички препоръчани платформи предлагат безплатни планове, които са достатъчни за повечето употреби.

### 4. Как мога да актуализирам приложението?
- **Cloudflare/Netlify/Vercel**: Нов build автоматично актуализира
- **GitHub Pages**: Push към main branch
- **Статичен сървър**: Качете нов build

### 5. Защо да избера Cloudflare Workers AI?
- ✅ Безплатен за малък обем
- ✅ Бърз (глобален CDN)
- ✅ Няма нужда от външни AI провайдери
- ✅ Добра интеграция с Cloudflare Pages

### 6. Каква е разликата между модели?
- **GPT-4o**: Най-интелигентен, най-точен, най-скъп
- **GPT-4o-mini**: Бърз и евтин, добър баланс
- **Gemini Flash**: Бърз, безплатен до лимит
- **Llama 3.1 8B**: Бърз, напълно безплатен
- **Llama 3.1 70B**: По-интелигентен, по-бавен

## 🆘 Помощ и Поддръжка

### Логове и Debugging
При анализ, кликнете "Покажи логове" за детайлна информация за процеса.

### Често Срещани Проблеми

#### "Моля, конфигурирайте собствен API ключ"
- Отидете в Настройки
- Активирайте "Използвай собствен API ключ"
- Въведете валиден API ключ

#### "Rate limit достигнат"
- Изчакайте няколко минути
- Или използвайте друг провайдер

#### "API грешка 401/403"
- Проверете дали API ключът е правилен
- Проверете дали имате активен plan в провайдера

## 🎉 Заключение

Приложението за иридологичен анализ сега е напълно автономно и може да се хоства навсякъде. Препоръчваме **Cloudflare Pages + Cloudflare Workers AI** за най-добро изживяване - напълно безплатно и с отлична производителност!

---

**Създадено с ❤️ за пълна автономност и гъвкавост!**

За въпроси и предложения: [GitHub Issues](https://github.com/Radilovk/airis/issues)
