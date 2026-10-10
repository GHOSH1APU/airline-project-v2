const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const app = express();
app.use(express.json());

// 1. AWS DynamoDB Client Setup
const client = new DynamoDBClient({ region: process.env.DYNAMODB_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

app.post('/book', async (req, res) => {
  const { userId, flightId, amount } = req.body;
  const bookingReference = `BKG-${Math.floor(Math.random() * 1000000)}`;

  try {
    // 2. Prepare data for DynamoDB
    const params = {
      TableName: process.env.DYNAMODB_TABLE || 'airline-user-profiles',
      Item: {
        userId: userId || "guest", // Assuming userId is the Partition Key
        bookingReference: bookingReference,
        flightId: flightId,
        amount: amount,
        status: "CONFIRMED",
        createdAt: new Date().toISOString()
      }
    };

    // 3. Save to AWS DynamoDB
    await docClient.send(new PutCommand(params));
    console.log(`✅ Successfully saved booking ${bookingReference} to AWS DynamoDB!`);

    res.status(202).json({
      message: "Booking accepted and saved to DynamoDB",
      bookingReference: bookingReference,
      status: "CONFIRMED"
    });
  } catch (error) {
    console.error("❌ AWS DynamoDB Error:", error.message);
    res.status(500).json({ error: "Failed to process booking in DynamoDB" });
  }
});

// Health check endpoint for Kubernetes
app.get('/health', (req, res) => res.status(200).send('OK'));

app.listen(8080, () => console.log('🚀 Booking Service running on port 8080'));
