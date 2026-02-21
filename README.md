# SIMAK NESBU - Sistem Monitoring PKL

SIMAK NESBU adalah aplikasi web modern yang dirancang untuk memonitoring kegiatan Praktik Kerja Lapangan (PKL) siswa. Aplikasi ini menggunakan **HTML/CSS/JS** untuk frontend dan **Google Apps Script (GAS)** dengan **Google Sheets** sebagai backend.

## Fitur Utama

- **Dashboard Multi-User**: Admin, Siswa, Guru Pembimbing, Kakomli, dan Mentor.
- **Manajemen Data**: Pengelolaan data siswa, guru, lokasi PKL, dan bimbingan.
- **Monitoring Kehadiran**: Absensi siswa PKL dengan fitur foto dan koordinat GPS.
- **Jurnal Harian**: Pengisian aktivitas harian oleh siswa dan validasi oleh mentor/pembimbing.
- **Otomasi Dokumen**: Pembuatan surat permohonan dan sertifikat PKL secara otomatis dalam format PDF.
- **Modern UI**: Antarmuka responsif dengan desain *glassmorphism* yang premium.

## Persiapan & Instalasi

### 1. Persiapan Google Sheets
1. Buat Google Spreadsheet baru.
2. Berikan nama untuk setiap sheet sesuai dengan kebutuhan sistem (atau jalankan fungsi `setupSheets` di GAS).
3. Catat **Spreadsheet ID** (ditemukan di URL: `https://docs.google.com/spreadsheets/d/ID_DISINI/edit`).

### 2. Persiapan Google Drive (Untuk Upload File)
1. Buat folder baru di Google Drive untuk menyimpan file upload.
2. Catat **Folder ID** (ditemukan di URL: `https://drive.google.com/drive/folders/ID_DISINI`).

### 3. Deploy Backend (Google Apps Script)
1. Buka [Google Apps Script](https://script.google.com/).
2. Buat proyek baru dan salin kode dari `api/Code.gs`.
3. Masukkan **Spreadsheet ID** dan **Folder ID** pada bagian konstanta di atas kode.
4. Klik **Deploy** > **New Deployment**.
5. Pilih type **Web App**.
6. Atur `Execute as: Me` dan `Who has access: Anyone`.
7. Salin **Web App URL** yang dihasilkan.

### 4. Konfigurasi Frontend
1. Buka file `js/api.js`.
2. Ganti `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` dengan **Web App URL** yang Anda dapatkan di langkah sebelumnya.
3. Jalankan `index.html` di browser (disarankan menggunakan server lokal/VS Code Live Server).

## Teknologi
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend**: Google Apps Script.
- **Database**: Google Sheets.
- **Storage**: Google Drive.

## Penulis
Dikembangkan oleh Tim SIMAK NESBU.
