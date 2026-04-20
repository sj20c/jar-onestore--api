/**
 * userService.ts
 * 게임 유저 조회 및 구매 가능 여부 확인 서비스
 *
 * JAR 게임의 실제 DB/로직에 맞게 구현합니다.
 * 아래는 인터페이스와 구조 예시입니다.
 */

// ── Types ──────────────────────────────────────────────

export interface GameUser {
  userId: string;
  serverId?: string;
  nickname: string;
  level: number;
  isActive: boolean;
}

export interface PurchaseCheckParams {
  userId: string;
  serverId?: string;
  clientId: string;
  prodId: string;
}

export interface PurchaseCheckResult {
  canPurchase: boolean;
  reason: string;
}

// ── 구매 제한 정책 ─────────────────────────────────────

/** 상품별 최대 구매 횟수 (0 = 무제한) */
const PURCHASE_LIMIT: Record<string, number> = {
  item1000: 1,   // 1회 한정 상품 (예: 스타터 팩)
  item2000: 5,   // 최대 5회
  item3000: 0,   // 무제한
};

// ── 유저 조회 ──────────────────────────────────────────

/**
 * serviceUserId로 게임 유저를 조회합니다.
 * JAR 게임은 서버 구분이 없으므로 serviceServerId는 Optional
 */
export async function findUser(
  serviceUserId: string,
  serviceServerId?: string,
): Promise<GameUser | null> {
  // TODO: 실제 DB 조회로 교체
  // 예시:
  // const user = await db.users.findOne({ userId: serviceUserId });
  // return user ?? null;

  // ── 개발 예시 (하드코딩) ──────────────────────────────
  const mockUsers: GameUser[] = [
    { userId: 'USR1234567890', serverId: 'asia01', nickname: '닌자', level: 10, isActive: true },
    { userId: 'USR0000000001', serverId: undefined, nickname: '테스터', level: 1, isActive: true },
  ];

  const user = mockUsers.find((u) => {
    const idMatch = u.userId === serviceUserId;
    // 서버 ID가 전달된 경우에만 서버 검증
    const serverMatch = serviceServerId ? u.serverId === serviceServerId : true;
    return idMatch && serverMatch;
  });

  return user ?? null;
}

// ── 구매 가능 여부 확인 ────────────────────────────────

/**
 * 아이템 구매 가능 여부를 확인합니다.
 * - 구매 횟수 초과
 * - 이미 보유 중인 아이템
 * - 이벤트 기간 종료 등
 */
export async function checkPurchasable(
  params: PurchaseCheckParams,
): Promise<PurchaseCheckResult> {
  const { userId, prodId } = params;

  // TODO: 실제 구매 이력 DB 조회로 교체
  // 예시:
  // const purchaseCount = await db.purchases.count({ userId, prodId });

  const limit = PURCHASE_LIMIT[prodId] ?? 0; // 정책에 없으면 무제한

  if (limit > 0) {
    // TODO: DB에서 실제 구매 횟수 조회
    const purchaseCount = await getPurchaseCount(userId, prodId);

    if (purchaseCount >= limit) {
      return {
        canPurchase: false,
        reason:
          limit === 1
            ? '이미 구매한 상품입니다.'
            : '구매 가능한 횟수를 초과하였습니다.',
      };
    }
  }

  // 이벤트 기간 검사 예시
  const isEventExpired = await checkEventExpiry(prodId);
  if (isEventExpired) {
    return {
      canPurchase: false,
      reason: '이벤트 기간이 종료된 상품입니다.',
    };
  }

  return { canPurchase: true, reason: '' };
}

// ── 내부 헬퍼 ─────────────────────────────────────────

async function getPurchaseCount(userId: string, prodId: string): Promise<number> {
  // TODO: 실제 DB 조회
  void userId; void prodId;
  return 0;
}

async function checkEventExpiry(prodId: string): Promise<boolean> {
  // TODO: 실제 이벤트 기간 테이블 조회
  void prodId;
  return false;
}
