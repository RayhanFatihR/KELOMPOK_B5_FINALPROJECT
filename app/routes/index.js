// TODO: Definisikan semua jalur (Route) aplikasi kalian disini (GET, POST, PUT, DELETE)
const express = require("express");
const router = express.Router();

// =========================
// READ (Dashboard)
// =========================
router.get("/", (req, res) => {
  const db = req.db;

  db.query("SELECT * FROM motor", (err1, motor) => {
    if (err1) return res.send(err1);

    db.query("SELECT * FROM penyewa", (err2, penyewa) => {
      if (err2) return res.send(err2);

      db.query(
        `SELECT penyewaan.id_sewa,
                motor.nama_motor,
                penyewa.nama_penyewa,
                penyewaan.tanggal_sewa,
                penyewaan.tanggal_kembali,
                penyewaan.status_sewa
         FROM penyewaan
         JOIN motor ON penyewaan.id_motor = motor.id_motor
         JOIN penyewa ON penyewaan.id_penyewa = penyewa.id_penyewa`,
        (err3, penyewaan) => {
          if (err3) return res.send(err3);

          res.render("index", { motor, penyewa, penyewaan });
        }
      );
    });
  });
});


// =========================
// CRUD MOTOR
// =========================
router.post("/motor", (req, res) => {
  const db = req.db;
  const { nama_motor, nomor_polisi } = req.body;

  db.query(
    "INSERT INTO motor (nama_motor, nomor_polisi, status_motor) VALUES (?, ?, 'Tersedia')",
    [nama_motor, nomor_polisi],
    () => res.redirect("/")
  );
});

router.get("/motor/delete/:id", (req, res) => {
  const db = req.db;

  db.query(
    "DELETE FROM motor WHERE id_motor=?",
    [req.params.id],
    () => res.redirect("/")
  );
});


// =========================
// CRUD PENYEWA
// =========================
router.post("/penyewa", (req, res) => {
  const db = req.db;
  const { nama_penyewa, no_hp, alamat } = req.body;

  db.query(
    "INSERT INTO penyewa (nama_penyewa, no_hp, alamat) VALUES (?, ?, ?)",
    [nama_penyewa, no_hp, alamat],
    () => res.redirect("/")
  );
});

router.get("/penyewa/delete/:id", (req, res) => {
  const db = req.db;

  db.query(
    "DELETE FROM penyewa WHERE id_penyewa=?",
    [req.params.id],
    () => res.redirect("/")
  );
});


// =========================
// CRUD PENYEWAAN
// =========================
router.post("/sewa", (req, res) => {
  const db = req.db;
  const { id_motor, id_penyewa, tanggal_sewa, tanggal_kembali } = req.body;

  db.query(
    "INSERT INTO penyewaan (id_motor, id_penyewa, tanggal_sewa, tanggal_kembali, status_sewa) VALUES (?, ?, ?, ?, 'Disewa')",
    [id_motor, id_penyewa, tanggal_sewa, tanggal_kembali],
    () => {
      db.query(
        "UPDATE motor SET status_motor='Disewa' WHERE id_motor=?",
        [id_motor],
        () => res.redirect("/")
      );
    }
  );
});

router.get("/sewa/selesai/:id", (req, res) => {
  const db = req.db;

  db.query(
    "SELECT id_motor FROM penyewaan WHERE id_sewa=?",
    [req.params.id],
    (err, result) => {
      const id_motor = result[0].id_motor;

      db.query(
        "DELETE FROM penyewaan WHERE id_sewa=?",
        [req.params.id],
        () => {
          db.query(
            "UPDATE motor SET status_motor='Tersedia' WHERE id_motor=?",
            [id_motor],
            () => res.redirect("/")
          );
        }
      );
    }
  );
});

module.exports = router;
