import { useState, FormEvent } from 'react';
import { Student } from '../types';
import StudentDataView from './StudentDataView';
import ClassroomLotteryGame from './ClassroomLotteryGame';
import TreeVisualizerView from './TreeVisualizerView';
import GoogleSheetModal from './GoogleSheetModal';
import ExcelSheetView from './ExcelSheetView';
import { 
  Users, 
  Dices, 
  GitFork, 
  LogOut, 
  KeyRound, 
  BookOpen, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { exportStudentsToExcel } from '../utils/exportExcel';
import { getGoogleSheetConfig } from '../utils/googleSheets';

interface TeacherDashboardProps {
  students: Student[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onResetToSample: () => void;
  onClearAll: () => void;
  onImportData: (students: Student[]) => void;
  onLogoutTeacher: () => void;
  onOpenGuide: () => void;
  teacherPin: string;
  onChangePin: (oldPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
}

export default function TeacherDashboard({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onResetToSample,
  onClearAll,
  onImportData,
  onLogoutTeacher,
  onOpenGuide,
  teacherPin,
  onChangePin,
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'excel' | 'game' | 'tree'>('submissions');
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showGoogleSheetModal, setShowGoogleSheetModal] = useState(false);
  const [sheetConfig, setSheetConfig] = useState(() => getGoogleSheetConfig());
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);

  const handlePinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess(false);

    if (!oldPinInput || !newPinInput) {
      setPinChangeError('모든 필드를 입력해 주세요.');
      return;
    }

    if (newPinInput.trim().length < 4) {
      setPinChangeError('새 비밀번호는 최소 4자리 이상이어야 합니다.');
      return;
    }

    setIsSubmittingPin(true);
    try {
      const result = await onChangePin(oldPinInput.trim(), newPinInput.trim());
      if (result.success) {
        setPinChangeSuccess(true);
        setTimeout(() => {
          setShowChangePinModal(false);
          setPinChangeSuccess(false);
          setOldPinInput('');
          setNewPinInput('');
        }, 1500);
      } else {
        setPinChangeError(result.error || '현재 비밀번호가 일치하지 않습니다.');
      }
    } catch {
      setPinChangeError('비밀번호 변경 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingPin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Teacher Workspace Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            👨‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                교사용 수업 진행실
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span>실시간 수집 중</span>
                {sheetConfig.webhookUrl && (
                  <span className="text-teal-300">· 구글 시트 연동 🟢</span>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              학생들이 개별 기기에서 입력한 데이터가 실시간으로 수집되고 있습니다.
            </p>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {sheetConfig.sheetUrl && (
            <a
              href={sheetConfig.sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-teal-600 shadow-xs"
              title="연동된 구글 스프레드시트 열기"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-300" />
              <span>구글 시트 열기</span>
            </a>
          )}

          <button
            onClick={() => setShowGoogleSheetModal(true)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              sheetConfig.webhookUrl
                ? 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border-emerald-600 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="구글 스프레드시트 실시간 데이터 연동 설정"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>구글 시트 연동 {sheetConfig.webhookUrl ? '🟢' : '⚙️'}</span>
          </button>

          <button
            onClick={() => exportStudentsToExcel(students)}
            disabled={students.length === 0}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="현재 수집된 모든 학생 데이터를 엑셀(CSV) 파일로 일괄 다운로드합니다."
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>엑셀 다운로드 ({students.length}명)</span>
          </button>

          <button
            onClick={() => setShowChangePinModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>비밀번호 변경</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>수업 길잡이</span>
          </button>

          <button
            onClick={onLogoutTeacher}
            className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>학생 모드로 나가기</span>
          </button>
        </div>
      </div>

      {/* Classroom Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'submissions'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. 학생 제출 현황</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'submissions' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
            }`}>
              {students.length}명
            </span>
          </button>

          <button
            onClick={() => setActiveTab('excel')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'excel'
                ? 'bg-[#107C41] text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>2. 실시간 엑셀 시트 화면</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'excel' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
            }`}>
              실시간
            </span>
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'game'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Dices className="w-4 h-4 text-amber-400" />
            <span>3. 스무고개 추측 퀴즈</span>
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'tree'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <GitFork className="w-4 h-4 text-emerald-400" />
            <span>4. 결정트리 지도</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'submissions' && (
        <StudentDataView
          students={students}
          onAddStudent={onAddStudent}
          onEditStudent={onEditStudent}
          onDeleteStudent={onDeleteStudent}
          onResetToSample={onResetToSample}
          onClearAll={onClearAll}
          onImportData={onImportData}
          onGoToGame={() => setActiveTab('game')}
        />
      )}

      {activeTab === 'excel' && (
        <div className="space-y-4">
          <ExcelSheetView
            students={students}
            onAddStudent={onAddStudent}
            onEditStudent={onEditStudent}
            onDeleteStudent={onDeleteStudent}
            onResetToSample={onResetToSample}
          />
        </div>
      )}

      {activeTab === 'game' && (
        <ClassroomLotteryGame
          students={students}
          onGoToTree={() => setActiveTab('tree')}
        />
      )}

      {activeTab === 'tree' && (
        <TreeVisualizerView
          students={students}
          onGoToGame={() => setActiveTab('game')}
        />
      )}

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <span>교사 비밀번호 변경</span>
            </h3>

            {pinChangeSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>비밀번호가 성공적으로 변경되었습니다!</span>
              </div>
            ) : (
              <form onSubmit={handlePinSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={oldPinInput}
                    onChange={(e) => setOldPinInput(e.target.value)}
                    placeholder="현재 비밀번호"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    새 비밀번호 (4자리 이상)
                  </label>
                  <input
                    type="password"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="새 비밀번호 입력"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                {pinChangeError && (
                  <p className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pinChangeError}</span>
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePinModal(false)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPin}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {isSubmittingPin ? '변경 저장 중...' : '변경 저장'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google Sheets Integration Modal */}
      {showGoogleSheetModal && (
        <GoogleSheetModal
          isOpen={showGoogleSheetModal}
          onClose={() => setShowGoogleSheetModal(false)}
          students={students}
          onConfigUpdated={() => setSheetConfig(getGoogleSheetConfig())}
        />
      )}
    </div>
  );
}
