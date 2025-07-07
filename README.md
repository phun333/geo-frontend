# Geo Organize Frontend

C# ASP.NET Core backend projesi için geliştirilmiş modern Next.js frontend uygulaması. Türkiye odaklı harita yönetim sistemi.

## 🚀 Özellikler

- **Modern UI**: Next.js 15, shadcn/ui, ve Tailwind CSS ile geliştirilmiş
- **Interaktif Harita**: Leaflet ile Türkiye haritası
- **Gerçek Zamanlı CRUD**: Backend API ile senkronize veri yönetimi
- **Koordinat Desteği**: Nokta, Çizgi ve Alan koordinat türleri
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **TypeScript**: Tip güvenliği ve daha iyi geliştirici deneyimi

## 📋 Gereksinimler

- Node.js 18.0 veya üzeri
- npm veya yarn
- Çalışan backend API (http://localhost:5000)

## 🛠️ Kurulum

### 1. Projeyi klonlayın
```bash
git clone <repo-url>
cd geo-frontend
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Development server'ı başlatın
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 🎯 Kullanım

### Harita Kullanımı
- **Nokta Ekleme**: Harita üzerine tıklayarak yeni nokta ekleyin
- **Nokta Seçme**: Mevcut noktaları seçmek için üzerine tıklayın
- **Popup İnceleme**: Detaylı bilgi için popup'ları kullanın

### Koordinat Türleri
- 🔴 **Nokta**: Tekil konum işaretlemesi
- 🔵 **Çizgi**: Rota veya yol çizimi
- 🟢 **Alan**: Kapalı bölge tanımlama

### Veri Yönetimi
- **Ekleme**: "Nokta Ekle" butonu veya haritaya tıklama
- **Düzenleme**: Tablodaki düzenle butonu
- **Silme**: Tablodaki sil butonu (onay gerektirir)
- **Görüntüleme**: Tablodaki göz butonu

## 📚 Proje Yapısı

```
geo-frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global CSS ve Leaflet stilleri
│   │   ├── layout.tsx           # Ana layout
│   │   └── page.tsx             # Ana sayfa
│   ├── components/
│   │   ├── ui/                  # shadcn/ui bileşenleri
│   │   ├── MapComponent.tsx     # Harita bileşeni
│   │   ├── PointDialog.tsx      # Nokta ekleme/düzenleme modal
│   │   └── PointsTable.tsx      # Nokta listesi tablosu
│   ├── hooks/
│   │   └── usePoints.ts         # Nokta yönetimi hook'u
│   └── lib/
│       ├── api.ts               # API servis katmanı
│       ├── types.ts             # TypeScript türleri
│       └── utils.ts             # Yardımcı fonksiyonlar
├── public/                      # Statik dosyalar
├── components.json              # shadcn/ui konfigürasyonu
├── next.config.js               # Next.js konfigürasyonu
├── tailwind.config.js           # Tailwind CSS konfigürasyonu
└── tsconfig.json                # TypeScript konfigürasyonu
```

## 🔧 Teknolojiler

### Frontend
- **Next.js 15**: React framework
- **TypeScript**: Tip güvenliği
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Bileşen kütüphanesi
- **Leaflet**: Harita kütüphanesi
- **React Leaflet**: React için Leaflet wrapper
- **Lucide React**: İkon kütüphanesi
- **Sonner**: Toast bildirimleri

### Backend Entegrasyonu
- **Fetch API**: HTTP istekleri
- **Error Handling**: Hata yönetimi
- **Loading States**: Yükleme durumları
- **Validation**: Form doğrulama

## 🔌 API Endpoints

Frontend aşağıdaki backend endpoint'leri kullanır:

```
GET    /api/points           # Tüm noktaları getir
GET    /api/points/{id}      # Belirli noktayı getir
POST   /api/points           # Yeni nokta oluştur
PUT    /api/points/{id}      # Noktayı güncelle
DELETE /api/points/{id}      # Noktayı sil
```

## 🎨 Özelleştirme

### Renk Teması
`src/app/globals.css` dosyasında CSS değişkenlerini değiştirerek renk temasını özelleştirebilirsiniz.

### Harita Ayarları
`src/components/MapComponent.tsx` dosyasında:
- Türkiye merkez koordinatları
- Zoom seviyesi
- Harita katmanları

### API URL'i
`src/lib/api.ts` dosyasında `API_BASE_URL` değişkenini backend URL'inize göre ayarlayın.

## 🚀 Build ve Deploy

### Production Build
```bash
npm run build
```

### Production Start
```bash
npm start
```

### Linting
```bash
npm run lint
```

## 📱 Responsive Tasarım

- **Mobile First**: Mobil cihazlar için optimize edilmiş
- **Tablet Uyumlu**: Orta ekran boyutları desteklenir
- **Desktop**: Büyük ekranlarda optimal görüntü

## 🔧 Sorun Giderme

### Harita Yüklenmiyor
- Leaflet CSS'inin doğru yüklendiğinden emin olun
- Network sekmesinde 404 hatalarını kontrol edin
- `next.config.js` webpack ayarlarını kontrol edin

### API Bağlantı Sorunu
- Backend'in http://localhost:5000 adresinde çalıştığından emin olun
- CORS ayarlarını kontrol edin
- Network sekmesinde API isteklerini inceleyin

### Build Hataları
- Node.js versiyonunuzu kontrol edin (18.0+)
- `node_modules` klasörünü silin ve tekrar yükleyin
- TypeScript hatalarını kontrol edin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

Sorularınız için:
- GitHub Issues
- Email: [email]
- Discord: [discord]
