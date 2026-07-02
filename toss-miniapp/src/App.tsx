import { useState } from 'react';
import { share, getTossShareLink } from '@apps-in-toss/web-framework';

const MS = 86400000;

// 앱인토스 공유 브릿지 — 토스 앱 안에서만 동작(브라우저 미리보기선 조용히 무시).
async function shareResult(summers: number) {
  const base =
    `우리 아이와 함께할 여름방학이 ${summers.toLocaleString('ko-KR')}번 남았대요 ⏰\n` +
    `너희 아이는 며칠 남았어? 생일만 넣으면 1초에 나와요.`;
  try {
    let link = '';
    try { link = await getTossShareLink('/'); } catch { /* 링크 미지원 시 텍스트만 */ }
    await share({ message: link ? `${base}\n${link}` : base });
  } catch { /* 사용자 취소 / 브릿지 없음 */ }
}

function daysUntilAge(b: Date, age: number): number {
  const t = new Date(b.getFullYear() + age, b.getMonth(), b.getDate());
  return Math.ceil((t.getTime() - Date.now()) / MS);
}
const fmt = (n: number) => n.toLocaleString('ko-KR');

interface Result {
  summers: number; weekends: number; play: number; hand: number; words: number;
  daysTo18: number; pct: number; over18: boolean;
}

// 이번 여름 아이와 할 것 (여름·가족활동 테마)
const SUMMER = ['🏖️ 물놀이·계곡', '⛺ 캠핑 하룻밤', '🌌 밤에 별 보기', '🍦 아이스크림 산책', '🎆 불꽃놀이', '🍉 수박 먹기'];

export default function App() {
  const [bday, setBday] = useState('');
  const [err, setErr] = useState(false);
  const [res, setRes] = useState<Result | null>(null);

  function calc() {
    if (!bday) { setErr(true); return; }
    const b = new Date(bday + 'T00:00:00');
    const now = new Date();
    if (isNaN(b.getTime()) || b.getTime() > now.getTime()) { setErr(true); return; }
    setErr(false);
    const ageY = (now.getTime() - b.getTime()) / (365.25 * MS);
    const d18 = daysUntilAge(b, 18);
    setRes({
      summers: Math.max(0, 18 - Math.floor(ageY)),
      weekends: Math.max(0, Math.round(d18 / 7)),
      play: daysUntilAge(b, 10),
      hand: daysUntilAge(b, 9),
      words: daysUntilAge(b, 13),
      daysTo18: d18,
      pct: Math.min(100, Math.max(0, (ageY / 18) * 100)),
      over18: ageY >= 18,
    });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!res) {
    return (
      <div className="wrap">
        <div className="card">
          <div className="blob b1" /><div className="blob b2" />
          <div className="inner">
            <div className="kicker">☀️ 이번 여름, 부모라면 꼭</div>
            <h1>아이와 함께할<br /><span className="mark">여름은 몇 번</span> 남았을까? ⏰</h1>
            <div className="sub">생일만 넣으면 — 남은 <b>여름방학·주말</b>과<br />“놀자”고 먼저 다가올 날을 <b>1초</b>에 알려줘요.</div>
            <div className="inbox">
              <label htmlFor="bday">🎂 우리 아이 생일</label>
              <input id="bday" type="date" value={bday}
                onChange={(e) => setBday(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') calc(); }} />
              {err && <div className="err">생일을 올바르게 입력해주세요.</div>}
              <button className="btn mt" onClick={calc}>남은 시간 계산하기</button>
              <div className="hint">계산은 이 기기 안에서만 — 정보는 전송되지 않아요.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rows: [string, string, number, string][] = [
    ['🗓️', '함께 보낼 주말', res.weekends, '번'],
    ['🧸', '“놀자”고 먼저 다가올 날', res.play, '일'],
    ['🤝', '손잡고 걸어줄 수 있는 날', res.hand, '일'],
    ['🗣️', '부모 말이 통하는 시기', res.words, '일'],
  ];

  return (
    <div className="wrap">
      <div className="card">
        <div className="blob b1" /><div className="blob b2" />
        <div className="inner">
          <div className="kicker">{res.over18 ? '🌳 이미 훌쩍 컸네요' : '☀️ 우리 아이와 남은 여름'}</div>
          <div className="hero">
            <div className="lab">이번 여름 포함, 함께할 여름방학이</div>
            <div className="big">{fmt(res.summers)}</div>
            <div className="unit">번 남았어요</div>
            <div className="note">
              {res.over18 ? '18세가 지났어요 — 이제는 “어른 대 어른”의 시간 💛'
                : `18세까지 약 ${fmt(res.daysTo18)}일 (${fmt(Math.round(res.daysTo18 / 30))}달)`}
            </div>
          </div>

          <div className="stats">
            {rows.map(([e, t, v, u]) => {
              const gone = v <= 0;
              return (
                <div className={'stat' + (gone ? ' gone' : '')} key={t}>
                  <span className="emo">{e}</span>
                  <span className="t">{t}</span>
                  <span className="v">{gone ? '이미 지났어요 💔' : fmt(v) + u + ' 남음'}</span>
                </div>
              );
            })}
          </div>

          <div className="bar-wrap">
            <div className="bar-lab">자식과 함께하는 시간의 <b>80%</b>는 18세 전에 끝나요.</div>
            <div className="bar"><i style={{ width: res.pct.toFixed(1) + '%' }} /></div>
            <div className="bar-sub">지금까지 {res.pct.toFixed(0)}% 지나왔어요</div>
          </div>

          {!res.over18 && (
            <div className="summer">
              <div className="st">🏖️ 이번 여름, 아이와 뭐 하고 놀까요?</div>
              <div className="chips">
                {SUMMER.map((s) => <span className="chip" key={s}>{s}</span>)}
              </div>
            </div>
          )}

          <div className="quote">오늘, 딱 10분만<br />같이 놀아줄까요? 🧸</div>
          <div className="brand">우리 아이와 남은 시간</div>
        </div>
      </div>

      <button className="btn mt" onClick={() => shareResult(res.summers)}>💌 친구에게 공유하기</button>
      <button className="btn ghost mt" onClick={() => { setRes(null); setBday(''); }}>🔄 다시 계산</button>
    </div>
  );
}
