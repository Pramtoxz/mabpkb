package com.mabpkb

import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "MABPKB"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (event.action == KeyEvent.ACTION_DOWN) {
      val keyName = when (event.keyCode) {
        KeyEvent.KEYCODE_VOLUME_DOWN -> "volumeDown"
        KeyEvent.KEYCODE_VOLUME_UP -> "volumeUp"
        else -> null
      }
      if (keyName != null) {
        val reactContext = reactDelegate?.currentReactContext
        if (reactContext != null) {
          val payload = Arguments.createMap().apply {
            putString("key", keyName)
          }
          reactContext.emitDeviceEvent("onHardwareKeyPress", payload)
        }
        return true // consume event, suppress system volume UI
      }
    }
    // For ACTION_UP on volume keys, also consume to prevent system volume change
    if (event.action == KeyEvent.ACTION_UP &&
        (event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || event.keyCode == KeyEvent.KEYCODE_VOLUME_UP)) {
      return true
    }
    return super.dispatchKeyEvent(event)
  }
}
