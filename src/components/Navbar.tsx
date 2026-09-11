import { Database, Gamepad2, GitFork, BookOpen, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: 'data' | 'game' | 'tree';
  onSelectTab: (tab: 'data' | 'game' | 'tree') => void;
  studentCount: number;
  onOpenGuide: () => void;
}

export default function Navbar({ currentTab, onSelectTab, studentCount, onOpenGuide }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / App Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  결정트리 스무고개
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
                  초6 인공지능 탐구
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                우리 반 데이터로 배우는 인공지능 분류 알고리즘
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('data')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'data'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>1. 학생 데이터</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-extrabold">
                {studentCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('game')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'game'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              <span>2. 스무고개 놀이</span>
            </button>

            <button
              onClick={() => onSelectTab('tree')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'tree'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GitFork className="w-4 h-4 text-purple-600" />
              <span>3. 결정트리 지도</span>
            </button>

            {/* Classroom Guide modal button */}
            <button
              onClick={onOpenGuide}
              className="ml-1 sm:ml-2 p-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="수업 길잡이 및 활용 팁 보기"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">수업 팁</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
