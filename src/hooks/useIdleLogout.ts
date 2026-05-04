import { useEffect } from "react";
import { TOKEN_KEY } from "../providers/constants";
import { tokenStorage } from "../providers/storage";

const USER_KEY = "refine-user";
const DEFAULT_IDLE_MS = 30 * 60 * 1000; // 30분
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
];

// 어드민 사용자가 일정 시간 비활성 상태일 때 세션을 강제 종료한다.
// - 자리 비움/공용 PC에서의 토큰 노출 시간을 제한한다.
// - 활동 이벤트(클릭/키/터치/스크롤)가 들어오면 타이머를 리셋한다.
export function useIdleLogout(idleMs: number = DEFAULT_IDLE_MS): void {
  useEffect(() => {
    let timer: number | undefined;

    const triggerLogout = () => {
      tokenStorage.remove(TOKEN_KEY);
      tokenStorage.remove(USER_KEY);
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    };

    const reset = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(triggerLogout, idleMs);
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, reset, { passive: true });
    });
    reset();

    return () => {
      if (timer) window.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, reset);
      });
    };
  }, [idleMs]);
}
