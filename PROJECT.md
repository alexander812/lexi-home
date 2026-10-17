# Lexi Home — лендинг проекта Lexi

Одностраничный лендинг приложения Lexi (тренажёр для запоминания слов и выражений):
объясняет суть приложения, показывает курсы и механику заданий, видео уроки и две точки входа —
веб-версию `app.lexi.casa` и Android-сборку. Тёмная тема, русский и английский языки.

Репозиторий: `github.com/alexander812/lexi-home`. Ожидаемый адрес сайта — `https://lexi.casa`
(в `astro.config.mjs` это `site`; веб-приложение живёт отдельно на `app.lexi.casa`).

Описание самого приложения — `/Users/a.smirnov/p/elemental/PROJECT.md` (соседний репозиторий `elemental`).
Дизайн-референс — recraft.ai (тёмная тема): крупная типографика, «плавающая» шапка-пилюля,
секции с заголовком по центру, карточки с картинками, финальный CTA-блок с коллажем.

## Стек

- Astro 7 (статический вывод, `trailingSlash: 'always'` — так URL отдаёт GitHub Pages), Node ≥ 22.12.
- TypeScript strict (`astro check` + `tsc --noEmit`), ESLint 9 (flat config) + Prettier.
- `@astrojs/sitemap` — sitemap с alternate-ссылками локалей.
- `astro:assets` + `sharp` — оптимизация скриншотов (webp, несколько ширин).
- `@fontsource-variable/inter` — шрифт Inter Variable (как в приложении).
- Никаких UI-фреймворков и рантайм-зависимостей: только `.astro`, CSS и маленькие встроенные скрипты
  (появление секций при скролле, состояние шапки, плеер видео).

## Команды

```bash
npm install          # зависимости
npm run dev          # dev-сервер (http://localhost:4321)
npm run build        # прод-сборка в dist/
npm run preview      # предпросмотр сборки
npm run check        # astro check (типы и шаблоны)
npm run type            # tsc --noEmit
npm run lint         # eslint src
npm run i18n         # проверка синхронности словарей en/ru
npm run format       # prettier
```

## Структура

```
astro.config.mjs        # site, i18n (en по умолчанию, ru в /ru), sitemap
scripts/check-i18n.mjs  # сверка ключей в словарях (en — эталон)
public/
  emblem.svg            # эмблема (A + 文) без фона — шапка и футер
  logo.svg              # эмблема + «Lexi» (полный лок-ап, сейчас не используется)
  favicon.svg, icons/, apple-touch-icon.png
  videos/               # ролики базы знаний приложения + постеры (см. «Видео»)
  downloads/            # lexi-android.apk — обновляется релизной сборкой lexi-android
src/
  assets/screenshots/   # скриншоты приложения для секций (webp на выходе)
  components/
    Button.astro        # ссылка-кнопка (primary / secondary / warning, размеры m/l)
    Section.astro       # секция: слот + заголовок (eyebrow, title, lead) + CTA вниз
    Icon.astro          # набор inline-иконок по имени
    Header.astro        # «плавающая» шапка: лого, навигация, переключатель EN/RU, «Попробовать»
    Footer.astro        # футер: бренд, ссылки приложения, выбор языка
    home/               # секции лендинга (Hero, Courses, Tasks, Videos, Download)
  constants/i18n.ts     # локали (en, ru), локаль по умолчанию, hreflang
  constants/links.ts    # APP_URL, ANDROID_APK_URL
  i18n/en.json, ru.json # тексты (плоские ключи + ICU-подобные строки без переменных)
  layouts/BaseLayout.astro
  pages/[...locale]/index.astro  # главная: / (en) и /ru
  pages/404.astro       # 404 (на английском, ведёт на главную)
  scripts/scroll-effects.ts      # reveal-анимации + состояние шапки
  styles/tokens.css     # цвета/радиусы/типографика (тёмная тема ui-kit)
  styles/base.css       # reset, контейнер, типографика, .media-frame, reveal
  utils/i18n-text.ts    # t(), useTranslations(), localePath()
  utils/i18n-routes.ts  # getStaticPaths для /[...locale]
```

## Страницы и секции

Одна страница на локаль, секции — анкоры в шапке и футере:

