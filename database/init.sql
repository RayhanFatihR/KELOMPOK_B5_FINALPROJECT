-- ================================
-- DATABASE: PENYEWAAN MOTOR
-- Kelompok: B5
-- ================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables
DROP TABLE IF EXISTS penyewaan;
DROP TABLE IF EXISTS penyewa;
DROP TABLE IF EXISTS motor;

-- -------------------------------
-- TABLE: motor
-- -------------------------------
CREATE TABLE motor (
    id_motor INT AUTO_INCREMENT PRIMARY KEY,
    nama_motor VARCHAR(100) NOT NULL,
    nomor_polisi VARCHAR(20) NOT NULL UNIQUE,
    status_motor ENUM('Tersedia', 'Disewa') DEFAULT 'Tersedia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status_motor (status_motor),
    INDEX idx_nomor_polisi (nomor_polisi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------
-- TABLE: penyewa
-- -------------------------------
CREATE TABLE penyewa (
    id_penyewa INT AUTO_INCREMENT PRIMARY KEY,
    nama_penyewa VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    alamat TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nama_penyewa (nama_penyewa),
    INDEX idx_no_hp (no_hp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------
-- TABLE: penyewaan
-- -------------------------------
CREATE TABLE penyewaan (
    id_sewa INT AUTO_INCREMENT PRIMARY KEY,
    id_motor INT NOT NULL,
    id_penyewa INT NOT NULL,
    tanggal_sewa DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    status_sewa ENUM('Disewa', 'Selesai') DEFAULT 'Disewa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_penyewaan_motor
        FOREIGN KEY (id_motor)
        REFERENCES motor(id_motor)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_penyewaan_penyewa
        FOREIGN KEY (id_penyewa)
        REFERENCES penyewa(id_penyewa)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    CONSTRAINT chk_tanggal_valid 
        CHECK (tanggal_kembali >= tanggal_sewa),
    
    INDEX idx_id_motor (id_motor),
    INDEX idx_id_penyewa (id_penyewa),
    INDEX idx_tanggal_sewa (tanggal_sewa),
    INDEX idx_status_sewa (status_sewa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================
-- INITIAL DATA
-- ================================

-- Data Motor
INSERT INTO motor (nama_motor, nomor_polisi, status_motor) VALUES
('Honda Beat 2023', 'B 1234 ABC', 'Tersedia'),
('Yamaha NMAX 2024', 'B 5678 DEF', 'Tersedia'),
('Suzuki Satria FU', 'B 9101 GHI', 'Tersedia'),
('Honda Vario 160', 'B 1122 JKL', 'Tersedia'),
('Yamaha Aerox 155', 'B 3344 MNO', 'Tersedia'),
('Honda Scoopy', 'B 5566 PQR', 'Tersedia'),
('Yamaha Mio', 'B 7788 STU', 'Tersedia');

-- Data Penyewa
INSERT INTO penyewa (nama_penyewa, no_hp, alamat) VALUES
('Andi Pratama', '081234567890', 'Jl. Merdeka No. 10, Jakarta Pusat'),
('Budi Santoso', '082345678901', 'Jl. Sudirman No. 25, Bandung'),
('Citra Lestari', '083456789012', 'Jl. Pemuda No. 5, Surabaya'),
('Dewi Sartika', '084567890123', 'Jl. Gatot Subroto No. 15, Yogyakarta'),
('Eko Prasetyo', '085678901234', 'Jl. Ahmad Yani No. 30, Semarang');

-- Sample Penyewaan (Optional)
INSERT INTO penyewaan (id_motor, id_penyewa, tanggal_sewa, tanggal_kembali, status_sewa) VALUES
(2, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Disewa');

-- Update motor status
UPDATE motor SET status_motor = 'Disewa' WHERE id_motor = 2;

-- ================================
-- VIEWS (untuk reporting)
-- ================================
CREATE OR REPLACE VIEW v_penyewaan_aktif AS
SELECT 
    p.id_sewa,
    m.nama_motor,
    m.nomor_polisi,
    m.status_motor,
    py.nama_penyewa,
    py.no_hp,
    py.alamat,
    p.tanggal_sewa,
    p.tanggal_kembali,
    p.status_sewa,
    DATEDIFF(p.tanggal_kembali, CURDATE()) AS sisa_hari,
    p.created_at
FROM penyewaan p
JOIN motor m ON p.id_motor = m.id_motor
JOIN penyewa py ON p.id_penyewa = py.id_penyewa
WHERE p.status_sewa = 'Disewa'
ORDER BY p.tanggal_sewa DESC;

-- View untuk statistik
CREATE OR REPLACE VIEW v_statistik_motor AS
SELECT 
    m.id_motor,
    m.nama_motor,
    m.nomor_polisi,
    m.status_motor,
    COUNT(p.id_sewa) AS total_penyewaan,
    COALESCE(SUM(CASE WHEN p.status_sewa = 'Disewa' THEN 1 ELSE 0 END), 0) AS sedang_disewa
FROM motor m
LEFT JOIN penyewaan p ON m.id_motor = p.id_motor
GROUP BY m.id_motor, m.nama_motor, m.nomor_polisi, m.status_motor
ORDER BY total_penyewaan DESC;

