const express = require("express");
const router = express.Router();

// =========================
// HOMEPAGE / DASHBOARD
// =========================
router.get("/", async (req, res) => {
  try {
    const [motor] = await req.db.query(
      "SELECT * FROM motor ORDER BY id_motor DESC"
    );
    
    const [penyewa] = await req.db.query(
      "SELECT * FROM penyewa ORDER BY id_penyewa DESC"
    );
    
    const [penyewaan] = await req.db.query(
      `SELECT 
        penyewaan.id_sewa,
        motor.nama_motor,
        motor.nomor_polisi,
        penyewa.nama_penyewa,
        penyewa.no_hp,
        penyewaan.tanggal_sewa,
        penyewaan.tanggal_kembali,
        penyewaan.status_sewa,
        DATEDIFF(penyewaan.tanggal_kembali, CURDATE()) AS sisa_hari
       FROM penyewaan
       JOIN motor ON penyewaan.id_motor = motor.id_motor
       JOIN penyewa ON penyewaan.id_penyewa = penyewa.id_penyewa
       WHERE penyewaan.status_sewa = 'Disewa'
       ORDER BY penyewaan.tanggal_sewa DESC`
    );

    res.render("index", { 
      motor, 
      penyewa, 
      penyewaan,
      error: null,
      success: null
    });

  } catch (err) {
    console.error("❌ Database query error:", err);
    res.status(500).render("error", {
      message: "Gagal mengambil data dari database",
      error: err
    });
  }
});

// =========================
// CRUD MOTOR
// =========================
router.post("/motor", async (req, res) => {
  try {
    const { nama_motor, nomor_polisi } = req.body;

    // Validasi input
    if (!nama_motor || !nomor_polisi) {
      return res.status(400).send("❌ Nama motor dan nomor polisi harus diisi!");
    }

    // Cek duplikasi nomor polisi
    const [existing] = await req.db.query(
      "SELECT id_motor FROM motor WHERE nomor_polisi = ?",
      [nomor_polisi.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).send("❌ Nomor polisi sudah terdaftar!");
    }

    await req.db.query(
      "INSERT INTO motor (nama_motor, nomor_polisi, status_motor) VALUES (?, ?, 'Tersedia')",
      [nama_motor.trim(), nomor_polisi.trim().toUpperCase()]
    );

    console.log(`✅ Motor added: ${nama_motor} (${nomor_polisi})`);
    res.redirect("/");

  } catch (err) {
    console.error("❌ Error adding motor:", err);
    res.status(500).send(`Gagal menambah motor: ${err.message}`);
  }
});

router.get("/motor/delete/:id", async (req, res) => {
  try {
    // Cek apakah motor sedang disewa
    const [check] = await req.db.query(
      "SELECT * FROM penyewaan WHERE id_motor = ? AND status_sewa = 'Disewa'",
      [req.params.id]
    );

    if (check.length > 0) {
      return res.status(400).send("❌ Motor sedang disewa, tidak dapat dihapus!");
    }

    const [result] = await req.db.query(
      "DELETE FROM motor WHERE id_motor = ?", 
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("❌ Motor tidak ditemukan!");
    }

    console.log(`✅ Motor deleted: ID ${req.params.id}`);
    res.redirect("/");

  } catch (err) {
    console.error("❌ Error deleting motor:", err);
    res.status(500).send(`Gagal menghapus motor: ${err.message}`);
  }
});

// =========================
// CRUD PENYEWA
// =========================
router.post("/penyewa", async (req, res) => {
  try {
    const { nama_penyewa, no_hp, alamat } = req.body;

    // Validasi input
    if (!nama_penyewa || !no_hp || !alamat) {
      return res.status(400).send("❌ Semua field harus diisi!");
    }

    await req.db.query(
      "INSERT INTO penyewa (nama_penyewa, no_hp, alamat) VALUES (?, ?, ?)",
      [nama_penyewa.trim(), no_hp.trim(), alamat.trim()]
    );

    console.log(`✅ Penyewa added: ${nama_penyewa}`);
    res.redirect("/");

  } catch (err) {
    console.error("❌ Error adding penyewa:", err);
    res.status(500).send(`Gagal menambah penyewa: ${err.message}`);
  }
});

