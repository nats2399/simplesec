var express = require('express');
var router = express.Router();
const mysqlconnection = require("../dbconnection");
var CryptoJS = require("crypto-js");
var rsa = require("jsrsasign");

//const { check, validationResult } = require('express-validator');


/* GET add page. */
router.get('/order/add', function(req, res, next) {

	let sql = `CALL SELECT_ALLPRODUCTS()`;
	
	let sql2 = `CALL SELECT_ORDERINFOTOCREATE("`+req.session.username+`")`;

	if(!req.session.username)
	{
		res.redirect('/users/login');
	}
	else
	{
		mysqlconnection.query(sql, function (err, result, fields) 
		{
			if (err) 
				throw err; 
			else
				if (result.length > 0) {
					var productlist = JSON.parse(JSON.stringify(result[0]));
					
					//console.log(productlist);
					//var initialproduct = productlist[0];
					//var initialrow = {initialproduct};
					
					var initialrow = {};
					
					mysqlconnection.query(sql2, function (err2, result2, fields2) 
					{
						if (err) 
							throw err; 
						else
							if (result2.length > 0) 
							{
								var orderInfo= JSON.parse(JSON.stringify(result2[0]));

								console.log(orderInfo);
								
								res.render('employeeAdd', { title: 'Add New Order', order:orderInfo, products:productlist, rows:initialrow, user: req.session.username, publickeyarea: orderInfo[0].userpublicKey});


							} else {
								router.get('/errormsg', function(req, res, next) {
									res.render('errormsg', { title: 'ATTENTION!' , errormessage: 'There was a problem gettin the information to create a new order. Please try againg later.' , user: req.session.username});
								});
							}
					}); 
							
			
				} else {
					router.get('/errormsg', function(req, res, next) {
					res.render('errormsg', { title: 'ATTENTION!' , errormessage: 'There are not products available' , user: req.session.username});
				});          
			}			
			//res.end();
		});
	}
});











/* GET add page. */
router.post('/order/accept', function(req, res, next) {
	
	var username = req.session.username;
	var ordescription = req.body.orderdescription;
	var oraccept = req.body.accept;
	var productlist = ''.concat("[",req.body.productID,"]");
	var quantitylist = ''.concat("[",req.body.quantity,"]");
	var ordertime = require('moment')().format('YYYY-MM-DD HH:mm:ss');

	var ipublickey = req.body.publickeytext;
	var iprivatekey = req.body.privatekeytext;
	
	var ordernumber = req.body.ordernumber;
	var orderstatus = req.body.orderstatus;
	var orderedby = req.body.orderedby;
	var orderdepartment = req.body.orderdepartment;
	var shipping = req.body.shipping;
	var supervisor = req.body.supervisor;
	var orderdescription = req.body.orderdescription;
	var productID = req.body.productID;
	var quantity = req.body.quantity;
	
	var dsignEmployee = "";
	

	if (!username || !productlist || !quantitylist) {
		
		console.log("USER NOT FOUND");
		res.render('employeeIndex', { title: 'Welcome Employee', messagee: 'OOPS! There was a problem processing your order. Please try again.'});
		

	} else {
		
		/* Calculate HASH */
		orderstring = ''.concat(username, shipping, orderdescription, productID, quantity, ordertime);
		orderhash = CryptoJS.SHA3(orderstring, { outputLength: 512 });

		if(oraccept=='submit'){
			// Calculate signature

			// 1. SIGN
			var plaintext = orderstring;

			console.log('----SEARCH-----');
			console.log(plaintext.search("-----BEGIN RSA PRIVATE KEY-----"));

			// Remove unnecessary strings
			var privatekeyform = iprivatekey.replace(/\\n/g, '\n');
			var publickeyform = ipublickey.replace(/\\n/g, '\n');
			
			console.log('----PRIVATE KEY FORM-----');
			console.log(privatekeyform);
			console.log('----PRIVATE KEY SIZE-----');
			console.log(privatekeyform.length);
		
			// Read the keys
			var prvHex = rsa.KEYUTIL.getKey(privatekeyform);
			var prvObj = rsa.KEYUTIL.getKey(prvHex, '', "PKCS1PRV");
			
			var pubHex = rsa.KEYUTIL.getKey(publickeyform);
			var pubObj = rsa.KEYUTIL.getKey(pubHex, '', "PKCS1PRV");

			let sig = new rsa.KJUR.crypto.Signature({"alg":"SHA256withRSA"});
			sig.init(prvObj);
			var sigValueHex = sig.signString(plaintext)

			// 2. VERIFY
			let sig1 = new rsa.KJUR.crypto.Signature({"alg":"SHA256withRSA"});
			sig1.init(pubObj);
			sig1.updateString(plaintext);
			let isValid = sig1.verify(sigValueHex);
			
			console.log("SIGNATURE "+sigValueHex);

			if(isValid==true){
				console.log("the keys pair match");
				dsignEmployee = sigValueHex;
			}
			else
			{
				console.log("the keys DONT pair match");
				res.render('employeeIndex', { title: 'Welcome Employee', messagee: 'OOPS! Your keys does not match. Please try again.'});
			}
			

		}

		/* ADD ORDER TO DB*/

		let sql = `CALL ADD_ORDER("`+username+ `","` + ordescription+ `","` +oraccept+ `","` +productlist+ `","` +quantitylist+ `","` +ordertime+ `","` +orderhash+ `","` +dsignEmployee+`")`;

		//console.log(sql);

		mysqlconnection.query(sql, function (err, result, fields) 
		{
			if (err) 
				throw err; 
			else
			{
				console.log("SUCCESS");
				res.render('employeeIndex', { title: 'Welcome Employee', message: 'Your order was saved succesfully!'});
			}
		});
	}
	
	

});



module.exports = router;