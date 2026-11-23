# GTA 6 — Dark Forest / Tiger Hunt (Three.js)

مشروع تجريبي جماهيري غير رسمي (Fan-made). ليس منتجاً تابعاً لـ Rockstar Games أو Take-Two. العلامات والشخصيات والأعمال الأصلية تبقى لأصحاب حقوقها؛ لا تستخدمها تجارياً أو في متجر تطبيقات دون التراخيص اللازمة.

## تسلسل التجربة
1. شاشة شعار افتتاحية.
2. شاشة الغلاف والقائمة.
3. زر «شاهد الإعلان ثم العب» لتشغيل `www/assets/video_1.mp4`، أو «ابدأ مباشرة» لتجاوز الإعلان.
4. لعبة Three.js في الغابة الليلية مع ثلاث موجات، صحة، ذخيرة، إعادة تعبئة، تحكم لمسي، وحالات فوز/خسارة.

## هيكل الملفات

```text
GTA6_3D/
├── .github/workflows/
│   ├── deploy-pages.yml       # نشر www إلى GitHub Pages
│   └── build-android.yml      # بناء APK تلقائياً عبر GitHub Actions
├── assets/
│   ├── icon.png               # أيقونة 1024x1024
│   └── splash.png             # صورة شاشة بدء Capacitor
├── scripts/
│   ├── verify-project.mjs    # فحص المسارات والأصول وJavaScript
│   └── set-landscape.mjs     # تثبيت اتجاه Android الأفقي
├── www/
│   ├── index.html
│   ├── lib/three.min.js
│   └── assets/{cover.jpg,video_1.mp4}
├── capacitor.config.json
├── package.json
├── build.sh / build.bat
└── serve.sh / serve.bat
```

## فحص الملفات وتشغيل نسخة الويب

المتطلبات: Node.js 18+.

```bash
npm run verify
```

ثم شغّل خادم ملفات محلياً من مجلد المشروع:

```bash
npm run serve
```

أو `./serve.sh` على Linux/macOS و`serve.bat` على Windows. افتح `http://localhost:8000`. لا تفتح `index.html` مباشرة عبر `file://` لأن المتصفح قد يمنع تحميل بعض الأصول أو WebGL.

## بناء APK محلياً

المتطلبات الموصى بها:
- Node.js 20 LTS وnpm.
- JDK 17 (موصى به مع Capacitor 6).
- Android Studio مع Android SDK Platform وBuild Tools وPlatform Tools.
- ضبط `ANDROID_HOME` أو `ANDROID_SDK_ROOT` إلى مجلد Android SDK.

Linux/macOS:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"  # عدّل المسار عند الحاجة
chmod +x build.sh
./build.sh
```

Windows CMD:

```bat
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
build.bat
```

الناتج المتوقع: `GTA6_3D.apk` في جذر المشروع. هذا APK من نوع Debug للاختبار، وليس إصدار Release موقّعاً بمفتاح نشر خاص. لم يتم تضمين Android SDK أو Gradle binaries في الحزمة؛ Gradle Wrapper ومشروع Android يتم توليدهما أثناء `npx cap add android` على جهاز البناء.

## بناء APK عبر GitHub Actions

1. أنشئ مستودع GitHub فارغاً باسم `GTA6_3D`.
2. ارفع محتويات هذا المجلد إلى الفرع `main` (يجب أن يكون `.github` في جذر المستودع).
3. افتح تبويب **Actions**.
4. اختر **Build GTA6_3D.apk** ثم **Run workflow**.
5. بعد نجاح التشغيل، نزّل `GTA6_3D-debug-apk` من قسم Artifacts في نتيجة التشغيل.

الـ workflow يثبت Node 20 وJDK 17 ويستخدم Android SDK الموجود على GitHub-hosted Ubuntu runner. نجاح الـ workflow هو الذي يؤكد أن APK بُني فعلاً؛ مجرد ظهور رابط أو بدء workflow لا يعني اكتمال البناء.

## نشر نسخة الويب إلى GitHub Pages

1. في المستودع افتح **Settings → Pages**.
2. اجعل مصدر النشر **GitHub Actions**.
3. ارفع التغييرات إلى `main` أو شغّل workflow **Deploy GTA 6 Web Build to GitHub Pages** يدوياً.
4. بعد نجاح النشر سيظهر رابط الموقع في نتيجة الـ workflow.
5. استخدم الرابط لفحص النسخة أو إضافتها إلى WebView خارجي. اللعبة المنشورة تعتمد على ملفات `www` كلها، وليس `index.html` وحده.

## ملاحظات الأداء والتوافق
- مكتبة Three.js محلية ولا تحتاج إلى CDN.
- الفيديو H.264/AAC بدقة 1024×576 ومدته 30.03 ثانية، وحجمه نحو 0.85 MB.
- اتجاه تطبيق Capacitor يضبط إلى `sensorLandscape` أثناء بناء Android.
- اللعبة تحتاج إلى WebGL/WebGL2 بحسب الجهاز والمتصفح؛ اختبرها على الهاتف المستهدف قبل النشر.
- ملفات الفيديو والصور مضمّنة محلياً في APK عند بناء Capacitor؛ لا تحتاج إلى استضافة لتعمل النسخة المثبتة.

## AppCreator24
AppCreator24 ليس مستورداً عاماً لمشروع Capacitor أو ZIP كامل. يمكن ربط نسخة الويب المنشورة كرابط WebPage/URL إذا كان هذا النوع متاحاً في محرر التطبيق. لا تضع محتوى اللعبة كاملاً في حقل HTML محدود الطول؛ استخدم عنوان الموقع المستضاف. وقد تتطلب إعدادات اتجاه الشاشة وملء الشاشة ضبطاً يدوياً داخل المحرر.
