## Admin Panel — Full Site Control

Build a complete admin dashboard at `/admin` (role-gated) to control every editable part of TOP-UP EXPRESS.

### Access Control
- Use existing `user_roles` table + `has_role()` function
- Route guard: `/admin/*` requires `admin` role, else redirect
- Add a "Promote to Admin" one-time bootstrap (first user via SQL seed)

### Admin Sections

**1. Dashboard (`/admin`)**
- Stats: total orders, revenue, pending orders, total users, active products
- Recent orders list with quick status update

**2. Products Manager (`/admin/products`)**
- List all products grouped by category (6 categories: Diamonds, Membership, Level Up Pass, Weekly Lite, Likes, UniPin)
- Add / Edit / Delete product (name_en, name_bn, price, original_price, image_url, badge, sort_order, is_active, server, pack_type)
- Inline category filter tabs
- Bulk activate/deactivate

**3. Categories Manager (`/admin/categories`)**
- New `categories` table: id, key (pack_type), name, image_url, banner_url, description, sort_order, is_active
- Add / Edit / Delete category — 6 default seeded, but fully editable
- Frontend home grid & product page banners read from this table

**4. Orders Manager (`/admin/orders`)**
- Filter by status (pending / completed / cancelled)
- Search by order_number, player_uid, user
- Update status, add notes, view payment details

**5. Users Manager (`/admin/users`)**
- List all users (from `profiles` joined with `auth.users` via admin server fn)
- View balance, edit balance (add/deduct), promote/demote admin role
- View user's orders

**6. Site Content Manager (`/admin/content`)**
- New `site_content` table: key (text), value (jsonb), updated_at
- Editable keys: `hero_title`, `hero_subtitle`, `announcement_text`, `welcome_notice_title`, `welcome_notice_body`, `footer_text`, `contact_whatsapp`, `contact_messenger`, `contact_telegram`, `faq_items` (jsonb array), `privacy_policy` (md), `terms` (md), `live_chat_system_prompt`
- Frontend reads via a public server fn cached in React Query

**7. Payment Settings (`/admin/payments`)**
- New `payment_methods` table: id, name (bKash/Nagad/Rocket), number, type (personal/agent/merchant), instructions, is_active, sort_order
- Editable so admin can change receiving numbers without code changes
- `SecureCheckout` reads from this table

### Database Migrations
- `categories` table + seed 6 defaults
- `site_content` table + seed defaults
- `payment_methods` table + seed bKash/Nagad/Rocket
- Admin RLS: full read/write via `has_role(auth.uid(), 'admin')`
- Public read for `categories` (active), `site_content`, `payment_methods` (active)

### Tech
- TanStack server functions for all admin mutations, gated by `requireSupabaseAuth` + `has_role` check
- React Query for caching
- shadcn `Table`, `Dialog`, `Form`, `Tabs` for UI
- Image upload via Supabase Storage bucket `site-assets` (admin-only write, public read)
- Sidebar layout for admin section, mobile-responsive

### File Structure
```
src/routes/_admin/route.tsx         (gate + sidebar layout)
src/routes/_admin/index.tsx         (dashboard)
src/routes/_admin/products.tsx
src/routes/_admin/categories.tsx
src/routes/_admin/orders.tsx
src/routes/_admin/users.tsx
src/routes/_admin/content.tsx
src/routes/_admin/payments.tsx
src/lib/admin.functions.ts
src/lib/content.functions.ts        (public reads)
src/lib/categories.functions.ts
```

### Frontend Wiring
- `src/routes/index.tsx` 6-category grid → reads from `categories` table
- `src/routes/products.$id.tsx` banner/meta → reads from `categories`
- `AnnouncementBar`, `WelcomeNotice`, `Footer`, `contact.tsx`, `faq.tsx`, `privacy.tsx`, `terms.tsx` → read from `site_content`
- `SecureCheckout` → reads from `payment_methods`
- `LiveChat` system prompt → reads from `site_content.live_chat_system_prompt`

### Bootstrap Admin
After migration, run one SQL `INSERT INTO user_roles` for your user_id. I'll ask for your email to identify which account to promote.

---

This is a large multi-turn build. I'll execute it in phases:
1. **Migrations** (categories, site_content, payment_methods, storage bucket)
2. **Admin layout + auth gate + dashboard**
3. **Products + Categories managers**
4. **Orders + Users managers**
5. **Content + Payments managers**
6. **Wire frontend to read from DB**

Approve to start with Phase 1 (migrations).