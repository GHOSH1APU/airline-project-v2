const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({ region: process.env.AWS_REGION || "us-east-1" });

const publishEvent = async (topicArn, message) => {
  try {
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(message),
    });
    const response = await snsClient.send(command);
    console.log(`📤 Event published to SNS. MessageId: ${response.MessageId}`);
  } catch (err) {
    console.error('❌ SNS publish failed:', err);
  }
};

module.exports = { publishEvent };
