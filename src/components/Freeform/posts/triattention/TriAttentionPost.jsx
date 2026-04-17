import { useState, useRef, useEffect, useCallback } from "react";

const css = {
  section: "pt-8 sm:pt-[52px]",
  secLabel:
    "font-mono text-[9px] tracking-[0.2em] uppercase text-[#656d76] dark:text-[#8b949e] mb-2.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-[#d0d7de] dark:after:bg-[#30363d]",
  h2: "text-[clamp(18px,2.5vw,28px)] font-bold mb-3 sm:mb-[18px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.22] tracking-[-0.01em]",
  h3: "text-[15px] sm:text-[17px] font-bold mb-3 text-[#1f2328] dark:text-[#e6edf3]",
  p: "text-[13.5px] sm:text-[14.5px] text-[#1f2328] dark:text-[#e6edf3] mb-4 leading-[1.82]",
  overviewCard:
    "bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-4 border-l-[#0969da] dark:border-l-[#58a6ff] rounded-r-[10px] rounded-l-none p-4 sm:p-7 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
  card: "bg-[#f6f8fa] dark:bg-[#161b22] rounded-lg p-4 sm:p-7 mb-5 shadow-md sm:-rotate-[0.3deg]",
  cardAccent:
    "bg-[#ddf4ff] dark:bg-[#1c2d3e] rounded-lg p-4 sm:p-7 mb-5 shadow-md sm:rotate-[0.3deg]",
  cardGold:
    "bg-[#fff1e5] dark:bg-[#2c1a0f] rounded-lg p-4 sm:p-7 mb-5 shadow-md sm:-rotate-[0.2deg]",
  cardGreen:
    "bg-[#dafbe1] dark:bg-[#162619] rounded-lg p-4 sm:p-7 mb-5 shadow-md sm:rotate-[0.2deg]",
  finding:
    "bg-[#ddf4ff] dark:bg-[#1c2d3e] border border-[#54aeff] dark:border-[#1f6feb] rounded-[10px] px-4 py-4 sm:px-[26px] sm:py-[22px] mb-5",
  findingLabel:
    "font-mono text-[9.5px] tracking-[0.14em] uppercase text-[#0969da] dark:text-[#58a6ff] mb-2 font-semibold",
  findingTitle: "text-[14px] sm:text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-2",
  divider: "h-px bg-[#d0d7de] dark:bg-[#30363d] mt-6 sm:mt-9",
  code: "font-mono text-[11px] sm:text-[12px] bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[3px] px-[5px] py-px text-[#0969da] dark:text-[#58a6ff]",
  numLabel:
    "font-mono text-[12px] sm:text-[13px] text-[#0969da] dark:text-[#58a6ff] font-semibold mr-2",
};

const SectionDivider = () => <div className={css.divider} />;

const InsightCard = ({ icon, title, children, color = "blue" }) => {
  const colors = {
    blue: "border-t-[#0969da] dark:border-t-[#58a6ff]",
    amber: "border-t-[#8250df] dark:border-t-[#bc8cff]",
    green: "border-t-[#1a7f37] dark:border-t-[#3fb950]",
    teal: "border-t-[#1a7f37] dark:border-t-[#3fb950]",
    red: "border-t-[#cf222e] dark:border-t-[#ff7b72]",
    purple: "border-t-[#8250df] dark:border-t-[#bc8cff]",
  };
  return (
    <div
      className={`bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-t-[3px] ${colors[color]} rounded-[10px] px-4 py-4 sm:px-[22px] sm:py-5 overflow-hidden`}
    >
      <div className="text-[22px] mb-2">{icon}</div>
      <div className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3] mb-1.5">{title}</div>
      <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72]">{children}</p>
    </div>
  );
};

const AccordionItem = ({ icon, title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`bg-white dark:bg-[#161b22] border rounded-[10px] mb-2.5 overflow-hidden transition-shadow ${open ? "shadow-[0_4px_18px_rgba(0,0,0,0.07)] border-[#0969da] dark:border-[#58a6ff]" : "border-[#d0d7de] dark:border-[#30363d]"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${open ? "bg-[#ddf4ff] dark:bg-[#1c2d3e] border-b border-[#54aeff] dark:border-[#1f6feb]" : "hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"}`}
      >
        <span className="text-[18px] shrink-0">{icon}</span>
        <span className="font-bold text-[15px] text-[#1f2328] dark:text-[#e6edf3] flex-1 leading-[1.35]">
          {title}
        </span>
        <span
          className={`text-[#656d76] dark:text-[#8b949e] text-[14px] shrink-0 transition-transform inline-block ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-6 py-6 border-t border-[#d0d7de] dark:border-[#30363d]">{children}</div>
      )}
    </div>
  );
};

const THETA_UNIT = Math.PI / 6;

// CSS 변수를 canvas 엘리먼트로부터 resolved color 값으로 읽어오는 헬퍼
function resolveCanvasColors(el) {
  const cs = getComputedStyle(el);
  const v = (name) => cs.getPropertyValue(name).trim();
  return {
    sf:     v("--pt-sf")     || "#f6f8fa",
    bd:     v("--pt-bd")     || "#d0d7de",
    tx:     v("--pt-tx")     || "#1f2328",
    tx2:    v("--pt-tx2")    || "#656d76",
    tx3:    v("--pt-tx3")    || "#8c959f",
    ac:     v("--pt-ac")     || "#0969da",
    rd:     v("--pt-rd")     || "#cf222e",
    acArc:  v("--pt-ac-arc") || "rgba(9,105,218,0.35)",
  };
}

function drawClock(ctx, W, H, hands, arc, clr) {
  const cx = W / 2,
    cy = H / 2,
    R = W * 0.38;
  ctx.clearRect(0, 0, W, H);

  // background circle
  ctx.beginPath();
  ctx.arc(cx, cy, R + W * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = clr.sf;
  ctx.fill();

  // ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = clr.bd;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ticks & numbers
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * (R - 6), cy + Math.sin(ang) * (R - 6));
    ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
    ctx.strokeStyle = clr.tx3;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = clr.tx2;
    ctx.font = `${W * 0.042}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      i,
      cx + Math.cos(ang) * (R + W * 0.05),
      cy + Math.sin(ang) * (R + W * 0.05),
    );
  }

  // arc
  if (arc) {
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.4, arc.from, arc.to, false);
    ctx.strokeStyle = clr.acArc;
    ctx.lineWidth = 6;
    ctx.stroke();
    const mid = (arc.from + arc.to) / 2;
    ctx.fillStyle = clr.ac;
    ctx.font = `bold ${W * 0.048}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      arc.label,
      cx + Math.cos(mid) * R * 0.58,
      cy + Math.sin(mid) * R * 0.58,
    );
  }

  // hands
  for (const hand of hands) {
    const a = (hand.pos / 12) * Math.PI * 2 - Math.PI / 2;
    const hx = cx + Math.cos(a) * (R - W * 0.09);
    const hy = cy + Math.sin(a) * (R - W * 0.09);
    const c = clr[hand.colorKey] || hand.colorKey;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(hx, hy);
    ctx.strokeStyle = c;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx, hy, 4, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
    ctx.fillStyle = c;
    ctx.font = `bold ${W * 0.044}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      hand.label,
      cx + Math.cos(a) * (R * 0.55),
      cy + Math.sin(a) * (R * 0.55),
    );
  }

  // center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = clr.tx;
  ctx.fill();
}

