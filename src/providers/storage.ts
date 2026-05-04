// 어드민 인증 토큰은 sessionStorage에 저장한다.
// - 탭/창 종료 시 자동 폐기되어 공용 PC에서의 잔존 위험을 줄인다.
// - 동일 도메인이라도 다른 탭에서 직접 접근 불가.
// 단, XSS 발생 시에는 sessionStorage도 동일하게 노출된다 (XSS 방어는 별도 책임).

export const tokenStorage = {
  get(key: string): string | null {
    return sessionStorage.getItem(key);
  },
  set(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  },
  remove(key: string): void {
    sessionStorage.removeItem(key);
  },
};
