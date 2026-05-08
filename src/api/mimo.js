const API_URL = 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions'
const API_KEY = 'tp-cpqr7u4mhiubgrshpf9weub6dm397zqgfvdjes44jtv22bha'
const MODEL = 'mimo-v2.5-pro'

async function callMimo(messages, { stream = false } = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 2048,
      stream,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  if (stream) {
    return response
  }

  const data = await response.json()
  return data.choices[0].message.content
}

const LOCAL_PERSONAS = [
  {
    id: 1,
    name: '小美',
    nameEn: 'Xiaomei',
    avatar: '👩',
    expertise: '美食达人',
    expertiseEn: 'Food Expert',
    style: 'enthusiastic foodie who loves sharing hidden local restaurants',
  },
  {
    id: 2,
    name: '阿杰',
    nameEn: 'Ajie',
    avatar: '👨',
    expertise: '文化向导',
    expertiseEn: 'Culture Guide',
    style: 'history and culture enthusiast with deep knowledge of local heritage',
  },
  {
    id: 3,
    name: 'Lisa',
    nameEn: 'Lisa',
    avatar: '👩‍💼',
    expertise: '生活助手',
    expertiseEn: 'Life Helper',
    style: 'bilingual local who helps with practical tips and navigation',
  },
]

export async function getLocalResponse(persona, userMessage, chatHistory, category) {
  const personaInfo = LOCAL_PERSONAS[persona]
  const systemPrompt = `你是一个名叫"${personaInfo.name}"的上海本地人，正在通过小红书的群聊帮助一位来中国旅行的外国游客。
你的人设：${personaInfo.style}。擅长领域：${personaInfo.expertise}。

规则：
1. 用中文回复，像真实的本地人聊天一样自然、热情
2. 回复简短有用（2-4句话），像微信群聊风格
3. 可以推荐具体的地点、美食、路线
4. 适当使用emoji增加亲和力
5. 基于用户的问题和你的人设给出个性化回复
6. 如果用户问的问题不在你的擅长领域，也可以从你的角度给一些建议

用户当前关心的类别：${category || '通用旅行'}
用户当前所在位置：上海·南京西路附近`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-6).map((msg) => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: userMessage },
  ]

  const response = await callMimo(messages)
  return response
}

// Map our language codes to natural-language names the LLM will recognize.
// `translateText` accepts either a code or an already-spelled-out name.
const LANG_NAME = {
  en: 'English',
  zh: 'Chinese',
  fr: 'French',
  es: 'Spanish',
  ja: 'Japanese',
  ko: 'Korean',
}
const langName = (codeOrName) => LANG_NAME[codeOrName] || codeOrName

export async function translateText(text, fromLang, toLang) {
  const messages = [
    {
      role: 'system',
      content: `You are a translator. Translate the following ${langName(fromLang)} text to ${langName(toLang)}. Only output the translation, nothing else. Keep the tone casual and natural.`,
    },
    { role: 'user', content: text },
  ]
  return callMimo(messages)
}

// Map an English country name ("UK", "Japan"…) to "<country>人" — used so the
// Chinese guide title reads "英国人必看的…" instead of "UK 必看的…".
const NATIONALITY_ZH = {
  UK: '英国人',
  USA: '美国人',
  Japan: '日本人',
  Korea: '韩国人',
  Singapore: '新加坡人',
  Malaysia: '马来西亚人',
  Thailand: '泰国人',
  Vietnam: '越南人',
  Indonesia: '印尼人',
  Philippines: '菲律宾人',
  India: '印度人',
  Australia: '澳洲人',
  'New Zealand': '新西兰人',
  Canada: '加拿大人',
  France: '法国人',
  Germany: '德国人',
  Italy: '意大利人',
  Spain: '西班牙人',
  Portugal: '葡萄牙人',
  Netherlands: '荷兰人',
  Belgium: '比利时人',
  Switzerland: '瑞士人',
  Austria: '奥地利人',
  Sweden: '瑞典人',
  Norway: '挪威人',
  Denmark: '丹麦人',
  Finland: '芬兰人',
  Ireland: '爱尔兰人',
  Russia: '俄罗斯人',
  'Hong Kong': '香港人',
  Taiwan: '台湾人',
  Macao: '澳门人',
  China: '中国人',
}

function nationalityZh(nationality) {
  if (!nationality) return '外国人'
  return NATIONALITY_ZH[nationality] || `${nationality}人`
}

