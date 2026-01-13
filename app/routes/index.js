const express = require("express");
const router = express.Router();
const connectDB = require("../config/database");

// =========================
// READ (Dashboard)
// =========================
router.get("/", async (req, res) => {
  try {
    const db = await connectDB(); // ambil pool

    const [motor] = await db.query("SELECT * FROM motor");
    const [penyewa] = await db.query("SELECT * FROM penyewa");
    const [penyewaan] = await db.query(
      `SELECT penyewaan.id_sewa,
              motor.nama_motor,
              penyewa.nama_penyewa,
              penyewaan.tanggal_sewa,
              penyewaan.tanggal_kembali,
              penyewaan.status_sewa
       FROM penyewaan
       JOIN motor ON penyewaan.id_motor = motor.id_motor
       JOIN penyewa ON penyewaan.id_penyewa = penyewa.id_penyewa`
    );

    res.render("index", { motor, penyewa, penyewaan });

  } catch (err) {
    console.error("❌ Database query error:", err);
    res.status(500).send("Database query failed");
  }
});

// =========================
// CRUD MOTOR
// =========================
router.post("/motor", async (req, res) => {
  try {
    const db = await connectDB();
    const { nama_motor, nomor_polisi } = req.body;

    await db.query(
      "INSERT INTO motor (nama_motor, nomor_polisi, status_motor) VALUES (?, ?, 'Tersedia')",
      [nama_motor, nomor_polisi]
    );

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database query failed");
  }
});

router.get("/motor/delete/:id", async (req, res) => {
  try {
    const db = await connectDB();
    await db.query("DELETE FROM motor WHERE id_motor=?", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database query failed");
  }
});

// =========================
// CRUD PENYEWA
// =========================
router.post("/penyewa", async (req, res) => {
  const { nama_penyewa, no_hp, alamat } = req.body;
  try {
    await db.query(
      "INSERT INTO penyewa (nama_penyewa, no_hp, alamat) VALUES (?, ?, ?)",
      [nama_penyewa, no_hp, alamat]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add penyewa");
  }
});

router.get("/penyewa/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM penyewa WHERE id_penyewa=?", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete penyewa");
  }
});

// =========================
// CRUD PENYEWAAN
// =========================
router.post("/sewa", async (req, res) => {
  const { id_motor, id_penyewa, tanggal_sewa, tanggal_kembali } = req.body;
  try {
    await db.query(
      "INSERT INTO penyewaan (id_motor, id_penyewa, tanggal_sewa, tanggal_kembali, status_sewa) VALUES (?, ?, ?, ?, 'Disewa')",
      [id_motor, id_penyewa, tanggal_sewa, tanggal_kembali]
    );

    await db.query(
      "UPDATE motor SET status_motor='Disewa' WHERE id_motor=?",
      [id_motor]
    );

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add penyewaan");
  }
});

router.get("/sewa/selesai/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT id_motor FROM penyewaan WHERE id_sewa=?",
      [req.params.id]
    );
    const id_motor = result[0].id_motor;

    await db.query("DELETE FROM penyewaan WHERE id_sewa=?", [req.params.id]);
    await db.query(
      "UPDATE motor SET status_motor='Tersedia' WHERE id_motor=?",
      [id_motor]
    );

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to finish penyewaan");
  }
});

module.exports = router;
