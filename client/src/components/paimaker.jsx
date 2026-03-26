import { useEffect, useState } from 'react';

const PAIR_MAKER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap');

:root{
  --pm-bg: #f5f3f0;
  --pm-surface: #ffffff;
  --pm-surface-soft: #fefdfc;
  --pm-surface-muted: #fdf9f7;
  --pm-text: #3f3a36;
  --pm-text-strong: #4a423d;
  --pm-text-muted: #7b7167;
  --pm-text-subtle: #9b968f;
  --pm-primary: #a07d6c;
  --pm-primary-soft: #c49a87;
  --pm-border: #e6e1db;
  --pm-border-soft: #ede8e3;
  --pm-shadow: 0 4px 20px rgba(138, 120, 110, 0.1);
  --pm-radius-lg: 20px;
  --pm-radius-md: 14px;
  --pm-radius-sm: 12px;
}

*{
  box-sizing: border-box;
}

body{
  margin: 0;
  background: var(--pm-bg);
}

.pm-container{
  min-height: 100vh;
  max-width: 900px;
  margin: 0 auto;
  padding: 1.2rem 1rem 3rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--pm-text);
}

.pm-header{
  padding: 1.5rem 0 2rem;
  text-align: center;
}

.pm-header-icon{
  margin-bottom: 0.4rem;
  font-size: 2.6rem;
  animation: pm-heartbeat 2s ease-in-out infinite;
}

@keyframes pm-heartbeat{
  0%, 100%{ transform: scale(1); }
  15%{ transform: scale(1.12); }
  30%{ transform: scale(1); }
  45%{ transform: scale(1.07); }
}

.pm-header h1{
  margin: 0 0 0.4rem;
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--pm-primary);
}

.pm-header p{
  margin: 0;
  font-size: 0.95rem;
  color: var(--pm-text-muted);
}

.pm-layout{
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  min-width: 0;
}

.pm-card{
  min-width: 0;
  padding: 1.5rem 1.2rem;
  background: var(--pm-surface);
  border-radius: var(--pm-radius-lg);
  box-shadow: var(--pm-shadow);
}

.pm-result-card{
  overflow: hidden;
}

.pm-step{
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 1rem 0 0.5rem;
}

.pm-step:first-of-type{
  margin-top: 0;
}

.pm-step-num{
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--pm-primary);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
}

.pm-step label{
  color: var(--pm-text-strong);
  font-size: 0.95rem;
  font-weight: 600;
}

.pm-textarea-wrap{
  position: relative;
  margin-bottom: 0.5rem;
}

