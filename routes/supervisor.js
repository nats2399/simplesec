var express = require('express');
var router = express.Router();
const mysqlconnection = require("../dbconnection");
var CryptoJS = require("crypto-js");
var rsa = require("jsrsasign");

/* GET edit page. */
router.get('/order/approve/:iordernumber', function(req, res, next) {
    
    var ordernumber = req.params.iordernumber;

    let sql = `CALL SELECT_ALLPRODUCTS()`;
    let sql2 = `CALL SELECT_ORDERINFOTOAPPROVE("`+req.session.username+`","`+ordernumber+`")`;

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

								var orderDetails = JSON.parse(JSON.stringify(result2[1]));

								res.render('supervisorApprove', { title: 'Approve Order', order:orderInfo, products:productlist, rows:orderDetails, user: req.session.username, publickeyarea: orderInfo[0].emppublicKey, session: req.session});


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















router.post('/order/accept', function(req, res, next) {
    
    var username = req.session.username;
	var ordescription = req.body.orderdescription;
	var oraccept = req.body.accept;
	var productlist = ''.concat("[",req.body.productID,"]");
	var quantitylist = ''.concat("[",req.body.quantity,"]");
    
    var ordertime = require('moment')(req.body.orderTime).format('YYYY-MM-DD HH:mm:ss');
    
	var ipublickey = req.body.publickeytext;
	var iprivatekey = req.body.privatekeytext;
	
	var ordernumber = req.body.ordernumber;
	var orderstatus = req.body.orderstatus;
    var orderedby = req.body.orderedby;
    var orderHashIN = req.body.oOrderHash;
    var orderByEmail = req.body.orderByEmail;
	var orderdepartment = req.body.orderdepartment;
	var shipping = req.body.shipping;
	var supervisor = req.body.supervisor;
	var orderdescription = req.body.orderdescription;
	var productID = req.body.productID;
	var quantity = req.body.quantity;
	
	var dsignEmployee = "";
	

	if (!username || !productlist || !quantitylist || !iprivatekey) {
		console.log("USER NOT FOUND");
		res.render('supervisorIndex', { title: 'Welcome Supervisor', messagee: 'OOPS! There was a problem processing your order. Please try again.'});
	} else {
		
		/* Calculate ^ Compare HASH */
		orderstring = ''.concat(orderByEmail, shipping, orderdescription, productID, quantity, ordertime);
        orderhash = CryptoJS.SHA3(orderstring, { outputLength: 512 });
        
        if(orderHashIN==orderhash)
        {

        }
        else{
            console.log("HASH NOT EQUAL");
    		res.render('supervisorIndex', { title: 'Welcome Supervisor', messagee: 'OOPS! The order has been altered. Please try again.'});
        }


        /*
		if(oraccept=='submit' || oraccept=='submitedit'){
			// Calculate signature

			// 1. SIGN
			var plaintext = orderstring;

			//console.log('----SEARCH-----');
			//console.log(plaintext.search("-----BEGIN RSA PRIVATE KEY-----"));

			// Remove unnecessary strings
			var privatekeyform = iprivatekey.replace(/\\n/g, '\n');
			var publickeyform = ipublickey.replace(/\\n/g, '\n');
			
			//console.log('----PRIVATE KEY FORM-----');
			//console.log(privatekeyform);
			//console.log('----PRIVATE KEY SIZE-----');
			//console.log(privatekeyform.length);
		
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

		
		/* ADD ORDER TO DB

		if(isValid==true && oraccept=='submit')
		{
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
		else if(oraccept=='save')
		{
			let sql = `CALL ADD_ORDER("`+username+ `","` + ordescription+ `","` +oraccept+ `","` +productlist+ `","` +quantitylist+ `","` +ordertime+ `","` +orderhash+ `","` +dsignEmployee+`")`;
			//console.log(sql);

			mysqlconnection.query(sql, function (err, result, fields) 
			{
				if (err) 
					throw err; 
				else
				{
					console.log("SUCCESS");
					res.render('employeeIndex', { title: 'Welcome Employee', message: 'Your order was submitted succesfully!'});
				}
			});
		}
		else if(oraccept=='saveedit')
		{
			let sql3 = `CALL UPDATE_ORDER("`+username+ `","` + ordescription+ `","` +oraccept+ `","` +productlist+ `","` +quantitylist+ `","` +ordertime+ `","` +orderhash+ `","` +dsignEmployee+`")`;
			//console.log(sql);

			mysqlconnection.query(sql3, function (err, result, fields) 
			{
				if (err) 
					throw err; 
				else
				{
					console.log("SUCCESS");
					res.render('employeeIndex', { title: 'Welcome Employee', message: 'Your order was submitted succesfully!'});
				}
			});
		}
		else if(oraccept=='submitedit')
		{
			let sql4 = `CALL UPDATE_ORDER("`+username+ `","` + ordescription+ `","` +oraccept+ `","` +productlist+ `","` +quantitylist+ `","` +ordertime+ `","` +orderhash+ `","` +dsignEmployee+`")`;
			//console.log(sql);

			mysqlconnection.query(sql, function (err, result, fields) 
			{
				if (err) 
					throw err; 
				else
				{
					console.log("SUCCESS");
					res.render('employeeIndex', { title: 'Welcome Employee', message: 'Your order was submitted succesfully!'});
				}
			});
		}

		
		*/

	}
	
	

});














module.exports = router;