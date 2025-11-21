# In-App Purchase Troubleshooting Guide

This guide helps you resolve common IAP issues, especially the "Pricing unavailable" error.

## 🚨 Most Common Issue: "Pricing Unavailable" Error

### Root Cause
When you see "Pricing unavailable" on a physical device with a sandbox account, **the #1 cause is that your product status in App Store Connect is "Waiting for Review" (Ожидание проверки) or "Pending Review".**

Apple's StoreKit API **will not return pricing information** for products that are not in one of these approved states:
- ✅ **"Ready to Submit"** - Product is configured and ready
- ✅ **"Approved"** - Product has been reviewed and approved by Apple

### Why This Happens
When you create or edit an IAP product in App Store Connect and save it, Apple automatically puts it in a "Waiting for Review" status. This prevents sandbox testing until the product is approved.

---

## 🚨 API Parameter Error: "skus is required" (FIXED)

### What Happened
During initial testing, the app was throwing an error: `"\"skus\" is required"`

This was caused by the `getProducts()` function in `react-native-iap` v13.0.4 using a multiple-attempt fallback pattern that was incompatible with the v13.x API validation.

### The Fix
The code has been updated to use the correct and only valid API signature for v13.x:

```typescript
// ✅ CORRECT for react-native-iap v13.x
const products = await getProducts({ skus: IOS_PRODUCT_IDS });
```

**What was removed:** Multiple fallback attempts that were causing validation errors

**What was added:**
- Direct API call with correct signature
- Validation logging for the product IDs array
- Defensive checks to ensure the array is valid

### If You See This Error Again
This should no longer occur with the updated code. If you do see it:
1. Verify `IOS_PRODUCT_IDS` is not empty (check console logs)
2. Ensure `react-native-iap` v13.0.4 is properly installed
3. Check that the native modules are linked correctly

---

## 🔍 Diagnostic Checklist

### Step 1: Check Product Status in App Store Connect

