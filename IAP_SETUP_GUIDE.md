# iOS In-App Purchase Setup Guide for EyeZen

This guide will walk you through setting up in-app purchases for your EyeZen app from scratch.

## Overview

Your app now supports a **one-time, non-consumable** in-app purchase that unlocks:
- **Free users**: 1 video per day
- **Premium users**: 5 videos per day

**Product ID**: `com.eyezen.dailyfive`

---

## Part 1: Xcode Configuration

### Step 1: Enable In-App Purchase Capability

1. Open your project in Xcode:
   ```bash
   cd ios
   open EyeZen.xcworkspace
   ```

2. Select your project in the left sidebar (the blue icon at the top)

3. Select your app target (usually same name as your project)

4. Go to the **"Signing & Capabilities"** tab

5. Click the **"+ Capability"** button

6. Search for and add **"In-App Purchase"**

### Step 2: Verify Bundle Identifier

1. In the **"General"** tab, note your **Bundle Identifier**
   - Example: `com.yourdomain.eyezen`
   - This must match what you use in App Store Connect

---

## Part 2: App Store Connect Setup

### Step 1: Create Your App (if not already created)

1. Go to [App Store Connect](https://appstoreconnect.apple.com)

2. Sign in with your Apple Developer account

3. Click **"My Apps"**

4. Click the **"+"** button → **"New App"**

5. Fill in the details:
   - **Platform**: iOS
   - **Name**: EyeZen (or your app name)
   - **Primary Language**: English
   - **Bundle ID**: Select the bundle ID from Xcode
   - **SKU**: Any unique identifier (e.g., `eyezen-2024`)
   - **User Access**: Full Access

6. Click **"Create"**

### Step 2: Create the In-App Purchase Product

1. In your app's page, click on **"In-App Purchases"** in the left sidebar

2. Click the **"+"** button or **"Create"**

3. Select **"Non-Consumable"** (since this is a lifetime unlock)

4. Fill in the **Reference Name**:
   - Example: `Premium Video Access`
   - This is only visible to you, not users

5. Fill in the **Product ID**:
   - **IMPORTANT**: Must be exactly: `com.eyezen.dailyfive`
   - This must match what's in your code!

6. Click **"Create"**

### Step 3: Configure Product Details

1. **Pricing**:
   - Click **"Price Schedule"** → **"Add Pricing"**
   - Select your price tier (e.g., $2.99 is Tier 3)
   - Click **"Next"** → **"Confirm"**

2. **App Store Localization**:
   - Click **"App Store Localization"** → **"Add Localization"**
   - Select **"English (U.S.)"**
   - **Display Name**: `Premium Access` (shown to users in purchase dialog)
   - **Description**: `Unlock 5 videos per day with lifetime premium access`
   - Click **"Save"**

3. **Review Information**:
   - **Screenshot**: Upload a simple screenshot showing the premium feature
     - Can be a screenshot of your app showing "Premium: 5 videos"
     - Minimum size: 640x920 pixels
   - **Review Notes**: Optional notes for Apple reviewers

4. Click **"Save"** in the top right

5. Click **"Submit for Review"** (Blue button)
   - Note: The product won't work until approved, but you can test with sandbox

---

## Part 3: Create Sandbox Test Account

Sandbox accounts let you test purchases without real money.

### Step 1: Create Sandbox Tester

1. In App Store Connect, click your name in the top right

2. Select **"Users and Access"**

3. Click the **"Sandbox Testers"** tab (under "Sandbox" section)

4. Click the **"+"** button

5. Fill in the details:
   - **First Name**: Test
   - **Last Name**: User
   - **Email**: Create a NEW email (e.g., `test@yourdomain.com`)
     - This email doesn't need to exist, but must be unique
     - Don't use your real Apple ID!
   - **Password**: Create a strong password (save it!)
   - **Country**: United States (or your region)
   - **App Store Territory**: United States

6. Click **"Create"**

### Step 2: Configure Your iPhone/Simulator for Testing

**On Physical Device:**

1. Go to **Settings** → **App Store**

2. Scroll down to **"Sandbox Account"**

3. Tap **"Sign In"**

4. Enter the sandbox tester credentials you just created

5. **Important**: Make sure you're signed OUT of the regular App Store
   - Settings → [Your Name] → Sign Out (only for testing)

**On Simulator:**

1. The simulator will prompt you to sign in when you make a test purchase

2. Use your sandbox tester credentials when prompted

---

## Part 4: Testing Your Implementation

### Step 1: Run Your App

1. Install the app on your device or simulator:
   ```bash
   # Make sure you're in the root directory
   npx react-native run-ios
   ```

2. Wait for the app to launch

### Step 2: Test Free User Experience

1. On the Home screen, you should see:
   - "Free Plan" card
   - "1 video remaining today" (or similar)

2. Tap **"Start"** to watch a video

3. Close the video and return to Home

4. The counter should now show "0 / 1 videos left"

5. Try to watch again - you should see the **Purchase Modal**

### Step 3: Test Purchase Flow

1. In the Purchase Modal, tap **"Purchase Now"**

2. You'll see the iOS purchase dialog with your product details

3. A prompt will appear asking for your Apple ID
   - **Use your sandbox tester account** (not your real Apple ID!)

4. The purchase dialog may say "Environment: Sandbox" - this is normal

5. Confirm the purchase (it's free in sandbox mode)

6. You should see a success alert: "Purchase Successful!"

7. The Home screen should now show "Premium Active" with "5 / 5 videos left"

### Step 4: Test Restore Purchase

1. Delete the app from your device

2. Reinstall and run again

3. Go to Home screen - you should see "Free Plan" initially

4. Tap **"Upgrade to Premium"** → **"Restore Purchase"**

5. Your premium status should be restored

---

## Part 5: Troubleshooting

### Problem: "Cannot connect to iTunes Store"

**Solution:**
- Make sure you're using a sandbox tester account
- Check that your device has internet connection
- Sign out of your real Apple ID in Settings → App Store
- Sometimes it takes a few minutes for new sandbox accounts to activate

### Problem: "Product not found" or products array is empty

**Solution:**
- Verify the product ID is exactly `com.eyezen.dailyfive`
- Check that the product exists in App Store Connect
- Make sure you clicked "Save" on the product in App Store Connect
- Wait a few hours - new products can take time to propagate
- Check your app's bundle ID matches what's in App Store Connect

### Problem: "This In-App Purchase has already been bought"

**Solution:**
- This is normal in sandbox mode
- Just tap "OK" - the purchase will still go through
- You can tap "Restore Purchase" to reactivate premium

### Problem: Purchase completes but premium doesn't unlock

**Solution:**
- Check the console logs in Xcode for error messages
- Verify the `finishTransaction` is being called
- Check AsyncStorage to see if the flag was saved:
  ```javascript
  // In your code, temporarily add:
  import AsyncStorage from '@react-native-async-storage/async-storage';
  AsyncStorage.getItem('@eyezen_is_premium').then(console.log);
  ```

### Problem: Xcode build errors about missing frameworks

**Solution:**
- Clean build folder: Xcode → Product → Clean Build Folder
- Delete DerivedData:
  ```bash
  rm -rf ~/Library/Developer/Xcode/DerivedData
  ```
- Reinstall pods:
  ```bash
  cd ios
  pod install
  cd ..
  ```

---

## Part 6: Production Checklist

Before submitting to the App Store:

- [ ] In-app purchase product is **approved** in App Store Connect
- [ ] Tested purchase flow with sandbox account
- [ ] Tested restore purchase functionality
- [ ] Tested daily limit reset logic
- [ ] Added privacy policy (required by Apple for apps with purchases)
- [ ] Completed App Store listing with screenshots
- [ ] Set up tax and banking information in App Store Connect
- [ ] Reviewed App Store guidelines for in-app purchases

---

## Important Notes

1. **Sandbox vs Production:**
   - Sandbox testing uses fake money
   - Production uses real money from users
   - Always test thoroughly in sandbox first!

2. **Review Process:**
   - Your in-app purchase must be approved by Apple before it works in production
   - This usually takes 1-3 days
   - Your app and the IAP are reviewed separately

3. **Price Changes:**
   - You can change the price anytime in App Store Connect
   - Price changes are immediate for new purchases
   - Existing purchasers keep their access

4. **Receipt Validation:**
   - For production, consider adding server-side receipt validation
   - This prevents piracy and ensures purchases are legitimate
   - Current implementation uses client-side validation (simpler but less secure)

---

## Code Architecture Summary

Your implementation consists of:

1. **`src/services/storageService.ts`** - AsyncStorage wrapper for persistent data
2. **`src/services/iapService.ts`** - In-app purchase logic using react-native-iap
3. **`src/contexts/PurchaseContext.tsx`** - Global state management for purchases
4. **`src/hooks/useVideoLimit.ts`** - Custom hook for video limit logic
5. **`src/components/PurchaseModal.tsx`** - Purchase UI modal
6. **`src/components/PremiumStatus.tsx`** - Premium status display
7. **`App.tsx`** - Wrapped with PurchaseProvider
8. **`src/screens/HomeScreen.tsx`** - Shows premium status
9. **`src/screens/VideoScreen.tsx`** - Enforces video limits

> **Heads up:** If you ever hit the `[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null` runtime error, the app now falls back to an in-memory storage shim so it can keep running. In that mode the watch counters reset whenever the app reloads, so make sure to run a clean native build (`cd ios && pod install`, rebuild Android, etc.) to restore the real `@react-native-async-storage/async-storage` module and regain persistence.

---

## Support Resources

- [Apple In-App Purchase Documentation](https://developer.apple.com/in-app-purchase/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [react-native-iap Documentation](https://github.com/dooboolab-community/react-native-iap)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## Quick Command Reference

```bash
# Run on iOS device
npx react-native run-ios --device

# Run on specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"

# View iOS logs
npx react-native log-ios

# Clear AsyncStorage (for testing)
# Add this temporarily in your code:
# AsyncStorage.clear()

# Reinstall pods
cd ios && pod install && cd ..

# Clean and rebuild
cd ios && xcodebuild clean && cd ..
npx react-native run-ios
```

---

Good luck with your in-app purchase implementation! 🚀
