import { useState, useMemo, useEffect, useRef } from 'react';
import { Student } from '../types';
import { exportStudentsToExcel } from '../utils/exportExcel';
import { 
  Download, 
  Search, 
  Sparkles, 
  FileSpreadsheet, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  UserPlus, 
  Trash2,
  Edit2,
  Zap,
  Bell,
  CheckCircle2
} from 'lucide-react';

interface ExcelSheetViewProps {
  students: Student[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onResetToSample: () => void;
}

const COLUMNS = [
  { id: 'A', name: '번호', width: 'w-14 min-w-[56px]' },
  { id: 'B', name: '이름 (실명)', width: 'w-28 min-w-[110px]' },
  { id: 'C', name: '닉네임 (별명)', width: 'w-28 min-w-[110px]' },
  { id: 'D', name: '성별', width: 'w-20 min-w-[80px]' },
  { id: 'E', name: '안경 착용', width: 'w-24 min-w-[96px]' },
  { id: 'F', name: '상의 옷 색상', width: 'w-36 min-w-[140px]' },
  { id: 'G', name: '성향 (MBTI)', width: 'w-32 min-w-[130px]' },
  { id: 'H', name: '양말 색상', width: 'w-32 min-w-[130px]' },
  { id: 'I', name: '관심사/취미', width: 'w-36 min-w-[140px]' },
  { id: 'J', name: '좋아하는 과목', width: 'w-32 min-w-[130px]' },
  { id: 'K', name: '제출 일시', width: 'w-36 min-w-[140px]' },
  { id: 'L', name: '비고/메모', width: 'w-48 min-w-[190px]' },
];

export default function ExcelSheetView({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onResetToSample
}: ExcelSheetViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>({ row: 1, col: 'B' });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'all' | 'summary'>('all');

  // Real-time update tracking & highlight
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [liveBanner, setLiveBanner] = useState<{ message: string; time: string; studentName: string } | null>(null);
  const prevStudentsRef = useRef<Student[]>(students);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevStudentsRef.current = students;
      return;
    }

    const prevMap = new Map(prevStudentsRef.current.map(s => [s.id, s]));
    const newlyAddedOrUpdated: string[] = [];
    let latestUpdatedStudent: Student | null = null;

    students.forEach(s => {
      const prev = prevMap.get(s.id);
      if (!prev) {
        newlyAddedOrUpdated.push(s.id);
        latestUpdatedStudent = s;
      } else if (JSON.stringify(prev) !== JSON.stringify(s)) {
        newlyAddedOrUpdated.push(s.id);
        latestUpdatedStudent = s;
      }
    });

    if (newlyAddedOrUpdated.length > 0) {
      setHighlightedIds(prev => {
        const next = new Set(prev);
        newlyAddedOrUpdated.forEach(id => next.add(id));
        return next;
      });

      if (latestUpdatedStudent) {
        const studentObj = latestUpdatedStudent as Student;
        const nameText = `${studentObj.name || studentObj.nickname} (${studentObj.nickname})`;
        const timeText = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLiveBanner({
          message: `방금 "${nameText}" 학생의 데이터가 실시간으로 입력되었습니다! 🎉`,
          time: timeText,
          studentName: nameText
        });
      }

      const timer = setTimeout(() => {
        setHighlightedIds(prev => {
          const next = new Set(prev);
          newlyAddedOrUpdated.forEach(id => next.delete(id));
          return next;
        });
      }, 6000);

      prevStudentsRef.current = students;
      return () => clearTimeout(timer);
    }

