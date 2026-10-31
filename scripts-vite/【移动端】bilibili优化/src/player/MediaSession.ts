/**
 * 设置媒体会话信息
 *
 * Android（小米 HyperOS / MIUI）的媒体通知取的是 MediaSession 的 artwork，
 * 不设置的话只会显示默认图标，所以这里把视频封面同步过去
 * @param title 视频标题
 * @param cover 视频封面
 */
export const setBilibiliMediaSessionMetadata = (title?: string, cover?: string) => {
  if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") {
    return;
  }
  if (!title || !cover) {
    return;
  }
  // B站返回的封面可能是http，且可能带有@xxx的裁剪后缀
  const artwork = cover.replace(/^http:/, "https:").split("@")[0];
  navigator.mediaSession.metadata = new MediaMetadata({
    title: title,
    artist: "哔哩哔哩",
    // Android通知的封面尺寸是512x512，让B站图片服务裁剪成正方形
    artwork: [{ src: `${artwork}@512w_512h_1c.jpg`, sizes: "512x512", type: "image/jpeg" }],
  });
};
