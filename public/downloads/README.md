# Android APK

`lexi-android.apk` — подписанный release APK приложения. Лендинг ссылается на него как
`/downloads/lexi-android.apk`.

Файл обновляется автоматически из репозитория `lexi-android`: при сборке `:app:assembleRelease`
скрипт `scripts/publish-release-apk.sh` копирует сюда свежий APK, коммитит его в `lexi-home` и пушит
в `main`. После push workflow GitHub Actions пересобирает и деплоит сайт.

Вручную файл не редактировать. Подробности — в `PROJECT.md`, раздел «Android-сборка».