    prevStudentsRef.current = students;
  }, [students]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(s => 
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.nickname && s.nickname.toLowerCase().includes(term)) ||
      (s.interest && s.interest.toLowerCase().includes(term)) ||
      (s.clothingColor && s.clothingColor.toLowerCase().includes(term))
    );
  }, [students, searchTerm]);

  // Selected cell value for formula bar
  const selectedCellValue = useMemo(() => {
    if (!selectedCell || !filteredStudents[selectedCell.row - 1]) return '';
    const s = filteredStudents[selectedCell.row - 1];
    switch (selectedCell.col) {
      case 'A': return String(selectedCell.row);
      case 'B': return s.name || s.nickname;
      case 'C': return s.nickname;
      case 'D': return s.gender;
      case 'E': return s.glasses;
      case 'F': return s.clothingColor;
      case 'G': return s.mbtiStyle;
      case 'H': return s.socksColor;
      case 'I': return s.interest;
      case 'J': return s.subject;
      case 'K': return s.submittedAt ? new Date(s.submittedAt).toLocaleTimeString('ko-KR') : '-';
      case 'L': return s.note || '';
      default: return '';
    }
  }, [selectedCell, filteredStudents]);

  return (
    <div className={`bg-white rounded-3xl border-2 border-[#107C41] shadow-2xl overflow-hidden flex flex-col font-sans transition-all duration-300 ${
      isFullScreen ? 'fixed inset-3 z-50 rounded-2xl' : 'w-full'
    }`}>
      {/* Excel Ribbon / Title Bar */}
      <div className="bg-[#107C41] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-white text-base shadow-inner">
            X
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">
                우리반_스무고개_학생데이터.xlsx
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-[10px] font-bold text-emerald-200 border border-emerald-600/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                실시간 연동 중
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 hidden sm:block">
              Microsoft Excel 스타일 실시간 데이터 시트 뷰
            </p>
          </div>
        </div>

        {/* Excel Ribbon Quick Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportStudentsToExcel(students)}
            className="px-3 py-1.5 rounded-lg bg-white text-[#107C41] hover:bg-emerald-50 text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="실제 .csv 엑셀 파일로 즉시 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-[#107C41]" />
            <span>엑셀 다운로드</span>
          </button>

          <button
            onClick={onAddStudent}
            className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-600"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">행 추가</span>
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
            title={isFullScreen ? '화면 축소' : '칠판 전체화면으로 보기'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Excel Formula & Quick Search Bar */}
      <div className="bg-[#F3F2F1] border-b border-slate-300 px-3 py-1.5 flex items-center gap-3 text-xs text-slate-700 select-none">
        {/* Active Cell Reference */}
        <div className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-center text-slate-800 shadow-2xs">
          {selectedCell ? `${selectedCell.col}${selectedCell.row}` : 'A1'}
        </div>

        {/* fx symbol */}
        <div className="text-slate-400 font-serif italic font-bold text-sm px-1">
          fx
        </div>

        {/* Formula / Cell Content Bar */}
        <div className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-800 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap shadow-2xs">
          {selectedCellValue ? `"${selectedCellValue}"` : '=STUDENTS_RECORD()'}
        </div>

        {/* In-Sheet Search */}
        <div className="relative w-44 sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="시트 내 검색..."
            className="w-full pl-8 pr-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#107C41] focus:outline-none"
          />
        </div>
      </div>

      {/* Real-time Live Update Notification Bar */}
      {liveBanner && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-white/20 animate-pulse">
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            </span>
            <span className="tracking-tight">{liveBanner.message}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-100 bg-black/20 px-2 py-0.5 rounded font-mono">
              ⚡ 실시간 수신: {liveBanner.time}
            </span>
            <button
              onClick={() => setLiveBanner(null)}
              className="text-white/80 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Excel Sheet Table Grid */}
      <div className="flex-1 overflow-auto bg-slate-100 max-h-[560px] select-text">
        <table className="w-full border-collapse text-xs text-slate-800 bg-white font-sans">
          {/* Column Letters Row (A, B, C, D...) */}
          <thead className="sticky top-0 z-20 bg-[#F3F2F1] shadow-xs">
            <tr className="border-b border-slate-300">
              {/* Top-Left Corner Cell */}
              <th className="w-10 min-w-[40px] bg-[#E1DFDD] border-r border-slate-300 text-center font-mono text-[11px] text-slate-500 font-bold select-none p-1">
                ◢
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.id}
                  className={`${col.width} border-r border-slate-300 px-2 py-1.5 text-center font-mono text-xs font-bold text-slate-600 select-none hover:bg-slate-200 transition-colors`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-emerald-800 font-black">{col.id}</span>
                    <span className="text-[11px] font-normal text-slate-500">({col.name})</span>
                  </div>
                </th>
              ))}
              <th className="w-16 min-w-[64px] border-r border-slate-300 px-2 py-1.5 text-center font-mono text-[11px] text-slate-500 select-none">
                작업
              </th>
            </tr>
          </thead>

          {/* Table Data Rows */}
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="py-16 text-center text-slate-400">
                  <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-600">등록된 학생 데이터가 없습니다.</p>
                  <p className="text-xs text-slate-400 mt-1">학생들이 입력하거나 [샘플 16명 로드]를 눌러보세요.</p>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, index) => {
                const rowNum = index + 1;
                const isSelectedRow = selectedCell?.row === rowNum;
                const isHighlighted = highlightedIds.has(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`border-b border-slate-200 transition-all duration-500 group ${
                      isHighlighted
                        ? 'bg-emerald-100/95 ring-2 ring-emerald-500 ring-inset font-bold shadow-xs'
                        : isSelectedRow 
                          ? 'bg-emerald-50/40' 
                          : index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }`}
                  >
                    {/* Row Number Header (1, 2, 3...) */}
                    <td
                      className={`border-r border-slate-300 font-mono text-[11px] text-center select-none font-bold py-1.5 px-1 relative ${
                        isHighlighted
                          ? 'bg-emerald-500 text-white font-black'
                          : isSelectedRow 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-[#F3F2F1] text-slate-500 group-hover:bg-slate-200'
                      }`}
                    >
                      {rowNum}
                      {isHighlighted && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </td>

                    {/* Col A: Number */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'A' })}
                      className={`border-r border-slate-200 px-2.5 py-1.5 text-center font-mono ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'A' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      {rowNum}
                    </td>

                    {/* Col B: Name (Real Answer) */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'B' })}
                      className={`border-r border-slate-200 px-2.5 py-1.5 font-extrabold text-slate-900 ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'B' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px] border border-amber-300 font-black">
                        {student.name || student.nickname}
                      </span>
                    </td>

                    {/* Col C: Nickname */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'C' })}
                      className={`border-r border-slate-200 px-2.5 py-1.5 font-bold text-indigo-700 ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'C' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      {student.nickname}
                    </td>

                    {/* Col D: Gender */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'D' })}
                      className={`border-r border-slate-200 px-2 py-1.5 text-center ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'D' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        student.gender === '남학생' ? 'text-blue-700 bg-blue-50' : 'text-pink-700 bg-pink-50'
                      }`}>
                        {student.gender}
                      </span>
                    </td>

                    {/* Col E: Glasses */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'E' })}
                      className={`border-r border-slate-200 px-2 py-1.5 text-center ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'E' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      {student.glasses}
                    </td>

                    {/* Col F: Clothing Color */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'F' })}
                      className={`border-r border-slate-200 px-2.5 py-1.5 text-slate-700 truncate ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'F' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      {student.clothingColor}
                    </td>

                    {/* Col G: MBTI Style */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'G' })}
                      className={`border-r border-slate-200 px-2.5 py-1.5 font-medium ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'G' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        student.mbtiStyle.startsWith('E') ? 'text-amber-800 bg-amber-50' : 'text-indigo-800 bg-indigo-50'
                      }`}>
                        {student.mbtiStyle}
                      </span>
                    </td>

                    {/* Col H: Socks Color */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'H' })}
                      className={`border-r border-slate-200 px-2.5 py-1.5 text-slate-700 truncate ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'H' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      {student.socksColor}
                    </td>

                    {/* Col I: Interest */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'I' })}
                      className={`border-r border-slate-200 px-2.5 py-1.5 font-bold text-slate-800 truncate ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'I' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      {student.interest}
                    </td>

                    {/* Col J: Subject */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'J' })}
                      className={`border-r border-slate-200 px-2.5 py-1.5 text-slate-700 truncate ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'J' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      {student.subject}
                    </td>

                    {/* Col K: Submitted At */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'K' })}
                      className={`border-r border-slate-200 px-2 py-1.5 font-mono text-[11px] text-slate-500 text-center ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'K' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      {student.submittedAt ? new Date(student.submittedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>

                    {/* Col L: Note */}
                    <td
                      onClick={() => setSelectedCell({ row: rowNum, col: 'L' })}
                      className={`border-r border-slate-200 px-2.5 py-1.5 text-slate-500 italic text-[11px] truncate ${
                        selectedCell?.row === rowNum && selectedCell?.col === 'L' ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-100/60' : ''
                      }`}
                    >
                      {student.note || ''}
                    </td>

                    {/* Actions Cell */}
                    <td className="border-r border-slate-200 px-2 py-1 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100">
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                          title="수정"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1 rounded hover:bg-rose-100 text-rose-600 cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Excel Bottom Sheet Tabs & Status Bar */}
      <div className="bg-[#F3F2F1] border-t border-slate-300 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        {/* Sheet Tabs */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-white border-t-2 border-[#107C41] border-x border-b-0 border-slate-300 px-3 py-1 rounded-t text-xs font-bold text-[#107C41] shadow-2xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#107C41]"></span>
            <span>Sheet1 (우리반 학생 데이터)</span>
          </div>

          <button
            onClick={onResetToSample}
            className="px-2.5 py-1 rounded hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            title="초등 6학년 샘플 학생 16명으로 초기화"
          >
            <RotateCcw className="w-3 h-3 text-indigo-600" />
            <span>샘플 16명 로드</span>
          </button>
        </div>

        {/* Excel Status Indicators */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            실시간 업데이트 수신 중
          </span>
          <span>전체 레코드: <strong className="text-slate-800">{students.length}행</strong></span>
          <span className="hidden sm:inline">선택 셀: <strong className="text-emerald-700">{selectedCell ? `${selectedCell.col}${selectedCell.row}` : '없음'}</strong></span>
        </div>
      </div>
    </div>
  );
}
