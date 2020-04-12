CREATE DEFINER=`admin`@`%` PROCEDURE `ADD_USER`(
   IN iFirstName varchar(50),
   IN iLastName varchar(50),
   IN iEmail varchar(40),
   IN iPassword varchar(255),
   IN iDeptName varchar(50),
   IN iRoleName varchar(50),
   IN iPhone varchar(40),
   IN iShippingAddress varchar(255),
   IN iSecurityQuestion varchar(255),
   IN iSecurityAnswer varchar(255),
   IN iValidationNumber varchar(255)
   )
BEGIN

  INSERT INTO Users (FirstName, LastName, PasswordHash, DeptName, RoleName, Email, Phone, ShippingAddress, SecurityQuestion, SecurityAnswer, CreatedDate, ModifiedDate, ValidationNumber)
  VALUE (iFirstName, iLastName, MD5(iPassword), iDeptName, iRoleName, iEmail, iPhone, iShippingAddress, iSecurityQuestion, iSecurityAnswer, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), iValidationNumber);
    
END





DELIMITER //
CREATE PROCEDURE LOGIN_USERS(IN iEmail NVARCHAR(40), IN iPassword NVARCHAR(40))
BEGIN

    DECLARE oEmail NVARCHAR(50);
    DECLARE orole INT;

 	SELECT Email, id_role INTO oEmail, orole
    FROM Users
    WHERE Email = iEmail AND PasswordHash = MD5(iPassword);
    SELECT oEmail;
END//
DELIMITER ;









CREATE PROCEDURE INSERT_PUBLICKEY(IN iEmail NVARCHAR(40), IN iPublicKey LONGTEXT)
BEGIN

    DECLARE idUser int;

 	SELECT UserID INTO idUser
    FROM Users
    WHERE Email = iEmail;

    UPDATE Users
    SET PublicKey = iPublicKey 
    WHERE UserID = idUser;

END


CREATE DEFINER=`admin`@`%` PROCEDURE `AUTH_Number`(IN iEmail NVARCHAR(40), IN iPassword NVARCHAR(40), IN iValidationNumber NVARCHAR(40))
BEGIN

    DECLARE oEmail NVARCHAR(50);

 	SELECT Email INTO oEmail
    FROM Users
    WHERE Email = iEmail AND PasswordHash = MD5(iPassword) AND ValidationNumber = iValidationNumber;
    SELECT oEmail;
END


/* CALL `ADD_ORDER`( 'jiridaj888@sweatmail.com', 'Description', 'SAVE', '[8,7,6]', '[10,20,50]') */

CREATE DEFINER=`admin`@`%` PROCEDURE `ADD_ORDER`(
	IN iUserEmail varchar(40),
    IN iDescription varchar(255),
    IN iStatus varchar(50),
    IN iproductsArray varchar(500),
    IN iunitsArray varchar(500)
)
BEGIN
	DECLARE iOrderStatus varchar(50);
    DECLARE iUserID varchar(50);
    DECLARE iShippingAddress varchar(500);
    
    DECLARE iorderID varchar(50);
    DECLARE iunitPrice varchar(50);
    
	DECLARE iTotalCost DECIMAL(13, 2);
	
    DECLARE Size INT;
    DECLARE Counter INT;
    DECLARE pos VARCHAR(10);
    DECLARE i INT;
    DECLARE tempProduct VARCHAR(10);
    DECLARE tempUnits VARCHAR(10);
    DECLARE str VARCHAR(255);
    
    SET iTotalCost = 0;
    
    IF iStatus = 'SAVE' THEN
		SET iOrderStatus = "IN PROGRESS";
	ELSEIF iStatus = 'SUBMIT' THEN
		SET iOrderStatus = "SUBMITTED";
	END IF;
    
    SELECT UserID, ShippingAddress
    FROM Users
    WHERE Email = iUserEmail
    INTO iUserID, iShippingAddress;
    
    /* ------------- CREATE ORDER -------------*/
    INSERT INTO Orders(UserId, ShippingAddress, Description, OrderStatus, OrderDate)
    VALUES(iUserID, iShippingAddress, iDescription, iOrderStatus, CURRENT_TIMESTAMP());
    SELECT LAST_INSERT_ID() INTO iorderID;
    
    /* ---------------------------------------*/
    
    /* --------------- PRODUCTS ---------------*/
    
    SELECT JSON_LENGTH(iproductsArray) INTO Size;
    
    SET counter = 1;
    
    loop_products: REPEAT                         
		SET  str = CONCAT(str, counter  ,',');
		SET tempProduct = "";
        SET i = counter - 1;
        
        SET pos = concat('$[',i,']');
		SELECT JSON_EXTRACT(iproductsArray, pos) INTO tempProduct;
        SELECT JSON_EXTRACT(iunitsArray, pos) INTO tempUnits;
        
        #Bring Price From Products Table
        SELECT UnitPrice FROM Products WHERE ProductID=tempProduct INTO iunitPrice;
        
        INSERT INTO Order_details(OrderID, ProductID, UnitPrice, Quantity, OrderDate)
        VALUES(iorderID,tempProduct,iunitPrice,tempUnits,current_timestamp());
        
        SET iTotalCost = iTotalCost + (tempUnits * iunitPrice);
        #SELECT tempProduct, tempUnits, iunitPrice, iTotalCost;
        
        
        SET  counter  = counter  + 1;        
	UNTIL counter > Size             
	END REPEAT loop_products;   
    
    
	/* ---------------------------------------*/
    # UPDATE TOTAL COST
    #SELECT iTotalCost;
    
    UPDATE Orders
	SET TotalCost = iTotalCost
	WHERE iorderID = OrderID;    
    
	
END



















/* -----------ABY-------------- */
CREATE DEFINER=`admin`@`%` PROCEDURE `ADD_ORDER_DETAILS`(
   IN iOrderID varchar(50),
   IN iProductID varchar(50),
   IN iUnitPrice varchar(50),
   IN iQuantity varchar(50)   
)
BEGIN
  INSERT INTO Products (OrderID, ProductID, UnitPrice, Quantity, OrderDate)
  VALUE (iOrderID, iProductID, iUnitPrice, iQuantity, sysdate);
    
END


CREATE DEFINER=`admin`@`%` PROCEDURE `ADD_ORDERS`(
        IN iUserID varchar(50), 
        IN iShippingAddress varchar(500), 
        IN iCategory varchar(50), 
        IN iDigitalSign LONGTEXT,
        IN iOrderStatus varchar(50), 
        IN iOrderHash varchar(50)   
)
BEGIN
  INSERT INTO Products (UserID, ShippingAddress, Category, DigitalSign, OrderStatus, OrderHash, OrderDate)
  VALUE (iUserID, iShippingAddress, iCategory, iDigitalSign, iOrderStatus, iOrderHash, sysdate);
    
END








