package com.anonymous.PalenqueMart;

import android.content.Context;
import com.pedro.library.rtmp.RtmpCamera2;
import com.pedro.common.ConnectChecker;

public class StreamManager {
  private static RtmpCamera2 instance;

  public static RtmpCamera2 getInstance(Context context, ConnectChecker checker) {
    if (instance == null) {
      instance = new RtmpCamera2(context, checker);
    }
    return instance;
  }

  public static void replaceInstance(RtmpCamera2 newInstance) {
    if (instance != null) {
      try {
        instance.stopStream();
        instance.stopPreview();
      } catch (Exception ignored) {}
    }
    instance = newInstance;
  }
}
