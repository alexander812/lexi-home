# Android APK

APK больше не хранится в этом репозитории. Он публикуется как asset GitHub Releases в репозитории
`lexi-android`:

```
https://github.com/alexander812/lexi-android/releases/latest/download/lexi-android.apk
```

Лендинг ссылается на этот адрес через `ANDROID_APK_URL` в `src/constants/links.ts`. Ссылка
`releases/latest/download/...` всегда ведёт на APK из последнего релиза.

Загрузка выполняется автоматически при сборке `:app:assembleRelease` в `lexi-android`.
Подробности — в `PROJECT.md`, раздел «Android-сборка».
