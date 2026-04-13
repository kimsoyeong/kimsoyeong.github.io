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
  vecCell: "w-[38px] h-[38px] rounded-[5px] flex items-center justify-center font-mono text-[10px] font-medium shrink-0",
  vecLabel: "font-mono text-[11px] text-gray-500 mr-1.5 min-w-[36px]",
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
    <div className="text-center">
      {children}
    </div>
    {comment && <div className="font-mono text-[12px] text-gray-500 mt-2 text-center">{comment}</div>}
  </div>
);

const TurboQuantPost = () => {
  return (
    <div className="font-dm-sans text-[#1a1e2a] text-[15px] leading-relaxed">

      {/* ═══ 0. 전체 파이프라인 ═══ */}
      <div className={css.section}>
        <div className={css.secLabel}>Overview</div>
        <h2 id="overview" className={css.h2}>전체 동작 파이프라인</h2>
        <p className={css.p}>
          TurboQuant는 두 개의 독립된 양자화기를 조합합니다. MSE 최적화기(<code className={css.code}>Qmse</code>)는 재구성 오차를 최소화하고,
          내적 최적화기(<code className={css.code}>Qprod</code>)는 MSE 양자화 후 잔차에 QJL 변환을 추가하여 내적 추정의 편향을 제거합니다.
        </p>

        {/* 파이프라인 레전드 */}
        <div className="flex gap-5 mb-3.5 flex-wrap font-mono text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-[rgba(37,99,235,0.12)] border-[1.5px] border-[#2563eb] rounded-sm" />
            Qmse (MSE 최적화)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-[rgba(180,83,9,0.09)] border-[1.5px] border-[#b45309] rounded-sm" />
            Qprod 추가 단계 (내적 최적화)
          </span>
        </div>

        {/* Pipeline SVG */}
        <svg viewBox="0 0 820 130" width="100%" className="block overflow-visible mb-1">
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0.5 L5,3 L0,5.5" fill="none" stroke="#9ca3af" strokeWidth="1.2"/>
            </marker>
          </defs>
          {/* INPUT */}
          <rect x="0" y="24" width="90" height="72" rx="7" fill="#ffffff" stroke="#dde1ea" strokeWidth="1.5"/>
          <text x="45" y="52" fontSize="10" fill="#9ca3af" fontFamily="DM Mono" textAnchor="middle" letterSpacing=".08em">INPUT</text>
          <text x="45" y="70" fontSize="15" fill="#1a1e2a" fontFamily="DM Mono" textAnchor="middle" fontWeight="700">x</text>
          <text x="45" y="86" fontSize="9" fill="#6b7280" fontFamily="DM Mono" textAnchor="middle">d차원 벡터</text>
          <line x1="92" y1="60" x2="118" y2="60" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arr)"/>
          {/* Step 1 */}
          <rect x="120" y="24" width="120" height="72" rx="7" fill="rgba(37,99,235,.07)" stroke="#2563eb" strokeWidth="1.5"/>
          <text x="180" y="42" fontSize="9" fill="#2563eb" fontFamily="DM Mono" textAnchor="middle" letterSpacing=".1em">STEP 1</text>
          <text x="180" y="60" fontSize="11" fill="#1a1e2a" fontFamily="DM Mono" textAnchor="middle" fontWeight="700">랜덤 회전</text>
          <text x="180" y="75" fontSize="10" fill="#374151" fontFamily="DM Mono" textAnchor="middle">Π · x</text>
          <text x="180" y="88" fontSize="8.5" fill="#6b7280" fontFamily="DM Mono" textAnchor="middle">Beta 분포 유도</text>
          <line x1="242" y1="60" x2="268" y2="60" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arr)"/>
          {/* Step 2 */}
          <rect x="270" y="24" width="130" height="72" rx="7" fill="rgba(37,99,235,.07)" stroke="#2563eb" strokeWidth="1.5"/>
          <text x="335" y="42" fontSize="9" fill="#2563eb" fontFamily="DM Mono" textAnchor="middle" letterSpacing=".1em">STEP 2</text>
          <text x="335" y="60" fontSize="11" fill="#1a1e2a" fontFamily="DM Mono" textAnchor="middle" fontWeight="700">스칼라 양자화</text>
          <text x="335" y="75" fontSize="9.5" fill="#374151" fontFamily="DM Mono" textAnchor="middle">Lloyd-Max 코드북</text>
          <text x="335" y="88" fontSize="8.5" fill="#6b7280" fontFamily="DM Mono" textAnchor="middle">→ idx 저장</text>
          {/* Qmse bracket */}
          <line x1="120" y1="108" x2="400" y2="108" stroke="#2563eb" strokeWidth="1" opacity=".4"/>
          <line x1="120" y1="104" x2="120" y2="108" stroke="#2563eb" strokeWidth="1" opacity=".4"/>
          <line x1="400" y1="104" x2="400" y2="108" stroke="#2563eb" strokeWidth="1" opacity=".4"/>
          <text x="260" y="120" fontSize="8.5" fill="#2563eb" fontFamily="DM Mono" textAnchor="middle" opacity=".9">Qmse — MSE 최적화 구간</text>
          <line x1="402" y1="60" x2="428" y2="60" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arr)"/>
          {/* Step 3 */}
          <rect x="430" y="24" width="120" height="72" rx="7" fill="rgba(180,83,9,.07)" stroke="#b45309" strokeWidth="1.5"/>
          <text x="490" y="42" fontSize="9" fill="#b45309" fontFamily="DM Mono" textAnchor="middle" letterSpacing=".1em">STEP 3</text>
          <text x="490" y="60" fontSize="11" fill="#1a1e2a" fontFamily="DM Mono" textAnchor="middle" fontWeight="700">잔차 추출</text>
          <text x="490" y="75" fontSize="10" fill="#374151" fontFamily="DM Mono" textAnchor="middle">r = x − x̃mse</text>
          <text x="490" y="88" fontSize="8.5" fill="#6b7280" fontFamily="DM Mono" textAnchor="middle">‖r‖ 최소화 후</text>
          <line x1="552" y1="60" x2="578" y2="60" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arr)"/>
          {/* Step 4 */}
          <rect x="580" y="24" width="120" height="72" rx="7" fill="rgba(180,83,9,.07)" stroke="#b45309" strokeWidth="1.5"/>
          <text x="640" y="42" fontSize="9" fill="#b45309" fontFamily="DM Mono" textAnchor="middle" letterSpacing=".1em">STEP 4</text>
          <text x="640" y="60" fontSize="11" fill="#1a1e2a" fontFamily="DM Mono" textAnchor="middle" fontWeight="700">QJL 변환</text>
          <text x="640" y="75" fontSize="10" fill="#374151" fontFamily="DM Mono" textAnchor="middle">sign(S · r)</text>
          <text x="640" y="88" fontSize="8.5" fill="#6b7280" fontFamily="DM Mono" textAnchor="middle">편향 제거 (1-bit)</text>
          {/* Qprod bracket */}
          <line x1="430" y1="108" x2="700" y2="108" stroke="#b45309" strokeWidth="1" opacity=".4"/>
          <line x1="430" y1="104" x2="430" y2="108" stroke="#b45309" strokeWidth="1" opacity=".4"/>
          <line x1="700" y1="104" x2="700" y2="108" stroke="#b45309" strokeWidth="1" opacity=".4"/>
          <text x="565" y="120" fontSize="8.5" fill="#b45309" fontFamily="DM Mono" textAnchor="middle" opacity=".9">Qprod 추가 — 내적 편향 제거</text>
          <line x1="702" y1="60" x2="726" y2="60" stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arr)"/>
          {/* OUTPUT */}
          <rect x="728" y="24" width="88" height="72" rx="7" fill="#ffffff" stroke="#dde1ea" strokeWidth="1.5"/>
          <text x="772" y="42" fontSize="9" fill="#9ca3af" fontFamily="DM Mono" textAnchor="middle" letterSpacing=".08em">OUTPUT</text>
          <text x="772" y="58" fontSize="9.5" fill="#1a1e2a" fontFamily="DM Mono" textAnchor="middle" fontWeight="700">idx</text>
          <text x="772" y="72" fontSize="9.5" fill="#1a1e2a" fontFamily="DM Mono" textAnchor="middle" fontWeight="700">qjl</text>
          <text x="772" y="86" fontSize="9.5" fill="#1a1e2a" fontFamily="DM Mono" textAnchor="middle" fontWeight="700">‖r‖</text>
        </svg>

        <FormulaBlock comment="MSE 양자화기 & 내적 양자화기">
          <Formula tex={String.raw`Q_{\text{mse}}(x) = \arg\min_k \left| \Pi x_j - c_k \right| \quad \text{(각 좌표별 독립)}`} block />
          <div className="my-3" />
          <Formula tex={String.raw`Q_{\text{prod}}(x) = \bigl( Q_{\text{mse}}(x),\; \text{sign}(S \cdot r),\; \|r\|_2 \bigr) \quad \text{where } r = x - Q_{\text{mse}}^{-1}(Q_{\text{mse}}(x))`} block />
        </FormulaBlock>
      </div>

      {/* ═══ 1. 랜덤 회전 & Beta 분포 ═══ */}
      <SectionDivider>Step 1 — 랜덤 회전</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>Core Mechanism · MSE Optimizer</div>
        <h2 id="random-rotation" className={css.h2}>랜덤 회전과 Beta 분포</h2>
        <p className={css.p}>
          임의의 입력 벡터 <code className={css.code}>x</code>를 랜덤 회전 행렬 <code className={css.code}>Π</code>로 곱하면,
          결과 벡터의 각 좌표는 단위 초구(hypersphere) 위에서 균등 분포를 따릅니다.
          이 좌표 하나의 분포가 바로 Beta 분포이며, 고차원으로 갈수록 정규분포 <Formula tex={String.raw`\mathcal{N}(0, 1/d)`} />로 수렴합니다.
        </p>

        <FormulaBlock comment="고차원 극한: N(0, 1/d)">
          <Formula tex={String.raw`f_X(x) = \frac{\Gamma(d/2)}{\sqrt{\pi}\,\Gamma\!\left(\frac{d-1}{2}\right)} \cdot (1-x^2)^{\frac{d-3}{2}}, \quad x \in [-1,\,1]`} block />
        </FormulaBlock>

        {/* Distribution comparison */}
        <div className="grid grid-cols-2 gap-4 my-5 max-[600px]:grid-cols-1">
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <h4 className="font-mono text-[11px] text-gray-500 uppercase tracking-[0.1em] mb-3">회전 전 — 임의 분포</h4>
            <svg viewBox="0 0 200 100" width="100%" className="rounded">
              <rect width="200" height="100" fill="#f0f2f7"/>
              <line x1="10" y1="90" x2="190" y2="90" stroke="#c8cdd8" strokeWidth="1"/>
              <rect x="14" y="30" width="14" height="60" fill="#2563eb" opacity=".35"/>
              <rect x="30" y="20" width="14" height="70" fill="#2563eb" opacity=".35"/>
              <rect x="46" y="40" width="14" height="50" fill="#2563eb" opacity=".35"/>
              <rect x="62" y="55" width="14" height="35" fill="#2563eb" opacity=".35"/>
              <rect x="78" y="65" width="14" height="25" fill="#2563eb" opacity=".35"/>
              <rect x="94" y="70" width="14" height="20" fill="#2563eb" opacity=".35"/>
              <rect x="110" y="60" width="14" height="30" fill="#2563eb" opacity=".35"/>
              <rect x="126" y="75" width="14" height="15" fill="#2563eb" opacity=".35"/>
              <rect x="142" y="50" width="14" height="40" fill="#2563eb" opacity=".35"/>
              <rect x="158" y="35" width="14" height="55" fill="#2563eb" opacity=".35"/>
              <text x="100" y="8" fill="#6b7280" fontSize="8" textAnchor="middle" fontFamily="DM Mono">비균일, 예측 불가</text>
            </svg>
            <p className="text-[12px] text-gray-500 mt-2 mb-0">각 좌표가 어떤 분포를 따를지 알 수 없으므로 최적 스칼라 양자화기 설계 불가</p>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <h4 className="font-mono text-[11px] text-gray-500 uppercase tracking-[0.1em] mb-3">회전 후 — Beta 분포 (→ Gaussian)</h4>
            <svg viewBox="0 0 200 100" width="100%" className="rounded">
              <rect width="200" height="100" fill="#f0f2f7"/>
              <line x1="10" y1="90" x2="190" y2="90" stroke="#c8cdd8" strokeWidth="1"/>
              <rect x="14" y="85" width="14" height="5" fill="#059669" opacity=".6"/>
              <rect x="30" y="75" width="14" height="15" fill="#059669" opacity=".6"/>
              <rect x="46" y="58" width="14" height="32" fill="#059669" opacity=".6"/>
              <rect x="62" y="35" width="14" height="55" fill="#059669" opacity=".6"/>
              <rect x="78" y="18" width="14" height="72" fill="#059669" opacity=".8"/>
              <rect x="94" y="10" width="14" height="80" fill="#059669" opacity=".9"/>
              <rect x="110" y="18" width="14" height="72" fill="#059669" opacity=".8"/>
              <rect x="126" y="35" width="14" height="55" fill="#059669" opacity=".6"/>
              <rect x="142" y="58" width="14" height="32" fill="#059669" opacity=".6"/>
              <rect x="158" y="75" width="14" height="15" fill="#059669" opacity=".6"/>
              <path d="M10,90 C30,90 40,88 60,70 C80,52 90,12 100,10 C110,12 120,52 140,70 C160,88 170,90 190,90" fill="none" stroke="#059669" strokeWidth="1.5" opacity=".5"/>
              <text x="100" y="8" fill="#059669" fontSize="8" textAnchor="middle" fontFamily="DM Mono">Beta ≈ N(0, 1/d)</text>
            </svg>
            <p className="text-[12px] text-gray-500 mt-2 mb-0">모든 좌표가 동일한 Beta(→Gaussian) 분포를 가짐 → 좌표별 독립 최적 양자화 가능</p>
          </div>
        </div>

        <div className={css.callout}>
          <strong>핵심 인사이트:</strong> 고차원에서 서로 다른 좌표들은 <em>거의 독립적</em>이 됩니다 (near-independence). 이 덕분에 좌표 간 상호작용을 무시하고 각 좌표를 독립적으로 최적 스칼라 양자화 할 수 있으며, 결과적으로 전체 벡터 양자화의 최적성이 달성됩니다.
        </div>

        {/* Vector rotation example */}
        <div className={css.cardAccent + " mt-5"}>
          <h3 className={css.h3}>회전 변환 예시 (d=6)</h3>
          <div className="flex gap-1 my-2 items-center flex-wrap">
            <span className={css.vecLabel}>원본 x</span>
            {["0.82","−0.34","1.21","0.11","−0.67","0.94"].map((v,i)=>(
              <div key={i} className={css.vecCell} style={{background:"rgba(37,99,235,.10)",border:"1px solid #2563eb",color:"#2563eb"}}>{v}</div>
            ))}
          </div>
          <div className="text-center text-gray-500 text-xl my-1">↓ <span className="text-[12px] font-mono">Π·x (랜덤 직교 행렬)</span></div>
          <div className="flex gap-1 my-2 items-center flex-wrap">
            <span className={css.vecLabel + " text-[#059669]"}>Π·x</span>
            {["0.21","−0.18","0.34","−0.09","0.27","−0.23"].map((v,i)=>(
              <div key={i} className={css.vecCell} style={{background:"rgba(5,150,105,.10)",border:"1px solid #059669",color:"#059669"}}>{v}</div>
            ))}
          </div>
          <p className="text-[12px] text-gray-500 mt-2.5 mb-0">
            회전 후 각 좌표의 절대값이 균일하게 분포하며, 서로 거의 독립적입니다. <Formula tex={String.raw`\|x\| = \|\Pi x\|`} /> (길이 보존)
          </p>
        </div>
      </div>

      {/* ═══ 2. Lloyd-Max 스칼라 양자화 ═══ */}
      <SectionDivider>Step 2 — Lloyd-Max Quantization</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>Core Mechanism · Codebook Design</div>
        <h2 id="lloyd-max" className={css.h2}>Lloyd-Max 최적 스칼라 양자화</h2>
        <p className={css.p}>
          회전된 좌표 분포(Beta/Gaussian)에 대해 1차원 k-means 문제를 풀어 최적 코드북을 생성합니다. 이를 Lloyd-Max 알고리즘이라 합니다.
        </p>

        <FormulaBlock comment="각 구간의 중심값(centroid)이 최소 MSE를 달성하는 위치에 놓임">
          <Formula tex={String.raw`C(f_X, b) = \min_{c_1 \leq \cdots \leq c_{2^b}} \sum_i \int_{\text{Voronoi cell } i} |x - c_i|^2 \cdot f_X(x)\,dx`} block />
        </FormulaBlock>

        {/* Lloyd-Max convergence visual */}
        <div className={css.cardAccent}>
          <h3 className={css.h3}>Lloyd-Max 수렴 과정 (b=2비트, 4 코드워드)</h3>
          <p className="text-[12px] mb-3.5">Gaussian <Formula tex={String.raw`\mathcal{N}(0,1/d)`} /> 분포에서 4개의 최적 centroids를 찾는 반복 과정</p>

          {/* Legend */}
          <div className="flex gap-5 mb-3.5 flex-wrap font-mono text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#059669" strokeWidth="2"/></svg>확률 분포 곡선 (Gaussian)</span>
            <span className="flex items-center gap-1"><svg width="16" height="10"><line x1="8" y1="0" x2="8" y2="10" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3,2"/></svg>centroid</span>
            <span className="flex items-center gap-1"><svg width="16" height="10"><line x1="8" y1="0" x2="8" y2="10" stroke="#9ca3af" strokeWidth="1" strokeDasharray="4,2"/></svg>Voronoi 경계</span>
          </div>

          {/* ① INIT */}
          <div className="mb-7">
            <div className="font-mono text-[10px] text-gray-500 mb-2 tracking-[0.06em]">① 초기화 — centroid를 균일 간격으로 배치 → Voronoi 구간의 확률 질량이 불균등</div>
            <svg viewBox="0 0 400 120" width="100%" className="block" style={{background:"#ffffff",borderRadius:"6px"}}>
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0"/>
                  <stop offset="50%" stopColor="#059669" stopOpacity=".08"/>
                  <stop offset="100%" stopColor="#059669" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Voronoi 구간 배경 — 중립 gray */}
              <rect x="10" y="6" width="152" height="64" fill="#f9fafb" rx="4"/>
              <rect x="162" y="6" width="38" height="64" fill="#f3f4f6" rx="4"/>
              <rect x="200" y="6" width="38" height="64" fill="#f3f4f6" rx="4"/>
              <rect x="238" y="6" width="152" height="64" fill="#f9fafb" rx="4"/>
              {/* 확률 질량 라벨 */}
              <text x="86" y="60" fontSize="9" fill="#9ca3af" fontFamily="DM Mono" textAnchor="middle" fontWeight="500">~16%</text>
              <text x="181" y="34" fontSize="9" fill="#6b7280" fontFamily="DM Mono" textAnchor="middle" fontWeight="600">~34%</text>
              <text x="219" y="34" fontSize="9" fill="#6b7280" fontFamily="DM Mono" textAnchor="middle" fontWeight="600">~34%</text>
              <text x="314" y="60" fontSize="9" fill="#9ca3af" fontFamily="DM Mono" textAnchor="middle" fontWeight="500">~16%</text>
              {/* Gaussian curve — GREEN */}
              <path d="M10,70 C40,70 70,66 100,54 C130,42 150,14 200,12 C250,14 270,42 300,54 C330,66 360,70 390,70" fill="url(#gA)"/>
              <path d="M10,70 C40,70 70,66 100,54 C130,42 150,14 200,12 C250,14 270,42 300,54 C330,66 360,70 390,70" fill="none" stroke="#059669" strokeWidth="2"/>
              {/* Voronoi 경계 */}
              <line x1="162" y1="6" x2="162" y2="70" stroke="#9ca3af" strokeWidth="1" strokeDasharray="4,3"/>
              <line x1="200" y1="6" x2="200" y2="70" stroke="#9ca3af" strokeWidth="1" strokeDasharray="4,3"/>
              <line x1="238" y1="6" x2="238" y2="70" stroke="#9ca3af" strokeWidth="1" strokeDasharray="4,3"/>
              {/* Centroid 선 — ORANGE */}
              <line x1="143" y1="8" x2="143" y2="70" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3,3"/>
              <line x1="181" y1="8" x2="181" y2="70" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3,3"/>
              <line x1="219" y1="8" x2="219" y2="70" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3,3"/>
              <line x1="257" y1="8" x2="257" y2="70" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3,3"/>
              {/* 축 */}
              <line x1="10" y1="70" x2="390" y2="70" stroke="#dde1ea" strokeWidth="1"/>
              {/* Centroid 라벨 */}
              {[["143","−0.75"],["181","−0.25"],["219","+0.25"],["257","+0.75"]].map(([x,v],i)=>(
                <g key={i}>
                  <text x={x} y="82" fontSize="8" fill="#b45309" fontFamily="DM Mono" textAnchor="middle" fontWeight="500">{v}</text>
                  <text x={x} y="93" fontSize="7.5" fill="#9ca3af" fontFamily="DM Mono" textAnchor="middle">c{String.fromCharCode(8321+i)}</text>
                </g>
              ))}
              {/* 구간 넓음 표시 */}
              <text x="86" y="16" fontSize="7.5" fill="#9ca3af" fontFamily="DM Mono" textAnchor="middle">← 구간 넓음 →</text>
              <text x="314" y="16" fontSize="7.5" fill="#9ca3af" fontFamily="DM Mono" textAnchor="middle">← 구간 넓음 →</text>
            </svg>
            <p className="text-[12px] text-gray-500 mt-1.5">균일 배치 시 외곽 구간(c₁, c₄ 담당)이 넓어 그 안의 많은 값을 거칠게 표현 → MSE ↑</p>
          </div>

          {/* ② CONVERGED */}
          <div>
            <div className="font-mono text-[10px] text-[#059669] mb-2 tracking-[0.06em]">② 수렴 후 — Voronoi 경계가 자동 이동해 각 구간이 확률 질량 25%씩 균등 담당 → MSE 최소</div>
            <svg viewBox="0 0 400 120" width="100%" className="block" style={{background:"#ffffff",borderRadius:"6px"}}>
              <defs>
                <linearGradient id="gB" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0"/>
                  <stop offset="50%" stopColor="#059669" stopOpacity=".10"/>
                  <stop offset="100%" stopColor="#059669" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Voronoi 구간 배경 — 균등, 연한 green 틴트 */}
              <rect x="10" y="6" width="115" height="64" fill="rgba(5,150,105,0.04)" rx="4"/>
              <rect x="125" y="6" width="75" height="64" fill="rgba(5,150,105,0.07)" rx="4"/>
              <rect x="200" y="6" width="75" height="64" fill="rgba(5,150,105,0.07)" rx="4"/>
              <rect x="275" y="6" width="115" height="64" fill="rgba(5,150,105,0.04)" rx="4"/>
              {/* 확률 질량 라벨 */}
              {[["67","56"],["162","34"],["238","34"],["333","56"]].map(([x,y],i)=>(
                <text key={i} x={x} y={y} fontSize="9" fill="#059669" fontFamily="DM Mono" textAnchor="middle" fontWeight="600">25%</text>
              ))}
              {/* Gaussian curve — GREEN */}
              <path d="M10,70 C40,70 70,66 100,54 C130,42 150,14 200,12 C250,14 270,42 300,54 C330,66 360,70 390,70" fill="url(#gB)"/>
              <path d="M10,70 C40,70 70,66 100,54 C130,42 150,14 200,12 C250,14 270,42 300,54 C330,66 360,70 390,70" fill="none" stroke="#059669" strokeWidth="2"/>
              {/* Voronoi 경계 */}
              {["125","200","275"].map((x,i)=>(
                <line key={i} x1={x} y1="6" x2={x} y2="70" stroke="#9ca3af" strokeWidth="1" strokeDasharray="4,3"/>
              ))}
              {/* Centroid 선 — GREEN 실선 */}
              {["85","166","234","315"].map((x,i)=>(
                <line key={i} x1={x} y1="8" x2={x} y2="70" stroke="#059669" strokeWidth="1.5"/>
              ))}
              {/* 축 */}
              <line x1="10" y1="70" x2="390" y2="70" stroke="#dde1ea" strokeWidth="1"/>
              {/* Centroid 라벨 */}
              {[["85","−1.51/√d"],["166","−0.45/√d"],["234","+0.45/√d"],["315","+1.51/√d"]].map(([x,v],i)=>(
                <g key={i}>
                  <text x={x} y="82" fontSize="8" fill="#059669" fontFamily="DM Mono" textAnchor="middle" fontWeight="500">{v}</text>
                  <text x={x} y="93" fontSize="7.5" fill="#9ca3af" fontFamily="DM Mono" textAnchor="middle">c{String.fromCharCode(8321+i)}</text>
                </g>
              ))}
              {/* 촘촘함 표시 */}
              <text x="200" y="16" fontSize="7.5" fill="#059669" fontFamily="DM Mono" textAnchor="middle">← c₂·c₃ 촘촘 (고밀도 영역) →</text>
            </svg>
            <p className="text-[12px] text-gray-500 mt-1.5">수렴 후 각 구간이 정확히 25%의 확률 질량을 담당합니다. centroid는 각 구간의 <strong className="text-[#374151]">무게중심</strong>에 위치합니다.</p>
          </div>
        </div>

        {/* Bit-width distortion */}
        <div className={css.card + " mt-5"}>
          <h3 className={css.h3}>비트폭별 MSE 왜곡 (이론값 vs 실측)</h3>
          <div className="flex flex-col gap-2.5 mt-2">
            {[
              {b:"b=1", w:"72%", val:"0.36", lb:"LB: 0.25"},
              {b:"b=2", w:"47%", val:"0.117", lb:"LB: 0.0625"},
              {b:"b=3", w:"24%", val:"0.030", lb:"LB: 0.0156"},
              {b:"b=4", w:"10%", val:"0.009", lb:"LB: 0.0039"},
            ].map(({b,w,val,lb})=>(
              <div key={b} className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-gray-500 min-w-[28px]">{b}</span>
                <div className="flex-1 h-[14px] bg-gray-100 rounded-sm overflow-hidden">
                  <div className="h-full bg-[#2563eb] opacity-80 rounded-sm" style={{width:w}} />
                </div>
                <span className="font-mono text-[10px] text-gray-500 min-w-[52px]">{val}</span>
                <span className="font-mono text-[10px] text-gray-500 min-w-[80px]">{lb}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-gray-500 mt-2.5">TurboQuant의 MSE는 이론적 하한선의 최대 <strong className="text-[#b45309]"><Formula tex={String.raw`\sqrt{3\pi}/2 \approx 2.7`} />배</strong> 이내.</p>
        </div>
      </div>

      {/* ═══ 3. QJL 편향 제거 ═══ */}
      <SectionDivider>Steps 3–4 — QJL 내적 편향 제거</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>Core Mechanism · Inner Product Optimizer</div>
        <h2 id="qjl" className={css.h2}>QJL — 잔차 기반 내적 편향 제거</h2>
        <p className={css.p}>
          MSE 최적화기는 평균 제곱 오차를 줄이지만, 내적 추정에 편향(bias)을 만듭니다. 특히 b=1일 때{" "}
          <Formula tex={String.raw`\mathbb{E}[\langle y, Q^{-1}(Q(x))\rangle] = \frac{2}{\pi}\langle y, x\rangle`} />,
          즉 실제 내적의 <Formula tex={String.raw`2/\pi \approx 0.637`} />배만 복원됩니다. QJL이 이를 해결합니다.
        </p>

        {/* Bias visualization */}
        <div className="grid grid-cols-2 gap-4 my-5 max-[600px]:grid-cols-1">
          <div className="bg-white border border-gray-200 rounded-[10px] p-5">
            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.1em] mb-3">Qmse 단독 — 편향 있음 (b=1)</div>
            <svg viewBox="0 0 200 100" width="100%">
              <rect width="200" height="100" fill="#f8f9fc" rx="6"/>
              {/* Grid lines */}
              <line x1="100" y1="8" x2="100" y2="88" stroke="#e8eaf0" strokeWidth="1"/>
              <line x1="15" y1="50" x2="185" y2="50" stroke="#e8eaf0" strokeWidth="1"/>
              {/* Bars — shifted right (biased) */}
              <rect x="78" y="32" width="12" height="18" rx="2" fill="#2563eb" opacity=".25"/>
              <rect x="92" y="22" width="12" height="28" rx="2" fill="#2563eb" opacity=".35"/>
              <rect x="106" y="15" width="12" height="35" rx="2" fill="#2563eb" opacity=".50"/>
              <rect x="120" y="24" width="12" height="26" rx="2" fill="#2563eb" opacity=".35"/>
              <rect x="134" y="36" width="12" height="14" rx="2" fill="#2563eb" opacity=".20"/>
              {/* Mean line (shifted) */}
              <line x1="114" y1="8" x2="114" y2="80" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,3"/>
              <text x="118" y="14" fill="#2563eb" fontSize="8" fontFamily="DM Mono" fontWeight="500">E[err]≠0</text>
              {/* Zero reference */}
              <line x1="100" y1="82" x2="100" y2="88" stroke="#9ca3af" strokeWidth="1.5"/>
              <text x="100" y="96" fill="#9ca3af" fontSize="7" fontFamily="DM Mono" textAnchor="middle">0</text>
              <text x="100" y="88" fill="#6b7280" fontSize="7" fontFamily="DM Mono" textAnchor="middle" dy="8"/>
            </svg>
            <div className="font-mono text-[10px] text-[#9ca3af] mt-2 text-center">내적 오차 분포 — 평균이 0에서 벗어남</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-[10px] p-5">
            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.1em] mb-3">Qprod — 편향 없음</div>
            <svg viewBox="0 0 200 100" width="100%">
              <rect width="200" height="100" fill="#f8f9fc" rx="6"/>
              {/* Grid lines */}
              <line x1="100" y1="8" x2="100" y2="88" stroke="#e8eaf0" strokeWidth="1"/>
              <line x1="15" y1="50" x2="185" y2="50" stroke="#e8eaf0" strokeWidth="1"/>
              {/* Bars — symmetric centered */}
              <rect x="50" y="40" width="12" height="10" rx="2" fill="#2563eb" opacity=".15"/>
              <rect x="64" y="32" width="12" height="18" rx="2" fill="#2563eb" opacity=".25"/>
              <rect x="78" y="22" width="12" height="28" rx="2" fill="#2563eb" opacity=".35"/>
              <rect x="92" y="15" width="12" height="35" rx="2" fill="#2563eb" opacity=".50"/>
              <rect x="106" y="22" width="12" height="28" rx="2" fill="#2563eb" opacity=".35"/>
              <rect x="120" y="32" width="12" height="18" rx="2" fill="#2563eb" opacity=".25"/>
              <rect x="134" y="40" width="12" height="10" rx="2" fill="#2563eb" opacity=".15"/>
              {/* Mean line (centered) */}
              <line x1="100" y1="8" x2="100" y2="80" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,3"/>
              <text x="104" y="14" fill="#2563eb" fontSize="8" fontFamily="DM Mono" fontWeight="500">E[err]=0</text>
              {/* Zero reference */}
              <line x1="100" y1="82" x2="100" y2="88" stroke="#2563eb" strokeWidth="1.5"/>
              <text x="100" y="96" fill="#2563eb" fontSize="7" fontFamily="DM Mono" textAnchor="middle">0</text>
            </svg>
            <div className="font-mono text-[10px] text-[#9ca3af] mt-2 text-center">내적 오차 분포 — 평균이 정확히 0</div>
          </div>
        </div>

        <div className={css.calloutGold}>
          <strong>왜 MSE 최적 ≠ 내적 최적인가?</strong><br/>
          MSE 양자화는 <Formula tex={String.raw`\|x - \tilde{x}\|^2`} />를 최소화하도록 centroids를 배치하지만, 이 과정에서 방향성 정보(내적)가 체계적으로 왜곡됩니다.
          특히 1비트에서 MSE optimal centroid가 <Formula tex={String.raw`\pm\sqrt{2/(\pi d)}`} />이므로, 복원 시 <Formula tex={String.raw`2/\pi \approx 0.637`} />의 스케일 편향이 발생합니다.
        </div>

        {/* QJL step-by-step */}
        <div className={css.cardGold + " mt-5"}>
          <h3 className={css.h3}>QJL 변환 — 단계별 계산 과정</h3>

          {/* Step 1: Residual */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 bg-[rgba(180,83,9,0.08)] border border-[#b45309] rounded-md text-[#b45309] font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</div>
              <div>
                <div className="font-semibold text-[14px] mb-1">잔차 벡터 계산</div>
                <FormulaBlock comment="MSE 양자화 후 남은 오차">
                  <Formula tex={String.raw`r = x - Q_{\text{mse}}^{-1}(Q_{\text{mse}}(x))`} block />
                </FormulaBlock>
              </div>
            </div>
          </div>

          {/* Step 2: QJL */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 bg-[rgba(180,83,9,0.08)] border border-[#b45309] rounded-md text-[#b45309] font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</div>
              <div className="w-full">
                <div className="font-semibold text-[14px] mb-1">랜덤 가우시안 행렬 S 적용 → 1비트 양자화</div>
                <FormulaBlock comment="각 원소를 +1 또는 −1로 압축 — 1비트 표현">
                  <Formula tex={String.raw`\text{qjl} = \text{sign}(S \cdot r), \quad S \in \mathbb{R}^{d \times d},\; S_{ij} \sim \mathcal{N}(0,1)`} block />
                </FormulaBlock>

                {/* Matrix multiplication visual */}
                <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                  <div>
                    <div className="font-mono text-[9px] text-gray-500 mb-1">S (4×4, Gaussian)</div>
                    <table className="border-separate" style={{borderSpacing:"3px"}}>
                      <tbody>
                        {[
                          [" 0.72","−1.14"," 0.33","−0.87"],
                          ["−0.55"," 1.21","−0.42"," 0.61"],
                          [" 0.98","−0.27"," 1.05","−0.19"],
                          ["−0.34"," 0.81","−0.62"," 1.34"],
                        ].map((row,i)=>(
                          <tr key={i}>
                            {row.map((v,j)=>{
                              const isPos = !v.trim().startsWith("−");
                              return <td key={j} className="w-[42px] h-[32px] text-center rounded font-mono text-[11px]"
                                style={{background: isPos ? "rgba(180,83,9,.11)" : "rgba(5,150,105,.07)", color: isPos ? "#b45309" : "#059669"}}>{v}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-xl text-gray-500">·</div>
                  <div>
                    <div className="font-mono text-[9px] text-[#059669] mb-1">r (잔차)</div>
                    <div className="flex flex-col gap-[3px]">
                      {["0.020","0.012","0.038","0.009"].map((v,i)=>(
                        <div key={i} className="w-[48px] h-[32px] rounded flex items-center justify-center font-mono text-[9px]"
                          style={{background:"rgba(5,150,105,.09)",border:"1px solid #059669",color:"#059669"}}>{v}</div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xl text-gray-500">=</div>
                  <div>
                    <div className="font-mono text-[9px] text-gray-500 mb-1">sign(S·r)</div>
                    <div className="flex flex-col gap-[3px]">
                      {["+1","−1","+1","+1"].map((v,i)=>(
                        <div key={i} className="w-[48px] h-[32px] rounded flex items-center justify-center font-mono text-[11px] font-bold"
                          style={{
                            background: v==="+1" ? "rgba(5,150,105,.14)" : "rgba(37,99,235,.12)",
                            border: v==="+1" ? "1px solid #059669" : "1px solid #2563eb",
                            color: v==="+1" ? "#059669" : "#2563eb",
                          }}>{v}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Reconstruction */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 bg-[rgba(180,83,9,0.08)] border border-[#b45309] rounded-md text-[#b45309] font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</div>
            <div>
              <div className="font-semibold text-[14px] mb-1">역변환 — 내적 복원</div>
              <FormulaBlock>
                <Formula tex={String.raw`\tilde{x}_{\text{qjl}} = \sqrt{\frac{\pi}{2}} \cdot \frac{\|r\|_2}{d} \cdot S^\top \cdot \text{qjl}`} block />
              </FormulaBlock>
              <FormulaBlock comment="두 항의 합 = ⟨y, x⟩ (기댓값 기준 완전 복원)">
                <Formula tex={String.raw`\langle y, \tilde{x} \rangle = \langle y, \tilde{x}_{\text{mse}} \rangle + \langle y, \tilde{x}_{\text{qjl}} \rangle`} block />
              </FormulaBlock>
            </div>
          </div>
        </div>

        {/* Variance bound */}
        <div className={css.cardGreen + " mt-4"}>
          <h3 className={css.h3}>내적 오차 분산 상한 (Theorem 2)</h3>
          <FormulaBlock comment="내적 오차가 비트폭 b마다 4배씩 감소 (지수적 개선)">
            <Formula tex={String.raw`\text{Var}[\langle y, \tilde{x}_{\text{qjl}}\rangle] \leq \frac{\pi}{2d}\|y\|^2`} block />
            <div className="my-2" />
            <Formula tex={String.raw`D_{\text{prod}} = \mathbb{E}\!\left[|\langle y,x\rangle - \langle y,\tilde{x}\rangle|^2\right] \leq \frac{\sqrt{3\pi}}{2} \cdot \frac{\|y\|^2}{d} \cdot 4^{-b}`} block />
          </FormulaBlock>
          <div className="flex flex-col gap-2 mt-3">
            {[
              {b:"b=1", w:"80%", val:"1.57/d", lb:"LB: 1/d"},
              {b:"b=2", w:"45%", val:"0.56/d", lb:"LB: 0.25/d"},
              {b:"b=3", w:"22%", val:"0.18/d", lb:"LB: 0.063/d"},
              {b:"b=4", w:"8%", val:"0.047/d", lb:"LB: 0.016/d"},
            ].map(({b,w,val,lb})=>(
              <div key={b} className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-gray-500 min-w-[28px]">{b}</span>
                <div className="flex-1 h-[14px] bg-gray-100 rounded-sm overflow-hidden">
                  <div className="h-full bg-[#059669] opacity-70 rounded-sm" style={{width:w}} />
                </div>
                <span className="font-mono text-[10px] text-gray-500 min-w-[52px]">{val}</span>
                <span className="font-mono text-[10px] text-gray-500 min-w-[72px]">{lb}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 4. 이론적 하한선 ═══ */}
      <SectionDivider>Information-Theoretic Lower Bounds</SectionDivider>
      <div className={css.section}>
        <div className={css.secLabel}>Theorem 3</div>
        <h2 id="lower-bounds" className={css.h2}>이론적 하한선 — Shannon + Yao Minimax</h2>
        <p className={css.p}>
          TurboQuant의 우수성은 단순히 경험적 결과가 아니라 정보 이론으로 증명됩니다.
          어떤 랜덤화된 양자화 알고리즘이라도 반드시 이 하한선을 초과하는 오차를 가집니다.
        </p>
        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
          <div className={css.card}>
            <h3 className="text-[1.05rem] font-semibold mb-3 text-gray-800">MSE 하한</h3>
            <FormulaBlock comment="Shannon Lower Bound + Yao Minimax">
              <Formula tex={String.raw`D_{\text{mse}}(Q) \geq 4^{-b}`} block />
            </FormulaBlock>
            <p className="text-[12px]">TurboQuant 달성: <strong className="text-[#b45309]"><Formula tex={String.raw`\sqrt{3\pi}/2 \cdot 4^{-b} \approx 2.7 \cdot 4^{-b}`} /></strong></p>
          </div>
          <div className={css.card}>
            <h3 className="text-[1.05rem] font-semibold mb-3 text-[#b45309]">내적 오차 하한</h3>
            <FormulaBlock comment="Pigeonhole on MSE lower bound">
              <Formula tex={String.raw`D_{\text{prod}}(Q) \geq \frac{1}{d} \cdot 4^{-b}`} block />
            </FormulaBlock>
            <p className="text-[12px]">TurboQuant 달성: <strong className="text-[#059669]"><Formula tex={String.raw`\sqrt{3\pi}/2 \cdot 4^{-b}/d`} /></strong></p>
          </div>
        </div>
        <div className={css.callout}>
          <strong>증명 핵심:</strong> Yao's Minimax Principle을 통해 랜덤화 알고리즘의 최악 케이스 오차를 단위 초구에서 균등 분포한 입력에 대한 결정론적 알고리즘의 기대 오차로 환원합니다.
          이후 Shannon Lower Bound (SLB)를 적용하여 <Formula tex={String.raw`D(B) \geq 2^{-2B/d}`} />를 도출합니다.
        </div>
      </div>

      {/* ═══ 5. 결과 비교 ═══ */}
      <hr className="border-none border-t border-gray-200 my-14" />
      <div className={css.section}>
        <div className={css.secLabel}>Experimental Results — p.2</div>
        <h2 id="experiments" className={css.h2}>기존 방법론과의 비교</h2>

        {/* KV Cache LongBench */}
        <div className={css.card + " mt-4"}>
          <h3 className={css.h3}>KV Cache 압축 — LongBench-V1 (Llama-3.1-8B)</h3>
          <p className="text-[12px] text-gray-500 mb-4">낮을수록 좋은 KV 크기(bits), 높을수록 좋은 평균 점수.</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["방법론","KV 크기","SingleQA","MultiQA","요약","코드","평균"].map(h=>(
                    <th key={h} className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500 text-left px-3.5 py-2.5 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {name:"Full Cache",kv:"16",badge:"badge-bad",vals:["45.29","45.16","26.55","46.28"],avg:"50.06",avgStyle:"font-bold"},
                  {name:"KIVI",kv:"3",badge:"badge-mid",vals:["43.38","37.99","27.16","44.68"],avg:"48.50",avgStyle:"text-[#dc2626]"},
                  {name:"KIVI",kv:"5",badge:"badge-mid",vals:["45.04","45.70","26.47","46.41"],avg:"50.16"},
                  {name:"PolarQuant",kv:"3.9",badge:"badge-mid",vals:["45.18","44.48","26.23","45.24"],avg:"49.78"},
                  {name:"TurboQuant",kv:"2.5",badge:"badge-good",vals:["44.16","44.96","24.80","45.76"],avg:"49.44",turbo:true,extra:"4.5×압축"},
                  {name:"TurboQuant",kv:"3.5",badge:"badge-good",vals:["45.01","45.31","26.00","46.17"],avg:"50.06",turbo:true,extra:"Full 동등"},
                ].map((r,i)=>(
                  <tr key={i} className="hover:bg-black/[0.02]">
                    <td className={`px-3.5 py-2.5 border-b border-[#eaecf0] ${r.turbo?"text-[#059669] font-bold":""}`}>{r.name}</td>
                    <td className="px-3.5 py-2.5 border-b border-[#eaecf0]">
                      <span className={`inline-block font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        r.badge==="badge-good"?"bg-[rgba(5,150,105,0.1)] text-[#059669] border border-[#059669]":
                        r.badge==="badge-bad"?"bg-[rgba(220,38,38,0.1)] text-[#dc2626] border border-[#dc2626]":
                        "bg-[rgba(180,83,9,0.08)] text-[#b45309] border border-[#b45309]"
                      }`}>{r.kv}</span>
                    </td>
                    {r.vals.map((v,j)=><td key={j} className="px-3.5 py-2.5 border-b border-[#eaecf0] text-gray-600">{v}</td>)}
                    <td className={`px-3.5 py-2.5 border-b border-[#eaecf0] ${r.avgStyle||""} ${r.turbo?"text-[#059669] font-bold":""}`}>
                      {r.avg}
                      {r.extra && <span className="inline-block font-mono text-[10px] bg-[rgba(5,150,105,0.1)] text-[#059669] border border-[#059669] px-1.5 py-0.5 rounded ml-1">{r.extra}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Needle in Haystack */}
        <div className={css.cardGreen + " mt-4"}>
          <h3 className={css.h3}>Needle-in-a-Haystack (최장 104k 토큰, Llama-3.1-8B)</h3>
          <p className="text-[12px] text-gray-500 mb-3">긴 컨텍스트에서 특정 정보를 찾는 능력. 1.0에 가까울수록 완벽한 recall.</p>
          <div className="grid grid-cols-3 gap-2.5 mt-3.5 max-[500px]:grid-cols-2">
            {[
              {score:"0.858",name:"SnapKV",color:"#dc2626"},
              {score:"0.895",name:"PyramidKV",color:"#dc2626"},
              {score:"0.981",name:"KIVI",color:"#b45309"},
              {score:"0.995",name:"PolarQuant",color:"#2563eb"},
              {score:"0.997",name:"Full Precision",color:"#1a1e2a"},
              {score:"0.997",name:"TurboQuant ✓",color:"#059669",winner:true},
            ].map(({score,name,color,winner})=>(
              <div key={name} className={`bg-gray-100 border rounded-lg p-3.5 text-center ${winner?"border-[#059669]":"border-gray-200"}`}>
                <div className="font-mono text-[1.4rem] font-bold mb-1" style={{color}}>{score}</div>
                <div className="text-[11px] text-gray-500">{name}</div>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-gray-500 mt-3">TurboQuant는 <strong className="text-[#059669]">4× 이상 압축</strong> 상태에서도 Full Precision과 동일한 recall 달성.</p>
        </div>

        {/* Quantization Speed */}
        <div className={css.card + " mt-4"}>
          <h3 className={css.h3}>양자화 속도 비교 (4비트, GPU 기준)</h3>
          <p className="text-[12px] text-gray-500 mb-3.5">d=1536 기준. 온라인 KV Cache 압축에서는 속도가 핵심입니다.</p>
          <div className="flex flex-col gap-1.5">
            {[
              {name:"PQ",w:"90%",val:"239.75s",color:"#2563eb"},
              {name:"RabitQ",w:"100%",val:"2267.59s",color:"#b45309"},
              {name:"TurboQuant",w:"0.5%",val:"0.0013s",color:"#059669",nameColor:"#059669"},
            ].map(({name,w,val,color,nameColor})=>(
              <div key={name} className="flex items-center gap-2.5 my-1">
                <span className="font-mono text-[11px] min-w-[90px]" style={{color:nameColor||"#6b7280"}}>{name}</span>
                <div className="flex-1 h-[18px] bg-gray-100 rounded-sm overflow-hidden relative">
                  <div className="h-full rounded-sm flex items-center pl-1.5 font-mono text-[10px] font-semibold" style={{width:w,background:color}}/>
                </div>
                <span className="font-mono text-[11px] min-w-[40px] text-right" style={{color}}>{val}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-gray-500 mt-2.5">TurboQuant는 PQ 대비 <strong className="text-[#059669]">약 18만 배</strong>, RabitQ 대비 <strong className="text-[#059669]">약 174만 배</strong> 빠름.</p>
        </div>

        {/* ANN Search */}
        <div className={css.card + " mt-4"}>
          <h3 className={css.h3}>최근접 이웃 탐색 Recall@1@k (d=1536, 4비트)</h3>
          <p className="text-[12px] text-gray-500 mb-3.5">top-k 후보 중 실제 정답이 포함된 비율.</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["방법론","k=1","k=4","k=10","k=32","전처리 필요?"].map(h=>(
                    <th key={h} className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500 text-left px-3.5 py-2.5 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {name:"PQ (2bit)",vals:["0.860","0.910","0.940","0.966"],pre:"k-means 필요",preBadge:"bad"},
                  {name:"PQ (4bit)",vals:["0.876","0.922","0.950","0.974"],pre:"k-means 필요",preBadge:"bad"},
                  {name:"RabitQ (2bit)",vals:["0.855","0.906","0.938","0.963"],pre:"전처리 있음",preBadge:"mid"},
                  {name:"TurboQuant (2bit)",vals:["0.880","0.930","0.957","0.979"],pre:"불필요",preBadge:"good",turbo:true},
                  {name:"TurboQuant (4bit)",vals:["0.920","0.961","0.978","0.991"],pre:"불필요",preBadge:"good",turbo:true},
                ].map((r,i)=>(
                  <tr key={i} className="hover:bg-black/[0.02]">
                    <td className={`px-3.5 py-2.5 border-b border-[#eaecf0] ${r.turbo?"text-[#059669] font-bold":""}`}>{r.name}</td>
                    {r.vals.map((v,j)=><td key={j} className={`px-3.5 py-2.5 border-b border-[#eaecf0] ${r.turbo?"text-[#059669] font-bold":"text-gray-600"}`}>{v}</td>)}
                    <td className="px-3.5 py-2.5 border-b border-[#eaecf0]">
                      <span className={`inline-block font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        r.preBadge==="good"?"bg-[rgba(5,150,105,0.1)] text-[#059669] border border-[#059669]":
                        r.preBadge==="bad"?"bg-[rgba(220,38,38,0.1)] text-[#dc2626] border border-[#dc2626]":
                        "bg-[rgba(180,83,9,0.08)] text-[#b45309] border border-[#b45309]"
                      }`}>{r.pre}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-gray-500 mt-2.5">TurboQuant는 데이터 의존적 전처리(k-means) 없이도 PQ를 전 범위에서 상회.</p>
        </div>
      </div>

      {/* ═══ 6. 요약 ═══ */}
      <hr className="border-none border-t border-gray-200 my-14" />
      <div className={css.section}>
        <div className={css.secLabel}>Summary</div>
        <h2 id="summary" className={css.h2}>핵심 요약</h2>
        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
          <div className={css.cardAccent}>
            <h3 className={css.h3}>Qmse — MSE 최적화</h3>
            <div className="space-y-3">
              {[
                {title:"랜덤 회전",desc:"입력 분포 무관하게 모든 좌표를 Beta 분포로 균일화"},
                {title:"Lloyd-Max 코드북",desc:"Beta→Gaussian 분포에 최적화된 스칼라 양자화기 (오프라인 사전 계산)"},
                {title:"좌표별 독립 양자화",desc:"near-independence 덕에 좌표 간 상관 무시 가능 → O(d) 연산"},
              ].map(({title,desc},i)=>(
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-b-0">
                  <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded-md text-gray-600 font-mono text-[11px] flex items-center justify-center shrink-0">{i+1}</div>
                  <div>
                    <div className="font-semibold text-[14px]">{title}</div>
                    <p className="text-[12px] text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={css.cardGold}>
            <h3 className={css.h3}>Qprod — 내적 최적화</h3>
            <div className="space-y-3">
              {[
                {title:"Qmse (b−1 비트)",desc:"먼저 b−1 비트 MSE 양자화로 잔차 크기 최소화"},
                {title:"QJL on residual",desc:"잔차에 1비트 QJL 변환 적용 — 편향 제거, 불편 추정"},
                {title:"복원",tex:String.raw`\tilde{x} = \tilde{x}_{\text{mse}} + \|r\| \cdot \sqrt{\pi/2}/d \cdot S^\top \cdot \text{qjl}`},
              ].map(({title,desc,tex},i)=>(
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-b-0">
                  <div className="w-6 h-6 bg-[rgba(180,83,9,0.08)] border border-[#b45309] rounded-md text-[#b45309] font-mono text-[11px] flex items-center justify-center shrink-0">{i+1}</div>
                  <div>
                    <div className="font-semibold text-[14px]">{title}</div>
                    {desc && <p className="text-[12px] text-gray-600">{desc}</p>}
                    {tex && <div className="mt-1"><Formula tex={tex} block /></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={css.calloutGreen + " mt-5"}>
          <strong>AI Agent 개발자 관점 핵심 포인트:</strong><br/>
          TurboQuant는 <em>데이터 비의존적(online)</em>이므로 KV Cache처럼 스트리밍 생성 중 실시간 적용이 가능합니다.
          GPU에서 완전 벡터화되며, 코드북 크기는 상수 — 비트폭이 늘어도 저장 공간이 지수 증가하는 PQ의 한계를 극복합니다.
          3.5비트에서 Full Precision과 동등한 품질, 2.5비트에서 미미한 품질 저하만으로 메모리를 6분의 1 수준으로 절감합니다.
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-10 border-t border-gray-200">
        <a
          href="https://arxiv.org/abs/2504.19874"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-gray-500 hover:text-gray-800 hover:underline"
        >
          arXiv:2504.19874 · 원본 논문 보기 →
        </a>
        <div className="font-mono text-[10px] text-gray-500 mt-2">TurboQuant: Online Vector Quantization with Near-optimal Distortion Rate</div>
        <div className="font-mono text-[10px] text-gray-500 mt-1">Zandieh · Daliri · Hadian · Mirrokni · Google Research / DeepMind / NYU · 2025</div>
      </div>
    </div>
  );
};

export default TurboQuantPost;
