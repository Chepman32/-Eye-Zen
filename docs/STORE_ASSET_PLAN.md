# Store Asset Plan

Apple is reading text inside screenshots via OCR, so every asset must double as a keyword surface. Follow this plan when preparing submissions.

---

## 1. Screenshot Sets

- **Quantity**: 10 per language (5 portrait + 5 landscape). The first 3 focus on the core promise (“Relax your eyes in 60 seconds”), following the marketing funnel (Problem → Solution → Outcome).
- **Locales covered**: English (US), English (UK), German, French, Spanish, Japanese, Portuguese (BR), Turkish, Italian, Polish.
- **Captions**: Write short, benefit-driven titles (<35 chars) with 1 keyword each. Example: “Guided micro-breaks” or “防ぐ デジタル眼精疲労”.
- **Templates**: Maintain Figma components under `design/App Store Screenshots.fig`. Export at 1242×2688 for portrait and 2688×1242 for landscape.

---

## 2. Localization Guidelines

| Locale | Visual Motif | Notes |
| --- | --- | --- |
| US/UK | Minimal gradient backgrounds, emphasize productivity | Highlight support for dark/light themes |
| DE | Muted greens, mention “Augentraining” keyword | Keep typography bold and direct |
| JP | Softer gradients, rounded typography, optional mascot | Translate benefits culturally (e.g., “ブルーライト疲れ対策”) |
| BR | Warm colors, emphasize “até 5 sessões por dia” | Include reassurance about one-time purchase |

Use native proofreaders (or DeepL + human review) to avoid literal translations that feel awkward.

---

## 3. Preview Video Guardrails

Viktor’s experiences show preview videos often cause rejections. Only produce one if:

- Every frame shows the in-app UI,
- No third-party logos or footage appear,
- There is a localized subtitle track.

Otherwise prioritize stills.

---

## 4. Metadata Alignment

- Mirror screenshot captions within the App Store subtitle & promotional text to reinforce keywords.
- Keep a change log in `store-assets/CHANGELOG.md` whenever we upload a new set—note language, keywords targeted, and CTR deltas from App Store Connect’s conversion report.

---

## 5. Automation

- Add a simple `scripts/export-screenshots.mjs` script (future work) that pulls the latest Figma renders via the API and writes them to `store-assets/<locale>/`.
- Validate file naming with Apple’s pattern: `AppName_iPhone6.7_01_<Locale>.png`.

---

**Owner**: @design — review this plan ahead of every submission window.
