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