| #   | Секция           | `id`       | Содержание                                                                                                                                         |
| --- | ---------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hero             | `why`      | суть приложения: бесплатный тренажёр памяти, голосовая проверка, готовые курсы; CTA «Скачать бесплатно» и «Смотреть видео»; коллаж из трёх экранов |
| 2   | Курсы и уроки    | `courses`  | 4 карточки: курсы по уровням, свои уроки и задания, задания из текста, прогресс и награды                                                          |
| 3   | Механика заданий | `tasks`    | 5 шагов (текст → свайпы → произношение → ввод → тест), два экрана приложения                                                                       |
| 4   | Видео уроки      | `videos`   | 4 вертикальных плеера (постер + play, видео грузится только по клику)                                                                              |
| 5   | Скачать          | `download` | веб-версия `app.lexi.casa` и Android APK; фон — коллаж из тем оформления                                                                           |

Под секциями 2–4 — общая кнопка «Скачать приложение» (`common_cta_download`), ведущая на `#download`.
Все тексты берутся из словарей; структура повторяется в обеих локалях.

## Локализация

- `en` — по умолчанию и без префикса (`/`), `ru` — с префиксом (`/ru`). Набор локалей — `src/constants/i18n.ts`.
- Тексты: `src/i18n/en.json` (эталон) и `src/i18n/ru.json`; в разметке — `const t = useTranslations(locale)`
  и `t('key')`. Ключи плоские, с префиксом по секции (`hero_*`, `courses_*`, `tasks_*`, `videos_*`,
  `download_*`, `footer_*`, `alt_*`, `meta_*`).
- Ссылка на страницу локали — `localePath(locale)` из `utils/i18n-text.ts`.
- `npm run i18n` падает, если в словарях разное число ключей. Новые ключи добавляются в оба файла сразу;
  тексты без перевода в одной из локалей лучше не оставлять (проверка ловит только наличие ключа).
- В `<head>` — canonical и alternate-ссылки (`hreflang`) на обе локали + `x-default`.

## Дизайн-токены

`src/styles/tokens.css` — тёмная тема из дизайн-системы приложения
(`elemental/design-system/ui-kit/src/tokens/colors.json`, тема `dark`):

- фон `#050505` (`--canvas`), поверхности `#0f0f11` / `#18181a` / `#282a2e`;
- акцент `#4763f0` (`--accent`, кнопки, иконки, хайлайты), наведение `#5578f1`;
- жёлтый `#ffcc4a` (кнопка «Скачать APK», часть эмблемы), красный `#f14f5d`, зелёный `#00b97a` (галочки);
- текст: `rgba(246,247,255,1)` и полупрозрачные варианты 0.5 / 0.32;
- карточки: `rgba(246,247,255,0.05)`, рамки `rgba(246,247,255,0.1)`;
- радиусы 8/12/16/24/999, шрифт Inter Variable, заголовки с `letter-spacing: -0.03em`.

Внутри компонентов — `scoped`-стили Astro; общие вещи (контейнер, заголовки секций, `.media-frame`,
reveal) — в `base.css`.

## Анимации

- Появление при скролле: атрибут `data-reveal` (+ `style="--reveal-delay: 90ms"` для стаггера),
  `src/scripts/scroll-effects.ts` навешивает `.is-visible` через `IntersectionObserver`.
  Пока скрипт не выполнился, разметка видима (`html.has-js` включает скрытие) — без JS всё читается.
- При `prefers-reduced-motion: reduce` анимации и плавный скролл отключаются.
- Шапка получает `.is-scrolled` после 12px скролла (плотнее фон, ярче рамка).
- Видео: постер + кнопка play; по клику включаются `controls` и запускается воспроизведение,
  остальные ролики встают на паузу. Пока видео не играет — постер обрезан (`object-fit: cover`),
  при воспроизведении — целиком (`contain`).

## Ассеты

### Скриншоты (`src/assets/screenshots/`)

| Файл                               | Где используется                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `courses.png`                      | hero (левое «телефон»), карточка «Курсы по уровням»                               |
| `card.png`                         | hero (центральное «телефон»), шаг «Проверка произношения»                         |
| `progress.png`                     | hero (правое «телефон»), карточка «Прогресс и награды»                            |
| `lessons.png`                      | карточка «Свои уроки и задания»                                                   |
| `task-text.png`                    | карточка «Задания из любого текста»                                               |
| `tasks.png`                        | список заданий со счётчиками ✓/✗ (секция заданий)                                 |
| `theme-*.png`                      | коллаж-фон в секции «Скачать» (5 тем: terracotta, day, midnight, stone, amethyst) |
| `recognition.png`, `languages.png` | резерв (в текущей вёрстке не используются)                                        |

