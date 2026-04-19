'use client';

import { ActiveGoalBanner } from './ActiveGoalBanner';
import { GoalSuggestionCard } from './GoalSuggestionCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GoalDashboardWidget({ activeGoal, suggestedGoal }: { activeGoal: any; suggestedGoal: any }) {
  if (activeGoal) {
    return <ActiveGoalBanner goal={activeGoal} />;
  }

  return <GoalSuggestionCard goal={suggestedGoal} />;
}
