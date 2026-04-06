import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

// ==========================================
// 1. Global Styles & Nested CSS (Styled-components)
// ==========================================
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Pretendard:wght@400;600;700&display=swap');
`;

const SbaStyledWrapper = styled.div`

/* Reset and Base Styles */
* {
    box-sizing: border-box;
    font-family: 'Pretendard', sans-serif;
}

.sba-app-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #fdfcfb; /* 따뜻한 오프화이트 배경 */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    position: relative;
    padding-bottom: 70px; /* Space for bottom nav */
}

/* Typography styles */
.serif-text {
    font-family: 'Noto Serif KR', serif;
}

/* Header Styles */
.sba-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 20px 16px;
    background: rgba(253, 252, 251, 0.85); /* 약간의 투명도 */
    backdrop-filter: blur(8px); /* 블러 효과 */
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 10;
}

.sba-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #111111;
}

.sba-header-icon {
    font-size: 1.4rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 8px;
    border-radius: 50%;
    transition: background 0.2s;
}
.sba-header-icon:hover {
    background: #f5f5f5;
}

/* Content Area */
.sba-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

/* Verse Styles (Typography) */
.sba-verse-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #222;
    margin-bottom: 24px;
    margin-top: 10px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eaeaea; /* 하단 실선으로 깔끔하게 구분 */
    text-align: left;
}

.sba-verse-block {
    margin-bottom: 20px;
    line-height: 1.85;
    color: #333;
    font-size: 1.1rem;
    text-align: left; 
    word-break: break-all; /* 한 글자 단위 줄바꿈 유지 */
    display: flex;
    align-items: flex-start;
}

.sba-verse-number {
    font-weight: 700;
    color: #6a737b;
    font-size: 0.75em;
    margin-right: 8px;
    margin-top: 0.35em; /* 텍스트 시작점 맞춰서 살짝 내림 */
    min-width: 1.2em;
    text-align: right;
    user-select: none;
    flex-shrink: 0; /* 숫자 축소 방지 */
    white-space: nowrap; /* 줄넘김 완전 차단 */
}

/* Empty State */
.sba-empty-state {
    text-align: center;
    padding: 50px 20px;
    color: #888;
    font-size: 1.1rem;
}

/* Bottom Navigation */
.sba-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 600px;
    display: flex;
    justify-content: space-around;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px); /* 고급스러운 블러 탭바 */
    box-shadow: 0 -2px 10px rgba(0,0,0,0.03); /* 은은한 상단 그림자 */
    border-top: 1px solid #eaeaea;
    padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
    z-index: 20;
}

.sba-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: none;
    border: none;
    color: #999;
    font-size: 0.75rem;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s;
}

.sba-nav-item.active {
    color: #222;
    font-weight: 600;
}

.sba-nav-icon {
    font-size: 1.4rem;
    margin-bottom: 4px;
}

/* Weekly Cards */
.sba-weekly-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.sba-weekly-card {
    background: #fdfcfb;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s; /* 리플/클릭 모션 추가 */
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sba-weekly-card:active {
    transform: scale(0.98); /* 클릭 시 살짝 작아짐 */
    background: #f5f5f5;
}

.sba-weekly-card:hover {
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    border-color: #ddd;
}

.sba-weekly-card.today {
    border-left: 5px solid #222;
    background: #fff;
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
}

.sba-weekly-card-header {
    font-weight: 700;
    font-size: 1.1rem;
    color: #111;
    display: flex;
    justify-content: space-between;
}

.sba-weekly-card-body {
    font-size: 0.95rem;
    color: #555;
    background: #f0f0f0;
    padding: 8px;
    border-radius: 6px;
}

/* Loading */
.sba-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: #666;
    font-size: 1.1rem;
}

/* Modal / Admin */
.sba-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sba-modal-content {
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.sba-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-top: 8px;
    font-size: 1rem;
}

.sba-btn {
    width: 100%;
    padding: 12px;
    background: #222;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    margin-top: 16px;
    cursor: pointer;
}
.sba-btn:hover {
    background: #000;
}

/* Splash Screen */
.sba-splash-screen {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #fdfcfb;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: opacity 0.8s ease-in-out, visibility 0.8s;
}

.sba-splash-screen.fade-out {
    opacity: 0;
    visibility: hidden;
}

