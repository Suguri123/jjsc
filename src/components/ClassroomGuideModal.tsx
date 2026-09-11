import { X, BookOpen, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

interface ClassroomGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassroomGuideModal({ isOpen, onClose }: ClassroomGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-bold">
              초6 인공지능 수업 길잡이: 결정트리와 스무고개
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer text-white"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100">
            <h4 className="font-extrabold text-indigo-900 text-sm flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              1. 결정트리(Decision Tree)란 무엇인가요?
            </h4>
            <p className="text-slate-600">
              나무를 뒤집어 놓은 것처럼, <strong>'질문(노드)'</strong>을 거듭하며 데이터를 <strong>'예 / 아니오 가지(Branch)'</strong>로 
              나누어 최종 <strong>'정답(잎 노드)'</strong>에 도달하는 대표적인 인공지능 분류 알고리즘입니다.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              2. "어떤 질문이 좋은 질문일까요?" (핵심 배움 포인트)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50">
                <span className="font-bold text-rose-700 block mb-1">❌ 비효율적인 질문</span>
                <p className="text-slate-600">
                  "오늘 생일인 친구인가요?"<br />
                  → 16명 중 1명만 '예'이고 15명이 '아니오'라면, 질문을 해도 여전히 15명이나 남아 시간이 오래 걸립니다.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="font-bold text-emerald-700 block mb-1">⭕ 최적의 질문 (정보 이득 높음)</span>
                <p className="text-slate-600">
                  "안경을 썼나요?" (예: 8명, 아니오: 8명)<br />
                  → 질문 단 한 번에 후보의 절반(50%)이 사라집니다! 16명이라도 4번만 질문하면 반드시 1명을 찾아냅니다.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              3. 40분 수업 진행 추천 흐름
            </h4>
            <ol className="space-y-2 text-xs list-decimal pl-4 text-slate-600">
              <li>
                <strong>도입 (5분)</strong>: '샘플 16명 로드' 버튼을 눌러 우리 반 데이터셋을 관찰하고, 속성(안경, 성별, 취미 등)을 이해합니다.
              </li>
              <li>
                <strong>전개 1 (15분)</strong>: [AI 탐정 모드]를 빔프로젝터로 띄우고, 선생님이나 대표 학생이 마음속으로 친구 1명을 정합니다. AI가 던지는 질문에 [예/아니오]로 답하며 어떻게 좁혀지는지 봅니다.
              </li>
              <li>
                <strong>전개 2 (10분)</strong>: [학생 탐정 모드]로 학생들이 직접 질문을 골라보며, 왜 절반으로 나누는 질문이 빠른지 체감합니다.
              </li>
              <li>
                <strong>정리 (10분)</strong>: [결정트리 탐구] 탭으로 이동하여 전체 나무 지도(Root - Branch - Leaf)를 확인하고 인공지능이 판단하는 규칙을 확인합니다.
              </li>
            </ol>
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              확인했습니다! 수업 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
