import { useEffect, useMemo, useRef, useState } from "react";

const FOOD_DB = {
  한식: [
    "김치찌개","된장찌개","순두부찌개","비빔밥","불고기","제육볶음","삼겹살","갈비탕","설렁탕","육개장","김치볶음밥","죽","육회비빔밥",
    "순대국","감자탕","뼈해장국","부대찌개","수육국밥","삼계탕","냉면","초계국수","칼국수","잔치국수","비빔국수","떡볶이","김밥","잡채",
    "해물파전","김치전","보쌈","족발","닭갈비","찜닭","낙지볶음","오징어볶음","게장","묵밥","회덮밥","매운탕","아구찜","갈비찜"
  ],
  일식: [
    "초밥","사시미","라멘","우동","소바","돈카츠","가츠동","규동","오야코동","카레라이스","사케동","오코노미야키","타코야키",
    "야키소바","가라아게","텐동","텐푸라","스키야키","샤브샤브","나베","야키토리","규카츠","장어덮밥",
    "오므라이스"
  ],
  중식: [
    "자장면","짬뽕","볶음짬뽕","탕수육","마파두부","양꼬치","꿔바로우","깐풍기","유린기","라조기","깐쇼새우","칠리새우",
    "팔보채","양장피","잡채밥","볶음밥","짬뽕밥","우육면","딤섬","어향가지덮밥","군만두"
  ],
  양식: [
    "파스타","피자","스테이크","리조토","라자냐","버거","샌드위치","샐러드","수프","치킨","피시앤칩스","오믈렛","프렌치토스트",
    "팬케이크","에그베네딕트","브런치","치킨텐더","바비큐립"
  ],
  기타: [
    "쌀국수","분짜","팟타이","커리","타코","부리또","나초","케밥"
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