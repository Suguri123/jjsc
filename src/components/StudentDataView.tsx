import { useState, useMemo, ChangeEvent } from 'react';
import { Student } from '../types';
import { SAMPLE_STUDENTS } from '../data/sampleStudents';
import { 
  UserPlus, 
  RotateCcw, 
  Download, 
  Upload, 
  Search, 
  Edit2, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Check,
  AlertCircle,
  HelpCircle,
  LayoutGrid,
  List
} from 'lucide-react';

interface StudentDataViewProps {
  students: Student[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onResetToSample: () => void;
  onClearAll: () => void;
  onImportData: (students: Student[]) => void;
  onGoToGame: () => void;
}

export default function StudentDataView({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onResetToSample,
  onClearAll,
  onImportData,
  onGoToGame,
}: StudentDataViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterGlasses, setFilterGlasses] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showImportNotice, setShowImportNotice] = useState(false);
  const [showSampleNotice, setShowSampleNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const boys = students.filter(s => s.gender === '남학생').length;
    const girls = students.filter(s => s.gender === '여학생').length;
    const glasses = students.filter(s => s.glasses === '안경 씀').length;
    const extroverts = students.filter(s => s.mbtiStyle.startsWith('E')).length;
    return { total, boys, girls, glasses, extroverts };
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.note && s.note.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchGender = filterGender === 'all' || s.gender === filterGender;
      const matchGlasses = filterGlasses === 'all' || s.glasses === filterGlasses;
      return matchSearch && matchGender && matchGlasses;
    });
  }, [students, searchTerm, filterGender, filterGlasses]);

  const handleExport = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `우리반_학생_데이터_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportData(json);
          setShowImportNotice(true);
          setTimeout(() => setShowImportNotice(false), 3000);
        } else {
          setErrorMessage('올바른 학생 데이터 배열 형식이 아닙니다.');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      } catch (err) {
        setErrorMessage('올바른 JSON 데이터 파일이 아닙니다.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSampleClick = () => {
    onResetToSample();
    setShowSampleNotice(true);
    setTimeout(() => setShowSampleNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {showSampleNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>초등 6학년 테스트용 샘플 학생 16명이 성공적으로 로드되었습니다! 🎉</span>
        </div>
      )}

      {showImportNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>데이터 파일이 성공적으로 불러와졌습니다!</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {/* Top Banner / Explanation for 6th Grade */}
      <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 rounded-2xl p-5 border border-indigo-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>1단계: 인공지능이 학습할 우리 반 데이터 준비하기</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">
              친구들의 특징 데이터 모음소 ({students.length}명)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              결정트리는 다양한 특징(성별, 안경, 관심분야 등) 데이터를 기반으로 최적의 질문을 찾아냅니다. 
              수업용으로 미리 준비된 <strong>16명 샘플 데이터</strong>를 바로 사용하거나, 우리 반 친구들을 직접 추가해 보세요!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadSampleClick}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="초등 6학년 재미있는 샘플 학생 16명 로드"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              샘플 16명 로드
            </button>
            <button
              onClick={onAddStudent}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              새 친구 추가하기
            </button>
            <button
              onClick={onGoToGame}
              disabled={students.length < 2}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                students.length >= 2
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              스무고개 놀이 시작하기! →
            </button>
          </div>
        </div>

        {/* Quick Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-4 border-t border-indigo-100/60 text-xs">
          <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">전체 친구</span>
            <span className="font-extrabold text-indigo-700 text-base">{stats.total}명</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">👦 남 / 👧 여</span>
            <span className="font-bold text-slate-700">{stats.boys} / {stats.girls}명</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">👓 안경 씀</span>
            <span className="font-bold text-slate-700">{stats.glasses}명</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">⚡ 활발형 (E)</span>
            <span className="font-bold text-slate-700">{stats.extroverts}명</span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white/80 rounded-xl p-2.5 border border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500 font-medium">결정트리 상태</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {students.length >= 2 ? '준비 완료' : '2명 이상 필요'}
            </span>
          </div>
        </div>
      </div>

      {showImportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          데이터를 성공적으로 불러왔습니다!
        </div>
      )}

      {/* Control / Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="친구 닉네임 검색..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          {/* Quick Filters */}
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            aria-label="성별 필터"
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">성별 전체</option>
            <option value="남학생">👦 남학생만</option>
            <option value="여학생">👧 여학생만</option>
          </select>

          <select
            value={filterGlasses}
            onChange={(e) => setFilterGlasses(e.target.value)}
            aria-label="안경 착용 필터"
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">안경 전체</option>
            <option value="안경 씀">👓 안경 씀</option>
            <option value="안경 안 씀">👀 안경 안 씀</option>
          </select>
        </div>

        {/* View Mode & Backup options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="카드 형태로 보기"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="표 형태로 보기"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExport}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
            title="현재 학생 데이터 JSON 백업 저장"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">저장</span>
          </button>

          <label 
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
            title="저장했던 학생 데이터 불러오기"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">불러오기</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={onClearAll}
            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
            title="모든 학생 데이터 비우기"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>
        </div>
      </div>

      {/* Student List (Grid or Table) */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium text-sm mb-3">
            조건에 맞는 학생 데이터가 없습니다.
          </p>
          <button
            onClick={onResetToSample}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            샘플 학생 16명 불러오기
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm border ${student.avatarBg || 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                      {student.nickname.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-800 text-sm">{student.name || student.nickname}</h4>
                        {student.name && student.nickname !== student.name && (
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {student.nickname}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          student.gender === '남학생' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {student.gender}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {student.glasses}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => onEditStudent(student)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(student.id)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attributes Grid */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-100 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">👕 옷 색상</span>
                    <span className="font-semibold text-slate-700">{student.clothingColor.split('(')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">🧦 양말 색</span>
                    <span className="font-semibold text-slate-700">{student.socksColor.split('(')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">⚡ 성향(MBTI)</span>
                    <span className="font-semibold text-slate-700">{student.mbtiStyle.split(' ')[0]} ({student.mbtiStyle.split('(')[1]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">🎯 관심분야</span>
                    <span className="font-semibold text-indigo-700">{student.interest}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">📚 자신 과목</span>
                    <span className="font-semibold text-slate-700">{student.subject}</span>
                  </div>
                </div>
              </div>

              {student.note && (
                <p className="text-[11px] text-slate-500 italic mt-2.5 px-1 truncate" title={student.note}>
                  💬 "{student.note}"
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">이름 (정답)</th>
                <th className="px-3 py-3">닉네임 (별명)</th>
                <th className="px-3 py-3">성별</th>
                <th className="px-3 py-3">안경</th>
                <th className="px-3 py-3">옷 색상</th>
                <th className="px-3 py-3">양말 색</th>
                <th className="px-3 py-3">성향(E/I)</th>
                <th className="px-3 py-3">관심분야</th>
                <th className="px-3 py-3">자신 과목</th>
                <th className="px-3 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-indigo-50/40 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg text-[10px] font-extrabold flex items-center justify-center border ${student.avatarBg || 'bg-slate-100'}`}>
                      {(student.name || student.nickname).slice(0, 1)}
                    </span>
                    {student.name || student.nickname}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-indigo-700">{student.nickname}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded font-medium text-[11px] ${
                      student.gender === '남학생' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                    }`}>
                      {student.gender}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{student.glasses}</td>
                  <td className="px-3 py-2.5">{student.clothingColor.split('(')[0]}</td>
                  <td className="px-3 py-2.5">{student.socksColor.split('(')[0]}</td>
                  <td className="px-3 py-2.5 font-medium">{student.mbtiStyle.split(' ')[0]}</td>
                  <td className="px-3 py-2.5 font-semibold text-indigo-700">{student.interest}</td>
                  <td className="px-3 py-2.5">{student.subject}</td>
                  <td className="px-3 py-2.5 text-right space-x-1">
                    <button
                      onClick={() => onEditStudent(student)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(student.id)}
                      className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
