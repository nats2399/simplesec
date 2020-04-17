var express = require('express');
var router = express.Router();
const mysqlconnection = require("../dbconnection");


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

								//console.log("RESULTS");
								//console.log(orderInfo);

								//console.log("orderInfo");
								//console.log(orderInfo);
								
								res.render('employeeAdd', { title: 'Edit Order', order:orderInfo, products:productlist, rows:orderDetails, user: req.session.username, publickeyarea: orderInfo[0].userpublicKey, session: req.session});


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

module.exports = router;