// Common countries / regions, ordered by rough Xiaohongshu inbound-tourist
// frequency (large East-Asia + EN-speaking + EU markets first), then the rest.
//
// Each entry: { code, flag, name, zh }
//   - `name` — country name in English (e.g. "China", "UK", "USA", "Japan").
//             Used in the welcome message ("I'm from <name>") and as the
//             nationality token piped through to Guide/Publish prompts.
//   - `zh`   — country/region name in Chinese, used in the zh UI.
//   - `code` — ISO-3166 alpha-2; stable identity for selection.
export const COUNTRIES = [
  { code: 'GB', flag: '🇬🇧', name: 'UK', zh: '英国' },
  { code: 'US', flag: '🇺🇸', name: 'USA', zh: '美国' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan', zh: '日本' },
  { code: 'KR', flag: '🇰🇷', name: 'Korea', zh: '韩国' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore', zh: '新加坡' },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia', zh: '马来西亚' },
  { code: 'TH', flag: '🇹🇭', name: 'Thailand', zh: '泰国' },
  { code: 'VN', flag: '🇻🇳', name: 'Vietnam', zh: '越南' },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia', zh: '印尼' },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines', zh: '菲律宾' },
  { code: 'IN', flag: '🇮🇳', name: 'India', zh: '印度' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', zh: '澳大利亚' },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand', zh: '新西兰' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', zh: '加拿大' },
  { code: 'FR', flag: '🇫🇷', name: 'France', zh: '法国' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany', zh: '德国' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy', zh: '意大利' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain', zh: '西班牙' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal', zh: '葡萄牙' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands', zh: '荷兰' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgium', zh: '比利时' },
  { code: 'CH', flag: '🇨🇭', name: 'Switzerland', zh: '瑞士' },
  { code: 'AT', flag: '🇦🇹', name: 'Austria', zh: '奥地利' },
  { code: 'SE', flag: '🇸🇪', name: 'Sweden', zh: '瑞典' },
  { code: 'NO', flag: '🇳🇴', name: 'Norway', zh: '挪威' },
  { code: 'DK', flag: '🇩🇰', name: 'Denmark', zh: '丹麦' },
  { code: 'FI', flag: '🇫🇮', name: 'Finland', zh: '芬兰' },
  { code: 'IE', flag: '🇮🇪', name: 'Ireland', zh: '爱尔兰' },
  { code: 'PL', flag: '🇵🇱', name: 'Poland', zh: '波兰' },
  { code: 'CZ', flag: '🇨🇿', name: 'Czechia', zh: '捷克' },
  { code: 'GR', flag: '🇬🇷', name: 'Greece', zh: '希腊' },
  { code: 'RU', flag: '🇷🇺', name: 'Russia', zh: '俄罗斯' },
  { code: 'UA', flag: '🇺🇦', name: 'Ukraine', zh: '乌克兰' },
  { code: 'TR', flag: '🇹🇷', name: 'Türkiye', zh: '土耳其' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE', zh: '阿联酋' },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', zh: '沙特' },
  { code: 'IL', flag: '🇮🇱', name: 'Israel', zh: '以色列' },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt', zh: '埃及' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa', zh: '南非' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil', zh: '巴西' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina', zh: '阿根廷' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico', zh: '墨西哥' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile', zh: '智利' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia', zh: '哥伦比亚' },
  { code: 'PE', flag: '🇵🇪', name: 'Peru', zh: '秘鲁' },
  { code: 'PK', flag: '🇵🇰', name: 'Pakistan', zh: '巴基斯坦' },
  { code: 'BD', flag: '🇧🇩', name: 'Bangladesh', zh: '孟加拉' },
  { code: 'LK', flag: '🇱🇰', name: 'Sri Lanka', zh: '斯里兰卡' },
  { code: 'MM', flag: '🇲🇲', name: 'Myanmar', zh: '缅甸' },
  { code: 'KH', flag: '🇰🇭', name: 'Cambodia', zh: '柬埔寨' },
  { code: 'LA', flag: '🇱🇦', name: 'Laos', zh: '老挝' },
  { code: 'MN', flag: '🇲🇳', name: 'Mongolia', zh: '蒙古' },
  { code: 'KZ', flag: '🇰🇿', name: 'Kazakhstan', zh: '哈萨克斯坦' },
  { code: 'HK', flag: '🇭🇰', name: 'Hong Kong', zh: '中国香港' },
  { code: 'TW', flag: '🇹🇼', name: 'Taiwan', zh: '中国台湾' },
  { code: 'MO', flag: '🇲🇴', name: 'Macao', zh: '中国澳门' },
  { code: 'CN', flag: '🇨🇳', name: 'China', zh: '中国' },
]

// Default seeded as if read from the user's registered phone number (demo: UK)
export const DEFAULT_COUNTRY = COUNTRIES[0]
