const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const activeWorkers = new Map(); // livestreamId -> { ff, audioPort, videoPort, sdpPath }

/**
 * Creates an SDP file for FFmpeg to read RTP streams from Janus
 * Assumes Opus (PT 111) for audio and VP8 (PT 100) for video
 */
function makeSDP({ audioPort, videoPort }) {
  return `v=0
o=- 0 0 IN IP4 127.0.0.1
s=Janus RTP Forward
c=IN IP4 127.0.0.1
t=0 0
m=audio ${audioPort} RTP/AVP 111
a=rtpmap:111 opus/48000/2
m=video ${videoPort} RTP/AVP 100
a=rtpmap:100 VP8/90000
`;
}

/**
 * Starts FFmpeg bridge that listens on UDP ports for RTP from Janus
 * and forwards to Livepeer via SRT
 */
function startFFmpegBridge({
  livestreamId,
  srtUrl,
  audioPort = 6002,
  videoPort = 6004,
}) {
  if (activeWorkers.has(livestreamId)) {
    throw new Error("FFmpeg already running for this livestream");
  }

  const tmpDir = os.tmpdir(); // system's temporary directory
  const sdpPath = path.join(tmpDir, `janus_forward_${livestreamId}.sdp`);

  // Write SDP file
  fs.writeFileSync(sdpPath, makeSDP({ audioPort, videoPort }));

  // Build FFmpeg arguments
  const ffmpegArgs = [
    // Allow reading file and udp/rtp protocols
    "-protocol_whitelist",
    "file,udp,rtp",
    "-fflags",
    "+genpts", // Generate presentation timestamps
    "-i",
    sdpPath, // Input SDP file
    // Video encoding
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-b:v",
    "2500k",
    "-maxrate",
    "2500k",
    "-bufsize",
    "5000k",
    "-pix_fmt",
    "yuv420p",
    "-g",
    "50", // GOP size
    // Audio encoding
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "44100",
    // Output format and destination
    "-f",
    "mpegts",
    srtUrl,
  ];

  console.log(`[FFmpeg Bridge] Starting for livestream ${livestreamId}`);
  console.log(
    `[FFmpeg Bridge] Audio port: ${audioPort}, Video port: ${videoPort}`
  );
  console.log(`[FFmpeg Bridge] SRT URL: ${srtUrl}`);

  // Spawn FFmpeg process
  const ff = spawn("ffmpeg", ffmpegArgs, { stdio: ["ignore", "pipe", "pipe"] });

  ff.stdout.on("data", (d) =>
    console.log(`[FFmpeg stdout][${livestreamId}] ${d}`)
  );
  ff.stderr.on("data", (d) =>
    console.log(`[FFmpeg stderr][${livestreamId}] ${d}`)
  );

  ff.on("close", (code, signal) => {
    console.log(
      `[FFmpeg Bridge] Exited for ${livestreamId} code=${code} signal=${signal}`
    );
    activeWorkers.delete(livestreamId);
    // Clean up SDP file
    try {
      fs.unlinkSync(sdpPath);
    } catch (e) {
      console.error(`[FFmpeg Bridge] Failed to delete SDP file: ${e.message}`);
    }
  });

  ff.on("error", (err) => {
    console.error(`[FFmpeg Bridge] Error for ${livestreamId}:`, err);
    activeWorkers.delete(livestreamId);
    try {
      fs.unlinkSync(sdpPath);
    } catch (e) {
      console.error(`[FFmpeg Bridge] Failed to delete SDP file: ${e.message}`);
    }
  });

  activeWorkers.set(livestreamId, { ff, audioPort, videoPort, sdpPath });

  return { audioPort, videoPort };
}

/**
 * Stops FFmpeg bridge for a livestream
 */
function stopFFmpegBridge(livestreamId) {
  const entry = activeWorkers.get(livestreamId);
  if (!entry) {
    console.log(
      `[FFmpeg Bridge] No active worker found for livestream ${livestreamId}`
    );
    return false;
  }

  console.log(`[FFmpeg Bridge] Stopping for livestream ${livestreamId}`);
  entry.ff.kill("SIGTERM");
  activeWorkers.delete(livestreamId);

  // Clean up SDP file
  try {
    fs.unlinkSync(entry.sdpPath);
  } catch (e) {
    console.error(`[FFmpeg Bridge] Failed to delete SDP file: ${e.message}`);
  }

  return true;
}

/**
 * Gets active worker info for a livestream
 */
function getActiveWorker(livestreamId) {
  return activeWorkers.get(livestreamId);
}

module.exports = {
  startFFmpegBridge,
  stopFFmpegBridge,
  getActiveWorker,
  activeWorkers,
};
