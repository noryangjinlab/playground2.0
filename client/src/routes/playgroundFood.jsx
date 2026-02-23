import { useEffect, useMemo, useRef, useState } from "react";

const FOOD_DB = {
  한식: [
    "김치찌개","된장찌개","순두부찌개","비빔밥","불고기","제육볶음","삼겹살","갈비탕","설렁탕","육개장",
    "순대국","감자탕","부대찌개","삼계탕","냉면","칼국수","잔치국수","떡볶이","김밥","잡채",
    "해물파전","김치전","보쌈","족발","닭갈비","찜닭","낙지볶음","오징어볶음","간장게장","양념게장"
  ],
  일식: [
    "초밥","사시미","라멘","우동","소바","돈카츠","가츠동","규동","오야코동","카레라이스",
    "오코노미야키","타코야키","야키소바","가라아게","텐동","텐푸라","스키야키","샤브샤브","나베","야키토리",
    "규카츠","연어덮밥","해산물덮밥","장어덮밥","오므라이스","모찌","미소시루","교자","에비후라이","우메보시(절임)"
  ],
  중식: [
    "자장면","짬뽕","탕수육","마파두부","마라탕","마라샹궈","훠궈","양꼬치","꿔바로우","깐풍기",
    "유린기","라조기","깐쇼새우","칠리새우","팔보채","양장피","유산슬","고추잡채","경장육슬","잡채밥",
    "볶음밥","짬뽕밥","우육면","딤섬","샤오롱바오","하가우","군만두","춘권","중국냉면","차오미엔"
  ],
  양식: [
    "파스타","피자","스테이크","리조토","라자냐","뇨끼","버거","샌드위치","샐러드","수프",
    "치킨윙","피시앤칩스","오믈렛","프렌치토스트","팬케이크","에그베네딕트","브런치","치킨텐더","바비큐립","그라탱",
    "라따뚜이","맥앤치즈","치킨파르미지아나","미트볼","로스트비프","프렌치프라이","어니언링","핫도그","클램차우더","카프레제"
  ],
  기타: [
    "쌀국수","분짜","반미","팟타이","똠얌꿍","그린커리","치킨커리","버터치킨","난","비리야니",
    "타코","부리또","나초","케밥","팔라펠","후무스","포케","지중해볼","타파스","보르시",
    "아메리카노","카페라떼","레몬에이드","버블티","스무디","치즈케이크","티라미수","마카롱","와플","빙수"
  ],
};

const ALL_CATEGORIES = ["한식", "일식", "중식", "양식", "기타"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function PlaygroundFood() {
  const [selected, setSelected] = useState(() => new Set(ALL_CATEGORIES));
  const [isSpinning, setIsSpinning] = useState(false);
  const [display, setDisplay] = useState({ category: "한식", name: "김치찌개" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const pool = useMemo(() => {
    const cats = Array.from(selected);
    const items = cats.flatMap((c) => (FOOD_DB[c] || []).map((name) => ({ category: c, name })));
    return items;
  }, [selected]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const toggleCategory = (cat) => {
    if (isSpinning) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
    setError("");
    setResult(null);
  };

  const spin = () => {
    if (isSpinning) return;

    if (pool.length === 0) {
      setError("카테고리를 최소 1개 선택해야 한다냥.");
      return;
    }

    setError("");
    setResult(null);
    setIsSpinning(true);

    const finalPick = pickRandom(pool);

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    intervalRef.current = setInterval(() => {
      const livePick = pickRandom(pool);
      setDisplay(livePick);
    }, 70);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplay(finalPick);
      setResult(finalPick);
      setIsSpinning(false);
    }, 2200);
  };

  const selectAll = () => {
    if (isSpinning) return;
    setSelected(new Set(ALL_CATEGORIES));
    setError("");
    setResult(null);
  };

  const clearAll = () => {
    if (isSpinning) return;
    setSelected(new Set());
    setError("");
    setResult(null);
  };

  return (
    <div className="wrap">
      <h2 style={{
        color: "white"
      }}>랜덤 메뉴 선택기</h2>
      <style>{`
        .wrap {
          padding: 24px 0;
          color: #111
        }
        .panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex-wrap: wrap;
          align-items: flex-start
        }
        .card {
          flex: 1;
          min-width: 210px;
          width: calc(100% - 32px);
          border: 1px solid #e6e6e6;
          border-radius: 14px;
          padding: 16px;
          background: #fff
        }
        .row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center
        }
        .chip {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          border: 1px solid #e7e7e7;
          border-radius: 999px;
          padding: 8px 10px;
          background: #fafafa;
          font-family: galmuri9, galmurimono9
        }
        .chip input{accent-color:#111}
        .btnbar {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
          font-family: galmuri9, galmurimono9
        }
        .btn {
          border: 1px solid #e0e0e0;
          background: #fff;
          border-radius: 10px;
          padding: 10px 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: galmuri9, galmurimono9
        }
        .btn.primary{background:#111;color:#fff;border-color:#111}
        .btn:disabled{opacity:.55;cursor:not-allowed}
        .muted{color:#666;font-size:13px;margin-top:8px;line-height:1.4}
        .error{color:#b00020;font-size:13px;margin-top:10px}
        .slot{height:78px;border-radius:16px;border:1px solid #e6e6e6;background:linear-gradient(#fff,#f7f7f7);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
        .slot:before,.slot:after{content:"";position:absolute;left:10px;right:10px;height:12px;border-radius:999px;background:rgba(0,0,0,.06)}
        .slot:before{top:8px}
        .slot:after{bottom:8px}
        .slot .text{font-weight:900;font-size:18px;letter-spacing:-.2px;padding:0 12px;text-align:center}
        .slot.spinning .text{animation:shake .12s linear infinite}
        @keyframes shake{0%{transform:translateY(-1px)}50%{transform:translateY(1px)}100%{transform:translateY(-1px)}}
        
        .kbd{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;background:#f1f1f1;border:1px solid #e2e2e2;border-radius:8px;padding:2px 6px}
      `}</style>


      <div className="panel">
        <div className="card">
          <div className="row" style={{ marginBottom: 10 }}>
            {ALL_CATEGORIES.map((cat) => (
              <label key={cat} className="chip">
                <input
                  type="checkbox"
                  checked={selected.has(cat)}
                  onChange={() => toggleCategory(cat)}
                  disabled={isSpinning}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          <div className="btnbar">
            <button className="btn" onClick={selectAll} disabled={isSpinning}>
              전체 선택
            </button>
            <button className="btn" onClick={clearAll} disabled={isSpinning}>
              전체 해제
            </button>
            <button className="btn primary" onClick={spin} disabled={isSpinning || pool.length === 0}>
              {isSpinning ? "SPINNING..." : "SPIN"}
            </button>
          </div>

          <div className="muted">
            선택된 풀 크기: <span className="kbd">{pool.length}</span>개<br />
            SPIN을 누르면 2.2초간 회전 후 1개로 정지
          </div>

          {error ? <div className="error">{error}</div> : null}
        </div>

        <div className="card">
          <div className="machine">
            <div className={`slot ${isSpinning ? "spinning" : ""}`}>
              <div className="text">{display.name}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}