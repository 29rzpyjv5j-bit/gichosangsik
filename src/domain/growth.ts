export type GrowthStage = {
  index: 0 | 1 | 2 | 3 | 4;
  name: string;
  fromLevel: number;
};

// 레벨이 오르면 펭귄이 자란다. 레벨 15단계를 성장 5단계로 묶는다.
export const GROWTH_STAGES: GrowthStage[] = [
  { index: 0, name: '알', fromLevel: 1 },
  { index: 1, name: '아기 펭귄', fromLevel: 3 },
  { index: 2, name: '꼬마 펭귄', fromLevel: 6 },
  { index: 3, name: '펭귄', fromLevel: 10 },
  { index: 4, name: '박사 펭귄', fromLevel: 13 },
];

export function growthStageOf(level: number): GrowthStage {
  let current = GROWTH_STAGES[0];
  for (const stage of GROWTH_STAGES) {
    if (level >= stage.fromLevel) current = stage;
  }
  return current;
}

export function nextGrowthStage(level: number): GrowthStage | null {
  return GROWTH_STAGES.find((stage) => stage.fromLevel > level) ?? null;
}
