import Formula from "../../Formula";

const css = {
  section: "mb-20",
  secLabel: "font-mono text-[10px] tracking-[0.18em] uppercase text-gray-400 mb-2.5",
  h2: "text-2xl font-bold mb-1.5 text-gray-800",
  h3: "text-[1.05rem] font-semibold mb-3 text-gray-800",
  p: "text-gray-600 mb-3.5 leading-relaxed text-[15px]",
  card: "bg-[#f0ede4] rounded-lg p-7 mb-5 shadow-md -rotate-[0.3deg]",
  cardAccent: "bg-[#dce6ef] rounded-lg p-7 mb-5 shadow-md rotate-[0.3deg]",
  cardGold: "bg-[#e8ddd0] rounded-lg p-7 mb-5 shadow-md -rotate-[0.2deg]",
  cardGreen: "bg-[#d6e4d6] rounded-lg p-7 mb-5 shadow-md rotate-[0.2deg]",
  formula: "bg-white/60 border border-gray-200 border-l-[3px] border-l-gray-400 rounded-md px-5 py-4 my-4 overflow-x-auto",
  callout: "bg-[#dce6ef]/50 border border-[#c4d3e0] rounded-lg px-5 py-4 my-4 text-[13px] text-gray-700",
  calloutGold: "bg-[#e8ddd0]/50 border border-[#d4c4b0] rounded-lg px-5 py-4 my-4 text-[13px] text-gray-700",
  calloutGreen: "bg-[#d6e4d6]/50 border border-[#b8ccb8] rounded-lg px-5 py-4 my-4 text-[13px] text-gray-700",
  divider: "flex items-center gap-3.5 my-16",
  dividerLine: "flex-1 h-px bg-gray-200",
  dividerText: "font-mono text-[11px] text-gray-400 whitespace-nowrap uppercase tracking-[0.14em]",
  code: "font-mono text-[12px] bg-gray-100 px-1 py-px rounded text-gray-700",
};

const SectionDivider = ({ children }) => (
  <div className={css.divider}>
    <div className={css.dividerLine} />
    <span className={css.dividerText}>{children}</span>
    <div className={css.dividerLine} />
  </div>
);

const FormulaBlock = ({ children, comment }) => (
  <div className={css.formula}>
    <div className="text-center">{children}</div>
    {comment && <div className="font-mono text-[12px] text-gray-500 mt-2 text-center">{comment}</div>}
  </div>
);

