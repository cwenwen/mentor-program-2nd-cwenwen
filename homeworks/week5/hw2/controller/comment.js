const Sequelize = require('sequelize');
const sequelize = require('../model/db');
const Comment = require('../model/comment');
const User = require('../model/user');

User.hasMany(Comment, {foreignKey: 'username'});
Comment.belongsTo(User, {foreignKey: 'username'});

module.exports = {
  
  insertComment: (req, res) => {
    Comment
    .create({
      username: req.session.username,
      topic: req.body.topic,
      content: req.body.content,
      parentId: req.body.parentId
    })
    .then((comment) => {
      const commentId = comment.dataValues.id;
      Comment
        .findAll({
          where: {
            id: commentId
          }
        })
        .then(data => {
          const createdAt = data[0].dataValues.createdAt
          res.send('ok');
        })
        .catch(error => {throw error})
    })
    .catch(error => {throw error})
  },
  
  showComments: (req, res) => {
    let totalPages,
        currentPage,
        commentStartNumber;

    // check if user has logged in
    if (req.session.username) {
      res.locals.user = { 
        username: req.session.username,
        nickname: req.session.nickname
      };
    } else {
      res.locals.user = {
        username: undefined,
        nickname: undefined
      };
    }
    
    // get the number of main comments
    Comment
      .findAll({
        attributes: [[sequelize.fn('COUNT', sequelize.col('parentId')), 'datanum']],
        where: {
          parentId: 0
        }
      })
      .then(data => {
        // calculate the number of pages
        totalPages = Math.ceil(data[0].dataValues.datanum / 10); 
        res.locals.totalPages = totalPages;

        // handle invalid page number
        if (parseInt(req.params.page) < 0 || parseInt(req.params.page) > totalPages || isNaN(parseInt(req.params.page))) {
          res.redirect('/pages/1');

        } else {
          // set current page
          currentPage = parseInt(req.params.page);
          res.locals.currentPage = currentPage;

          // find the first comment of each page
          commentStartNumber = ( currentPage - 1 ) * 10;
        }

        // get 10 comments for current page
        sequelize
          .query('SELECT `comment`.`id` AS `commentId` , `comment`.`username` AS `username` , `comment`.`parentId` AS `parentId` , `comment`.`topic` AS `topic` , `comment`.`content` AS `content` , `comment`.`createdAt` AS `createdAt` , `user`.`nickname` AS `nickname` FROM `cwenwen_comments` AS `comment` INNER JOIN `cwenwen_users` AS `user` ON `comment`.`username` = `user`.`username` WHERE `comment`.`parentId` = 0 ORDER BY `comment`.`createdAt` DESC LIMIT ' + commentStartNumber + ', 10;', { type: sequelize.QueryTypes.SELECT })
          .then(comments => {
            res.locals.comments = comments;

            const nickname = req.session.nickname;
            res.render('index', {nickname});
          })
          .catch(error => {throw error})

      })
      .catch(error => { throw error })
  },

  modifyComment: (req, res) => {

    conn.query({
      sql: 'UPDATE ?? SET content = ? WHERE id = ?',
      values: [commentsTable, req.body.content, req.body.comment_id]
    },(error, results)=>{
  
      if (error) res.send('error');
      else res.send('modified');
    });
  },

  deleteComment: (req, res) => {

    conn.query({
      sql: 'DELETE FROM ?? WHERE id = ? OR parent_id = ?',
      values: [commentsTable, req.body.comment_id, req.body.comment_id]
    }, (error, results) => {
  
      if (error) res.send('error');
      else res.send('comment deleted');
    });
  }
}