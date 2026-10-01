const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db'); // Nee db.js

const app = express();
app.use(cors());
app.use(express.json());

console.log("Starting server with MySQL...");

const photographersData = [
  {
    id: 1, name: "Raju Wedding Studio", image: "https://images.unsplash.com/photo-1519741497674-611481863552", location: "Kakinada", speciality: "Wedding", rating: 4.8, reviews: 320, experience: "8 Years",
    categoryPrice: { Wedding: 15000, Birthday: 8000, Candid: 12000, "Pre-Wedding": 10000, Haldi: 7000, "Brand shoots": 15000 },
    portfolio: {
      Wedding: ["https://images.unsplash.com/photo-1519741497674-611481863552","https://images.unsplash.com/photo-1511285560929-80b456fea0bc"],
      Birthday: ["https://images.unsplash.com/photo-1530103862676-de8c9debad1d"],
      Candid: ["https://images.unsplash.com/photo-1542038784456-1ea8e935640e"],
      "Pre-Wedding": ["https://images.unsplash.com/photo-1520854221256-17451ccdf07b"],
      Haldi: ["https://images.unsplash.com/photo-1519741497674-611481863552"],
      "Brand shoots": ["https://images.unsplash.com/photo-1554048612-b6a97ae9aa07"]
    }
  },
  {
    id: 2, name: "Sai Candid Clicks", image: "https://images.unsplash.com/photo-1554048612-b6a97ae9aa07", location: "Hyderabad", speciality: "Candid", rating: 4.9, reviews: 450, experience: "10 Years",
    categoryPrice: { Wedding: 20000, Birthday: 10000, Candid: 18000, "Pre-Wedding": 15000, Haldi: 9000, "Brand shoots": 20000 },
    portfolio: { Wedding: ["https://images.unsplash.com/photo-1583939003579-730e3918a45a"], Candid: ["https://images.unsplash.com/photo-1542038784456-1ea8e935640e"] }
  }
];

app.get('/api/photographers', (req, res) => res.json(photographersData));
app.get('/api/photographers/:id', (req, res) => res.json(photographersData.find(p=>p.id==req.params.id) || photographersData[0]));

app.post('/api/book', async (req, res) => {
  const { clientName, phone, date, event, photographerId } = req.body;
  console.log("Booking:", req.body);
  try {
    // Nee table lo unna columns ke match ayyela
    await db.query(
      "INSERT INTO bookings (user_id, photographer_id, event_type, event_date, status) VALUES (1, ?, ?, ?, 'pending')",
      [photographerId, event, date]
    );
    console.log("✅ Saved to MySQL!");
    res.json({success:true});
  } catch (err) {
    console.error("DB Error:", err.message);
    res.json({success:false, error: err.message});
  }
});

// My Bookings kosam
app.get('/api/bookings', async (req,res) => {
  try {
    const [rows] = await db.query("SELECT * FROM bookings ORDER BY id DESC");
    res.json(rows);
  } catch(e){ res.json([]); }
});
// Photographer ki vachina bookings chupinchadaniki
app.get('/api/photographer/:id/bookings', async (req,res) => {
  const [rows] = await db.query("SELECT * FROM bookings WHERE photographer_id =? ORDER BY id DESC", [req.params.id]);
  res.json(rows);
});
// My Bookings - phone tho check cheyyadaniki
app.get('/api/bookings/check/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;
    const [rows] = await db.query(`
      SELECT b.* FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE u.phone =?
      ORDER BY b.id DESC
    `, [phone]);

    // CORRECT - emi lekapothe empty array pampali, anthe!
    res.json(rows);

  } catch(err){
    console.error(err.message);
    res.json([]); // error vasthe kuda empty
  }
});

// Accept / Reject API
app.put('/api/bookings/:id', async (req,res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  await db.query("UPDATE bookings SET status =? WHERE id =?", [status, req.params.id]);
  console.log(`Booking ${req.params.id} -> ${status}`);
  res.json({success:true, status});
});
app.listen(5000, () => console.log("✅ Backend + MySQL Running on 5000"));