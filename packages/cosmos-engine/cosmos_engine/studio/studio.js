'use strict';
const $ = id => document.getElementById(id);
let state = null, selectedCandidate = '', selectedEntity = 'person:soyeong', pollTimer = null, graphMode = 'cosmos', activeStage = 1, jobTargetStage = null, intakeBusy = false;
const intakeQuestions = [
  '어떤 경험이나 지식을 기록할까요? 먼저 프로젝트나 주제 이름을 알려주세요.',
  '그 항목에서 어떤 역할을 맡으셨나요?',
  '구체적으로 어떤 일을 하셨나요? 중요한 행동이나 기여 하나를 설명해 주세요.',
  '결과나 근거가 있으면 알려주세요. 없다면 건너뛰셔도 돼요.'
];
const initialChatEntry = {role:'assistant',kind:'question',text:'어떤 자료를 연결할까요? 프로젝트 보고서, 발표 자료, 이력서, 논문이나 특허 초안, 블로그 글, 메모, 화면 캡처, 이전 대화 기록을 첨부해 주세요. 자료가 없다면 프로젝트나 주제 이름만 메시지로 적어 주셔도 돼요. 맡으신 역할과 결과는 이어서 하나씩 여쭤볼게요.',actions:[{label:'자료 파일 첨부하기',action:'focus-attach'}]};
let chatEntries = [initialChatEntry], conversationStep = 0;
try { const saved=JSON.parse(sessionStorage.getItem('cosmos-studio-chat')||'null'); if(Array.isArray(saved?.entries)&&saved.entries.length){chatEntries=saved.entries;conversationStep=Math.max(0,Math.min(4,Number(saved.step)||0));} } catch {}
const politeLegacyChat = new Map([
  ['어떤 자료를 연결할까? 프로젝트 보고서, 발표 자료, 이력서, 논문이나 특허 초안, 블로그 글, 메모, 화면 캡처, 이전 대화 기록을 첨부해줘. 자료가 없다면 프로젝트나 주제 이름만 메시지로 적어도 돼. 맡은 역할과 결과는 이어서 하나씩 물어볼게.', initialChatEntry.text],
  ['어떤 경험이나 지식을 기록할까요? 먼저 프로젝트나 주제 이름만 알려줘.', intakeQuestions[0]],
  ['그 항목에서 맡은 역할은 무엇이었어?', intakeQuestions[1]],
  ['구체적으로 어떤 일을 했어? 중요한 행동이나 기여 하나를 설명해줘.', intakeQuestions[2]],
  ['결과나 근거가 있으면 알려줘. 없다면 건너뛰어도 돼.', intakeQuestions[3]],
  ['좋아. 더 보탤 내용은 이어서 적고, 준비되면 지식 후보를 만들어 검토하자.', '좋아요. 더 보탤 내용은 이어서 적어 주세요. 준비되면 지식 후보를 만들어 검토할 수 있어요.'],
  ['내용을 더했어. 이어서 보태거나 지식 후보를 만들어 검토할 수 있어.', '내용을 추가했어요. 이어서 보태시거나 지식 후보를 만들어 검토하실 수 있어요.'],
  ['파일을 추가했어. 질문에 하나씩 답하거나 바로 지식 후보를 만들 수 있어.', '파일을 추가했어요. 질문에 하나씩 답하시거나 바로 지식 후보를 만들 수 있어요.']
]);
for(const entry of chatEntries){if(entry.role==='assistant')entry.text=politeLegacyChat.get(entry.text)||entry.text;else if(entry.kind==='skip')entry.text='이 질문은 건너뛸게요.';else if(entry.kind==='files')entry.text=entry.text.replace(/첨부했어\.$/,'첨부했어요.');}
if(chatEntries.length===1&&chatEntries[0].role==='assistant'&&chatEntries[0].kind==='question'&&conversationStep===0)chatEntries=[initialChatEntry];
const cosmosCategories = {Person:{label:'사람과 경험',color:'#BDA7F5'},Project:{label:'프로젝트',color:'#8CCFE8'},Writing:{label:'논문과 글',color:'#BDA7F5'},Review:{label:'외부 자료 리뷰',color:'#8CCFE8'},Achievement:{label:'성과와 발표',color:'#F3DFA0'},Concept:{label:'개념',color:'#8CCFE8'},Technology:{label:'기술',color:'#F3DFA0'},AgentSystem:{label:'에이전트 시스템',color:'#8CCFE8'}};
const cosmosCenters = {Person:[260,500],Project:[650,230],Writing:[210,170],Review:[105,420],Achievement:[535,735],Concept:[1015,300],AgentSystem:[1040,610],Technology:[825,790]};
let cosmosView = {x:0,y:0,zoom:1}, cosmosDrag = null;
const drafts = new Map();
const humanTypes = {Person:'사람',Project:'프로젝트',Capability:'역량',Experience:'경력',Education:'학력',Writing:'글',Review:'리뷰',Paper:'논문',Patent:'특허',Organization:'조직',Contribution:'기여',Media:'미디어'};
function element(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
function notice(message, error = false) { $('notice').hidden = !message; $('notice').textContent = message || ''; $('notice').classList.toggle('error', error); }
function message(value) { return typeof value === 'string' ? value : JSON.stringify(value, null, 2); }
function persistChat(){try{sessionStorage.setItem('cosmos-studio-chat',JSON.stringify({entries:chatEntries,step:conversationStep}));}catch{}}
function renderChat(){
  const thread=$('chat-messages');thread.replaceChildren();
  for(const entry of chatEntries){
    const row=element('article',undefined,`chat-message${entry.role==='user'?' is-user':''}`);
    if(entry.role!=='user')row.append(element('span','✳','chat-avatar'));
    const bubble=element('div',undefined,'chat-bubble');bubble.append(element('p',entry.text));
    if(entry.files?.length){const files=element('ul',undefined,'chat-file-list');for(const file of entry.files)files.append(element('li',file));bubble.append(files);}
    if(entry.actions?.length){const actions=element('div',undefined,'chat-actions');for(const item of entry.actions){const button=element('button',item.label,`chat-action${item.action==='extract'?' is-primary':''}`);button.type='button';button.addEventListener('click',()=>{if(item.action==='skip')skipQuestion();else if(item.action==='extract')startCandidateExtraction();else if(item.action==='focus-attach')$('file-input').click();});actions.append(button);}bubble.append(actions);}
    row.append(bubble);thread.append(row);
  }
  thread.scrollTop=thread.scrollHeight;
}
function hasWorkspaceInput(){return chatEntries.some(entry=>entry.role==='user'&&((entry.kind==='text'&&entry.text?.trim())||(entry.kind==='files'&&entry.files?.length)));}
function syncWorkspaceVisibility(){const ready=hasWorkspaceInput();$('cosmos-welcome').hidden=ready;$('cosmos-artifact').hidden=!ready;document.body.classList.toggle('intro-active',!ready);if(ready)$('workflow').inert=false;}
function addChatEntry(entry){chatEntries.push(entry);persistChat();renderChat();syncWorkspaceVisibility();}
function askNextQuestion(){
  if(conversationStep<intakeQuestions.length){addChatEntry({role:'assistant',kind:'question',text:intakeQuestions[conversationStep],actions:[{label:'이 질문 건너뛰기',action:'skip'}]});return;}
  addChatEntry({role:'assistant',kind:'ready',text:'좋아요. 더 보탤 내용은 이어서 적어 주세요. 준비되면 지식 후보를 만들어 검토할 수 있어요.',actions:[{label:'지식 후보 만들기',action:'extract'}]});
}
function skipQuestion(){if(conversationStep>=intakeQuestions.length)return;addChatEntry({role:'user',kind:'skip',text:'이 질문은 건너뛸게요.'});conversationStep++;askNextQuestion();}
function chatTranscript(){
  let turn=0;const parts=[];
  for(const entry of chatEntries){if(entry.role!=='user'||!['text','skip'].includes(entry.kind))continue;const prompt=turn<intakeQuestions.length?intakeQuestions[turn]:'추가 내용';parts.push(`## ${prompt}\n${entry.kind==='skip'?'[건너뜀]':entry.text}`);turn++;}
  return parts.length?`# Cosmos 지식 업데이트 대화\n\n${parts.join('\n\n')}`:'';
}
async function api(path, body) {
  const response = await fetch(path, {method: body === undefined ? 'GET' : 'POST', headers:{'X-Cosmos-Token':window.COSMOS_TOKEN, ...(body === undefined ? {} : {'Content-Type':'application/json'})}, ...(body === undefined ? {} : {body:JSON.stringify(body)})});
  const text = await response.text(); let result;
  try { result = JSON.parse(text); } catch { throw new Error(`서버 응답을 읽을 수 없어요 (${response.status}): ${text}`); }
  if (!response.ok) throw new Error(message(result.error || result.message || result));
  return result;
}
function busy(active) { for (const id of ['update','validate','approve','save-candidate','add-note','file-input','provider']) $(id).disabled = active;document.querySelectorAll('.chat-action').forEach(button=>{button.disabled=active;}); }
async function refreshState() { state = await api('/api/state'); render(); return state; }
async function job(path, body) {
  notice(''); busy(true); jobTargetStage = path==='/api/update' && body?.extract ? 2 : path==='/api/approve' ? 3 : null;
  try { const result = await api(path, body); if (result.graph) state = result; else { if (!state) await refreshState(); state.job = result.job || result; } render(); await poll(); }
  catch (error) { jobTargetStage = null; notice(error.message, true); busy(false); }
}
async function poll() {
  clearTimeout(pollTimer);
  try {
    await refreshState();
    if (state.job?.status === 'running') pollTimer = setTimeout(poll, 1000);
    else if (state.job?.status === 'failed') notice(message(state.job.error || state.job.result || '작업에 실패했어요.'), true);
    else if (state.job?.status === 'complete' && jobTargetStage) { setWorkflowStage(jobTargetStage); jobTargetStage = null; }
  } catch (error) { notice(error.message, true); busy(false); }
}
async function startCandidateExtraction(){
  const transcript=chatTranscript();
  if(!transcript&&!(state?.inputs||[]).length){notice('먼저 메시지를 보내거나 자료 파일을 첨부해 주세요.',true);return;}
  if(intakeBusy)return;
  try{intakeBusy=true;busy(true);if(transcript){const stamp=new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14),suffix=crypto.randomUUID?crypto.randomUUID().slice(0,8):Math.random().toString(36).slice(2,10);await upload(`conversation-${stamp}-${suffix}.md`,toBase64(new TextEncoder().encode(transcript)));await refreshState();}intakeBusy=false;setWorkflowStage(2);await job('/api/update',{provider:$('provider').value,extract:true,refresh:$('refresh').checked});}
  catch(error){intakeBusy=false;notice(error.message,true);busy(false);}
}
function render() {
  syncWorkspaceVisibility();
  const graph = state.graph || {nodes:[],edges:[],sources:{}};
  const candidates = state.candidates || [];
  $('stats').replaceChildren(...[[graph.nodes.length,'지식 노드'],[graph.edges.length,'연결 관계'],[candidates.length,'검토할 변경안']].map(([value,label]) => {const div=element('div',undefined,'stat');div.append(element('strong',String(value)),element('span',label));return div;}));
  $('candidate-count').textContent = String(candidates.length);
  const running = state.job?.status === 'running'; busy(running||intakeBusy);
  $('job-bar').hidden = !running;
  $('job-title').textContent = '지식을 처리하고 있어요';
  $('job-description').textContent = '자료 추출과 검증에는 시간이 걸릴 수 있어요. 완료되면 변경안과 실행 결과를 보여드릴게요.';
  $('input-count').textContent = `자료 ${(state.inputs || []).length}개`;
  $('attached-count').textContent = String((state.inputs || []).length);
  $('input-list').replaceChildren(...(state.inputs || []).map(input => {const li=element('li');li.append(element('span',input.name),element('small',`${Math.ceil(input.size/1024)} KB`));return li;}));
  if (!state.inputs?.length) $('input-list').append(element('li','등록한 자료가 여기에 표시돼요.','empty'));
  const provider = state.provider || {};
  if (!$('provider').dataset.initialized) { $('provider').value = provider.default || 'codex'; $('provider').dataset.initialized = 'true'; }
  providerInfo();
  const previous = selectedCandidate;
  if (!candidates.some(c => c.id === selectedCandidate)) selectedCandidate = candidates[0]?.id || '';
  $('candidate-select').replaceChildren(...candidates.map(c => {const option=element('option',c.input || c.id);option.value=c.id;return option;}));
  if (!candidates.length) {const option=element('option','아직 변경안이 없어요');option.value='';$('candidate-select').append(option);}
  $('candidate-select').value = selectedCandidate;
  if (previous !== selectedCandidate || document.activeElement !== $('patch-editor')) renderCandidate();
  else $('approve').disabled = running || drafts.has(selectedCandidate) || !!candidates.find(c => c.id === selectedCandidate)?.patch?.questions?.length;
  $('entity-select').replaceChildren(...graph.nodes.map(n => {const option=element('option',`${n.label} — ${humanTypes[n.type] || n.type}`);option.value=n.id;return option;}));
  if (!graph.nodes.some(n => n.id === selectedEntity)) selectedEntity = graph.nodes.find(n => n.type === 'Person')?.id || graph.nodes[0]?.id || '';
  $('entity-select').value = selectedEntity; renderGraph();
  $('result-summary').replaceChildren(...[[graph.nodes.length,'지식 노드'],[graph.edges.length,'연결 관계'],[candidates.length,'검토 중인 변경안']].map(([value,label])=>{const item=element('div',undefined,'result-stat');item.append(element('strong',String(value)),element('span',label));return item;}));
  $('report').textContent = JSON.stringify({report:state.report || {},job:state.job || null},null,2);
}
function setWorkflowStage(stage) {
  activeStage = stage;
  ['intake','review','stage-result'].forEach((id,index)=>$(id).hidden=index!==stage-1);
  [1,2,3].forEach(index=>{const tab=$(`stage-tab-${index}`);tab.classList.toggle('is-active',index===stage);if(index===stage)tab.setAttribute('aria-current','step');else tab.removeAttribute('aria-current');});
  $('workflow-stage-content').scrollTo({top:0,behavior:'smooth'});
}
function providerInfo() {
  const provider = state?.provider || {}, selected = $('provider').value;
  const text = selected === 'codex' ? (provider.codexAvailable ? 'Codex SDK와 기존 로그인 계정을 사용해요. 계정의 모델 사용량이 적용돼요.' : 'Codex 실행 환경을 찾지 못했어요. 서버에서 SDK 설치와 codex login을 확인해 주세요.') : selected === 'openai' ? (provider.openaiConfigured ? '서버 환경 변수에 설정한 API와 모델을 사용해요. 제공자의 API 요금이 적용돼요.' : '서버에 COSMOS_LLM_API_KEY와 COSMOS_LLM_MODEL을 설정해 주세요.') : 'LLM을 호출하지 않아요. JSON 변경안을 검증하고 나머지 입력은 확인 요청으로 남겨요.';
  $('provider-description').textContent = text;
}
function renderCandidate() {
  const candidate = state.candidates?.find(c => c.id === selectedCandidate);
  $('review-empty').hidden = !!candidate; $('candidate-content').hidden = !candidate;
  if (!candidate) return;
  const patch = candidate.patch || {};
  $('candidate-meta').textContent = `${candidate.input || '변경안'} / ${candidate.id}`;
  $('patch-editor').value = drafts.get(candidate.id) ?? JSON.stringify(patch,null,2);
  const questions = patch.questions || [];
  $('questions').hidden = !questions.length;
  $('question-list').replaceChildren(...questions.map(q => element('li',typeof q === 'string' ? q : q.message || message(q))));
  const records = [];
  for (const node of patch.nodes || []) {
    const card=element('article',undefined,'record');card.append(element('span',humanTypes[node.type] || node.type || '노드','record-type'),element('h3',node.label || node.id),element('p',node.summary || '설명 없음'));
    const evidence=(patch.provenance || []).filter(p=>p.recordId===node.id);
    for (const p of evidence) card.append(element('blockquote',`${p.quote || '인용 없음'}${p.locator ? ` / ${p.locator}` : ''}`));
    records.push(card);
  }
  for (const edge of patch.edges || []) {
    const card=element('article',undefined,'record');card.append(element('span','관계','record-type'),element('h3',edge.predicate),element('p',`${edge.source} → ${edge.target}`));
    for(const p of (patch.provenance || []).filter(p=>p.recordId===edge.id)) card.append(element('blockquote',p.quote || p.locator || ''));
    records.push(card);
  }
  if (patch.removeNodes?.length || patch.removeEdges?.length) records.push(element('p',`삭제 요청: 노드 ${(patch.removeNodes || []).length}개, 관계 ${(patch.removeEdges || []).length}개. JSON에서 대상을 확인해 주세요.`));
  if (candidate.validation) { const validation=element('details');validation.append(element('summary','변경안 검증 결과'),element('pre',message(candidate.validation)));records.push(validation); }
  $('candidate-records').replaceChildren(...records);
  if (!records.length) $('candidate-records').append(element('p','추출된 노드나 관계가 없어요. 입력과 확인 요청을 살펴봐 주세요.','empty'));
  const dirty=drafts.has(candidate.id);
  $('approve').disabled=state.job?.status==='running' || !!questions.length || dirty;
  $('approval-help').textContent = dirty ? '수정한 JSON을 먼저 저장해 주세요.' : questions.length ? '확인 요청을 해결하고 JSON을 저장하면 승인할 수 있어요.' : '승인하면 이 변경안을 검증하고 Cosmos에 반영해요.';
}
const NS='http://www.w3.org/2000/svg';
function svgElement(tag,attrs,text) {const node=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));if(text!==undefined)node.textContent=text;return node;}
function short(text,max=15) {return text.length>max ? `${text.slice(0,max-1)}…` : text;}
function renderGraph() {
  const graph=state.graph || {nodes:[],edges:[],sources:{}}, byId=new Map(graph.nodes.map(n=>[n.id,n])), center=byId.get(selectedEntity);
  $('graph').replaceChildren(); if (!center) return;
  const edges=graph.edges.filter(e=>e.source===center.id || e.target===center.id), neighbors=[...new Set(edges.map(e=>e.source===center.id?e.target:e.source))].filter(id=>byId.has(id)), limit=Number($('neighbor-limit').value), visible=neighbors.slice(0,limit);
  const defs=svgElement('defs',{}), marker=svgElement('marker',{id:'arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:5,markerHeight:5,orient:'auto-start-reverse'});marker.append(svgElement('path',{d:'M 0 1 L 9 5 L 0 9',fill:'none',stroke:'#8b73b5'}));defs.append(marker);$('graph').append(defs);
  const positions=new Map([[center.id,[360,238]]]);
  visible.forEach((id,i)=>{const angle=(i/visible.length)*Math.PI*2-Math.PI/2;positions.set(id,[360+230*Math.cos(angle),238+165*Math.sin(angle)]);});
  const drawn = new Set();
  for(const edge of edges) {
    const pair = [edge.source,edge.target].sort().join('\u0000');
    if (drawn.has(pair)) continue;
    drawn.add(pair);
    if(!positions.has(edge.source)||!positions.has(edge.target))continue;
    const [ax,ay]=positions.get(edge.source),[bx,by]=positions.get(edge.target),length=Math.hypot(bx-ax,by-ay),start=edge.source===center.id?46:13,end=edge.target===center.id?46:13;
    $('graph').append(svgElement('line',{x1:ax+(bx-ax)*start/length,y1:ay+(by-ay)*start/length,x2:bx-(bx-ax)*(end+3)/length,y2:by-(by-ay)*(end+3)/length,class:'link','marker-end':'url(#arrow)'}));
  }
  for(const [id,[x,y]] of positions) {
    const node=byId.get(id),central=id===center.id,g=svgElement('g',{tabindex:0,role:'button','aria-label':`${node.label} ${humanTypes[node.type]||node.type} 연결 살펴보기`});
    g.append(svgElement('title',{},node.label),svgElement('circle',{cx:x,cy:y,r:central?44:11,class:central?'node center-node':'node'}));
    if(central) {const words=short(node.label,18);g.append(svgElement('text',{x,y:y+4,'text-anchor':'middle',class:'center-text'},short(words,11)));}
    else {const left=x<300,right=x>420;g.append(svgElement('text',{x:x+(left?-18:right?18:0),y:y+(left||right?4:(y<238?-23:31)),'text-anchor':left?'end':right?'start':'middle'},short(node.label,14)));}
    const select=()=>{selectedEntity=id;$('entity-select').value=id;renderGraph();};g.addEventListener('click',select);g.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});$('graph').append(g);
  }
  $('graph-caption').textContent=`직접 연결된 ${neighbors.length}개 중 ${visible.length}개 표시 / 노드를 선택해 중심을 바꿔 보세요`;
  const detail=$('entity-detail');detail.replaceChildren(element('span',humanTypes[center.type]||center.type,'record-type'),element('h3',center.label),element('p',center.summary || ''));
  const list=element('ul');for(const edge of edges) {const other=byId.get(edge.source===center.id?edge.target:edge.source);if(!other)continue;const li=element('li'),button=element('button',other.label);button.type='button';button.addEventListener('click',()=>{selectedEntity=other.id;$('entity-select').value=other.id;renderGraph();});li.append(element('small',`${edge.source===center.id?'→':'←'} ${edge.predicate} `),button);list.append(li);}detail.append(element('h4','연결 관계'),list);
  const sources=element('ul');for(const id of center.evidenceIds || []) {const source=graph.sources?.[id];if(!source)continue;const li=element('li');let url;try{url=new URL(source.url);}catch{}if(url?.protocol==='https:'){const a=element('a',source.label || id);a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';li.append(a);}else li.textContent=source.label || id;sources.append(li);}detail.append(element('h4','근거'),sources);
  if(graphMode==='cosmos') renderCosmosGraph();
}
function cosmosCategory(type) {
  if(type==='Patent'||type==='Paper') return 'Writing';
  if(type==='Section') return 'Writing';
  if(['ExternalPublication','ExternalWriting'].includes(type)) return 'Review';
  if(['Award','Presentation','Media','Event','Participation'].includes(type)) return 'Achievement';
  if(['RoleAssignment','Program','PublicationChannel','Education','Organization','Capability','Contribution','Experience','Credential'].includes(type)) return 'Person';
  if(['Agent','Tool'].includes(type)) return 'AgentSystem';
  return type;
}
function renderCosmosGraph() {
  const graph=state.graph || {nodes:[],edges:[]}, svg=$('cosmos-graph'), groups=new Map(), degrees=new Map(graph.nodes.map(node=>[node.id,0]));
  svg.replaceChildren();
  for(const edge of graph.edges){degrees.set(edge.source,(degrees.get(edge.source)||0)+1);degrees.set(edge.target,(degrees.get(edge.target)||0)+1);}
  for(const node of graph.nodes){const category=cosmosCategory(node.type);if(!cosmosCategories[category])continue;if(!groups.has(category))groups.set(category,[]);groups.get(category).push(node);}
  const positions=new Map(),world=svgElement('g',{id:'cosmos-world'}),clouds=svgElement('g',{class:'cluster-clouds','aria-hidden':'true'});
  for(const [category,nodes] of groups){const [cx,cy]=cosmosCenters[category],spread=Math.min(245,30+Math.sqrt(nodes.length)*33);nodes.forEach((node,index)=>{const angle=index*2.399963+category.length*.17,radius=spread*Math.sqrt((index+.5)/nodes.length);positions.set(node.id,[cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius]);});const color=cosmosCategories[category].color;clouds.append(svgElement('ellipse',{cx,cy,rx:spread+48,ry:spread*.78+42,fill:color,'fill-opacity':.11,stroke:color,'stroke-opacity':.28,'stroke-width':1.5,class:'cluster-cloud'}));world.append(svgElement('text',{x:cx,y:cy-spread-16,'text-anchor':'middle',class:'cluster-label'},cosmosCategories[category].label.toLocaleUpperCase()));}
  world.append(clouds);
  for(const edge of graph.edges){const a=positions.get(edge.source),b=positions.get(edge.target);if(!a||!b)continue;const active=edge.source===selectedEntity||edge.target===selectedEntity;world.append(svgElement('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:`cosmos-link${active?' is-active':''}`}));}
  const labels=new Set(graph.nodes.filter(node=>['Person','Project','Paper','Patent','Writing','Review','AgentSystem'].includes(node.type)||(degrees.get(node.id)||0)>=10).map(node=>node.id));
  for(const node of graph.nodes){const position=positions.get(node.id);if(!position)continue;const category=cosmosCategory(node.type),color=cosmosCategories[category].color,radius=Math.min(13,4+Math.sqrt(degrees.get(node.id)||0)*1.3),g=svgElement('g',{class:`cosmos-node${node.id===selectedEntity?' is-selected':''}`,tabindex:0,role:'button','aria-label':`${node.label}, ${humanTypes[node.type]||node.type}, 연결 ${degrees.get(node.id)||0}개`});
    g.append(svgElement('title',{},`${node.label} / ${humanTypes[node.type]||node.type} / ${degrees.get(node.id)||0}개 연결`),svgElement('circle',{cx:position[0],cy:position[1],r:radius,fill:color,stroke:color}));
    if(labels.has(node.id))g.append(svgElement('text',{x:position[0],y:position[1]+radius+17,'text-anchor':'middle',class:'cosmos-label'},short(node.label,25)));
    const select=()=>{selectedEntity=node.id;$('entity-select').value=node.id;renderGraph();};g.addEventListener('click',select);g.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});world.append(g);
  }
  svg.append(world);applyCosmosTransform();
  $('cosmos-legend').replaceChildren(...[...groups.keys()].map(category=>{const item=element('span'),dot=element('i');dot.style.backgroundColor=cosmosCategories[category].color;item.append(dot,document.createTextNode(`${cosmosCategories[category].label} ${groups.get(category).length}`));return item;}));
  $('cosmos-caption').textContent=`전체 ${graph.nodes.length}개 노드와 ${graph.edges.length}개 관계 / 배경 드래그로 이동, 휠로 확대와 축소`;
}
function applyCosmosTransform(){const world=$('cosmos-world');if(world)world.setAttribute('transform',`translate(${cosmosView.x} ${cosmosView.y}) scale(${cosmosView.zoom})`);}
function setGraphMode(mode){graphMode=mode;$('connected-mode').setAttribute('aria-pressed',String(mode==='connected'));$('cosmos-mode').setAttribute('aria-pressed',String(mode==='cosmos'));$('connected-view').hidden=mode!=='connected';$('cosmos-view').hidden=mode!=='cosmos';$('cosmos-reset').hidden=mode!=='cosmos';$('connected-controls').hidden=mode!=='connected';if(mode==='cosmos')renderCosmosGraph();}
async function upload(name,base64) {await api('/api/upload',{name,contentBase64:base64});}
function toBase64(bytes) {let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
$('note-text').addEventListener('input',()=>{const length=$('note-text').value.length;$('text-estimate').textContent=`${length.toLocaleString()}자`;$('budget-estimate').textContent=length ? `현재 메시지의 입력 토큰은 약 ${Math.ceil(length/2).toLocaleString()}–${length.toLocaleString()}개로 추정돼요. 기존 지식, 출력과 추론 토큰은 별도예요.` : '추출 사용량은 대화 길이와 모델에 따라 달라져요. 금액은 여기서 확정하지 않아요.';});
$('chat-form').addEventListener('submit',event=>{event.preventDefault();const text=$('note-text').value.trim();if(!text)return;addChatEntry({role:'user',kind:'text',text});$('note-text').value='';$('note-text').dispatchEvent(new Event('input'));if(conversationStep<intakeQuestions.length){conversationStep++;askNextQuestion();}else addChatEntry({role:'assistant',kind:'follow-up',text:'내용을 추가했어요. 이어서 보태시거나 지식 후보를 만들어 검토하실 수 있어요.',actions:[{label:'지식 후보 만들기',action:'extract'}]});});
$('file-input').addEventListener('change',async event=>{const files=[...event.target.files];if(!files.length)return;try{intakeBusy=true;busy(true);for(const file of files){if(file.size>12*1024*1024)throw new Error(`${file.name}: 12 MiB보다 큰 파일은 나눠서 추가해 주세요.`);await upload(file.name,toBase64(new Uint8Array(await file.arrayBuffer())));}event.target.value='';await refreshState();addChatEntry({role:'user',kind:'files',text:`자료 ${files.length}개를 첨부했어요.`,files:files.map(file=>file.name)});addChatEntry({role:'assistant',kind:'file-response',text:'파일을 추가했어요. 질문에 하나씩 답하시거나 바로 지식 후보를 만들 수 있어요.',actions:[{label:'지식 후보 만들기',action:'extract'}]});intakeBusy=false;busy(false);}catch(error){intakeBusy=false;notice(error.message,true);await refreshState().catch(()=>busy(false));}});
$('provider').addEventListener('change',providerInfo);
$('candidate-select').addEventListener('change',event=>{selectedCandidate=event.target.value;renderCandidate();});
$('patch-editor').addEventListener('input',()=>{drafts.set(selectedCandidate,$('patch-editor').value);$('approve').disabled=true;$('approval-help').textContent='수정한 JSON을 먼저 저장해 주세요.';});
$('save-candidate').addEventListener('click',async()=>{try{const patch=JSON.parse($('patch-editor').value);if(!patch||Array.isArray(patch)||typeof patch!=='object')throw new Error('변경안은 JSON 객체여야 해요.');await api('/api/candidate',{id:selectedCandidate,patch});drafts.delete(selectedCandidate);await refreshState();notice('변경안을 저장했어요. 검증 결과와 확인 요청을 다시 살펴봐 주세요.');}catch(error){notice(error.message,true);}});
$('update').addEventListener('click',()=>job('/api/update',{provider:$('provider').value,extract:false,refresh:false}));
$('approve').addEventListener('click',()=>job('/api/approve',{id:selectedCandidate}));
$('validate').addEventListener('click',()=>job('/api/validate',{}));
$('stage-tab-1').addEventListener('click',()=>setWorkflowStage(1));
$('stage-tab-2').addEventListener('click',()=>setWorkflowStage(2));
$('stage-tab-3').addEventListener('click',()=>setWorkflowStage(3));
$('back-to-intake').addEventListener('click',()=>setWorkflowStage(1));
$('connected-mode').addEventListener('click',()=>setGraphMode('connected'));
$('cosmos-mode').addEventListener('click',()=>setGraphMode('cosmos'));
$('cosmos-reset').addEventListener('click',()=>{cosmosView={x:0,y:0,zoom:1};applyCosmosTransform();});
$('entity-select').addEventListener('change',event=>{selectedEntity=event.target.value;renderGraph();});
$('neighbor-limit').addEventListener('change',renderGraph);
const cosmosSvg=$('cosmos-graph');
cosmosSvg.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('.cosmos-node'))return;const rect=cosmosSvg.getBoundingClientRect();cosmosDrag={id:event.pointerId,x:event.clientX,y:event.clientY,panX:cosmosView.x,panY:cosmosView.y,width:rect.width,height:rect.height};cosmosSvg.setPointerCapture(event.pointerId);cosmosSvg.classList.add('is-panning');});
cosmosSvg.addEventListener('pointermove',event=>{if(!cosmosDrag||cosmosDrag.id!==event.pointerId)return;cosmosView.x=cosmosDrag.panX+(event.clientX-cosmosDrag.x)*1400/cosmosDrag.width/cosmosView.zoom;cosmosView.y=cosmosDrag.panY+(event.clientY-cosmosDrag.y)*920/cosmosDrag.height/cosmosView.zoom;applyCosmosTransform();});
function stopCosmosPan(event){if(!cosmosDrag||cosmosDrag.id!==event.pointerId)return;if(cosmosSvg.hasPointerCapture(event.pointerId))cosmosSvg.releasePointerCapture(event.pointerId);cosmosDrag=null;cosmosSvg.classList.remove('is-panning');}
cosmosSvg.addEventListener('pointerup',stopCosmosPan);cosmosSvg.addEventListener('pointercancel',stopCosmosPan);
cosmosSvg.addEventListener('wheel',event=>{if(graphMode!=='cosmos')return;event.preventDefault();const rect=cosmosSvg.getBoundingClientRect(),x=(event.clientX-rect.left)*1400/rect.width,y=(event.clientY-rect.top)*920/rect.height,old=cosmosView.zoom,next=Math.max(.45,Math.min(3.5,old*Math.exp(-event.deltaY*.001)));cosmosView.x=x-(x-cosmosView.x)*next/old;cosmosView.y=y-(y-cosmosView.y)*next/old;cosmosView.zoom=next;applyCosmosTransform();},{passive:false});
renderChat();
syncWorkspaceVisibility();
refreshState().then(()=>{if(state.job?.status==='running')pollTimer=setTimeout(poll,1000);}).catch(error=>notice(`작업실을 불러오지 못했어요. 서버를 확인하고 페이지를 새로고침해 주세요.\n${error.message}`,true));

function initWelcomeTour(){
  const scroll=$('welcome-scroll'),visual=$('welcome-canvas'),context=visual.getContext('2d'),chapters=[...scroll.querySelectorAll('.welcome-chapter')],steps=[...document.querySelectorAll('[data-go-scene]')];
  if(!context)return;
  const names=['도구 소개','입력과 추출','온톨로지 변환','시맨틱 레이어','승인과 정적 결과물'];
  const captions=['KNOWLEDGE COSMOS','MULTIFORMAT INPUT','TYPED KNOWLEDGE GRAPH','EVIDENCE-BASED QUERY','STATIC PORTFOLIO OUTPUT'];
  const colors={person:'#c8adf4',project:'#8ccfe8',contribution:'#f3dfa0',capability:'#d9c7f3',source:'#91bace',writing:'#ddd5ec',experience:'#a8b4d9'};
  const nodes=[
    {id:'person',label:'나',kind:'person',x:0,y:0,z:0},
    {id:'experience',label:'경력',kind:'experience',x:-104,y:-145,z:25},
    {id:'project',label:'프로젝트',kind:'project',x:145,y:-113,z:85},
    {id:'project2',label:'연구',kind:'project',x:198,y:78,z:-105},
    {id:'contribution',label:'기여',kind:'contribution',x:75,y:78,z:55},
    {id:'capability',label:'역량',kind:'capability',x:208,y:168,z:46},
    {id:'capability2',label:'평가',kind:'capability',x:70,y:192,z:-117},
    {id:'writing',label:'글',kind:'writing',x:-67,y:156,z:113},
    {id:'paper',label:'논문',kind:'writing',x:-151,y:119,z:-96},
    {id:'chat',label:'대화',kind:'source',x:-222,y:-103,z:93},
    {id:'pdf',label:'문서',kind:'source',x:-236,y:6,z:-24},
    {id:'image',label:'이미지',kind:'source',x:-179,y:163,z:-145},
    {id:'json',label:'JSON',kind:'source',x:-91,y:-203,z:-99},
    {id:'evidence',label:'근거',kind:'source',x:18,y:-197,z:143}
  ];
  const edges=[['person','experience'],['person','project'],['person','project2'],['person','contribution'],['person','writing'],['person','paper'],['experience','project'],['project','contribution'],['project2','capability2'],['contribution','capability'],['contribution','capability2'],['contribution','evidence'],['writing','project'],['paper','project2'],['chat','contribution'],['pdf','project'],['image','writing'],['json','experience'],['evidence','capability']];
  const byId=new Map(nodes.map(node=>[node.id,node]));
  const camera=[[-.44,.17,.91],[.16,-.12,1.03],[.7,.18,1.17],[1.32,-.15,1.23],[2.05,.08,.96]];
  const labels=[['person','project','capability'],['chat','pdf','image','json'],['person','contribution','capability'],['evidence','contribution','capability'],['person','project','writing']];
  let seed=21;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const stars=Array.from({length:72},()=>({x:random(),y:random(),size:.4+random()*1.2,light:.12+random()*.3}));
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,current=0,target=0,queued=false,active=0;
  const mix=(a,b,t)=>a+(b-a)*t;
  function focus(node,scene){
    if(scene===0)return node.kind==='person'?1:.68;
    if(scene===1)return node.kind==='source'?1:.19;
    if(scene===2)return ['person','experience','project','contribution','capability'].includes(node.kind)?1:.15;
    if(scene===3)return ['person','contribution','capability'].includes(node.kind)||node.id==='evidence'?1:.1;
    return ['person','project','contribution','capability','writing'].includes(node.kind)?1:.13;
  }
  function draw(progress){
    if($('cosmos-welcome').hidden||!width||!height)return;
    context.clearRect(0,0,width,height);
    const from=Math.min(4,Math.floor(progress)),to=Math.min(4,from+1),part=progress-from;
    const yaw=reduced.matches?-.22:mix(camera[from][0],camera[to][0],part),pitch=reduced.matches?.08:mix(camera[from][1],camera[to][1],part),zoom=reduced.matches?1:mix(camera[from][2],camera[to][2],part);
    for(const star of stars){const x=((star.x+yaw*.018+1)%1)*width,y=star.y*height;context.fillStyle=`rgba(211,207,231,${star.light})`;context.beginPath();context.arc(x,y,star.size,0,Math.PI*2);context.fill();}
    const cosY=Math.cos(yaw),sinY=Math.sin(yaw),cosX=Math.cos(pitch),sinX=Math.sin(pitch);
    const project=node=>{const x=node.x*cosY+node.z*sinY,z=-node.x*sinY+node.z*cosY,y=node.y*cosX-z*sinX,depth=node.y*sinX+z*cosX,perspective=690/(690+depth);return{x:x*perspective,y:y*perspective,z:depth,s:perspective};};
    const raw=new Map(nodes.map(node=>[node.id,project(node)])),points=[...raw.values()],xs=points.map(point=>point.x),ys=points.map(point=>point.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const plotWidth=width*.8,padX=Math.min(46,Math.max(26,width*.08)),padY=Math.min(60,Math.max(30,height*.07));
    const fit=Math.min((plotWidth-2*padX)/Math.max(1,maxX-minX),(height-2*padY)/Math.max(1,maxY-minY)),scale=fit*Math.min(1,.88+(zoom-.91)*.3),centerX=(minX+maxX)/2,centerY=(minY+maxY)/2;
    const positions=new Map([...raw].map(([id,point])=>[id,{x:plotWidth/2+(point.x-centerX)*scale,y:height/2+(point.y-centerY)*scale,z:point.z,s:point.s}]));
    const focusOf=node=>mix(focus(node,from),focus(node,to),part);
    for(const [source,targetId] of edges){const a=byId.get(source),b=byId.get(targetId),start=positions.get(source),end=positions.get(targetId),strength=Math.min(focusOf(a),focusOf(b));context.strokeStyle=`rgba(189,167,245,${.08+strength*.39})`;context.lineWidth=.7+strength*.7;context.beginPath();context.moveTo(start.x,start.y);context.lineTo(end.x,end.y);context.stroke();}
    for(const node of [...nodes].sort((a,b)=>positions.get(b.id).z-positions.get(a.id).z)){
      const point=positions.get(node.id),strength=focusOf(node),radius=(node.kind==='person'?7:node.kind==='project'?5.2:3.7)*point.s*(.8+strength*.25),color=colors[node.kind];
      context.globalAlpha=.25+strength*.75;context.shadowBlur=17*strength;context.shadowColor=color;context.fillStyle=color;context.beginPath();context.arc(point.x,point.y,radius,0,Math.PI*2);context.fill();context.shadowBlur=0;
      if(labels[Math.round(progress)].includes(node.id)&&strength>.38){context.globalAlpha=.5+strength*.5;context.fillStyle='#eeeaf7';context.font='11px system-ui, sans-serif';const right=point.x<width*.58;context.textAlign=right?'left':'right';context.fillText(node.label,point.x+(right?radius+7:-radius-7),point.y-8);}
    }
    context.globalAlpha=1;
  }
  function frame(){queued=false;if($('cosmos-welcome').hidden)return;current=reduced.matches?target:mix(current,target,.22);if(Math.abs(target-current)<.002)current=target;draw(current);if(current!==target)schedule();}
  function schedule(){if(!queued){queued=true;requestAnimationFrame(frame);}}
  function update(){const range=Math.max(1,scroll.scrollHeight-scroll.clientHeight);target=Math.max(0,Math.min(4,scroll.scrollTop/range*4));const next=Math.round(target);if(next!==active){active=next;steps.forEach((button,index)=>{if(index===active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});$('welcome-counter').textContent=`0${active+1} / 05`;$('welcome-scene-label').textContent=captions[active];$('welcome-progress-label').textContent=names[active];}
    if(document.body.classList.contains('intro-active')){const desktop=window.matchMedia('(min-width:761px)').matches,reveal=Math.max(0,Math.min(1,(target-3.5)/.5)),width=window.innerWidth<=960?Math.max(360,window.innerWidth*.47):Math.max(390,window.innerWidth*.45);document.body.style.setProperty('--intro-workflow-width',`${Math.round(width*reveal)}px`);document.body.style.setProperty('--intro-final-width',`${Math.round(width)}px`);document.body.style.setProperty('--intro-gutter',`${Math.round(12*reveal)}px`);document.body.style.setProperty('--intro-radius',`${Math.round(21*reveal)}px`);document.body.style.setProperty('--welcome-visual-share',`${(62-8*reveal).toFixed(2)}%`);document.body.classList.toggle('intro-ready',reveal>=.98);$('workflow').inert=desktop&&reveal<.98;}
    schedule();}
  function resize(){const rect=visual.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);width=rect.width;height=rect.height;visual.width=Math.max(1,Math.round(width*ratio));visual.height=Math.max(1,Math.round(height*ratio));context.setTransform(ratio,0,0,ratio,0,0);scroll.style.setProperty('--welcome-section-height',`${scroll.clientHeight}px`);update();}
  scroll.addEventListener('scroll',update,{passive:true});new ResizeObserver(resize).observe(scroll);new ResizeObserver(resize).observe(visual);
  reduced.addEventListener('change',()=>{current=target;schedule();});
  steps.forEach((button,index)=>button.addEventListener('click',()=>{const top=chapters[index].getBoundingClientRect().top-scroll.getBoundingClientRect().top+scroll.scrollTop;scroll.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});}));
  document.querySelector('a[href="#workflow"]')?.addEventListener('click',event=>{if(!document.body.classList.contains('intro-active'))return;event.preventDefault();scroll.scrollTo({top:scroll.scrollHeight,behavior:reduced.matches?'instant':'smooth'});});
  $('welcome-start').addEventListener('click',()=>{setWorkflowStage(1);$('note-text').focus();});
  resize();
}
initWelcomeTour();
