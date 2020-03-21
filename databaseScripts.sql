use ecomm;

CREATE TABLE Users(
    UserID int NOT NULL AUTO_INCREMENT,
    FirstName varchar(50) NOT NULL,
    LastName varchar(50) NOT NULL,
    UserName varchar(50) NOT NULL,
    PasswordHash varchar(255) NOT NULL,
    DeptName varchar(50) NOT NULL,
    RoleName varchar(50) NOT NULL,
    Email varchar(40) NOT NULL,
    Phone varchar(40) NOT NULL,
    ShippingAddress varchar(255) NULL,
    SecurityQuestion varchar(255) NOT NULL,
    SecurityAnswer varchar(255) NOT NULL,
    PublicKey LONGTEXT NULL,
    PrivateKey LONGTEXT NULL,
    CreatedDate DATE NOT NULL,
    ModifiedDate DATE NOT NULL,
    PRIMARY KEY (UserID, Email)
) ;

CREATE TABLE Products(
    ProductID int NOT NULL AUTO_INCREMENT,
    ProductName varchar(50) NOT NULL,
    SupplierName varchar(50) NOT NULL,
    Category varchar(50) NOT NULL,
    UnitPrice varchar(255) NOT NULL,
    StockAvailability varchar(50) NOT NULL,
    OrderInFlight varchar(50) NOT NULL,
    CreatedDate DATE NOT NULL,
    ModifiedDate DATE NOT NULL,
    PRIMARY KEY (ProductID )
) ;

CREATE TABLE Orders(
    OrderID int NOT NULL AUTO_INCREMENT,
    UserID varchar(50) NOT NULL,
    ShippingAddress varchar(500) NOT NULL,
    Category varchar(50) NOT NULL,
    DigitalSign LONGTEXT NULL,
    OrderStatus varchar(50) NOT NULL,
    OrderHash varchar(50) NOT NULL,
    OrderDate DATE NOT NULL,
    PRIMARY KEY (OrderID)
) ;

CREATE TABLE Order_details(
    OrderDetailsID int NOT NULL AUTO_INCREMENT,
    OrderID varchar(50) NOT NULL,
    ProductID varchar(50) NOT NULL,
    UnitPrice varchar(50) NOT NULL,
    Quantity varchar(50) NOT NULL,
    OrderDate DATE NOT NULL,
    PRIMARY KEY (OrderDetailsID)
) ;




/*
    PROCEDURES CREATION
*/
--ADD USER

DELIMITER //
CREATE PROCEDURE ADD_USER(
   IN iFirstName varchar(50),
   IN iLastName varchar(50),
   IN iUserName varchar(50),
   IN iPassword varchar(255),
   IN iDeptName varchar(50),
   IN iRoleName varchar(50),
   IN iEmail varchar(40),
   IN iPhone varchar(40),
   IN iShippingAddress varchar(255),
   IN iSecurityQuestion varchar(255),
   IN iSecurityAnswer varchar(255),
   IN iPublicKey LONGTEXT,
   IN iPrivateKey LONGTEXT
   )
BEGIN

  INSERT INTO Users (FirstName, LastName, UserName, Password, DeptName, RoleName, Email, Phone, ShippingAddress, SecurityQuestion, SecurityAnswer, PublicKey, PrivateKey, CreatedDate, ModifiedDate)
  VALUE (iFirstName, iLastName, iUserName, MDG(iPasswordHash), iDeptName, iRoleName, iEmail, iPhone, iShippingAddress, iSecurityQuestion, iSecurityAnswer, iPublicKey, iPrivateKey, sysdate, sysdate);
    
END//
DELIMITER ;

--Login USERS