const InsightCard = ({ icon, title, children, color = "blue" }) => {
  const colors = {
    blue: "border-t-[#2563eb]",
    amber: "border-t-[#b45309]",
    green: "border-t-[#059669]",
    teal: "border-t-[#0f766e]",
    red: "border-t-[#dc2626]",
    purple: "border-t-[#7c3d8f]",
  };
  return (
    <div className={`bg-white border border-gray-200 border-t-[3px] ${colors[color]} rounded-lg p-5`}>
      <div className="text-[20px] mb-2">{icon}</div>
      <div className="font-semibold text-[14px] text-gray-800 mb-1.5">{title}</div>
      <p className="text-[13px] text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
};

const TriAttentionPost = () => {
  return (
    <div className="font-dm-sans text-[#1a1e2a] text-[15px] leading-relaxed">

      {/* ═══ 0. 전체 요약 ═══ */}
      <div className={css.section}>
        <div className={css.secLabel}>Overview</div>
        <h2 id="overview" className={css.h2}>한 문단으로 보는 TriAttention</h2>

        <div className={css.cardAccent}>
          <p className="text-[15px] font-semibold text-gray-800 leading-relaxed mb-3">
            LLM이 긴 추론을 할 때 KV 캐시가 폭발적으로 커지는 문제를 해결하기 위해,
            TriAttention은 <strong>post-RoPE 공간 대신 pre-RoPE 공간</strong>을 분석하는 새로운 접근법을 취합니다.
          </p>
          <p className={css.p}>
            기존 방법들은 최근 쿼리의 어텐션 점수로 중요한 KV를 선별하지만, RoPE 때문에 쿼리가 위치마다 회전해 관찰 창이 너무 좁습니다.
            TriAttention은 pre-RoPE 공간에서 Q/K 벡터가 <strong>고정된 비제로 중심 주변에 안정적으로 집중</strong>(Q/K Concentration)된다는 사실을 발견합니다.
            이 집중 현상 덕분에 어텐션 로짓이 <strong>Q-K 거리만의 함수인 삼각함수 급수</strong>로 근사되며,
            이를 통해 어떤 위치의 키가 미래 쿼리로부터 많은 어텐션을 받을지 <em>사전에</em> 예측할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3.5 my-5 max-[700px]:grid-cols-1">
          <InsightCard icon="🔑" title="핵심 발견" color="amber">
            pre-RoPE Q/K 벡터는 위치·컨텍스트에 무관하게 고정된 중심 주변에 집중됨 — <strong>Q/K Concentration</strong>
          </InsightCard>
          <InsightCard icon="📐" title="이론적 근거" color="blue">
            집중 현상 → 어텐션 로짓 ≈ 삼각함수 급수(Q-K 거리만의 함수) → 미래 어텐션 예측 가능
          </InsightCard>
          <InsightCard icon="⚡" title="실용적 결과" color="green">
            AIME25 기준 <strong>2.5x</strong> 처리량 향상 또는 <strong>10.7x</strong> KV 메모리 감소, Full Attention 정확도 유지
          </InsightCard>
        </div>
      </div>

      {/* ═══ 1. 문제 정의 ═══ */}
      <SectionDivider>Problem Definition</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>{"§ 1-2 | 문제 정의 & 관련 연구"}</div>
        <h2 id="problem" className={css.h2}>왜 기존 KV 압축은 장문 추론에서 실패하는가?</h2>

        <div className="grid grid-cols-2 gap-4 my-5 max-[640px]:grid-cols-1">
          <div className="bg-[#fee2e2] border border-[#fca5a5] rounded-lg p-5">
            <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-[#dc2626] font-semibold mb-2.5">기존 방법의 한계</div>
            <div className="font-semibold text-[15px] text-gray-800 mb-2">Post-RoPE 관찰 창 문제</div>
            <p className="text-[13px] text-gray-700 leading-relaxed">
              기존 방법(H2O, SnapKV, R-KV 등)은 <strong>최근 쿼리의 어텐션 점수</strong>로 중요 토큰을 선별합니다.
              하지만 RoPE는 쿼리 벡터를 위치마다 회전시켜 최신 방향을 가진 쿼리가 극소수에 불과합니다.
            </p>
            <ul className="text-[12px] text-gray-600 mt-2 space-y-1 list-disc pl-4">
              <li>관찰 창이 너무 좁음 (≈25개 쿼리가 한계)</li>
              <li>창 밖에서 중요해지는 토큰을 조기 제거</li>
              <li>Retrieval head에서 특히 치명적</li>
              <li>사고 연쇄(chain-of-thought)가 중간에 끊김</li>
            </ul>
          </div>
          <div className="bg-[#dcfce7] border border-[#86efac] rounded-lg p-5">
            <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-[#059669] font-semibold mb-2.5">TriAttention의 해법</div>
            <div className="font-semibold text-[15px] text-gray-800 mb-2">Pre-RoPE 공간의 안정적 신호 활용</div>
            <p className="text-[13px] text-gray-700 leading-relaxed">
              위치 회전이 적용되기 <strong>이전</strong>의 pre-RoPE 공간에서는 Q/K 벡터가 위치·컨텍스트에 관계없이 안정적입니다.
            </p>
            <ul className="text-[12px] text-gray-600 mt-2 space-y-1 list-disc pl-4">
              <li>관찰 창 크기에 무관한 중요도 추정</li>
              <li>미래 어텐션 패턴을 사전에 예측 가능</li>
              <li>오프라인 캘리브레이션으로 온라인 적용</li>
              <li>어떤 도메인 데이터로 캘리브레이션해도 일반화됨</li>
            </ul>
          </div>
        </div>

        <div className={css.calloutGold}>
          <strong>어텐션 기반 vs 노름 기반 — 둘 다 부족하다:</strong><br/>
          어텐션 기반 방법은 <strong>방향 정보를 담고 있지만 위치 회전과 엉켜</strong> 사용하기 어렵고,
          노름 기반 방법(VATP 등)은 <strong>벡터 크기만 보고 방향을 무시</strong>합니다.
          TriAttention은 pre-RoPE 공간에서 방향과 크기를 모두 활용하며 이 두 한계를 동시에 해소합니다.
        </div>
      </div>

      {/* ═══ 2. 핵심 발견: Q/K Concentration ═══ */}
      <SectionDivider>{"Pre-RoPE & Trigonometric Series"}</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>{"§ 3 | 핵심 발견"}</div>
        <h2 id="concentration" className={css.h2}>Q/K Concentration과 삼각함수 급수</h2>

        <div className={css.cardGold}>
          <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-[#b45309] font-semibold mb-2">Observation 3.1 — Prevalent Q/K Concentration</div>
          <div className="font-semibold text-[16px] text-gray-800 mb-2">pre-RoPE Q/K 벡터는 고정된 중심 주변에 집중된다</div>
          <p className={css.p}>
            Qwen3-8B의 1,152개 어텐션 헤드 대다수에서 pre-RoPE Q/K 벡터가 <strong>고정된 비제로 중심 주변에 강하게 집중</strong>됩니다.
            이 집중은 입력 내용이나 토큰 위치와 무관하게 안정적입니다.
            수학·코딩·챗 도메인에서 <strong>MRL 값이 0.977–0.980으로 거의 동일</strong>하며, 헤드의 ~90%가 R {">"} 0.95를 보입니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 my-5 max-[700px]:grid-cols-1">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#fee2e2] text-[#dc2626]">집중 전</span>
              <span className="font-semibold text-[14px] text-gray-800">Post-RoPE: 위치마다 흩어진 벡터</span>
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed">
              RoPE가 적용된 후에는 Q 벡터가 위치에 따라 회전하여 호(arc) 형태로 퍼집니다.
              방향이 계속 변하므로 어텐션에서 방향 정보를 추출하기 어렵습니다.
            </p>
            {/* Scatter SVG — dispersed */}
            <svg viewBox="0 0 200 120" width="100%" className="mt-3 block">
              <rect width="200" height="120" fill="#f8f9fc" rx="6"/>
              <line x1="100" y1="10" x2="100" y2="110" stroke="#e8eaf0" strokeWidth="1"/>
              <line x1="10" y1="60" x2="190" y2="60" stroke="#e8eaf0" strokeWidth="1"/>
              {/* Scattered points in an arc */}
              {[[30,25],[45,20],[60,22],[75,30],[90,42],[105,55],[120,68],[135,78],[150,85],[165,90],[55,45],[80,55],[140,60],[110,38],[70,65]].map(([x,y],i)=>(
                <circle key={i} cx={x} cy={y} r="3.5" fill="#dc2626" opacity=".4"/>
              ))}
              <text x="100" y="115" fontSize="8" fill="#9ca3af" textAnchor="middle" fontFamily="DM Mono">RoPE 회전으로 퍼짐</text>
            </svg>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#dcfce7] text-[#059669]">집중 후</span>
              <span className="font-semibold text-[14px] text-gray-800">Pre-RoPE: 중심 주변에 안정적 집중</span>
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed">
              RoPE 적용 이전에는 Q/K 벡터가 하나의 고정된 중심 주변에 밀집합니다.
              서로 다른 입력 시퀀스에서도 동일한 군집 구조가 나타납니다.
              <strong> Mean Resultant Length R → 1</strong>이 이를 수치화합니다.
            </p>
            {/* Scatter SVG — concentrated */}
            <svg viewBox="0 0 200 120" width="100%" className="mt-3 block">
              <rect width="200" height="120" fill="#f8f9fc" rx="6"/>
              <line x1="100" y1="10" x2="100" y2="110" stroke="#e8eaf0" strokeWidth="1"/>
              <line x1="10" y1="60" x2="190" y2="60" stroke="#e8eaf0" strokeWidth="1"/>
              {/* Concentrated cluster */}
              {[[118,38],[122,42],[115,40],[120,36],[125,44],[117,43],[123,39],[119,41],[121,37],[116,39],[124,41],[120,40],[118,36],[122,44],[114,42]].map(([x,y],i)=>(
                <circle key={i} cx={x} cy={y} r="3.5" fill="#059669" opacity=".5"/>
              ))}
              {/* Center marker */}
              <circle cx="120" cy="40" r="6" fill="none" stroke="#059669" strokeWidth="1.5" strokeDasharray="3,2"/>
              <text x="135" y="36" fontSize="8" fill="#059669" fontFamily="DM Mono">E[q]</text>
              <text x="100" y="115" fontSize="8" fill="#9ca3af" textAnchor="middle" fontFamily="DM Mono">고정 중심에 밀집</text>
            </svg>
          </div>
        </div>

        <h3 className={css.h3} style={{marginTop:"28px"}}>집중 현상 → 삼각함수 급수로의 변환</h3>
        <p className={css.p}>
          Q/K가 중심으로 집중되면 <code className={css.code}>q_f ≈ q̄_f</code>, <code className={css.code}>k_f ≈ k̄_f</code>로 근사할 수 있습니다.
          이를 RoPE 어텐션 로짓 공식에 대입하면, 로짓이 개별 벡터가 아닌 <strong>Q-K 거리 Δ만의 함수</strong>가 됩니다:
        </p>

        <FormulaBlock comment="집중 근사 적용 후 — 삼각함수 급수">
          <Formula tex={String.raw`\text{logit}(\Delta) \approx \sum_f \left[ a_f \cos(\omega_f \Delta) + b_f \sin(\omega_f \Delta) \right]`} block />
        </FormulaBlock>

        <div className={css.card}>
          <div className="grid grid-cols-3 gap-3 font-mono text-[12px] text-gray-600">
            <div><strong className="text-gray-800">a_f, b_f</strong><br/>Q/K 중심에 의해 결정되는 상수</div>
            <div><strong className="text-gray-800">ω_f</strong><br/>RoPE 주파수 (기하급수적 진행)</div>
            <div><strong className="text-gray-800">Δ</strong><br/>Q-K 위치 거리</div>
          </div>
          <p className="text-[12px] text-gray-500 mt-3 mb-0 italic">→ Fourier 합성과 유사: Q/K 중심이 "계수"를 결정하고, 어느 거리의 키가 선호될지를 규정합니다.</p>
        </div>

        <div className="grid grid-cols-3 gap-3.5 mt-5 max-[700px]:grid-cols-1">
          <InsightCard icon="🏔️" title="로컬 어텐션 헤드" color="amber">
            삼각함수 급수가 작은 Δ에서 피크 → 가까운 키를 선호. 최근 컨텍스트 활용.
          </InsightCard>
          <InsightCard icon="🌊" title="어텐션 싱크 헤드" color="blue">
            삼각함수 급수가 큰 Δ에서 피크 → 먼 키(초기 토큰 등)를 선호.
          </InsightCard>
          <InsightCard icon="✅" title="실험 검증" color="green">
            Qwen3/Qwen2.5/Llama3 전체 헤드에서 재구성 피어슨 r̄ 평균 {">"} 0.5, 다수 헤드에서 0.6–0.9.
          </InsightCard>
        </div>
      </div>

      {/* ═══ 3. 방법론 ═══ */}
      <SectionDivider>Methodology</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>{"§ 4 | 방법론"}</div>
        <h2 id="method" className={css.h2}>TriAttention 설계</h2>

        <p className={css.p}>
          TriAttention은 <strong>오프라인 캘리브레이션</strong>으로 Q/K 중심을 미리 구하고,
          추론 시 이 중심을 활용하여 각 키의 중요도를 점수화합니다.
          예산 B를 초과할 때마다 상위 B개 키만 남기고 나머지를 제거합니다.
        </p>

        {/* Pipeline SVG */}
        <div className={css.cardAccent}>
          <h3 className={css.h3}>전체 파이프라인</h3>
          <svg viewBox="0 0 900 100" width="100%" className="block overflow-visible">
            <defs>
              <marker id="triArr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0.5 L5,3 L0,5.5" fill="none" stroke="#9ca3af" strokeWidth="1.2"/>
              </marker>
            </defs>
            {[
              {x:0, w:130, label:"오프라인", name:"Q/K 중심", sub:"E[q_f], E[k_f]", color:"#b45309"},
              {x:155, w:130, label:"Step 1", name:"삼각함수 급수 점수", sub:"S_trig(k, Δ)", color:"#2563eb"},
              {x:310, w:120, label:"Step 2", name:"노름 기반 점수", sub:"S_norm(k)", color:"#059669"},
              {x:455, w:130, label:"Step 3", name:"집중도 가중치", sub:"R_f 적응 조합", color:"#0f766e"},
              {x:610, w:130, label:"Step 4", name:"다중 오프셋 평균", sub:"S̃(k) 최종 점수", color:"#7c3d8f"},
              {x:765, w:120, label:"출력", name:"Top-B 키 유지", sub:"KV 캐시 가지치기", color:"#b45309"},
            ].map(({x,w,label,name,sub,color},i)=>(
              <g key={i}>
                <rect x={x} y="10" width={w} height="70" rx="7" fill="white" stroke={color} strokeWidth="1.5"/>
                <line x1={x} y1="10" x2={x+w} y2="10" stroke={color} strokeWidth="3"/>
                <text x={x+w/2} y="30" fontSize="8.5" fill="#9ca3af" fontFamily="DM Mono" textAnchor="middle" letterSpacing=".1em">{label}</text>
                <text x={x+w/2} y="48" fontSize="10.5" fill="#1a1e2a" fontFamily="DM Mono" textAnchor="middle" fontWeight="700">{name}</text>
                <text x={x+w/2} y="64" fontSize="9" fill={color} fontFamily="DM Mono" textAnchor="middle">{sub}</text>
                {i < 5 && <line x1={x+w+2} y1="45" x2={x+w+20} y2="45" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#triArr)"/>}
              </g>
            ))}
          </svg>
        </div>

        {/* Scoring components */}
        <div className="grid grid-cols-2 gap-4 mt-5 max-[640px]:grid-cols-1">
          <div className={css.card}>
            <div className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#e8ddd0] text-[#b45309] inline-block mb-2">구성요소 1</div>
            <h3 className={css.h3}>삼각함수 급수 점수 S_trig</h3>
            <FormulaBlock comment="Q 중심 E[q_f]을 미래 쿼리의 대리자로 사용">
              <Formula tex={String.raw`S_{\text{trig}}(k, \Delta) = \sum_f \|E[q_f]\| \cdot \|k_f\| \cdot \cos(\omega_f \Delta + \varphi_f)`} block />
            </FormulaBlock>
            <p className="text-[12px] text-gray-600">
              캐시된 키 k를 실제 값 그대로 사용하여 거리 Δ에 따른 기대 어텐션을 계산합니다.
              Q/K 집중이 강할수록 정확합니다.
            </p>
          </div>
          <div className={css.card}>
            <div className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#dce6ef] text-[#2563eb] inline-block mb-2">구성요소 2</div>
            <h3 className={css.h3}>노름 기반 점수 S_norm</h3>
            <FormulaBlock comment="집중도가 낮은 헤드를 위한 보완 신호">
              <Formula tex={String.raw`S_{\text{norm}}(k) = \sum_f (1 - R_f) \cdot E[\|q_f\|] \cdot \|k_f\|`} block />
            </FormulaBlock>
            <p className="text-[12px] text-gray-600">
              <strong>(1−R_f)</strong> 가중치로 집중이 약할수록 노름 점수 기여를 자동으로 높입니다.
              주파수 대역별 기대 쿼리 노름으로 가중합니다.
            </p>
          </div>
        </div>

        <div className={css.calloutGreen}>
          <strong>최종 점수:</strong> <Formula tex={String.raw`S(k, \Delta) = S_{\text{trig}}(k, \Delta) + S_{\text{norm}}(k)`} /><br/>
          키 하나는 어떤 미래 위치에서도 쿼리될 수 있으므로, 여러 미래 오프셋{" "}
          <code className={css.code}>{"D = {1, 2, 4, ..., 2¹⁶}"}</code>에서 점수를 평균냅니다.
          기하 간격 샘플링이 선형보다 훨씬 효과적임이 실험으로 확인됩니다 (45.8% vs 28.7%).
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 max-[700px]:grid-cols-1">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="font-semibold text-[14px] text-gray-800 mb-2">윈도우 기반 가지치기</div>
            <p className="text-[13px] text-gray-600 leading-relaxed">
              매 디코딩 스텝마다 점수 계산은 비쌉니다. <strong>128 토큰마다 한 번씩</strong> 가지치기를 트리거합니다.
              배치 처리로 오버헤드를 크게 줄입니다.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="font-semibold text-[14px] text-gray-800 mb-2">GQA 처리: 정규화 후 최대 집계</div>
            <p className="text-[13px] text-gray-600 leading-relaxed">
              GQA에서 G개 쿼리 헤드가 KV를 공유할 때, 각 헤드 내 z-score 정규화 후 <strong>max 집계</strong>로
              최종 점수를 얻습니다. 어느 한 헤드라도 중요하다고 판단하면 키를 유지합니다.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ 4. 실험 결과 ═══ */}
      <SectionDivider>Experimental Results</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>{"§ 5 | 실험 결과"}</div>
        <h2 id="results" className={css.h2}>수치로 보는 TriAttention 성능</h2>

        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-3.5 my-5 max-[500px]:grid-cols-1">
          {[
            {value:"2.5x", label:"처리량 향상", desc:"AIME25에서 Full Attention과 동일 정확도(40.8%)로 달성", color:"#b45309"},
            {value:"10.7x", label:"KV 메모리 감소", desc:"Full Attention 정확도를 유지하면서 달성한 KV 캐시 메모리 감소", color:"#2563eb"},
            {value:"6.3x", label:"MATH 500 처리량", desc:"유사 정확도로 1,405 vs 223 토큰/s 달성 (KV 예산 1,024)", color:"#059669"},
          ].map(({value,label,desc,color})=>(
            <div key={label} className="bg-white border border-gray-200 rounded-lg p-5 text-center">
              <div className="text-[2rem] font-bold mb-1" style={{color}}>{value}</div>
              <div className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.08em] mb-2">{label}</div>
              <p className="text-[12px] text-gray-600">{desc}</p>
            </div>
          ))}
        </div>

        {/* AIME25 comparison table */}
        <div className={css.card + " mt-5"}>
          <h3 className={css.h3}>AIME25 정확도 비교 (Qwen3-8B, KV 예산 2048)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["방법","AIME24","AIME25","MATH 500 (예산 512)","특징"].map(h=>(
                    <th key={h} className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500 text-left px-3.5 py-2.5 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {name:"Full Attention", vals:["57.1%","40.8%","69.6%"], note:"압축 없음 (상한)"},
                  {name:"SnapKV", vals:["34.6%","20.0%","49.2%"], note:"로컬 창 기반", bad:true},
                  {name:"R-KV", vals:["25.4%","17.5%","46.4%"], note:"최근 쿼리 + 중복 감지", bad:true},
                  {name:"TriAttention ★", vals:["42.1%","32.9%","56.0%"], note:"pre-RoPE 삼각함수", best:true},
                ].map((r,i)=>(
                  <tr key={i} className={r.best ? "bg-[rgba(5,150,105,0.04)]" : "hover:bg-black/[0.02]"}>
                    <td className={`px-3.5 py-2.5 border-b border-[#eaecf0] font-semibold ${r.best?"text-[#059669]":""}`}>{r.name}</td>
                    {r.vals.map((v,j)=>(
                      <td key={j} className={`px-3.5 py-2.5 border-b border-[#eaecf0] ${r.best?"text-[#059669] font-bold":r.bad?"text-[#dc2626]":"text-gray-600"}`}>{v}</td>
                    ))}
                    <td className="px-3.5 py-2.5 border-b border-[#eaecf0] text-gray-500">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Memory retention */}
        <div className={css.cardGreen + " mt-5"}>
          <h3 className={css.h3}>메모리 유지 벤치마크: DFS 재귀 시뮬레이션</h3>
          <p className="text-[13px] text-gray-600 mb-3">KV 캐시 압축 시 장문 추론 중 중간 상태를 잊어버릴 위험을 DFS 재귀(깊이 6~20)로 측정</p>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="font-mono text-[10px] text-[#059669] font-bold min-w-[90px]">TriAttention</span>
              <p className="text-[12px] text-gray-600">깊이 16까지 Full Attention과 동등, 깊이 8·12에서는 약간 능가. 깊이 18 이상에서야 격차 발생.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono text-[10px] text-[#dc2626] font-bold min-w-[90px]">R-KV</span>
              <p className="text-[12px] text-gray-600">깊이 14→16 구간에서 <strong className="text-[#dc2626]">61% → 31%로 재앙적 정확도 하락</strong>. 중간 상태 제거로 연쇄 오류 발생.</p>
            </div>
          </div>
        </div>

        {/* Ablation */}
        <div className={css.cardAccent + " mt-5"}>
          <h3 className={css.h3}>소거 연구 (Qwen3-8B, KV 예산 2048)</h3>
          <div className="space-y-3">
            {[
              {n:"1", color:"amber", text:<><strong>S_trig 제거 시:</strong> AIME24 42.1% → 18.8%, AIME25 32.9% → 21.2%로 급락. 삼각함수 급수 점수가 핵심.</>},
              {n:"2", color:"blue", text:<><strong>S_norm 제거 시:</strong> AIME24 −5.4% (45.8% → 40.4%). 노름 점수가 보완 역할을 수행.</>},
              {n:"3", color:"green", text:<><strong>집중도 가중치 R 제거 시:</strong> AIME25 32.9% → 28.7%. 적응형 가중치가 성능 개선에 기여.</>},
              {n:"4", color:"teal", text:<><strong>교차 도메인 캘리브레이션:</strong> 코딩 데이터로 캘리브레이션 → 추론 벤치마크에서 동등한 성능. Q/K 통계는 도메인 무관 모델 내재 특성.</>},
              {n:"5", color:"purple", text:<><strong>오프셋 범위 확대:</strong> max 128→4096으로 확대 시 +7.1%p 향상. 기하 간격 vs 선형 간격: 45.8% vs 28.7%.</>},
            ].map(({n,text})=>(
              <div key={n} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-b-0">
                <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded-full text-gray-600 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">{n}</div>
                <p className="text-[13px] text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Throughput table */}
        <div className={css.card + " mt-5"}>
          <h3 className={css.h3}>처리량 & 효율 비교</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["비교 기준","방법","KV 예산","AIME25","처리량 (토큰/s)","비고"].map(h=>(
                    <th key={h} className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500 text-left px-3.5 py-2.5 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {group:"동일 정확도", name:"Full Attention", kv:"–", acc:"40.8%", tp:"222.8", note:"기준"},
                  {group:"", name:"TriAttention", kv:"3,072", acc:"40.8%", tp:"563.5 (2.5x↑)", note:"동일 정확도, 2.5x 빠름", best:true},
                  {group:"R-KV 비교", name:"R-KV", kv:"2,048", acc:"–", tp:"760.4", note:"MATH 500: 68.2%"},
                  {group:"", name:"TriAttention", kv:"1,024", acc:"–", tp:"1,405.2 (1.85x↑)", note:"MATH 500: 68.4% ↑", best:true},
                ].map((r,i)=>(
                  <tr key={i} className={r.best ? "bg-[rgba(5,150,105,0.04)]" : "hover:bg-black/[0.02]"}>
                    <td className="px-3.5 py-2.5 border-b border-[#eaecf0] text-gray-500">{r.group}</td>
                    <td className={`px-3.5 py-2.5 border-b border-[#eaecf0] font-semibold ${r.best?"text-[#059669]":""}`}>{r.name}</td>
                    <td className="px-3.5 py-2.5 border-b border-[#eaecf0] text-gray-600">{r.kv}</td>
                    <td className="px-3.5 py-2.5 border-b border-[#eaecf0] text-gray-600">{r.acc}</td>
                    <td className={`px-3.5 py-2.5 border-b border-[#eaecf0] ${r.best?"text-[#059669] font-bold":"text-gray-600"}`}>{r.tp}</td>
                    <td className="px-3.5 py-2.5 border-b border-[#eaecf0] text-gray-500">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ 5. 부록 핵심 ═══ */}
      <SectionDivider>Appendix Highlights</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>부록 | 추가 검증</div>
        <h2 id="appendix" className={css.h2}>부록 핵심 내용</h2>
        <div className="grid grid-cols-3 gap-3.5 my-5 max-[700px]:grid-cols-1">
          <InsightCard icon="🏗️" title="MLA 아키텍처 일반화" color="blue">
            GLM-4.7-Flash(MLA)에서도 Q/K 집중 현상이 GQA보다 강하게 나타남.
            MLA 헤드의 <strong>96.6%가 R {">"} 0.95</strong> (GQA: 84.7%).
          </InsightCard>
          <InsightCard icon="📊" title="다양한 벤치마크" color="green">
            LongBench 16개 하위과제 평균 <strong>48.1</strong> (Ada-KV+SnapKV: 45.6).
            RULER에서 <strong>66.1</strong> (+10.5 vs SnapKV).
          </InsightCard>
          <InsightCard icon="💻" title="실제 배포" color="teal">
            단일 RTX 4090(24GB)에서 Qwen3-32B + AWQ INT4 + TriAttention으로 멀티턴 에이전트 구동.
            Full Attention은 <strong>OOM 발생</strong>.
          </InsightCard>
        </div>
      </div>

      {/* ═══ 6. 결론 ═══ */}
      <SectionDivider>Conclusion</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>{"§ 6 | 결론 & 의의"}</div>
        <h2 id="conclusion" className={css.h2}>TriAttention이 제안하는 것</h2>

        <div className="bg-[#1a1e2a] text-[#f5f0e8] rounded-xl p-8 mb-5">
          <p className="text-[14.5px] leading-[1.82] text-[#d6cec4] mb-6">
            <strong className="text-[#fcd34d]">① 새로운 현상 발견:</strong> pre-RoPE 공간에서 Q/K 벡터가 위치·도메인·아키텍처에 무관하게
            고정 중심에 집중된다는 <em>Q/K Concentration</em>을 발견하고 정량화했습니다.
            <br/><br/>
            <strong className="text-[#86efac]">② 이론적 연결:</strong> 집중 현상이 어텐션 로짓을 삼각함수 급수(Q-K 거리만의 함수)로 만든다는
            수학적 연결을 확립했습니다. 이로써 어떤 거리의 키를 중요하게 봐야 하는지를 <em>관찰 없이 사전에</em> 예측할 수 있게 됩니다.
            <br/><br/>
            <strong className="text-[#93c5fd]">③ 실용적 압축 알고리즘:</strong> S_trig + S_norm의 두 구성요소와 집중도 기반 적응형 가중치로
            구성된 TriAttention은 post-RoPE 방법의 불안정성 없이 안정적으로 중요 키를 선별합니다.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {[
              {label:"Q/K Concentration", bg:"rgba(217,119,6,0.25)", color:"#fcd34d", border:"rgba(217,119,6,0.4)"},
              {label:"삼각함수 급수 근사", bg:"rgba(29,78,216,0.25)", color:"#93c5fd", border:"rgba(29,78,216,0.4)"},
              {label:"2.5x 처리량", bg:"rgba(21,128,61,0.25)", color:"#86efac", border:"rgba(21,128,61,0.4)"},
              {label:"10.7x 메모리 감소", bg:"rgba(15,118,110,0.25)", color:"#5eead4", border:"rgba(15,118,110,0.4)"},
              {label:"도메인 무관 일반화", bg:"rgba(217,119,6,0.25)", color:"#fcd34d", border:"rgba(217,119,6,0.4)"},
              {label:"소비자 GPU 배포 가능", bg:"rgba(29,78,216,0.25)", color:"#93c5fd", border:"rgba(29,78,216,0.4)"},
            ].map(({label,bg,color,border})=>(
              <span key={label} className="font-mono text-[11px] px-3 py-1 rounded-full font-medium"
                style={{background:bg, color, border:`1px solid ${border}`}}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 7. 용어 사전 ═══ */}
      <SectionDivider>Glossary</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>Reference</div>
        <h2 id="glossary" className={css.h2}>약어 & 용어</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {[
            {term:"KV 캐시", def:"Key-Value 캐시"},
            {term:"RoPE", def:"Rotary Position Embedding"},
            {term:"MRL", def:"Mean Resultant Length (집중도)"},
            {term:"GQA", def:"Grouped-Query Attention"},
            {term:"MLA", def:"Multi-head Latent Attention"},
            {term:"S_trig", def:"삼각함수 급수 점수"},
            {term:"S_norm", def:"노름 기반 점수"},
            {term:"Δ", def:"Q-K 위치 거리"},
            {term:"R_f", def:"주파수 대역 f의 집중도"},
            {term:"pre-RoPE", def:"RoPE 회전 적용 이전 벡터"},
            {term:"post-RoPE", def:"RoPE 회전 적용 이후 벡터"},
          ].map(({term,def})=>(
            <div key={term} className="bg-white border border-gray-200 rounded-md px-3 py-2">
              <strong className="font-mono text-[11px] text-gray-800">{term}</strong>
              <span className="text-[11px] text-gray-500 ml-1.5">{def}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-10 border-t border-gray-200">
        <a
          href="https://arxiv.org/abs/2604.04921"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-gray-500 hover:text-gray-800 hover:underline"
        >
          arXiv:2604.04921 · 원본 논문 보기 →
        </a>
        <div className="font-mono text-[10px] text-gray-500 mt-2">TriAttention: Efficient Long Reasoning with Trigonometric KV Compression</div>
        <div className="font-mono text-[10px] text-gray-500 mt-1">Mao · Lin · Huang · Xie · Fu · Zhuang · Han · Chen · MIT / NVIDIA / ZJU · 2026</div>
      </div>
    </div>
  );
};

export default TriAttentionPost;
