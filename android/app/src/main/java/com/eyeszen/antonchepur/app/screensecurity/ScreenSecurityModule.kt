package com.eyeszen.antonchepur.app.screensecurity

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ScreenSecurityModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val mainHandler = Handler(Looper.getMainLooper())

  override fun getName(): String = "ScreenSecurity"

  private fun withActivity(action: (Activity) -> Unit) {
    val activity = currentActivity ?: return
    if (Looper.myLooper() == Looper.getMainLooper()) {
      action(activity)
    } else {
      mainHandler.post { action(activity) }
    }
  }

  @ReactMethod
  fun enable() {
    withActivity { activity ->
      activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }
  }

  @ReactMethod
  fun disable() {
    withActivity { activity ->
      activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }
  }
}