Исходники скриншотов лежат в корне репозитория в `screenshots/` (в git не попадают, см. `.gitignore`).
При замене — сохранять те же имена, тогда вёрстка не меняется. `astro:assets` сам делает webp нужных ширин.

### Видео (`public/videos/`)

Ролики базы знаний приложения (`overview`, `task`, `settings`, `add-ready-course`) в mp4 + webm
и постеры `.jpg`. Постеры пересобраны из кадров роликов (не первые кадры): «Знакомство с Lexi» — карточка
со словом, «Работа с заданием» — текст задания с переводом, «Настройки и данные» — экран данных,
«Готовый курс за минуту» — каталог курсов.

Как перегенерировать постер: открыть ролик в браузере, поставить `currentTime` на нужную секунду и
снять кадр в canvas (`canvas.toDataURL('image/jpeg', 0.86)`), либо любым плеером/ffmpeg с поддержкой VP9.
Ролики — самые тяжёлые файлы репозитория (~35 МБ суммарно); при желании их можно вынести на внешний хостинг
и заменить ссылки в `src/components/home/VideosSection.astro`.

### Логотип

Шапка и футер собирают лок-ап из `public/emblem.svg` + текста «Lexi» (Inter 700): так размер и
вертикальный ритм совпадают с приложением. `public/logo.svg` (эмблема + «Lexi» в кривых) оставлен
для соц-превью и других задач, где нужен цельный SVG.

## Android-сборка

Лендинг ссылается на `/downloads/lexi-android.apk` (константа `ANDROID_APK_URL`).
Файл лежит в `public/downloads/lexi-android.apk` и обновляется автоматически из репозитория
`lexi-android`: при `:app:assembleRelease` скрипт `scripts/publish-release-apk.sh` копирует подписанный
APK, коммитит его в `lexi-home` и пушит в `main`. После push workflow деплоит сайт, так что ссылка
всегда ведёт на последнюю собранную версию. Вручную файл не редактировать.

APK весит около 95 МБ, поэтому каждый релиз добавляет новую версию в историю git. Если репозиторий
начнёт расти слишком быстро, стоит перейти на GitHub Releases и ссылку вида
`https://github.com/alexander812/lexi-android/releases/latest/download/lexi-android.apk`.

## Деплой

Основной сайт — GitHub Pages, домен `lexi.casa` (рабочая версия: `https://lexi.casa`, `www.lexi.casa`
редиректится на apex самим GitHub Pages; веб-приложение живёт на `app.lexi.casa` в репозитории `elemental`).

- Workflow `.github/workflows/deploy.yml`: push в `main` (или ручной запуск) → `npm ci` → `npm run i18n` →
  `npm run build` → публикация `dist` через `upload-pages-artifact` + `deploy-pages`. Node 22.
- `public/CNAME` содержит `lexi.casa` — домен привязан и в артефакте сборки.
- URL страниц отдаются со завершающим слэшем (`/`, `/ru/`), поэтому в `astro.config.mjs` стоит
  `trailingSlash: 'always'`, а `localePath()` возвращает `/ru/`. Проверять сборку локально стоит через
  `npm run preview` — иначе локальный `/ru` и продовый `/ru/` разойдутся.
- Pages включён через API (`build_type: workflow`): если репозиторий переезжает или настройки сбрасываются,
  нужен шаг «Settings → Pages → Source: GitHub Actions».
- `https_enforced` включается в настройках Pages; включать только после того, как сертификат домена
  выпущен (`https_certificate.state: approved`), иначе API отвечает «The certificate does not exist yet».
- Скриншоты приложения лежат в `src/assets/screenshots/` и обязаны быть в git — CI собирает проект из
  чистого клона (историю с `UNRESOLVED_IMPORT` см. в коммите `fix: скриншоты приложения…`).

## Следующие шаги

- Workflow деплоя (GitHub Pages) + домен: `lexi.casa`.
- OG-картинка 1200×630 (сейчас в `og:image` отдаётся `icons/icon-512.png`).
- Google Play (когда появится) — третья карточка в секции «Скачать».
- Английская озвучка видео: ролики базы знаний записаны на русском.
- Аналитика (если понадобится) — отдельным интеграционным скриптом, без влияния на LCP.
