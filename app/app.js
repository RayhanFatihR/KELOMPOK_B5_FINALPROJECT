require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// READ
app.get("/", (req, res) => {
  db.query(
    `SELECT penyewaan.id_sewa, motor.nama_motor, penyewa.nama_penyewa,
     penyewaan.tanggal_sewa, penyewaan.tanggal_kembali, penyewaan.status_sewa
     FROM penyewaan
     JOIN motor ON penyewaan.id_motor = motor.id_motor
     JOIN penyewa ON penyewaan.id_penyewa = penyewa.id_penyewa`,
    (err, data) => {
      res.render("index", { data });
    }
  );
});

// CREATE
app.post("/sewa", (req, res) => {
  const { id_motor, id_penyewa, tanggal_sewa, tanggal_kembali } = req.body;
  db.query(
    "INSERT INTO penyewaan (id_motor, id_penyewa, tanggal_sewa, tanggal_kembali, status_sewa) VALUES (?, ?, ?, ?, 'Disewa')",
    [id_motor, id_penyewa, tanggal_sewa, tanggal_kembali],
    () => res.redirect("/")
  );
});

// DELETE
app.get("/hapus/:id", (req, res) => {
  db.query(
    "DELETE FROM penyewaan WHERE id_sewa=?",
    [req.params.id],
    () => res.redirect("/")
  );
});

app.listen(process.env.APP_PORT, () => {
  console.log("App running on port", process.env.APP_PORT);
});
