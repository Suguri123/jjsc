import { Student } from '../types';

/**
 * 학생 데이터를 한글 엑셀(Excel)에서 깨짐 없이 바로 열 수 있는 UTF-8 BOM CSV 형식으로 변환하여 다운로드합니다.
 */
export function exportStudentsToExcel(students: Student[], filename?: string) {
  if (!students || students.length === 0) {
    alert('다운로드할 학생 데이터가 없습니다.');
    return;
  }

  const headers = [
    '번호',
    '이름(실명)',
    '닉네임(별명)',
    '성별',
    '안경 착용',
    '상의 옷 색상',
    '성향(MBTI)',
    '양말 색상',
    '관심사/취미',
    '좋아하는 과목',
    '제출 일시',
    '비고/메모'
  ];

  const escapeCsv = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = students.map((s, index) => {
    let formattedDate = s.submittedAt || '';
    if (formattedDate) {
      try {
        const d = new Date(formattedDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        }
      } catch {
        // use raw
      }
    }

    return [
      escapeCsv(index + 1),
      escapeCsv(s.name || s.nickname || ''),
      escapeCsv(s.nickname || ''),
      escapeCsv(s.gender || ''),
      escapeCsv(s.glasses || ''),
      escapeCsv(s.clothingColor || ''),
      escapeCsv(s.mbtiStyle || ''),
      escapeCsv(s.socksColor || ''),
      escapeCsv(s.interest || ''),
      escapeCsv(s.subject || ''),
      escapeCsv(formattedDate),
      escapeCsv(s.note || '')
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF)을 추가하여 엑셀에서 한글이 깨지지 않도록 함
  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const todayStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = filename || `우리반_학생데이터_엑셀_${todayStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