router.get("/penyewa/delete/:id", async (req, res) => {
  try {
    // Cek apakah penyewa memiliki transaksi aktif
    const [check] = await req.db.query(
      "SELECT * FROM penyewaan WHERE id_penyewa = ? AND status_sewa = 'Disewa'",
      [req.params.id]
    );

    if (check.length > 0) {
      return res.status(400).send("❌ Penyewa masih memiliki transaksi aktif!");
    }

    const [result] = await req.db.query(
      "DELETE FROM penyewa WHERE id_penyewa = ?", 
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("❌ Penyewa tidak ditemukan!");
    }

    console.log(`✅ Penyewa deleted: ID ${req.params.id}`);
    res.redirect("/");

  } catch (err) {
    console.error("❌ Error deleting penyewa:", err);
    res.status(500).send(`Gagal menghapus penyewa: ${err.message}`);
  }
});

// =========================
// CRUD PENYEWAAN
// =========================
router.post("/sewa", async (req, res) => {
  const connection = await req.db.getConnection();
  
  try {
    const { id_motor, id_penyewa, tanggal_sewa, tanggal_kembali } = req.body;

    // Validasi input
    if (!id_motor || !id_penyewa || !tanggal_sewa || !tanggal_kembali) {
      return res.status(400).send("❌ Semua field harus diisi!");
    }

    // Validasi tanggal
    if (new Date(tanggal_kembali) < new Date(tanggal_sewa)) {
      return res.status(400).send("❌ Tanggal kembali harus setelah tanggal sewa!");
    }

    await connection.beginTransaction();

    // Cek status motor
    const [motor] = await connection.query(
      "SELECT nama_motor, status_motor FROM motor WHERE id_motor = ?",
      [id_motor]
    );

    if (motor.length === 0) {
      throw new Error("Motor tidak ditemukan!");
    }

    if (motor[0].status_motor === 'Disewa') {
      throw new Error(`Motor ${motor[0].nama_motor} sedang disewa!`);
    }

    // Insert penyewaan
    await connection.query(
      "INSERT INTO penyewaan (id_motor, id_penyewa, tanggal_sewa, tanggal_kembali, status_sewa) VALUES (?, ?, ?, ?, 'Disewa')",
      [id_motor, id_penyewa, tanggal_sewa, tanggal_kembali]
    );

    // Update status motor
    await connection.query(
      "UPDATE motor SET status_motor = 'Disewa' WHERE id_motor = ?",
      [id_motor]
    );

    await connection.commit();
    console.log(`✅ Penyewaan created: Motor ID ${id_motor}, Penyewa ID ${id_penyewa}`);
    res.redirect("/");

  } catch (err) {
    await connection.rollback();
    console.error("❌ Error adding penyewaan:", err);
    res.status(500).send(`Gagal menambah penyewaan: ${err.message}`);
  } finally {
    connection.release();
  }
});

router.get("/sewa/selesai/:id", async (req, res) => {
  const connection = await req.db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Ambil data penyewaan
    const [result] = await connection.query(
      "SELECT id_motor, id_penyewa FROM penyewaan WHERE id_sewa = ?",
      [req.params.id]
    );

    if (result.length === 0) {
      throw new Error("Data penyewaan tidak ditemukan!");
    }

    const { id_motor } = result[0];

    // Hapus data penyewaan
    await connection.query(
      "DELETE FROM penyewaan WHERE id_sewa = ?", 
      [req.params.id]
    );

    // Update status motor menjadi tersedia
    await connection.query(
      "UPDATE motor SET status_motor = 'Tersedia' WHERE id_motor = ?",
      [id_motor]
    );

    await connection.commit();
    console.log(`✅ Penyewaan completed: ID ${req.params.id}`);
    res.redirect("/");

  } catch (err) {
    await connection.rollback();
    console.error("❌ Error finishing penyewaan:", err);
    res.status(500).send(`Gagal menyelesaikan penyewaan: ${err.message}`);
  } finally {
    connection.release();
  }
});

module.exports = router;