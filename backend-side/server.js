const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();


app.use(cors()); // Enable CORS for cross-origin requests
app.use(bodyParser.json()); // Parse incoming JSON requests

// Twilio credentials
const accountSid = 'AC21441d13c81b83527e7380cf5e17f8a9'; // Replace with your Account SID
const authToken = 'b4089b2ee1ecb8e9a3c5f70f1c81504c';     // Replace with your Auth Token
const client = twilio(accountSid, authToken);

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',      // Your database host (usually localhost)
  user: 'root',           // Your database user
  password: 'J@karta251205',   // Your MySQL password
  database: 'RuralVoices_Feed', // Your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Endpoint to fetch SMS messages
app.get('/api/sms', (req, res) => {
  const excludedNumber = "+17173470476"

  client.messages.list()
    .then(messages => {

      const filteredMessages = messages.filter(m => (m.from !== excludedNumber && m.body !== "Thanks for the message. Configure your number's SMS URL to change this message.Reply HELP for help.Reply STOP to unsubscribe.Msg&Data rates may apply."));

      // Insert each filtered message into the MySQL database
      filteredMessages.forEach(message => {
        const { body, from, dateSent } = message;
        const sql = `INSERT INTO sms_messages (body, from_number, date_sent) VALUES (?, ?, ?)`;

        // Check for duplicates
        db.query('SELECT * FROM sms_messages WHERE body = ?', [body], (err, results) => {
          if (err) {
            console.error('Error checking for duplicates:', err);
            return;
          }

        // If no duplicates found, insert the message
        if (results.length === 0) {
          db.query(sql, [body, from, dateSent], (err, result) => {
            if (err) {
              console.error('Error inserting message:', err);
            } else {
              console.log('Message inserted:', result.insertId);
            }
          });
        } else {
          console.log('Duplicate message found, not inserting:', body);
        }
      });
    });

      const messageBodies = filteredMessages.map(m => m.body); // Extract message bodies
      res.json(messageBodies); // Send message bodies as a JSON response
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
      res.status(500).send('Error fetching messages');

    });

});

// Define an API endpoint to get data from the database
app.get('/api/data', (req, res) => {
  const sql = 'SELECT * FROM sms_messages ORDER BY date_sent DESC';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    console.log('Query result:', result);
    res.json(result);
  });
});

// Start the server
const port = 5001; // The port your backend will run on
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



// ================Post Directly to the Website================

// // Endpoint to fetch SMS messages
// app.get('/api/sms', (req, res) => {
//   const excludedNumber = "+17173470476"

//   client.messages.list()
//     .then(messages => {

//       const filteredMessages = messages.filter(m => (m.from !== excludedNumber && m.body !== "Thanks for the message. Configure your number's SMS URL to change this message.Reply HELP for help.Reply STOP to unsubscribe.Msg&Data rates may apply."
// ));

//       const messageBodies = filteredMessages.map(m => m.body); // Extract message bodies
//       res.json(messageBodies); // Send message bodies as a JSON response
//     })
//     .catch(error => {
//       console.error('Error fetching messages:', error);
//       res.status(500).send('Error fetching messages');
//     });
// });