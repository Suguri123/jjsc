import { useState, FormEvent } from 'react';
import { 
  Gender, 
  Glasses, 
  ClothingColor, 
  MbtiStyle, 
  SocksColor, 
  Interest, 
  Subject,
  Student
} from '../types';
import { saveStudentToFirebase } from '../lib/firebase';
import { sendStudentToGoogleSheets, getGoogleSheetConfig } from '../utils/googleSheets';
import { Sparkles, CheckCircle2, Lock, ArrowRight, User, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface StudentEntryFormProps {
  onSubmittedSuccess: () => void;
  onOpenTeacherAuth: () => void;
  totalSubmissions: number;
}

const AVATAR_BG_OPTIONS = [
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

export default function StudentEntryForm({
  onSubmittedSuccess,
  onOpenTeacherAuth,
  totalSubmissions,
}: StudentEntryFormProps) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender>('남학생');
  const [glasses, setGlasses] = useState<Glasses>('안경 안 씀');
  const [clothingColor, setClothingColor] = useState<ClothingColor>('무채색(검정·흰·회색)');
  const [mbtiStyle, setMbtiStyle] = useState<MbtiStyle>('E (활발·사교적)');
  const [socksColor, setSocksColor] = useState<SocksColor>('흰색');
  const [interest, setInterest] = useState<Interest>('게임·e스포츠');
  const [subject, setSubject] = useState<Subject>('수학·과학');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    nickname: string;
    gender: string;
    glasses: string;
    interest: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('학생의 실제 이름을 적어주세요! (최종 정답 대상)');
      return;
    }
    if (!nickname.trim()) {
      setErrorMessage('친구들이 알아볼 수 있는 활동 닉네임(별명)을 적어주세요!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const randomBg = AVATAR_BG_OPTIONS[Math.floor(Math.random() * AVATAR_BG_OPTIONS.length)];
    const studentData: Student = {
      id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      nickname: nickname.trim(),
      gender,
      glasses,
      clothingColor,
      mbtiStyle,
      socksColor,
      interest,
      subject,
      avatarBg: randomBg,
      submittedAt: new Date().toISOString(),
    };

    try {
      // 1. Save directly to Firebase Firestore (works on Vercel anywhere!)
      await saveStudentToFirebase(studentData);

      // 2. Real-time sync to Google Sheets (if configured)
      sendStudentToGoogleSheets(studentData).catch((err) => {
        console.warn('Google Sheets real-time sync skipped or error:', err);
      });

      // 3. Also try legacy local server if available (quietly in background)
      fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      }).catch(() => {});

      setSubmittedData({
        name: name.trim(),
        nickname: nickname.trim(),
        gender,
        glasses,
        interest,
      });

      onSubmittedSuccess();
    } catch (firebaseErr) {
      console.warn('Firebase submission failed, trying fallback server...', firebaseErr);
      // Even if Firebase fails, try Google Sheets
      sendStudentToGoogleSheets(studentData).catch(() => {});
      try {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData),
        });
        if (!res.ok) throw new Error('서버 전송 실패');

        setSubmittedData({
          name: name.trim(),
          nickname: nickname.trim(),
          gender,
          glasses,
          interest,
        });
        onSubmittedSuccess();
      } catch (err) {
        setErrorMessage('제출에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Bar for Teacher Switch */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600">
            현재 우리 반 제출 현황: <strong className="text-indigo-600">{totalSubmissions}명</strong>
          </span>
          {getGoogleSheetConfig().webhookUrl && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
              <span>구글 시트 연동 중</span>
            </span>
          )}
        </div>

        <button
          onClick={onOpenTeacherAuth}
          className="text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>선생님 관리 모드</span>
        </button>
      </div>

      {/* Submitted Success Card */}
      {submittedData ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner">
            🎉
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full border border-emerald-200">
                제출 완료
              </span>
              {getGoogleSheetConfig().webhookUrl && (
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-extrabold rounded-full border border-teal-200 flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                  <span>구글 시트 실시간 저장됨 📊</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-800">
              "{submittedData.name}" ({submittedData.nickname}) 친구의 정보가 등록되었어요!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              선생님 화면(앞쪽 칠판/스크린)에 내 정보가 성공적으로 도착했습니다. 
              다른 친구들이 모두 등록할 때까지 <strong>앞쪽 스크린을 보며 잠시 대기</strong>해 주세요!
            </p>
          </div>

          {/* Quick Preview Badge */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-2 text-slate-700">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">실제 이름 (정답):</span>
              <strong className="text-sm font-black text-slate-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                {submittedData.name}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">활동 닉네임 (별명):</span>
              <strong className="text-sm font-black text-indigo-700">{submittedData.nickname}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">성별:</span>
              <span>{submittedData.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">안경:</span>
              <span>{submittedData.glasses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">관심분야:</span>
              <span>{submittedData.interest}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setSubmittedData(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>내용을 잘못 적었나요? 다시 작성하기</span>
            </button>
          </div>
        </div>
      ) : (
        /* Main Student Input Form */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Form Header */}
          <div className="text-center space-y-2 pb-4 border-b border-slate-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-extrabold border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>초등 6학년 인공지능 결정트리 탐정 교실</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              내 특징 데이터 입력하기
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              선생님과 함께할 <strong>"스무고개 인공지능 탐정 놀이"</strong>를 위해<br className="hidden sm:inline" />
              나의 특징을 솔직하고 정확하게 선택해 주세요!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. 이름 및 닉네임 입력 */}
            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-extrabold text-slate-800">
                  이름 및 닉네임 입력 <span className="text-rose-500">*</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 이름 (실명) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">
                    🏷️ 학생 실제 이름 <span className="text-rose-500">*</span>
                    <span className="text-[11px] font-normal text-slate-500 ml-1.5">(최종 정답 공개용)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="예: 김민우, 박서연"
                    maxLength={10}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 text-sm font-bold bg-white"
                  />
                  <p className="text-[11px] text-slate-500">
                    * 스무고개 마지막에 공개될 <strong>진짜 이름</strong>입니다.
                  </p>
                </div>

                {/* 닉네임 (별명) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">
                    ✨ 활동 닉네임(별명) <span className="text-rose-500">*</span>
                    <span className="text-[11px] font-normal text-slate-500 ml-1.5">(스무고개 힌트용)</span>
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="예: 축구왕민우, 춤추는서연"
                    maxLength={12}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 text-sm font-bold bg-white"
                  />
                  <p className="text-[11px] text-slate-500">
                    * 친구들이 추리할 때 힌트로 보여줄 <strong>재미있는 별명</strong>입니다.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  ⚠️ {errorMessage}
                </p>
              )}
            </div>

            {/* 2. 성별을 선택해 주세요 */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                👤 2. 성별을 선택해 주세요
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['남학생', '여학생'] as Gender[]).map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setGender(val)}
                    className={`py-3 px-4 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      gender === val
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm scale-101'
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
              <label className="block text-sm font-bold text-slate-800 mb-2">
                👓 3. 지금 안경을 쓰고 있나요?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['안경 씀', '안경 안 씀'] as Glasses[]).map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setGlasses(val)}
                    className={`py-3 px-4 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      glasses === val
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm scale-101'
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
              <label className="block text-sm font-bold text-slate-800 mb-2">
                👕 4. 평소 즐겨 입는 옷 색상 계열은?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['무채색(검정·흰·회색)', '유채색(파랑·빨강 등)', '파스텔·밝은색'] as ClothingColor[]).map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setClothingColor(val)}
                    className={`py-2.5 px-2 rounded-2xl border-2 text-xs font-bold text-center transition-all cursor-pointer ${
                      clothingColor === val
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>{val.split('(')[0]}</div>
                    {val.includes('(') && (
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                        ({val.split('(')[1]}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. 오늘 신은 양말 색깔은? */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                🧦 5. 오늘 신은 양말 색깔은?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['흰색', '어두운색(검정·남색·회색)', '화려한 색·무늬'] as SocksColor[]).map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setSocksColor(val)}
                    className={`py-2.5 px-2 rounded-2xl border-2 text-xs font-bold text-center transition-all cursor-pointer ${
                      socksColor === val
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
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
              <label className="block text-sm font-bold text-slate-800 mb-2">
                ⚡ 6. MBTI(E / I)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['E (활발·사교적)', 'I (차분·집중적)'] as MbtiStyle[]).map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setMbtiStyle(val)}
                    className={`py-3 px-3 rounded-2xl border-2 text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${
                      mbtiStyle === val
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
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
              <label className="block text-sm font-bold text-slate-800 mb-2">
                🎯 7. 관심 있는 분야는?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(['게임·e스포츠', 'K-POP·아이돌', '운동·스포츠', '만화·웹툰·애니', '창작·독서·요리'] as Interest[]).map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setInterest(val)}
                    className={`py-2.5 px-2 rounded-2xl border-2 text-xs font-bold text-center transition-all cursor-pointer ${
                      interest === val
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
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
              <label className="block text-sm font-bold text-slate-800 mb-2">
                📚 8. 자신 있거나 좋아하는 과목은?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['수학·과학', '국어·사회·영어', '체육·음악·미술', '정보(컴퓨터)'] as Subject[]).map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setSubject(val)}
                    className={`py-2.5 px-2 rounded-2xl border-2 text-xs font-bold text-center transition-all cursor-pointer ${
                      subject === val
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Submit CTA Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base sm:text-lg shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
              >
                <span>선생님 화면으로 내 정보 제출하기 🚀</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                제출하면 선생님 교탁 화면(빔프로젝터)에 실시간으로 집계됩니다.
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
