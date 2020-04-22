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

								res.render('supervisorApprove', { title: 'Approve Order', order:orderInfo, products:productlist, rows:orderDetails, user: req.session.username, publickeyarea: orderInfo[0].suppublicKey, session: req.session});


							} else {
								router.get('/errormsg', function(req, res, next) {
									res.render('errormsg', { title: 'ATTENTION!' , errormessage: 'There was a problem gettin the information to create a new order. Please try againg later.' , user: req.session.username, session: req.session});
								});
							}
					}); 
							
			
				} else {
					router.get('/errormsg', function(req, res, next) {
					res.render('errormsg', { title: 'ATTENTION!' , errormessage: 'There are not products available' , user: req.session.username, session: req.session});
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
    
    var employeepublickey = req.body.emppubkeytext;
	
	var ordernumber = req.body.ordernumber;
	var orderstatus = req.body.orderstatus;
    var orderedby = req.body.orderedby;
    var orderHashIN = req.body.oOrderHash;
    var orderSignEmpIN = req.body.digitalSignEmployee;
    var orderByEmail = req.body.orderByEmail;
	var orderdepartment = req.body.orderdepartment;
	var shipping = req.body.shipping;
	var supervisor = req.body.supervisor;
	var orderdescription = req.body.orderdescription;
	var productID = req.body.productID;
	var quantity = req.body.quantity;
	
    var dsignSupervisor = "";
    var oOrderstatus = '';
    var oOrderDetails = '';
    
    
    var errMsg = '';
    var SuccMsg = '';
    var caseNo = '';

	if (!username || !productlist || !quantitylist || !iprivatekey) {
		console.log("USER NOT FOUND");
		res.render('supervisorIndex', { title: 'Welcome Supervisor', messagee: 'OOPS! There was a problem processing your order. Please try again.'});
	} else {
		
		/* 1. Calculate & Compare HASH */
		orderstring = ''.concat(orderByEmail, shipping, orderdescription, productID, quantity, ordertime);
        orderhash = CryptoJS.SHA3(orderstring, { outputLength: 512 });
        
        if(orderHashIN==orderhash)
        {
            // 2. Verify Employee Signature
            var emppublickeyform = employeepublickey.replace(/\\n/g, '\n');
            
            var emppubHex = rsa.KEYUTIL.getKey(emppublickeyform);
            var emppubObj = rsa.KEYUTIL.getKey(emppubHex, '', "PKCS1PRV");
            
            let sigEmp = new rsa.KJUR.crypto.Signature({"alg":"SHA256withRSA"});
			sigEmp.init(emppubObj);
            sigEmp.updateString(orderstring);
            let sigValueHexIn = orderSignEmpIN;
            let sigEmpisValid = sigEmp.verify(sigValueHexIn);

            if (sigEmpisValid==true){
                // 3. Sign order by Supervisor
                // Calculate signature

                var plaintext = orderstring;

                // Remove unnecessary strings
                var privatekeyform = iprivatekey.replace(/\\n/g, '\n');
                var publickeyform = ipublickey.replace(/\\n/g, '\n');
                
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
                
                //console.log("isValid "+isValid);
                if(isValid==true){
                    console.log("the keys pair match for supervisor");
                    dsignSupervisor = sigValueHex;

                    caseNo = '4'
                }
                else
                {
                    caseNo = '3'
                    errMsg = 'OOPS! Your keys does not match. Please try again.';
                }
            }
            else{
                caseNo = '2'
                errMsg = 'OOPS! The order signature from the employee is not valid. Please try again.';
            }
        }
        else{
            caseNo = '1'
            errMsg = 'OOPS! The order has been altered. Please try again.'
            //console.log("HASH NOT EQUAL");
    		//res.render('supervisorIndex', { title: 'Welcome Supervisor', messagee: 'OOPS! The order has been altered. Please try again.'});
        }

        if(caseNo=='1')
        {
            oOrderstatus = 'INVALID';
            oOrderDetails = 'The order has been altered.';
        }
        else if(caseNo=='2')
        {
            oOrderstatus = 'INVALID';
            oOrderDetails = 'The order signature from the employee is not valid.';
        }
        else if(caseNo=='3')
        {
            oOrderstatus = orderstatus;
            oOrderDetails = 'The private key from the supervisor is not valid.';
        }
        else if(caseNo=='4')
        {
            if(oraccept=='approve')
                oOrderstatus = 'Approved';
            if(oraccept=='reject')
                oOrderstatus = 'Rejected';
            oOrderDetails = 'The order was '+oOrderstatus+' succesfully!';            
            SuccMsg = 'The order was '+oOrderstatus+' succesfully!';
        }

        let sql = `CALL UPDATE_ORDER_SUP("`+ordernumber+ `","` + oOrderstatus+ `","` +oOrderDetails+ `","` +dsignSupervisor+`","/")`;

        console.log(sql);
        mysqlconnection.query(sql, function (err, result, fields) 
        {
            if (err) 
                throw err; 
            else
            {
                //call to send email
                if(caseNo=='4')
                    res.redirect('/mail/sendmail/'+ordernumber);
                else
                    res.render('supervisorIndex', { title: 'Welcome Supervisor', message: SuccMsg, messagee:errMsg});
                

            }
        });


	}
	
	

});














module.exports = router;