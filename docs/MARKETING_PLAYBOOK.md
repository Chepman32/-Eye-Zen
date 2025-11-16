# EyeZen Marketing Playbook

This document translates Viktor Seraleev’s growth advice into concrete actions for EyeZen. Use it as the source of truth for launch prep, experimentation, and weekly marketing reviews.

---

## 1. Acquisition Channels & KPIs

| Channel | Owner | Launch Checklist | KPI | Notes |
| --- | --- | --- | --- | --- |
| **ASO (App Store Optimization)** | @product | Maintain keyword map per locale, align titles/subtitles to high-intent phrases, ship OCR-friendly screenshot copy | Tap-to-install rate ≥ 35 % | Update metadata every 6–8 weeks and measure baseline conversion |
| **Apple Search Ads** | @growth | Always-on branded campaign + rotating exact-match experiments (“eye exercises”, “digital strain relief”) with CPT caps | ROAS ≥ 1.5 | Sync keyword list with ASO so creative matches query intent |
| **Paid Social (TikTok/Meta)** | @growth | Monthly creative batch testing (5 hooks × 3 edits). Optimize for completed view + click. | CPI ≤ $2.50 | Creative highlights “5 guided sessions/day” benefit |
| **Influencers / UGC** | @community | Quarterly flight of micro-creators in wellness / productivity niches. Provide tracking links & unique coupon codes. | ≥ 800 installs per $500 flight | Vet partners for real engagement; collect testimonial rights for screenshots |
| **Content Factory** | @product marketing | Publish bi-weekly blog posts + YT Shorts demonstrating quick eye breaks, add newsletter CTA | Newsletter CTR ≥ 8 % | Repurpose long-form posts into script overlays for TikTok |

---

## 2. Measurement & Attribution

- **SKAdNetwork**: configure conversion values for trial start, purchase, and D7 retention once we add subscriptions.
- **In-app analytics**: instrument key events (onboarding completion, video started, paywall seen, purchase success) via a privacy-friendly SDK (e.g., RudderStack or Segment with EU data residency). Until SDK integration lands, log custom metrics to Metro for qualitative testing.
- **Cross-channel dashboard**: maintain a shared spreadsheet or Looker Studio board that combines App Store Connect metrics, ASA spend, and influencer tracking links.

---

## 3. ASO Workflow

1. **Keyword research**: update the `aso/keywords.xlsx` tracker (create if missing) with search popularity & difficulty scores for English, Spanish, German, Japanese, and French.
2. **Metadata testing**: rotate subtitle/keyword sets every release; align copy with screenshot text (Apple now OCRs captions).
3. **Screenshot localization**: see `docs/STORE_ASSET_PLAN.md` for template guidance. Every market gets culturally relevant imagery (e.g., softer colors for JP, inspirational quotes for ES).
4. **Review mining**: once reviews start rolling in, highlight positive quotes inside screenshots 5–7 to add social proof.

---

## 4. Paid Media Guardrails

- Cap total marketing spend at 35 % of trailing 30-day net revenue.
- Pause any channel with CPI > blended LTV/3 for more than 3 consecutive days.
- Run at least two creative concepts before killing a poor-performing channel—Viktor’s experience shows creative refreshes usually beat targeting tweaks.

---

## 5. Launch Checklist per Locale

1. Localized metadata (title, subtitle, keywords, description).
2. Locale-specific screenshot set uploaded to App Store Connect.
3. Localized pricing tier (see `pricing/pricing_matrix.csv` once populated).
4. Minimum viable press kit (icon, 4K screenshots, 15s portrait video if absolutely required).
5. Influencer/influencer list for that locale with outreach templates.

---

## 6. Retention & Upsell

- Trigger the paywall after the first free video while the feature value is fresh.
- Use the review prompt hook (see `src/hooks/useReviewPrompt.ts`) to solicit authentic ratings from engaged users—never incentivize reviews.
- Implement post-purchase email onboarding (Mailchimp or Customer.io) once we introduce optional account linking.

---

Revisit this playbook every sprint. Log experiments in `docs/EXPERIMENT_LOG.md` (create later) and note whether they ladder up to Viktor’s pillars: diversify traffic, localize aggressively, and iterate relentlessly.
