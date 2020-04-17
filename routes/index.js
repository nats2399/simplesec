var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SimpleSec' });
});

/* GET Supervisor home page. */
router.get('/supervisorIndex', function(req, res, next) {
  res.render('supervisorIndex', { title: 'Welcome Supervisor', user: req.session.username, session: req.session});
});

/* GET Employee home page. */
router.get('/employeeIndex', function(req, res, next) {
  res.render('employeeIndex', { title: 'Welcome Employee', user: req.session.username, session: req.session});
});

/* GET Employee home page. */
router.get('/dashboard', function(req, res, next) {

  if(req.session.role=='Employee')
    res.render('employeeIndex', { title: 'Welcome Employee', user: req.session.username, session: req.session});
  else if(req.session.role=='Supervisor')
    res.render('employeeIndex', { title: 'Welcome Employee', user: req.session.username, session: req.session});
  else if(req.session.role=='ordersupervisor')
    res.render('employeeIndex', { title: 'Welcome Employee', user: req.session.username, session: req.session});
  else
    res.redirect('/users/login');

});


module.exports = router;
