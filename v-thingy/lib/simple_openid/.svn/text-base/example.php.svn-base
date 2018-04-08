<?
require('class.openid.php');


// EXAMPLE
if ($_POST['openid_action'] == "login"){ // Get identity from user and redirect browser to OpenID Server
    $openid = new SimpleOpenID;
    $openid->SetIdentity($_POST['openid_url']);
    $openid->SetTrustRoot('http://' . $_SERVER["HTTP_HOST"]);
    $openid->SetRequiredFields(array('email','fullname'));
    $openid->SetOptionalFields(array('dob','gender','postcode','country','language','timezone'));
    if ($openid->GetOpenIDServer()){
        $openid->SetApprovedURL('http://' . $_SERVER["HTTP_HOST"] . $_SERVER["PATH_INFO"]);      // Send Response from OpenID server to this script
        $openid->Redirect();     // This will redirect user to OpenID Server
    }else{
        $error = $openid->GetError();
        echo "ERROR CODE: " . $error['code'] . "<br>";
        echo "ERROR DESCRIPTION: " . $error['description'] . "<br>";
    }
    exit;
}
else if($_GET['openid_mode'] == 'id_res'){     // Perform HTTP Request to OpenID server to validate key
    $openid = new SimpleOpenID;
    $openid->SetIdentity($_GET['openid_identity']);
    $openid_validation_result = $openid->ValidateWithServer();
    if ($openid_validation_result == true){         // OK HERE KEY IS VALID
        echo "VALID";
    }else if($openid->IsError() == true){            // ON THE WAY, WE GOT SOME ERROR
        $error = $openid->GetError();
        echo "ERROR CODE: " . $error['code'] . "<br>";
        echo "ERROR DESCRIPTION: " . $error['description'] . "<br>";
    }else{                                            // Signature Verification Failed
        echo "INVALID AUTHORIZATION";
    }
}else if ($_GET['openid_mode'] == 'cancel'){ // User Canceled your Request
    echo "USER CANCELED REQUEST";
}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<html>
<head>
    <title>OpenID Example</title>
    <style>
    #openid{
        border: 1px solid gray;
        display: inline;
    }
    #openid, #openid INPUT{
        font-family: "Trebuchet MS";
        font-size: 12px;
    }
    #openid LEGEND{
        1.2em;
        font-weight: bold;
        color: #FF6200;
        padding-left: 5px;
        padding-right: 5px;
    }
    #openid INPUT.openid_login{
       background: url(imgs/3rdparty/openid-login-bg.gif) no-repeat;
       background-color: #fff;
       background-position: 0 50%;
       color: #000;
       padding-left: 18px;
       width: 220px;
       margin-right: 10px;
    }
    #openid A{
    color: silver;
    }
    #openid A:hover{
        color: #5e5e5e;
    }
</style>
</head>

<body>

<div>
<fieldset id="openid">
<legend>OpenID Login</legend>
<form action="<?echo 'http://' . $_SERVER["HTTP_HOST"] . $_SERVER["PATH_INFO"]; ?>" method="post" onsubmit="this.login.disabled=true;">
<input type="hidden" name="openid_action" value="login">
<div><input type="text" name="openid_url" class="openid_login"><input type="submit" name="login" value="login &gt;&gt;"></div>
<div><a href="http://www.myopenid.com/" class="link" >Get an OpenID</a></div>
</form>
</fieldset>
</div>

<div style="margin-top: 2em; font-family: arial; font-size: 0.8em; border-top:1px solid gray; padding: 4px;">Sponsored by: <a href="http://www.fivestores.com">FiveStores</a> - get your free 
online store; includes extensive API for developers; <i style="color: gray;">integrated with  <a href="http://en.wikipedia.org/wiki/OpenID">OpenID</a></i></div>

</body>
</html>
