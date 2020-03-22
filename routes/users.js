var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var rand = require('csprng');

const mysqlconnection = require("../dbconnection.js");

const transporter = nodemailer.createTransport({
  service: 'gmail',//smtp.gmail.com  //in place of service use host...
  secure: false,//true
  port: 25,//465
  auth: {
    user: 'simplesec.info@gmail.com',
    pass: 'Simplesec123.'
  }, tls: {
    rejectUnauthorized: false
  }
});



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET home page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Sign Up' });
});

/* GET registration successfull page. */
router.get('/registrationSucc', function(req, res, next) {
  res.render('registrationSucc', { title: 'Registration Successfull' });
});





/* POST registration form*/
router.post('/register', (req, res) => {

  var ValNumber = rand(160, 36);
  let sql = `CALL ADD_USER("`+ req.body.firstName + `" , "` + req.body.lastName + `" , "` + req.body.email +  `" , "` + req.body.pw + `" , "` + req.body.department +  `" , "` + req.body.role + `" , "` + req.body.phone + `" , "` + req.body.address + `" , "` + req.body.secQuestion + `" , "` + req.body.secAnswer + `" , "` + ValNumber +  `")`;

  console.log(sql);

  var mailOptions = {
    from: 'simplesec.info@gmail.com',
    to: req.body.email,
    subject: 'SimpleSec: Thank you for registering!',
    html: '<h1 style="color: #002868;">WELCOME TO SimpleSec '+ req.body.firstName +' !</h1> <h2 style="color: #bf0a30;">Thank you for Registering:</h2> <p> Please use this Validation Number to generate your Private Key: <br><br>'+ ValNumber+' <br><br> Please visit <a href="//localhost:3000/generateKeys">this link to download your Private Key</a> </p>'
  };

  mysqlconnection.query(sql, (err, results, fields)=>{
    if(!err)
    {
      //res.send({"Success":"Success"}); 
      //res.render('registrationSucc', { title: 'RegistrationSucc' });   
      //console.log(results);

      if(results.affectedRows == 1){
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
            console.log("Success!");
            res.redirect('/users/registrationSucc'); 

          }
        });
      }
    }
    else{
      res.send({"ERROR":err});
      return console.error(err.message);
    }
  });
  

})


module.exports = router;
