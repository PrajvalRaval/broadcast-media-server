const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const wss = require("websocket-stream");
const { Server } = require("ws");
const WebSocketServer = new Server({
  port: process.env.PORT || 8000,
  perMessageDeflate: false,
});

ffmpeg.setFfmpegPath(ffmpegPath);

WebSocketServer.on("connection", function (websocket, req) {
  const name = req.url.replace("/", "");
  console.log(name);
  if (!name) {
    return websocket.terminate();
  }
  const stream = wss(websocket);
  const encoder = ffmpeg()
    .input(stream)
    .videoCodec("libx264")
    .audioCodec("libmp3lame")
    .outputFPS(30)
    .addOption("-preset:v", "ultrafast")
    .videoBitrate("500k")
    .audioBitrate("128k")
    .size("?x720")
    .addOption("-f", "flv")
    .on("error", function (err) {
      console.log(`Error: ${err.message}`);
    })
    .save(`rtmp://a.rtmp.youtube.com/live2/${name}`, function (stdout) {
      console.log(`Convert complete${stdout}`);
    });
    websocket.on("err", () => {
      console.log('err', err);
    });
  websocket.on("close", () => {
    encoder.kill();
  });
});

console.log(`Listening on port ${process.env.PORT || 8000}`);