.sba-splash-content {
    text-align: center;
    animation: fadeInSplash 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.sba-splash-main-title {
    font-size: 4.0rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 15px;
    letter-spacing: -2px;
    line-height: 1.1;
    word-break: keep-all;
}

.sba-splash-sub-title {
    font-size: 2.4rem;
    font-weight: 500;
    color: #555;
    margin-top: 0px;
    margin-bottom: 30px;
    letter-spacing: -1px;
    line-height: 1.2;
}

.sba-splash-desc {
    font-size: 1rem;
    color: #777;
}

.sba-splash-footer {
    position: absolute;
    bottom: 40px;
    font-size: 0.85rem;
    color: #aaa;
    animation: fadeInSplash 1s ease-out forwards;
}

@keyframes fadeInSplash {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}

`;

// ==========================================
// 2. Constants & Logic
// ==========================================
const FULL_TO_SHORT = {
    "창세기": "창", "출애굽기": "출", "레위기": "레", "민수기": "민", "신명기": "신", "여호수아": "수", "사사기": "삿", "룻기": "룻", "사무엘상": "삼상", "사무엘하": "삼하", "열왕기상": "왕상", "열왕기하": "왕하", "역대상": "대상", "역대하": "대하", "에스라": "스", "느헤미야": "느", "에스더": "에", "욥기": "욥", "시편": "시", "잠언": "잠", "전도서": "전", "아가": "아", "이사야": "사", "예레미야": "렘", "예레미야 애가": "애", "에스겔": "겔", "다니엘": "단", "호세아": "호", "요엘": "욜", "아모스": "암", "오바댜": "옵", "요나": "욘", "미가": "미", "나훔": "나", "하박국": "합", "스바냐": "습", "학개": "학", "스가랴": "슥", "말라기": "말", "마태복음": "마", "마가복음": "막", "누가복음": "눅", "요한복음": "요", "사도행전": "행", "로마서": "롬", "고린도전서": "고전", "고린도후서": "고후", "갈라디아서": "갈", "에베소서": "엡", "빌립보서": "빌", "골로새서": "골", "데살로니가전서": "살전", "데살로니가후서": "살후", "디모데전서": "딤전", "디모데후서": "딤후", "디도서": "딛", "빌레몬서": "몬", "히브리서": "히", "야고보서": "약", "베드로전서": "벧전", "베드로후서": "벧후", "요한일서": "요일", "요한이서": "요이", "요한삼서": "요삼", "유다서": "유", "요한계시록": "계"
};

const SHORT_TO_FULL = Object.fromEntries(
    Object.entries(FULL_TO_SHORT).map(([full, short]) => [short, full])
);

const DAYS_ARR = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function getMidnightKST(dateObj) {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
    const [year, month, day] = formatter.format(dateObj).split('-');
    return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
}

function getEffectiveDate() {
    const formatter = new Intl.DateTimeFormat('en-US', { 
        timeZone: 'Asia/Seoul', 
        year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hour12: false
    });
    
    const parts = formatter.formatToParts(new Date());
    let y, m, d, h;
    for (let p of parts) {
        if (p.type === 'year') y = parseInt(p.value);
        if (p.type === 'month') m = parseInt(p.value);
        if (p.type === 'day') d = parseInt(p.value);
        if (p.type === 'hour') h = parseInt(p.value);
    }
    
    // 사용자의 로컬 환경 객체로 만듦 
    // (getMonth() 등의 일관성을 위해 Date.UTC가 아니라 로컬 Date 객체 이용)
    let kstDate = new Date(y, m - 1, d);
    
    // 아침 5시 이전이면, 큐티 달력상 '어제'로 간주
    if (h < 5) {
        kstDate.setDate(kstDate.getDate() - 1);
    }
    return kstDate;
}

function calcQtDays(startKST, targetKST) {
    if (targetKST < startKST) return 0;
    let days = 0;
    let current = new Date(startKST.getTime());
    while (current <= targetKST) {
        if (current.getUTCDay() !== 0) days++; // 일요일(0) 제외
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
}

function parseRange(rangeStr) {
    if (!rangeStr || rangeStr === "없음") return [];
    if (rangeStr === "전체") return ["전체"];
    const parts = String(rangeStr).split("-");
    if (parts.length === 2) {
        const res = [];
        for (let i = parseInt(parts[0]); i <= parseInt(parts[1]); i++) res.push(i);
        return res;
    }
    return [parseInt(parts[0])];
}


// ==========================================
// 3. Components
// ==========================================


const ICONS = {
    today: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
    reading: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="m9 10 2 2 4-4"/></svg>,
    weekly: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    sharing: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
};

function TopHeader({ currentDate, onOpenCalendar }) {
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = days[currentDate.getDay()];

    const handleFontSize = (delta) => {
        const root = document.documentElement;
        let currentSize = parseFloat(getComputedStyle(root).fontSize);
        let newSize = currentSize + delta;
        if (newSize < 12) newSize = 12;
        if (newSize > 24) newSize = 24;
        root.style.fontSize = `${newSize}px`;
        localStorage.setItem('sba_font_size', newSize);
    };

    useEffect(() => {
        const saved = localStorage.getItem('sba_font_size');
        if (saved) document.documentElement.style.fontSize = `${saved}px`;
    }, []);

    return (
        <header className="sba-header">
            <h1 onClick={onOpenCalendar} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'6px'}}>
                {month}월 {day}일 {dayName}요일
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </h1>
            <div style={{display:'flex', gap:'8px'}}>
                <button className="sba-header-icon" onClick={() => handleFontSize(-1)} title="글자 작게" style={{fontSize:'1rem', padding:'6px 10px'}} >A-</button>
                <button className="sba-header-icon" onClick={() => handleFontSize(1)} title="글자 크게" style={{fontSize:'1.2rem', padding:'6px 10px'}}>A+</button>
            </div>
        </header>
    );
}

function BottomNav({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'today', icon: ICONS.today, label: '묵상' },
        { id: 'reading', icon: ICONS.reading, label: '통독' },
        { id: 'weekly', icon: ICONS.weekly, label: '주간' },
        { id: 'sharing', icon: ICONS.sharing, label: '나눔' },
    ];

    return (
        <nav className="sba-bottom-nav">
            {tabs.map(tab => (
                <button 
                    key={tab.id} 
                    className={`sba-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{color: activeTab === tab.id ? '#111' : '#aaa'}}
                >
                    <div className="sba-nav-icon" style={{marginBottom:'4px'}}>{tab.icon}</div>
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}

