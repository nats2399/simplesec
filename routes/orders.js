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
  res.render('vOrders', { title: 'View Order' , user: request.session.username});
});

router.get('/getOrders', function(request, response) {
  var email = '';
  var orderStatus = '';
  var orderdepartment = '';
  var status = request.query.status;
  if(request.session.username)
  {
    if( request.session.role=='Employee')
      {
        email = request.session.username;
        if(status=='todo')
        {
          orderStatus = 'In Progress';
        }
      }
      if( request.session.role=='Supervisor'){
        if(status=='todo')
        {
          orderStatus = 'Submitted';
        }
        else
        {
          //orderStatus = 'Submitted,Rejected';
        }
        orderdepartment = request.session.dept;
      } 
      if( request.session.role=='ordersupervisor'){
        orderStatus = 'Approved';
      }  
    var orderid='';
    let sql = 'call FEATCH_ORDER_DETAILS("","'+email+'","'+orderStatus+'","'+orderdepartment+'")';
    
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
          
          response.render('vOrders', { title: 'View Order',orderdetails: orderlist, session: request.session, user: request.session.username});
          //response.redirect('/orders/vOrders');
        } else {
          response.render('vOrders', { title: 'No Orders Found'});
        }			
        response.end();
      }
      else{
        response.send({"ERROR":err});
          return console.error(err.message);
      }
    });
  }
  else{
    response.redirect("/users/login");
  }
});

/* GET viewOrder page. */
router.get('/viewOrder', function(request, response) {

  if(!request.session.username)
	{
		response.redirect('/users/login');
	}
	else
	{
    var orderid = request.query.orderId;
    console.log(orderid);  
    var email = '';
    var orderStatus = '';
    var orderdepartment = '';
    
    if( request.session.role=='Employee')
      {
        email = request.session.username;
      }
      if( request.session.role=='Supervisor'){
        orderStatus = 'Submitted';
        orderdepartment = request.session.dept;
      } 
      if( request.session.role=='ordersupervisor'){
        orderStatus = 'Approved';
      }  
    let sql = 'call FEATCH_ORDER_DETAILS("'+orderid+'","'+email+'","'+orderStatus+'","'+orderdepartment+'")';
    
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
          
          response.render('vSingleOrder', { title: 'View Order',orderdetails: orderlist, session: request.session});
          //response.redirect('/orders/vOrders');
        } else {
          response.render('vSingleOrder', { title: 'No Orders Found'});
        }			
        response.end();
      }
      else{
        response.send({"ERROR":err});
          return console.error(err.message);
      }
    });
  }
});




module.exports = router;
