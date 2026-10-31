import type Artplayer from "artplayer";

/**
 * 修复部分 Android 机型点击全屏后短暂黑屏
 *
 * Chromium Android 在 requestFullscreen 时可能会自动暂停视频，
 * 这里记录点击全屏前的播放状态，等全屏切换完成后恢复播放；
 * 同时主动触发一次 resize，让视频重新计算尺寸
 */
const fixAndroidFullscreenBlackScreen = (art: Artplayer) => {
  /** 点击全屏前是否正在播放 */
  let wasPlaying = false;

  const recordPlayState = () => {
    wasPlaying = art.playing;
  };

  // 捕获阶段先记录，避免全屏过程中的自动暂停影响判断
  art.template.$player.addEventListener(
    "click",
    (event) => {
      const $target = event.target as HTMLElement | null;
      if ($target?.closest(".art-control-fullscreen, .art-control-fullscreenWeb")) {
        recordPlayState();
      }
    },
    true
  );
  art.template.$video.addEventListener("dblclick", recordPlayState, true);

  const resumeAfterFullscreen = () => {
    if (!wasPlaying) {
      return;
    }
    wasPlaying = false;
    const tryResume = () => {
      if (art.isDestroy) {
        return;
      }
      try {
        if (!art.playing && art.currentTime < (art.duration || Infinity)) {
          art.play().catch(() => {});
        }
        // 主动触发一次尺寸变化，避免视频画面停在旧尺寸上
        window.dispatchEvent(new Event("resize"));
      } catch {
        // 播放器可能已经被销毁
      }
    };
    setTimeout(tryResume, 0);
    setTimeout(tryResume, 300);
  };

  art.on("fullscreen", (state) => {
    if (state) {
      resumeAfterFullscreen();
    }
  });
  art.on("fullscreenWeb", (state) => {
    if (state) {
      resumeAfterFullscreen();
    }
  });
};

/**
 * artplayer初始化后调用
 */
export const ArtPlayerInit = (art: Artplayer) => {
  art.on("video:seeked", () => {
    if (!art.playing) {
      // 检测封面是否还显示
      // 隐藏封面
      art.template.$poster.style.display = "none";
    }
  });
  fixAndroidFullscreenBlackScreen(art);
};
