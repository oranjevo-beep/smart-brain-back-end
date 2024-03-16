const express = require('express');
const app = express();
require('dotenv').config();
const { Pool } = require('pg');
const knex = require('knex');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE');
    return res.status(200).json({});
  }
  next();
});
app.use(cors());
app.use(bodyParser.json());
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const saltRounds = 10; // for bcrypt

app.get('/', (req, res) => {
  res.send('it is working');
});
app.post('/signin', signin.handleSignIn(db, bcrypt));
app.post('/register', (req, res) => {
  register.handleRegister(req, res, db, bcrypt, saltRounds);
});
app.get('/profile/:id', (req, res) => {
  profile.handleProfile(req, res, db);
});
app.put('/image', (req, res) => {
  image.handleImage(req, res, db);
});
app.post('/imageurl', (req, res) => {
  image.handleApiCall(req, res);
});
app.listen(PORT, () => {
  console.log(`app is running on PORT ${PORT}`);
});
