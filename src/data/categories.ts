import type { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'korean-history',
    name: '한국사',
    emoji: '🏛️',
    stageTitles: {
      basic: ['고조선과 삼국', '통일신라와 고려', '조선의 시작'],
      mid: ['조선의 정치와 문화', '조선 후기의 변화', '개항과 대한제국'],
      advanced: ['일제강점기', '광복과 분단', '현대 한국'],
    },
  },
  {
    id: 'world-history',
    name: '세계사',
    emoji: '🌍',
    stageTitles: {
      basic: ['4대 문명', '그리스와 로마', '중세 유럽'],
      mid: ['르네상스와 대항해', '시민혁명', '산업혁명'],
      advanced: ['제국주의와 1차 대전', '2차 대전', '냉전과 현대'],
    },
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
    stageTitles: {
      basic: ['수와 단위', '도형의 기초', '비와 비율'],
      mid: ['방정식', '확률과 통계', '평면과 입체'],
      advanced: ['수의 성질', '함수와 그래프', '수학사와 상수'],
    },
  },
  {
    id: 'music',
    name: '음악',
    emoji: '🎵',
    stageTitles: {
      basic: ['악기와 소리', '음표와 박자', '노래의 종류'],
      mid: ['서양 고전음악', '한국 전통음악', '오페라와 발레'],
      advanced: ['시대별 작곡가', '화성과 조성', '현대 음악과 대중음악'],
    },
  },
  {
    id: 'art',
    name: '예술',
    emoji: '🎨',
    stageTitles: {
      basic: ['색과 그림', '유명한 그림', '조각과 건축'],
      mid: ['르네상스 미술', '인상주의', '한국 미술'],
      advanced: ['현대 미술', '사진과 영화', '미술관과 사조'],
    },
  },
  {
    id: 'current-affairs',
    name: '시사',
    emoji: '📰',
    stageTitles: {
      basic: ['우리나라 정치 제도', '생활 속 경제', '국제기구'],
      mid: ['경제 용어', '선거와 국회', '환경과 에너지'],
      advanced: ['국제 정치와 무역', '금융과 물가', '기술과 사회'],
    },
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryInfo['id'], CategoryInfo>;
