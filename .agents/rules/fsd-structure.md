---
trigger: manual
---

---

description: Feature-Sliced Design (FSD) mimarisi kuralları ve katman bağımlılık yönetimi
globs: src/\*_/_.{ts,tsx,js,jsx}
alwaysApply: true

---

# Feature-Sliced Design (FSD) Mimari Kuralları

## Genel Bakış

Bu proje **Feature-Sliced Design (FSD)** mimarisini takip eder.
Katmanlar **yukarıdan aşağıya tek yönlü bağımlılık** kurar — üst katmanlar alt katmanlara bağımlı olabilir, **ancak alt katmanlar üst katmanlara asla bağımlı olamaz.**

---

## Katman Hiyerarşisi (Yukarıdan Aşağıya)

```
src/
├── app/        → 1. Katman (EN ÜST)
├── views/      → 2. Katman
├── widgets/    → 3. Katman
├── features/   → 4. Katman
├── entities/   → 5. Katman
└── shared/     → 6. Katman (EN ALT)
```

### İzin Verilen Bağımlılık Yönü:

```
app → views → widgets → features → entities → shared
```

Her katman yalnızca **kendisinin altındaki** katmanları import edebilir.

---

## Katman Tanımları ve Sorumlulukları

### 1. `app/` — Uygulama Katmanı

- Uygulamanın başlangıç noktası ve global yapılandırması
- **İçerik:** Router, global provider'lar, store kurulumu, global stiller, middleware entegrasyonu
- **Import edebilir:** `views`, `widgets`, `features`, `entities`, `shared`
- **Import edemez:** Hiçbir şey bu katmanı import edemez
- **Örnekler:** `app/router/`, `app/providers/`, `app/store/`, `app/styles/`

### 2. `views/` — Sayfa Katmanı (Pages)

- Tam sayfa bileşenleri; route'a karşılık gelen en büyük birim
- **İçerik:** Sayfa layout'ları, sayfaya özel orkestrasyon mantığı
- **Import edebilir:** `widgets`, `features`, `entities`, `shared`
- **Import edemez:** `app`
- **Örnekler:** `views/home/`, `views/profile/`, `views/dashboard/`

### 3. `widgets/` — Widget Katmanı

- Birden fazla feature veya entity'yi birleştiren bağımsız UI blokları
- **İçerik:** Header, Sidebar, Feed gibi bileşik bileşenler
- **Import edebilir:** `features`, `entities`, `shared`
- **Import edemez:** `app`, `views`
- **Örnekler:** `widgets/header/`, `widgets/sidebar/`, `widgets/user-feed/`

### 4. `features/` — Özellik Katmanı

- Kullanıcı etkileşimlerini ve iş aksiyonlarını içeren bağımsız özellikler
- **İçerik:** Kullanıcı aksiyonları (like, auth, search, filter), UI + logic birlikte
- **Import edebilir:** `entities`, `shared`
- **Import edemez:** `app`, `views`, `widgets`
- **Örnekler:** `features/auth/`, `features/like-post/`, `features/search/`

### 5. `entities/` — Entity Katmanı

- İş mantığının temel varlıkları; saf veri ve basit UI
- **İçerik:** Model tanımları, entity kartları, entity store'ları
- **Import edebilir:** `shared`
- **Import edemez:** `app`, `views`, `widgets`, `features`
- **Örnekler:** `entities/user/`, `entities/post/`, `entities/product/`

### 6. `shared/` — Paylaşılan Katman

