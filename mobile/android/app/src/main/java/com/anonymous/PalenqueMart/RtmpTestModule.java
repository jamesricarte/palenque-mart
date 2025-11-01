package com.anonymous.PalenqueMart;

import android.util.Log;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.pedro.common.ConnectChecker;
import com.pedro.library.rtmp.RtmpCamera2;

public class RtmpTestModule extends ReactContextBaseJavaModule implements ConnectChecker {
  private static final String TAG = "RtmpTestModule";

  private final ReactApplicationContext reactContext;
  private static RtmpCamera2 rtmpCamera2; // Shared instance

  public RtmpTestModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "RtmpTestModule";
  }

  public static void setCameraInstance(RtmpCamera2 instance) {
    rtmpCamera2 = instance;
  }

  @ReactMethod
  public void startStream(String rtmpUrl, Promise promise) {
    try {
      if (rtmpCamera2 == null) {
        Log.i(TAG, "📵 Camera instance not ready");
        promise.reject("NO_CAMERA", "Camera instance not ready.");
        return;
      }

      if (!rtmpCamera2.isStreaming()) {
        rtmpCamera2.startStream(rtmpUrl);
        Log.i(TAG, "▶️ Started stream: " + rtmpUrl);
        promise.resolve("Streaming started");
      } else {
        Log.i(TAG, "🚫 Already streaming");
        promise.resolve("Already streaming");
      }

    } catch (Exception e) {
      Log.e(TAG, "startStream error", e);
      promise.reject("ERR", e);
    }
  }

  @ReactMethod
  public void stopStream(Promise promise) {
    if (rtmpCamera2 != null && rtmpCamera2.isStreaming()) {
      rtmpCamera2.stopStream();
      Log.i(TAG, "🛑 Stopped stream");
      promise.resolve("Stream stopped");
    } else {
      Log.i(TAG, "⚠️ No active stream to stop");
      promise.resolve("No active stream");
    }
  }

  @ReactMethod
  public void switchCamera(Promise promise) {
    try {
      if (rtmpCamera2 != null) {
        rtmpCamera2.switchCamera();
        promise.resolve("Camera switched");
      } else {
        promise.reject("NO_CAMERA", "No active camera found");
      }
    } catch (Exception e) {
      promise.reject("ERR", e);
    }
  }

  // --- Audio Controls ---
  @ReactMethod
  public void muteAudio(Promise promise) {
    if (rtmpCamera2 != null) {
      rtmpCamera2.disableAudio();
      Log.i(TAG, "🔇 Audio muted");
      promise.resolve("Audio muted");
    } else {
      promise.reject("NO_CAMERA", "No active camera found");
    }
  }

  @ReactMethod
  public void unmuteAudio(Promise promise) {
    if (rtmpCamera2 != null) {
      rtmpCamera2.enableAudio();
      Log.i(TAG, "🔈 Audio unmuted");
      promise.resolve("Audio unmuted");
    } else {
      promise.reject("NO_CAMERA", "No active camera found");
    }
  }

    @ReactMethod
  public void isMuted(Promise promise) {
    if (rtmpCamera2 != null) {
      boolean isMuted = rtmpCamera2.isAudioMuted();
      promise.resolve(isMuted);
    } else {
      promise.reject("NO_CAMERA", "No active camera found");
    }
  }

  // --- ConnectChecker logs ---
  @Override public void onConnectionStarted(String url) { Log.d(TAG, "Connection started: " + url); }
  @Override public void onConnectionSuccess() { Log.d(TAG, "Connection success"); }
  @Override public void onConnectionFailed(String reason) { Log.e(TAG, "Connection failed: " + reason); }
  @Override public void onDisconnect() { Log.d(TAG, "Disconnected"); }
  @Override public void onAuthError() { Log.e(TAG, "Auth error"); }
  @Override public void onAuthSuccess() { Log.d(TAG, "Auth success"); }
  @Override public void onNewBitrate(long bitrate) { Log.d(TAG, "Bitrate: " + bitrate); }
}
