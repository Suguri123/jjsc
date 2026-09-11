import { useState, FormEvent } from 'react';
import { Student, Gender, Glasses, ClothingColor, MbtiStyle, SocksColor, Interest, Subject } from '../types';
import { ATTRIBUTE_DEFINITIONS } from '../data/attributes';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  editingStudent?: Student | null;
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-300',
  'bg-pink-100 text-pink-700 border-pink-300',
  'bg-emerald-100 text-emerald-700 border-emerald-300',
  'bg-amber-100 text-amber-700 border-amber-300',
  'bg-purple-100 text-purple-700 border-purple-300',
  'bg-cyan-100 text-cyan-700 border-cyan-300',
  'bg-rose-100 text-rose-700 border-rose-300',
  'bg-violet-100 text-violet-700 border-violet-300',
  'bg-orange-100 text-orange-700 border-orange-300',
];

export default function StudentModal({ isOpen, onClose, onSave, editingStudent }: StudentModalProps) {
  const [name, setName] = useState(editingStudent?.name || '');
  const [nickname, setNickname] = useState(editingStudent?.nickname || '');
  const [gender, setGender] = useState<Gender>(editingStudent?.gender || '남학생');
  const [glasses, setGlasses] = useState<Glasses>(editingStudent?.glasses || '안경 안 씀');
  const [clothingColor, setClothingColor] = useState<ClothingColor>(editingStudent?.clothingColor || '무채색(검정·흰·회색)');
  const [mbtiStyle, setMbtiStyle] = useState<MbtiStyle>(editingStudent?.mbtiStyle || 'E (활발·사교적)');
  const [socksColor, setSocksColor] = useState<SocksColor>(editingStudent?.socksColor || '흰색');
  const [interest, setInterest] = useState<Interest>(editingStudent?.interest || '게임·e스포츠');
  const [subject, setSubject] = useState<Subject>(editingStudent?.subject || '수학·과학');
  const [note, setNote] = useState(editingStudent?.note || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('학생의 실제 이름을 입력해 주세요! (최종 정답용)');
      return;
    }
    if (!nickname.trim()) {
      setError('학생의 활동 닉네임을 입력해 주세요! (별명 힌트용)');
      return;
    }

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newStudent: Student = {
      id: editingStudent?.id || `student-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      nickname: nickname.trim(),
      gender,
      glasses,
      clothingColor,
      mbtiStyle,
      socksColor,
      interest,
      subject,
      avatarBg: editingStudent?.avatarBg || randomColor,
      note: note.trim() || undefined,
    };

    onSave(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div 
        id="student-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <h3 className="text-lg font-bold">
              {editingStudent ? '친구 정보 수정하기' : '우리 반 새 친구 등록하기'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Name & Nickname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                🏷️ 실제 이름 <span className="text-rose-500">*</span>
                <span className="text-[10px] text-slate-500 ml-1">(정답 공개용)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="예: 김민우"
                maxLength={10}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 text-sm font-semibold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ✨ 활동 닉네임 <span className="text-rose-500">*</span>
                <span className="text-[10px] text-slate-500 ml-1">(별명 힌트용)</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (error) setError('');
                }}
                placeholder="예: 축구왕민우"
                maxLength={15}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 text-sm font-semibold bg-white"
              />
            </div>
            {error && <p className="col-span-full text-xs font-semibold text-rose-500">{error}</p>}
          </div>

          {/* 1. 성별 */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              👤 1. 성별
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['남학생', '여학생'] as Gender[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setGender(val)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    gender === val
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {val === '남학생' ? '👦 남학생' : '👧 여학생'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 지금 안경을 쓰고 있나요? */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              👓 3. 지금 안경을 쓰고 있나요?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['안경 씀', '안경 안 씀'] as Glasses[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setGlasses(val)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    glasses === val
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {val === '안경 씀' ? '👓 안경 씀' : '👀 안경 안 씀'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. 평소 즐겨 입는 옷 색상 계열은? */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              👕 4. 평소 즐겨 입는 옷 색상 계열은?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['무채색(검정·흰·회색)', '유채색(파랑·빨강 등)', '파스텔·밝은색'] as ClothingColor[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setClothingColor(val)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                    clothingColor === val
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {val.split('(')[0]}
                  {val.includes('(') && (
                    <span className="block text-[10px] text-slate-400 mt-0.5">({val.split('(')[1]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 5. 오늘 신은 양말 색깔은? */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              🧦 5. 오늘 신은 양말 색깔은?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['흰색', '어두운색(검정·남색·회색)', '화려한 색·무늬'] as SocksColor[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setSocksColor(val)}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                    socksColor === val
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {val.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 6. MBTI(E / I) */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              ⚡ 6. MBTI(E / I)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['E (활발·사교적)', 'I (차분·집중적)'] as MbtiStyle[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setMbtiStyle(val)}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    mbtiStyle === val
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* 7. 관심 있는 분야는? */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              🎯 7. 관심 있는 분야는?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['게임·e스포츠', 'K-POP·아이돌', '운동·스포츠', '만화·웹툰·애니', '창작·독서·요리'] as Interest[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setInterest(val)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                    interest === val
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* 8. 자신 있거나 좋아하는 과목은? */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              📚 8. 자신 있거나 좋아하는 과목은?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['수학·과학', '국어·사회·영어', '체육·음악·미술', '정보(컴퓨터)'] as Subject[]).map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setSubject(val)}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                    subject === val
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              ✨ 한 줄 메모 (선택사항)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 3점 슛의 달인, 미소가 예쁜 친구"
              maxLength={40}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              {editingStudent ? '수정 완료' : '친구 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
