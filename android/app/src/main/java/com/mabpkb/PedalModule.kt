package com.mabpkb

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothProfile
import android.view.InputDevice
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PedalModule(private val reactCtx: ReactApplicationContext) : ReactContextBaseJavaModule(reactCtx) {

  override fun getName(): String = "PedalModule"

  @ReactMethod
  fun isPedalConnected(promise: Promise) {
    try {
      val adapter = try {
        BluetoothAdapter.getDefaultAdapter()
      } catch (_: Exception) {
        null
      }

      if (adapter == null || !adapter.isEnabled) {
        promise.resolve(false)
        return
      }

      val isBt = try {
        val profiles = intArrayOf(
          BluetoothProfile.A2DP,
          BluetoothProfile.HEADSET,
          4
        )
        profiles.any { adapter.getProfileConnectionState(it) == BluetoothProfile.STATE_CONNECTED }
      } catch (_: Exception) {
        false
      }

      val isExternalInput = try {
        val method = InputDevice::class.java.getMethod("isExternal")
        method.isAccessible = true
        InputDevice.getDeviceIds().any { id ->
          val dev = InputDevice.getDevice(id)
          if (dev != null && !dev.isVirtual && (dev.sources and InputDevice.SOURCE_KEYBOARD != 0)) {
            (method.invoke(dev) as? Boolean) == true
          } else {
            false
          }
        }
      } catch (_: Exception) {
        false
      }

      promise.resolve(isBt || isExternalInput)
    } catch (_: Exception) {
      promise.resolve(false)
    }
  }
}
