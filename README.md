[Uploading README-2.md…]()
# ComplyMind Frontend 🚀

Modern ve güvenli kimlik doğrulama sistemi ile geliştirilmiş **ComplyMind** uygulamasının frontend katmanı. React + TypeScript ve NestJS ile geliştirilmiştir.

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E?style=flat&logo=nestjs)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite)

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Başlangıç](#-başlangıç)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Proje Yapısı](#-proje-yapısı)
- [API Endpoints](#-api-endpoints)
- [Katkıda Bulunma](#-katkıda-bulunma)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama Sistemi
- ✅ **Login** - E-posta ve şifre ile giriş
- ✅ **GitHub OAuth** - GitHub hesabı ile tek tıkla giriş
- ✅ **Signup** - Yeni hesap oluşturma
  - Gerçek zamanlı şifre güvenlik göstergesi
  - E-posta validasyonu
  - Şifre eşleşme kontrolü
- ✅ **Forgot Password** - 3 adımlı şifre sıfırlama
  - E-posta doğrulama
  - 6 haneli kod sistemi
  - Güvenli şifre oluşturma

### 🎨 Kullanıcı Deneyimi
- 🎯 **Toast Notifications** - Başarı/hata bildirimleri
- ⚡ **Smooth Animations** - CSS3 animasyonlar
- 📱 **Responsive Design** - Tüm cihazlarda uyumlu
- 🌙 **Dark Theme** - Modern brutalist tasarım
- ♿ **Accessibility** - WCAG 2.1 uyumlu

### 🛠️ Teknik Özellikler
- 🔒 **Form Validation** - Client-side doğrulama
- 🎭 **TypeScript** - Tip güvenliği
- 🔄 **React Router** - SPA navigasyon
- 🎨 **Custom Hooks** - Yeniden kullanılabilir mantık
- 📦 **Component Based** - Modüler yapı

## 🛠 Teknolojiler

### Frontend

| Teknoloji | Versiyon | Kullanım Alanı |
|-----------|----------|----------------|
| [React](https://react.dev/) | 18.3.1 | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.5.3 | Type Safety |
| [Vite](https://vitejs.dev/) | 5.4.2 | Build Tool |
| [React Router](https://reactrouter.com/) | 6.x | Routing |
| CSS3 | - | Styling |

### Backend (Hazır)

| Teknoloji | Versiyon | Kullanım Alanı |
|-----------|----------|----------------|
| [NestJS](https://nestjs.com/) | 10.0.0 | Backend Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.1.3 | Type Safety |
| Node.js | 18+ | Runtime |

### Fontlar

- **Archivo** - Display font (başlıklar)
- **Space Mono** - Monospace font (kodlar, meta bilgiler)

## 🚀 Başlangıç

### Gereksinimler

Sisteminizde şunların kurulu olması gerekiyor:

- **Node.js** (v18.0.0 veya üzeri)
- **npm** (v9.0.0 veya üzeri) veya **yarn**
- **Git**

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/SiracBahaa/ComplyMindFrontend.git

# Proje klasörüne gidin
cd ComplyMindFrontend

# Frontend kurulumu
cd Frontend/frontend
npm install

# Backend kurulumu (opsiyonel)
cd ../../Backend/backend
npm install
```

## 📦 Kurulum

### Frontend Kurulumu

```bash
cd Frontend/frontend

# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Development server: `http://localhost:5173`

### Backend Kurulumu (Opsiyonel)

```bash
cd Backend/backend

# Bağımlılıkları yükle
npm install

# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Backend server: `http://localhost:3000`

### Kurulacak Paketler

#### Frontend Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2"
}
```

#### Frontend Dev Dependencies

```json
{
  "@types/react": "^18.3.3",
  "@types/react-dom": "^18.3.0",
  "@vitejs/plugin-react": "^4.3.1",
  "typescript": "^5.5.3",
  "vite": "^5.4.2"
}
```

#### Backend Dependencies (Hazır)

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "reflect-metadata": "^0.2.0",
  "rxjs": "^7.8.1"
}
```

## 💻 Kullanım

### Geliştirme Modu

```bash
# Frontend
cd Frontend/frontend
npm run dev

# Backend (başka terminal)
cd Backend/backend
npm run start:dev
```

### Production Build

```bash
# Frontend build
cd Frontend/frontend
npm run build
# Build dosyaları: Frontend/frontend/dist/

# Backend build
cd Backend/backend
npm run build
# Build dosyaları: Backend/backend/dist/
```

### Test Kullanıcı Bilgileri

Frontend **mock data** ile çalışır, backend olmadan test edebilirsiniz:

**Login Test:**
- E-posta: herhangi bir geçerli e-posta
- Şifre: herhangi bir şifre (min 6 karakter)

**Forgot Password Test:**
- E-posta: herhangi bir geçerli e-posta
- Doğrulama Kodu: `123456`

## 📁 Proje Yapısı

```
ComplyMind Frontend/
│
├── Frontend/frontend/          # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── auth/          # Authentication sayfaları
│   │   │       ├── Login/
│   │   │       │   ├── Login.tsx
│   │   │       │   ├── Login.css
│   │   │       │   └── index.ts
│   │   │       ├── Signup/
│   │   │       │   ├── Signup.tsx
│   │   │       │   ├── Signup.css
│   │   │       │   └── index.ts
│   │   │       └── ForgotPassword/
│   │   │           ├── ForgotPassword.tsx
│   │   │           ├── ForgotPassword.css
│   │   │           └── index.ts
│   │   │
│   │   ├── components/        # Reusable components
│   │   │   └── Toast/
│   │   │       ├── Toast.tsx
│   │   │       ├── Toast.css
│   │   │       └── index.ts
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useToast.ts
│   │   │
│   │   ├── utils/             # Utility functions
│   │   │   └── validators.ts
│   │   │
│   │   ├── types/             # TypeScript types
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── styles/            # Global styles
│   │   │   ├── globals.css
│   │   │   └── variables.css
│   │   │
│   │   ├── App.tsx            # Main App component
│   │   └── main.tsx           # Entry point
│   │
│   ├── public/                # Static files
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   └── tsconfig.json          # TypeScript config
│
└── Backend/backend/           # NestJS Backend
    ├── src/
    │   ├── app.controller.ts
    │   ├── app.module.ts
    │   ├── app.service.ts
    │   └── main.ts
    ├── test/
    ├── package.json           # Backend dependencies
    ├── nest-cli.json          # Nest configuration
    └── tsconfig.json          # TypeScript config
```

## 🔌 API Endpoints

### Authentication (Planlanan)

Backend hazır olduğunda bu endpoint'ler kullanılacak:

```
POST   /api/auth/login              # Kullanıcı girişi
POST   /api/auth/signup             # Yeni kayıt
POST   /api/auth/forgot-password    # Şifre sıfırlama kodu gönder
POST   /api/auth/verify-reset-code  # Kodu doğrula
POST   /api/auth/reset-password     # Şifreyi sıfırla
GET    /api/auth/github             # GitHub OAuth
GET    /api/auth/github/callback    # GitHub OAuth callback
```

### Request/Response Örnekleri

**Login:**
```json
// POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Signup:**
```json
// POST /api/auth/signup
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## 🎨 Tasarım Sistemi

### Renk Paleti

```css
--color-bg: #0a0a0a;              /* Ana arkaplan */
--color-surface: #141414;         /* Kart arkaplan */
--color-border: #2a2a2a;          /* Border rengi */
--color-text: #ffffff;            /* Ana metin */
--color-text-secondary: #a0a0a0;  /* İkincil metin */
--color-accent: #00ff88;          /* Vurgu rengi (yeşil) */
--color-error: #ff4444;           /* Hata rengi */
```

### Tipografi

```css
--font-display: 'Archivo';        /* Başlıklar */
--font-mono: 'Space Mono';        /* Kod ve meta */
--font-body: 'Archivo';           /* Body text */
```

## 🧪 Test

```bash
# Frontend testleri (yakında)
npm run test

# Backend testleri
cd Backend/backend
npm run test

# E2E testleri
npm run test:e2e
```

## 🔒 Güvenlik

- ✅ Client-side form validation
- ✅ XSS protection
- ✅ CSRF protection (backend'de)
- ✅ Password hashing (backend'de - bcrypt)
- ✅ JWT authentication (backend'de)
- ✅ Rate limiting (backend'de)

## 📝 Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

### Backend (.env)

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/complymind
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy klasörü: Frontend/frontend/dist/
```

### Backend (Heroku/Railway/DigitalOcean)

```bash
# Build
npm run build

# Start
npm run start:prod
```

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesaj Formatı

```
feat: Yeni özellik
fix: Bug düzeltmesi
docs: Dokümantasyon
style: Stil değişiklikleri
refactor: Kod refactoring
test: Test ekleme
chore: Diğer değişiklikler
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 İletişim

**Proje Sahibi:** Sirac Bahaa  
**GitHub:** [@SiracBahaa](https://github.com/SiracBahaa)  
**Proje Linki:** [https://github.com/SiracBahaa/ComplyMindFrontend](https://github.com/SiracBahaa/ComplyMindFrontend)

## 🙏 Teşekkürler

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [NestJS](https://nestjs.com/)
- [Vite](https://vitejs.dev/)
- [Google Fonts](https://fonts.google.com/)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

**Made with ❤️ by Sirac Bahaa**
