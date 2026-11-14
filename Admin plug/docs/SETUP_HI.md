# Admin plug — setup

## 1. बिना live बदलाव के देखें

GitHub Pages का `Admin plug/index.html` खोलें और **Explore demo** चुनें। इसमें सारे records और names काल्पनिक हैं। iPhone Safari और PC दोनों के लिए responsive layout है।

अपनी file देखने के लिए **Review local files** चुनें। CSV/XLSX में सही source type और tab चुनें। Ground Force का WhatsApp export `.txt` में लोड करें। Local review केवल आपके चुने हुए files की जाँच है; यह server login नहीं है। कोई private data GitHub पर upload नहीं होता।

Local notes बचाने के लिए **Files & sources → Download private workspace snapshot** चुनें। इस निजी export को public repository में न रखें। Browser file picker पूरा computer scan नहीं करता; चुनी हुई file का नाम और sheet दिखाता है।

## 2. मुख्य source पहले सही चुनें

Movement में जाँचे गए वास्तविक tabs:

- `CONNING PRO.` — header row 2, data row 3 से; date column B; net weight column J।
- `7. Covering Prod.` — header row 1, data row 2 से; date B, box D, covering machine I, shade M और net weight U।

`7. Conning prod` नाम का tab नहीं मिला। Main stage dropdown में Conning/Covering/RC5 अलग चुनें। दोनों का वजन जोड़कर एक production total न बनाएँ।

Joshi वाली सही orders file का नाम/link, order-number column, product column और kg requirement पहले confirm करें। ORDER BOOK का `ORDER` tab एक candidate मिला है; इसे बिना पुष्टि सही Joshi file मत मानें। Example config में confirmation false ही है।

## 3. पहले अलग TEST Apps Script में जोड़ें

1. Current deployed script और Sheet का अलग backup/export लें। GitHub working copy को deployed LIVE source न मानें।
2. TEST project में existing RC5 session/login और `requireAdmin_` functions रखें। `backend/AdminPlug.gs` एक नई file के रूप में जोड़ें।
3. Matching TEST `Production Data Sync.gs` में `backend/integration.patch` apply करें। Existing global functions की duplicate copy न जोड़ें। Patch केवल नए routes जोड़ता है; save flow नहीं बदलता।
4. Script Properties में `ADMIN_PLUG_CONFIG` नाम से `backend/config.example.json` का JSON रखें। Placeholder IDs को actual TEST IDs से बदलें। ये private IDs/credentials public code में न डालें। Optional WhatsApp/control properties इस्तेमाल नहीं कर रहे हों तो हटाएँ।
5. Exact tab names, header row, first data row, date column और maximum columns confirm करें। Order source की पुष्टि होने के बाद ही `orderSourceConfirmed:true` करें।
6. Notes cloud में चाहिए तो source workbooks से अलग private control Sheet का ID दें और `adminPlugInitializeControl()` manually run करें। यह केवल `ADMIN PLUG AUDIT` tab बनाता है; production/order source को control workbook बनने से रोकता है। कोई नया recovery trigger नहीं बनता।
7. TEST web app deploy करें। Existing application-level username/password session और admin role checks बने रहते हैं। Required Google spreadsheet access और optional Google Docs access authorize करें।
8. Dashboard sign-in screen में TEST `/exec` URL और admin credentials डालें। Password या session token localStorage में नहीं रखा जाता। Non-admin source reads server पर reject होती हैं।
9. **Files & sources → Scan connected sources** दबाएँ। हर request अधिकतम 1,000 rows पढ़ती है। बड़े data पर scan धीमा हो सकता है; Pause करने पर coverage partial ही रहेगी। Full scan के बिना complete production/order का दावा नहीं होगा।
10. Actual LIVE deployment अलग निर्णय है। इस काम में न LIVE script deploy हुई, न source spreadsheet edit हुई।

## 4. Orders और daily report

Order No. + full product identity match हो तो direct link बनता है। Row में Order No. न हो तो production row का **Assign order** चुनें और evidence/reason दें। Product mismatch पर assignment रोकी जाती है। Product master aliases के लिए अलग mapping CSV/XLSX import कर सकते हैं; ambiguous aliases स्वतः resolve नहीं होतीं।

Daily report में date चुनें, फिर CSV या Print / Save as PDF चुनें। Partial sources और unresolved links report में लिखे रहेंगे। `Gross − tare` और net में अंतर केवल record check है; Covering-Conning का अंतर अपने आप proven loss नहीं है।

WhatsApp में **Closure claim** और **Admin verified** अलग हैं। `Clear ho gaya` message पर automatically पूरा काम complete नहीं माना जाता। Evidence जाँचकर review state बदलें। Cloud notes का write केवल authenticated read-back के बाद saved बताया जाता है। Control backend नहीं हो तो note local-only है।

## 5. जरूरी जाँच

Non-admin login reject, सही source/tab mapping, same Request ID duplication, अलग S/Z products, missing Order No., partial scans, wrong kg values, omitted media, old chat, phone-only backlog, note read-back और iPhone/PC print layout TEST में जाँचें। Roles या source mapping को हटाकर totals पूरा दिखाने की कोशिश न करें।
