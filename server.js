const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { nanoid } = require('nanoid');
const app = express();
const PORT = 3000;
const connectionLink = "mongodb+srv://chauhanayushb2:admin@cluster0.s6v1qxs.mongodb.net/url-shortner";
const db = mongoose.connection;
const urlSchema = new mongoose.Schema({
  shortUrl: String,
  longUrl: String,
});
mongoose.connect(connectionLink);
const Url = mongoose.model('Url', urlSchema);

app.use(cors());
app.use(bodyParser.json());

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log(`Connected to Database ${db.host}`);
});

app.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'Missing longUrl in the request body' });
  }

  const shortUrl = nanoid(7);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const completeShortUrl = `${baseUrl}/${shortUrl}`;

  await Url.create({ shortUrl, longUrl });
  res.json({ shortUrl: completeShortUrl });
});

app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const urlRecord = await Url.findOne({ shortUrl });

  if (!urlRecord) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(urlRecord.longUrl);
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
