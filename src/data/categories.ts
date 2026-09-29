import type { CategoryInfo, Tier } from '../types';
import bankTitles from './questions/bank-stage-titles.json';

// 문제은행 파일에서 들여온 스테이지(4단계부터)의 제목을 기존 3개 뒤에 잇는다
function withBank(id: keyof typeof bankTitles, base: Record<Tier, string[]>): Record<Tier, string[]> {
  const extra = bankTitles[id] as Record<Tier, string[]>;
  return { basic: [...base.basic, ...extra.basic], mid: [...base.mid, ...extra.mid], advanced: [...base.advanced, ...extra.advanced] };
}

// 문제은행만 있는 섬은 1단계부터 은행의 스테이지로 채운다
function bankOnly(id: keyof typeof bankTitles): Record<Tier, string[]> {
  return bankTitles[id] as Record<Tier, string[]>;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'korean-history',
    name: '한국사',
    emoji: '🏛️',
    stageTitles: withBank('korean-history', {
      basic: ['고조선과 삼국', '통일신라와 고려', '조선의 시작'],
      mid: ['조선의 정치와 문화', '조선 후기의 변화', '개항과 대한제국'],
      advanced: ['일제강점기', '광복과 분단', '현대 한국'],
    }),
  },
  {
    id: 'world-history',
    name: '세계사',
    emoji: '🌍',
    stageTitles: withBank('world-history', {
      basic: ['4대 문명', '그리스와 로마', '중세 유럽'],
      mid: ['르네상스와 대항해', '시민혁명', '산업혁명'],
      advanced: ['제국주의와 1차 대전', '2차 대전', '냉전과 현대'],
    }),
  },
  {
    id: 'modern-history',
    name: '근현대사',
    emoji: '🕰️',
    stageTitles: bankOnly('modern-history'),
  },
  {
    id: 'science',
    name: '과학',
    emoji: '🔬',
    stageTitles: {
      basic: ['우리 몸', '동물과 식물', '날씨와 지구'],
      mid: ['물질과 화학', '힘과 에너지', '우주와 태양계'],
      advanced: ['빛과 파동', '유전과 진화', '원자와 전기'],
    },
  },
  {
    id: 'math',
    name: '수학',
    emoji: '➗',
    stageTitles: withBank('math', {
      basic: ['수와 단위', '도형의 기초', '비와 비율'],
      mid: ['방정식', '확률과 통계', '평면과 입체'],
      advanced: ['수의 성질', '함수와 그래프', '수학사와 상수'],
    }),
  },
  {
    id: 'music',
    name: '음악',
    emoji: '🎵',
    stageTitles: bankOnly('music'),
  },
  {
    id: 'art',
    name: '예술',
    emoji: '🎨',
    stageTitles: bankOnly('art'),
  },
  {
    id: 'current-affairs',
    name: '시사',
    emoji: '📰',
    stageTitles: bankOnly('current-affairs'),
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryInfo['id'], CategoryInfo>;
