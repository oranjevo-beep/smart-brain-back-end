const express = require('express');
require('dotenv').config();
const { Pool } = require('pg');
const knex = require('knex');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const PORT = process.env.DATABASE_URL;
const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.use(cors());
const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
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
