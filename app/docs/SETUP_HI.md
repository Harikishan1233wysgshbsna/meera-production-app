# RC5 ऐप — आसान setup

अभी नया app source बना है। LIVE HTML/Apps Script/Sheet नहीं बदली। इसे production-ready या deployed न समझें।

## पहले demo देखें

1. Computer पर Node 22 या नया install करें।
2. इस `app` folder में `npm ci` और `npm run dev` चलाएँ।
3. दिखाया गया local link खोलें। **Mock operator login → Add 200 test entries → Sync mock queue** चुनें।
4. यह browser demo है: fake cloud और IndexedDB इस्तेमाल करता है। Native background sync का device test अलग है।

## Android

Android Studio, पूरा JDK 21 और SDK 36/build-tools 35.0.0 रखें। `npm run sync`, फिर `npm run android` चलाएँ। Android Studio से test phone पर debug app install करें। तैयार APK होने का status VERIFICATION.md में देखें। Native demo बिना test backend के केवल local entries रखता है।

## iPhone

Mac और compatible Xcode चाहिए। `npm run sync` और `npm run ios` चलाएँ। Xcode में अपनी signing team चुनें और build करें। Linux में iPhone build/IPA नहीं बना है।

## असली connection, पहले TEST में

1. अलग TEST Google Sheet और Apps Script बनाएँ; सभी linked IDs TEST पर रखें।
2. BACKEND_SETUP.md के अनुसार adapter और integration patch जोड़ें। Original LIVE files को overwrite न करें।
3. TEST owner से ticket secret initialize करें और एक existing recovery trigger verify करें। दूसरा trigger न जोड़ें।
4. TEST Web App deploy करें। App settings में उसका `/exec` URL डालें।
5. RC5 form खोलें, test user login करें और entry save करें।
6. पहले **LOCAL_SAVED**, फिर **CLOUD_RECEIVED**, और अंत में **PRODUCTION_CONFIRMED** देखें।

केवल “Save” दबाना cloud receipt नहीं है। पूरा payload cloud तक पहुँचना चाहिए। 200 local entries में 150 cloud-received हैं तो बाकी 50 अभी phone पर निर्भर हैं। Phone power-off होने पर नई upload नहीं चलती; cloud में पहले से पहुँचा data server process कर सकता है। iPhone force-close और Android battery/force-stop restrictions लागू रहती हैं।

Login token Android Keystore/iPhone Keychain में रहता है। Logout पर credentials हटते हैं, pending entries नहीं मिटतीं। दूसरे user से login होने पर पुराने user की entries उसके token से नहीं भेजी जातीं। उसी account और उसी endpoint पर वापस login करके pending queue resume करें।

इस starter में पुराने fixed-PIN backup import/export और Microsoft SSO को इस्तेमाल न करें। Device test और बाकी configuration पूरा होने के बाद ही production rollout तय करें।