const RopeClockViz = () => {
  const [m, setM] = useState(2);
  const [n, setN] = useState(5);
  const mainRef = useRef(null);
  const diffRef = useRef(null);

  const redraw = useCallback(() => {
    const absDiff = Math.abs(m - n);
    const angM = (m / 12) * Math.PI * 2 - Math.PI / 2;
    const angN = (n / 12) * Math.PI * 2 - Math.PI / 2;
    const af = Math.min(angM, angN);
    const at = Math.max(angM, angN);

    if (mainRef.current) {
      const c = mainRef.current;
      const ctx = c.getContext("2d");
      const clr = resolveCanvasColors(c);
      drawClock(
        ctx, c.width, c.height,
        [
          { pos: m, colorKey: "ac", label: "m=" + m },
          { pos: n, colorKey: "rd", label: "n=" + n },
        ],
        { from: af, to: at, label: absDiff + "칸" },
        clr,
      );
    }
    if (diffRef.current) {
      const c = diffRef.current;
      const ctx = c.getContext("2d");
      const clr = resolveCanvasColors(c);
      const cosv = Math.cos(THETA_UNIT * (m - n));
      drawClock(
        ctx, c.width, c.height,
        [
          { pos: 0, colorKey: "tx2", label: "기준" },
          { pos: absDiff, colorKey: "ac", label: "|Δ|=" + absDiff },
        ],
        {
          from: -Math.PI / 2,
          to: (absDiff / 12) * Math.PI * 2 - Math.PI / 2,
          label: "cos=" + cosv.toFixed(2),
        },
        clr,
      );
    }
  }, [m, n]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // 테마 전환 시 캔버스 재렌더링
  useEffect(() => {
    const themeEl = document.querySelector("[data-post-theme]");
    if (!themeEl) return;
    const observer = new MutationObserver(() => redraw());
    observer.observe(themeEl, { attributes: true, attributeFilter: ["data-post-theme"] });
    return () => observer.disconnect();
  }, [redraw]);

  const diff = Math.abs(m - n);
  const cosv = Math.cos(THETA_UNIT * (m - n));
  const scoreColor =
    cosv > 0.7
      ? "var(--pt-gn)"
      : cosv > 0.3
        ? "var(--pt-yw)"
        : cosv > -0.3
          ? "var(--pt-yw)"
          : "var(--pt-rd)";
  const scoreLabel =
    cosv > 0.7
      ? "높은 점수 (강하게 주목)"
      : cosv > 0.3
        ? "중간 점수"
        : cosv > -0.3
          ? "낮은 점수 (별로 안 중요)"
          : "매우 낮음 (거의 무시)";

  const presets = [
    { label: "1 vs 4 (거리 3)", m: 1, n: 4 },
    { label: "7 vs 10 (거리 3)", m: 7, n: 10 },
    { label: "가까운 (거리 1)", m: 3, n: 4 },
    { label: "먼 토큰 (거리 6)", m: 0, n: 6 },
  ];

  return (
    <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] p-4 sm:p-6 mt-4">
      <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[#0969da] dark:text-[#58a6ff] font-semibold mb-3">
        인터랙티브 시각화
      </div>
      <div className="font-bold text-[15px] text-[#1f2328] dark:text-[#e6edf3] mb-4">
        RoPE "거리 패턴" — 시계 바늘로 이해하기
      </div>

      {/* sliders */}
      <div className="flex gap-6 mb-4 flex-wrap justify-center">
        <label className="flex flex-col items-center gap-1 text-[12px] text-[#1f2328] dark:text-[#e6edf3]">
          <span>토큰 A 위치 (m)</span>
          <input
            type="range"
            min={0}
            max={11}
            value={m}
            onChange={(e) => setM(+e.target.value)}
            className="w-[130px] accent-[#0969da] dark:accent-[#58a6ff]"
          />
          <span className="font-mono font-bold text-[#0969da] dark:text-[#58a6ff]">{m}</span>
        </label>
        <label className="flex flex-col items-center gap-1 text-[12px] text-[#1f2328] dark:text-[#e6edf3]">
          <span>토큰 B 위치 (n)</span>
          <input
            type="range"
            min={0}
            max={11}
            value={n}
            onChange={(e) => setN(+e.target.value)}
            className="w-[130px] accent-[#cf222e] dark:accent-[#ff7b72]"
          />
          <span className="font-mono font-bold text-[#cf222e] dark:text-[#ff7b72]">{n}</span>
        </label>
      </div>

      {/* clocks */}
      <div className="flex gap-4 justify-center flex-wrap mb-4">
        <div className="flex flex-col items-center">
          <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] mb-1">
            각 토큰의 회전 (절대 위치)
          </div>
          <canvas
            ref={mainRef}
            width={240}
            height={240}
            className="max-w-full"
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] mb-1">
            실제로 중요한 것: 차이만!
          </div>
          <canvas
            ref={diffRef}
            width={240}
            height={240}
            className="max-w-full"
          />
        </div>
      </div>

      {/* result */}
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg px-5 py-4 text-center mb-4">
        <div className="text-[13px] text-[#1f2328] dark:text-[#e6edf3]">
          어텐션 점수 ~ cos(θ ×{" "}
          <span className="text-[#0969da] dark:text-[#58a6ff] font-semibold">(m−n)</span>) ={" "}
          <span
            className="text-[28px] font-black"
            style={{ color: scoreColor }}
          >
            {cosv.toFixed(3)}
          </span>
        </div>
        <div className="text-[12px] text-[#656d76] dark:text-[#8b949e] mt-1">
          거리 {diff}칸 → {scoreLabel}
        </div>
      </div>

      {/* presets */}
      <div className="flex gap-2 justify-center flex-wrap">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setM(p.m);
              setN(p.n);
            }}
            className="text-[11px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md px-3 py-1.5 text-[#1f2328] dark:text-[#e6edf3] hover:border-[#0969da] dark:hover:border-[#58a6ff] hover:text-[#0969da] dark:hover:text-[#58a6ff] transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-[#656d76] dark:text-[#8b949e] text-center mt-3 leading-[1.7]">
        절대 위치(몇 시인지)는 상관없고, 두 바늘 사이 각도(거리)만 어텐션 점수를
        결정합니다.
        <br />
        거리가 같으면 cos 값이 같고, 어텐션 점수도 같습니다.
      </p>
    </div>
  );
};

