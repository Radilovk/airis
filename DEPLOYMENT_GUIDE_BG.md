# 🚀 Ръководство за Deployment на Приложението

## 📋 Съдържание
1. [Бърз отговор](#бърз-отговор)
2. [GitHub Pages (Препоръчан метод)](#github-pages-препоръчан-метод)
3. [Други deployment опции](#други-deployment-опции)
4. [Необходима информация](#необходима-информация)
5. [Често задавани въпроси](#често-задавани-въпроси)

---

## 🎯 Бърз отговор

**Най-бързият и лесен начин** за deployment на приложението е чрез **GitHub Pages**.

### Какво получавате:
- ✅ **Публичен URL** достъпен за всички без регистрация
- ✅ **Автоматично deployment** при всяка промяна
- ✅ **Безплатно** hosting
- ✅ **HTTPS** enabled
- ✅ **Никакви сървъри** за поддръжка

### Пример URL:
След активиране на GitHub Pages, приложението ще бъде достъпно на:
```
https://<ваше-потребителско-име>.github.io/airis/
```

---

## 🌟 GitHub Pages (Препоръчан метод)

### Стъпка 1: Активиране на GitHub Pages

1. **Отидете в Settings на вашето GitHub repository**
   - В GitHub, отидете на: `https://github.com/<потребител>/airis/settings`

2. **Намерете секцията "Pages"**
   - В лявото меню, потърсете "Pages"

3. **Конфигурирайте източника**
   - **Source**: Изберете "GitHub Actions"
   - Това е всичко! GitHub Actions workflow е вече конфигуриран в проекта

4. **Изчакайте deployment**
   - Отидете в таб "Actions": `https://github.com/<потребител>/airis/actions`
   - Ще видите workflow "Deploy to GitHub Pages" в процес на изпълнение
   - Изчакайте да завърши (обикновено 2-3 минути)

5. **Достъп до приложението**
   - След успешен deployment, URL-ът ще се покаже в Settings → Pages
   - Обикновено е: `https://<потребител>.github.io/airis/`
   - Можете също да видите URL-а в taб "Actions" → последен workflow run → Deploy step

### Стъпка 2: Автоматично deployment

След първоначалната настройка, **всеки push към `main` branch** ще trigger автоматично deployment!

```bash
# Правите промяна
git add .
git commit -m "Промяна в приложението"
git push origin main

# GitHub Actions автоматично:
# 1. Изтегля кода
# 2. Инсталира dependencies
# 3. Build-ва приложението
# 4. Deploy-ва на GitHub Pages
```

### Стъпка 3: Споделяне с потребители

Просто споделете URL-а:
```
https://<ваше-потребителско-име>.github.io/airis/
```

**Няма нужда потребителите да:**
- Имат GitHub акаунт
- Знаят как работи Git
- Инсталират нещо на компютъра си

Просто отварят линка и използват приложението! 🎉

---

## 🔧 Други deployment опции

### Опция 2: Netlify

**Защо Netlify:**
- Много лесна настройка
- По-бързо deployment от GitHub Pages
- Безплатен SSL сертификат
- Custom domain

**Как да deploy-нете:**

1. Отидете на [netlify.com](https://netlify.com)
2. Регистрирайте се (безплатно)
3. Кликнете "Add new site" → "Import an existing project"
4. Свържете GitHub repository
5. Конфигурирайте build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Кликнете "Deploy site"

**Готово!** Ще получите URL като: `https://airis-app.netlify.app`

### Опция 3: Vercel

**Защо Vercel:**
- Много бърз CDN
- Отличен за React приложения
- Автоматични preview deployments за pull requests

**Как да deploy-нете:**

1. Отидете на [vercel.com](https://vercel.com)
2. Регистрирайте се с GitHub акаунт
3. Кликнете "New Project"
4. Изберете `airis` repository
5. Vercel автоматично детектва Vite проекта
6. Кликнете "Deploy"

**Готово!** Ще получите URL като: `https://airis.vercel.app`

### Опция 4: Firebase Hosting

**Защо Firebase:**
- Част от Google Cloud Platform
- Много добри performance metrics
- Лесно интегриране с други Firebase услуги

**Как да deploy-нете:**

```bash
# 1. Инсталирайте Firebase CLI
npm install -g firebase-tools

# 2. Login в Firebase
firebase login

# 3. Инициализирайте проекта
firebase init hosting

# Изберете:
# - Public directory: dist
# - Single-page app: Yes
# - Auto builds: No

# 4. Build и deploy
npm run build
firebase deploy
```

### Опция 5: Локално споделяне

Ако искате да споделите приложението без online hosting:

1. **Build-нете приложението:**
   ```bash
   npm install
   npm run build
   ```

2. **Архивирайте `dist/` папката:**
   ```bash
   zip -r airis-app.zip dist/
   ```

3. **Споделете архива:**
   - Изпратете `airis-app.zip` на потребителите
   - Те могат да го разархивират и отворят `index.html`
   - Работи offline, но AI анализа изисква интернет

---

## 📝 Необходима информация

### За GitHub Pages deployment:

| Информация | Описание | Къде да я намерите |
|------------|----------|-------------------|
| **GitHub Repository** | Пълно име на repo-то | `https://github.com/<потребител>/airis` |
| **Branch за deployment** | Обикновено `main` | Settings → Default branch |
| **Permissions** | Admin права на repo-то | Нужни за активиране на Pages |

### За custom domain (опционално):

| Информация | Описание |
|------------|----------|
| **Domain name** | напр. `airis.example.com` |
| **DNS provider** | Къде е регистриран домейна |
| **DNS records** | Трябва да добавите CNAME запис |

### За AI функционалност:

| Информация | Описание | Как да получите |
|------------|----------|----------------|
| **OpenAI API Key** | За използване на GPT-4 | [platform.openai.com](https://platform.openai.com) |
| **Google Gemini API Key** | За използване на Gemini | [ai.google.dev](https://ai.google.dev) |

**Забележка:** API ключовете се конфигурират от потребителите в Admin панела на приложението. Не ги включвайте в кода!

---

## 🎓 Често задавани въпроси

### 1. Трябва ли потребителите да имат GitHub акаунт?

**НЕ!** След deployment на GitHub Pages, приложението е публично достъпно за всеки с линка. GitHub акаунт е нужен само на вас за deployment.

### 2. Колко струва GitHub Pages?

**Безплатно** за публични repositories! За private repositories също е безплатно с ограничения.

### 3. Мога ли да използвам custom domain?

**Да!** В Settings → Pages → Custom domain можете да добавите свой домейн (напр. `airis.mydomain.com`).

### 4. Колко време отнема deployment?

- **Първоначална настройка**: 5 минути
- **Всяко следващо deployment**: 2-3 минути автоматично
- **Промени в кода**: Push към GitHub и изчакайте 2-3 минути

### 5. Какво се случва ако GitHub Pages не работи?

Може да използвате Netlify или Vercel като алтернатива. И двете са безплатни и много лесни за настройка.

### 6. Как потребителите ще получават актуализации?

Автоматично! Когато push-нете нова версия към `main` branch, GitHub Pages ще се актуализира автоматично. Потребителите просто презареждат страницата.

### 7. Работи ли приложението offline?

След зареждане, основната функционалност работи offline. Обаче **AI анализа изисква интернет връзка** за да комуникира с OpenAI/Gemini API.

### 8. Мога ли да видя кой използва приложението?

GitHub Pages няма вградена analytics. Можете да добавите:
- Google Analytics
- Plausible Analytics
- Vercel Analytics (ако deploy-вате на Vercel)

### 9. Има ли ограничения за трафик?

GitHub Pages има soft limit от 100GB bandwidth месечно. За повечето приложения това е повече от достатъчно.

### 10. Какво ще се случи ако достигна лимита?

GitHub ще ви изпрати email. Можете да премахнете на Netlify или Vercel които имат по-високи лимити.

---

## 🔐 Важни съображения за сигурност

### API ключове

❌ **НИКОГА не commit-вайте API ключове в кода!**

✅ **Правилният подход:**
- Потребителите въвеждат своите API ключове в Admin панела
- Ключовете се съхраняват локално в браузъра (localStorage)
- Всеки потребител използва собствени ключове

### Environment variables

За production deployment, **не използвайте** `.env` файлове с API ключове. Приложението е проектирано да работи с потребителски API ключове.

---

## 📞 Помощ и поддръжка

Ако срещнете проблеми:

1. **Проверете GitHub Actions logs**
   - Отидете в Actions tab
   - Кликнете на последния workflow run
   - Проверете logs за грешки

2. **Често срещани проблеми:**
   - Build failure: Проверете дали `npm run build` работи локално
   - 404 error: Уверете се, че Pages е активиран в Settings
   - White screen: Проверете browser console за грешки

3. **Допълнителна документация:**
   - [GitHub Pages документация](https://docs.github.com/en/pages)
   - [README_BG.md](./README_BG.md)
   - [USAGE_BG.md](./USAGE_BG.md)

---

## ✅ Checklist за deployment

- [ ] Repository е публичен (или имате GitHub Pro за private Pages)
- [ ] Кодът е push-нат към `main` branch
- [ ] GitHub Actions е активиран (по подразбиране е)
- [ ] Settings → Pages → Source е "GitHub Actions"
- [ ] Workflow `.github/workflows/deploy.yml` съществува
- [ ] `npm run build` работи локално
- [ ] Споделили сте URL-а с потребителите

---

## 🎉 Заключение

**GitHub Pages е идеалното решение** за вашето приложение защото:

1. ✅ **Безплатно** - никакви разходи
2. ✅ **Автоматично** - push и забравете
3. ✅ **Публично** - всеки може да използва без регистрация
4. ✅ **Надеждно** - GitHub инфраструктура
5. ✅ **Лесно** - само 5 минути настройка

**Алтернативите** (Netlify, Vercel) са също много добри и може да са дори по-бърzi, но GitHub Pages е най-лесен за начало.

---

Създадено с ❤️ за улеснение на deployment процеса!
