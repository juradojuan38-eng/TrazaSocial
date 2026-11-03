/* ---------- Datos ---------- */
const docs=[
{name:'Informe de gastos — T3',type:'PDF',size:'2,4 MB',project:'Agua para todos',category:'Público',state:'Por revisar',summary:'El informe presenta gastos generales del tercer trimestre para el proyecto Agua para todos. Antes de publicarlo, la persona auditora debe comprobar que no incluya datos personales, cuentas bancarias ni información protegida.'},
{name:'Convenio de colaboración',type:'PDF',size:'1,1 MB',project:'Escuelas en red',category:'Interno',state:'Resguardado',summary:'Documento de coordinación entre participantes del proyecto. Se mantiene en el archivo interno hasta confirmar qué partes, si las hubiera, pueden compartirse públicamente.'},
{name:'Acta de seguimiento',type:'DOC',size:'850 KB',project:'Plaza comunitaria',category:'Público',state:'Publicado',summary:'Acta de seguimiento que describe el estado general del proyecto y las tareas realizadas. La versión pública debe haber sido revisada para evitar divulgar información protegida.'},
{name:'Nómina de beneficiarios',type:'PDF',size:'760 KB',project:'Agua para todos',category:'Confidencial',state:'Resguardado',summary:'El nombre del archivo sugiere que podría contener datos personales de beneficiarios. Debe permanecer protegido y no publicarse como documento público.'}
];
const projects=[
{name:'Agua para todos',area:'Infraestructura',base:8,amount:'$4,2 M',desc:'El proyecto busca mejorar el acceso al agua en la comunidad. Los informes aprobados permiten consultar avances y gastos generales.'},
{name:'Escuelas en red',area:'Educación',base:6,amount:'$2,8 M',desc:'La iniciativa acompaña mejoras educativas. La información pública muestra el avance general, sin exponer datos personales.'},
{name:'Plaza comunitaria',area:'Espacios públicos',base:4,amount:'$1,6 M',desc:'El proyecto contempla mejorar un espacio compartido. La ciudadanía puede consultar los informes que fueron validados.'}
];
let fileChosen=null,current='dashboard';
const labels={dashboard:'Panel principal',documents:'Documentos',review:'Revisión humana',projects:'Proyectos sociales',public:'Vista ciudadana',settings:'Configuración'};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Componentes ---------- */
function badge(cat){return `<span class="status ${cat==='Público'?'public':cat==='Interno'?'internal':'conf'}">${esc(cat)}</span>`}
function stateBadge(s){let c=s==='Publicado'?'public':s==='Resguardado'?'internal':'review';return `<span class="status ${c}">${esc(s)}</span>`}
function row(d){return `<tr><td><div class="docname"><div class="fileico">${esc(d.type)}</div><div><b>${esc(d.name)}</b><small>${esc(d.type)} · ${esc(d.size)}</small></div></div></td><td>${esc(d.project)}</td><td>${badge(d.category)}</td><td>${stateBadge(d.state)}</td><td><button class="rowaction reviewdoc" data-name="${esc(d.name)}">···</button></td></tr>`}
function docCount(p){return p.base+docs.filter(d=>d.added&&d.project===p.name).length}
function projRow(p){return `<div class="projectrow"><div><strong>${esc(p.name)}</strong><small>${esc(p.area)} · ${docCount(p)} documentos</small></div><span class="amount">${esc(p.amount)}</span></div>`}
function toast(msg){$('toastHost').innerHTML=`<div class="toast">${esc(msg)}</div>`;setTimeout(()=>$('toastHost').innerHTML='',3000)}
function closeModal(){$('modalHost').innerHTML=''}

