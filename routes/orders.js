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

/* GET View orders page. */
router.get('/vOrders', function(req, res, next) {
  res.render('vOrders', { title: 'View Orders' });
});

router.get('/getOrders', function(request, response) {
  var email = request.session.username;
  var orderid='';
	let sql = 'call FEATCH_ORDER_DETAILS("'+orderid+'","'+email+'")';
  mysqlconnection.query(sql, function(err, results, fields) {
    if(!err)
      {
      if (results.length > 0) {
            
        var orderdetails = (JSON.parse(JSON.stringify(results)))[0];
        
        request.session.orderdetails = orderdetails;
        var orderlist=new Map(),i=0,  orderid=0;
        var singleOrder = new Array();
        orderdetails.forEach(order => {
          if(orderid!=order.oOrderID){
            i=0;
            singleOrder =  new Array();
          }            
          singleOrder[i++]=order;    
          
          
          if(orderid!=order.oOrderID){
            
            orderid=order.oOrderID;
          }      
          if(orderid!=0){
            orderlist[orderid]=singleOrder;
          }     
        });
        console.log(orderlist);  
        response.render('vOrders', { title: 'View Orders',orderdetails: orderlist});
        //response.redirect('/orders/vOrders');
      } else {
        response.send('No Data found');
      }			
      response.end();
    }
    else{
      response.send({"ERROR":err});
        return console.error(err.message);
    }
  });
});





module.exports = router;
