import crypto from 'crypto';

/**
 * 원스토어 Signature 검증
 *
 * 원스토어 가이드 기준:
 *   서명 대상 문자열 = param 필드를 알파벳 오름차순으로 정렬 후
 *   "key=value&key=value..." 형태로 연결한 뒤 라이선스 키로 HMAC-SHA256 서명
 *
 * 실제 서명 알고리즘은 원스토어 개발자센터 > 연동 관리 > Signature 검증 방법 가이드 참고
 */
export function validateSignature(
  param: Record<string, string | undefined>,
  signature: string,
): boolean {
  const licenseKey = process.env.ONESTORE_LICENSE_KEY;
  if (!licenseKey) {
    throw new Error('ONESTORE_LICENSE_KEY is not set');
  }

  // undefined 값 제거 후 키 정렬
  const sorted = Object.entries(param)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  const message = sorted.map(([k, v]) => `${k}=${v}`).join('&');

  const expected = crypto
    .createHmac('sha256', licenseKey)
    .update(message)
    .digest('base64');

  // 타이밍 공격 방지를 위해 timingSafeEqual 사용
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}
