require('dotenv').config();

// for sending a 6 digit code via email to the user
const nodemailer = require('nodemailer');

const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/viewer' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const email = `${req.body.email}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  const { premium } = req.body;

  if (!username || !pass || !pass2 || !email) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({
      username, email, password: hash, premium,
    });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/viewer' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

// retrieve our settings
const settingsPage = (req, res) => {
  const { account } = req.session;
  res.render('settings', { user: account });
};

const togglePremium = async (req, res) => {
  if (!req.session.account) return res.status(401).json({ error: 'Not logged in!' });

  try {
    const accountId = req.session.account._id;
    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ error: 'Account not found!' });

    // save premium status to account
    account.premium = !account.premium;
    await account.save();
    req.session.account = Account.toAPI(account);

    return res.json({ premium: account.premium });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred!' });
  }
};

// reset codes, I think this should be able to store multiple codes for
// multiple users at the same time
const resetCodes = {};

// https://nodemailer.com/
// https://stackoverflow.com/questions/26475136/storing-password-securely-nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

// Request a reset code
const requestReset = async (req, res) => {
  if (!req.session.account) return res.status(401).json({ error: 'Not logged in' });

  const { email } = req.session.account;
  // random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // store code based on the session session
  resetCodes[req.sessionID] = code;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Password Reset (SUPER SENSITIVE!!)',
      text: `Your code is: ${code}`,
    });

    // return success so every path returns
    return res.json({ message: 'Reset code sent!' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send email!' });
  }
};

// Reset the account's pass, so long as the code is correct
const resetPassword = async (req, res) => {
  const { code, newPassword } = req.body;

  if (!resetCodes[req.sessionID] || resetCodes[req.sessionID] !== code) {
    return res.status(400).json({ error: 'Invalid code!' });
  }

  delete resetCodes[req.sessionID];

  const account = await Account.findById(req.session.account._id);

  account.password = await Account.generateHash(newPassword);
  await account.save();

  return res.status(200);
};

const getAccountPremium = (req, res) => res.json({ premium: !!req.session.account.premium });

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  settingsPage,
  togglePremium,
  requestReset,
  resetPassword,
  getAccountPremium,
};
