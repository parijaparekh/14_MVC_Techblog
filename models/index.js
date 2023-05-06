const User = require('./User');
const Comment = require('./Comment');
const Post = require('./Post');

User.hasMany(Post, {
  foreignKey: 'username',
  onDelete: 'cascade',
});

Post.belongsTo(User, {
  foreignKey: 'username',
});

Post.hasMany(Comment, {
  foreignKey: 'post_id',
  onDelete: 'cascade',
});

Comment.belongsTo(User, {
  foreignKey: 'username',
});

module.exports = { User, Comment, Post };
