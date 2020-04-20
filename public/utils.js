function verifyNupdate(orderID) {
   
    var parameters = { orderID: orderID };
    $.get( '/orders/verifyOrder',parameters, function(data) {
        $('#results').html(data);
    });
       
     }