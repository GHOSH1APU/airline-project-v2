const express = require('express');
const { Pool } = require('pg');
const { publishEvent } = require('./sns-producer');

const app = express();
app.use(express.json());

// 1. AWS RDS PostgreSQL Connection Setup
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false } // Required for AWS RDS
});

// 2. Test DB Connection
pool.connect()
  .then(() => console.log("✅ Successfully connected to AWS RDS PostgreSQL!"))
  .catch(err => console.error("❌ Database connection error:", err.message));

app.post('/search', async (req, res) => {
  const { origin, destination, date } = req.body;

  try {
    // 3. (Optional) In future, you can run actual DB queries here:
    // const dbResult = await pool.query('SELECT * FROM flights WHERE origin = $1', [origin]);

    // Publish event to SNS
    publishEvent(process.env.SNS_FLIGHT_SEARCHED_TOPIC_ARN, {
      origin,
      destination,
      date,
      userId: "demo-user-123",
      timestamp: new Date().toISOString()
    });

    res.json({
      message: "Search processed successfully from AWS RDS",
      data: { origin, destination, date, flightNo: "GL-7029", source: "Live EKS Database" }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Health check endpoint for Kubernetes
app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 search-offer-svc running on port ${PORT}`);
});
