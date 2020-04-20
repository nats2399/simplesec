var os = require('os');
if (os.platform() == 'win32') {  
    if (os.arch() == 'ia32') {
        var chilkat = require('@chilkat/ck-node12-win-ia32');
    } else {
        var chilkat = require('@chilkat/ck-node11-win64'); 
    }
} else if (os.platform() == 'linux') {
    if (os.arch() == 'arm') {
        var chilkat = require('@chilkat/ck-node12-arm');
    } else if (os.arch() == 'x86') {
        var chilkat = require('@chilkat/ck-node12-linux32');
    } else {
        var chilkat = require('@chilkat/ck-node12-linux64');
    }
} else if (os.platform() == 'darwin') {
    var chilkat = require('@chilkat/ck-node12-macosx');
}
var express = require('express');
var router = express.Router();
const mysqlconnection = require("../dbconnection.js");
function chilkatExample(email,subject, body, emailobj) {
    
    console.log('H2222 '+subject);

    // This example requires the Chilkat API to have been previously unlocked.
    // See Global Unlock Sample for sample code.

    // The mailman object is used for sending and receiving email.
    var mailman = new chilkat.MailMan();

    // Set the SMTP server.
    mailman.SmtpHost = "smtp.gmail.com";

    // Set the SMTP login/password (if required)
    mailman.SmtpUsername = "simplesec.info@gmail.com";
    mailman.SmtpPassword = "Simplesec123.";
    
    mailman.SmtpSsl = true;
    mailman.SmtpPort = 465;

    var cert = new chilkat.Cert();
    
   // var success = cert.SetSslClientCert ('');
    var success = cert.LoadFromFile("google.cer");
    if (success !== true) {
        console.log(cert.LastErrorText);
        return;
    }

    

    emailobj.Subject = subject;
    emailobj.Body = body;
    emailobj.From = "SimpleSec Support <simplesec.info@gmail.com>";
   // var success = email.AddTo("Chilkat Admin",to);
    //email.AddTo("Chilkat Admin",'tino.aby@gmail.com')
    // To add more recipients, call AddTo, AddCC, or AddBcc once per recipient.

    // Call SendEmail to connect to the SMTP server and send.
    // The connection (i.e. session) to the SMTP server remains
    // open so that subsequent SendEmail calls may use the
    // same connection.  

    var glob = new chilkat.Global();
    var success = glob.UnlockBundle("Anything for 30-day trial");
    if (success !== true) {
        console.log(glob.LastErrorText);
        return;
    }

    var status = glob.UnlockStatus;
    if (status == 2) {
        console.log("Unlocked using purchased unlock code.");
    }
    else {
        console.log("Unlocked in trial mode.");
    }

    //Indicate that the email is to be sent encrypted.
    emailobj.SendEncrypted = true;

    // Specify the certificate to be used for encryption.
    success = emailobj.SetEncryptCert(cert);

    success = mailman.SendEmail(emailobj);
    if (success !== true) {
        console.log(mailman.LastErrorText);
        return;
    }

    // Some SMTP servers do not actually send the email until 
    // the connection is closed.  In these cases, it is necessary to
    // call CloseSmtpConnection for the mail to be  sent.  
    // Most SMTP servers send the email immediately, and it is 
    // not required to close the connection.  We'll close it here
    // for the example:
    success = mailman.CloseSmtpConnection();
    if (success !== true) {
        console.log("Connection to SMTP server not closed cleanly.");
    }

    console.log("Mail Sent!");

}


