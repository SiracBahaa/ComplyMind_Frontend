# ComplyMind Frontend 🚀

Modern ve güvenli kimlik doğrulama sistemi ile geliştirilmiş **ComplyMind** uygulamasının frontend katmanı. React + TypeScript + Vite ile geliştirilmiştir.

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat&logo=vite)

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Proje Yapısı](#-proje-yapısı)
- [Sayfalar](#-sayfalar)
- [Environment Variables](#-environment-variables)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- ✅ **Login** — E-posta + şifre ile giriş
- ✅ **Signup** — Yeni hesap oluşturma
- ✅ **GitHub OAuth** — GitHub hesabı ile giriş
- ✅ **Forgot / Reset Password** — 3 adımlı şifre sıfırlama
- ✅ **Email Verification** — E-posta doğrulama akışı

### 🧭 Layout & Navigasyon
- ✅ **Hamburger Drawer Menü** — Header'daki ☰ butonu ile soldan açılan sidebar
- ✅ **Aktif Rota Takibi** — Mevcut sayfaya göre nav item otomatik aktif
- ✅ **ComplyMind Logosu** — Tıklanınca Dashboard'a yönlendirir
- ✅ **Ortak Layout** — Dashboard, Analiz ve Ayarlar sayfaları aynı navbar'ı paylaşır

### 📊 Dashboard
- ✅ GitHub repo listesi + senkronizasyon
- ✅ GitHub App bağlantı yönetimi
- ✅ Uyumluluk istatistikleri (görevler, riskler, repolar, oran)
- ✅ Son aktiviteler feed'i

### 🔍 Kod Analizi
- ✅ Proje bazlı analiz dashboard'u
- ✅ SonarQube entegrasyonu (issue'lar, metrikler)
- ✅ Manuel ve webhook tabanlı analiz tetikleme
- ✅ Analiz detay sayfası (issue listesi, severity breakdown)
- ✅ Pending/processing durumlar için polling

### ⚙️ Ayarlar
- ✅ Profil bilgisi güncelleme (görünen ad)
- ✅ Şifre değiştirme
- ✅ OAuth bağlı hesaplar görüntüleme
- ✅ Hesap silme (şifre / kullanıcı adı doğrulamalı)

### 🎨 Kullanıcı Deneyimi
- 🌙 Dark theme (`#0a0a0a` arka plan, `#00ff88` vurgu)
- 🔤 Archivo + Space Mono fontları
- 🔔 Toast bildirimleri (başarı / hata)
- ⚡ Smooth animasyonlar

## 🛠 Teknolojiler

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| React | 19.2 | UI Framework |
| TypeScript | 5.9 | Tip güvenliği |
| Vite | 7.2 | Build tool |
| React Router DOM | 7.13 | SPA routing |
| CSS3 | — | Styling (no framework) |

## 🚀 Kurulum

```bash
# Proje klasörüne git
cd "ComplyMind Frontend/Frontend/frontend"

# Bağımlılıkları yükle
npm install

# Development server'ı başlat (port 3001)
npm run dev

# Production build
npm run build
```

Development server: `http://localhost:3001`

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.tsx       # Hamburger drawer + header + nav
│   │   ├── Layout.css
│   │   └── index.ts
│   └── Toast/
│       ├── Toast.tsx
│       ├── Toast.css
│       └── index.ts
│
├── pages/
│   ├── auth/
│   │   ├── Login/
│   │   ├── Signup/
│   │   ├── ForgotPassword/
│   │   ├── ResetPassword/
│   │   ├── GitHubCallback/
│   │   └── Email/
│   │       ├── EmailVerification/
│   │       ├── EmailVerified/
│   │       └── VerifyEmailHandler/
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.css
│   ├── Analysis/
│   │   ├── AnalysisDashboard.tsx
│   │   ├── AnalysisDashboard.css
│   │   ├── AnalysisDetail.tsx
│   │   ├── AnalysisDetail.css
│   │   ├── TriggerAnalysis.tsx
│   │   ├── TriggerAnalysis.css
│   │   └── index.ts
│   └── Settings/
│       ├── Settings.tsx
│       └── Settings.css
│
├── hooks/
│   └── useToast.ts
│
├── utils/
│   └── validators.ts
│
├── App.tsx                  # Route tanımları
├── main.tsx
└── index.css                # Global reset
```

## 🗺 Sayfalar

### Public (Layout yok)
| Route | Bileşen | Açıklama |
|-------|---------|----------|
| `/login` | Login | Giriş sayfası |
| `/signup` | Signup | Kayıt sayfası |
| `/forgot-password` | ForgotPassword | Şifre sıfırlama |
| `/reset-password` | ResetPassword | Yeni şifre belirleme |
| `/email-verification` | EmailVerification | Doğrulama bekleme |
| `/auth/verify-email` | VerifyEmailHandler | Token işleme |
| `/auth/email-verified` | EmailVerified | Doğrulama sonucu |
| `/auth/oauth-callback` | GitHubCallback | GitHub OAuth callback |

### Protected (Layout ile — hamburger navbar)
| Route | Bileşen | Açıklama |
|-------|---------|----------|
| `/dashboard` | Dashboard | Ana dashboard |
| `/analysis` | AnalysisDashboard | Analiz listesi |
| `/analysis/project/:projectId` | AnalysisDetail | Analiz detayı |
| `/settings` | Settings | Hesap ayarları |

## 🔌 Backend API

Tüm istekler `VITE_API_URL` env değişkenine yapılır.

### Kullanılan Başlıca Endpoint'ler

```
GET    /users/me                              # Profil bilgisi
PATCH  /users/me                              # Profil güncelleme
PATCH  /users/me/password                     # Şifre değiştirme
POST   /users/me/delete                       # Hesap silme

GET    /github/status                         # GitHub bağlantı durumu
GET    /github/install                        # GitHub App kurulum URL'i
GET    /github/repos                          # Repo listesi
POST   /github/repos/sync                     # Repo senkronizasyon

GET    /analysis/stats                        # Analiz istatistikleri
POST   /analysis/trigger                      # Analiz tetikleme
GET    /analysis/project/:id/latest           # Son analiz ID'si
GET    /analysis/project/:id/current          # Güncel issue'lar
GET    /analysis/:id/metrics                  # Analiz metrikleri

POST   /auth/logout                           # Çıkış
```

## 📝 Environment Variables

`.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:3000
```

## 🎨 Tasarım Sistemi

```css
--color-bg: #0a0a0a;
--color-surface: #141414;
--color-border: #2a2a2a;
--color-text: #ffffff;
--color-text-secondary: #a0a0a0;
--color-accent: #00ff88;
--color-error: #ff4444;
--font-display: 'Archivo';
--font-mono: 'Space Mono';
```

## 👥 İletişim

**Proje Sahibi:** Sirac Bahaa
**GitHub:** [@SiracBahaa](https://github.com/SiracBahaa)

---

**Made with ❤️ by Sirac Bahaa**