- Hiçbir iş mantığı içermeyen, tamamen tekrar kullanılabilir altyapı
- **İçerik:** UI kit, yardımcı fonksiyonlar, API istemcisi, sabitler, tipler, hook'lar
- **Import edebilir:** Hiçbir uygulama katmanı (yalnızca harici lib'ler)
- **Import edemez:** Diğer hiçbir katman
- **Örnekler:** `shared/ui/`, `shared/api/`, `shared/lib/`, `shared/config/`, `shared/types/`

---

## Segment Yapısı (Her Katman İçinde)

Her slice (özellik klasörü) aşağıdaki segment yapısını takip etmelidir:

```
features/auth/
├── ui/          → React bileşenleri
├── model/       → State, store, selectors, thunks
├── api/         → API çağrıları
├── lib/         → Yardımcı fonksiyonlar
├── config/      → Sabitler ve konfigürasyon
└── index.ts     → Public API (barrel export)
```

---

## Public API Kuralı (index.ts)

Her slice **yalnızca `index.ts` dosyası üzerinden** dışarıya açılmalıdır.
Dış katmanlar slice'ın iç dosyalarına **doğrudan erişemez.**

```typescript
// ✅ DOĞRU
import { AuthForm } from "@/features/auth";

// ❌ YANLIŞ — iç dosyaya doğrudan erişim
import { AuthForm } from "@/features/auth/ui/AuthForm";
```

---

## Import Kuralları

### ✅ İzin Verilen Import'lar

```typescript
// views içinden widget import etmek
import { Header } from "@/widgets/header";

// features içinden entity import etmek
import { UserCard } from "@/entities/user";

// Her yerden shared import etmek
import { Button } from "@/shared/ui";
import { apiClient } from "@/shared/api";
```

### ❌ Yasak Import'lar

```typescript
// shared içinden feature import etmek — KESİNLİKLE YASAK
import { AuthForm } from "@/features/auth"; // shared/... içindeysen

// entities içinden features import etmek — YASAK
import { likePost } from "@/features/like-post"; // entities/... içindeysen

// features içinden views import etmek — YASAK
import { HomePage } from "@/views/home"; // features/... içindeysen

// Aynı katmandaki slice'lar arası cross-import — YASAK
import { searchFeature } from "@/features/search"; // features/auth/... içindeysen
```

---

## Aynı Katmandaki Slice'lar Arası İletişim

Aynı katmandaki iki slice birbirini **doğrudan import edemez.**
Bunun yerine şu yöntemler kullanılır:

1. **Shared state:** Redux/Zustand store üzerinden iletişim
2. **Event/Callback:** Props veya event bus ile yukarı taşıma
3. **Ortak mantığı aşağı taşıma:** Paylaşılan mantığı `entities` veya `shared`'e taşı

---

## Dosya İsimlendirme Konvansiyonları

```
PascalCase    → React bileşenleri (UserCard.tsx, AuthForm.tsx)
camelCase     → Hook'lar, yardımcı fonksiyonlar (useUser.ts, formatDate.ts)
kebab-case    → Klasör isimleri (user-profile/, like-post/)
UPPER_SNAKE   → Sabitler (API_BASE_URL, MAX_RETRY_COUNT)
```

---

## Path Alias Kullanımı

Relative path yerine mutlaka alias kullan:

```typescript
// ✅ DOĞRU
import { Button } from "@/shared/ui";
import { UserCard } from "@/entities/user";

// ❌ YANLIŞ
import { Button } from "../../../shared/ui";
```

---

## Kontrol Listesi — Yeni Kod Yazarken

- [ ] Bileşen/fonksiyon doğru katmanda mı?
- [ ] Yalnızca izin verilen katmanlardan import yapılıyor mu?
- [ ] Slice yalnızca `index.ts` üzerinden mi dışa açılıyor?
- [ ] Aynı katmandaki slice'lar arası cross-import yok mu?
- [ ] `shared/` katmanında iş mantığı yok mu?
- [ ] Dosya isimlendirmesi konvansiyona uygun mu?

---

## Hızlı Başvuru Tablosu

| Katman     | Import Edebilir                            | Import Edemez                 |
| ---------- | ------------------------------------------ | ----------------------------- |
| `app`      | views, widgets, features, entities, shared | —                             |
| `views`    | widgets, features, entities, shared        | app                           |
| `widgets`  | features, entities, shared                 | app, views                    |
| `features` | entities, shared                           | app, views, widgets           |
| `entities` | shared                                     | app, views, widgets, features |
| `shared`   | (yalnızca harici lib'ler)                  | tüm uygulama katmanları       |
