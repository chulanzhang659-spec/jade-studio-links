// Replace any source independently. position and detailPosition control the crop.
// Every visible text remains HTML, separate from these image files.
window.JADE_CONTENT = {
  images: {
    hero: {src: 'assets/editorial-hero.png', position: '50% 0%'},
    portrait: {src: 'assets/editorial-hero.png', position: '52% 0%'},
    drape: {src: 'assets/editorial-hero.png', position: '70% 46%'},
    tailoring: {src: 'assets/editorial-hero.png', position: '40% 73%'}
  },
  // Six business channels from the approved studio taxonomy. Covers are preview artwork only.
  // gallery accepts {src, alt, caption}; an empty list displays a reserved image area.
  portfolios: [
    {id:'portfolio-01',title:'ACCOUNTS',subtitle:'账号内容与运营',image:'drape',status:'PREVIEW ART',body:'Account content & operations',types:['个人博主账号','品牌账号'],tags:['时尚','潮玩','生活方式','整体运营','内容制作支持'],gallery:[]},
    {id:'portfolio-02',title:'EDITORIAL',subtitle:'内容编辑与策划',image:'tailoring',status:'PREVIEW ART',body:'Content editing & planning',types:['时尚视频','时尚图文','方案','脚本'],tags:['时尚视频','时尚图文','方案','脚本'],gallery:[]},
    {id:'portfolio-03',title:'VIDEO POST-PRODUCTION',subtitle:'视频剪辑与后期',image:'portrait',status:'PREVIEW ART',body:'Video post-production',types:['口播','访谈','Vlog','品牌短片','活动与秀场'],tags:['时尚','潮玩','美妆','生活方式','汽车','数码'],gallery:[]},
    {id:'portfolio-04',title:'BRAND STORIES',subtitle:'品牌策略与叙事',image:'hero',status:'PREVIEW ART',body:'Brand strategy & storytelling',types:['品牌故事与语言','系列与传播概念'],tags:['服装品牌','美妆品牌','生活方式品牌'],gallery:[]},
    {id:'portfolio-05',title:'DESIGN',subtitle:'设计服务',image:'tailoring',status:'PREVIEW ART',body:'Design services',types:['平面与视觉设计','服装设计','产品设计'],tags:['品牌视觉','封面与版式','画册','包装物料','系列设计','款式与图案'],gallery:[]},
    {id:'portfolio-06',title:'PORTFOLIO DESIGN',subtitle:'作品集策划与设计',image:'hero',status:'PREVIEW ART',body:'Portfolio planning & design',types:['服装作品集','产品作品集'],tags:['内容策划','项目梳理','叙事组织','排版设计','封面与版式'],gallery:[]}
  ],
  stories: {
    about: {eyebrow: 'A NOTE FROM THE STUDIO', title: 'A curious spirit.<br>A considered eye.', body: 'JADE STUDIO is an independent online fashion design studio. This journal is a place to share our work, our references, and the details that catch our eye.', note: 'More studio stories will be added here.'},
    invitation: {eyebrow: 'YOU ARE INVITED', title: 'Come a little closer.', body: 'Welcome to JADE STUDIO. Browse the journal, look at the details, and stay for a while.', note: 'An open invitation to our world of fashion.', action: 'EXPLORE SELECTED WORK ↗'},
    contact: {eyebrow: 'CORRESPONDENCE', title: 'Let’s make<br>something.', body: 'For collaborations, projects and conversations.', note: '+86 19145689058 / notjaded0119@gmail.com'},
    drape: {eyebrow: '01 / FASHION STUDY', title: 'The Drape Series', image: 'drape', body: 'A visual study of fabric in motion. Ivory folds meet a forest-green silhouette; drawn lines follow the weight and fall of the cloth.', note: 'Illustrative concept — sample imagery and copy for this first edition.'},
    tailoring: {eyebrow: '02 / DETAIL STUDY', title: 'Tailored Nostalgia', image: 'tailoring', body: 'An exploration of familiar shapes through ink, texture and proportion. A closer look at the gestures hidden in a garment.', note: 'Illustrative concept — sample imagery and copy for this first edition.'}
  }
};
