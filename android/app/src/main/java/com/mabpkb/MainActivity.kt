package com.mabpkb

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothProfile
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.input.InputManager
import android.os.Bundle
import android.view.InputDevice
import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity(), InputManager.InputDeviceListener {

  private var inputManager: InputManager? = null

  private val bluetoothReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      checkAndEmitStatus()
    }
  }

  override fun getMainComponentName(): String = "MABPKB"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    inputManager = getSystemService(Context.INPUT_SERVICE) as? InputManager
    inputManager?.registerInputDeviceListener(this, null)

    val filter = IntentFilter().apply {
      addAction(BluetoothDevice.ACTION_ACL_CONNECTED)
      addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED)
      addAction(BluetoothAdapter.ACTION_STATE_CHANGED)
      addAction(BluetoothAdapter.ACTION_CONNECTION_STATE_CHANGED)
    }
    try {
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
        registerReceiver(bluetoothReceiver, filter, Context.RECEIVER_EXPORTED)
      } else {
        registerReceiver(bluetoothReceiver, filter)
      }
    } catch (_: Exception) {}
  }

  override fun onDestroy() {
    super.onDestroy()
    inputManager?.unregisterInputDeviceListener(this)
    try {
      unregisterReceiver(bluetoothReceiver)
    } catch (_: Exception) {}
  }

  override fun onResume() {
    super.onResume()
    window.decorView.postDelayed({
      checkAndEmitStatus()
    }, 500)
  }

  override fun onInputDeviceAdded(deviceId: Int) {
    checkAndEmitStatus()
  }

  override fun onInputDeviceRemoved(deviceId: Int) {
    checkAndEmitStatus()
  }

  override fun onInputDeviceChanged(deviceId: Int) {
    checkAndEmitStatus()
  }

  private fun checkAndEmitStatus() {
    val isConnected = checkIsPedalConnected()
    val reactContext = reactDelegate?.currentReactContext
    if (reactContext != null) {
      val payload = Arguments.createMap().apply {
        putBoolean("connected", isConnected)
      }
      reactContext.emitDeviceEvent("onPedalStatusChange", payload)
    }
  }

  private fun checkIsPedalConnected(): Boolean {
    val adapter = try {
      BluetoothAdapter.getDefaultAdapter()
    } catch (_: Exception) {
      null
    }

    if (adapter == null || !adapter.isEnabled) {
      return false
    }

    val isBt = try {
      val profiles = intArrayOf(4)
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

    return isBt || isExternalInput
  }

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    val keyCode = event.keyCode
    if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
      if (event.action == KeyEvent.ACTION_DOWN && event.repeatCount == 0) {
        val keyName = if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) "volumeDown" else "volumeUp"
        reactDelegate?.currentReactContext?.let { context ->
          val payload = Arguments.createMap().apply {
            putString("key", keyName)
          }
          context.emitDeviceEvent("onHardwareKeyPress", payload)

          val statusPayload = Arguments.createMap().apply {
            putBoolean("connected", true)
          }
          context.emitDeviceEvent("onPedalStatusChange", statusPayload)
        }
      }
      return true
    }
    return super.dispatchKeyEvent(event)
  }

  override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
    if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
      return true
    }
    return super.onKeyDown(keyCode, event)
  }

  override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
    if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
      return true
    }
    return super.onKeyUp(keyCode, event)
  }
}


