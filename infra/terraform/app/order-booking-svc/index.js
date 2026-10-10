const express = require('express');
const app = express();
app.use(express.json());

app.post('/book', (req, res) => {
  const { userId, flightId, amount } = req.body;
  console.log(`Booking request received - User: ${userId}, Flight: ${flightId}`);
  
  res.status(202).json({
    message: "Booking accepted and is being processed",
    bookingReference: `BKG-${Math.floor(Math.random() * 1000000)}`,
    status: "CONFIRMED"
  });
});

app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(8080, () => console.log('Booking Service running on port 8080'));
