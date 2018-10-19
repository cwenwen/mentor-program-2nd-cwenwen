const User = require('../model/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports =  {

  register: (req, res) => {
    User
      .create({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, saltRounds),
        nickname: req.body.nickname
      })
      .then(() => {
        req.session.username = req.body.username;
        req.session.nickname = req.body.nickname;
        res.send('ok');
      })
      .catch(error => {
        res.send('error');
      })
  },

  login : (req, res) => {
    User
      .findAll({
        where: {
          username: req.body.username,
        }
      })
      .then(data => {
        if (bcrypt.compareSync(req.body.password, data[0].dataValues.password)) {
          req.session.username = data[0].dataValues.username;
          req.session.nickname = data[0].dataValues.nickname;
          res.send('ok');

        // wrong password
        } else {
          res.send('error');
        }
      })
      .catch(error => {
        res.send('error');
      })
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/');
  }
}