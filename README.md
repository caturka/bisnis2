# Bangcats Bot — WhatsApp 38 Provinsi Indonesia

Bot WhatsApp berbasis Node.js + Baileys.

## Fitur
- Sapa otomatis: halo, hai, hi, hello, assalamualaikum, dll.
- Menu bantuan.
- Daftar 38 provinsi.
- Waktu berdasarkan zona waktu provinsi/ibu kota.
- Cuaca real-time berdasarkan koordinat ibu kota provinsi.
- Kalkulator: `+ - * / % ^ ( )` dan `x`.
- Stiker: kirim foto dengan caption `stiker`, atau balas foto lalu ketik `stiker`.
- Konfigurasi `.env`.
- Reconnect otomatis jika koneksi terputus.

## Instalasi di Termux

1. Install Node.js:
```bash
pkg update
pkg install nodejs-lts git
```

2. Masuk ke folder bot:
```bash
cd bot-wa-38-provinsi
```

3. Install dependency:
```bash
npm install
```

4. Buat `.env`:
```bash
cp .env.example .env
```

5. Jalankan:
```bash
npm start
```

6. QR akan muncul di terminal. Di WhatsApp:
**Setelan > Perangkat tertaut > Tautkan perangkat**, lalu scan QR.

Folder `auth/` akan menyimpan sesi login. Jangan membagikan folder tersebut.

## Contoh perintah

```text
.menu
.jam Jakarta
.jam Jawa Barat
.jam Papua
.cuaca Jakarta
.cuaca Bandung
.cuaca Papua
.provinsi
.hitung 25*4+10
.hitung (100-25)/5
```

`menu`, `help`, dan `bantuan` juga bisa dikirim tanpa prefix.

## Catatan
- Data cuaca berasal dari Open-Meteo.
- Cuaca provinsi direpresentasikan melalui ibu kota provinsi.
- Bot tidak memerlukan API key Open-Meteo.
- Untuk WhatsApp Business resmi berbasis Cloud API, arsitekturnya berbeda dari Baileys dan membutuhkan kredensial Meta.


## Logo Menu
Saat pengguna mengetik `!menu`, bot mengirim foto logo menu yang disertakan sebagai `logo-menu.webp` beserta daftar perintah.
