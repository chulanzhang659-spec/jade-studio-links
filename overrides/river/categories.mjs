export const CATEGORIES=[
 ['服装设计','Fashion design','从轮廓、面料到细节，记录服装的形成。'],
 ['编辑','Editorial','文字、图像与版面之间的叙事。'],
 ['策划','Creative planning','让想法找到清晰的方向与表达。'],
 ['编导','Direction','从故事与分镜，走向镜头里的表达。'],
 ['平面设计','Graphic design','在纸面、字形与构图之间展开。'],
 ['剪辑','Video post-production','用画面的连接，找到节奏与情绪。'],
 ['视觉传达','Visual communication','把概念转译为可感知的视觉语言。'],
 ['品牌策划','Brand strategy','梳理品牌的个性、声音与表达。'],
 ['直播策划','Live planning','围绕内容、现场与观看体验展开。']
].map(([label,english,description],index)=>({id:String(index+1).padStart(2,'0'),index,label,english,description,works:[]}));
