import { useState, useMemo, useEffect } from 'react';
import { Student, QuestionCandidate } from '../types';
import { getCandidateQuestions, getEducationalSplitExplanation } from '../utils/decisionTree';
import confetti from 'canvas-confetti';
import { 
  Dices, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  X, 
  Trophy, 
  Users, 
  Lightbulb, 
  ListOrdered,
  Unlock,
  Lock,
  ChevronRight,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface ClassroomLotteryGameProps {
  students: Student[];
  onGoToTree: () => void;
}

interface HistoryEntry {
  id: string;
  stepNumber: number;
  type: 'clue' | 'question';
  title: string;
  detail: string;
  isYes?: boolean;
  remainingBefore: number;
  remainingAfter: number;
}

// Order of attributes matched with initial student entry
const ORDERED_CLUES: {
  key: keyof Student;
  stepNumber: number;
  label: string;
  icon: string;
  questionTitle: string;
}[] = [
  { key: 'gender', stepNumber: 1, label: '성별', icon: '👤', questionTitle: '성별을 선택해 주세요' },
  { key: 'glasses', stepNumber: 2, label: '안경 착용 여부', icon: '👓', questionTitle: '지금 안경을 쓰고 있나요?' },
  { key: 'clothingColor', stepNumber: 3, label: '즐겨 입는 옷 색상', icon: '👕', questionTitle: '평소 즐겨 입는 옷 색상 계열은?' },
  { key: 'socksColor', stepNumber: 4, label: '오늘 신은 양말 색깔', icon: '🧦', questionTitle: '오늘 신은 양말 색깔은?' },
  { key: 'mbtiStyle', stepNumber: 5, label: '성향 (MBTI)', icon: '⚡', questionTitle: 'MBTI (E / I)' },
  { key: 'interest', stepNumber: 6, label: '관심 있는 분야', icon: '🎯', questionTitle: '관심 있는 분야는?' },
  { key: 'subject', stepNumber: 7, label: '자신/좋아하는 과목', icon: '📚', questionTitle: '자신 있거나 좋아하는 과목은?' },
  { key: 'nickname', stepNumber: 8, label: '활동 닉네임 (별명)', icon: '🏷️', questionTitle: '친구의 활동 닉네임(별명 힌트)은?' },
];

export default function ClassroomLotteryGame({ students, onGoToTree }: ClassroomLotteryGameProps) {
  const [secretStudent, setSecretStudent] = useState<Student | null>(null);
  const [showSecretName, setShowSecretName] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingName, setRollingName] = useState('');

  // Unlocked clues (keys that have been revealed)
  const [revealedClueKeys, setRevealedClueKeys] = useState<string[]>([]);
  // Current remaining candidates
  const [remainingStudents, setRemainingStudents] = useState<Student[]>(students);
  // Full question/clue history
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  // Final reveal state (Nickname)
  const [isFinalRevealed, setIsFinalRevealed] = useState(false);
  // Optional toggle to peek candidate list during game
  const [showSuspectBoard, setShowSuspectBoard] = useState(false);

  // Sync remaining students when student list changes and not in game
  useEffect(() => {
    if (!secretStudent) {
      setRemainingStudents(students);
    }
  }, [students, secretStudent]);

  // Confetti celebration (reduced to ~2 seconds)
  const triggerCelebration = () => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      ticks: 100,
      gravity: 1.3,
      scalar: 0.85,
    });
    // Stop and clear confetti after exactly 2 seconds
    setTimeout(() => {
      confetti.reset();
    }, 2000);
  };

  // 1. Draw Secret Student
  const handleDrawSecretStudent = () => {
    if (students.length === 0) return;

    setIsRolling(true);
    setShowSecretName(false);
    setIsFinalRevealed(false);
    setRevealedClueKeys([]);
    setHistoryEntries([]);
    setRemainingStudents(students);
    setShowSuspectBoard(false); // Hide candidate board automatically once drawn

    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * students.length);
      setRollingName(students[randomIdx].nickname);
      count++;
      if (count >= 16) {
        clearInterval(interval);
        const finalChosen = students[Math.floor(Math.random() * students.length)];
        setSecretStudent(finalChosen);
        setIsRolling(false);
      }
    }, 70);
  };

  // 2. Reveal next ordered clue
  const handleRevealNextClue = () => {
    if (!secretStudent) return;

    // Find first unrevealed clue in order
    const nextClue = ORDERED_CLUES.find(c => !revealedClueKeys.includes(c.key as string));

    if (!nextClue) {
      // All 7 clues revealed -> reveal answer
      handleRevealFinalAnswer();
      return;
    }

    handleRevealSpecificClue(nextClue.key as string);
  };

  // Reveal a specific clue
  const handleRevealSpecificClue = (keyStr: string) => {
    if (!secretStudent) return;
    if (revealedClueKeys.includes(keyStr)) return;

    const clueDef = ORDERED_CLUES.find(c => c.key === keyStr);
    if (!clueDef) return;

    const clueValue = secretStudent[clueDef.key as keyof Student];
    const beforeCount = remainingStudents.length;

    // Filter remaining students who match this clue
    const nextRemaining = remainingStudents.filter(s => s[clueDef.key as keyof Student] === clueValue);

    const newRevealed = [...revealedClueKeys, keyStr];
    setRevealedClueKeys(newRevealed);
    setRemainingStudents(nextRemaining);

    // Add to history
    setHistoryEntries(prev => [
      ...prev,
      {
        id: `clue-${Date.now()}-${keyStr}`,
        stepNumber: prev.length + 1,
        type: 'clue',
        title: `${clueDef.stepNumber}단계 힌트 공개: [${clueDef.label}]`,
        detail: `"${String(clueValue)}"`,
        remainingBefore: beforeCount,
        remainingAfter: nextRemaining.length,
      },
    ]);
  };

  // 3. Candidate Decision Tree Questions for current remaining candidates
  const askedQuestions = useMemo(() => {
    return historyEntries.map(h => h.title);
  }, [historyEntries]);

  const candidates = useMemo(() => {
    return getCandidateQuestions(remainingStudents, askedQuestions);
  }, [remainingStudents, askedQuestions]);

  // Handle asking decision tree question
  const handleAskTreeQuestion = (cand: QuestionCandidate) => {
    if (!secretStudent) return;

    const isMatch = secretStudent[cand.attributeKey] === cand.targetValue;
    const beforeCount = remainingStudents.length;

    const nextRemaining = remainingStudents.filter(s => {
      const match = s[cand.attributeKey] === cand.targetValue;
      return isMatch ? match : !match;
    });

    // If it was a match, also mark that clue as revealed
    if (isMatch && !revealedClueKeys.includes(cand.attributeKey)) {
      setRevealedClueKeys(prev => [...prev, cand.attributeKey]);
    }

    setHistoryEntries(prev => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        stepNumber: prev.length + 1,
        type: 'question',
        title: `결정트리 질문: "${cand.questionText}"`,
        detail: isMatch ? `O 맞습니다! (${cand.targetValue})` : `X 아닙니다!`,
        isYes: isMatch,
        remainingBefore: beforeCount,
        remainingAfter: nextRemaining.length,
      },
    ]);

    setRemainingStudents(nextRemaining);
  };

  // 4. Reveal Final Answer
  const handleRevealFinalAnswer = () => {
    setIsFinalRevealed(true);
    // Reveal all clues if not already
    setRevealedClueKeys(ORDERED_CLUES.map(c => c.key as string));
    setRemainingStudents(students.filter(s => s.id === secretStudent?.id));
    triggerCelebration();
  };

  // Reset current game
  const handleResetGame = () => {
    setSecretStudent(null);
    setRevealedClueKeys([]);
    setHistoryEntries([]);
    setRemainingStudents(students);
    setIsFinalRevealed(false);
    setShowSecretName(false);
  };

  if (students.length < 2) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
        <Users className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          등록된 학생이 2명 이상이어야 합니다!
        </h3>
        <p className="text-xs text-slate-500">
          학생들이 링크로 접속하여 정보를 입력하거나, 학생 제출 현황 탭에서 샘플 데이터를 불러와 주세요.
        </p>
      </div>
    );
  }

  // Next clue that will be opened
  const nextClueToOpen = ORDERED_CLUES.find(c => !revealedClueKeys.includes(c.key as string));

  return (
    <div className="space-y-6">
      {/* Top Banner: Secret Student Lottery Controller */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-purple-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>대형 빔프로젝터 스무고개 추측 수업</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              오늘의 비밀 친구를 찾아라! 🎯
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed max-w-2xl">
              {secretStudent
                ? `추첨된 친구의 특징이 학생들이 입력한 순서대로 하나씩 열립니다. 친구들과 추측해 보세요!`
                : `등록된 ${students.length}명의 친구들 중 1명을 무작위로 추첨하여 스무고개 놀이를 시작합니다.`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDrawSecretStudent}
              disabled={isRolling}
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm sm:text-base shadow-xl hover:shadow-amber-400/40 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
              <span>{secretStudent ? '다른 친구 다시 추첨하기' : '비밀 친구 추첨 시작! 🎲'}</span>
            </button>

            {secretStudent && (
              <button
                onClick={handleResetGame}
                className="px-3.5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                title="추첨 리셋"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Rolling Status */}
        {isRolling && (
          <div className="mt-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center animate-pulse">
            <span className="text-xs text-indigo-200 font-bold">비밀 친구를 무작위로 뽑는 중...</span>
            <div className="text-3xl font-black text-amber-300 tracking-wider mt-1.5">
              🎲 {rollingName}
            </div>
          </div>
        )}

        {/* Secret Status Info & Teacher Peek */}
        {secretStudent && !isRolling && (
          <div className="mt-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 font-black flex items-center justify-center text-xl shadow-xs">
                🤫
              </div>
              <div>
                <span className="text-sm text-white font-extrabold block">
                  비밀 친구가 선정되었습니다! (아이들에게는 비밀)
                </span>
                <span className="text-xs text-indigo-200">
                  아래 힌트 카드를 1단계부터 차례로 열거나, 결정트리 질문을 던져보세요.
                </span>
              </div>
            </div>

            {/* Teacher Peek Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSecretName(!showSecretName)}
                className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {showSecretName ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showSecretName ? '정답 가리기' : '교사용 정답 엿보기'}</span>
              </button>

              {showSecretName && (
                <span className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-900 font-black text-xs shadow-md">
                  정답: {secretStudent.name || secretStudent.nickname} (닉네임: {secretStudent.nickname})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          VIEW A: BEFORE DRAWING (우리 반 용의자 후보 전체 모드 노출)
          ========================================================= */}
      {!secretStudent && !isRolling && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-800 text-base sm:text-lg">
                  우리 반 참가 후보 명단 ({students.length}명)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                위의 <strong>[비밀 친구 추첨 시작!]</strong> 버튼을 누르면 게임이 시작됩니다.
              </span>
            </div>

            {/* Suspect Roster Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 text-center transition-all shadow-2xs"
                >
                  <div className={`w-11 h-11 rounded-2xl mx-auto flex items-center justify-center font-bold text-sm mb-2 border ${student.avatarBg}`}>
                    {(student.name || student.nickname).slice(0, 2)}
                  </div>
                  <p className="font-extrabold text-sm text-slate-800 truncate">
                    {student.name || student.nickname}
                  </p>
                  <p className="text-xs font-bold text-indigo-600 truncate">
                    {student.nickname}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {student.gender} · {student.glasses}
                  </p>
                  <span className="inline-block px-2 py-0.5 mt-1.5 rounded-md bg-slate-50 text-[10px] text-slate-500 font-semibold">
                    {student.interest}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW B: AFTER DRAWING (질문 & 힌트가 크게 보이는 스무고개 모드)
          ========================================================= */}
      {secretStudent && !isRolling && (
        <div className="space-y-6">
          {/* Main Stage: Clue Cards that open step by step in the order students entered */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-100">
                    스무고개 힌트 보드
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    입력 순서대로 차례로 열리는 특징들
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  선정된 비밀 친구의 특징 데이터
                </h3>
              </div>

              {/* Progress & Next Hint CTA */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block">남은 후보 수</span>
                  <span className="text-2xl sm:text-3xl font-black text-indigo-600">
                    {remainingStudents.length}
                    <span className="text-xs text-slate-400 font-bold ml-1">/ {students.length}명</span>
                  </span>
                </div>

                {!isFinalRevealed && (
                  <button
                    onClick={handleRevealNextClue}
                    className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>
                      {nextClueToOpen
                        ? `다음 힌트 열기 (${nextClueToOpen.stepNumber}/8)`
                        : '최종 정답 공개하기 🏆'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 3칸씩 세줄 (3x3 Grid) - 멀리서도 뚜렷하게 보이는 대형 힌트 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {ORDERED_CLUES.map((clue) => {
                const isOpened = revealedClueKeys.includes(clue.key as string);
                const clueVal = secretStudent[clue.key as keyof Student];

                return (
                  <div
                    key={clue.key as string}
                    onClick={() => !isOpened && handleRevealSpecificClue(clue.key as string)}
                    className={`p-5 sm:p-6 rounded-3xl border-2 sm:border-3 text-center transition-all cursor-pointer relative flex flex-col justify-between min-h-[220px] sm:min-h-[240px] ${
                      isOpened
                        ? 'bg-gradient-to-b from-indigo-50/90 to-white border-indigo-500 shadow-md scale-101'
                        : 'bg-slate-50/90 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {/* Top: Step Badge & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center shadow-xs ${
                          isOpened ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {clue.stepNumber}
                        </span>
                        <span className={`text-xs font-black ${
                          isOpened ? 'text-indigo-600' : 'text-slate-400'
                        }`}>
                          {isOpened ? '공개 완료' : `${clue.stepNumber}단계 힌트`}
                        </span>
                      </div>

                      <div className={`p-1.5 rounded-xl ${isOpened ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                        {isOpened ? (
                          <Unlock className="w-4 h-4 text-indigo-700" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Middle: Big Emoji & Label */}
                    <div className="my-3">
                      <div className="text-4xl sm:text-5xl mb-2">{clue.icon}</div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                        {clue.label}
                      </h4>
                      <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5 truncate">
                        {clue.questionTitle}
                      </p>
                    </div>

                    {/* Bottom: Big Revealed Value or Locked */}
                    <div className="pt-2">
                      {isOpened ? (
                        <div className="py-2.5 px-3 bg-white rounded-2xl border border-indigo-200 shadow-xs">
                          <span className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight block ${
                            clue.key === 'nickname' ? 'text-indigo-700' : 'text-indigo-950'
                          }`}>
                            {clue.key === 'nickname' ? `"${String(clueVal)}"` : String(clueVal).split('(')[0]}
                          </span>
                        </div>
                      ) : (
                        <div className="py-2.5 px-3 bg-slate-100/80 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs sm:text-sm font-extrabold text-slate-500">
                            클릭하여 힌트 열기
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* 9th Card: Final Target Card (정답 공개시 학생의 실제 이름만 노출!) */}
              <div
                onClick={handleRevealFinalAnswer}
                className={`p-5 sm:p-6 rounded-3xl border-2 sm:border-3 text-center transition-all cursor-pointer relative flex flex-col justify-between min-h-[220px] sm:min-h-[240px] ${
                  isFinalRevealed
                    ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 border-amber-500 shadow-xl scale-102'
                    : 'bg-slate-900 border-amber-400 text-white hover:bg-slate-850 hover:scale-101 shadow-lg'
                }`}
              >
                {/* Top: Final Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-2xl bg-amber-400 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center shadow-xs">
                      ★
                    </span>
                    <span className={`text-xs font-black ${isFinalRevealed ? 'text-amber-800' : 'text-amber-400'}`}>
                      {isFinalRevealed ? '최종 정답 공개!' : '9단계 · 최종 정답'}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-xl ${isFinalRevealed ? 'bg-amber-200 text-amber-900' : 'bg-slate-800 text-amber-400'}`}>
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>

                {/* Middle: Crown/Confetti Emoji & Label */}
                <div className="my-3">
                  <div className="text-4xl sm:text-5xl mb-2">{isFinalRevealed ? '🎉' : '👑'}</div>
                  <h4 className={`text-lg sm:text-xl font-black tracking-tight ${isFinalRevealed ? 'text-amber-950' : 'text-amber-400'}`}>
                    최종 정답 (학생 이름)
                  </h4>
                  <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isFinalRevealed ? 'text-amber-800' : 'text-slate-400'}`}>
                    {isFinalRevealed ? '비밀 친구의 진짜 이름!' : '비밀 친구의 진짜 이름은 누구일까요?'}
                  </p>
                </div>

                {/* Bottom: Big Answer (NAME ONLY) or Locked Button */}
                <div className="pt-2">
                  {isFinalRevealed ? (
                    <div className="py-2.5 px-3 bg-white rounded-2xl border-2 border-amber-400 shadow-md">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight block">
                        {secretStudent.name || secretStudent.nickname}
                      </span>
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md">
                      <Trophy className="w-4 h-4 text-slate-950" />
                      <span>클릭하여 최종 정답 공개!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Winner Celebration Box when revealed */}
          {isFinalRevealed && (
            <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 rounded-3xl p-8 sm:p-10 border-2 border-amber-400 shadow-xl text-center space-y-4 animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-amber-400 text-slate-900 mx-auto flex items-center justify-center text-4xl shadow-md">
                🏆
              </div>

              <div>
                <span className="px-4 py-1 bg-amber-200 text-amber-900 text-xs font-black rounded-full uppercase tracking-wider">
                  정답 공개 완료!
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-2 tracking-tight">
                  오늘의 비밀 친구는 바로{' '}
                  <strong className="text-indigo-700 underline decoration-amber-400 decoration-4 sm:decoration-6">
                    {secretStudent.name || secretStudent.nickname}
                  </strong>{' '}
                  친구입니다!
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
                  총 <strong>{historyEntries.length}번의 단서/질문 확인</strong> 끝에 정답을 맞혔습니다! 🎉
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={handleDrawSecretStudent}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Dices className="w-4 h-4" />
                  <span>새로운 비밀 친구 뽑고 다시 하기</span>
                </button>
                <button
                  onClick={onGoToTree}
                  className="px-6 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-all cursor-pointer"
                >
                  🌳 결정트리 지도에서 규칙 확인
                </button>
              </div>
            </div>
          )}

          {/* Big Questions Section (Prominently displayed across full width) */}
          {!isFinalRevealed && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                    Q
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg sm:text-xl">
                      결정트리가 추천하는 스무고개 질문 리스트
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      남은 {remainingStudents.length}명의 친구를 <strong>가장 절반(50:50)에 가깝게 나누는 질문</strong>부터 크게 표시됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Optional Toggle to peek remaining candidates */}
                  <button
                    onClick={() => setShowSuspectBoard(!showSuspectBoard)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{showSuspectBoard ? '남은 후보 보드 닫기' : `남은 후보(${remainingStudents.length}명) 명단 보기`}</span>
                  </button>

                  <button
                    onClick={handleRevealFinalAnswer}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    정답 맞추기!
                  </button>
                </div>
              </div>

              {/* Collapsible Remaining Suspects Peek Board */}
              {showSuspectBoard && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-700">현재 남은 후보 친구들:</span>
                    <span className="font-bold text-indigo-600">{remainingStudents.length}명 생존 중</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {remainingStudents.map(s => (
                      <div key={s.id} className="p-2 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                        <p className="text-xs font-extrabold text-slate-800 truncate">{s.nickname}</p>
                        <p className="text-[10px] text-slate-400">{s.gender} · {s.glasses}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Large High-Contrast Candidate Questions (Click to Ask) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {candidates.slice(0, 6).map((cand, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskTreeQuestion(cand)}
                    className="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/60 text-left transition-all group flex items-center justify-between gap-4 cursor-pointer shadow-xs active:scale-99"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 font-black text-sm flex items-center justify-center shrink-0 transition-colors">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[11px] text-indigo-600 font-bold block">
                          [{cand.label}] 확인 질문
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-800 group-hover:text-indigo-950 block truncate">
                          "{cand.questionText}"
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-indigo-100 text-xs font-extrabold text-slate-700 group-hover:text-indigo-900 block">
                        예: {cand.yesCount}명 / 아니오: {cand.noCount}명
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Educational Explanation Box */}
              {candidates[0] && (
                <div className="bg-indigo-50/80 rounded-2xl p-4 text-xs sm:text-sm text-indigo-950 flex items-start gap-3 border border-indigo-100">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    💡 <strong>1번 추천 질문의 이유:</strong> {getEducationalSplitExplanation(candidates[0], remainingStudents.length)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              QUESTION / CLUE HISTORY (Maintained and displayed clearly)
              ========================================================= */}
          {historyEntries.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-extrabold text-slate-900 text-base">
                    지금까지 물어본 질문 및 힌트 기록 ({historyEntries.length}단계 진행)
                  </h4>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  처음 {students.length}명에서 현재 {remainingStudents.length}명으로 압축됨
                </span>
              </div>

              <div className="space-y-2.5">
                {historyEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                        {entry.stepNumber}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800">{entry.title}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                      <span
                        className={`font-black px-3 py-1 rounded-xl text-xs ${
                          entry.isYes !== undefined
                            ? entry.isYes
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {entry.detail}
                      </span>
                      <span className="text-slate-400 text-xs font-semibold">
                        {entry.remainingBefore}명 ➡️ <strong className="text-indigo-600 font-extrabold">{entry.remainingAfter}명</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
