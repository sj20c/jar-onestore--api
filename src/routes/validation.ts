import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { validateSignature } from '../utils/signature';
import { findUser, checkPurchasable } from '../services/userService';

const router = Router();

/**
 * POST /gameuser/check
 * 원스토어 웹샵 유효성 검증
 */
router.post('/check', async (req: Request, res: Response) => {
  const { param, signature } = req.body as ValidationRequest;

  // ── 1. 필수 파라미터 확인 ────────────────────────────
  if (!param?.clientId || !param?.prodId || !param?.serviceUserId || !signature) {
    return res.status(400).json({
      result: { code: '9999', message: 'Missing required parameters' },
    });
  }

  // ── 2. Signature 검증 ────────────────────────────────
  const isValidSig = validateSignature(param, signature);
  if (!isValidSig) {
    return res.status(401).json({
      result: { code: '9998', message: 'Invalid signature' },
    });
  }

  // ── 3. 유저 조회 (게임 ID = serviceUserId) ────────────
  const user = await findUser(param.serviceUserId, param.serviceServerId);
  if (!user) {
    // 비회원
    return res.status(200).json({
      result: { code: '1000', message: 'User not found' },
    } satisfies ValidationResponse);
  }

  // ── 4. 구매 가능 여부 검증 ────────────────────────────
  const purchaseCheck = await checkPurchasable({
    userId: param.serviceUserId,
    serverId: param.serviceServerId,
    clientId: param.clientId,
    prodId: param.prodId,
  });

  if (!purchaseCheck.canPurchase) {
    return res.status(200).json({
      result: { code: '1001', message: purchaseCheck.reason },
    } satisfies ValidationResponse);
  }

  // ── 5. 성공 ──────────────────────────────────────────
  // developerPayload: 이후 PNS 구매 검증에 사용할 식별자
  const developerPayload = generatePayload(param.serviceUserId, param.prodId);

  return res.status(200).json({
    result: { code: '0000', message: 'User found' },
    developerPayload,
  } satisfies ValidationResponse);
});

/** developerPayload 생성 (구매건 고유 식별자) */
function generatePayload(userId: string, prodId: string): string {
  const timestamp = Date.now();
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}:${prodId}:${timestamp}`)
    .digest('hex')
    .slice(0, 12)
    .toUpperCase();
  return `JAR_${hash}_${timestamp}`;
}

export default router;

// ── Types ─────────────────────────────────────────────

interface ValidationRequest {
  param: {
    clientId: string;
    prodId: string;
    serviceUserId: string;
    serviceServerId?: string;
  };
  signature: string;
}

interface ValidationResponse {
  result: {
    code: '0000' | '1000' | '1001' | '9998' | '9999';
    message: string;
  };
  developerPayload?: string;
}
