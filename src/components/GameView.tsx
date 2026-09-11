import { useState, useMemo, useEffect } from 'react';
import { Student, QuestionCandidate } from '../types';
import { getCandidateQuestions, getEducationalSplitExplanation } from '../utils/decisionTree';
import confetti from 'canvas-confetti';
import { 
  Bot, 
  UserCheck, 
  HelpCircle, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Search, 
  ArrowRight, 
  Lightbulb, 
  ListFilter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface GameViewProps {
  students: Student[];
  onGoToTree: () => void;
  onGoToData: () => void;
}

interface QuestionHistoryItem {
  question: QuestionCandidate;
  answer: boolean;
  remainingBefore: number;
  remainingAfter: number;
}

export default function GameView({ students, onGoToTree, onGoToData }: GameViewProps) {
  const [gameMode, setGameMode] = useState<'ai-detective' | 'student-detective'>('ai-detective');
  
  // State for AI Detective Mode (User picks a target in mind, AI asks questions)
  const [aiRemainingStudents, setAiRemainingStudents] = useState<Student[]>(students);
  const [aiHistory, setAiHistory] = useState<QuestionHistoryItem[]>([]);
  const [secretTargetForAi, setSecretTargetForAi] = useState<Student | null>(null);
  const [showSecretTarget, setShowSecretTarget] = useState(false);

  // State for Student Detective Mode (Computer picks target, student asks questions)
  const [secretStudentForUser, setSecretStudentForUser] = useState<Student | null>(null);
  const [userRemainingStudents, setUserRemainingStudents] = useState<Student[]>(students);
  const [userHistory, setUserHistory] = useState<QuestionHistoryItem[]>([]);
  const [userWon, setUserWon] = useState(false);
  const [guessedStudentId, setGuessedStudentId] = useState<string>('');
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);

  // Initialize or reset game states
  const initAiGame = () => {
    setAiRemainingStudents(students);
    setAiHistory([]);
    // Random target suggestion for convenience
    if (students.length > 0) {
      setSecretTargetForAi(students[Math.floor(Math.random() * students.length)]);
    }
    setShowSecretTarget(false);
  };

  const initUserGame = () => {
    setUserRemainingStudents(students);
    setUserHistory([]);
    setUserWon(false);
    setGuessedStudentId('');
    setGuessFeedback(null);
    if (students.length > 0) {
      setSecretStudentForUser(students[Math.floor(Math.random() * students.length)]);
    }
  };

  useEffect(() => {
    initAiGame();
    initUserGame();
  }, [students]);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // AI Detective current candidates
  const askedAiQuestions = useMemo(() => aiHistory.map(h => h.question.questionText), [aiHistory]);
  const aiCandidates = useMemo(() => {
    return getCandidateQuestions(aiRemainingStudents, askedAiQuestions);
  }, [aiRemainingStudents, askedAiQuestions]);

  const currentAiQuestion = aiCandidates[0] || null;
  const isAiFinished = aiRemainingStudents.length <= 1 || !currentAiQuestion;

  useEffect(() => {
    if (isAiFinished && aiRemainingStudents.length === 1 && aiHistory.length > 0) {
      triggerConfetti();
    }
  }, [isAiFinished, aiRemainingStudents.length, aiHistory.length]);

  // AI Detective answer handling
  const handleAiAnswer = (answer: boolean) => {
    if (!currentAiQuestion) return;

    const remainingBefore = aiRemainingStudents.length;
    const nextRemaining = aiRemainingStudents.filter(s => {
      const match = s[currentAiQuestion.attributeKey] === currentAiQuestion.targetValue;
      return answer ? match : !match;
    });

    setAiHistory(prev => [
      ...prev,
      {
        question: currentAiQuestion,
        answer,
        remainingBefore,
        remainingAfter: nextRemaining.length,
      },
    ]);

    setAiRemainingStudents(nextRemaining);
  };

  // Student Detective question handling
  const askedUserQuestions = useMemo(() => userHistory.map(h => h.question.questionText), [userHistory]);
  const userCandidates = useMemo(() => {
    return getCandidateQuestions(userRemainingStudents, askedUserQuestions);
  }, [userRemainingStudents, askedUserQuestions]);

  const handleUserAsk = (q: QuestionCandidate) => {
    if (!secretStudentForUser) return;

    const isMatch = secretStudentForUser[q.attributeKey] === q.targetValue;
    const remainingBefore = userRemainingStudents.length;
    const nextRemaining = userRemainingStudents.filter(s => {
      const match = s[q.attributeKey] === q.targetValue;
      return isMatch ? match : !match;
    });

    setUserHistory(prev => [
      ...prev,
      {
        question: q,
        answer: isMatch,
        remainingBefore,
        remainingAfter: nextRemaining.length,
      },
    ]);

    setUserRemainingStudents(nextRemaining);

    if (nextRemaining.length === 1) {
      setUserWon(true);
      triggerConfetti();
    }
  };

  const handleMakeGuess = (targetId: string) => {
    if (!secretStudentForUser) return;
    if (targetId === secretStudentForUser.id) {
      setUserWon(true);
      setUserRemainingStudents([secretStudentForUser]);
      triggerConfetti();
      setGuessFeedback('🎉 정답입니다! 정확하게 맞추셨어요!');
    } else {
      setGuessFeedback('❌ 아쉽지만 그 친구가 아니에요! 질문을 더 해보세요.');
      setTimeout(() => setGuessFeedback(null), 3000);
    }
  };

  if (students.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">학생 데이터가 2명 이상 필요해요!</h3>
        <p className="text-xs text-slate-600 mb-5">
          스무고개와 결정트리를 진행하려면 최소 2명 이상의 학생 데이터가 등록되어 있어야 합니다.
        </p>
        <button
          onClick={onGoToData}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
        >
          데이터 관리 화면으로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Switcher Banner */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">놀이 모드 선택:</span>
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setGameMode('ai-detective');
                initAiGame();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                gameMode === 'ai-detective'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              모드 A: AI 결정트리 탐정 (컴퓨터가 맞추기)
            </button>
            <button
              onClick={() => {
                setGameMode('student-detective');
                initUserGame();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                gameMode === 'student-detective'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              모드 B: 학생 탐정 스무고개 (우리가 맞추기)
            </button>
          </div>
        </div>

        <button
          onClick={onGoToTree}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-end sm:self-auto cursor-pointer"
        >
          <span>이 데이터의 결정트리 구조 보러가기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* -------------------- MODE A: AI DETECTIVE -------------------- */}
      {gameMode === 'ai-detective' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question / Akinator Stage */}
          <div className="lg:col-span-7 space-y-6">
            {/* Secret Target Helper Box for Teacher/Student */}
            <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">마음속으로 맞출 친구 1명을 정해두세요!</span>
                  <p className="text-amber-700/90 text-[11px] mt-0.5">
                    선생님이 정하거나, 아래 버튼을 눌러 랜덤 비밀 타겟을 몰래 확인할 수도 있습니다.
                  </p>
                </div>
              </div>

              {secretTargetForAi && (
                <button
                  onClick={() => setShowSecretTarget(!showSecretTarget)}
                  className="px-2.5 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-100/50 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {showSecretTarget ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecretTarget ? '숨기기' : '비밀 타겟 엿보기'}</span>
                </button>
              )}
            </div>

            {showSecretTarget && secretTargetForAi && (
              <div className="bg-white rounded-2xl p-4 border border-amber-300 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between border-b border-amber-100 pb-2 mb-2">
                  <span className="text-xs font-bold text-amber-800">🤫 이번 판의 비밀 타겟 친구:</span>
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {secretTargetForAi.nickname}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                  <div>성별: <strong>{secretTargetForAi.gender}</strong></div>
                  <div>안경: <strong>{secretTargetForAi.glasses}</strong></div>
                  <div>MBTI: <strong>{secretTargetForAi.mbtiStyle.split(' ')[0]}</strong></div>
                  <div>옷 색상: <strong>{secretTargetForAi.clothingColor.split('(')[0]}</strong></div>
                  <div>양말: <strong>{secretTargetForAi.socksColor.split('(')[0]}</strong></div>
                  <div>관심분야: <strong>{secretTargetForAi.interest}</strong></div>
                </div>
              </div>
            )}

            {/* AI Detective Question Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg relative overflow-hidden">
              {/* Question count badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                    Q{aiHistory.length + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-indigo-700">AI 결정트리 아키네이터 탐정</h3>
                    <p className="text-[11px] text-slate-500">
                      최적의 분할 질문(Information Gain)을 계산하여 질문합니다
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-medium">남은 용의자 후보</span>
                  <div className="text-lg font-black text-indigo-700">{aiRemainingStudents.length}명</div>
                </div>
              </div>

              {!isAiFinished && currentAiQuestion ? (
                <div className="space-y-6 my-4">
                  {/* The Question Text */}
                  <div className="bg-indigo-50/60 rounded-2xl p-5 border border-indigo-100 text-center">
                    <span className="inline-block px-3 py-1 bg-white rounded-full text-[11px] font-bold text-indigo-600 shadow-2xs mb-2">
                      {currentAiQuestion.label} 확인 질문
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                      "{currentAiQuestion.questionText}"
                    </h2>

                    {/* Split Simulation Preview */}
                    <div className="mt-4 pt-3 border-t border-indigo-100/60 flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        [예] 누르면: <strong>{currentAiQuestion.yesCount}명</strong> 남음
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        [아니오] 누르면: <strong>{currentAiQuestion.noCount}명</strong> 남음
                      </span>
                    </div>
                  </div>

                  {/* Educational Tooltip Note */}
                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      {getEducationalSplitExplanation(currentAiQuestion, aiRemainingStudents.length)}
                    </p>
                  </div>

                  {/* Big Action Buttons [YES] / [NO] */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => handleAiAnswer(true)}
                      className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-emerald-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-6 h-6 stroke-[3]" />
                      <span>예 (O)</span>
                    </button>
                    <button
                      onClick={() => handleAiAnswer(false)}
                      className="py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-rose-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <X className="w-6 h-6 stroke-[3]" />
                      <span>아니오 (X)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Result Screen (Solved / Leaf Node Reached) */
                <div className="text-center py-6 space-y-5 animate-fadeIn">
                  {aiRemainingStudents.length === 1 ? (
                    <>
                      <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-full shadow-inner mb-1">
                        <Trophy className="w-10 h-10" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
                          스무고개 결정 완료! (결정트리 잎 노드 도착)
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                          당신이 생각한 친구는 바로...
                        </h2>
                      </div>

                      {/* Final Student Card */}
                      <div className="max-w-md mx-auto bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl">
                        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-xl font-black mb-3 border ${aiRemainingStudents[0].avatarBg}`}>
                          {aiRemainingStudents[0].nickname.slice(0, 2)}
                        </div>
                        <h3 className="text-xl font-black text-slate-800">
                          {aiRemainingStudents[0].nickname}
                        </h3>
                        {aiRemainingStudents[0].note && (
                          <p className="text-xs text-slate-500 mt-1">"{aiRemainingStudents[0].note}"</p>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-left text-xs text-slate-600 bg-white/80 rounded-2xl p-3 border border-indigo-100 mt-4">
                          <div>👤 {aiRemainingStudents[0].gender}</div>
                          <div>👓 {aiRemainingStudents[0].glasses}</div>
                          <div>⚡ {aiRemainingStudents[0].mbtiStyle.split(' ')[0]}</div>
                          <div>🎯 {aiRemainingStudents[0].interest}</div>
                          <div>👕 {aiRemainingStudents[0].clothingColor.split('(')[0]}</div>
                          <div>📚 {aiRemainingStudents[0].subject}</div>
                        </div>

                        <div className="mt-4 text-xs font-bold text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
                          🎉 단 {aiHistory.length}번의 질문 만에 찾아냈어요!
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Fallback when 0 remain or indistinguishable */
                    <div className="space-y-3">
                      <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
                      <h3 className="text-lg font-bold text-slate-800">
                        {aiRemainingStudents.length === 0
                          ? '일치하는 친구를 찾지 못했습니다'
                          : `남은 ${aiRemainingStudents.length}명의 특징이 모두 같습니다!`}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {aiRemainingStudents.length === 0
                          ? '답변 도중 실수로 잘못 선택한 질문이 있었는지 확인해보세요.'
                          : '남은 친구들이 동일한 속성을 갖고 있어 더 이상 분기할 수 없습니다.'}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={initAiGame}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      다른 친구로 다시 플레이하기
                    </button>
                    <button
                      onClick={onGoToTree}
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      🌳 결정트리 다이어그램 보기
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Question Journey / Decision Tree Path History */}
            {aiHistory.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-3">
                  <ListFilter className="w-4 h-4 text-indigo-600" />
                  <span>지금까지 거쳐온 결정트리 분기 과정 ({aiHistory.length}단계)</span>
                </h4>
                <div className="space-y-2">
                  {aiHistory.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{h.question.questionText}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            h.answer ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {h.answer ? 'O 예' : 'X 아니오'}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {h.remainingBefore}명 → <strong>{h.remainingAfter}명</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suspects / Remaining Students Board */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-indigo-600" />
                  <span>남아있는 후보 친구들 ({aiRemainingStudents.length}명)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  전체 {students.length}명 중
                </span>
              </div>

              {/* Suspects Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto p-1">
                {students.map((student) => {
                  const isAlive = aiRemainingStudents.some(s => s.id === student.id);
                  return (
                    <div
                      key={student.id}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isAlive
                          ? 'bg-white border-indigo-200 shadow-xs scale-100 opacity-100'
                          : 'bg-slate-50 border-slate-100 opacity-30 grayscale'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center font-bold text-xs mb-1 border ${
                          isAlive ? student.avatarBg : 'bg-slate-200 text-slate-400 border-slate-300'
                        }`}
                      >
                        {student.nickname.slice(0, 2)}
                      </div>
                      <p className={`font-bold text-xs truncate ${isAlive ? 'text-slate-800' : 'text-slate-400'}`}>
                        {student.nickname}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {student.gender} · {student.glasses}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* -------------------- MODE B: STUDENT DETECTIVE -------------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Picking Board for Students */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                    🕵️
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-indigo-700">학생 탐정 스무고개 미션</h3>
                    <p className="text-[11px] text-slate-500">
                      컴퓨터가 마음속에 숨긴 비밀 친구를 가장 적은 질문으로 맞혀보세요!
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-medium">남은 용의자</span>
                  <div className="text-lg font-black text-indigo-700">{userRemainingStudents.length}명</div>
                </div>
              </div>

              {/* Guessed Feedback Alert */}
              {guessFeedback && (
                <div className="p-3 mb-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-800 animate-fadeIn">
                  {guessFeedback}
                </div>
              )}

              {userWon ? (
                /* Celebration for student */
                <div className="py-6 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl">
                    🏆
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">
                    축하합니다! 명탐정 성공!
                  </h2>
                  <p className="text-xs text-slate-600">
                    비밀 친구는 바로 <strong>"{secretStudentForUser?.nickname}"</strong> 였습니다!
                    <br />
                    총 <strong>{userHistory.length}번의 질문</strong> 만에 찾아냈어요!
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={initUserGame}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      새로운 친구로 다시 도전하기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>어떤 질문을 먼저 물어보는 게 가장 좋을까요? (추천 순서 정렬)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">선택 가능한 질문: {userCandidates.length}개</span>
                  </div>

                  {/* Candidates List to click */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto p-1">
                    {userCandidates.slice(0, 8).map((candidate, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUserAsk(candidate)}
                        className="w-full p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 text-xs font-extrabold flex items-center justify-center transition-colors">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-[10px] text-indigo-600 font-bold block">
                              {candidate.label}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              "{candidate.questionText}"
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 text-[11px] text-slate-500">
                          <span className="px-2 py-1 rounded-md bg-slate-100 font-medium">
                            예: {candidate.yesCount}명 / 아니오: {candidate.noCount}명
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Direct Guess Option */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <select
                      value={guessedStudentId}
                      onChange={(e) => setGuessedStudentId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="정답 친구 지목하기"
                    >
                      <option value="">정답 친구를 확신한다면 바로 지목하기...</option>
                      {userRemainingStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nickname} ({s.gender}, {s.glasses})
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={!guessedStudentId}
                      onClick={() => handleMakeGuess(guessedStudentId)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        guessedStudentId
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      정답 외치기!
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* History of Student Questions */}
            {userHistory.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-700 mb-2.5">
                  우리가 물어본 질문 기록 ({userHistory.length}회)
                </h4>
                <div className="space-y-1.5">
                  {userHistory.map((h, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-slate-50 text-xs flex items-center justify-between border border-slate-100"
                    >
                      <span>Q{i + 1}. {h.question.questionText}</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className={h.answer ? 'text-emerald-600' : 'text-rose-600'}>
                          {h.answer ? 'O 예!' : 'X 아니오!'}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          ({h.remainingAfter}명 남음)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suspects board for Student mode */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-indigo-600" />
                  <span>남은 용의자 친구들 ({userRemainingStudents.length}명)</span>
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto p-1">
                {students.map((student) => {
                  const isAlive = userRemainingStudents.some(s => s.id === student.id);
                  return (
                    <div
                      key={student.id}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isAlive
                          ? 'bg-white border-indigo-200 shadow-xs opacity-100'
                          : 'bg-slate-50 border-slate-100 opacity-25 grayscale'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center font-bold text-xs mb-1 border ${
                          isAlive ? student.avatarBg : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {student.nickname.slice(0, 2)}
                      </div>
                      <p className={`font-bold text-xs truncate ${isAlive ? 'text-slate-800' : 'text-slate-400'}`}>
                        {student.nickname}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {student.gender} · {student.glasses}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
