import { useEffect, useState } from 'react';
import { desktopLink } from '../../desktopLink';

function weatherLabel(code) {
  if (code === 0) return '맑음';
  if ([1, 2].includes(code)) return '구름 조금';
  if (code === 3) return '흐림';
  if ([45, 48].includes(code)) return '안개';
  if ([51, 53, 55, 56, 57].includes(code)) return '이슬비';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '비';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '눈';
  if ([95, 96, 99].includes(code)) return '뇌우';
  return '정보 없음';
}

function Weather() {
  const [weather, setWeather] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const update = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=2', { signal: controller.signal });
        if (!response.ok) throw new Error('Weather unavailable');
        const data = await response.json();
        if (![0, 1].every(index => ['weather_code', 'temperature_2m_max', 'temperature_2m_min'].every(key => Number.isFinite(data.daily?.[key]?.[index])))) throw new Error('Invalid weather');
        if (!controller.signal.aborted) { setWeather(data); setFailed(false); }
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    };
    update();
    const timer = setInterval(update, 15 * 60 * 1000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);
  return <div className="portal-weather-content" aria-live="polite">
    {weather ? ['오늘', '내일'].map((day, index) => <div className="portal-weather-day" key={day}>
      <strong>{day}</strong>
      <span>{weatherLabel(weather.daily.weather_code[index])}</span>
      <span>최저 {Math.round(weather.daily.temperature_2m_min[index])}°C</span>
      <span>최고 {Math.round(weather.daily.temperature_2m_max[index])}°C</span>
    </div>) : <p>{failed ? '날씨를 불러오지 못했습니다.' : '날씨를 불러오는 중…'}</p>}
  </div>;
}

function Calendar() {
  const today = new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const offset = month.getDay();
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Math.ceil((offset + dayCount) / 7) * 7;
  const changeMonth = delta => setMonth(new Date(year, monthIndex + delta, 1));

  return <div className="portal-calendar">
    <div className="portal-calendar-nav">
      <button type="button" aria-label="이전 달" onClick={() => changeMonth(-1)}>‹</button>
      <span aria-live="polite">{year}. {String(monthIndex + 1).padStart(2, '0')}</span>
      <button type="button" aria-label="다음 달" onClick={() => changeMonth(1)}>›</button>
    </div>
    <table aria-label={`${year}년 ${monthIndex + 1}월`}>
      <thead><tr>{['일', '월', '화', '수', '목', '금', '토'].map(day => <th scope="col" key={day}>{day}</th>)}</tr></thead>
      <tbody>{Array.from({ length: cells / 7 }, (_, week) => <tr key={week}>
        {Array.from({ length: 7 }, (_, weekday) => {
          const day = week * 7 + weekday - offset + 1;
          if (day < 1 || day > dayCount) return <td key={weekday}/>;
          const isToday = day === today.getDate() && monthIndex === today.getMonth() && year === today.getFullYear();
          return <td key={weekday}><span className={isToday ? 'is-today' : undefined} aria-current={isToday ? 'date' : undefined}>{day}</span></td>;
        })}
      </tr>)}</tbody>
    </table>
  </div>;
}

function PortalSection({ title, className = '', hideTitle = false, children }) {
  return <section className={`portal-section ${className}`} aria-label={title}>
    {!hideTitle && <h2 className="portal-section-title">{title}</h2>}
    {children}
  </section>;
}

function EmptySlot({ className = '', label }) {
  return <div className={`portal-empty ${className}`} role="img" aria-label={label}/>;
}

export default function HomePage({ onNavigate }) {
  return <div className="browser-home-page">
    <div className="portal-shell">
      <header className="portal-masthead">
        <div className="portal-brand"><h1>@ explorer</h1></div>
        <EmptySlot className="portal-header-banner" label="상단 배너 영역"/>
      </header>
      <div className="portal-main-grid">
        <PortalSection title="Link Directory" className="portal-directory" hideTitle>
          <div className="portal-link-grid">
            <a className="portal-link-slot portal-passbank-link" href={desktopLink('explorer', 'passbank')} onClick={event => {
              if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); onNavigate('passbank');
            }}><span className="portal-passbank-logo"><img src="/logo/passbank.png" alt="passbank"/></span><strong>passbank</strong></a>
            {Array.from({ length: 11 }, (_, index) => <div className="portal-link-slot" key={index} aria-label={`링크 준비 영역 ${index + 2}`}>
              <EmptySlot label="링크 아이콘 영역"/><span/>
            </div>)}
          </div>
        </PortalSection>
        <div className="portal-news-column">
          <PortalSection title="News" hideTitle>
            <div className="portal-news-slots">{Array.from({ length: 6 }, (_, index) => <div key={index}><span/><span/></div>)}</div>
          </PortalSection>
          <EmptySlot className="portal-side-banner" label="사이드 배너 광고 영역"/>
        </div>
        <EmptySlot className="portal-inline-banner" label="중간 배너 광고 영역"/>
        <div className="portal-bottom-row">
        <PortalSection title="연구실 갤러리" className="portal-secondary-gallery">
          <EmptySlot className="portal-gallery" label="갤러리 영역"/>
          <div className="portal-thumbnails">{Array.from({ length: 4 }, (_, index) => <EmptySlot key={index} label="썸네일 영역"/>)}</div>
        </PortalSection>
          <PortalSection title="Calendar" className="portal-secondary-calendar"><Calendar/></PortalSection>
          <PortalSection title="날씨" className="portal-weather"><Weather/></PortalSection>
        </div>
      </div>
    </div>
  </div>;
}
