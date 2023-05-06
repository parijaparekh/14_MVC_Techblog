const router = require('express').Router();
const { Comment, User, Post } = require('../models');
// Import the custom middleware
const withAuth = require('../utils/auth');
const { format_date } = require('../utils/helpers');

// GET all Posts for homepage
router.get('/', async (req, res) => {
  try {
    const dbPostData = await Post.findAll({
      include: [
        {
          model: Post,
          attributes: ['title', 'body', 'author_username', 'date_created'],
        },
      ],
    });

    const Posts = dbPostData.map((post) =>
      post.get({ plain: true })
    );

    res.render('homepage', {
      Posts,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET one Post
// Use the custom middleware before allowing the user to access the Post
router.get('/post/:id', withAuth, async (req, res) => {
  try {
    const dbPostData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: Post,
          attributes: [
            'author_username',
            'title',
            'body',
            'date_created',
            'post_id',
          ],
        }
      ],
    });

    const post = dbPostData.get({ plain: true });
    res.render('post', { post, loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET all comments for post
// Use the custom middleware before allowing the user to access the comments
router.get('/post/:post_id', withAuth, async (req, res) => {
  try {
    const dbCommentData = await Comment.findAll(req.params.post_id);

    const comments = dbCommentData.get({ plain: true });

    res.render('post', { comments, loggedIn: req.session.loggedIn });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }

  res.render('login');
});

// router for new post POST from the dashboard
router.post('/newpost', async (req, res) => {
  try {
    const dbNewPostData = await Post.create({
      post_author: req.session.username,
      title: req.body.title,
      body: req.body.body,
      date_created: format_date,
    });

    req.session.save(() => {
      req.session.loggedIn = true;

      res.status(200).json(dbNewPostData);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//router post for new comments
router.post('/post/:post_id', async (req, res) => {
  try {
    const dbNewCommentData = await Comment.create({
      post_author: req.session.username,
      comment_body: req.body.body,
      post_id: req.params.post_id,
      date_created: format_date,
    });

    req.session.save(() => {
      req.session.loggedIn = true;

      res.status(200).json(dbNewCommentData);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
