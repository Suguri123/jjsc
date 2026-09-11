import { Student } from '../types';

export const GOOGLE_SHEET_STORAGE_KEY = 'jjsc_google_sheet_webhook_url';
export const GOOGLE_SHEET_VIEW_URL_KEY = 'jjsc_google_sheet_view_url';

export interface GoogleSheetConfig {
  webhookUrl: string; // Apps Script 웹 앱 배포 URL
  sheetUrl: string;   // 교사가 열람할 구글 스프레드시트 링크
}

/**
 * 로컬스토리지에서 구글 시트 연동 설정 불러오기
 */
export function getGoogleSheetConfig(): GoogleSheetConfig {
  const webhookUrl = localStorage.getItem(GOOGLE_SHEET_STORAGE_KEY) || '';
  const sheetUrl = localStorage.getItem(GOOGLE_SHEET_VIEW_URL_KEY) || '';
  return { webhookUrl, sheetUrl };
}

/**
 * 구글 시트 연동 설정 저장
 */
export function saveGoogleSheetConfig(config: GoogleSheetConfig) {
  if (config.webhookUrl) {
    localStorage.setItem(GOOGLE_SHEET_STORAGE_KEY, config.webhookUrl.trim());
  } else {
    localStorage.removeItem(GOOGLE_SHEET_STORAGE_KEY);
  }

  if (config.sheetUrl) {
    localStorage.setItem(GOOGLE_SHEET_VIEW_URL_KEY, config.sheetUrl.trim());
  } else {
    localStorage.removeItem(GOOGLE_SHEET_VIEW_URL_KEY);
  }
}

/**
 * 학생 데이터를 구글 스프레드시트 웹 앱으로 실시간 전송
 */
export async function sendStudentToGoogleSheets(
  studentsData: Student | Student[],
  overrideUrl?: string
): Promise<{ success: boolean; message?: string }> {
  const config = getGoogleSheetConfig();
  const targetUrl = overrideUrl || config.webhookUrl;

  if (!targetUrl) {
    return { success: false, message: '구글 스프레드시트 연동 URL이 설정되어 있지 않습니다.' };
  }

  try {
    const payload = Array.isArray(studentsData) ? studentsData : [studentsData];
    
    // Google Apps Script 웹 앱은 no-cors 모드로 전송해야 브라우저 CORS 차단 없이 정상 수신됩니다.
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return { success: true };
  } catch (err) {
    console.error('Google Sheets sync error:', err);
    return { success: false, message: '구글 스프레드시트 전송 중 오류가 발생했습니다.' };
  }
}

/**
 * 구글 스프레드시트 [확장 프로그램 > Apps Script]에 붙여넣을 스크립트 코드
 */
export const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // 1. 시트가 비어있다면 첫 번째 행에 머리글(헤더) 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "번호",
        "이름(실명)",
        "닉네임(별명)",
        "성별",
        "안경 착용",
        "상의 옷 색상",
        "성향(MBTI)",
        "양말 색상",
        "관심사/취미",
        "좋아하는 과목",
        "제출 일시",
        "비고/메모"
      ]);
      // 헤더 스타일 꾸미기
      sheet.getRange(1, 1, 1, 12)
        .setBackground("#4F46E5")
        .setFontColor("#FFFFFF")
        .setFontWeight("bold")
        .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // 2. 전송받은 데이터 파싱 (단일 객체 또는 배열 모두 지원)
    var contents = JSON.parse(e.postData.contents);
    var list = Array.isArray(contents) ? contents : [contents];
    
    // 3. 스프레드시트에 행 추가
    list.forEach(function(s) {
      var currentNumber = sheet.getLastRow();
      
      // 날짜 포맷팅
      var dateStr = s.submittedAt ? new Date(s.submittedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : new Date().toLocaleString("ko-KR");

      sheet.appendRow([
        currentNumber,
        s.name || s.nickname || "",
        s.nickname || "",
        s.gender || "",
        s.glasses || "",
        s.clothingColor || "",
        s.mbtiStyle || "",
        s.socksColor || "",
        s.interest || "",
        s.subject || "",
        dateStr,
        s.note || ""
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