router.get('/sendmail', function(request, response) {

    // if Approved/Rejected redirect to supervisorIndex 
    // Create a new email object
    //iorderID, emailSupervisor, orderSupervisorEmail, orderStatus
    var emailObj = new chilkat.Email();
    var iorderID = request.query.iorderID;
    var email = 'mifidoor@gmail.com';
    var subject = 'SimpleSec Order ';
    console.log(iorderID);  
    emailObj.AddTo("",email);

    let sql = `CALL GET_INFOEMAIL("`+iorderID+`")`;
    mysqlconnection.query(sql, function (err, result, fields) 
    {
        if (err) 
            throw err; 
        else
        {
            infoEmail = JSON.parse(JSON.stringify(result[0]))[0];
            console.log(infoEmail)

            iorderID = infoEmail.iorderID;
            emailEmployee = infoEmail.oemailEmployee;
            orderStatus = infoEmail.oOrderStatus;
            supervisorEmail = infoEmail.oemailSupervisor;
            orderSupervisorEmail = infoEmail.oemailOrderSupervisor;
            emailObj.AddTo("",supervisorEmail);
            emailObj.AddTo("",orderSupervisorEmail);
            
                
        }
    });



    sql = 'call FEATCH_ORDER_DETAILS("'+iorderID+'","","","")';
    mysqlconnection.query(sql, function(err, results, fields) {
      if(!err)
        {
        if (results.length > 0) {
            var empName = '';
            var deptName = '';
            var roleName = '';
            var orderStatus = '';
            var shipAddr = '';
            var TotalAmt = '';
            var oOrderDate = '';
          var orderdetails = (JSON.parse(JSON.stringify(results)))[0];
         
          request.session.orderdetails = orderdetails;
          var orderlist=new Map(),i=0,  orderid=0;
          var singleOrder = new Array();
          orderdetails.forEach(order => {
            if(orderid!=order.oOrderID){
                i=0;
                singleOrder =  new Array();
                emailObj.AddTo("",order.oEmail);
                subject = subject + order.oOrderID+'- '+order.oOrderStatus;
                console.log('H ahahahahaha '+subject);
                empName = order.oFirstName+' '+order.oLastName;
                deptName = order.oDeptName;
                roleName = order.oRoleName;
                orderStatus = order.oOrderStatus;
                shipAddr = order.oShippingAddress;
                TotalAmt = order.oTotalCost;
                oOrderDate = new Date(order.oOrderDate).toDateString();
            }            
            singleOrder[i++]=order; 
            
            if(orderid!=order.oOrderID){
              orderid=order.oOrderID;
            }      
            if(orderid!=0){
              orderlist[orderid]=singleOrder;
            }     
          });
          
            // need to add the code to create the message
            var message ="<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>The HTML5 Herald</title></head> <body>";
            message += "<div> <div class=\"row\"><div class=\"col\">Thanks for your order on "+oOrderDate+".";
            message += "<br>Below is a summary of your purchase. Please be sure to review below section for important details about your order.<br>";
            
            message += "<br><b>Ordered by:</b></div><div class=\"col\">";
            message += empName+" </div><div class=\"col\"> <b>Department Name:</b></div><div class=\"col\">";
            message += deptName+"</div></div><div class=\"row\"><div class=\"col\"> <b>Role Name:</b></div><div class=\"col\">";
            message += roleName+" </div><div class=\"col\"> <b>Order Status:</b></div><div class=\"col\"> ";
            message += orderStatus+"</div></div><div class=\"row\"><div class=\"col\"> <b>Shipping Address:</b></div><div class=\"col\"> ";
            message += shipAddr +"</div><div class=\"col\"> <b>Total Amount: </b></div><div class=\"col\"> $";
            message += TotalAmt+"</div><br><br>";
            message += "Thank you for shopping at SimpleSec. We appreciate your business and look forward to seeing you soon.<br> Sincerely,<br>";
            message += "<br>Your Customer Care Team.<br> <b>SimpleSec</b></div><br>";
            message +="<i>Vist our website for additional information</i></div>";
            message += "</body></html>";
            console.log('message '+message);
            chilkatExample( request.session.username, subject,message ,emailObj );
            let SuccMsg = 'The order was '+orderStatus+' succesfully!';

            if(orderStatus=='Submitted')
                response.render('employeeIndex', { title: 'Welcome Employee', message: 'Your order was saved succesfully!'});
            if(orderStatus=='Approved'||orderStatus=='Rejected')
                response.render('supervisorIndex', { title: 'Welcome Supervisor', message: SuccMsg});

        } else {        }
      }
      else{
        response.send({"ERROR":err});
          return console.error(err.message);
      }
      response.end();
    });


    
});

module.exports = router;