/* ---------- Render ---------- */
function render(){
 const pending=docs.filter(d=>d.state==='Por revisar'),published=docs.filter(d=>d.state==='Publicado'),hidden=docs.filter(d=>d.state==='Resguardado');
 const extra=Math.max(0,docs.length-4),approved=86+published.length-1,prot=39+hidden.length-3;
 $('docRows').innerHTML=docs.slice(0,4).map(row).join('');
 const f=$('filterStatus').value;
 $('allDocRows').innerHTML=docs.filter(d=>f==='all'||d.category===f).map(row).join('')||'<tr><td colspan="5" class="empty">No hay documentos en esta categoría.</td></tr>';
 $('pendingCount').textContent=$('projectPending').textContent=pending.length;
 $('processedCount').textContent=128+extra;
 $('approvedCount').textContent=$('publicCount').textContent=$('projPublic').textContent=approved;
 $('protectedCount').textContent=$('projProtected').textContent=prot;
 $('pillDocs').textContent=12+extra;$('pillReview').textContent=pending.length;
 $('projCount').textContent=$('pubProjects').textContent=projects.length;
 $('featuredProjects').innerHTML=projects.slice(0,3).map(projRow).join('')+'<p style="font-size:9px;color:#9aa7ac;margin:10px 0 0">Montos ilustrativos para la demostración.</p>';
 $('projectList').innerHTML=projects.map(projRow).join('');
 $('publicList').innerHTML=projects.map(p=>`<div class="projectrow"><div><strong>${esc(p.name)}</strong><small>${esc(p.desc)}</small></div><span class="status public">Público</span></div>`).join('');
 $('publicDocs').innerHTML=published.length?published.map(d=>`<div class="projectrow"><div><strong>${esc(d.name)}</strong><small>${esc(d.project)} · ${esc(d.type)} · ${esc(d.size)}</small></div><span class="status public">Publicado</span></div>`).join(''):'<div class="empty">Todavía no hay documentos publicados.</div>';
 $('reviewList').innerHTML=pending.length?pending.map(d=>`<div style="padding:20px 24px;border-top:1px solid #e8e5e0;display:flex;justify-content:space-between;gap:20px;align-items:center;flex-wrap:wrap"><div><div class="docname"><div class="fileico">${esc(d.type)}</div><div><b>${esc(d.name)}</b><small>${esc(d.project)} · Propuesta IA: ${esc(d.category)}</small></div></div><p style="font-size:11px;line-height:1.6;color:var(--muted);max-width:600px;margin:12px 0 0">${esc(d.summary)}</p></div><button class="primary reviewdoc" data-name="${esc(d.name)}">Revisar documento</button></div>`).join(''):'<div class="empty">No hay documentos pendientes. ¡Todo revisado!</div>';
 bindReview();
}