DELIMITER //
CREATE PROCEDURE LOGIN_USERS(IN iUserName NVARCHAR(40), IN iPassword NVARCHAR(40))
BEGIN

    DECLARE oFirstName varchar(50);
    DECLARE oLastName varchar(50);
    DECLARE oDeptName varchar(50);
    DECLARE oRoleName varchar(50);
    DECLARE oEmail varchar(40);
    DECLARE oPhone varchar(40);
    DECLARE oShippingAddress varchar(255);
    DECLARE oSecurityQuestion varchar(255);
    DECLARE oSecurityAnswer varchar(255);
    DECLARE oPublicKey LONGTEXT;
    DECLARE oPrivateKey LONGTEXT;
    
    SELECT FirstName, LastName, DeptName, RoleName, Email, Phone, ShippingAddress, SecurityQuestion, SecurityAnswer, PublicKey, PrivateKey
    INTO oFirstName, oLastName, oDeptName, oRoleName, oEmail, oPhone, oShippingAddress, oSecurityQuestion, oSecurityAnswer, oPublicKey, oPrivateKey
    FROM Users
    WHERE UserName = iUserName AND PasswordHash = MD5(iPassword);
    SELECT oRoleName;
END//
DELIMITER ;


--Select USERS

DELIMITER //
CREATE PROCEDURE SELECT_USERS(IN iUserName NVARCHAR(40))
BEGIN

    DECLARE oFirstName varchar(50);
    DECLARE oLastName varchar(50);
    DECLARE oDeptName varchar(50);
    DECLARE oRoleName varchar(50);
    DECLARE oEmail varchar(40);
    DECLARE oPhone varchar(40);
    DECLARE oShippingAddress varchar(255);
    DECLARE oSecurityQuestion varchar(255);
    DECLARE oSecurityAnswer varchar(255);
    DECLARE oPublicKey LONGTEXT;
    DECLARE oPrivateKey LONGTEXT;
    
    SELECT FirstName, LastName, DeptName, RoleName, Email, Phone, ShippingAddress, SecurityQuestion, SecurityAnswer, PublicKey, PrivateKey
    INTO oFirstName, oLastName, oDeptName, oRoleName, oEmail, oPhone, oShippingAddress, oSecurityQuestion, oSecurityAnswer, oPublicKey, oPrivateKey
    FROM Users
    WHERE UserName = iUserName;
    SELECT oRoleName;
END//
DELIMITER ;


--INSERT PUBLIC & PRIVATE KEY USER

DELIMITER //
CREATE PROCEDURE UPDATE_KEY(IN iUserName NVARCHAR(40), IN iPublicKey LONGTEXT, IN iPrivateKey LONGTEXT )
BEGIN

    UPDATE Users
    SET PublicKey = iPublicKey ,
    PrivateKey = iPrivateKey 
    WHERE UserName = iUserName;

END//


--ADD Product
DELIMITER //
CREATE PROCEDURE ADD_Products(
        IN iProductName varchar(50),
        IN iSupplierName varchar(50),
        IN iCategory varchar(50),
        IN iUnitPrice varchar(255),
        IN iStockAvailability varchar(50),
        IN iOrderInFlight varchar(50)
   )
BEGIN
  INSERT INTO Products (ProductName,SupplierName,Category,UnitPrice,StockAvailability,OrderInFlight, CreatedDate, ModifiedDate)
  VALUE (iProductName, iSupplierName, iCategory, iUnitPrice, iStockAvailability, iOrderInFlight, sysdate, sysdate);
    
END//
DELIMITER ;

--ADD ORDERS
DELIMITER //
CREATE PROCEDURE ADD_ORDERS(
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
    
END//
DELIMITER ;


--ADD ORDER_Details
DELIMITER //
CREATE PROCEDURE ADD_ORDER_DETAILS(
   IN iOrderID varchar(50),
   IN iProductID varchar(50),
   IN iUnitPrice varchar(50),
   IN iQuantity varchar(50)   
)
BEGIN
  INSERT INTO Products (OrderID, ProductID, UnitPrice, Quantity, OrderDate)
  VALUE (iOrderID, iProductID, iUnitPrice, iQuantity, sysdate);
    
END//
DELIMITER ;
Commit;
