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

export async function translateText(text, fromLang, toLang) {
  const messages = [
    {
      role: 'system',
      content: `You are a translator. Translate the following ${fromLang} text to ${toLang}. Only output the translation, nothing else. Keep the tone casual and natural.`,
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

  const natZh = nationalityZh(nationality)

  const systemPrompt = lang === 'en'
    ? `You are a Xiaohongshu/Little Red Book viral content creator writing a Shanghai travel guide for a tourist from ${nationality}, based on a real group-chat conversation with Shanghai locals.

The TITLE must follow Xiaohongshu's hook-y, slightly hype, marketing style — punchy, with emojis, mentioning the tourist's home country so it feels personal and clickable. Examples of the vibe:
  - "✨ Must-Read Shanghai Guide for Travelers from ${nationality} — Locals Spilled Everything!"
  - "🔥 Visiting Shanghai from ${nationality}? DON'T miss these locals-only spots!"
  - "💯 Tested by a tourist from ${nationality}: the ULTIMATE Shanghai cheat sheet"
Make the title feel like a Xiaohongshu post — not a generic travel article.

Format your response EXACTLY as follows (use these exact headers):

# [Xiaohongshu-style hook title that includes "${nationality}"]

📍 Location: Shanghai  |  👤 For: travelers from ${nationality}

## 🍜 Food & Restaurants
[List specific recommendations from the chat with brief descriptions]

## 🗺️ Getting Around
[Transportation tips mentioned in the chat]

## ⭐ Must-Visit Spots
[Attractions and hidden gems recommended]

## 💡 Local Tips
[Practical advice and insider tips from the locals]

## 📋 Suggested Itinerary
[A brief suggested schedule based on all recommendations]

---
✨ Guide generated from real conversations with Shanghai locals
🏷️ #Shanghai #TravelGuide #${nationality}InShanghai #LocalTips #ChinaTravel #Citywalk

Keep the body informative and engaging. Use emojis naturally. 2-4 bullet points per section with specific, actionable info from the chat. Sprinkle in light marketing-style adjectives ("hidden gem", "must-try", "insider", "don't miss") but stay grounded in the chat content.`
    : `你是一个小红书爆款攻略博主，正在为一位${natZh}游客写一份上海旅行攻略，内容基于他和上海本地人的群聊对话。

【标题要求】必须是小红书爆款风格——带emoji、有钩子感、营销味浓、明确写出游客国籍让人感觉"就是写给我的"。例如：
  - "✨${natZh}必看｜上海本地人private list 全公开！"
  - "🔥${natZh}来上海别再走弯路！这份攻略一定要收藏"
  - "💯亲测有效｜一个${natZh}的上海city walk终极清单"
标题要像小红书笔记的标题，不要像普通旅游博客。

格式要求（严格使用以下标题）：

# [小红书爆款风格标题，必须包含"${natZh}"]

📍 位置：上海  |  👤 适合：${natZh}游客

## 🍜 美食推荐
[列出聊天中推荐的具体餐厅和美食]

## 🗺️ 交通指南
[聊天中提到的交通建议]

## ⭐ 必去景点
[推荐的景点和小众打卡地]

## 💡 本地人贴士
[来自本地人的实用建议和内幕消息]

## 📋 行程建议
[基于所有推荐的简要行程安排]

---
✨ 攻略由与上海本地人的真实对话生成
🏷️ #上海 #旅行攻略 #${natZh}在上海 #本地推荐 #中国旅行 #citywalk

正文要信息丰富、有趣、排版整洁，每个部分2-4个要点，结合聊天中的具体信息。可以适当用"私藏"、"必去"、"绝绝子"、"避雷"、"姐妹们"这种小红书风格的词，但内容要真实贴合聊天。`

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Here is the group chat conversation:\n\n${chatContent}\n\nCategory focus: ${categoryLabel}\nTourist nationality: ${nationality}`,
    },
  ]

  return callMimo(messages)
}

export { LOCAL_PERSONAS }
