export type Gender = '남학생' | '여학생';
export type Glasses = '안경 씀' | '안경 안 씀';
export type ClothingColor = '무채색(검정·흰·회색)' | '유채색(파랑·빨강 등)' | '파스텔·밝은색';
export type MbtiStyle = 'E (활발·사교적)' | 'I (차분·집중적)';
export type SocksColor = '흰색' | '어두운색(검정·남색·회색)' | '화려한 색·무늬';
export type Interest = '게임·e스포츠' | 'K-POP·아이돌' | '운동·스포츠' | '만화·웹툰·애니' | '창작·독서·요리';
export type Subject = '수학·과학' | '국어·사회·영어' | '체육·음악·미술' | '정보(컴퓨터)';

export interface Student {
  id: string;
  name: string; // 실제 이름 (최종 정답으로 공개)
  nickname: string; // 활동 닉네임 (별명)
  gender: Gender;
  glasses: Glasses;
  clothingColor: ClothingColor;
  mbtiStyle: MbtiStyle;
  socksColor: SocksColor;
  interest: Interest;
  subject: Subject;
  avatarBg?: string;
  note?: string;
  submittedAt?: string;
}

export type StudentAttributeKey = 'gender' | 'glasses' | 'clothingColor' | 'socksColor' | 'mbtiStyle' | 'interest' | 'subject';

export interface AttributeDefinition {
  key: StudentAttributeKey;
  label: string;
  emoji: string;
  options: string[];
}

export interface QuestionCandidate {
  attributeKey: StudentAttributeKey;
  label: string;
  questionText: string;
  targetValue: string; // e.g. "남학생" for "성별이 남학생인가요?"
  yesCount: number;
  noCount: number;
  balanceScore: number; // closer to 0 difference is better (e.g. |yes - no|)
}

export interface DecisionTreeNode {
  id: string;
  type: 'question' | 'leaf';
  question?: string;
  attributeKey?: StudentAttributeKey;
  targetValue?: string;
  studentCount: number;
  students: Student[];
  yesChild?: DecisionTreeNode;
  noChild?: DecisionTreeNode;
  leafStudent?: Student;
  depth: number;
}
