# EyeZen Privacy Policy

_Last updated: March 18, 2025_

EyeZen (“the App”) helps you schedule guided eye‑relaxation sessions. We operate with a **privacy‑first** mindset and only process the minimum information required to deliver the experience. This document explains what we collect, how we store it, and how you can reach us with questions.

---

## 1. Data We Collect

| Category | Details | Storage | Purpose |
| --- | --- | --- | --- |
| Session limits | Number of videos watched today, last watch date | Stored locally on the device via AsyncStorage | Enforce free/premium daily quotas |
| Purchase state | Boolean that indicates whether premium access is active | Stored locally on the device via AsyncStorage and in the Apple receipt | Unlock premium features that you have paid for |
| Preferences | Theme, language, audio/haptic toggles | Stored locally on device | Remember your UI preferences |
| In‑App Purchases | Apple provides anonymised transaction data (productId, receipt) during purchases/restores | Processed in memory, optionally verified via Apple | Allow you to buy or restore premium access |

We do **not** collect personal identifiers, contact information, health data or analytics about how you use the App. No data is sent to third parties besides Apple’s In‑App Purchase infrastructure, which is required for payments.

---

## 2. Data Sharing

We do not sell, rent, or share your information. Purchase receipts are transmitted to Apple for validation, and that data remains inside Apple’s ecosystem.

---

## 3. Security

- Local data is stored via `@react-native-async-storage/async-storage`.  
- Screens that can expose the video content enable iOS/Android screen security APIs to prevent unintended screen captures.  
- Premium purchases are linked to your Apple ID so you can restore them on other devices.

---

## 4. Your Choices

- **Clear local data**: delete the app or use the “Clear Storage” debug action (when enabled) to reset local counters.
- **Restore purchases**: use the “Restore Purchase” action inside the App to re‑activate premium access on a new device.
- **Request deletion**: because we don’t maintain cloud accounts, removing the App deletes the data that lives on your device.

---

## 5. Children

The App is not directed at children under 13 and does not knowingly collect data from them.

---

## 6. Contact

Questions or concerns? Reach us at **support@eyezen.app**.

We review this policy regularly and will update the “Last updated” date whenever material changes are made.