// Per-language section headers for the guide. The Markdown structure is the
// same across languages — only the headings/footer/hashtags localize.
const GUIDE_TEMPLATE = {
  en: {
    locationLabel: 'Location: Shanghai',
    audienceLabel: (nat) => `For: travelers from ${nat}`,
    sections: [
      ['🍜 Food & Restaurants', 'List specific recommendations from the chat with brief descriptions'],
      ['🗺️ Getting Around', 'Transportation tips mentioned in the chat'],
      ['⭐ Must-Visit Spots', 'Attractions and hidden gems recommended'],
      ['💡 Local Tips', 'Practical advice and insider tips from the locals'],
      ['📋 Suggested Itinerary', 'A brief suggested schedule based on all recommendations'],
    ],
    footer: '✨ Guide generated from real conversations with Shanghai locals',
    hashtags: (nat) => `#Shanghai #TravelGuide #${nat.replace(/\s+/g, '')}InShanghai #LocalTips #ChinaTravel`,
    hookExamples: (nat) => [
      `✨ Must-Read Shanghai Guide for Travelers from ${nat} — Locals Spilled Everything!`,
      `🔥 Visiting Shanghai from ${nat}? DON'T miss these locals-only spots!`,
      `💯 Tested by a traveler from ${nat}: the ULTIMATE Shanghai cheat sheet`,
    ],
  },
  zh: {
    locationLabel: '位置：上海',
    audienceLabel: (nat) => `适合：${nationalityZh(nat)}游客`,
    sections: [
      ['🍜 美食推荐', '列出聊天中推荐的具体餐厅和美食'],
      ['🗺️ 交通指南', '聊天中提到的交通建议'],
      ['⭐ 必去景点', '推荐的景点和小众打卡地'],
      ['💡 本地人贴士', '来自本地人的实用建议和内幕消息'],
      ['📋 行程建议', '基于所有推荐的简要行程安排'],
    ],
    footer: '✨ 攻略由与上海本地人的真实对话生成',
    hashtags: (nat) => `#上海 #旅行攻略 #${nationalityZh(nat)}在上海 #本地推荐 #中国旅行 #citywalk`,
    hookExamples: (nat) => {
      const n = nationalityZh(nat)
      return [
        `✨${n}必看｜上海本地人private list 全公开！`,
        `🔥${n}来上海别再走弯路！这份攻略一定要收藏`,
        `💯亲测有效｜一个${n}的上海city walk终极清单`,
      ]
    },
  },
  fr: {
    locationLabel: 'Lieu : Shanghai',
    audienceLabel: (nat) => `Pour : voyageurs de ${nat}`,
    sections: [
      ['🍜 Cuisine & Restaurants', 'Listez les recommandations précises du chat avec une brève description'],
      ['🗺️ Se déplacer', 'Conseils de transport mentionnés dans le chat'],
      ['⭐ À ne pas manquer', 'Attractions et lieux confidentiels recommandés'],
      ['💡 Conseils des locaux', 'Astuces pratiques et infos insider des locaux'],
      ['📋 Itinéraire suggéré', 'Un programme bref basé sur toutes les recommandations'],
    ],
    footer: '✨ Guide généré à partir de vraies conversations avec des locaux de Shanghai',
    hashtags: (nat) => `#Shanghai #GuideVoyage #${nat.replace(/\s+/g, '')}AShanghai #ConseilsLocaux #VoyageChine`,
    hookExamples: (nat) => [
      `✨ Guide de Shanghai à ne pas manquer pour les voyageurs de ${nat} — Les locaux ont tout révélé !`,
      `🔥 Vous venez de ${nat} à Shanghai ? Ne manquez PAS ces adresses confidentielles !`,
      `💯 Testé par un voyageur de ${nat} : LE guide ultime de Shanghai`,
    ],
  },
  es: {
    locationLabel: 'Ubicación: Shanghái',
    audienceLabel: (nat) => `Para: viajeros de ${nat}`,
    sections: [
      ['🍜 Comida & Restaurantes', 'Lista recomendaciones específicas del chat con descripción breve'],
      ['🗺️ Cómo moverse', 'Consejos de transporte mencionados en el chat'],
      ['⭐ Imprescindibles', 'Atracciones y rincones secretos recomendados'],
      ['💡 Tips de locales', 'Consejos prácticos e información de primera mano'],
      ['📋 Itinerario sugerido', 'Un breve plan basado en todas las recomendaciones'],
    ],
    footer: '✨ Guía generada a partir de conversaciones reales con locales de Shanghái',
    hashtags: (nat) => `#Shanghái #GuíaDeViaje #${nat.replace(/\s+/g, '')}EnShanghái #ConsejosLocales #ViajeChina`,
    hookExamples: (nat) => [
      `✨ Guía imprescindible de Shanghái para viajeros de ${nat} — ¡Los locales lo cuentan todo!`,
      `🔥 ¿Vienes a Shanghái desde ${nat}? ¡NO te pierdas estos rincones de locales!`,
      `💯 Probado por un viajero de ${nat}: la guía DEFINITIVA de Shanghái`,
    ],
  },
  ja: {
    locationLabel: '場所：上海',
    audienceLabel: (nat) => `対象：${nat}からの旅行者`,
    sections: [
      ['🍜 グルメ & レストラン', 'チャットで挙がった具体的なおすすめを簡単な説明とともに'],
      ['🗺️ 移動手段', 'チャットで触れられた交通のヒント'],
      ['⭐ 必見スポット', 'おすすめの観光地と隠れた名所'],
      ['💡 現地人のコツ', '現地の人ならではの実用的なアドバイス'],
      ['📋 おすすめプラン', 'すべてのおすすめを踏まえた簡単なスケジュール'],
    ],
    footer: '✨ 上海の現地の人とのリアルな会話から生成されたガイド',
    hashtags: (nat) => `#上海 #旅行ガイド #${nat.replace(/\s+/g, '')}の上海旅 #現地のコツ #中国旅行`,
    hookExamples: (nat) => [
      `✨${nat}の旅人必見｜上海現地人だけが知る私的リスト大公開！`,
      `🔥${nat}から上海に行くなら、この現地人スポットは絶対外せない！`,
      `💯${nat}の旅人がガチで検証｜上海の決定版チートシート`,
    ],
  },
  ko: {
    locationLabel: '장소: 상하이',
    audienceLabel: (nat) => `대상: ${nat}에서 온 여행자`,
    sections: [
      ['🍜 맛집 & 음료', '채팅에서 추천된 구체적인 곳을 간단한 설명과 함께 정리'],
      ['🗺️ 이동 정보', '채팅에서 언급된 교통 팁'],
      ['⭐ 필수 방문지', '추천된 관광지와 숨은 명소'],
      ['💡 현지인 꿀팁', '현지인만 아는 실용적인 조언'],
      ['📋 추천 일정', '모든 추천을 토대로 한 간단 일정'],
    ],
    footer: '✨ 상하이 현지인과의 실제 대화에서 생성된 가이드',
    hashtags: (nat) => `#상하이 #여행가이드 #${nat.replace(/\s+/g, '')}의상하이 #현지인꿀팁 #중국여행`,
    hookExamples: (nat) => [
      `✨${nat} 여행자 필독｜상하이 현지인만 아는 시크릿 리스트 대공개!`,
      `🔥${nat}에서 상하이 가시나요? 이 현지인 스폿은 절대 놓치지 마세요!`,
      `💯${nat} 여행자 인증｜상하이 끝판왕 가이드`,
    ],
  },
}