.pm-textarea{
  width: 100%;
  height: 160px;
  padding: 0.9rem;
  border: 1.5px solid var(--pm-border);
  border-radius: var(--pm-radius-md);
  background: var(--pm-surface-soft);
  color: var(--pm-text);
  font: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.pm-textarea:focus,
.pm-round-input:focus{
  outline: none;
  border-color: #bfa598;
  box-shadow: 0 0 0 3px rgba(191, 165, 152, 0.18);
}

.pm-count-badge{
  position: absolute;
  right: 10px;
  bottom: 10px;
  pointer-events: none;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f1ede8;
  color: var(--pm-text-muted);
  font-size: 0.78rem;
  font-weight: 600;
}

.pm-round-input{
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--pm-border);
  border-radius: var(--pm-radius-md);
  background: var(--pm-surface-soft);
  color: var(--pm-text);
  font: inherit;
  font-size: 1.15rem;
  font-weight: 600;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.pm-toggle-card{
  margin-bottom: 1rem;
  padding: 1rem 1.1rem;
  border: 1.5px solid #ece4dd;
  border-radius: var(--pm-radius-md);
  background: var(--pm-surface-muted);
}

.pm-toggle-header{
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.pm-toggle-header strong{
  color: var(--pm-text-strong);
  font-size: 0.95rem;
}

.pm-switch{
  position: relative;
  flex-shrink: 0;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.pm-switch input{
  width: 0;
  height: 0;
  opacity: 0;
}

.pm-switch-track{
  position: absolute;
  inset: 0;
  cursor: pointer;
  border-radius: 999px;
  background: #d4cec9;
  transition: background 0.25s;
}

.pm-switch-track::before{
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s;
}

.pm-switch input:checked + .pm-switch-track{
  background: var(--pm-primary);
}

.pm-switch input:checked + .pm-switch-track::before{
  transform: translateX(20px);
}

.pm-error{
  margin-bottom: 0.8rem;
  padding: 0.75rem 1rem;
  border-left: 4px solid #d94f4f;
  border-radius: var(--pm-radius-sm);
  background: #fdf3f2;
  color: #d94f4f;
  font-size: 0.9rem;
}

.pm-btn-generate{
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: var(--pm-radius-md);
  background: linear-gradient(135deg, var(--pm-primary), var(--pm-primary-soft));
  color: #ffffff;
  font: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(160, 125, 108, 0.35);
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.pm-btn-generate:hover:not(:disabled){
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(160, 125, 108, 0.4);
}

.pm-btn-generate:disabled{
  opacity: 0.65;
  cursor: not-allowed;
}

.pm-result-title{
  margin: 0 0 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #f3efea;
  color: var(--pm-text-strong);
  font-size: 1.2rem;
  font-weight: 700;
}

.pm-fairness{
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: var(--pm-radius-sm);
  font-size: 0.88rem;
}

.pm-fairness.fair{
  border: 1px solid #c3e5d2;
  background: #f0f9f4;
  color: #2b6644;
}

.pm-fairness.unfair{
  border: 1px solid #e8d89a;
  background: #fdf8ee;
  color: #7a5900;
}

.pm-fairness-text{
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.pm-fairness-range{
  color: inherit;
  opacity: 0.92;
}

.pm-dl-row{
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.pm-dl-btn{
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: var(--pm-radius-md);
  color: #ffffff;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
}

.pm-dl-btn:hover{
  transform: translateY(-1px);
}

.pm-dl-btn.csv{
  background: linear-gradient(135deg, #2f6e50, #4caf7d);
}

.pm-dl-btn.img{
  background: linear-gradient(135deg, #4b5fa6, #7b8fe0);
}

.pm-tabs-wrap{
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin-bottom: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #d8d1ca transparent;
}

.pm-tabs-wrap::-webkit-scrollbar{
  height: 6px;
}

.pm-tabs-wrap::-webkit-scrollbar-thumb{
  background: #d8d1ca;
  border-radius: 999px;
}

.pm-tabs{
  display: inline-flex;
  gap: 0.4rem;
  width: max-content;
  min-width: max-content;
  flex-wrap: nowrap;
}

.pm-tab{
  flex: 0 0 auto;
  padding: 0.45rem 1rem;
  border: 1.5px solid var(--pm-border);
  border-radius: 999px;
  background: #ffffff;
  color: var(--pm-text-muted);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, color 0.18s;
}

.pm-tab:hover:not(.active){
  background: #f5f0ec;
}

.pm-tab.active{
  border-color: var(--pm-primary);
  background: var(--pm-primary);
  color: #ffffff;
}

.pm-pairs{
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1rem;
  padding-right: 2px;
}

.pm-pair{
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.85rem 1rem;
  border: 1.5px solid var(--pm-border-soft);
  border-radius: var(--pm-radius-md);
  background: #fdfcfb;
  transition: transform 0.15s;
}

.pm-pair:hover{
  transform: translateX(3px);
}

.pm-pair.trio{
  border-color: #f8d4d4;
  background: #fff8f8;
}

.pm-pair-num{
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 999px;
  background: #f7ede7;
  color: var(--pm-primary);
  font-size: 0.85rem;
  font-weight: 700;
}

.pm-pair-names{
  flex: 1;
  min-width: 0;
  color: var(--pm-text);
  font-size: 1rem;
  font-weight: 500;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.pm-btn-copy{
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: var(--pm-radius-md);
  background: #f5f0ec;
  color: #5d544f;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}

.pm-btn-copy:hover{
  background: #ece4dc;
}

.pm-empty{
  padding: 3rem 1rem;
  text-align: center;
  color: #b5afa9;
}

.pm-empty-icon{
  display: block;
  margin-bottom: 0.8rem;
  font-size: 3rem;
  opacity: 0.5;
}

@media (min-width: 720px){
  .pm-layout{
    flex-direction: row;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .pm-input-card{
    flex: 0 0 340px;
  }

  .pm-result-card{
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 480px){
  .pm-container{
    padding: 1rem 0.75rem 2.5rem;
  }

  .pm-header h1{
    font-size: 1.65rem;
  }

  .pm-card{
    padding: 1.2rem 1rem;
    border-radius: 16px;
  }

  .pm-btn-generate{
    padding: 0.9rem;
    font-size: 1rem;
  }

  .pm-pair-names{
    font-size: 0.92rem;
  }
}
`;

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

class OptimizedPairMakerJS {
  constructor() {
    this.usedPairs = new Set();
    this.arrangements = [];
  }

  generateMultipleArrangements(peopleList, targetCount = 5, allowTrioDuplicates = false) {
    const n = peopleList.length;
    const isOdd = n % 2 !== 0;

    let maxPossible;
    if (isOdd && allowTrioDuplicates) {
      maxPossible = n;
    } else {
      const totalPossible = Math.floor((n * (n - 1)) / 2);
      const pairsPerRound = Math.floor(n / 2);
      maxPossible = Math.floor(totalPossible / pairsPerRound);
    }

    if (targetCount > maxPossible) {
      return {
        successCount: 0,
        error: `최대 ${maxPossible}번의 배치만 가능합니다. (현재 모드 기준)`,
        arrangements: [],
        fairnessStats: null
      };
    }

    let bestArrangements = [];
    let bestUsedPairs = new Set();
    let bestScore = Infinity;
    let bestSuccessCount = 0;

    const numSimulations = isOdd ? 150 : 1;

    for (let sim = 0; sim < numSimulations; sim++) {
      const simUsedPairs = new Set();
      const simArrangements = [];
      const roundTrioCounts = {};
      peopleList.forEach((p) => {
        roundTrioCounts[p] = 0;
      });

      const DUMMY = '___DUMMY___';
      const workingList = shuffleArray(peopleList);

      if (isOdd) {
        workingList.push(DUMMY);
      }

      const nEven = workingList.length;
      const rounds = [];
      const fixed = workingList[0];
      let rotating = workingList.slice(1);

      for (let r = 0; r < nEven - 1; r++) {
        const roundMatches = [];
        const currRound = [fixed, ...rotating];

        for (let i = 0; i < Math.floor(nEven / 2); i++) {
          let p1 = currRound[i];
          let p2 = currRound[nEven - 1 - i];
          if (Math.random() < 0.5) {
            [p1, p2] = [p2, p1];
          }
          roundMatches.push([p1, p2]);
        }

        rounds.push(roundMatches);
        rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
      }

      const selectedRounds = shuffleArray(rounds).slice(0, targetCount);
      let totalDupPenalty = 0;

      for (const matches of selectedRounds) {
        const finalArrangement = [];

        if (!isOdd) {
          matches.forEach((match) => {
            finalArrangement.push([...match]);
          });
        } else {
          let soloPerson = null;
          const validPairs = [];

          matches.forEach((match) => {
            if (match.includes(DUMMY)) {
              soloPerson = match[0] === DUMMY ? match[1] : match[0];
            } else {
              validPairs.push([...match]);
            }
          });

          const dupWeight = allowTrioDuplicates ? 30 : 100000;
          let bestIdx = 0;
          let minPenalty = Infinity;

          for (const idx of shuffleArray(Array.from({ length: validPairs.length }, (_, i) => i))) {
            const [p1, p2] = validPairs[idx];
            const sp1 = [soloPerson, p1].sort().join('|');
            const sp2 = [soloPerson, p2].sort().join('|');
            const tp = [p1, p2].sort().join('|');

            let penalty = 0;

            if (simUsedPairs.has(sp1)) penalty += dupWeight;
            if (simUsedPairs.has(sp2)) penalty += dupWeight;

            if (simUsedPairs.has(sp1) && simUsedPairs.has(sp2) && simUsedPairs.has(tp)) {
              penalty += dupWeight * 5;
            }

            penalty += (roundTrioCounts[soloPerson] + roundTrioCounts[p1] + roundTrioCounts[p2]) * 500;

            if (penalty < minPenalty) {
              minPenalty = penalty;
              bestIdx = idx;
            }
          }

          if (minPenalty >= dupWeight) {
            totalDupPenalty++;
          }

          const trio = [...validPairs[bestIdx], soloPerson];
          trio.forEach((member) => {
            roundTrioCounts[member]++;
          });

          validPairs[bestIdx] = shuffleArray(trio);
          validPairs.forEach((group) => {
            finalArrangement.push([...group]);
          });
        }

        finalArrangement.forEach((group) => {
          if (group.length === 2) {
            simUsedPairs.add([...group].sort().join('|'));
          } else {
            simUsedPairs.add([group[0], group[1]].sort().join('|'));
            simUsedPairs.add([group[0], group[2]].sort().join('|'));
            simUsedPairs.add([group[1], group[2]].sort().join('|'));
          }
        });

        simArrangements.push(finalArrangement);
      }

      const counts = Object.values(roundTrioCounts);
      const maxC = isOdd ? Math.max(...counts) : 0;
      const minC = isOdd ? Math.min(...counts) : 0;
      const gap = maxC - minC;
      const sumSq = isOdd ? counts.reduce((sum, value) => sum + value * value, 0) : 0;
      const score = totalDupPenalty * 50000 + gap * 10000 + sumSq;

      if (score < bestScore) {
        bestScore = score;
        bestArrangements = simArrangements;
        bestUsedPairs = simUsedPairs;
        bestSuccessCount = simArrangements.length;

        if (isOdd && totalDupPenalty === 0 && gap <= 1) break;
        if (!isOdd && totalDupPenalty === 0) break;
      }
    }

    this.arrangements = bestArrangements;
    this.usedPairs = bestUsedPairs;

    let fairnessStats = null;

    if (isOdd) {
      const actualCounts = {};
      peopleList.forEach((p) => {
        actualCounts[p] = 0;
      });

      bestArrangements.forEach((arrangement) => {
        arrangement.forEach((group) => {
          if (group.length === 3) {
            group.forEach((member) => {
              actualCounts[member]++;
            });
          }
        });
      });

      const values = Object.values(actualCounts);
      const minV = Math.min(...values);
      const maxV = Math.max(...values);

      fairnessStats = {
        min: minV,
        max: maxV,
        isFair: maxV - minV <= 1
      };
    }

    return {
      successCount: bestSuccessCount,
      error: null,
      arrangements: bestArrangements,
      fairnessStats
    };
  }
}

function downloadCSV(arrangements) {
  const rows = [['라운드', '조', '멤버1', '멤버2', '멤버3']];

  arrangements.forEach((arrangement, roundIndex) => {
    arrangement.forEach((group, groupIndex) => {
      rows.push([
        `${roundIndex + 1}라운드`,
        `${groupIndex + 1}조`,
        group[0] || '',
        group[1] || '',
        group[2] || ''
      ]);
    });
  });

  const csvText = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = '짝교제_전체결과.csv';
  a.click();

  URL.revokeObjectURL(url);
}

async function downloadAllImages(arrangements) {
  const cardW = 480;
  const lineH = 48;
  const headerH = 80;
  const padding = 32;

  for (let rIdx = 0; rIdx < arrangements.length; rIdx++) {
    const arrangement = arrangements[rIdx];
    const canvas = document.createElement('canvas');
    canvas.width = cardW;
    canvas.height = headerH + arrangement.length * lineH + padding;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#faf9f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#a07d6c';
    ctx.fillRect(0, 0, canvas.width, 10);

    ctx.fillStyle = '#4a423d';
    ctx.font = 'bold 22px "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(`🎯 ${rIdx + 1}라운드 매칭 결과`, 24, 50);

    ctx.strokeStyle = '#e6e1db';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(24, 68);
    ctx.lineTo(canvas.width - 24, 68);
    ctx.stroke();

    arrangement.forEach((group, groupIndex) => {
      const boxY = headerH + groupIndex * lineH + 8;
      const textY = headerH + groupIndex * lineH + lineH * 0.7;

      ctx.fillStyle = '#f7ede7';
      ctx.beginPath();

      if (ctx.roundRect) {
        ctx.roundRect(24, boxY, 48, 28, 14);
      } else {
        ctx.rect(24, boxY, 48, 28);
      }

      ctx.fill();

      ctx.fillStyle = '#a07d6c';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${groupIndex + 1}조`, 48, textY);

      ctx.fillStyle = group.length === 3 ? '#c95c5c' : '#3f3a36';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(group.join(' ↔ '), 84, textY);
    });

    await new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `짝교제_${rIdx + 1}라운드.png`;
        a.click();

        URL.revokeObjectURL(url);
        setTimeout(resolve, 400);
      }, 'image/png');
    });
  }
}

export default function PairMaker() {
  const [names, setNames] = useState('');
  const [targetCount, setTargetCount] = useState("");
  const [allowTrioDuplicates, setAllowTrioDuplicates] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRound, setSelectedRound] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const styleId = 'pair-maker-styles';

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = PAIR_MAKER_CSS;
      document.head.appendChild(style);
    }
  }, []);

  const handleGenerate = () => {
    setErrorMsg('');
    setResult(null);

    const peopleList = names
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (peopleList.length < 2) {
      setErrorMsg('최소 2명 이상의 이름을 입력해 주세요.');
      return;
    }

    const roundCount = parseInt(targetCount, 10);

    if (!Number.isInteger(roundCount) || roundCount < 1) {
      setErrorMsg('총 섞을 횟수를 1 이상 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const maker = new OptimizedPairMakerJS();
      const { error, arrangements, fairnessStats } = maker.generateMultipleArrangements(
        peopleList,
        roundCount,
        allowTrioDuplicates
      );

      setIsLoading(false);

      if (error) {
        setErrorMsg(error);
        return;
      }

      setResult({
        arrangements,
        fairnessStats,
        peopleCount: peopleList.length
      });
      setSelectedRound(0);
    }, 50);
  };

  const copyToClipboard = () => {
    if (!result) return;

    const pairs = result.arrangements[selectedRound];
    let text = `🎯 짝교제 ${selectedRound + 1}차 매칭 결과\n${'='.repeat(24)}\n`;

    pairs.forEach((group, index) => {
      text += `${index + 1}조: ${group.join(' ↔ ')}${group.length === 3 ? ' (3명조)' : ''}\n`;
    });

    text += '\n💡 모든 짝은 중복되지 않습니다!';
    navigator.clipboard.writeText(text).then(() => {
      alert('클립보드에 복사했습니다!');
    });
  };

  const nameCount = names.split('\n').filter((name) => name.trim()).length;

  return (
    <div className="pm-container">
      <header className="pm-header">
        <div className="pm-header-icon">💕</div>
        <h1>짝교제 매칭</h1>
        <p>한 번 만난 짝은 다시 만나지 않도록 공정하게 섞어드립니다</p>
      </header>

      <div className="pm-layout">
        <div className="pm-card pm-input-card">
          <div className="pm-step">
            <span className="pm-step-num">1</span>
            <label>참가자 명단 입력</label>
          </div>

          <div className="pm-textarea-wrap">
            <textarea
              className="pm-textarea"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="한 줄에 한 명씩 입력하세요"
            />
            {nameCount > 0 && <span className="pm-count-badge">{nameCount}명</span>}
          </div>

          <div className="pm-step">
            <span className="pm-step-num">2</span>
            <label>총 섞을 횟수</label>
          </div>

          <input
            className="pm-round-input"
            type="number"
            min="1"
            value={targetCount}
            onChange={(e) => setTargetCount(e.target.value)}
            placeholder="횟수를 입력하세요"
          />

          <div className="pm-toggle-card">
            <div className="pm-toggle-header">
              <label className="pm-switch">
                <input
                  type="checkbox"
                  checked={allowTrioDuplicates}
                  onChange={(e) => setAllowTrioDuplicates(e.target.checked)}
                />
                <span className="pm-switch-track"></span>
              </label>
              <strong>3명조 중복 허용 모드</strong>
            </div>
          </div>

          {errorMsg && <div className="pm-error">{errorMsg}</div>}

          <button className="pm-btn-generate" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? '🔄 계산 중...' : '🎲 매칭 시작하기'}
          </button>
        </div>

        <div className="pm-card pm-result-card">
          <h2 className="pm-result-title">✨ 매칭 결과</h2>

          {!result ? (
            <div className="pm-empty">
              <div className="pm-empty-icon">🌱</div>
              <p>매칭을 시작해 주세요</p>
            </div>
          ) : (
            <>
              {result.fairnessStats && result.peopleCount % 2 !== 0 && (
                <div className={`pm-fairness ${result.fairnessStats.isFair ? 'fair' : 'unfair'}`}>
                  <span>{result.fairnessStats.isFair ? '✅' : '⚠️'}</span>
                  <div className="pm-fairness-text">
                    <strong>3명조 공정성</strong>
                    <span className="pm-fairness-range">
                      최소 {result.fairnessStats.min}회 ~ 최대 {result.fairnessStats.max}회
                    </span>
                  </div>
                </div>
              )}

              <div className="pm-dl-row">
                <button className="pm-dl-btn csv" onClick={() => downloadCSV(result.arrangements)}>
                  📊 엑셀 저장
                </button>
                <button className="pm-dl-btn img" onClick={() => downloadAllImages(result.arrangements)}>
                  🖼️ 이미지 저장
                </button>
              </div>

              <div className="pm-tabs-wrap">
                <div className="pm-tabs">
                  {result.arrangements.map((_, index) => (
                    <button
                      key={index}
                      className={`pm-tab ${selectedRound === index ? 'active' : ''}`}
                      onClick={() => setSelectedRound(index)}
                    >
                      {index + 1}차
                    </button>
                  ))}
                </div>
              </div>

              <div className="pm-pairs">
                {result.arrangements[selectedRound].map((group, index) => (
                  <div key={index} className={`pm-pair ${group.length === 3 ? 'trio' : ''}`}>
                    <span className="pm-pair-num">{index + 1}조</span>
                    <span className="pm-pair-names">{group.join(' ↔ ')}</span>
                  </div>
                ))}
              </div>

              <button className="pm-btn-copy" onClick={copyToClipboard}>
                📋 {selectedRound + 1}차 결과 복사
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}