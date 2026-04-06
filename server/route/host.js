const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');

const router = express.Router();
dotenv.config();

// Google Sheets API 인증 설정
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.SBAQT_AUTH, // 인증키 파일
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1wtUI5KvigQBFz8Z-QBs0nwG90B-wXYyX0luAHSan4SY'; // 대상 구글 시트 ID

// 캐싱 변수
let cachedSchedule = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000;

// 2D 배열(구글 API 응답)을 Object 배열(JSON)로 변환하는 헬퍼 함수
function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  
  const headers = rows[0]; // 첫 번째 줄은 컬럼명
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    headers.forEach((header, index) => {
      // 값이 없으면 빈 문자열 또는 undefined
      obj[header] = row[index] || ""; 
    });
    data.push(obj);
  }
  return data;
}

// 핵심 로직: 구글 시트 2개 탭에서 데이터를 취합하여 JSON 형태로 묶음
async function fetchAndParseSchedule() {
  try {
    // 병렬로 2개 탭 정보 동시 요청
    const [qtRes, readingRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "'qt_plan'!A:E" // QT 일정 시트
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "'sba_reading_plan'!A:E" // 성경 통독 일정 시트
      })
    ]);

    // 객체 배열로 데이터 가공
    const qt_plan = rowsToObjects(qtRes.data.values);
    const reading_plan = rowsToObjects(readingRes.data.values);

    // 프론트엔드가 정확히 기대하는 JSON 구조 포맷! 
    // (프론트에서 이 raw data를 받아서 날짜 계산 및 매핑을 스스로 다 처리함)
    return {
      qt_plan: qt_plan,
      reading_plan: reading_plan
    };
  } catch (e) {
    console.error("데이터 파싱 실패:", e.message);
    throw e;
  }
}

// 프론트엔드에서 찌를 접속 API 엔드포인트
router.get('/schedule', async (req, res) => {
  try {
    const now = Date.now();
    
    if (!cachedSchedule || (now - lastFetchTime > CACHE_DURATION_MS)) {
      console.log("구글 시트에서 최신 일정을 동기화합니다...");
      cachedSchedule = await fetchAndParseSchedule();
      lastFetchTime = now;
    }

    res.json(cachedSchedule);
  } catch (error) {
    console.error("API 요류:", error);
    res.status(500).json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' });
  }
});


module.exports = router;