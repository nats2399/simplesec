var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SimpleSec' });
});

/* GET Supervisor home page. */
router.get('/supervisorIndex', function(req, res, next) {
  res.render('supervisorIndex', { title: 'Welcome Supervisor', user: req.session.username});
});

/* GET Employee home page. */
router.get('/employeeIndex', function(req, res, next) {
  res.render('employeeIndex', { title: 'Welcome Employee', user: req.session.username});
});



module.exports = router;
