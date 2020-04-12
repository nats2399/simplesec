var express = require('express');
var router = express.Router();
const mysqlconnection = require("../dbconnection");


/* GET add page. */
router.get('/order/add', function(req, res, next) {

	let sql = `CALL SELECT_ALLPRODUCTS()`;
	
	let sql2 = `CALL SELECT_ORDERINFOTOCREATE("`+req.session.username+`")`;

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
							
							res.render('employeeAdd', { title: 'Add New Order', order:orderInfo, products:productlist, rows:initialrow, user: req.session.username});


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
});


/* GET add page. */
router.post('/order/accept', function(req, res, next) {
	
	console.log(req.body);

	var username = req.session.username;
	var ordescription = req.body.orderdescription;
	var oraccept = req.body.accept;
	var productlist = ''.concat("[",req.body.productID,"]");
	var quantitylist = ''.concat("[",req.body.quantity,"]");
	
	
	/* Calculate HASH */
	var ordernumber = req.body.ordernumber;
	var orderstatus = req.body.orderstatus;
	var orderedby = req.body.orderedby;
	var orderdepartment = req.body.orderdepartment;
	var shipping = req.body.shipping;
	var supervisor = req.body.supervisor;
	var orderdescription = req.body.orderdescription;
	var productID = req.body.productID;
	var quantity = req.body.quantity;
	
	


	let sql = `CALL ADD_ORDER("`+username+ `","` + ordescription+ `","` +oraccept+ `","` +productlist+ `","` +quantitylist+`")`;

	//console.log(sql);

	mysqlconnection.query(sql, function (err, result, fields) 
	{
		if (err) 
			throw err; 
		else
		{
			//console.log("SUCCESS");
			res.redirect('/employeeIndex');
		}
	});

	

});



module.exports = router;