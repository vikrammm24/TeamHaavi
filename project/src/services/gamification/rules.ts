// Basic gamification rules & helpers
// This is a lightweight, front-end only placeholder implementation.

export type GamificationEvent =
  | 'ISSUE_REPORTED'
  | 'ISSUE_UPVOTED'
  | 'ISSUE_RESOLVED'
  | 'DAILY_LOGIN'
  | 'FIRST_REPORT';

export interface EventAwardResult {
  points: number;
  badge?: string;
}

const EVENT_POINTS: Record<GamificationEvent, number> = {
  ISSUE_REPORTED: 10,
  ISSUE_UPVOTED: 2,
  ISSUE_RESOLVED: 20,
  DAILY_LOGIN: 5,
  FIRST_REPORT: 25,
};

const BADGE_THRESHOLDS: { name: string; points: number }[] = [
  { name: 'Bronze', points: 100 },
  { name: 'Silver', points: 300 },
  { name: 'Gold', points: 600 },
  { name: 'Platinum', points: 1000 },
];

export function getPointsForEvent(event: GamificationEvent): number {
  return EVENT_POINTS[event] ?? 0;
}

export function calculateBadge(totalPoints: number): string | undefined {
  let current: string | undefined;
  for (const b of BADGE_THRESHOLDS) {
    if (totalPoints >= b.points) current = b.name;
  }
  return current;
}

export function calculateLevel(totalPoints: number): number {
  // Simple linear level curve (every 100 pts = +1 level)
  return Math.floor(totalPoints / 100) + 1;
}

export function evaluateAward(
  event: GamificationEvent,
  existingPoints: number
): { points: number; newTotal: number; badge?: string; level: number } {
  const points = getPointsForEvent(event);
  const newTotal = existingPoints + points;
  const badge = calculateBadge(newTotal);
  const level = calculateLevel(newTotal);
  return { points, newTotal, badge, level };
}
