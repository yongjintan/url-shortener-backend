require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { DataTypes } = require('sequelize');
const sequelize = require('./config/database');
const crypto = require('crypto');

// Initialize Express
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Define the URL model
const Url = sequelize.define('url_shortener', {
  longUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  shortUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

// Sync Database
sequelize
  .sync()
  .then(() => console.log('Database synced with PostgreSQL'))
  .catch((error) => console.error('Error syncing database:', error));

// Utility to generate a random short string
const generateShortString = () => crypto.randomBytes(4).toString('hex');

// API to generate a unique short URL
app.post('/api/shorten', async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'longUrl is required' });
  }

  try {
    // Check if the URL is already shortened
    const existingUrl = await Url.findOne({ where: { longUrl } });
    if (existingUrl) {
      return res.json({ shortUrl: existingUrl.shortUrl });
    }

    // Generate a unique short URL with a maximum of 10 attempts
    const maxAttempts = 10;
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const shortString = generateShortString();
      const shortUrl = `${process.env.BASE_URL}/${shortString}`;

      const existingShortUrl = await Url.findOne({ where: { shortUrl } });
      if (!existingShortUrl) {
        // Save the mapping in the database
        const newUrl = await Url.create({ longUrl, shortUrl });
        return res.json({ shortUrl: newUrl.shortUrl });
      }
    }

    // If no unique URL is found within the limit, throw an error
    throw new Error(`Failed to generate a unique short URL after ${maxAttempts} attempts.`);
  } catch (error) {
    console.error('Error generating short URL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// API to redirect to the long URL based on the short string
app.get('/:shortString', async (req, res) => {
  const { shortString } = req.params;
  const shortUrl = `${process.env.BASE_URL}/${shortString}`;

  try {
    // Find the long URL based on the short URL
    const urlEntry = await Url.findOne({ where: { shortUrl } });

    if (urlEntry) {
      // Redirect to the long URL
      return res.redirect(urlEntry.longUrl);
    } else {
      // If the short URL is not found, return a 404 error
      return res.status(404).json({ error: 'Short URL not found' });
    }
  } catch (error) {
    console.error('Error finding long URL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;