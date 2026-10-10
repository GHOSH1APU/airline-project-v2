const express = require('express');
const app = express();

// CORS Middleware (সব ডোমেইন থেকে রিকোয়েস্ট অ্যালাউ করার জন্য)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/search', (req, res) => {
    res.json({ 
        status: "success",
        flights: [
            { id: 'GL-7029', from: 'CCU', to: 'DXB', price: '450 USD', status: 'Available', airline: 'Global Airways' }
        ] 
    });
});

app.get('/book', (req, res) => {
    res.json({ status: "success", message: "Flight booked successfully!", pnr: "GL-7029" });
});

app.listen(80, () => {
    console.log('Global Airways API running on port 80 with CORS enabled');
});
