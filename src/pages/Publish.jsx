import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { usePostedNotes } from '../context/PostedNotesContext'
import {
  Plus,
  Camera,
  Image as ImageIcon,
  Type,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Hash,
  AtSign,
  BarChart3,
  Languages,
  MapPin,
  Lock,
  LayoutGrid,
  Settings,
} from 'lucide-react'

// Cover gradients we cycle through for the Canvas-generated covers.
// Picked to feel Xiaohongshu-ish (warm, soft, foodie/travel vibes).
const COVER_PRESETS = [
  { from: '#FF6B9D', to: '#FF2442', label: 'Pink Red' },
  { from: '#FFB37B', to: '#FF7E5F', label: 'Sunset' },
  { from: '#A18CD1', to: '#FBC2EB', label: 'Lilac' },
  { from: '#43E97B', to: '#38F9D7', label: 'Mint' },
  { from: '#FFD26F', to: '#FF8C42', label: 'Mango' },
  { from: '#5EE7DF', to: '#B490CA', label: 'Aqua' },
]

export default function Publish() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, t } = useLang()
  const { addNote } = usePostedNotes()

  const initialTitle = location.state?.title || ''
  const initialBody = location.state?.body || ''
  const nationality = location.state?.nationality || 'UK'

  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [coverDataUrl, setCoverDataUrl] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [coverText, setCoverText] = useState(initialTitle)
  const [coverPresetIdx, setCoverPresetIdx] = useState(0)
  const [posted, setPosted] = useState(false)

  const photoInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // ---- File-based cover (Photo / Camera) ----
  const onFilePicked = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCoverDataUrl(reader.result)
      setShowPicker(false)
    }
    reader.readAsDataURL(file)
    // reset so the same file can be picked again later
    e.target.value = ''
  }

  // ---- Canvas-generated text cover ----
  const generateTextCover = (text, presetIdx) => {
    const preset = COVER_PRESETS[presetIdx]
    const W = 900
    const H = 1200 // 3:4 aspect, matches Xiaohongshu cover
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, preset.from)
    grad.addColorStop(1, preset.to)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Soft white blob top-right (sticker vibe)
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.beginPath()
    ctx.arc(W - 80, 120, 200, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(120, H - 160, 260, 0, Math.PI * 2)
    ctx.fill()

    // Top tag pill — localized via t() (e.g. "✨ Shanghai Guide" / "✨ Guide de Shanghai")
    const tag = t('publish.canvasTag')
    ctx.font = 'bold 36px -apple-system, "PingFang SC", sans-serif'
    const tagW = ctx.measureText(tag).width + 60
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    roundRect(ctx, 60, 80, tagW, 70, 35)
    ctx.fill()
    ctx.fillStyle = preset.to
    ctx.textBaseline = 'middle'
    ctx.fillText(tag, 90, 80 + 35)

    // Title (auto-wrapped, big, bold, white)
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'top'
    const titleText = (text || t('publish.canvasTitleFallback')).trim()
    drawWrappedText(ctx, titleText, 60, 230, W - 120, 90, 'bold 78px -apple-system, "PingFang SC", sans-serif')

    // Bottom signature — for ZH we substitute the friendly "<country>朋友" form,
    // for everything else we use the country name directly. The template comes
    // from translations and uses {country} as the substitution slot.
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = '32px -apple-system, "PingFang SC", sans-serif'
    const countryToken = lang === 'zh' ? nationalityZhDisplay(nationality) : nationality
    const sig = t('publish.canvasSignature').replace('{country}', countryToken)
    ctx.fillText(sig, 60, H - 90)

    return canvas.toDataURL('image/png')
  }

  const handleConfirmTextCover = () => {
    const url = generateTextCover(coverText, coverPresetIdx)
    setCoverDataUrl(url)
    setShowTextEditor(false)
    setShowPicker(false)
  }

  // Pre-render a default text cover whenever the text editor opens, so the
  // user always sees a live preview to tweak from.
  const previewUrl = showTextEditor ? generateTextCover(coverText, coverPresetIdx) : null

  const handlePost = () => {
    setPosted(true)
    // Push the note into the shared store so it shows up on Home → Nearby.
    // We grab the current title/body verbatim (as the user edited them) plus
    // the cover data URL we just generated/uploaded.
    addNote({
      title: title.trim(),
      body: body.trim(),
      coverDataUrl,
      lang,
      nationality,
    })
    setTimeout(() => navigate('/'), 1400)
  }

  const canPost = title.trim() && coverDataUrl && !posted

  return (
    <>
      {/* Top bar — minimal: just a back chevron, no title (matches XHS) */}
      <div className="flex items-center justify-between px-3 py-3 bg-white shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1 text-xhs-text active:opacity-60 transition-opacity"
        >
          <ChevronLeft size={26} />
        </button>
        <div className="w-6" />
      </div>

      <div className="page-container bg-white px-4 pb-32">
        {/* Cover slots row: existing cover (if any) + add button. Reference shows
            two thumbnails side-by-side; we follow the same layout. */}
        <div className="flex gap-3">
          {coverDataUrl && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
              <img src={coverDataUrl} alt="cover" className="w-full h-full object-cover" />
              <button
                onClick={() => setCoverDataUrl(null)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <button
            onClick={() => setShowPicker(true)}
            className="w-24 h-24 rounded-xl bg-xhs-bg border border-xhs-border flex items-center justify-center text-xhs-text-secondary active:border-xhs-red active:text-xhs-red transition-colors"
          >
            <Plus size={28} strokeWidth={1.6} />
          </button>
        </div>

        {/* Title — borderless, larger and bolder, just like XHS */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('publish.titlePlaceholder')}
          maxLength={40}
          className="w-full mt-5 text-lg font-semibold text-xhs-text placeholder:text-gray-300 placeholder:font-medium focus:outline-none"
        />

        {/* Body */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('publish.bodyPlaceholder')}
          className="w-full mt-2 text-sm text-xhs-text placeholder:text-gray-300 focus:outline-none resize-none leading-relaxed"
          rows={8}
        />

        {/* Insert chips — Topic / User / Poll / Translate. Visual only for the
            demo, matching the bar at the bottom of the XHS composer. */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
          <ChipButton icon={<Hash size={14} />} label={t('publish.chip.topic')} />
          <ChipButton icon={<AtSign size={14} />} label={t('publish.chip.user')} />
          <ChipButton icon={<BarChart3 size={14} />} label={t('publish.chip.poll')} />
          <ChipButton icon={<Languages size={14} />} label={t('publish.chip.translate')} />
        </div>

        {/* Section: Tag location with mock suggestion chips */}
        <SectionRow
          icon={<MapPin size={18} />}
          label={t('publish.section.tagLocation')}
          chevron
        />
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {LOCATION_TAGS.map((tag) => (
            <button
              key={tag}
              className="shrink-0 px-3 py-1.5 rounded-full bg-xhs-bg text-xs text-xhs-text-secondary active:text-xhs-red active:bg-xhs-red-light transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Section: Public (visibility) */}
        <SectionRow icon={<Lock size={18} />} label={t('publish.section.public')} chevron />

        {/* Section: Add widgets */}
        <SectionRow icon={<LayoutGrid size={18} />} label={t('publish.section.widgets')} chevron />

        {/* Section: Advanced options */}
        <SectionRow
          icon={<Settings size={18} />}
          label={t('publish.section.advanced')}
          chevron
          last
        />
      </div>

      {/* Bottom action bar — fixed, mirrors the XHS publish page */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-xhs-border px-3 pt-3 pb-5 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-3 rounded-full border border-xhs-border text-sm text-xhs-text active:bg-xhs-bg shrink-0"
        >
          {t('publish.saveDraft')}
        </button>
        <button
          onClick={handlePost}
          disabled={!canPost}
          className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all ${
            canPost
              ? 'bg-xhs-red text-white active:scale-[0.98] shadow-lg shadow-red-200'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {posted ? (
            <span className="inline-flex items-center gap-1.5">
              <Check size={16} /> {t('publish.posted')}
            </span>
          ) : (
            t('publish.post')
          )}
        </button>
      </div>

      {/* hidden file inputs (photo / camera) */}
      <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={onFilePicked} />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onFilePicked}
      />

      {/* Cover source picker bottom sheet */}
      {showPicker && (
        <BottomSheet onClose={() => setShowPicker(false)}>
          <h3 className="text-sm font-semibold text-xhs-text mb-1">{t('publish.coverSource')}</h3>
          <p className="text-[11px] text-xhs-text-secondary mb-4">{t('publish.coverSourceHint')}</p>
          <div className="grid grid-cols-3 gap-3">
            <SourceTile
              icon={<ImageIcon size={22} />}
              label={t('publish.sourcePhoto')}
              onClick={() => photoInputRef.current?.click()}
            />
            <SourceTile
              icon={<Camera size={22} />}
              label={t('publish.sourceCamera')}
              onClick={() => cameraInputRef.current?.click()}
            />
            <SourceTile
              icon={<Type size={22} />}
              label={t('publish.sourceText')}
              onClick={() => {
                setCoverText(title || initialTitle)
                setShowTextEditor(true)
              }}
            />
          </div>
        </BottomSheet>
      )}

      {/* Canvas text-cover editor */}
      {showTextEditor && (
        <BottomSheet onClose={() => setShowTextEditor(false)} fullHeight>
          <h3 className="text-sm font-semibold text-xhs-text mb-3">{t('publish.textCoverTitle')}</h3>

          <div className="rounded-xl overflow-hidden bg-gray-100 mb-4 aspect-[3/4] max-h-72 flex items-center justify-center">
            {previewUrl && <img src={previewUrl} alt="preview" className="h-full w-auto" />}
          </div>

          <label className="block text-[11px] text-xhs-text-secondary mb-1">
            {t('publish.textCoverInputLabel')}
          </label>
          <textarea
            value={coverText}
            onChange={(e) => setCoverText(e.target.value)}
            maxLength={60}
            rows={2}
            className="w-full px-3 py-2 bg-xhs-bg border border-xhs-border rounded-lg text-sm text-xhs-text focus:outline-none focus:border-xhs-red resize-none"
          />

          <p className="text-[11px] text-xhs-text-secondary mt-3 mb-2">
            {t('publish.textCoverColor')}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COVER_PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setCoverPresetIdx(i)}
                className={`shrink-0 w-10 h-10 rounded-full border-2 transition-all ${
                  i === coverPresetIdx ? 'border-xhs-red scale-110' : 'border-white'
                }`}
                style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                aria-label={p.label}
              />
            ))}
          </div>

          <button
            onClick={handleConfirmTextCover}
            className="w-full mt-5 py-3 bg-xhs-red text-white rounded-full text-sm font-semibold active:scale-[0.98]"
          >
            {t('publish.useThisCover')}
          </button>
        </BottomSheet>
      )}
    </>
  )
}

// Mock location chips that the XHS composer suggests when you tap "Tag location".
// Visual only — picking one doesn't affect the demo's published note.
const LOCATION_TAGS = [
  '世博文化公园',
  '上海千古情景区',
  '上海世博会博物馆',
  '东浩兰生',
  '徐家汇',
  '南京西路',
  '外滩',
  '田子坊',
]

// "Topic / User / Poll / Translate" chip used above the section list.
function ChipButton({ icon, label }) {
  return (
    <button className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-xhs-bg text-xhs-text text-xs font-medium active:bg-gray-200 transition-colors">
      {icon}
      <span>{label}</span>
    </button>
  )
}

// Settings-row in the composer's section list (Tag location, Public, etc.).
function SectionRow({ icon, label, chevron, last = false }) {
  return (
    <button
      className={`w-full flex items-center gap-3 py-3.5 ${
        last ? '' : 'border-b border-xhs-border'
      } active:bg-xhs-bg transition-colors`}
    >
      <span className="text-xhs-text">{icon}</span>
      <span className="flex-1 text-left text-sm text-xhs-text">{label}</span>
      {chevron && <ChevronRight size={18} className="text-xhs-text-secondary" />}
    </button>
  )
}

function SourceTile({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 py-5 rounded-xl bg-xhs-bg border border-xhs-border hover:border-xhs-red hover:text-xhs-red text-xhs-text active:scale-95 transition-all"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  )
}

function BottomSheet({ children, onClose, fullHeight = false }) {
  // Lock background scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="absolute inset-0 z-30 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className={`relative w-full bg-white rounded-t-2xl px-5 pt-5 pb-7 ${
          fullHeight ? 'max-h-[85%] overflow-y-auto' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        {children}
      </div>
    </div>
  )
}

// ---- Canvas helpers ----

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Word-wrap text that may contain CJK (where every char can break) and Latin
// (where we break on whitespace). We tokenize by splitting CJK into single
// characters and Latin runs into words.
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, font) {
  ctx.font = font
  const tokens = []
  let buf = ''
  for (const ch of text) {
    // CJK Unified Ideographs (rough range) + CJK punctuation → flush + push as own token
    if (/[\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF]/.test(ch)) {
      if (buf) {
        tokens.push(buf)
        buf = ''
      }
      tokens.push(ch)
    } else if (ch === ' ' || ch === '\n') {
      if (buf) {
        tokens.push(buf)
        buf = ''
      }
      if (ch === '\n') tokens.push('\n')
    } else {
      buf += ch
    }
  }
  if (buf) tokens.push(buf)

  let line = ''
  let cy = y
  const flush = () => {
    ctx.fillText(line, x, cy)
    cy += lineHeight
    line = ''
  }
  for (const tok of tokens) {
    if (tok === '\n') {
      flush()
      continue
    }
    const trial = line ? `${line} ${tok}` : tok
    // For CJK, don't put a space between chars
    const next = isCJK(tok) || isCJK(line.slice(-1)) ? `${line}${tok}` : trial
    const w = ctx.measureText(next).width
    if (w > maxWidth && line) {
      flush()
      line = tok
    } else {
      line = next
    }
  }
  if (line) ctx.fillText(line, x, cy)
}

function isCJK(s) {
  return /[\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF]/.test(s)
}

// Friendly Chinese form for the cover signature, keyed by country name.
const NATIONALITY_ZH_DISPLAY = {
  UK: '英国朋友',
  USA: '美国朋友',
  Japan: '日本朋友',
  Korea: '韩国朋友',
  Singapore: '新加坡朋友',
  Malaysia: '马来西亚朋友',
  Thailand: '泰国朋友',
  Vietnam: '越南朋友',
  Indonesia: '印尼朋友',
  Philippines: '菲律宾朋友',
  India: '印度朋友',
  Australia: '澳洲朋友',
  'New Zealand': '新西兰朋友',
  Canada: '加拿大朋友',
  France: '法国朋友',
  Germany: '德国朋友',
  Italy: '意大利朋友',
  Spain: '西班牙朋友',
  Russia: '俄罗斯朋友',
  'Hong Kong': '香港朋友',
  Taiwan: '台湾朋友',
  Macao: '澳门朋友',
  China: '中国朋友',
}

function nationalityZhDisplay(nationality) {
  return NATIONALITY_ZH_DISPLAY[nationality] || `${nationality}朋友`
}
