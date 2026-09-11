import { useState, FormEvent } from 'react';
import { Lock, X, KeyRound, Check, AlertCircle } from 'lucide-react';
import { verifyTeacherPinInFirebase } from '../lib/firebase';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  currentPin: string;
}

export default function TeacherAuthModal({
  isOpen,
  onClose,
  onSuccess,
  currentPin,
}: TeacherAuthModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    const inputPin = pin.trim();

    try {
      // 1. First verify with Firebase (works everywhere including Vercel)
      const isValidOnFirebase = await verifyTeacherPinInFirebase(inputPin, currentPin);
      if (isValidOnFirebase) {
        onSuccess(inputPin);
        onClose();
        setPin('');
        return;
      }

      // 2. Try legacy REST endpoint if Firebase doc is not set yet
      const res = await fetch('/api/teacher/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: inputPin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(inputPin);
        onClose();
        setPin('');
      } else {
        setError(data.error || '비밀번호가 일치하지 않습니다.');
      }
    } catch {
      // 3. Fallback local check
      if (inputPin === currentPin || inputPin === '1234') {
        onSuccess(inputPin);
        onClose();
        setPin('');
      } else {
        setError('비밀번호가 올바르지 않습니다. (기본값: 1234)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">선생님 전용 관리 모드</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer text-white"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <div className="space-y-1 text-center">
            <p className="text-xs text-slate-600">
              학생 데이터 관리 및 전체 스무고개 퀴즈 진행을 위해<br />
              <strong>교사 비밀번호</strong>를 입력해 주세요.
            </p>
            <p className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 py-1 rounded-lg mt-2">
              💡 초기 기본 비밀번호: <strong>1234</strong>
            </p>
          </div>

          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError('');
              }}
              placeholder="비밀번호 입력 (기본: 1234)"
              autoFocus
              className="w-full px-4 py-3 text-center tracking-widest text-lg font-black rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            {error && (
              <p className="text-xs font-bold text-rose-500 mt-1.5 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>교사 페이지 입장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
