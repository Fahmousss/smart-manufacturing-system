# Sistem Manufaktur Cerdas (Smart Manufacturing System)

Aplikasi pemantauan produksi realtime berbasis web yang dibangun dengan Laravel 12, Inertia.js v2, dan React. Sistem ini dirancang untuk memantau status mesin, data produksi, dan suhu operasional di lantai pabrik secara langsung.

## 🚀 Fitur Utama

-   **Pemantauan Realtime**: Update status mesin, produksi, dan suhu tanpa refresh halaman menggunakan **Laravel Reverb**.
-   **Manajemen Mesin**: CRUD (Create, Read, Update, Delete) data mesin dan operator.
-   **Dasbor Interaktif**: Visualisasi metrik utama seperti total produksi, mesin yang berjalan, dan rata-rata suhu.
-   **Peringatan Dini**: Deteksi otomatis untuk suhu mesin yang melebihi ambang batas (overheat).
-   **Laporan Produksi**: Ekspor data histori produksi ke format CSV.
-   **Simulasi Data**: Perintah bawaan untuk mensimulasikan aktivitas mesin (produksi, perubahan status, fluktuasi suhu) untuk keperluan testing.

## 🛠️ Teknologi yang Digunakan

-   **Backend**: Laravel 12 (PHP 8.4)
-   **Frontend**: Inertia.js v2, React 19, TypeScript
-   **Styling**: Tailwind CSS v4, Shadcn/ui
-   **Database**: PostgreSQL
-   **Realtime**: Laravel Reverb (WebSocket)
-   **Testing**: Pest PHP
-   **Authentication**: Laravel Fortify

## ⚙️ Persyaratan Sistem

-   PHP >= 8.4
-   Composer
-   Node.js & NPM
-   PostgreSQL
-   Redis (Opsional, untuk antrian/queue)

## 📦 Instalasi

Ikuti langkah-langkah berikut untuk menjalankan proyek di komputer lokal Anda:

1.  **Clone Repositori**
    ```bash
    git clone https://github.com/username/smart-manufacturing-system.git
    cd smart-manufacturing-system
    ```

2.  **Instal Dependensi PHP**
    ```bash
    composer install
    ```

3.  **Instal Dependensi Frontend**
    ```bash
    npm install
    ```

4.  **Konfigurasi Environment**
    Salin file `.env.example` ke `.env` dan sesuaikan konfigurasi database Anda.
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    Pastikan pengaturan database di `.env` sesuai:
    ```env
    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=smart_manufacturing
    DB_USERNAME=postgres
    DB_PASSWORD=password_anda
    ```

5.  **Migrasi Database & Seeding**
    Jalankan migrasi untuk membuat tabel dan stored procedures, lalu isi dengan data awal.
    ```bash
    php artisan migrate --seed
    ```

6.  **Jalankan Build Frontend**
    ```bash
    npm run build
    ```

## ▶️ Cara Menjalankan Aplikasi

Anda perlu menjalankan beberapa terminal secara bersamaan agar sistem berjalan penuh:

1.  **Jalankan Server Laravel** (atau gunakan Laravel Herd/Valet)
    ```bash
    php artisan serve
    ```

2.  **Jalankan Server WebSocket (Reverb)**
    Penting untuk fitur realtime.
    ```bash
    php artisan reverb:start
    ```

3.  **Jalankan Queue Worker**
    Untuk memproses pekerjaan latar belakang.
    ```bash
    php artisan queue:work
    ```

4.  **Jalankan Simulator Mesin (Opsional)**
    Untuk melihat data masuk secara realtime tanpa mesin fisik.
    ```bash
    php artisan machines:simulate --interval=2
    ```

Buka browser dan kunjungi `http://localhost:8000` (atau URL Herd Anda) untuk melihat aplikasi.

## 🧪 Menjalankan Tes

Proyek ini dilengkapi dengan suite pengujian otomatis menggunakan Pest.

```bash
php artisan test
```