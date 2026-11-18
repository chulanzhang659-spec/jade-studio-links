// Project-level source records. Category illustrations are not project evidence.
// Role for 花大钱 and joint ownership of MeanGirls Club confirmed by the user, 2026-11-14.
window.JADE_PROJECTS = (() => {
 const works=[];
 const jadeProjectPDF=(file)=>`https://chulanzhang659-spec.github.io/jade-portfolio/${file}.pdf`;
 const pink='https://www.rednote.com/user/profile/563c10f6c2bdeb3a41945f88';
 function add(id,author,category,type,title,role,summary,extra={}){
  works.push({id,author,categories:[category],secondary:{[category]:type},title,role,summary,...extra});
 }
 const ja=(file)=>'assets/projects/jade/'+file;
 add('jade-elfu','Jade','portfolio-01','品牌账号','ELFU','品牌整体运营','家居服品牌。',{topic:'生活方式',displayTitle:'ELFU｜品牌账号运营',preview:ja('social-elfu-upload.jpg'),mediaPosition:'50% 7%',url:'https://xhslink.cn/o/AKoo5okHUYQ'});
 add('jade-lady','Jade','portfolio-01','品牌账号','LadyS Elite 慕裁','品牌整体运营','女士西装品牌。',{topic:'时尚',displayTitle:'LadyS Elite 慕裁｜品牌账号运营',preview:ja('social-lady-upload.jpg'),mediaPosition:'50% 7%',url:'https://xhslink.cn/o/8p0kWZlNBiN'});
 // Personal accounts are ordered by follower count, highest first.
 add('jade-huadaqian','Jade','portfolio-01','个人博主账号','花大钱','内容策划与账号运营','文学、人物与生活观点内容。',{topic:'人物与生活',displayTitle:'花大钱｜账号运营',preview:ja('social-huadaqian-upload.jpg'),mediaPosition:'50% 100%',url:'https://xhslink.cn/m/15hYF0ezj8O'});
 add('pink-account','pink','portfolio-01','个人博主账号','屁可Pink','个人账号内容创作','潮玩、动漫、探店与开箱内容。',{topic:'潮玩',displayTitle:'屁可Pink｜账号运营',preview:ja('social-pink-upload.jpg'),mediaPosition:'50% 0%',url:pink});
 add('jade-ann','Jade','portfolio-01','个人博主账号','Ann的安','内容策划与账号运营','时尚、模特与个人风格内容。',{topic:'时尚',displayTitle:'Ann的安｜账号运营',preview:ja('social-ann-upload.jpg'),mediaPosition:'50% 0%',url:'https://xhslink.cn/o/5LS7J8zegow'});
 add('jade-pink-account','Jade × pink','portfolio-01','个人博主账号','MeanGirls Club','合作账号运营','时尚、穿搭、审美积累与生活方式内容。',{topic:'时尚',displayTitle:'MeanGirls Club｜账号运营',preview:ja('social-meangirls-upload.jpg'),mediaPosition:'50% 0%',url:'https://www.rednote.com/user/profile/59eec82ee8ac2b2988f3a38a'});

 add('jade-hoka','Jade','portfolio-02','脚本','HOKA × 恩利','人物内容 / 场景设计 / 视频脚本','人物短片与脚本。',{preview:ja('hoka.png'),url:ja('hoka.pdf'),sourceLabel:'查看该项目 PDF ↗'});
 add('jade-iro','Jade','portfolio-02','方案','IRO TALK','采访方案 / 分镜设计 / 内容策划','声音、城市与自我。',{preview:ja('iro.png'),url:jadeProjectPDF('iro'),sourceLabel:'查看该项目 PDF ↗'});
 add('jade-bosideng','Jade','portfolio-02','方案','BOSIDENG Paris','影像方案 / 拍摄规划 / 整体执行','Like Puff, Like Dance。',{preview:ja('bosideng.png'),url:jadeProjectPDF('bosideng'),sourceLabel:'查看该项目 PDF ↗'});
 add('jade-gucci','Jade','portfolio-02','时尚图文','GUCCI拍豪门大戏，38位戏精上演百年风云','时尚编辑','人物与时装。',{topic:'专题',preview:ja('editorial-gucci.jpg'),url:'http://xhslink.com/o/62M32HuiY6P'});
 add('jade-punk','Jade','portfolio-02','时尚图文','拜见朋克女王：背叛传统，特立独行','时尚编辑','人物与时装。',{topic:'专题',preview:ja('editorial-punk.jpg'),url:'http://xhslink.com/o/AYdYeX3JiKV'});
 add('jade-longchamp','Jade','portfolio-02','时尚图文','引领高智女性潮流，大家为什么都爱它','时尚编辑','趋势与生活。',{topic:'专题',preview:ja('editorial-longchamp.jpg'),url:'http://xhslink.com/o/1lDzrzEdlQX'});
 add('jade-slow','Jade','portfolio-02','时尚图文','快时代里的“慢”人','时尚编辑','趋势与生活。',{topic:'专题',preview:ja('editorial-slow.jpg'),url:'http://xhslink.com/o/7qKKb0aawJc'});
 const wechatArticles=[
  ['神颜天才，男女同权鼻祖丨尊重女性，推动女性进步的男人最有魅力！','推动男女平权的神颜天才。','https://mp.weixin.qq.com/s/_ZXbtuIQXTY_sVYR4Of7zg'],
  ['最火时装周盘点：谁是下一个时尚尖子生？','从时装周观察新一代设计语言与行业趋势。','https://mp.weixin.qq.com/s/V2J23TUm0CPF8cP_COggaA'],
  ['地表最强高富帅｜都是顶级豪门，择偶观差距那么大？','《全球梦幻高富帅》系列第二集，讨论人物、家族与择偶观。','https://mp.weixin.qq.com/s/aDEMLRdjvTRewDxih5TUPw'],
  ['都2023年了，Y2K风格怎么还这么迷人？','从 Blumarine 等品牌切入，回看 Y2K 风格持续流行的原因。','https://mp.weixin.qq.com/s/uAIlTLv4WqCBe4eC8HQbdA'],
  ['王菲、张曼玉、郑秀文……当年的天后们穿平价裙子也能艳压','从造型、气质与时代审美讨论经典女星的穿衣表达。','https://mp.weixin.qq.com/s/laGz80w_GYcMkfNyssELYg'],
  ['为啥文淇、倪妮、IU都穿同一件肚兜？谁赢了？','围绕白色肚兜造型，比较明星穿搭与风格表达。','https://mp.weixin.qq.com/s/IVediD1qAXPGo3grtsSdkg'],
  ['我正常吗？比起霸总帅哥，我更想嫁雷佳音、白客这样的窝囊废','以影视角色与大众审美为线索，讨论“窝囊人夫”类型的魅力。','https://mp.weixin.qq.com/s/c2CiK7_x0kuaQMm_dt_wNQ'],
  ['别人塌房他们塌床，钟楚曦候雯元在谈一种很新的恋爱','从明星关系与公众叙事切入，观察一种新的恋爱表达。','https://mp.weixin.qq.com/s/IIbUiyglH4Ibkf0H4xYJsw'],
  ['我、郭敬明、章小蕙、晚晚，去面了《Vogue》副主编','以人物画像与时尚媒体语境，展开一场虚拟职位竞逐。','https://mp.weixin.qq.com/s/v3a01ci0IDvOzQ9G4U9NDw'],
  ['暗夜蝙蝠、扑棱蛾子、棉被成精……内娱红毯已经癫成这样了','盘点红毯造型，以幽默视角分析明星礼服与审美现场。','https://mp.weixin.qq.com/s/tbRfhlWSHpGoseHbnyjfug']
 ];
 wechatArticles.forEach(([title,summary,url],index)=>add('jade-wechat-'+String(index+1).padStart(2,'0'),'Jade','portfolio-02','时尚图文',title,'时尚编辑',summary,{topic:'文章',preview:ja('wechat-'+String(index+1).padStart(2,'0')+'.jpg'),url,sourceLabel:'阅读全文 ↗'}));

 const video=(index,type,topic,title,summary,extra={})=>add('video-'+String(index).padStart(2,'0'),'','portfolio-03',type,title,'视频剪辑',summary,{topic,video:'assets/projects/video/clip-'+String(index).padStart(2,'0')+'.m4v',poster:'assets/projects/video/poster-'+String(index).padStart(2,'0')+'.jpg',...extra});
 const fashionVideo={categories:['portfolio-03','portfolio-02'],secondary:{'portfolio-03':'口播','portfolio-02':'时尚视频'}};
 video(1,'Vlog','生活','Vlog｜配镜体验','生活方式场景与体验过程剪辑 · 02:02。');
 video(2,'Vlog','美妆','Vlog｜彩妆选品','线下选品与日常场景剪辑 · 02:20。');
 video(3,'口播','时尚','口播｜人物气质与公众形象','人物气质与公众形象的时尚口播。',fashionVideo);
 video(4,'口播','时尚','口播｜设计师风格与秀场形象','设计师风格与秀场形象解读。',fashionVideo);
 video(5,'口播','时尚','口播｜人物造型与都市着装','人物造型与都市着装观察。',fashionVideo);
 video(6,'口播','时尚','口播｜时尚人物与品牌文化','时尚人物与品牌文化口播。',fashionVideo);
 video(7,'口播','时尚','口播｜单品选择与个人风格','单品选择与个人风格讨论。',fashionVideo);
 video(8,'口播','时尚','口播｜影视服装与流行文化','影视服装与流行文化观察。',fashionVideo);
 video(9,'品牌短片','汽车','品牌短片｜汽车产品','车型亮点与汽车产品体验剪辑。');
 video(10,'品牌短片','汽车','品牌短片｜汽车文化','汽车文化与品牌技术内容剪辑。');
 video(11,'品牌短片','数码','品牌短片｜数码产品','手机功能与数码产品信息剪辑。');
 video(12,'品牌短片','生活科技','品牌短片｜生活科技','个护科技与生活方式产品演示剪辑。');
 video(13,'品牌短片','美妆','品牌短片｜美妆工具','美妆工具使用与产品体验剪辑。');
 video(14,'品牌短片','美妆','品牌短片｜妆容产品','面部妆容与产品步骤内容剪辑。');
 video(15,'品牌短片','美妆','品牌短片｜创意妆容','创意妆容与视觉表达短视频剪辑。');

 const sharedRednote='https://www.xiaohongshu.com/discovery/item/6af8227c000000002a02a058?app_platform=ios&app_version=9.54.2&share_from_user_hidden=true&xsec_source=app_share&type=video&xsec_token=CB4WQwTGmU1MZQ7MYjYvjrAHYmMDkcYvXZHuskqJQym6w=&author_share=1&xhsshare=WeixinSession&shareRedId=ODs2REg9Rks2NzUyOTgwNjY1OTo7RktP&apptime=1794760189&share_id=5b0e494137d94031985740a43fd5d215&track_code=4emLndIIb5l';
 add('jade-huadaqian-interview','Jade','portfolio-03','访谈','花大钱｜未济为福','访谈内容','女性成长、自我提升与人生思考。',{topic:'人物与生活',video:ja('huadaqian-interview.m4v'),preview:ja('video-huadaqian-interview.jpg'),mediaFit:'contain',url:sharedRednote,sourceLabel:'观看小红书原视频 ↗',accountURL:'https://xhslink.cn/m/15hYF0ezj8O',accountLabel:'花大钱的小红书主页 ↗'});
 add('jade-ann-runway','Jade','portfolio-03','活动与秀场','Ann的安｜巴黎看秀日记','活动与秀场内容','巴黎时装周看秀现场与幕后记录。',{topic:'时尚',video:ja('ann-runway.m4v'),preview:ja('video-ann-runway.jpg'),mediaFit:'contain',url:sharedRednote,sourceLabel:'观看小红书原视频 ↗',accountURL:'https://xhslink.cn/o/5LS7J8zegow',accountLabel:'Ann的安的小红书主页 ↗'});

 add('jade-moution','Jade','portfolio-04','品牌故事与语言','MOUTION / 风把我们变轻','创意阐述 / 分镜脚本 / 影调与音乐','品牌影片叙事。',{topic:'品牌影片叙事',preview:ja('moution.png'),url:jadeProjectPDF('moution'),sourceLabel:'查看该项目 PDF ↗'});
 add('jade-bonjour','Jade','portfolio-04','系列与传播概念','Bonjour × Herb Live','创意概念 / 旁白 / 分镜','来自山茶花的幸福感。',{categories:['portfolio-04','portfolio-02'],secondary:{'portfolio-04':'系列与传播概念','portfolio-02':'方案'},preview:ja('bonjour.png'),url:jadeProjectPDF('bonjour'),sourceLabel:'查看该项目 PDF ↗'});
 add('jade-galenic','Jade','portfolio-04','系列与传播概念','李佳琦 × 科兰黎','内容路径 / 互动机制 / 分镜','北纬78°极地琦旅。',{categories:['portfolio-04','portfolio-02'],secondary:{'portfolio-04':'系列与传播概念','portfolio-02':'方案'},preview:ja('galenic.png'),url:jadeProjectPDF('galenic'),sourceLabel:'查看该项目 PDF ↗'});
 add('jade-shushi','Jade','portfolio-04','品牌故事与语言','疏时','品牌文案 / 产品内容策划','女装品牌文案及小红书内容。',{topic:'品牌文案',preview:ja('brand-shushi-upload.jpg'),mediaPosition:'50% 0%',url:'https://xhslink.cn/o/9FEuetal0eo'});
 add('jade-wana','Jade','portfolio-04','品牌故事与语言','WANA TRY','产品文案','女性时尚品牌集合与穿搭平台。',{topic:'品牌文案',preview:ja('brand-wana-upload.jpg'),mediaPosition:'50% 0%',url:'https://xhslink.cn/o/lgdfS2DeTC'});

 const z=(file)=>'assets/projects/zekki/'+file+'.jpg';
 const zProject=(id,type,topic,title,role,summary,pages)=>add(id,'田泽麒 / Zekki','portfolio-05',type,title,role,summary,{topic,preview:z(pages[0]),images:pages.map(z)});
 zProject('zekki-rare','服装设计','成衣系列','RARE / 复兴哲学','服装设计','2022 春夏系列。',['portfolio-18','portfolio-10','portfolio-13','portfolio-16']);
 zProject('zekki-milano','服装设计','成衣系列','RARE 2022 S/S Milano Fashion Show','系列成衣展示','米兰时装秀。',['portfolio-20','portfolio-23','portfolio-27']);
 zProject('zekki-rtw','服装设计','成衣系列','主品类成衣 · 休闲套装','服装设计','休闲套装款式与成衣。',['portfolio-29','portfolio-30','portfolio-32']);
 zProject('zekki-natural','服装设计','成衣系列','Natural Reprisal / 万物回语','服装设计','系列开发、廓形与成衣。',['portfolio-41','portfolio-42','portfolio-46']);
 zProject('zekki-hypnos','服装设计','成衣系列','A Message from Hypnos / 修普诺斯来信','服装设计','系列开发与成衣。',['portfolio-56','portfolio-54','portfolio-60']);
 zProject('zekki-knit','服装设计','配饰','SmileyWorld 针织帽','配饰设计提案','针织帽及包装延伸。',['knit-02','knit-04','knit-07']);
 zProject('zekki-hood','服装设计','配饰','SmileyWorld 一体帽','配饰设计提案','一体帽及包装延伸。',['hood-02','hood-03','hood-07']);
 zProject('zekki-towel','产品设计','产品设计','SmileyWorld × RichFlower 浴巾','产品设计提案','浴巾图案与产品效果。',['smiley-07','smiley-09','smiley-11']);
 zProject('zekki-package','平面与视觉设计','包装物料','SmileyWorld × RichFlower 包装与物料','包装设计提案','同一浴巾提案的包装延伸。',['smiley-19','smiley-15','smiley-17','smiley-21']);
 zProject('zekki-illustration','平面与视觉设计','时装插画','Fashion Illustration','时装插画','Procreate 时装表现。',['portfolio-62']);
 add('zekki-concept','田泽麒 / Zekki','portfolio-04','系列与传播概念','SmileyWorld × RichFlower 联名概念','系列概念提案','浴巾提案中的项目概述、概念及亮点。',{preview:z('smiley-01'),images:['smiley-03','smiley-04','smiley-05'].map(z)});
 // Portfolio-planning examples intentionally reuse approved source material.
 add('portfolio-design-fashion','田泽麒 / Zekki','portfolio-06','服装作品集','服装作品集｜系列梳理与版式设计','作品集策划与设计','从系列概念、廓形开发到成衣展示的完整作品集组织。',{preview:z('portfolio-18'),images:['portfolio-10','portfolio-13','portfolio-16'].map(z)});
 add('portfolio-design-product','田泽麒 / Zekki','portfolio-06','产品作品集','产品作品集｜项目梳理与提案呈现','作品集策划与设计','从产品图案、效果展示到包装延伸的完整提案呈现。',{preview:z('smiley-07'),images:['smiley-09','smiley-11','smiley-19'].map(z)});
 return works;
})();

