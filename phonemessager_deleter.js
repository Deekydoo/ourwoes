const twilio = require('twilio');

// Your Account SID and Auth Token from twilio.com/console
const accountSid = 'twilio sid here';
const authToken = 'auth token here';
const client = new twilio(accountSid, authToken);

// Function to delete all messages
async function deleteAllMessages() {
  try {
    // Fetch the list of messages
    const messages = await client.messages.list({ limit: 1000 }); // Adjust the limit if needed

    // Iterate through each message and delete
    for (const message of messages) {
      await client.messages(message.sid).remove();
      console.log(`Deleted message SID: ${message.sid}`);
    }

    console.log('All messages deleted successfully.');
  } catch (error) {
    console.error('Error deleting messages:', error);
  }
}

// Call the function to delete all messages
deleteAllMessages();