export async function generateGuide(
  chatMessages,
  categoryOrCategories,
  lang = 'en',
  nationality = 'UK',
) {
  // Accept either a single string (legacy) or an array of category keys.
  const categories = Array.isArray(categoryOrCategories)
    ? categoryOrCategories
    : [categoryOrCategories || 'food']
  const categoryLabel = categories.join(', ') || 'General Travel'

  const chatContent = chatMessages
    .map((msg) => {
      const sender = msg.isUser ? 'Tourist' : msg.senderName
      return `${sender}: ${msg.text}`
    })
    .join('\n')

  // Resolve the localized template (fall back to English for unknown codes).
  const tpl = GUIDE_TEMPLATE[lang] || GUIDE_TEMPLATE.en
  const sectionsBlock = tpl.sections
    .map(([heading, hint]) => `## ${heading}\n[${hint}]`)
    .join('\n\n')
  const hooks = tpl.hookExamples(nationality).map((h) => `  - "${h}"`).join('\n')
  // The audience token is what the model is told to weave into the title.
  const audienceToken = lang === 'zh' ? nationalityZh(nationality) : nationality

  // The system prompt is always written in English (clearer to the model),
  // but it instructs the model to generate everything in `targetLanguage`.
  const systemPrompt = `You are a Xiaohongshu/Little Red Book viral content creator writing a Shanghai travel guide for a tourist from ${nationality}, based on a real group-chat conversation with Shanghai locals.

CRITICAL: Write the ENTIRE guide — title, headers, body, hashtags, footer — in **${langName(lang)}**. Do not output any other language.

The TITLE must follow Xiaohongshu's hook-y, slightly hype, marketing style — punchy, with emojis, naturally weaving in the tourist's home country ("${audienceToken}") so it feels personal and clickable. Examples of the vibe (translate or adapt to ${langName(lang)}):
${hooks}
Make the title feel like a Xiaohongshu post — not a generic travel article.

Format your response EXACTLY as follows (use these EXACT localized headers, do NOT translate them differently):

# [Xiaohongshu-style hook title in ${langName(lang)} that includes "${audienceToken}"]

📍 ${tpl.locationLabel}  |  👤 ${tpl.audienceLabel(nationality)}

${sectionsBlock}

---
${tpl.footer}
🏷️ ${tpl.hashtags(nationality)}

Keep the body informative and engaging. Use emojis naturally. 2-4 bullet points per section with specific, actionable info from the chat. Sprinkle in light marketing-style adjectives (equivalent of "hidden gem", "must-try", "insider", "don't miss" in ${langName(lang)}) but stay grounded in the chat content.`

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Here is the group chat conversation:\n\n${chatContent}\n\nCategory focus: ${categoryLabel}\nTourist nationality: ${nationality}\nTarget output language: ${langName(lang)}`,
    },
  ]

  return callMimo(messages)
}

export { LOCAL_PERSONAS }
