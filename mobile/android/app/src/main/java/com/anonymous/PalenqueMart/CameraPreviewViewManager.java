package com.anonymous.PalenqueMart;

import android.content.Context;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.util.Log;
import android.util.Size;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import com.pedro.common.ConnectChecker;
import com.pedro.encoder.input.video.CameraHelper;
import com.pedro.encoder.utils.gl.AspectRatioMode;
import com.pedro.library.rtmp.RtmpCamera2;
import com.pedro.library.view.OpenGlView;

public class CameraPreviewViewManager extends SimpleViewManager<OpenGlView> implements ConnectChecker {
  public static final String REACT_CLASS = "CameraPreview";
  private static final String TAG = "CameraPreviewViewManager";

  private RtmpCamera2 rtmpCamera2;
  private OpenGlView openGlView;
  private String cameraType = "back"; // Default to back camera

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @ReactProp(name = "camera")
  public void setCamera(OpenGlView view, String type) {
    if (type == null || type.isEmpty()) type = "back";
    Log.i(TAG, "Camera type set to: " + type);
    this.cameraType = type;
  }

  @NonNull
  @Override
  public OpenGlView createViewInstance(@NonNull ThemedReactContext context) {
    openGlView = new OpenGlView(context);

    // ✅ Set aspect ratio mode to maintain native camera proportions
    openGlView.setAspectRatioMode(AspectRatioMode.NONE);
    // You can also try AspectRatioMode.Fill if you prefer cropping over black bars

    // ✅ Initialize RtmpCamera2 properly with OpenGlView
    rtmpCamera2 = new RtmpCamera2(openGlView, this);
    RtmpTestModule.setCameraInstance(rtmpCamera2);

    openGlView.getHolder().addCallback(new android.view.SurfaceHolder.Callback() {
      @Override
      public void surfaceCreated(@NonNull android.view.SurfaceHolder holder) {
        try {
          CameraManager manager = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
          String cameraId = getCameraId(manager, cameraType);
          if (cameraId == null) {
            Log.e(TAG, "❌ No suitable camera found for type: " + cameraType);
            return;
          }

          CameraCharacteristics characteristics = manager.getCameraCharacteristics(cameraId);
          StreamConfigurationMap map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
          Size[] sizes = map.getOutputSizes(android.view.SurfaceHolder.class);

          // ✅ Dynamically select the best portrait resolution
          Size bestSize = new Size(720, 1280); // fallback
          for (Size size : sizes) {
            if (size.getHeight() > size.getWidth() && 
                size.getWidth() * size.getHeight() > bestSize.getWidth() * bestSize.getHeight()) {
              bestSize = size;
            }
          }

          int width = bestSize.getWidth();
          int height = bestSize.getHeight();
          int fps = 30;
          int bitrate = 1200 * 1000;

          // ... inside surfaceCreated()
          int rotation = CameraHelper.getCameraOrientation(context); // correct rotation for device/display

          Log.i(TAG, "Using camera width: " + width + " and height: " + height + " with encoder rotation: " + rotation);

          // Prepare with rotation (Camera2Base will handle swapping internally)
          boolean preparedVideo = rtmpCamera2.prepareVideo(height, width, fps, bitrate, 2, rotation);
          boolean preparedAudio = rtmpCamera2.prepareAudio(128000, 44100, true);

          if (!preparedVideo || !preparedAudio) {
            Log.e(TAG, "prepare failed");
            return;
          }

          // start preview with facing + rotation (choose overload that accepts rotation)
          rtmpCamera2.startPreview(getFacingFromType(cameraType), width, height, rotation);

          Log.i(TAG, "Using stream width: " + rtmpCamera2.getStreamWidth() + " and height: " + rtmpCamera2.getStreamHeight() + " with rotation of: " + rotation);

        } catch (CameraAccessException e) {
          Log.e(TAG, "Camera access error", e);
        } catch (Exception e) {
          Log.e(TAG, "Error initializing camera preview", e);
        }
      }

      @Override
      public void surfaceChanged(@NonNull android.view.SurfaceHolder holder, int format, int width, int height) {}

      @Override
      public void surfaceDestroyed(@NonNull android.view.SurfaceHolder holder) {
        if (rtmpCamera2 != null && !rtmpCamera2.isStreaming()) {
          Log.i(TAG, "🛑 Stopping camera preview...");
          rtmpCamera2.stopPreview();
        }
      }
    });

    return openGlView;
  }

  private String getCameraId(CameraManager manager, String type) throws CameraAccessException {
    for (String cameraId : manager.getCameraIdList()) {
      CameraCharacteristics characteristics = manager.getCameraCharacteristics(cameraId);
      Integer lensFacing = characteristics.get(CameraCharacteristics.LENS_FACING);
      if ("front".equalsIgnoreCase(type) && lensFacing == CameraCharacteristics.LENS_FACING_FRONT) {
        return cameraId;
      } else if ("back".equalsIgnoreCase(type) && lensFacing == CameraCharacteristics.LENS_FACING_BACK) {
        return cameraId;
      }
    }
    return null;
  }

  private CameraHelper.Facing getFacingFromType(String type) {
    return "front".equalsIgnoreCase(type) ? CameraHelper.Facing.FRONT : CameraHelper.Facing.BACK;
  }

  // --- ConnectChecker logs for debugging ---
  @Override public void onConnectionStarted(String s) { Log.d(TAG, "Connection started: " + s); }
  @Override public void onConnectionSuccess() { Log.d(TAG, "Connection success"); }
  @Override public void onConnectionFailed(String s) { Log.e(TAG, "Connection failed: " + s); }
  @Override public void onDisconnect() { Log.d(TAG, "Disconnected"); }
  @Override public void onAuthError() { Log.e(TAG, "Auth error"); }
  @Override public void onAuthSuccess() { Log.d(TAG, "Auth success"); }
  @Override public void onNewBitrate(long bitrate) { Log.d(TAG, "Bitrate: " + bitrate); }
}
