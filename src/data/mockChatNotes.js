// Mock Xiaohongshu posts that locals can "share" inside chat replies.
// Each turn, at least one local response gets a randomly picked note from the
// bank that matches the conversation category. Titles + bodies are provided in
// EN and ZH; other languages fall through to EN (handled by NoteViewer).

const NOTES = {
  food: [
    {
      id: 'note-food-1',
      gradient: 'from-orange-400 to-red-500',
      emoji: '🥟',
      title: { en: '8 Hidden Xiaolongbao Spots Locals LOVE', zh: '本地人私藏｜8家隐藏小笼包合集' },
      author: { en: 'Foodie Xiaomei', zh: '美食小美' },
      authorAvatar: '👩',
      likes: '3.2k',
      saves: 892,
      comments: 156,
      tags: { en: ['Shanghai', 'XLB', 'Foodie'], zh: ['上海', '小笼包', '美食打卡'] },
      authorMeta: 'Edited 2 days ago · Shanghai',
      body: {
        en: `If you only try one thing in Shanghai, make it xiaolongbao 🥟\n\n1. Jia Jia Tang Bao (佳家汤包) — Huanghe Rd. The thinnest skin, packed with broth.\n2. Lin Long Fang — Open since 1956, locals queue at 7am.\n3. De Xing Guan — Crab roe XLB ✨ October-only specialty.\n4. Yang's Fried Dumplings — Pan-fried sheng jian, crispy bottom.\n\nPro tip: bite a tiny hole, sip the broth, then eat. Don't pour it onto the spoon — that's tourist behavior 😂\n\nSave this for your trip!`,
        zh: `来上海只能吃一样的话，绝对是小笼包 🥟\n\n1. 佳家汤包｜黄河路。皮薄到透光，汤汁爆满\n2. 林笼坊｜1956 年老店，本地人 7 点就开始排\n3. 德兴馆｜蟹粉小笼 ✨ 只有十月才有的限定\n4. 小杨生煎｜底脆汁多生煎，配咖喱牛肉汤\n\nTip：先在皮上咬个小口，吸汤再吃。别倒到勺子里 —— 那是游客做法 😂\n\n姐妹们快收藏！`,
      },
    },
    {
      id: 'note-food-2',
      gradient: 'from-amber-400 to-orange-500',
      emoji: '🍜',
      title: { en: 'Best Bowl of Noodles Near Nanjing West Rd', zh: '南京西路附近最绝的一碗面' },
      author: { en: 'NoodleHunter', zh: '面条猎人' },
      authorAvatar: '🧑',
      likes: '1.8k',
      saves: 412,
      comments: 89,
      tags: { en: ['Shanghai', 'Noodles', 'Lunch'], zh: ['上海', '面食', '本地美食'] },
      authorMeta: 'Posted yesterday · Jing\'an',
      body: {
        en: `Slipped into this 30-seater spot off Wujiang Rd at 11:30am. Locals only, no English menu, no English staff — but show this photo and order ✋\n\n• Scallion oil noodles 葱油面 — ¥18, the smell hits you from the door\n• Spicy beef noodles — clean broth, zero MSG fatigue\n• Add an egg for ¥3, trust me\n\nGet here BEFORE 12 or you'll wait 40 mins. Worth it though.`,
        zh: `11:30 钻进吴江路里这家30个座位的小店。本地人居多，菜单没英文，但味道不会骗人 ✋\n\n• 葱油面｜18 块，进门就闻得到香\n• 红汤牛肉面｜清爽不齁，吃完不口渴\n• 加蛋 3 块，加就完事了\n\n12 点前到，不然要排 40 分钟。但绝对值得。`,
      },
    },
  ],

  transport: [
    {
      id: 'note-transport-1',
      gradient: 'from-blue-400 to-cyan-500',
      emoji: '🚇',
      title: { en: 'Shanghai Metro 101: Avoid these tourist traps', zh: '上海地铁出行指南｜这些坑别踩' },
      author: { en: 'CityWalker', zh: '城市漫游者' },
      authorAvatar: '🧑‍💼',
      likes: '5.4k',
      saves: 1230,
      comments: 247,
      tags: { en: ['Shanghai', 'Metro', 'TravelTips'], zh: ['上海', '地铁', '出行'] },
      authorMeta: 'Updated this week · Shanghai',
      body: {
        en: `Saved a friend ¥200 yesterday with these tips 🚇\n\n• Get the Metro QR via Alipay → Transport → Shanghai Metro. Works in seconds.\n• Line 2 connects PVG ↔ Hongqiao ↔ city center.\n• Avoid Line 1 between 8–9am, you will be a sardine.\n• Maglev is overrated — Line 2 to PVG is 1/10 the price and only 20 min slower.\n• Tap the same QR to enter AND exit. Don't lose it.\n\nSave this before you fly!`,
        zh: `昨天帮朋友省了 200 块 🚇\n\n• 支付宝 → 出行 → 上海地铁，秒开二维码，比买票快多了\n• 2 号线直通虹桥 ↔ 浦东两个机场 ↔ 市区\n• 1 号线 8-9 点千万别坐，会被挤成相片\n• 磁悬浮其实没必要，2 号线到浦东只比它慢 20 分钟，价格差 10 倍\n• 进出站扫同一个码，别关页面\n\n出门前记得收藏！`,
      },
    },
  ],

  attractions: [
    {
      id: 'note-attractions-1',
      gradient: 'from-purple-400 to-pink-500',
      emoji: '🏯',
      title: { en: 'Zhang Garden — the most photogenic alley in Shanghai', zh: '张园｜上海最出片的弄堂' },
      author: { en: 'ShanghaiSnap', zh: '上海速写' },
      authorAvatar: '📸',
      likes: '7.1k',
      saves: 2104,
      comments: 312,
      tags: { en: ['Shanghai', 'ZhangYuan', 'Photography'], zh: ['上海', '张园', '出片'] },
      authorMeta: 'Posted 3 days ago · Jing\'an',
      body: {
        en: `Zhang Garden (张园) is HALF an hour walk from Nanjing West Rd metro 🌸\n\nWhy go:\n• 1882 shikumen architecture, restored in 2022\n• Mix of luxury boutiques + indie cafés in old courtyards\n• Best photo spot: the small alley behind Dior, around 4pm golden hour\n\nSkip if: You hate crowds on weekends. Go on a Tuesday afternoon instead.\n\nFree entry, no booking needed.`,
        zh: `张园｜南京西路地铁站走半小时 🌸\n\n为什么必去：\n• 1882 年的石库门建筑群，2022 年重修开放\n• 老院子里塞着 Dior、Gucci，又有独立咖啡馆，新旧拼贴感超强\n• 最出片：Dior 后面的小弄堂，下午 4 点 magic hour 直接封神\n\n避雷：周末人挤人，强烈推荐工作日下午来\n\n免费，不用预约。`,
      },
    },
    {
      id: 'note-attractions-2',
      gradient: 'from-violet-400 to-indigo-500',
      emoji: '🌃',
      title: { en: 'The Bund at night — locals go HERE not the main strip', zh: '外滩夜景｜本地人都不去主道' },
      author: { en: 'NightOwlSh', zh: '夜上海' },
      authorAvatar: '🌙',
      likes: '4.6k',
      saves: 980,
      comments: 178,
      tags: { en: ['Bund', 'Shanghai', 'NightView'], zh: ['外滩', '上海', '夜景'] },
      authorMeta: 'Posted 1 week ago · Huangpu',
      body: {
        en: `The main Bund promenade is amazing — but it's 200% capacity at 8pm. Locals' move:\n\n• Walk to Suzhou Creek end (北外滩), 10 min north of Waitan station\n• Or cross to Pudong's Riverside Walkway — same skyline, 1/4 the people\n• Best timing: 6:30pm, blue hour right before lights peak\n\nFree. Just bring a jacket — wind off the river is no joke.`,
        zh: `外滩主道当然好看，但 8 点的人流量是真的恐怖。本地人都这么玩：\n\n• 往北走到苏州河口（北外滩），从外滩地铁站往北走 10 分钟\n• 或者过江去浦东滨江步道｜同样的天际线，1/4 的人\n• 最佳时间：6:30pm 蓝调时刻，灯刚亮天还没全黑\n\n免费。多带件外套，江边风可不饶人。`,
      },
    },
  ],

  shopping: [
    {
      id: 'note-shopping-1',
      gradient: 'from-pink-400 to-rose-500',
      emoji: '🛍️',
      title: { en: 'Shopping in Shanghai: Where locals actually go', zh: '上海购物｜本地人真正会去的地方' },
      author: { en: 'StyleNotes', zh: '风格笔记' },
      authorAvatar: '👜',
      likes: '6.3k',
      saves: 1670,
      comments: 290,
      tags: { en: ['Shopping', 'Shanghai', 'Style'], zh: ['购物', '上海', '逛街'] },
      authorMeta: 'Posted 4 days ago · Jing\'an',
      body: {
        en: `Skip the malls, hit these instead 🛍️\n\n• Anfu Lu (安福路) — Indie designers + vintage. Café-hop in between.\n• HAI 550 — Local-first concept store, brilliant home goods.\n• Tianzifang IF you want souvenirs (touristy but classic).\n• Réel Mall on West Nanjing Rd — only if it's raining.\n\nDon't buy "silk" on West Nanjing Rd street stalls. It's polyester.`,
        zh: `别去那些大商场，去这几个地方就够 🛍️\n\n• 安福路｜独立设计师 + vintage，逛累了一路咖啡馆\n• HAI 550｜本土买手店，家居用品超有品位\n• 田子坊｜如果你要带纪念品，老经典但很游客向\n• 芮欧百货｜下雨天再考虑\n\n南京西路街边摊的"丝绸"千万别买，全是涤纶。`,
      },
    },
  ],

  culture: [
    {
      id: 'note-culture-1',
      gradient: 'from-amber-400 to-yellow-500',
      emoji: '🎭',
      title: { en: 'Catch a real Pingtan show — only locals know this place', zh: '听一场地道评弹｜本地人才知道的地方' },
      author: { en: 'CultureGuide', zh: '文化向导' },
      authorAvatar: '🎶',
      likes: '2.1k',
      saves: 540,
      comments: 67,
      tags: { en: ['Culture', 'Pingtan', 'Shanghai'], zh: ['文化', '评弹', '上海'] },
      authorMeta: 'Posted 6 days ago · Huangpu',
      body: {
        en: `Forget the touristy "tea house show" — go to a Pingtan teahouse 🎶\n\n• Xiang Yang Pingtan Salon (向阳书场), Xianxia Rd\n• Sets start at 1:30pm daily, ¥30 incl. a pot of tea\n• Two performers, sanxian + pipa, telling stories in Suzhou dialect\n• Don't worry if you don't understand — it's a vibe\n\nLocals' afternoon ritual. You'll feel like you traveled in time.`,
        zh: `别去那些游客喝茶看戏的地方 —— 去真正的评弹书场 🎶\n\n• 向阳书场｜仙霞路\n• 每天 1:30pm 开始一回，30 块包一壶茶\n• 两位老师，三弦+琵琶，苏州话讲故事\n• 听不懂没关系，氛围感拉满\n\n本地老阿姨叔叔们的下午仪式，进去就像穿越了。`,
      },
    },
  ],

  others: [
    {
      id: 'note-others-1',
      gradient: 'from-slate-400 to-gray-500',
      emoji: '✨',
      title: { en: '10 things I wish I knew before visiting Shanghai', zh: '来上海之前我希望有人告诉我的10件事' },
      author: { en: 'TravelDiary', zh: '旅行日记' },
      authorAvatar: '✏️',
      likes: '8.9k',
      saves: 3200,
      comments: 421,
      tags: { en: ['Shanghai', 'TravelTips', 'FirstTime'], zh: ['上海', '旅行tips', '第一次'] },
      authorMeta: 'Updated this week · Shanghai',
      body: {
        en: `Real talk for first-timers 🚨\n\n1. Get Alipay set up BEFORE you land. Cash is basically dead.\n2. eSIM via airalo, China Travel Service. Skips Great Firewall hassles.\n3. DiDi works in English. Default to "DiDi Express" not premium.\n4. Convenience stores (FamilyMart, Lawson) are LIFE for breakfast.\n5. Toilet paper isn't always provided. Carry tissues.\n6. Shanghai is HUGE — pick one district per day or you'll burn out.\n7. Tap water — boil it. Buy bottled.\n8. The metro stops at 11pm-ish. Plan your night accordingly.\n9. October-November is the best weather window.\n10. Locals are nicer than the internet says. Just smile and use translate.`,
        zh: `第一次来上海，有些事真的很想提前告诉你 🚨\n\n1. 落地前一定先开通支付宝，现金基本死了\n2. eSIM 用 airalo 或 China Travel Service，省去翻墙麻烦\n3. 滴滴有英文版，叫 "快车"，不用打专车\n4. 全家、罗森这些便利店早餐救命\n5. 不是所有厕所都有纸，自己带\n6. 上海超级大，一天只逛一个区，别贪\n7. 自来水别直接喝，烧开或买瓶装\n8. 地铁 11 点左右收班，夜里要打车\n9. 10-11 月天气最好\n10. 本地人没网上说的那么凶，笑一下用翻译软件就够了`,
      },
    },
  ],
}

// Pick a random note for one of the user's selected categories. Falls back to
// `others` if the category isn't in the bank.
export function pickChatNote(categories) {
  const cats = Array.isArray(categories) ? categories : [categories]
  const cat = cats[Math.floor(Math.random() * cats.length)]
  const bucket = NOTES[cat] || NOTES.others
  return bucket[Math.floor(Math.random() * bucket.length)]
}
