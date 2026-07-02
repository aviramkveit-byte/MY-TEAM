# הפעלת מצב קבוצתי (Group Mode)

זה הופך את האפליקציה למצב שבו **אתה** (מארגן הטיול) שם מפתח Claude אחד בצד השרת,
וכל מי שאתה משתף איתו קוד גישה יכול להשתמש באפליקציה בלי שיהיה לו מפתח API משלו.

המפתח שלך לא נחשף אף פעם לדפדפן — הוא יושב כ-secret בשרת (Cloudflare Worker, בחינם
לשימוש קטן), והאפליקציה מדברת רק עם השרת שלך, שמעביר את הבקשה ל-Claude.

## שלב 1: הגבל את הסיכון הכספי (חשוב!)

לפני הכל, ב-console.anthropic.com תחת Billing → Usage limits, קבע **תקרת הוצאה
חודשית** (למשל $20-30). זו רשת ביטחון שלא תלויה בקוד — גם אם קוד הגישה ידלוף,
לא תופתע בחשבון.

## שלב 2: פתיחת חשבון Cloudflare (חינמי)

1. הרשם ב-https://dash.cloudflare.com/sign-up (לא דורש כרטיס אשראי ל-Workers ברמה החינמית)
2. התקן את הכלי לפריסה:
   ```
   npm install -g wrangler
   ```
3. התחבר:
   ```
   wrangler login
   ```
   (זה יפתח דפדפן לאישור)

## שלב 3: פריסה

מהתיקייה הזו (`thailand-trip/backend/`):

```
wrangler secret put ANTHROPIC_API_KEY
```
הדבק את מפתח ה-API שלך מ-console.anthropic.com כשמתבקש.

```
wrangler secret put ACCESS_CODE
```
בחר קוד גישה (סיסמה) לשתף רק עם המשפחה/החברים שלך — למשל `thailand2026`.

```
wrangler deploy
```

בסיום תקבל URL כמו: `https://thai-trip-proxy.YOUR-SUBDOMAIN.workers.dev`

## שלב 4: חבר את האפליקציה

תן לי (או לעצמך) את ה-URL שקיבלת, ועדכן בקובץ `thailand-trip/index.html` את השורה:
```js
const PROXY_URL='';
```
ל:
```js
const PROXY_URL='https://thai-trip-proxy.YOUR-SUBDOMAIN.workers.dev';
```
ותפרסם. מרגע זה מסך ההתחברות באפליקציה יבקש "קוד גישה קבוצתי" במקום מפתח API אישי,
וכל מי שיש לו את הקוד יוכל להשתמש באפליקציה — כולל בהתקנה כ-PWA על מסך הבית באייפון/אנדרואיד.

## אופציונלי: הגבלת CORS למקור שלך בלבד

בברירת מחדל השרת מקבל בקשות מכל מקור. כדי להגביל רק לאתר שלך:
```
wrangler secret put ALLOWED_ORIGIN
```
והזן: `https://aviramkveit-byte.github.io`

## מה שהשרת הזה *לא* עושה

אין בו הגבלת קצב לפי משתמש (rate limiting) — לקבוצה סגורה וקטנה זה בדרך כלל מספיק
בשילוב עם תקרת ההוצאה משלב 1. אם תרצה בעתיד הגבלה לפי-משתמש, אפשר להוסיף
Cloudflare KV שסופר בקשות לכל access code.
