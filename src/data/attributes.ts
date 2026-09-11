import { AttributeDefinition } from '../types';

export const ATTRIBUTE_DEFINITIONS: AttributeDefinition[] = [
  {
    key: 'gender',
    label: '성별',
    emoji: '👤',
    options: ['남학생', '여학생'],
  },
  {
    key: 'glasses',
    label: '안경 착용 여부',
    emoji: '👓',
    options: ['안경 씀', '안경 안 씀'],
  },
  {
    key: 'clothingColor',
    label: '즐겨 입는 옷 색상 계열',
    emoji: '👕',
    options: ['무채색(검정·흰·회색)', '유채색(파랑·빨강 등)', '파스텔·밝은색'],
  },
  {
    key: 'socksColor',
    label: '오늘 신은 양말 색깔',
    emoji: '🧦',
    options: ['흰색', '어두운색(검정·남색·회색)', '화려한 색·무늬'],
  },
  {
    key: 'mbtiStyle',
    label: '성향 (MBTI)',
    emoji: '⚡',
    options: ['E (활발·사교적)', 'I (차분·집중적)'],
  },
  {
    key: 'interest',
    label: '관심 있는 분야',
    emoji: '🎯',
    options: ['게임·e스포츠', 'K-POP·아이돌', '운동·스포츠', '만화·웹툰·애니', '창작·독서·요리'],
  },
  {
    key: 'subject',
    label: '자신 있거나 좋아하는 과목',
    emoji: '📚',
    options: ['수학·과학', '국어·사회·영어', '체육·음악·미술', '정보(컴퓨터)'],
  },
];

export function getQuestionText(attrKey: string, option: string): string {
  switch (attrKey) {
    case 'gender':
      return option === '남학생' ? '남학생인가요?' : '여학생인가요?';
    case 'glasses':
      return option === '안경 씀' ? '안경을 쓰고 있나요?' : '안경을 쓰지 않았나요?';
    case 'clothingColor':
      return `평소 즐겨 입는 옷 색이 "${option}" 인가요?`;
    case 'mbtiStyle':
      return option.startsWith('E')
        ? '활발하고 친구들과 어울리기 좋아하는 외향형(E)인가요?'
        : '차분하고 조용히 집중하기 좋아하는 내향형(I)인가요?';
    case 'socksColor':
      return `오늘 신은 양말 색깔이 "${option}" 인가요?`;
    case 'interest':
      return `가장 좋아하는 관심 분야가 "${option}" 인가요?`;
    case 'subject':
      return `가장 자신 있거나 좋아하는 과목이 "${option}" 인가요?`;
    default:
      return `${attrKey}의 값이 "${option}"인가요?`;
  }
}
