export function safeURL(value){
 if(typeof value!=='string'||!value.trim())return '';
 const url=value.trim();
 if(/[\u0000-\u0020\u007f\\]/.test(url)||url.startsWith('//'))return '';
 if(/^[a-z][a-z\d+.-]*:/i.test(url)&&!/^https?:\/\//i.test(url))return '';
 try{const parsed=new URL(url,'https://jade.invalid/');return ['http:','https:'].includes(parsed.protocol)?url:'';}catch{return '';}
}

export function selectGroups(projects,category){
 if(!category)return [];
 const groups=new Map((category.types||[]).map(name=>[name,[]]));
 for(const project of projects||[]){
  if(!project.categories?.includes(category.id))continue;
  const name=project.secondary?.[category.id]||'其他作品';
  if(!groups.has(name))groups.set(name,[]);
  groups.get(name).push(project);
 }
 return [...groups].filter(([,items])=>items.length).map(([name,items])=>({name,projects:items}));
}

export function resolveType(groups,requested){
 const names=groups.map(group=>group.name);
 const legacy={'视频脚本':'脚本','图文与专题':'时尚图文','文章概览':'时尚图文','栏目与系列策划':'方案'};
 if(names.includes(legacy[requested]))return legacy[requested];
 if(names.includes(requested))return requested;
 return groups.find(group=>group.projects.length)?.name||names[0]||'';
}

export function catalogURL(projectId,type,topic=''){
 const params=new URLSearchParams({project:projectId});
 if(type)params.set('type',type);
 if(topic)params.set('topic',topic);
 if(typeof location!=='undefined')for(const key of ['check','frame','preview','view']){
  const value=new URLSearchParams(location.search).get(key);if(value!==null)params.set(key,value);
 }
 return 'work.html?'+params.toString();
}

function element(tag,text,className){
 const node=document.createElement(tag);
 if(text!==undefined&&text!==null)node.textContent=text;
 if(className)node.className=className;
 return node;
}

function slug(value){return encodeURIComponent(value).replace(/%/g,'-').toLowerCase();}

export function imageLoading(kind){return kind==='preview'?'eager':'lazy';}

export function displayTitle(project,category){
 if(project.displayTitle)return project.displayTitle;
 const title=project.title||'作品项目';if(title.includes('｜'))return title;
 const categoryId=category?.id||project.categories?.[0],type=categoryId?project.secondary?.[categoryId]:'';
 return type?`${type}｜${title}`:title;
}

function mediaFor(project,title){
 const figure=element('figure',null,'catalog-media');
 const video=safeURL(project.video);
 if(video){
  const player=element('video');
  player.src=video;player.controls=true;player.preload='metadata';player.playsInline=true;
  const poster=safeURL(project.poster||project.preview);if(poster)player.poster=poster;
  player.setAttribute('aria-label',`${title}，点击播放`);figure.append(player);return figure;
 }
 const preview=safeURL(project.preview||(project.images||[])[0]);
 if(preview){
  const image=element('img');image.src=preview;image.alt=title;image.loading=imageLoading('preview');image.decoding='async';
  image.style.objectPosition=project.mediaPosition||'50% 50%';
  image.style.objectFit=project.mediaFit||'cover';figure.append(image);return figure;
 }
 const fallback=element('div',title,'catalog-cover-fallback');fallback.setAttribute('role','img');fallback.setAttribute('aria-label',title);figure.append(fallback);return figure;
}

function projectCard(project,index,category){
 const article=element('article',null,'catalog-project');article.dataset.projectId=project.id;
 const title=displayTitle(project,category);
 article.append(mediaFor(project,title));
 const copy=element('div',null,'catalog-copy');
 copy.append(element('p',`${String(index+1).padStart(2,'0')} / PROJECT OVERVIEW`,'catalog-index'));
 copy.append(element('h3',title,'catalog-title'));
 if(project.role)copy.append(element('p',project.role,'catalog-role'));
 if(project.summary)copy.append(element('p',project.summary,'catalog-summary'));
 const extra=[...(project.images||[])].map(safeURL).filter(Boolean).filter(src=>src!==safeURL(project.preview));
 if(extra.length){
  const details=element('details',null,'catalog-images');details.append(element('summary','查看完整图集'));
  for(const src of extra){const image=element('img');image.src=src;image.alt=`${title} 项目图片`;image.loading=imageLoading('gallery');details.append(image);}
  copy.append(details);
 }
 const url=safeURL(project.url);
 if(url){const link=element('a',project.sourceLabel||'查看原作 ↗','catalog-source');link.href=url;link.target='_blank';link.rel='noopener noreferrer';copy.append(link);}
 const accountURL=safeURL(project.accountURL);
 if(accountURL){const link=element('a',project.accountLabel||'小红书主页 ↗','catalog-source');link.href=accountURL;link.target='_blank';link.rel='noopener noreferrer';copy.append(link);}
 article.append(copy);return article;
}

export function topicsFor(group,category){
 const topics=new Map();
 for(const project of group.projects){
  const topic=project.topics?.[category.id]||project.topic;
  if(topic)topics.set(topic,(topics.get(topic)||0)+1);
 }
 return [...topics].map(([name,count])=>({name,count}));
}

function renderProjectGrid(panel,group,category,activeTopic=''){
 panel.replaceChildren();
 const topics=topicsFor(group,category);
 const selected=topics.some(item=>item.name===activeTopic)?activeTopic:'';
 const visible=selected?group.projects.filter(project=>(project.topics?.[category.id]||project.topic)===selected):group.projects;
 const heading=element('div',null,'catalog-panel-heading');
 heading.append(element('h2',group.name,'catalog-active-title'));
 heading.append(element('p',`${visible.length} ITEMS / 作品概览`,'catalog-count'));
 panel.append(heading);
 if(topics.length){
  const filters=element('div',null,'catalog-topics');filters.setAttribute('aria-label','按内容方向筛选');
  for(const item of [{name:'全部',count:group.projects.length},...topics]){
   const button=element('button',`${item.name} ${item.count}`,'catalog-topic');button.type='button';
   button.dataset.topic=item.name==='全部'?'':item.name;
   button.setAttribute('aria-pressed',String((item.name==='全部'?'':item.name)===selected));
   filters.append(button);
  }
  panel.append(filters);
 }
 const grid=element('div',null,'catalog-grid');
 visible.forEach((project,index)=>grid.append(projectCard(project,index,category)));
 panel.append(grid);
}

function renderTabs(tabs,groups,active){
 tabs.replaceChildren(...groups.map((group,index)=>{
  const button=element('button',group.name,'catalog-tab');button.type='button';button.id='tab-'+slug(group.name);button.role='tab';
  button.dataset.type=group.name;button.setAttribute('aria-selected',String(group.name===active));button.setAttribute('aria-controls','catalog-panel');
  button.tabIndex=group.name===active?0:-1;button.setAttribute('aria-label',`${group.name}，${group.projects.length} 个项目`);
  button.style.setProperty('--tab-index',index);return button;
 }));
}

// A non-interactive copy of the next NEW newspaper sits beneath the turning sheet.
export function createPaperPreview(category){
 const paper=document.querySelector('#project-catalog').cloneNode(true);
 const groups=selectGroups(window.JADE_PROJECTS,category),active=resolveType(groups,'');
 paper.querySelector('#catalog-title').textContent=category.title;
 paper.querySelector('#catalog-zh').textContent=category.subtitle;
 paper.querySelector('#catalog-deck').textContent=category.body;
 paper.querySelector('#catalog-number').textContent=`${String(window.JADE_CONTENT.portfolios.indexOf(category)+1).padStart(2,'0')} / 06`;
 renderTabs(paper.querySelector('#catalog-tabs'),groups,active);
 renderProjectGrid(paper.querySelector('#catalog-panel'),groups.find(group=>group.name===active),category);
 paper.removeAttribute('id');paper.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
 paper.querySelectorAll('video').forEach(video=>{video.preload='none';});
 paper.style.cssText='z-index:1;pointer-events:none;filter:none;transform:none;overflow:hidden';
 paper.setAttribute('aria-hidden','true');paper.inert=true;paper.classList.add('catalog-underpage');
 return paper;
}

export function mountCatalog(){
 const content=window.JADE_CONTENT,projects=window.JADE_PROJECTS||[];
 const portfolios=content?.portfolios||[];if(!portfolios.length)return;
 const params=new URLSearchParams(location.search),requested=params.get('project')||params.get('from');
 const tabs=document.querySelector('#catalog-tabs'),panel=document.querySelector('#catalog-panel');
 const title=document.querySelector('#catalog-title'),zh=document.querySelector('#catalog-zh'),deck=document.querySelector('#catalog-deck'),number=document.querySelector('#catalog-number');
 let portfolio=portfolios.find(item=>item.id===requested)||portfolios[0];
 let groups=[],active='',activeTopic='';
 const activate=(type,{replace=false,focus=false,topic=''}={})=>{
  active=resolveType(groups,type);renderTabs(tabs,groups,active);
  const group=groups.find(item=>item.name===active)||{name:active,projects:[]};
  activeTopic=topicsFor(group,portfolio).some(item=>item.name===topic)?topic:'';
  renderProjectGrid(panel,group,portfolio,activeTopic);
  panel.setAttribute('aria-labelledby','tab-'+slug(active));
  history[replace?'replaceState':'pushState']({project:portfolio.id,type:active,topic:activeTopic},'',catalogURL(portfolio.id,active,activeTopic));
  if(focus)tabs.querySelector('[aria-selected="true"]')?.focus({preventScroll:true});
  const selected=tabs.querySelector('[aria-selected="true"]');
  if(selected)tabs.scrollLeft=Math.max(0,selected.offsetLeft-tabs.offsetLeft-(tabs.clientWidth-selected.offsetWidth)/2);
 };
 const renderPortfolio=(projectId,{replace=true}={})=>{
  portfolio=portfolios.find(item=>item.id===projectId)||portfolios[0];
  const portfolioIndex=portfolios.indexOf(portfolio);groups=selectGroups(projects,portfolio);
  title.textContent=portfolio.title;zh.textContent=portfolio.subtitle;deck.textContent=portfolio.body;
  number.textContent=`${String(portfolioIndex+1).padStart(2,'0')} / ${String(portfolios.length).padStart(2,'0')}`;
  document.title=`${portfolio.subtitle} — JADE STUDIO`;
  const currentParams=new URLSearchParams(location.search),isCurrent=currentParams.get('project')===portfolio.id;
  activate(isCurrent?currentParams.get('type'):'',{replace,topic:isCurrent?currentParams.get('topic'):''});
  document.querySelector('#project-catalog')?.scrollTo({top:0,behavior:'instant'});
 };
 tabs.addEventListener('click',event=>{const button=event.target.closest('.catalog-tab');if(button)activate(button.dataset.type);});
 panel.addEventListener('click',event=>{
  const button=event.target.closest('.catalog-topic');if(!button||!panel.contains(button))return;
  activate(active,{topic:button.dataset.topic});
 });
 tabs.addEventListener('keydown',event=>{
  const buttons=[...tabs.querySelectorAll('.catalog-tab')],current=buttons.indexOf(document.activeElement);if(current<0)return;
  let next=current;if(event.key==='ArrowRight')next=(current+1)%buttons.length;else if(event.key==='ArrowLeft')next=(current-1+buttons.length)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;
  event.preventDefault();activate(buttons[next].dataset.type,{focus:true});
 });
 addEventListener('popstate',()=>renderPortfolio(new URLSearchParams(location.search).get('project'),{replace:true}));
 addEventListener('jade:portfoliochange',event=>renderPortfolio(event.detail?.projectId,{replace:true}));
 renderPortfolio(portfolio.id,{replace:true});
}

if(typeof document!=='undefined')mountCatalog();
