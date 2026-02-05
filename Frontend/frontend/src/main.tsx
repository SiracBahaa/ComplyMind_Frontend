import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// HTML'deki kutuyu bulmaya çalış
const rootElement = document.getElementById('root');

if (!rootElement) {
  // Eğer kutu yoksa ekrana kocaman bir hata yaz (Tarayıcıda görünür)
  document.body.innerHTML = '<h1 style="color:red">HATA: id="root" olan div bulunamadı! index.html dosyasını kontrol et.</h1>';
  console.error("KRİTİK HATA: Root elementi bulunamadı.");
} else {
  // Kutu varsa React'i başlat
  console.log("Başarılı: Root elementi bulundu, React başlatılıyor...");
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}