1. Log into [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to: **Your App → Features → In-App Purchases**
3. Find product: `com.eyeszen.antonchepur.app.dailyfive`
4. Check the status column:

| Status | Can Test on Device? | Solution |
|--------|-------------------|----------|
| ✅ Ready to Submit | YES | No action needed |
| ✅ Approved | YES | No action needed |
| ❌ Waiting for Review | NO | See solutions below |
| ❌ Pending Review | NO | Wait for Apple review |
| ❌ Draft | NO | Submit for review |
| ❌ Rejected | NO | Fix issues and resubmit |

### Step 2: Verify Product ID Matches Exactly

**In App Store Connect:** `com.eyeszen.antonchepur.app.dailyfive`

**In Code ([iapService.ts:41](src/services/iapService.ts#L41)):**
```typescript
PREMIUM_VIDEOS: 'com.eyeszen.antonchepur.app.dailyfive'
```

**In StoreKit Config ([EyeZen.storekit:18](ios/EyeZen.storekit#L18)):**
```json
"productID": "com.eyeszen.antonchepur.app.dailyfive"
```

⚠️ Product IDs are **case-sensitive** and must match **exactly** (no spaces, no typos).

### Step 3: Verify Sandbox Account on Device

1. On your iOS device, open **Settings**
2. Scroll down to **App Store**
3. Find the **"Sandbox Account"** section (below your Apple ID)
4. Ensure you're signed in with a sandbox tester email
5. **Important:** Sign OUT of your regular Apple ID at the top before testing

Common mistakes:
- ❌ Using regular Apple ID instead of sandbox tester
- ❌ Not signed into sandbox account at all
- ❌ Sandbox account not fully activated (can take a few minutes)

### Step 4: Check Console Logs in Xcode

Run your app with Xcode attached and check the console for detailed diagnostics:

**Success Pattern:**
```
🛒 Fetching products with IDs: ["com.eyeszen.antonchepur.app.dailyfive"]
📱 Platform: ios
🔧 IAP Module Available: true
✅ Successfully fetched 1 products from App Store
```

**Failure Pattern (No Products):**
```
🛒 Fetching products with IDs: ["com.eyeszen.antonchepur.app.dailyfive"]
✅ Successfully fetched 0 products from App Store

⚠️  NO PRODUCTS RETURNED FROM APP STORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Possible causes:
  1. ❌ Product status is "Waiting for Review" or "Pending" in App Store Connect
```

---

## 🛠 Solutions

### Solution 1: Use iOS Simulator with StoreKit Configuration (Recommended for Development)

While waiting for App Store Connect approval, you can test IAP functionality in the iOS Simulator:

#### Configure Xcode Scheme:
1. Open `EyeZen.xcworkspace` in Xcode
2. Click scheme dropdown (next to device selector) → **"Edit Scheme..."**
3. Select **"Run"** from left sidebar
4. Go to **"Options"** tab
5. Under **"StoreKit Configuration"**, select **`EyeZen.storekit`**
6. Click **"Close"**

#### Test in Simulator:
- Select any iOS Simulator (iPhone 15, etc.)
- Run the app (`Cmd + R`)
- The IAP will show **$2.99 pricing** from the StoreKit configuration file
- Purchases will complete successfully in a simulated environment

**Pros:**
- ✅ Immediate testing without waiting for Apple approval
- ✅ No sandbox account needed
- ✅ Can test purchase flow, success/error states
- ✅ Full control over pricing and product details

**Cons:**
- ❌ Doesn't test real App Store integration
- ❌ Doesn't validate sandbox account setup

### Solution 2: Wait for App Store Connect Approval

If you submitted your product for review:

1. **Timeline:** Apple typically reviews IAP products within 1-3 business days
2. **Check Status:** Log into App Store Connect daily to monitor progress
3. **Email Notifications:** Apple will email you when status changes
4. **After Approval:** Product status will change to "Approved" and sandbox testing will work immediately

### Solution 3: Delete and Recreate Product (If Not Yet Submitted with App)

⚠️ **Warning:** Only do this if the product has NOT been submitted with your app binary.

If your product is stuck in "Waiting for Review" and you haven't submitted it with an app version:

1. In App Store Connect, go to your product
2. Click **"Delete In-App Purchase"**
3. Create a new product with the **exact same Product ID**
4. Fill in all required information
5. **Do NOT save as final** - keep it in "Draft" mode
6. The draft product should work for sandbox testing

**Alternative:** Contact Apple Developer Support to reset the product status.

### Solution 4: Check for Propagation Delays

If you just created the product:

- **Wait 2-4 hours** for Apple's servers to propagate the product information
- Clear app data and reinstall
- Sign out and back into sandbox account
- Restart your device

---

## 📋 App Store Connect Best Practices

### Creating IAP Products the Right Way

To avoid the "Waiting for Review" issue in the future:

#### 1. Create Product in Draft Mode
- Fill in all required information
- Product ID: `com.eyeszen.antonchepur.app.dailyfive`
- Type: Non-Consumable
- Reference Name: "Premium Access"
- Price: $2.99 (or your desired price)

#### 2. Keep it in Draft Until Ready
- Products in "Draft" mode can be tested in sandbox
- Only submit for review when you're ready to release

#### 3. Submit for Review at the Right Time
- Submit IAP products for review **at the same time** as your app binary
- This ensures they're approved together
- Reduces the chance of approval mismatches

#### 4. Use StoreKit Configuration for Development
- Always maintain an up-to-date `.storekit` file
- Keep product IDs, prices, and descriptions synchronized
- Test in simulator before testing on device

---

## 🔧 Enhanced Debugging (Already Implemented)

Your app now has enhanced error logging that will help diagnose issues:

### Console Logs to Watch For:

**Product Fetch Success:**
```
🛒 Fetching products with IDs: [...]
✅ Successfully fetched 1 products from App Store
```

**Product Fetch Failure (Detailed):**
```
⚠️  NO PRODUCTS RETURNED FROM APP STORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Possible causes:
  1. ❌ Product status is "Waiting for Review" or "Pending" in App Store Connect
     → Products must be "Ready to Submit" or "Approved" for sandbox testing
     → Check: https://appstoreconnect.apple.com → In-App Purchases
  [... more diagnostic info ...]
```

**Error with Details:**
```
❌ ERROR FETCHING PRODUCTS FROM APP STORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Error Details:
  Code: [error code]
  Message: [error message]
  Product IDs attempted: [...]
```

### User-Facing Error Messages

The app now shows helpful error messages with specific guidance:

```
Pricing unavailable. Most common cause: Product status is "Waiting for Review"
in App Store Connect. Products must be "Ready to Submit" or "Approved" for
sandbox testing.

Alternative: Test on iOS Simulator with StoreKit Configuration.

Other checks:
• Product IDs match in App Store Connect
• Signed into Settings → App Store → Sandbox Account
• Product created 2-4 hours ago (propagation delay)
```

---

## 🎯 Quick Reference: Testing Environments

### Testing on Physical Device (Real App Store Connection)

**Requirements:**
- ✅ Product status: "Ready to Submit" or "Approved"
- ✅ Signed in with Sandbox tester (Settings → App Store → Sandbox Account)
- ✅ Signed OUT of regular Apple ID
- ✅ Product IDs match exactly
- ✅ Internet connection

**Limitations:**
- ❌ Products in "Waiting for Review" will NOT show pricing
- ❌ Products in "Draft" may not work consistently

### Testing on iOS Simulator (StoreKit Configuration)

**Requirements:**
- ✅ StoreKit configuration file exists: `ios/EyeZen.storekit`
- ✅ Xcode scheme configured to use StoreKit configuration
- ✅ Product IDs match between code and `.storekit` file

**Capabilities:**
- ✅ Full purchase flow testing
- ✅ Customizable pricing and products
- ✅ Error simulation for edge cases
- ✅ No App Store Connect dependency
- ✅ No sandbox account needed

**Limitations:**
- ❌ Doesn't test real App Store integration
- ❌ Doesn't validate receipts with Apple servers

---

## 📞 Need More Help?

### Check These Files:
- **IAP Service:** [src/services/iapService.ts](src/services/iapService.ts)
- **Purchase Context:** [src/contexts/PurchaseContext.tsx](src/contexts/PurchaseContext.tsx)
- **StoreKit Config:** [ios/EyeZen.storekit](ios/EyeZen.storekit)
- **Setup Guide:** [IAP_SETUP_GUIDE.md](IAP_SETUP_GUIDE.md)

### Apple Resources:
- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Support](https://developer.apple.com/contact/)
- [StoreKit Testing Documentation](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox)

### Common Error Codes:

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `E_IAP_NOT_AVAILABLE` | IAP not available (simulator without StoreKit) | Enable StoreKit configuration or test on device |
| `E_UNKNOWN` | Product not found | Check product ID and App Store Connect status |
| `E_USER_CANCELLED` | User cancelled purchase | Normal behavior, no action needed |
| `E_NETWORK_ERROR` | Network connectivity issue | Check internet connection |
| `"skus" is required` | API parameter validation error | **FIXED:** Code now uses correct v13.x API signature |
| Empty products array | Products not returned from store | Most likely "Waiting for Review" status |

---

## ✅ Current Implementation Status

Your app now includes:

1. ✅ **Enhanced Console Logging**
   - Detailed diagnostics in [iapService.ts:124-195](src/services/iapService.ts#L124-L195)
   - Specific error messages for each failure scenario
   - Platform and module availability checks

2. ✅ **Improved User Error Messages**
   - Status-specific guidance in [PurchaseContext.tsx:186-194](src/contexts/PurchaseContext.tsx#L186-L194)
   - Clear explanation of "Waiting for Review" issue
   - Alternative testing methods suggested

3. ✅ **StoreKit Configuration Ready**
   - Configuration file: [ios/EyeZen.storekit](ios/EyeZen.storekit)
   - Product ID: `com.eyeszen.antonchepur.app.dailyfive`
   - Price: $2.99
   - Just needs Xcode scheme configuration (manual step)

4. ✅ **Retry Functionality**
   - Users can tap "Retry" button to reload products
   - Helpful after fixing App Store Connect configuration

---

**Last Updated:** 2025-11-20
