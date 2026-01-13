-- TODO: Tulis query SQL kalian di sini (CREATE TABLE & INSERT) untuk inisialisasi database otomatis

-- -------------------------------
-- TABEL MOTOR
-- -------------------------------
CREATE TABLE IF NOT EXISTS motor (
    id_motor INT AUTO_INCREMENT PRIMARY KEY,
    nama_motor VARCHAR(100) NOT NULL,
    nomor_polisi VARCHAR(20) NOT NULL,
    status_motor ENUM('Tersedia', 'Disewa') DEFAULT 'Tersedia'
);

-- -------------------------------
-- TABEL PENYEWA
-- -------------------------------
CREATE TABLE IF NOT EXISTS penyewa (
    id_penyewa INT AUTO_INCREMENT PRIMARY KEY,
    nama_penyewa VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    alamat TEXT NOT NULL
);

-- -------------------------------
-- TABEL PENYEWAAN
-- -------------------------------
CREATE TABLE IF NOT EXISTS penyewaan (
    id_sewa INT AUTO_INCREMENT PRIMARY KEY,
    id_motor INT NOT NULL,
    id_penyewa INT NOT NULL,
    tanggal_sewa DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    status_sewa ENUM('Disewa') DEFAULT 'Disewa',

    CONSTRAINT fk_motor
      FOREIGN KEY (id_motor)
      REFERENCES motor(id_motor)
      ON DELETE CASCADE,

    CONSTRAINT fk_penyewa
      FOREIGN KEY (id_penyewa)
      REFERENCES penyewa(id_penyewa)
      ON DELETE CASCADE
);

-- -------------------------------
-- DATA AWAL (INSERT)
-- -------------------------------

-- Data Motor
INSERT INTO motor (nama_motor, nomor_polisi, status_motor) VALUES
('Honda Beat', 'B 1234 ABC', 'Tersedia'),
('Yamaha NMAX', 'B 5678 DEF', 'Tersedia'),
('Suzuki Satria', 'B 9101 GHI', 'Tersedia');

-- Data Penyewa
INSERT INTO penyewa (nama_penyewa, no_hp, alamat) VALUES
('Andi Pratama', '081234567890', 'Jakarta'),
('Budi Santoso', '082345678901', 'Bandung'),
('Citra Lestari', '083456789012', 'Surabaya');
