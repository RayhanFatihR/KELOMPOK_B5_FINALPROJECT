<<<<<<< HEAD
<<<<<<< HEAD
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");

const app = express();

// =========================
// Middleware
// =========================
=======
// TODO: Ini adalah titik masuk aplikasi, setup Express, Middleware, dan Server Listener disini

require("dotenv").config();
=======
>>>>>>> ec6fdfb (2)
const express = require("express");
const app = express();
const connectDB = require("./config/database");

<<<<<<< HEAD
// Middleware
>>>>>>> d7f8d39 (1)
=======
// Middleware, parser, view engine, dll.
>>>>>>> ec6fdfb (2)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

<<<<<<< HEAD
<<<<<<< HEAD
// =========================
// Database Connection
// =========================
const db = mysql.createConnection({
  host: process.env.DB_HOST,     // service name docker
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

// =========================
// READ (Dashboard)
// =========================
app.get("/", (req, res) => {
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

          res.render("index", {
            motor,
            penyewa,
            penyewaan
          });
        }
      );
    });
  });
});

// =========================
// CRUD MOTOR
// =========================

// CREATE Motor
app.post("/motor", (req, res) => {
  const { nama_motor, nomor_polisi } = req.body;
  db.query(
    "INSERT INTO motor (nama_motor, nomor_polisi, status_motor) VALUES (?, ?, 'Tersedia')",
    [nama_motor, nomor_polisi],
    () => res.redirect("/")
  );
});

// UPDATE Motor
app.post("/motor/update/:id", (req, res) => {
  const { nama_motor, nomor_polisi, status_motor } = req.body;
  db.query(
    "UPDATE motor SET nama_motor=?, nomor_polisi=?, status_motor=? WHERE id_motor=?",
    [nama_motor, nomor_polisi, status_motor, req.params.id],
    () => res.redirect("/")
  );
});

// DELETE Motor
app.get("/motor/delete/:id", (req, res) => {
  db.query(
    "DELETE FROM motor WHERE id_motor=?",
    [req.params.id],
    () => res.redirect("/")
  );
});

// =========================
// CRUD PENYEWA
// =========================

// CREATE Penyewa
app.post("/penyewa", (req, res) => {
  const { nama_penyewa, no_hp, alamat } = req.body;
  db.query(
    "INSERT INTO penyewa (nama_penyewa, no_hp, alamat) VALUES (?, ?, ?)",
    [nama_penyewa, no_hp, alamat],
    () => res.redirect("/")
  );
});

// UPDATE Penyewa
app.post("/penyewa/update/:id", (req, res) => {
  const { nama_penyewa, no_hp, alamat } = req.body;
  db.query(
    "UPDATE penyewa SET nama_penyewa=?, no_hp=?, alamat=? WHERE id_penyewa=?",
    [nama_penyewa, no_hp, alamat, req.params.id],
    () => res.redirect("/")
  );
});

// DELETE Penyewa
app.get("/penyewa/delete/:id", (req, res) => {
  db.query(
    "DELETE FROM penyewa WHERE id_penyewa=?",
    [req.params.id],
    () => res.redirect("/")
  );
});

// =========================
// CRUD PENYEWAAN
// =========================

// CREATE Penyewaan
app.post("/sewa", (req, res) => {
  const { id_motor, id_penyewa, tanggal_sewa, tanggal_kembali } = req.body;

  db.query(
    "INSERT INTO penyewaan (id_motor, id_penyewa, tanggal_sewa, tanggal_kembali, status_sewa) VALUES (?, ?, ?, ?, 'Disewa')",
    [id_motor, id_penyewa, tanggal_sewa, tanggal_kembali],
    () => {
      // update status motor
      db.query(
        "UPDATE motor SET status_motor='Disewa' WHERE id_motor=?",
        [id_motor],
        () => res.redirect("/")
      );
    }
  );
});

// DELETE Penyewaan (Kembalikan Motor)
app.get("/sewa/selesai/:id", (req, res) => {
  const id_sewa = req.params.id;

  db.query(
    "SELECT id_motor FROM penyewaan WHERE id_sewa=?",
    [id_sewa],
    (err, result) => {
      const id_motor = result[0].id_motor;

      db.query(
        "DELETE FROM penyewaan WHERE id_sewa=?",
        [id_sewa],
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

// =========================
// Server
// =========================
app.listen(process.env.APP_PORT, () => {
  console.log(`App running on port ${process.env.APP_PORT}`);
});
=======
// Inject DB pool ke request
app.use((req, res, next) => {
  req.db = db;
  next();
});
=======
async function startServer() {
  const db = await connectDB(); // sekarang aman pakai await
  app.use((req, res, next) => {
    req.db = db; // inject pool ke setiap request
    next();
  });
>>>>>>> ec6fdfb (2)

  // Routes
  const routes = require("./routes/index");
  app.use("/", routes);

  const PORT = process.env.APP_PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 App running on port ${PORT}`));
}

<<<<<<< HEAD
>>>>>>> d7f8d39 (1)
=======
startServer();
>>>>>>> ec6fdfb (2)
