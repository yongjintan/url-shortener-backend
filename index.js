require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const crypto = require('crypto');

// Initialize Express
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Sequelize (PostgreSQL)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: require('pg'),
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false, // Disable logging for cleaner output
});

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

    // Generate a unique short URL
    let shortUrl;
    let isUnique = false;

    while (!isUnique) {
      const shortString = generateShortString();
      shortUrl = `${process.env.BASE_URL}/${shortString}`;
      const existingShortUrl = await Url.findOne({ where: { shortUrl } });
      if (!existingShortUrl) {
        isUnique = true;
      }
    }

    // Save the mapping in the database
    const newUrl = await Url.create({ longUrl, shortUrl });

    res.json({ shortUrl: newUrl.shortUrl });
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
app.listen(PORT, () => {
  console.log(`Server is running`);
});
