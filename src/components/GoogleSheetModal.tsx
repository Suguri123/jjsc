import { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  HelpCircle,
  FileSpreadsheet,
  Link2
} from 'lucide-react';
import { 
  getGoogleSheetConfig, 
  saveGoogleSheetConfig, 
  sendStudentToGoogleSheets, 
  GOOGLE_APPS_SCRIPT_CODE 
} from '../utils/googleSheets';
import { Student } from '../types';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onConfigUpdated: () => void;
}

export default function GoogleSheetModal({
  isOpen,
  onClose,
  students,
  onConfigUpdated
}: GoogleSheetModalProps) {
  const [config, setConfig] = useState(() => getGoogleSheetConfig());
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveGoogleSheetConfig(config);
    onConfigUpdated();
    onClose();
  };

  const handleSyncAll = async () => {
    if (!config.webhookUrl) {
      setTestResult({ success: false, message: 'Apps Script 웹 앱 URL을 먼저 입력해 주세요.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await sendStudentToGoogleSheets(students, config.webhookUrl);
    setIsTesting(false);

    if (res.success) {
      saveGoogleSheetConfig(config);
      onConfigUpdated();
      setTestResult({
        success: true,
        message: `학생 ${students.length}명의 데이터가 구글 시트로 성공적으로 업로드되었습니다!`
      });
    } else {
      setTestResult({
        success: false,
        message: res.message || '업로드 중 오류가 발생했습니다. URL을 확인해 주세요.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                구글 스프레드시트 실시간 연동
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
                  Google Sheets
                </span>
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                학생이 자기 기기에서 등록하면 구글 시트에 행으로 즉시 기록됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm">
          {/* Step Guide */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-sm">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              1분 만에 끝나는 초간단 구글 시트 연동법
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-emerald-800 text-xs leading-relaxed">
              <li>
                새 <strong>구글 스프레드시트</strong>를 열고 상단 메뉴 <strong>[확장 프로그램] → [Apps Script]</strong>를 누릅니다.
              </li>
              <li className="flex flex-col gap-1.5">
                <span>기존 내용을 모두 지우고, 아래 자동 수집 코드를 복사해서 붙여넣습니다:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사 완료! 붙여넣기하세요' : '연동 코드 복사하기'}</span>
                  </button>
                </div>
              </li>
              <li>
                우측 상단 <strong>[배포] → [새 배포]</strong> 클릭 → 톱니바퀴에서 <strong>[웹 앱]</strong> 선택
              </li>
              <li>
                액세스 권한을 반드시 <strong>[모든 사용자 (Anyone)]</strong>로 설정 후 <strong>[배포]</strong>를 클릭합니다.
              </li>
              <li>
                발급된 <strong>웹 앱 URL</strong> (<code>https://script.google.com/macros/s/.../exec</code>)을 아래에 붙여넣으면 끝!
              </li>
            </ol>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Apps Script 웹 앱 URL (데이터 수신용)</span>
                <span className="text-rose-500 font-bold">*필수</span>
              </label>
              <input
                type="url"
                value={config.webhookUrl}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                학생이 제출할 때마다 이 URL로 학생 데이터가 실시간 전송됩니다.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>내 구글 스프레드시트 열람 링크 (선택)</span>
              </label>
              <input
                type="url"
                value={config.sheetUrl}
                onChange={(e) => setConfig({ ...config, sheetUrl: e.target.value })}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                입력해 두시면 화면 상단에서 클릭 한 번으로 바로 구글 시트 탭을 띄워 볼 수 있습니다.
              </p>
            </div>
          </div>

          {/* Test & Sync All Button */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-800 text-xs">현재 저장된 학생 데이터 일괄 업로드</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                현재 시스템에 있는 학생 {students.length}명의 데이터를 구글 시트에 바로 밀어 넣습니다.
              </div>
            </div>
            <button
              onClick={handleSyncAll}
              disabled={isTesting || students.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTesting ? '업로드 중...' : `전체 ${students.length}명 시트로 전송`}</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <X className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {config.sheetUrl && (
              <a
                href={config.sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 underline underline-offset-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>연동된 구글 시트 열기</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-bold text-xs cursor-pointer"
            >
              닫기
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