const TriAttentionPost = () => {
  return (
    <div
      className="text-[#1f2328] dark:text-[#e6edf3] text-[15px] leading-[1.7]"
      style={{
        fontFamily:
          "'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif",
      }}
    >
      {/* ═══ 0. 전체 요약 ═══ */}
      <div className={css.section}>
        <div className={css.secLabel}>전체 요약</div>
        <h2 id="overview" className={css.h2}>
          한 문단으로 보는 TriAttention
        </h2>

        <div className={css.overviewCard}>
          <div className="text-[17px] font-semibold text-[#1f2328] dark:text-[#e6edf3] leading-[1.6] mb-3.5">
            LLM이 긴 추론을 할 때 KV 캐시가 폭발적으로 커지는 문제를 해결하기
            위해, TriAttention은{" "}
            <mark className="bg-[#54aeff] dark:bg-[#1f6feb] px-0.5 rounded-sm">
              post-RoPE 공간 대신 pre-RoPE 공간
            </mark>
            을 분석하는 새로운 접근법을 취합니다.
          </div>
          <p className="text-[14.5px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.82]">
            기존 방법들은 최근 쿼리의 어텐션 점수로 중요한 KV를 선별하지만, RoPE
            때문에 쿼리가 위치마다 회전해 관찰 창이 너무 좁습니다.
            TriAttention은 pre-RoPE 공간에서 Q/K 벡터가{" "}
            <strong>고정된 비제로 중심 주변에 안정적으로 집중</strong>(Q/K
            Concentration)된다는 사실을 발견합니다. 이 집중 현상 덕분에 어텐션
            로짓이 <strong>Q-K 거리만의 함수인 삼각함수 급수</strong>로
            근사되며, 이를 통해 어떤 위치의 키가 미래 쿼리로부터 많은 어텐션을
            받을지 <em>사전에</em> 예측할 수 있습니다. 집중도가 낮은 헤드에는
            Q/K 노름 기반 점수를 자동으로 보완합니다. 결과적으로 AIME25에서 Full
            Attention과 동일한 정확도를 유지하면서{" "}
            <strong>2.5x 처리량 향상 또는 10.7x 메모리 감소</strong>를
            달성합니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3.5 my-5 max-[700px]:grid-cols-1">
          <InsightCard icon="🔑" title="핵심 발견" color="amber">
            pre-RoPE Q/K 벡터는 위치·컨텍스트에 무관하게 고정된 중심 주변에
            집중됨 — <strong>Q/K Concentration</strong>
          </InsightCard>
          <InsightCard icon="📐" title="이론적 근거" color="blue">
            집중 현상 → 어텐션 로짓 ≈ 삼각함수 급수(Q-K 거리만의 함수) → 미래
            어텐션 예측 가능
          </InsightCard>
          <InsightCard icon="⚡" title="실용적 결과" color="green">
            AIME25 기준 <strong>2.5×</strong> 처리량 향상 또는{" "}
            <strong>10.7×</strong> KV 메모리 감소, Full Attention 정확도 유지
          </InsightCard>
        </div>
      </div>

      {/* ═══ 1. 문제 정의 ═══ */}
      <SectionDivider />
      <div className={css.section}>
        <div className={css.secLabel}>
          {"§ 1–2 \u00A0|\u00A0 문제 정의 & 관련 연구"}
        </div>
        <h2 id="problem" className={css.h2}>
          <span className={css.numLabel}>문제</span>왜 기존 KV 압축은 장문
          추론에서 실패하는가?
        </h2>

        <div className="grid grid-cols-2 gap-3.5 mb-7 max-[640px]:grid-cols-1">
          <div className="bg-[#ffebe9] dark:bg-[#2d1216] border border-[#fca5a5] dark:border-[#da3633] rounded-[10px] px-6 py-[22px]">
            <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-[#cf222e] dark:text-[#ff7b72] font-semibold mb-2.5">
              ❌ 기존 방법의 한계
            </div>
            <div className="font-bold text-[15px] text-[#1f2328] dark:text-[#e6edf3] mb-2">
              Post-RoPE 관찰 창 문제
            </div>
            <p className="text-[13.5px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.75]">
              기존 방법(H2O, SnapKV, R-KV 등)은{" "}
              <strong>최근 쿼리의 어텐션 점수</strong>로 중요 토큰을 선별합니다.
              하지만 RoPE는 쿼리 벡터를 위치마다 회전시켜 최신 방향을 가진 쿼리가 극소수에 불과합니다. 결과적으로:
            </p>
            <div className="mt-3 space-y-1 text-[13.5px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.75]">
              • 관찰 창이 너무 좁음 (≈25개 쿼리가 한계)
              <br />
              • 창 밖에서 중요해지는 토큰을 조기 제거
              <br />
              • Retrieval head에서 특히 치명적
              <br />• 사고 연쇄(chain-of-thought)가 중간에 끊김
            </div>
          </div>
          <div className="bg-[#dcfce7] dark:bg-[#1a2e1a] border border-[#86efac] rounded-[10px] px-6 py-[22px]">
            <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-[#1a7f37] dark:text-[#3fb950] font-semibold mb-2.5">
              ✅ TriAttention의 해법
            </div>
            <div className="font-bold text-[15px] text-[#1f2328] dark:text-[#e6edf3] mb-2">
              Pre-RoPE 공간의 안정적 신호 활용
            </div>
            <p className="text-[13.5px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.75]">
              위치 회전이 적용되기 <strong>이전</strong>의 pre-RoPE 공간에서는
              Q/K 벡터가 위치·컨텍스트에 관계없이 안정적입니다. 이 안정성을
              활용하면:
            </p>
            <div className="mt-3 space-y-1 text-[13.5px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.75]">
              • 관찰 창 크기에 무관한 중요도 추정
              <br />
              • 미래 어텐션 패턴을 사전에 예측 가능
              <br />
              • 오프라인 캘리브레이션으로 온라인 적용
              <br />• 어떤 도메인 데이터로 캘리브레이션해도 일반화됨
            </div>
          </div>
        </div>

        <div className={css.finding}>
          <div className={css.findingLabel}>
            §2.3 Post-RoPE 방법의 공통 한계
          </div>
          <div className={css.findingTitle}>
            어텐션 기반 vs 노름 기반 — 둘 다 부족하다
          </div>
          <p className={css.p}>
            어텐션 기반 방법은{" "}
            <strong>방향 정보를 담고 있지만 위치 회전과 엉켜</strong> 사용하기
            어렵고, 노름 기반 방법(VATP 등)은{" "}
            <strong>벡터 크기만 보고 방향을 무시</strong>합니다. TriAttention은
            pre-RoPE 공간에서 방향과 크기를 모두 활용하며 이 두 한계를 동시에
            해소합니다.
          </p>
        </div>
      </div>

      {/* ═══ 2. 핵심 발견: Q/K Concentration ═══ */}
      <SectionDivider />
      <div className={css.section}>
        <div className={css.secLabel}>
          {"§ 3 \u00A0|\u00A0 Pre-RoPE & 삼각함수 급수"}
        </div>
        <h2 id="concentration" className={css.h2}>
          <span className={css.numLabel}>발견</span>Q/K Concentration과 삼각함수
          급수
        </h2>

        <div className={css.finding}>
          <div className={css.findingLabel}>
            Observation 3.1 — Prevalent Q/K Concentration
          </div>
          <div className={css.findingTitle}>
            pre-RoPE Q/K 벡터는 고정된 중심 주변에 집중된다
          </div>
          <p className={css.p}>
            Qwen3-8B의 1,152개 어텐션 헤드 대다수에서 pre-RoPE Q/K 벡터가{" "}
            <strong>고정된 비제로 중심 주변에 강하게 집중</strong>됩니다. 이
            집중은 입력 내용이나 토큰 위치와 무관하게 안정적입니다. 수학·코딩·챗
            도메인에서 <strong>MRL 값이 0.977–0.980으로 거의 동일</strong>하며,
            헤드의 ~90%가 R {">"} 0.95를 보입니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 my-[18px] max-[700px]:grid-cols-1">
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-6 py-[22px]">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="font-mono text-[9px] px-[7px] py-0.5 rounded-[3px] bg-[#ffebe9] dark:bg-[#2d1216] text-[#cf222e] dark:text-[#ff7b72]">
                집중 전
              </span>
              <span className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3]">
                Post-RoPE: 위치마다 흩어진 벡터
              </span>
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-relaxed">
              RoPE가 적용된 후에는 Q 벡터가 위치에 따라 회전하여 호(arc) 형태로
              퍼집니다. 방향이 계속 변하므로 어텐션에서 방향 정보를 추출하기
              어렵습니다.
            </p>
            {/* Scatter SVG — dispersed */}
            <svg viewBox="0 0 200 120" width="100%" className="mt-3 block">
              <rect width="200" height="120" fill="var(--pt-sf)" rx="6" />
              <line
                x1="100"
                y1="10"
                x2="100"
                y2="110"
                stroke="var(--pt-bd)"
                strokeWidth="1"
              />
              <line
                x1="10"
                y1="60"
                x2="190"
                y2="60"
                stroke="var(--pt-bd)"
                strokeWidth="1"
              />
              {/* Scattered points in an arc */}
              {[
                [30, 25],
                [45, 20],
                [60, 22],
                [75, 30],
                [90, 42],
                [105, 55],
                [120, 68],
                [135, 78],
                [150, 85],
                [165, 90],
                [55, 45],
                [80, 55],
                [140, 60],
                [110, 38],
                [70, 65],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="var(--pt-rd)"
                  opacity=".4"
                />
              ))}
              <text
                x="100"
                y="115"
                fontSize="8"
                fill="var(--pt-tx2)"
                textAnchor="middle"
                fontFamily="DM Mono"
              >
                RoPE 회전으로 퍼짐
              </text>
            </svg>
          </div>
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-6 py-[22px]">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="font-mono text-[9px] px-[7px] py-0.5 rounded-[3px] bg-[#dcfce7] dark:bg-[#1a2e1a] text-[#1a7f37] dark:text-[#3fb950]">
                집중 후
              </span>
              <span className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3]">
                Pre-RoPE: 중심 주변에 안정적 집중
              </span>
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-relaxed">
              RoPE 적용 이전에는 Q/K 벡터가 하나의 고정된 중심 주변에
              밀집합니다. 서로 다른 입력 시퀀스에서도 동일한 군집 구조가
              나타납니다.
              <strong> Mean Resultant Length R → 1</strong>이 이를 수치화합니다.
            </p>
            {/* Scatter SVG — concentrated */}
            <svg viewBox="0 0 200 120" width="100%" className="mt-3 block">
              <rect width="200" height="120" fill="var(--pt-sf)" rx="6" />
              <line
                x1="100"
                y1="10"
                x2="100"
                y2="110"
                stroke="var(--pt-bd)"
                strokeWidth="1"
              />
              <line
                x1="10"
                y1="60"
                x2="190"
                y2="60"
                stroke="var(--pt-bd)"
                strokeWidth="1"
              />
              {/* Concentrated cluster */}
              {[
                [118, 38],
                [122, 42],
                [115, 40],
                [120, 36],
                [125, 44],
                [117, 43],
                [123, 39],
                [119, 41],
                [121, 37],
                [116, 39],
                [124, 41],
                [120, 40],
                [118, 36],
                [122, 44],
                [114, 42],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="var(--pt-gn)"
                  opacity=".5"
                />
              ))}
              {/* Center marker */}
              <circle
                cx="120"
                cy="40"
                r="6"
                fill="none"
                stroke="var(--pt-gn)"
                strokeWidth="1.5"
                strokeDasharray="3,2"
              />
              <text
                x="135"
                y="36"
                fontSize="8"
                fill="var(--pt-gn)"
                fontFamily="DM Mono"
              >
                E[q]
              </text>
              <text
                x="100"
                y="115"
                fontSize="8"
                fill="var(--pt-tx2)"
                textAnchor="middle"
                fontFamily="DM Mono"
              >
                고정 중심에 밀집
              </text>
            </svg>
          </div>
        </div>

        <h3 className={css.h3} style={{ marginTop: "28px" }}>
          집중 현상 → 삼각함수 급수로의 변환
        </h3>
        <p className={css.p}>
          Q/K가 중심으로 집중되면 <code className={css.code}>q_f ≈ q̄_f</code>,{" "}
          <code className={css.code}>k_f ≈ k̄_f</code>로 근사할 수 있습니다. 이를
          RoPE 어텐션 로짓 공식에 대입하면, 로짓이 개별 벡터가 아닌{" "}
          <strong>Q-K 거리 Δ만의 함수</strong>가 됩니다:
        </p>

        <pre className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-[3px] border-l-[#0969da] dark:border-l-[#58a6ff] rounded-r-[6px] rounded-l-none px-5 py-4 my-3.5 text-[12.5px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre leading-[1.8]">{`[원래 공식]
logit(q, k) = Σ_f ‖q_f‖‖k_f‖ · cos(ω_f·Δ + φ_f)

[집중 근사 적용 후 — 삼각함수 급수]
logit(Δ) ≈ Σ_f [ a_f·cos(ω_f·Δ) + b_f·sin(ω_f·Δ) ]

  a_f, b_f : Q/K 중심에 의해 결정되는 상수
  ω_f      : RoPE 주파수 (기하급수적 진행)
  Δ        : Q-K 위치 거리`}</pre>
        <p className="text-[13px] text-[#656d76] dark:text-[#8b949e] italic mb-5">
          → 이 급수는 Fourier 합성과 유사: Q/K 중심이 "계수"를 결정하고, 어느
          거리의 키가 선호될지를 규정합니다.
        </p>

        <div className="grid grid-cols-3 gap-3.5 mt-5 mb-8 max-[700px]:grid-cols-1">
          <InsightCard icon="🏔️" title="로컬 어텐션 헤드" color="amber">
            삼각함수 급수가 작은 Δ에서 피크 → 가까운 키를 선호. 최근 컨텍스트
            활용.
          </InsightCard>
          <InsightCard icon="🌊" title="어텐션 싱크 헤드" color="blue">
            삼각함수 급수가 큰 Δ에서 피크 → 먼 키(초기 토큰 등)를 선호.
          </InsightCard>
          <InsightCard icon="✅" title="실험 검증" color="green">
            Qwen3/Qwen2.5/Llama3 전체 헤드에서 재구성 피어슨 r̄ 평균 {">"} 0.5,
            다수 헤드에서 0.6–0.9.
          </InsightCard>
        </div>
      </div>

      {/* ═══ 3. 방법론 ═══ */}
      <SectionDivider />
      <div className={css.section}>
        <div className={css.secLabel}>{"§ 4 \u00A0|\u00A0 방법론"}</div>
        <h2 id="method" className={css.h2}>
          <span className={css.numLabel}>방법</span>TriAttention 설계
        </h2>

        <p className={css.p}>
          TriAttention은 <strong>오프라인 캘리브레이션</strong>으로 Q/K 중심을
          미리 구하고, 추론 시 이 중심을 활용하여 각 키의 중요도를 점수화합니다.
          예산 B를 초과할 때마다 상위 B개 키만 남기고 나머지를 제거합니다.
        </p>

        {/* Pipeline — HTML flow-diagram style */}
        <div className="flex items-center my-6 overflow-x-auto pb-1">
          {[
            {
              label: "오프라인",
              name: "Q/K 중심 캘리브레이션",
              sub: "E[q_f], E[k_f]",
              color: "var(--pt-ac)",
            },
            {
              label: "Step 1",
              name: "삼각함수 급수 점수",
              sub: "S_trig(k, Δ)",
              color: "var(--pt-ac)",
            },
            {
              label: "Step 2",
              name: "노름 기반 점수",
              sub: "S_norm(k)",
              color: "var(--pt-ac)",
            },
            {
              label: "Step 3",
              name: "집중도 기반 가중치",
              sub: "R_f 적응 조합",
              color: "var(--pt-ac)",
            },
            {
              label: "Step 4",
              name: "다중 오프셋 평균",
              sub: "S̃(k) 최종 점수",
              color: "var(--pt-pu)",
            },
            {
              label: "출력",
              name: "Top-B 키 유지",
              sub: "KV 캐시 가지치기",
              color: "var(--pt-yw)",
            },
          ].map(({ label, name, sub, color }, i) => (
            <div key={i} className="flex items-center shrink-0">
              <div
                className="bg-white dark:bg-[#161b22] border-[1.5px] border-[#d0d7de] dark:border-[#30363d] rounded-lg px-4 py-3.5 min-w-[130px] text-center hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow"
                style={{ borderTop: `3px solid ${color}` }}
              >
                <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#656d76] dark:text-[#8b949e] mb-1">
                  {label}
                </div>
                <div className="text-[13px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-1 leading-[1.3]">
                  {name}
                </div>
                <div
                  className="font-mono text-[10.5px] font-medium"
                  style={{ color }}
                >
                  {sub}
                </div>
              </div>
              {i < 5 && (
                <span className="text-[#656d76] dark:text-[#8b949e] text-[20px] px-1.5 shrink-0">
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Scoring components */}
        <div className="grid grid-cols-2 gap-3.5 my-[18px] max-[640px]:grid-cols-1">
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-[22px] py-5">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-[3px] bg-[#ddf4ff] dark:bg-[#1c2d3e] text-[#0969da] dark:text-[#58a6ff] inline-block mb-2">
              구성요소 1
            </div>
            <div className="font-bold text-[15px] text-[#1f2328] dark:text-[#e6edf3] mb-2">
              삼각함수 급수 점수 S_trig
            </div>
            <pre className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded px-3 py-2 my-3 text-[11px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre">{`S_trig(k, Δ) = Σ_f ‖E[q_f]‖·‖k_f‖·cos(ω_f·Δ + φ_f)

φ_f = arg(E[q_f]) − arg(k_f)`}</pre>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72]">
              <strong>Q 중심 E[q_f]</strong>을 미래 쿼리의 대리자로 사용. 캐시된
              키 k를 실제 값 그대로 사용하여 거리 Δ에 따른 기대 어텐션을
              계산합니다. Q/K 집중이 강할수록 정확합니다.
            </p>
          </div>
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-[22px] py-5">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-[3px] bg-[#dbeafe] text-[#0969da] dark:text-[#58a6ff] inline-block mb-2">
              구성요소 2
            </div>
            <div className="font-bold text-[15px] text-[#1f2328] dark:text-[#e6edf3] mb-2">
              노름 기반 점수 S_norm
            </div>
            <pre className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded px-3 py-2 my-3 text-[11px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre">{`S_norm(k) = Σ_f (1−R_f)·E[‖q_f‖]·‖k_f‖

R_f = ‖E[q_f]‖ / E[‖q_f‖] (집중도)`}</pre>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72]">
              집중도 R_f가 낮은 헤드를 위한 보완 신호. <strong>(1−R_f)</strong>{" "}
              가중치로 집중이 약할수록 노름 점수 기여를 자동으로 높입니다.
              주파수 대역별 기대 쿼리 노름으로 가중합니다.
            </p>
          </div>
        </div>

        <div className={css.finding} style={{ marginTop: "16px" }}>
          <div className={css.findingLabel}>최종 점수 = 두 구성요소 합산</div>
          <div className={css.findingTitle}>
            S(k, Δ) = S_trig(k, Δ) + S_norm(k)
          </div>
          <p className="text-[14px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.78]">
            키 하나는 어떤 미래 위치에서도 쿼리될 수 있으므로, 여러 미래 오프셋
            D = {"{1, 2, 4, …, 2¹⁶}"}에서 점수를 평균냅니다:
            <br />
            <code className={css.code}>
              {"S̃(k) = (1/|D|) Σ_{δ∈D} S(k, Δ+δ)"}
            </code>
            <br />
            기하 간격 샘플링이 선형보다 훨씬 효과적임이 실험으로 확인됩니다
            (45.8% vs 28.7%).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 my-[18px] max-[700px]:grid-cols-1">
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-6 py-[22px]">
            <div className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3] mb-2.5">
              윈도우 기반 가지치기
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.75]">
              매 디코딩 스텝마다 점수 계산은 비쌉니다.{" "}
              <strong>128 토큰마다 한 번씩</strong> 가지치기를 트리거합니다
              (R-KV 방식 동일). 배치 처리로 오버헤드를 크게 줄입니다.
            </p>
          </div>
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-6 py-[22px]">
            <div className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3] mb-2.5">
              GQA 처리: 정규화 후 최대 집계
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.75]">
              GQA에서 G개 쿼리 헤드가 KV를 공유할 때, 각 헤드 내 z-score 정규화
              후 <strong>max 집계</strong>로 하나의 최종 점수를 얻습니다. 어느
              한 헤드라도 중요하다고 판단하면 키를 유지합니다.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ 4. 실험 결과 ═══ */}
      <SectionDivider />
      <div className={css.section}>
        <div className={css.secLabel}>{"§ 5 \u00A0|\u00A0 실험 결과"}</div>
        <h2 id="results" className={css.h2}>
          <span className={css.numLabel}>결과</span>수치로 보는 TriAttention
          성능
        </h2>

        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-3.5 my-5 max-[700px]:grid-cols-1">
          {[
            {
              value: "2.5×",
              label: "처리량 향상",
              desc: "AIME25에서 Full Attention과 동일 정확도(40.8%)로 달성한 처리량 배율",
              color: "var(--pt-ac)",
            },
            {
              value: "10.7×",
              label: "KV 메모리 감소",
              desc: "Full Attention 정확도를 유지하면서 달성한 KV 캐시 메모리 감소 배율",
              color: "var(--pt-ac)",
            },
            {
              value: "6.3×",
              label: "MATH 500 처리량",
              desc: "MATH 500에서 유사 정확도로 1,405 vs 223 토큰/s 달성 (KV 예산 1,024)",
              color: "var(--pt-gn)",
            },
          ].map(({ value, label, desc, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-5 py-[22px] text-center"
            >
              <div
                className="text-[38px] font-black leading-none mb-1 tracking-[-0.02em]"
                style={{ color }}
              >
                {value}
              </div>
              <div className="font-mono text-[10px] text-[#656d76] dark:text-[#8b949e] uppercase tracking-[0.08em] mb-2">
                {label}
              </div>
              <p className="text-[12.5px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.65]">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* AIME25 comparison table */}
        <h3 className={css.h3} style={{ marginTop: "28px" }}>
          AIME25 정확도 비교 (Qwen3-8B, KV 예산 2048)
        </h3>
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr>
                  {[
                    "방법",
                    "AIME24",
                    "AIME25",
                    "MATH 500 (예산 512)",
                    "특징",
                  ].map((h) => (
                    <th
                      key={h}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#656d76] dark:text-[#8b949e] text-left px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "Full Attention",
                    vals: ["57.1%", "40.8%", "69.6%"],
                    note: "압축 없음 (상한)",
                  },
                  {
                    name: "SnapKV",
                    vals: ["34.6%", "20.0%", "49.2%"],
                    note: "로컬 창 기반",
                    bad: true,
                  },
                  {
                    name: "R-KV",
                    vals: ["25.4%", "17.5%", "46.4%"],
                    note: "최근 쿼리 + 중복 감지",
                    bad: true,
                  },
                  {
                    name: "TriAttention ★",
                    vals: ["42.1%", "32.9%", "56.0%"],
                    note: "pre-RoPE 삼각함수",
                    best: true,
                  },
                ].map((r, i) => (
                  <tr
                    key={i}
                    className={
                      r.best
                        ? "bg-[rgba(21,128,61,0.04)]"
                        : "hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                    }
                  >
                    <td
                      className={`px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] font-semibold ${r.best ? "text-[#1a7f37] dark:text-[#3fb950]" : ""}`}
                    >
                      {r.name}
                    </td>
                    {r.vals.map((v, j) => (
                      <td
                        key={j}
                        className={`px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] ${r.best ? "text-[#1a7f37] dark:text-[#3fb950] font-bold" : r.bad ? "text-[#cf222e] dark:text-[#ff7b72]" : "text-[#1f2328] dark:text-[#e6edf3]"}`}
                      >
                        {v}
                      </td>
                    ))}
                    <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#656d76] dark:text-[#8b949e]">
                      {r.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Memory retention */}
        <h3 className={css.h3} style={{ marginTop: "28px" }}>
          메모리 유지 벤치마크: 재귀 시뮬레이션
        </h3>
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-4 border-l-[#1a7f37] dark:border-l-[#3fb950] rounded-r-[10px] rounded-l-none p-7 mt-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="text-[17px] font-semibold text-[#1a7f37] dark:text-[#3fb950] leading-[1.6] mb-3.5">
            DFS 재귀 깊이가 증가할수록 R-KV는 급격히 붕괴, TriAttention은 Full
            Attention에 근접
          </div>
          <p className="text-[14.5px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.82]">
            KV 캐시 압축 시 장문 추론 중 중간 상태를 잊어버릴 위험이 있습니다.
            DFS 재귀 시뮬레이션(깊이 6~20)으로 이를 측정한 결과:
            <br />
            <br />• <strong>TriAttention:</strong> 깊이 16까지 Full Attention과
            동등, 깊이 8·12에서는 약간 능가. 깊이 18 이상에서야 격차 발생.
            <br />• <strong>R-KV:</strong> 깊이 14→16 구간에서{" "}
            <span className="text-[#cf222e] dark:text-[#ff7b72]">
              61% → 31%로 재앙적 정확도 하락
            </span>
            . 중간 상태 제거로 연쇄 오류 발생.
            <br />• 결론: TriAttention은 필수적 중간 상태를 효과적으로
            보존합니다.
          </p>
        </div>

        {/* Ablation */}
        <h3 className={css.h3} style={{ marginTop: "28px" }}>
          소거 연구 (Qwen3-8B, KV 예산 2048)
        </h3>
        <ul className="list-none p-0 my-3.5">
          {[
            {
              n: "1",
              bg: "var(--pt-ac-bg)",
              color: "var(--pt-ac)",
              text: (
                <>
                  <strong>S_trig 제거 시:</strong> AIME24 42.1% → 18.8%, AIME25
                  32.9% → 21.2%로 급락.{" "}
                  <mark className="bg-[#54aeff] dark:bg-[#1f6feb] px-[3px] py-px rounded-sm text-[#1f2328] dark:text-[#e6edf3]">
                    삼각함수 급수 점수가 핵심
                  </mark>
                  임을 확인.
                </>
              ),
            },
            {
              n: "2",
              bg: "#dbeafe",
              color: "var(--pt-ac)",
              text: (
                <>
                  <strong>S_norm 제거 시:</strong> AIME24 −5.4% (45.8% → 40.4%).{" "}
                  <mark className="bg-[#54aeff] dark:bg-[#1f6feb] px-[3px] py-px rounded-sm text-[#1f2328] dark:text-[#e6edf3]">
                    노름 점수가 보완 역할
                  </mark>
                  을 수행함을 확인.
                </>
              ),
            },
            {
              n: "3",
              bg: "#dcfce7",
              color: "var(--pt-gn)",
              text: (
                <>
                  <strong>집중도 가중치 R 제거 시:</strong> AIME25 32.9% →
                  28.7%.{" "}
                  <mark className="bg-[#54aeff] dark:bg-[#1f6feb] px-[3px] py-px rounded-sm text-[#1f2328] dark:text-[#e6edf3]">
                    적응형 가중치가 성능 개선
                  </mark>
                  에 기여.
                </>
              ),
            },
            {
              n: "4",
              bg: "#ccfbf1",
              color: "var(--pt-gn)",
              text: (
                <>
                  <strong>교차 도메인 캘리브레이션:</strong> 코딩 데이터로
                  캘리브레이션 → 추론 벤치마크에서 동등한 성능.{" "}
                  <mark className="bg-[#54aeff] dark:bg-[#1f6feb] px-[3px] py-px rounded-sm text-[#1f2328] dark:text-[#e6edf3]">
                    Q/K 통계는 도메인 무관 모델 내재 특성
                  </mark>
                  .
                </>
              ),
            },
            {
              n: "5",
              bg: "#ede9fe",
              color: "var(--pt-pu)",
              text: (
                <>
                  <strong>오프셋 범위 확대:</strong> max 128→4096으로 확대 시
                  +7.1%p 향상. 기하 간격 vs 선형 간격: 45.8% vs 28.7%.{" "}
                  <mark className="bg-[#54aeff] dark:bg-[#1f6feb] px-[3px] py-px rounded-sm text-[#1f2328] dark:text-[#e6edf3]">
                    기하 간격이 필수
                  </mark>
                  .
                </>
              ),
            },
          ].map(({ n, bg, color, text }, i, arr) => (
            <li
              key={n}
              className={`flex items-start gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-[#d0d7de] dark:border-[#30363d]" : ""}`}
            >
              <div
                className="w-[22px] h-[22px] rounded-full font-mono text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: bg, color }}
              >
                {n}
              </div>
              <div className="text-[14px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72]">
                {text}
              </div>
            </li>
          ))}
        </ul>

        {/* Throughput table */}
        <h3 className={css.h3} style={{ marginTop: "28px" }}>
          처리량 & 효율 비교
        </h3>
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr>
                  {[
                    "비교 기준",
                    "방법",
                    "KV 예산",
                    "AIME25",
                    "처리량 (토큰/s)",
                    "비고",
                  ].map((h) => (
                    <th
                      key={h}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#656d76] dark:text-[#8b949e] text-left px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    rowSpan="2"
                    className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#656d76] dark:text-[#8b949e] align-top"
                  >
                    동일 정확도 비교
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3]">
                    Full Attention
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3]">
                    –
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3]">
                    40.8%
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3]">
                    222.8
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#656d76] dark:text-[#8b949e]">
                    기준
                  </td>
                </tr>
                <tr className="bg-[#f6f8fa] dark:bg-[#161b22]">
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                    <strong>TriAttention</strong>
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] font-medium">
                    3,072
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] font-medium">
                    40.8%
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#0969da] dark:text-[#58a6ff] font-bold">
                    563.5 (2.5×↑)
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] font-medium">
                    동일 정확도, 2.5× 빠름
                  </td>
                </tr>
                <tr>
                  <td
                    rowSpan="2"
                    className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#656d76] dark:text-[#8b949e] align-top"
                  >
                    동일 정확도, R-KV 비교
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3]">
                    R-KV
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3]">
                    2,048
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3]">
                    –
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3]">
                    760.4
                  </td>
                  <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] text-[#656d76] dark:text-[#8b949e]">
                    MATH 500: 68.2%
                  </td>
                </tr>
                <tr className="bg-[#f6f8fa] dark:bg-[#161b22]">
                  <td className="px-4 py-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                    <strong>TriAttention</strong>
                  </td>
                  <td className="px-4 py-[11px] text-[#1f2328] dark:text-[#e6edf3] font-medium">
                    1,024
                  </td>
                  <td className="px-4 py-[11px] text-[#1f2328] dark:text-[#e6edf3] font-medium">
                    –
                  </td>
                  <td className="px-4 py-[11px] text-[#0969da] dark:text-[#58a6ff] font-bold">
                    1,405.2 (1.85×↑)
                  </td>
                  <td className="px-4 py-[11px] text-[#1f2328] dark:text-[#e6edf3] font-medium">
                    MATH 500: 68.4% ↑
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ 5. 부록 핵심 ═══ */}
      <SectionDivider />
      <div className={css.section}>
        <div className={css.secLabel}>{"부록 \u00A0|\u00A0 추가 검증"}</div>
        <h2 id="appendix" className={css.h2}>
          부록 핵심 내용
        </h2>
        <div className="grid grid-cols-3 gap-3.5 my-5 max-[700px]:grid-cols-1">
          <InsightCard icon="🏗️" title="MLA 아키텍처 일반화" color="blue">
            GLM-4.7-Flash(MLA)에서도 Q/K 집중 현상이 GQA보다 강하게 나타남. MLA
            헤드의 <strong>96.6%가 R {">"} 0.95</strong> (GQA: 84.7%).
          </InsightCard>
          <InsightCard icon="📊" title="다양한 벤치마크" color="green">
            LongBench 16개 하위과제 평균 <strong>48.1</strong> (Ada-KV+SnapKV:
            45.6). RULER에서 <strong>66.1</strong> (+10.5 vs SnapKV).
          </InsightCard>
          <InsightCard icon="💻" title="실제 배포" color="teal">
            단일 RTX 4090(24GB)에서 Qwen3-32B + AWQ INT4 + TriAttention으로
            멀티턴 에이전트 구동. Full Attention은 <strong>OOM 발생</strong>.
          </InsightCard>
        </div>
      </div>

      {/* ═══ 6. 결론 ═══ */}
      <div
        id="conclusion"
        className="bg-[#1f2328] dark:bg-[#21262d] text-[#f5f0e8] rounded-xl px-10 py-9 mt-[52px]"
      >
        <div className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#54aeff] dark:text-[#1f6feb] mb-2.5">
          § 6 · 결론 & 의의
        </div>
        <h2 className="text-[24px] font-bold text-white mb-4 leading-[1.3] tracking-[-0.01em]">
          TriAttention이 제안하는 것
        </h2>
        <div>
          <p className="text-[14.5px] leading-[1.82] text-[#d6cec4] mb-6">
            <strong className="text-[#fcd34d]">① 새로운 현상 발견:</strong>{" "}
            pre-RoPE 공간에서 Q/K 벡터가 위치·도메인·아키텍처에 무관하게 고정
            중심에 집중된다는 <em>Q/K Concentration</em>을 발견하고
            정량화했습니다.
            <br />
            <br />
            <strong className="text-[#86efac]">② 이론적 연결:</strong> 집중
            현상이 어텐션 로짓을 삼각함수 급수(Q-K 거리만의 함수)로 만든다는
            수학적 연결을 확립했습니다. 이로써 어떤 거리의 키를 중요하게 봐야
            하는지를 <em>관찰 없이 사전에</em> 예측할 수 있게 됩니다.
            <br />
            <br />
            <strong className="text-[#93c5fd]">
              ③ 실용적 압축 알고리즘:
            </strong>{" "}
            S_trig + S_norm의 두 구성요소와 집중도 기반 적응형 가중치로 구성된
            TriAttention은 post-RoPE 방법의 불안정성 없이 안정적으로 중요 키를
            선별합니다.
            <br />
            <br />
            가장 중요한 통찰은{" "}
            <em>"이미 모델 안에 있는 구조적 정보를 어떻게 쓸 것인가"</em>라는
            질문입니다. Q/K 집중 현상은 모델이 특정 방향을 학습한 결과이며, 이
            방향이 어떤 위치의 토큰을 중요하게 볼지를 결정합니다. TriAttention은
            이를 추론 시 활용하여 비용 없이 중요도를 예측합니다.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {[
              {
                label: "Q/K Concentration",
                bg: "rgba(217,119,6,0.25)",
                color: "#fcd34d",
                border: "rgba(217,119,6,0.4)",
              },
              {
                label: "삼각함수 급수 근사",
                bg: "rgba(29,78,216,0.25)",
                color: "#93c5fd",
                border: "rgba(29,78,216,0.4)",
              },
              {
                label: "2.5x 처리량",
                bg: "rgba(21,128,61,0.25)",
                color: "#86efac",
                border: "rgba(21,128,61,0.4)",
              },
              {
                label: "10.7x 메모리 감소",
                bg: "rgba(15,118,110,0.25)",
                color: "#5eead4",
                border: "rgba(15,118,110,0.4)",
              },
              {
                label: "도메인 무관 일반화",
                bg: "rgba(217,119,6,0.25)",
                color: "#fcd34d",
                border: "rgba(217,119,6,0.4)",
              },
              {
                label: "소비자 GPU 배포 가능",
                bg: "rgba(29,78,216,0.25)",
                color: "#93c5fd",
                border: "rgba(29,78,216,0.4)",
              },
            ].map(({ label, bg, color, border }) => (
              <span
                key={label}
                className="font-mono text-[11px] px-3.5 py-[5px] rounded-full font-medium"
                style={{ background: bg, color, border: `1px solid ${border}` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 7. 개념 해설 ═══ */}
      <SectionDivider />
      <div className={css.section}>
        <div className={css.secLabel}>
          {"개념 해설 \u00A0|\u00A0 처음 읽는 분을 위한 배경 지식"}
        </div>
        <h2 id="explainer" className={css.h2}>
          RoPE · Pre/Post-RoPE 이해하기
        </h2>
        <p className="text-[14px] text-[#656d76] dark:text-[#8b949e] italic mb-5">
          논문을 더 깊이 이해하고 싶다면 아래 항목을 펼쳐보세요.
        </p>

        <AccordionItem
          icon="📐"
          title="RoPE란 무엇인가? — 위치 정보를 회전으로 넣는다"
        >
          <p className={css.p}>
            LLM은 "이 단어가 문장에서 몇 번째에 있는지"를 알아야 합니다.
            <mark className="bg-yellow-100 px-1 rounded">
              "나는 밥을 먹었다"
            </mark>
            와
            <mark className="bg-yellow-100 px-1 rounded">
              "밥은 나를 먹었다"
            </mark>
            는 단어가 같지만 순서가 달라 의미가 전혀 다릅니다. 이{" "}
            <strong>위치 정보를 벡터에 넣어주는 방법</strong> 중 하나가
            RoPE(Rotary Position Embedding)입니다.
          </p>
          <div className="bg-[#ddf4ff] dark:bg-[#1c2d3e] border-l-[3px] border-[#0969da] dark:border-[#58a6ff] rounded-r-md px-4 py-3 my-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0969da] dark:text-[#58a6ff] font-semibold mb-1">
              RoPE의 핵심 아이디어
            </div>
            위치에 따라 벡터를 <strong>회전</strong>시킨다
          </div>
          <pre className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-[3px] border-l-[#0969da] dark:border-l-[#58a6ff] rounded-r-[6px] rounded-l-none px-5 py-4 my-3.5 text-[12.5px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre leading-[1.8]">{`위치  1번 토큰 → 벡터를  1도 회전
위치  2번 토큰 → 벡터를  2도 회전
위치 10번 토큰 → 벡터를 10도 회전
위치 N번 토큰 → 벡터를 N도 회전 (실제론 각 주파수 대역별로 다름)`}</pre>
          <p className={css.p}>
            회전 각도가 위치마다 다르기 때문에, Q(쿼리)와 K(키)를 내적하면
            자동으로 두 토큰의 <strong>상대적 거리 Δ</strong>가 계산에
            반영됩니다. 현대 LLM(GPT, Llama, Qwen 등) 대부분이 이 방식을
            사용합니다.
          </p>
        </AccordionItem>

        <AccordionItem
          icon="🔢"
          title="왜 어텐션은 '거리'에만 의존하는가? — 삼각함수 덧셈 정리"
        >
          <p className={css.p}>
            RoPE가 만들어내는 <strong>"거리 패턴"</strong>이란, 두 토큰 간의
            어텐션 점수가 각 토큰의 절대 위치가 아닌
            <strong> 상대적 거리(m−n)에만 의존</strong>하는 규칙적인 삼각함수
            패턴을 말합니다. 왜 이렇게 되는지 단계별로 살펴보겠습니다.
          </p>

          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-6 py-5 mb-4">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-[3px] bg-[#ddf4ff] dark:bg-[#1c2d3e] text-[#0969da] dark:text-[#58a6ff] inline-block mb-3">
              1단계
            </div>
            <div className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3] mb-2">
              기본 어텐션 점수 = Q·K 내적
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72]">
              어텐션 점수는 본질적으로 위치 m의 query 벡터 q와 위치 n의 key 벡터
              k의 <strong>내적(dot product)</strong>입니다. "이 두 토큰이 얼마나
              관련 있는가"를 계산하는 것입니다.
            </p>
          </div>

          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-6 py-5 mb-4">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-[3px] bg-[#dbeafe] text-[#0969da] dark:text-[#58a6ff] inline-block mb-3">
              2단계
            </div>
            <div className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3] mb-2">
              RoPE = 위치에 비례한 회전
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72]">
              RoPE는 각 토큰의 벡터를 2차원 평면에서{" "}
              <strong>위치에 비례한 각도만큼 회전</strong>시킵니다.
            </p>
            <pre className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded px-3 py-2 my-3 text-[11px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre leading-[1.8]">{`위치 m의 벡터 → θ×m 만큼 회전
위치 n의 벡터 → θ×n 만큼 회전`}</pre>
          </div>

          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-6 py-5 mb-4 border-t-[3px] border-t-[#0969da] dark:border-t-[#58a6ff]">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-[3px] bg-[#ffebe9] dark:bg-[#2d1216] text-[#cf222e] dark:text-[#ff7b72] inline-block mb-3">
              3단계 — 핵심
            </div>
            <div className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3] mb-2">
              회전의 차이만 남는 이유: 삼각함수 덧셈 정리
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72] mb-3">
              두 벡터를 각각 회전시킨 뒤 내적을 구하면,{" "}
              <strong>회전 행렬의 수학적 성질</strong>에 의해 개별 위치(m, n)는
              사라지고
              <strong> 차이(m−n)만 남습니다</strong>. 이것은 삼각함수의{" "}
              <mark className="bg-[#54aeff] dark:bg-[#1f6feb] px-1 rounded-sm">
                덧셈 정리(Addition Theorem)
              </mark>{" "}
              때문입니다:
            </p>
            <pre className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded px-3 py-2 my-3 text-[12px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre leading-[1.8]">{`cos(α)·cos(β) + sin(α)·sin(β) = cos(α − β)

여기서 α = θ×m, β = θ×n 을 대입하면:
→ 결과 = cos(θ×(m − n))

즉, 어텐션 점수 안에 cos(θ×(m−n)) 항이 등장하며
이것은 오직 두 위치의 차이(m−n)에만 의존합니다.`}</pre>
          </div>

          <div className="bg-[#ddf4ff] dark:bg-[#1c2d3e] border-l-[3px] border-[#0969da] dark:border-[#58a6ff] rounded-r-md px-4 py-4 my-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0969da] dark:text-[#58a6ff] font-semibold mb-2">
              직관적 비유: 시계 바늘
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.75]">
              시계 바늘 두 개가 각각 m칸, n칸만큼 돌아간 상태를 생각해보세요. 두
              바늘이 <strong>"얼마나 같은 방향을 가리키고 있는가"</strong>를
              재면, 중요한 건 각 바늘이 절대적으로 몇 도인지가 아니라
              <strong> 두 바늘 사이의 각도 차이</strong>뿐입니다.
              <br />
              <br />
              3시와 5시의 관계나 7시와 9시의 관계는 둘 다{" "}
              <strong>"2칸 차이"</strong>이므로 동일한 값을 줍니다.
            </p>
          </div>

          <RopeClockViz />

          <div className="bg-[#dcfce7] dark:bg-[#1a2e1a] border border-[#86efac] rounded-[10px] px-6 py-5 mt-4">
            <div className="font-bold text-[14px] text-[#1a7f37] dark:text-[#3fb950] mb-2">
              이것이 바로 "거리 패턴"의 정체
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72]">
              RoPE로 인해 어텐션 점수에 <strong>삼각함수적인 주기 구조</strong>
              가 생기고, 그 주기는 토큰 간 상대 거리에 의해 결정됩니다.
              TriAttention은 이 규칙적인 주기 구조를 알고 있으니, 역으로{" "}
              <strong>
                "거리가 이 정도인 토큰 쌍은 어텐션 점수가 낮을 것"
              </strong>
              이라고 예측해서 계산을 건너뛸 수 있는 것입니다. 이것이
              TriA-Filter의 원리입니다.
            </p>
          </div>
        </AccordionItem>

        <AccordionItem icon="🔄" title="Pre-RoPE vs Post-RoPE — 회전 전과 후">
          <p className={css.p}>
            회전을 적용하기 <strong>전</strong>과 <strong>후</strong>를 나누는
            개념입니다.
          </p>
          <pre className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-[3px] border-l-[#0969da] dark:border-l-[#58a6ff] rounded-r-[6px] rounded-l-none px-5 py-4 my-3.5 text-[12.5px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre leading-[1.8]">{`원본 벡터  →  [Pre-RoPE]
                   ↓
           [RoPE 회전 적용]
                   ↓
회전된 벡터  →  [Post-RoPE]
                   ↓
           어텐션 계산 (Q·K 내적)`}</pre>
          <div className="grid grid-cols-2 gap-3 my-3 max-[640px]:grid-cols-1">
            <div className="bg-[#ffebe9] dark:bg-[#2d1216] border border-[#fca5a5] dark:border-[#da3633] rounded-lg p-4">
              <div className="font-mono text-[9px] text-[#cf222e] dark:text-[#ff7b72] font-semibold mb-1">
                ❌ Post-RoPE (회전 후)
              </div>
              <p className="text-[12px] text-[#1f2328] dark:text-[#e6edf3]">
                위치에 따라 다른 각도로 회전되어, 벡터 방향이 토큰마다
                달라집니다.
              </p>
              <pre className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-[3px] border-l-[#0969da] dark:border-l-[#58a6ff] rounded-r-[6px] rounded-l-none px-5 py-4 mt-2 text-[12.5px] font-mono text-[#1f2328] dark:text-[#e6edf3] leading-[1.8]">{`↖  ↑  ↗  →  ↘  ↓  ↙
각 토큰의 Q벡터 방향이 다 다름`}</pre>
            </div>
            <div className="bg-[#dcfce7] dark:bg-[#1a2e1a] border border-[#86efac] rounded-lg p-4">
              <div className="font-mono text-[9px] text-[#1a7f37] dark:text-[#3fb950] font-semibold mb-1">
                ✅ Pre-RoPE (회전 전)
              </div>
              <p className="text-[12px] text-[#1f2328] dark:text-[#e6edf3]">
                회전 전이므로 위치 영향이 없습니다. 모든 위치의 Q벡터가 비슷한
                방향에 모여 있습니다.
              </p>
              <pre className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-[3px] border-l-[#0969da] dark:border-l-[#58a6ff] rounded-r-[6px] rounded-l-none px-5 py-4 mt-2 text-[12.5px] font-mono text-[#1f2328] dark:text-[#e6edf3] leading-[1.8]">{`↑ ↑ ↑ ↑ ↑ ↑ ↑
모두 비슷한 방향 → 중심(●) 추출 가능`}</pre>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem icon="🪟" title="왜 기존 방법은 관찰 창이 좁아지는가?">
          <p className={css.p}>
            기존 KV 압축 방법들은 <strong>Post-RoPE 쿼리의 어텐션 점수</strong>
            로 중요한 토큰을 선별합니다. "최근 쿼리가 어디에 높은 어텐션을
            줬는지"를 보는 방식입니다.
          </p>
          <div className="bg-[#ddf4ff] dark:bg-[#1c2d3e] border-l-[3px] border-[#0969da] dark:border-[#58a6ff] rounded-r-md px-4 py-3 mb-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0969da] dark:text-[#58a6ff] font-semibold mb-1">
              관찰 창이란?
            </div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72]">
              time window(시간 범위)가 아니라,{" "}
              <strong>"중요도 판단에 신뢰할 수 있는 쿼리의 범위"</strong>를
              말합니다. RoPE가 쿼리 벡터를 위치마다 회전시키기 때문에, 오래된
              쿼리는 현재 쿼리와 회전 방향이 너무 달라져 "지금 어디에 주목해야
              하는가"를 대표하지 못합니다. 결국 신뢰할 수 있는 쿼리가 가장 최근
              소수에 불과하고, 이 범위가 바로 관찰 창입니다.
            </p>
          </div>
          <p className={css.p}>그런데 현재 위치가 1000번이라면:</p>
          <pre className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-[3px] border-l-[#0969da] dark:border-l-[#58a6ff] rounded-r-[6px] rounded-l-none px-5 py-4 my-3.5 text-[12.5px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre leading-[1.8]">{`위치 999번 Q벡터: 거의 1000도 회전  ← 현재 방향과 유사 ✓
위치 998번 Q벡터: 약간 더 회전됨    ← 거의 유사         ✓
위치 900번 Q벡터: 꽤 다른 각도      ← 방향이 많이 다름  △
위치  10번 Q벡터: 완전히 다른 각도  ← 대표성 없음       ✗`}</pre>
          <div className="bg-[#ffebe9] dark:bg-[#2d1216] border-l-[3px] border-[#cf222e] dark:border-[#ff7b72] rounded-r-md px-4 py-3 my-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#cf222e] dark:text-[#ff7b72] font-semibold mb-1">
              결과적 문제
            </div>
            오래된 쿼리는 "지금 무엇이 중요한지"를 대표하지 못합니다.
            <br />
            관찰 창이 극도로 좁아져 ≈ 25개 쿼리가 한계. 창 밖의 중요 토큰은 영구
            제거됩니다.
          </div>
        </AccordionItem>

        <AccordionItem
          icon="💡"
          title="TriAttention의 핵심 통찰 — 중심 하나로 미래를 예측한다"
        >
          <p className={css.p}>
            TriAttention이 발견한 것은 이겁니다. Post-RoPE에서는 벡터가 위치마다
            흩어지지만,
            <strong>
              {" "}
              회전을 적용하기 전(Pre-RoPE) 벡터는 위치에 관계없이 항상 비슷한
              방향에 모여있다
            </strong>
            는 것입니다.
          </p>
          <pre className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-[3px] border-l-[#0969da] dark:border-l-[#58a6ff] rounded-r-[6px] rounded-l-none px-5 py-4 my-3.5 text-[12.5px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre leading-[1.8]">{`Pre-RoPE Q벡터들 (위치 1, 10, 100, 1000번 토큰 모두):

    ↑↑↑↑↑↑
    ↑↑↑↑↑    ← 모두 비슷한 방향으로 집중됨!
     ●  ← 중심(평균 방향) = Q/K Concentration`}</pre>
          <p className={css.p}>
            이 중심을 <strong>오프라인에서 미리 캘리브레이션</strong>해두면,
            추론 중에 굳이 실제 쿼리를 관찰하지 않아도 됩니다. 중심 벡터를 RoPE
            공식에 대입하면:
          </p>
          <div className="bg-[#ddf4ff] dark:bg-[#1c2d3e] border-l-[3px] border-[#0969da] dark:border-[#58a6ff] rounded-r-md px-4 py-3 my-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0969da] dark:text-[#58a6ff] font-semibold mb-1">
              삼각함수 급수로 변환
            </div>
            어텐션 로짓 ≈{" "}
            <code className={css.code}>
              {"Σ_f [ a_f·cos(ω_f·Δ) + b_f·sin(ω_f·Δ) ]"}
            </code>
            <br />
            <br />→ 거리 Δ만의 함수! "이 헤드는 거리 X의 키를 좋아한다"를 사전에
            예측 가능
          </div>
          <p className={css.p}>
            이 덕분에 TriAttention은 <strong>어떤 위치에서 쿼리가 오든</strong>{" "}
            안정적으로 중요한 키를 선별할 수 있습니다.
          </p>
        </AccordionItem>

        <AccordionItem icon="📊" title="한눈에 보는 비교 정리">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#656d76] dark:text-[#8b949e] text-left px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]"></th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#656d76] dark:text-[#8b949e] text-left px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
                    Pre-RoPE
                  </th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#656d76] dark:text-[#8b949e] text-left px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
                    Post-RoPE
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "상태",
                    pre: "위치 회전 적용 전",
                    post: "위치 회전 적용 후",
                  },
                  {
                    label: "벡터 방향",
                    pre: "안정적 — 위치 무관하게 집중",
                    post: "위치마다 달라짐 (회전)",
                    preGood: true,
                    postBad: true,
                  },
                  {
                    label: "관찰 창",
                    pre: "불필요 — 중심 하나로 충분",
                    post: "최근 ≈25개 쿼리만 신뢰 가능",
                    preGood: true,
                    postBad: true,
                  },
                  {
                    label: "미래 예측",
                    pre: "삼각함수 급수로 가능",
                    post: "어려움 (방향이 계속 변함)",
                    preGood: true,
                    postBad: true,
                  },
                  {
                    label: "TriAttention 활용",
                    pre: "✅ 중심 추출 → 미래 어텐션 예측",
                    post: "❌ 기존 방법 — 불안정",
                    preBest: true,
                    postBad: true,
                  },
                ].map((r, i) => (
                  <tr
                    key={i}
                    className={r.preBest ? "bg-[rgba(21,128,61,0.04)]" : ""}
                  >
                    <td className="px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                      {r.label}
                    </td>
                    <td
                      className={`px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] ${r.preBest ? "text-[#1a7f37] dark:text-[#3fb950] font-bold" : r.preGood ? "text-[#1a7f37] dark:text-[#3fb950]" : "text-[#1f2328] dark:text-[#e6edf3]"}`}
                    >
                      {r.pre}
                    </td>
                    <td
                      className={`px-4 py-[11px] border-b border-[#d0d7de] dark:border-[#30363d] ${r.postBad ? "text-[#cf222e] dark:text-[#ff7b72]" : "text-[#1f2328] dark:text-[#e6edf3]"}`}
                    >
                      {r.post}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionItem>
      </div>

      {/* ═══ 8. 용어 사전 ═══ */}
      <SectionDivider />
      <div className={css.section}>
        <div className={css.secLabel}>Reference</div>
        <h2 id="glossary" className={css.h2}>
          약어 & 용어
        </h2>
        <div className="flex flex-wrap gap-2 my-3.5">
          {[
            { term: "KV 캐시", def: "Key-Value 캐시" },
            { term: "RoPE", def: "Rotary Position Embedding" },
            { term: "MRL", def: "Mean Resultant Length (집중도)" },
            { term: "GQA", def: "Grouped-Query Attention" },
            { term: "MLA", def: "Multi-head Latent Attention" },
            { term: "S_trig", def: "삼각함수 급수 점수" },
            { term: "S_norm", def: "노름 기반 점수" },
            { term: "Δ", def: "Q-K 위치 거리" },
            { term: "R_f", def: "주파수 대역 f의 집중도" },
            { term: "pre-RoPE", def: "RoPE 회전 적용 이전 벡터" },
            { term: "post-RoPE", def: "RoPE 회전 적용 이후 벡터" },
          ].map(({ term, def }) => (
            <div
              key={term}
              className="font-mono text-[10.5px] bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded px-2.5 py-[3px] text-[#656d76] dark:text-[#8b949e]"
            >
              <strong className="text-[#1f2328] dark:text-[#e6edf3]">{term}</strong>
              <span className="ml-1">{def}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-10 border-t border-[#d0d7de] dark:border-[#30363d]">
        <a
          href="https://arxiv.org/abs/2604.04921"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:underline"
        >
          arXiv:2604.04921 · 원본 논문 보기 →
        </a>
        <div className="mt-2">
          <a
            href="https://www.aitimes.com/news/articleView.html?idxno=208924"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:underline"
          >
            AI타임스 · 관련 기사 보기 →
          </a>
        </div>
        <div className="font-mono text-[10px] text-[#656d76] dark:text-[#8b949e] mt-2">
          TriAttention: Efficient Long Reasoning with Trigonometric KV
          Compression
        </div>
        <div className="font-mono text-[10px] text-[#656d76] dark:text-[#8b949e] mt-1">
          Mao · Lin · Huang · Xie · Fu · Zhuang · Han · Chen · MIT / NVIDIA /
          ZJU · 2026
        </div>
      </div>
    </div>
  );
};

export default TriAttentionPost;
