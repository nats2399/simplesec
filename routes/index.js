var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SimpleSec' });
});

/* GET Supervisor home page. */
router.get('/supervisorIndex', function(req, res, next) {
  if(!req.session.username)
	{
		res.redirect('/users/login');
  }
  else{
    
    res.render('supervisorIndex', { title: 'Welcome Supervisor', user: req.session.username, session: req.session});
  }
});

/* GET Employee home page. */
router.get('/employeeIndex', function(req, res, next) {
  if(!req.session.username)
	{
		res.redirect('/users/login');
  }
  else{
    
    res.render('employeeIndex', { title: 'Welcome Employee', user: req.session.username, session: req.session});
  }
});

/* GET Orders Department Supervisor home page. */
router.get('/ordersDeptIndex', function(req, res, next) {
  if(!req.session.username)
	{
		res.redirect('/users/login');
  }
  else{
    
    res.render('ordersDeptIndex', { title: 'Welcome Orders Dept Supervisor', user: req.session.username, session: req.session});
  }
  
});

/* GET Employee home page. */
router.get('/dashboard', function(req, res, next) {
  
  

  if(req.session.role=='Employee')
    res.render('employeeIndex', { title: 'Welcome Employee', user: req.session.username, session: req.session});
  else if(req.session.role=='Supervisor')
    res.render('employeeIndex', { title: 'Welcome Supervisor', user: req.session.username, session: req.session});
  else if(req.session.role=='ordersupervisor')
    res.render('ordersDeptIndex', { title: 'Welcome Orders Dept Supervisor', user: req.session.username, session: req.session});
  else
    res.redirect('/users/login');

});
/* GET about. */
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'SimpleSec About'});
});

/* GET Team. */
router.get('/team', function(req, res, next) {
  res.render('team', { title: 'Meet Our Experts'});
});


/* GET Resources. */
router.get('/resources', function(req, res, next) {
  res.render('resources', { title: 'SimpleSec Resources'});
});
/* GET Support. */
router.get('/support', function(req, res, next) {
  res.render('support', { title: 'SimpleSec Support'});
});



module.exports = router;
