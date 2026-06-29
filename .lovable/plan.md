# Full Admin Control — Plan

Goal: tomar admin panel theke website er **proti ta jinis** sundor friendly UI diye control kora jabe — kothao code chuyte hobe na.

## Notun Admin Sections

### 1. Branding & Identity
- Site Name, Tagline, Logo URL, Favicon URL
- Header wordmark color/glow intensity
- Footer text & copyright

### 2. Hero Banner (Home page er upor)
- Title (Bangla/English)
- Subtitle / badge text
- Background image URL
- CTA button text + link
- On/Off toggle

### 3. Announcement Bar
- Notice text (e.g. "Eid offer 10% off")
- Color theme (red/green/amber)
- On/Off + auto-hide after date

### 4. Social Links
- Telegram, Facebook, YouTube, WhatsApp, TikTok URLs
- Each one On/Off toggle (jeta off, seta site e dekhabe na)

### 5. AI Live Chat
- System prompt edit (AI ki vabe kotha bolbe)
- Welcome message
- On/Off toggle
- Model picker (Gemini Flash / Pro)

### 6. Wallet & Payment Rules
- Minimum add money amount
- Maximum add money amount
- Quick-amount preset chips (e.g. 100, 500, 1000)
- Manual amount on/off

### 7. Player Info API
- FF info API URL (jodi notun source lagbe)
- Timeout seconds slider
- Cache duration

### 8. Maintenance Mode
- Whole site maintenance toggle + custom message
- Per-category maintenance (e.g. shudhu Diamond bondho)

### 9. SEO Defaults
- Default page title format
- Meta description
- OG image URL

### 10. Notifications / Toasts
- Success message templates (order placed, money added)
- Customizable text

## Implementation Approach

```text
Admin Sidebar
├── Dashboard
├── Products
├── Categories
├── Orders
├── Users
├── Coupons
├── Refer & Earn          ← already done
├── Payments
├── Auto-Delivery
└── ── Settings ──        (new group)
    ├── Branding
    ├── Hero Banner
    ├── Announcement
    ├── Social Links
    ├── AI Live Chat
    ├── Wallet Rules
    ├── Player Info API
    ├── Maintenance
    └── SEO
```

Every setting saves into the existing `site_content` table as a JSON row, so no schema migration needed for most of it. Each admin page = ek-ta friendly form (inputs, toggles, color pickers, image URL + preview) with instant Save + live invalidation, jate save korar sathe sathe site e dekha jay.

User-facing components (Header, Hero, AppShell, LiveChat, Wallet, product pages) shobgulo ei JSON config theke read korbe — hardcoded value gulo replace hoye jabe.

## Build Order (parallel batches)

1. **Settings shell + sidebar group** — collapsible "Settings" section in admin nav
2. **Branding + Social Links + Footer** — chhoto, fast win
3. **Hero Banner + Announcement Bar** — visible impact
4. **AI Live Chat + Wallet Rules** — interactive features
5. **Maintenance + Player API + SEO** — operational controls

Sob ekbar e korbo, tumi approve korlei start.

## Notes

- Image upload er jonno URL field rakhbo (CDN/Imgur link paste). Direct file upload chaile alada storage bucket lage — bolo, add kore debo.
- Maintenance mode on hole admin chara keu dhukte parbe na.
- Sob change instant live — refresh lagbe na.