/* ---------- Navegación ---------- */
function navigate(page){current=page;document.querySelectorAll('.pageview').forEach(v=>v.classList.toggle('active',v.id===page));document.querySelectorAll('.nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('crumb').textContent=labels[page]||page;render()}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.goto)));

/* ---------- Cargar documento ---------- */
function openUpload(){fileChosen=null;
 $('modalHost').innerHTML=`<div class="modalback" id="backdrop"><div class="modal"><h2>Cargar documento</h2><p>Incorporá un archivo para que la IA proponga una clasificación. La propuesta siempre necesita revisión humana.</p><div class="dropzone"><div class="uploadico">⇧</div><strong id="fileLabel">Seleccioná un archivo para comenzar</strong><small>PDF, DOC, DOCX o TXT · Demostración local</small><div style="margin-top:14px"><label class="secondary" for="fileInput" style="display:inline-block;cursor:pointer">Elegir archivo</label><input id="fileInput" type="file" accept=".pdf,.doc,.docx,.txt" style="display:none"></div></div><label class="field">Proyecto asociado<select id="projectSelect">${projects.map(p=>`<option>${esc(p.name)}</option>`).join('')}</select></label><div class="modalactions"><button class="secondary" id="cancelModal">Cancelar</button><button class="primary" id="processBtn">Analizar documento</button></div></div></div>`;
 $('cancelModal').onclick=closeModal;
 $('backdrop').addEventListener('click',e=>{if(e.target.id==='backdrop')closeModal()});
 $('fileInput').onchange=e=>{fileChosen=e.target.files[0];if(fileChosen)$('fileLabel').textContent=fileChosen.name};
 $('processBtn').onclick=processFile}
function processFile(){
 if(!fileChosen){toast('Elegí un archivo para continuar.');return}
 const name=fileChosen.name,type=name.toLowerCase().endsWith('.pdf')?'PDF':'DOC',project=$('projectSelect').value,size=(fileChosen.size/1024/1024).toFixed(2)+' MB';
 let cat='Público';
 if(/nomina|nómina|beneficiar|dni|datos personales|salud/i.test(name))cat='Confidencial';
 else if(/convenio|borrador|interno|contrato/i.test(name))cat='Interno';
 docs.unshift({name,type,size,project,category:cat,state:'Por revisar',added:true,summary:'Clasificación preliminar simulada según el nombre del archivo. No se ha analizado realmente su contenido. Una persona responsable debe revisar el documento completo antes de tomar una decisión.'});
 closeModal();navigate('review');toast('Documento agregado a la cola de revisión. La clasificación es simulada.')}
$('uploadBtn').onclick=openUpload;$('uploadBtn2').onclick=openUpload;$('filterStatus').onchange=render;

/* ---------- Revisión humana ---------- */
function bindReview(){document.querySelectorAll('.reviewdoc').forEach(b=>b.onclick=()=>openReview(b.dataset.name))}
function openReview(name){const d=docs.find(x=>x.name===name);if(!d)return;
 $('modalHost').innerHTML=`<div class="modalback" id="reviewBackdrop"><div class="modal"><div class="eyebrow">REVISIÓN HUMANA</div><h2 style="margin-top:8px">${esc(d.name)}</h2><p>${esc(d.project)} · La categoría de la IA es solo una recomendación.</p><div class="detailbox"><small>Resumen preliminar</small><p>${esc(d.summary)}</p></div><div style="font-size:11px;color:var(--muted);margin-bottom:8px">Clasificación propuesta: ${badge(d.category)}</div><label class="field">Categoría confirmada por la persona responsable<select id="reviewCategory">${['Público','Interno','Confidencial'].map(c=>`<option ${d.category===c?'selected':''}>${c}</option>`).join('')}</select></label><p style="font-size:10px;color:#9a7770">Importante: en una app real, antes de aprobar como público se debe comprobar que el archivo no contenga información personal o protegida.</p><div class="modalactions"><button class="secondary" id="closeReview">Cancelar</button><button class="primary" id="confirmReview">Confirmar decisión</button></div></div></div>`;
 $('closeReview').onclick=closeModal;
 $('reviewBackdrop').onclick=e=>{if(e.target.id==='reviewBackdrop')closeModal()};
 $('confirmReview').onclick=()=>{const cat=$('reviewCategory').value;d.category=cat;d.state=cat==='Público'?'Publicado':'Resguardado';closeModal();render();toast(cat==='Público'?'Aprobado como público en esta demostración.':'Documento resguardado; no aparece en la vista ciudadana.')}}

/* ---------- Nuevo proyecto ---------- */
$('newProject').onclick=()=>{
 $('modalHost').innerHTML=`<div class="modalback" id="pBackdrop"><div class="modal"><h2>Nuevo proyecto</h2><p>Agregá un proyecto social de ejemplo para asociarle documentos.</p><label class="field">Nombre<input id="pName" placeholder="Ej: Huertas barriales"></label><label class="field">Área<input id="pArea" placeholder="Ej: Ambiente"></label><label class="field">Monto (ilustrativo)<input id="pAmount" placeholder="Ej: $1,2 M"></label><div class="modalactions"><button class="secondary" id="pCancel">Cancelar</button><button class="primary" id="pSave">Crear proyecto</button></div></div></div>`;
 $('pCancel').onclick=closeModal;
 $('pBackdrop').onclick=e=>{if(e.target.id==='pBackdrop')closeModal()};
 $('pSave').onclick=()=>{const name=$('pName').value.trim();if(!name){toast('Escribí un nombre para el proyecto.');return}
  if(projects.some(p=>p.name.toLowerCase()===name.toLowerCase())){toast('Ya existe un proyecto con ese nombre.');return}
  projects.push({name,area:$('pArea').value.trim()||'Sin área',base:0,amount:$('pAmount').value.trim()||'$0',desc:'Proyecto en seguimiento. La información pública se muestra una vez revisada por una persona.'});
  closeModal();render();toast('Proyecto creado.')}};

/* ---------- Botones varios ---------- */
$('helpBtn').onclick=()=>toast('TrazaSocial organiza documentos; la IA propone una categoría y una persona decide.');
$('notifBtn').onclick=()=>{navigate('review');toast('Mostrando documentos pendientes de revisión.')};
$('saveSettings').onclick=()=>toast('Preferencias de demostración guardadas en pantalla.');
render();
