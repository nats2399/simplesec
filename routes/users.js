var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var rand = require('csprng');
var rsa = require("jsrsasign");

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



/* GET users home page */
router.get('/', function(req, res, next) {
  res.send('Home page');
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('Login', { title: 'Login' });
});

/* GET home page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Sign Up' });
});

/* GET registration successfull page. */
router.get('/registrationSucc', function(req, res, next) {
  res.render('registrationSucc', { title: 'Registration Successfull' });
});

/* GET Generate Keys page. */
router.get('/generateKeys', function(req, res, next) {
  res.render('generateKeys', { title: 'Generate Private Key' , publickey: 'Public Key', privatekey: 'Private Key'});
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



router.post('/generateKeys/auth', function(request, response) {
	var username = request.body.username;
    var password = request.body.password;
    var validaitonNum = request.body.validationNum;
    

	let sql = `CALL AUTH_Number("`+ username + `" , "` + password + `" , "` + validaitonNum + `")`;

	if (username && password && validaitonNum) {
		mysqlconnection.query(sql, function(err, results, fields) {
			if(!err)
    		{
				if (results.length > 0) {
            
          let key = rsa.KEYUTIL.generateKeypair("RSA", 2048);
          
          let publicKey = rsa.KEYUTIL.getPEM(key.pubKeyObj);
          let privateKey = rsa.KEYUTIL.getPEM(key.prvKeyObj, "PKCS1PRV");
          
          response.render('generateKeysAuth', { title: 'Download Key' , email: username, publickeyarea: publicKey, privatekeyarea: privateKey});                      

					
				} else {
					response.send('Incorrect Username and/or Password and/or Validaiton Number!');
				}			
				response.end();
			}
			else{
                response.send({"ERROR":err});
                return console.error(err.message);
			}
		});
	} else {
		response.send('Please enter Username, Password, and Validaiton Number!');
		response.end();
	}
});




router.post('/generateKeys/auth/download', function(req, res, next) {
    
  //Create the private key file and prepare it to download
  res.setHeader('Content-disposition', 'attachment; filename=private_key.txt');
  res.setHeader('Content-type', 'text/plain');
  res.charset = 'UTF-8';
  res.write(req.body.privatekeytext);
  //res.end();
  
  //Save public key in DB
    let sql = `CALL INSERT_PUBLICKEY("`+ req.body.email + `" , "` + req.body.publickeytext + `")`;

    mysqlconnection.query(sql, (err, results, fields)=>{
      if(!err)
      {
        console.log("public key saved")        
      }
      else{
        //res.send({"ERROR":err});
        return console.error(err.message);
      }
    });

    

    res.redirect('/');
    //res.end();

});


router.post('/login/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	let sql = `CALL LOGIN_USERS("`+ username + `" , "` + password + `")`;

	if (username && password) {
		mysqlconnection.query(sql, function(err, results, fields) {
			if(!err)
    		{
				if (results.length > 0) {
					
					var userFound = (JSON.parse(JSON.stringify(results[0])))[0];

					request.session.valid = null; 
					request.session.loggedin = true;
					request.session.username = userFound.oEmail;
					request.session.role = userFound.oRole;

          // if the roles is admin, deploy admin page
          
					if(userFound.oRole=='Supervisor'){
						response.redirect('/supervisorIndex');
					}
					else if(userFound.oRole=='Employee'){
						response.redirect('/employeeIndex');
					}
					

				} else {
					response.send('Incorrect Username and/or Password!');
				}			
				response.end();
			}
			else{
				response.send({"ERROR":err});
			    return console.error(err.message);
			}
		});
	} else {
		request.session.valid = null; 
		request.session.loggedin = false;
		response.send('Please enter Username and Password!');
		response.end();
	}
});







module.exports = router;
