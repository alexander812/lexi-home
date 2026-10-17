# Android APK

`lexi-android.apk` не хранится в git. Его скачивает workflow деплоя из последнего GitHub Release
репозитория `lexi-android`:

```
https://github.com/alexander812/lexi-android/releases/latest/download/lexi-android.apk
```

Файл кладётся в `public/downloads/lexi-android.apk` на этапе CI и попадает в собранный сайт. Лендинг
ссылается на него по постоянному адресу:

```
https://lexi.casa/downloads/lexi-android.apk
```

Так APK раздаётся с того же домена, что и сам лендинг, без GitHub Releases в браузере пользователя.

Обновление запускается автоматически: после загрузки нового APK в GitHub Releases репозиторий
`lexi-android` отправляет `repository_dispatch` в `lexi-home`, workflow скачивает свежий asset и
передеплоит сайт. Вручную файл не редактировать. Подробности — в `PROJECT.md`, раздел «Android-сборка».