function AppFooter() {
    return (
        <footer style={{ textAlign: 'center', padding: '40px 20px 80px', color: '#aaa', fontSize: '0.75rem', lineHeight: '1.6', background: 'transparent' }}>
            <p style={{margin: '0 0 4px'}}>Based on <b>서울북부교회</b> Reading Schedule</p>
            <p style={{margin: '0 0 4px'}}>Developed by <b>이소원 형제</b></p>
            <p style={{margin: '0 0 4px'}}>문의 및 피드백: <a href="mailto:lekas1217@gmail.com" style={{color: '#aaa', textDecoration:'underline'}}>lekas1217@gmail.com</a></p>
        </footer>
    );
}




function TabToday({ todayPlan, bibleData }) {
    if (!bibleData) return <div className="sba-loading">말씀을 불러오는 중...</div>;
    if (!todayPlan || !todayPlan.old) {
        return (
            <div className="sba-empty-state">
                선택하신 날짜의 묵상 일정이 없습니다.
            </div>
        );
    }

    const { abbrev, verse } = todayPlan.old;
    const bookData = bibleData[abbrev];
    const fullName = SHORT_TO_FULL[abbrev] || abbrev;

    if (!bookData || !bookData[verse]) {
        return <div className="sba-empty-state">해당 구절을 찾을 수 없습니다 ({fullName} {verse}장).</div>;
    }

    return (
        <div className="sba-tab-content">
            <h2 className="sba-verse-title">{fullName} {verse}장</h2>
            <div className="serif-text sba-verse-container">
                {Object.entries(bookData[verse]).map(([vNum, text]) => (
                    <div className="sba-verse-block" key={vNum}>
                        <div className="sba-verse-number">{vNum}</div>
                        <div className="sba-verse-text">{text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TabReading({ todayPlan, bibleData }) {
    if (!bibleData) return <div className="sba-loading">말씀을 불러오는 중...</div>;
    if (!todayPlan || !todayPlan.new) {
        return (
            <div className="sba-empty-state">
                선택하신 날짜의 통독 일정이 없습니다.
            </div>
        );
    }

    const { books, verseRaw } = todayPlan.new;
    const blocks = [];

    books.forEach(abbrev => {
        const bookData = bibleData[abbrev.trim()];
        if (!bookData) return;
        const fullName = SHORT_TO_FULL[abbrev.trim()] || abbrev.trim();
        
        let chaptersToFetch = [];
        if (verseRaw === "전체") {
            chaptersToFetch = Object.keys(bookData).map(Number).sort((a,b)=>a-b);
        } else {
            chaptersToFetch = parseRange(verseRaw);
        }

        chaptersToFetch.forEach(ch => {
            if (!bookData[ch]) return;
            blocks.push(
                <div key={`${abbrev}-${ch}`} style={{marginBottom: '30px'}}>
                    <h3 className="sba-verse-title">{fullName} {ch}장</h3>
                    <div className="serif-text sba-verse-container">
                        {Object.entries(bookData[ch]).map(([vNum, text]) => (
                            <div className="sba-verse-block" key={`new-${abbrev}-${ch}-${vNum}`}>
                                <div className="sba-verse-number">{vNum}</div>
                                <div className="sba-verse-text">{text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    });

    return (
        <div className="sba-tab-content">
            {blocks}
        </div>
    );
}




function TabWeekly({ dailyPlans, currentDate, onCardClick }) {
    // 실제 오늘 날짜 구하기
    const actualToday = getEffectiveDate();
    const tMonth = actualToday.getMonth() + 1;
    const tDay = actualToday.getDate();
    const realTodayKey = `${String(tMonth).padStart(2, '0')}.${String(tDay).padStart(2, '0')}`;

    // 현재 선택된 날짜 구하기
    const dMonth = currentDate.getMonth() + 1;
    const dDay = currentDate.getDate();
    const currentKey = `${String(dMonth).padStart(2, '0')}.${String(dDay).padStart(2, '0')}`;

    return (
        <div className="sba-tab-content">
            <h2 className="sba-verse-title" style={{borderLeft: 'none', marginBottom: '16px'}}>금주의 일정 요약</h2>
            <div className="sba-weekly-list">
                {Object.entries(dailyPlans).map(([dKey, plan]) => {
                    const isRealToday = dKey === realTodayKey;
                    const isSelected = dKey === currentKey;
                    
                    return (
                        <div 
                            key={dKey} 
                            className={`sba-weekly-card ${isSelected ? 'today' : ''}`}
                            onClick={() => onCardClick(plan.dateObj)}
                        >
                            <div className="sba-weekly-card-header">
                                <span>[{plan.dayName[0]}] {dKey}</span>
                                <div>
                                    {isRealToday && <span style={{fontSize:'0.75rem', background:'#222', color:'#fff', padding:'2px 8px', borderRadius:'12px', marginRight:'4px'}}>오늘</span>}
                                    {isSelected && !isRealToday && <span style={{fontSize:'0.75rem', background:'#6a737b', color:'#fff', padding:'2px 8px', borderRadius:'12px'}}>선택됨</span>}
                                </div>
                            </div>
                            <div className="sba-weekly-card-body" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <div style={{ flex: 1, background: '#f5f7f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e1e4e8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#687076', fontWeight: 'bold' }}>묵상</span>
                                    <span style={{ fontSize: '0.9rem', color: '#11181c', fontWeight: '500' }}>{plan.old ? `${SHORT_TO_FULL[plan.old.abbrev] || plan.old.abbrev} ${plan.old.verse}장` : '일정 없음'}</span>
                                </div>
                                <div style={{ flex: 1, background: '#f5f7f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e1e4e8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#687076', fontWeight: 'bold' }}>성경 통독</span>
                                    <span style={{ fontSize: '0.9rem', color: '#11181c', fontWeight: '500' }}>{plan.new ? `${plan.new.books.map(b => SHORT_TO_FULL[b] || b).join(', ')} ${plan.new.verseRaw}장` : '일정 없음'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p style={{textAlign:'center', color:'#888', fontSize:'0.85rem', marginTop:'20px', lineHeight: '1.5'}}>
                카드를 클릭하면 해당 일자의 말씀 탭으로 바로 이동합니다.<br />
                <span style={{color:'#aaa', fontSize:'0.75rem'}}>(※ 앱 내 날짜 기준은 매일 오전 5시 정각에 변경됩니다)</span>
            </p>
        </div>
    );
}

function AdminModal({ isOpen, onClose, startDateStr, setStartDateStr }) {
    if (!isOpen) return null;

    return (
        <div className="sba-modal-overlay" onClick={onClose}>
            <div className="sba-modal-content" onClick={e => e.stopPropagation()}>
                <h3 style={{marginTop: 0}}>관리자 설정 (Admin)</h3>
                <p style={{fontSize: '0.9rem', color: '#666'}}>큐티 기준일 변경 및 시트 동기화 옵션</p>
                <div style={{marginTop: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>시작 기준일</label>
                    <input 
                        type="date" 
                        value={startDateStr} 
                        onChange={e => setStartDateStr(e.target.value)}
                        className="sba-input"
                    />
                </div>
                <button className="sba-btn" onClick={onClose}>
                    닫기 및 저장
                </button>
            </div>
        </div>
    );
}

function CalendarModal({ isOpen, onClose, currentDate, onSetDate }) {
    if (!isOpen) return null;

    return (
        <div className="sba-modal-overlay" onClick={onClose}>
            <div className="sba-modal-content" onClick={e => e.stopPropagation()}>
                <h3 style={{marginTop: 0}}>날짜 이동</h3>
                <p style={{fontSize: '0.9rem', color: '#666'}}>원하시는 말씀 날짜를 선택하세요.</p>
                <div style={{marginTop: '16px'}}>
                    <input 
                        type="date" 
                        value={currentDate.toISOString().split('T')[0]} 
                        onChange={e => {
                            if (e.target.value) {
                                onSetDate(new Date(e.target.value));
                            }
                        }}
                        className="sba-input"
                    />
                </div>
                <button 
                  className="sba-btn" 
                  style={{marginTop: '8px', background: '#e0e0e0', color: '#333'}}
                  onClick={() => onSetDate(getEffectiveDate())}
                >
                  오늘 날짜로 복귀
                </button>
                <button className="sba-btn" onClick={onClose}>
                    확인
                </button>
            </div>
        </div>
    );
}


// ==========================================
// 4. Main Export App
// ==========================================



const DEFAULT_START_DATE = "2024-12-17";

export default function SBA_QT_App({ apiEndpoint = '/api/host/schedule', bibleDataUrl = '/host/bible_data.json' }) {
    const [bibleData, setBibleData] = useState(null);
    const [scheduleData, setScheduleData] = useState(null);
    const [currentDate, setCurrentDate] = useState(getEffectiveDate());
    const [activeTab, setActiveTab] = useState('today');

    // 모달 관리
    const [showCalendar, setShowCalendar] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [adminClicks, setAdminClicks] = useState(0);
    const [startDateStr, setStartDateStr] = useState(DEFAULT_START_DATE);

    // 스플래시 스크린 관리
    const [isSplashVisible, setIsSplashVisible] = useState(true);
    const [isSplashFading, setIsSplashFading] = useState(false);

    useEffect(() => {
        // 데이터 패치
        Promise.all([
            fetch(bibleDataUrl).then(r => r.json()),
            fetch(apiEndpoint).then(r => r.json())
        ]).then(([bible, schedule]) => {
            setBibleData(bible);
            setScheduleData(schedule);
        }).catch(err => {
            console.error("데이터 로딩 실패:", err);
        });

        // 스플래시 애니메이션 타이머 (2.2초 대기 후 페이드아웃, 3초 뒤 완전히 DOM 삭제)
        const fadeTimer = setTimeout(() => setIsSplashFading(true), 2200);
        const removeTimer = setTimeout(() => setIsSplashVisible(false), 3000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    const targetKST = getMidnightKST(currentDate);
    const weekDayIdx = targetKST.getUTCDay();

    // 주간 모든 요일(월~일)의 로직 미리 계산 (O(1))
    const dailyPlans = useMemo(() => {
        if (!scheduleData || !bibleData) return {};
        
        const diffToMonday = weekDayIdx === 0 ? -6 : 1 - weekDayIdx;
        const plans = {};
        const startKST = getMidnightKST(new Date(startDateStr));

        for (let i = 0; i < 7; i++) {
            const d = new Date(targetKST.getTime());
            d.setUTCDate(targetKST.getUTCDate() + diffToMonday + i);
            
            const dMonth = d.getUTCMonth() + 1;
            const dDay = d.getUTCDate();
            const dKey = `${String(dMonth).padStart(2, '0')}.${String(dDay).padStart(2, '0')}`;
            const dayName = DAYS_ARR[d.getUTCDay()];
            
            let oldPlan = null;
            let newPlan = null;

            if (dayName !== "일요일") {
                const daysElapsed = calcQtDays(startKST, d);
                if (daysElapsed > 0) {
                    let count = 0;
                    for (const row of scheduleData.qt_plan) {
                        const sp = parseInt(row.start_paragraph);
                        const ep = parseInt(row.end_paragraph);
                        const paras = ep - sp + 1;
                        if (count + paras >= daysElapsed) {
                            const verse = sp + (daysElapsed - count - 1);
                            oldPlan = { abbrev: FULL_TO_SHORT[row.chapter] || row.chapter, verse: verse.toString() };
                            break;
                        }
                        count += paras;
                    }
                }
            }

            const readingRow = scheduleData.reading_plan.find(r => 
                parseInt(r.month) === dMonth && parseInt(r.day) === dDay
            );

            if (readingRow && readingRow.chapter !== "없음" && readingRow.verse !== "없음") {
                newPlan = { books: readingRow.chapter.replace(/"/g,'').split(','), verseRaw: readingRow.verse };
            }

            plans[dKey] = { dayName, old: oldPlan, new: newPlan, dateObj: d };
        }
        return plans;
    }, [scheduleData, bibleData, targetKST, startDateStr, weekDayIdx]);

    const handleAdminClick = () => {
        const next = adminClicks + 1;
        if (next >= 5) {
            setShowAdmin(true);
            setAdminClicks(0);
        } else {
            setAdminClicks(next);
        }
    };

    const handleWeekCardClick = (dateObj) => {
        setCurrentDate(dateObj);
        setActiveTab('today');
    };

    const handleSetDate = (newDate) => {
        setCurrentDate(newDate);
        setShowCalendar(false);
    };

    const renderContent = () => {
        const dMonth = targetKST.getUTCMonth() + 1;
        const dDay = targetKST.getUTCDate();
        const currentKey = `${String(dMonth).padStart(2, '0')}.${String(dDay).padStart(2, '0')}`;
        const currentPlan = dailyPlans[currentKey];

        switch (activeTab) {
            case 'today':
                return <TabToday todayPlan={currentPlan} bibleData={bibleData} />;
            case 'reading':
                return <TabReading todayPlan={currentPlan} bibleData={bibleData} />;
            case 'weekly':
                return <TabWeekly dailyPlans={dailyPlans} currentDate={currentDate} onCardClick={handleWeekCardClick} />;
            case 'sharing':
                return (
                    <div className="sba-tab-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
                        <iframe 
                            src="https://joey.team/block/?id=6gzZZCkcb0Y9up7wcgIGKybikFb2&block_id=YIRdJxInnDpsBJOGdDXO"
                            style={{ width: '100%', flex: 1, border: 'none' }}
                            title="Joey Sharing Block"
                        />
                        <div onClick={handleAdminClick} style={{textAlign: 'center', color: '#f0f0f0', padding: '10px', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none'}}>
                            v5.1
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <SbaStyledWrapper className="sba-app-container">
        <GlobalStyle />
            {isSplashVisible && (
                <div className={`sba-splash-screen ${isSplashFading ? 'fade-out' : ''}`}>
                    <div className="sba-splash-content">
                        <div className="sba-splash-main-title">서울북부교회</div>
                        <div className="sba-splash-sub-title">QT & 통독</div>
                        <div className="sba-splash-desc">말씀으로 하루를 여는 은혜의 시간</div>
                    </div>
                    <div className="sba-splash-footer">
                        개발: 이소원 형제
                    </div>
                </div>
            )}

            <TopHeader currentDate={currentDate} onOpenCalendar={() => setShowCalendar(true)} />
            
            <main className="sba-content">
                {renderContent()}
                <AppFooter />
            </main>

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <CalendarModal 
                isOpen={showCalendar} 
                onClose={() => setShowCalendar(false)} 
                currentDate={currentDate} 
                onSetDate={handleSetDate} 
            />
            
            <AdminModal 
                isOpen={showAdmin} 
                onClose={() => setShowAdmin(false)} 
                startDateStr={startDateStr} 
                setStartDateStr={setStartDateStr} 
            />
        </SbaStyledWrapper>
    );
}