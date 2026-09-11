import { Student, QuestionCandidate, DecisionTreeNode } from '../types';
import { ATTRIBUTE_DEFINITIONS, getQuestionText } from '../data/attributes';

/**
 * Calculates Gini Impurity or simple balance score for splitting a subset of students.
 * In a classroom context, a question that splits the group closest to 50:50 is easiest for 6th graders to grasp.
 */
export function getCandidateQuestions(students: Student[], askedQuestions: string[] = []): QuestionCandidate[] {
  if (students.length <= 1) return [];

  const candidates: QuestionCandidate[] = [];

  for (const attr of ATTRIBUTE_DEFINITIONS) {
    for (const opt of attr.options) {
      const qText = getQuestionText(attr.key, opt);
      if (askedQuestions.includes(qText)) continue;

      let yesCount = 0;
      let noCount = 0;

      for (const s of students) {
        if (s[attr.key] === opt) {
          yesCount++;
        } else {
          noCount++;
        }
      }

      // If everyone is Yes or everyone is No, this question doesn't divide the remaining students
      if (yesCount === 0 || noCount === 0) continue;

      // Ideal balance is when yesCount == noCount (difference is 0)
      const diff = Math.abs(yesCount - noCount);
      // Higher score means better balance
      const balanceScore = (students.length - diff) / students.length;

      candidates.push({
        attributeKey: attr.key,
        label: attr.label,
        questionText: qText,
        targetValue: opt,
        yesCount,
        noCount,
        balanceScore,
      });
    }
  }

  // Sort descending by balanceScore (best splits first), then by total students involved
  candidates.sort((a, b) => {
    if (b.balanceScore !== a.balanceScore) {
      return b.balanceScore - a.balanceScore;
    }
    return Math.abs(a.yesCount - a.noCount) - Math.abs(b.yesCount - b.noCount);
  });

  return candidates;
}

/**
 * Recursively builds a decision tree from the current student set.
 * Depth limit prevents excessive recursion.
 */
export function buildDecisionTree(
  students: Student[],
  depth: number = 0,
  maxDepth: number = 6,
  usedQuestions: string[] = [],
  idPrefix: string = 'node'
): DecisionTreeNode {
  // Leaf condition: 1 student or 0, or max depth reached
  if (students.length <= 1 || depth >= maxDepth) {
    return {
      id: idPrefix,
      type: 'leaf',
      studentCount: students.length,
      students,
      leafStudent: students.length === 1 ? students[0] : undefined,
      depth,
    };
  }

  const candidates = getCandidateQuestions(students, usedQuestions);

  if (candidates.length === 0) {
    // All remaining students have identical traits across remaining questions
    return {
      id: idPrefix,
      type: 'leaf',
      studentCount: students.length,
      students,
      depth,
    };
  }

  const bestQuestion = candidates[0];
  const yesStudents = students.filter(s => s[bestQuestion.attributeKey] === bestQuestion.targetValue);
  const noStudents = students.filter(s => s[bestQuestion.attributeKey] !== bestQuestion.targetValue);

  const nextUsedQuestions = [...usedQuestions, bestQuestion.questionText];

  const yesChild = buildDecisionTree(yesStudents, depth + 1, maxDepth, nextUsedQuestions, `${idPrefix}-yes`);
  const noChild = buildDecisionTree(noStudents, depth + 1, maxDepth, nextUsedQuestions, `${idPrefix}-no`);

  return {
    id: idPrefix,
    type: 'question',
    question: bestQuestion.questionText,
    attributeKey: bestQuestion.attributeKey,
    targetValue: bestQuestion.targetValue,
    studentCount: students.length,
    students,
    yesChild,
    noChild,
    depth,
  };
}

/**
 * Calculates explanation note for 6th graders why this question is recommended.
 */
export function getEducationalSplitExplanation(candidate: QuestionCandidate, totalRemaining: number): string {
  const percentYes = Math.round((candidate.yesCount / totalRemaining) * 100);
  const percentNo = Math.round((candidate.noCount / totalRemaining) * 100);
  const diff = Math.abs(candidate.yesCount - candidate.noCount);

  if (diff <= 1) {
    return `남은 ${totalRemaining}명을 거의 정확히 절반(예 ${candidate.yesCount}명 / 아니오 ${candidate.noCount}명)으로 나누는 가장 이상적인 질문이에요!`;
  }
  return `남은 ${totalRemaining}명 중 예(${percentYes}%), 아니오(${percentNo}%)로 분리하여 가장 신속하게 후보를 좁힐 수 있어요.`;
}
