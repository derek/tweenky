<?php
/*
	require_once('../config.php');

	$Twitter = new TwitterOAuth(
		TWITTER_OAUTH_CONSUMER_KEY, 
		TWITTER_OAUTH_CONSUMER_SECRET, 
		$_SESSION['oauth_request_token'],
		$_SESSION['oauth_request_token_secret']
	);

	// Get the oAuth token
	$token 	 = $Twitter->getAccessToken();
	$_SESSION['oauth_access_token'] 		= $token['oauth_token'];
	$_SESSION['oauth_access_token_secret'] 	= $token['oauth_token_secret'];
	//setcookie("oauth_access_token", 		$_SESSION['oauth_access_token'], 		time()+60*60*24*30);
	//setcookie("oauth_access_token_secret", 	$_SESSION['oauth_access_token_secret'], time()+60*60*24*30);

	// Get the user's info
	$user_data = json_decode($Twitter->OAuthRequest("http://twitter.com/account/verify_credentials.json"), true);
	$_SESSION['user_id'] 	= $user_data['id'];
	$_SESSION['username'] 	= $user_data['screen_name'];
	
	// Follow @Tweenky
	$Twitter->OAuthRequest("http://twitter.com/friendships/create/tweenky.xml", array(), "POST");
	
	if (!empty($user_data['screen_name']))
		mail("drgath@gmail.com", "Tweenky login - ". $user_data['screen_name'], $_SERVER['REMOTE_ADDR']);

	// Redirect;
	header("Location: index.php");
	die();
	
*/


require "../config.php";

/* Start session and load lib */
session_start();

/* If the oauth_token is old redirect to the connect page. */
if (isset($_REQUEST['oauth_token']) && $_SESSION['oauth_token'] !== $_REQUEST['oauth_token']) {
  //$_SESSION['oauth_status'] = 'oldtoken';
  //header('Location: ./clearsessions.php');
}

/* Create TwitteroAuth object with app key/secret and token key/secret from default phase */
$connection = new TwitterOAuth(TWITTER_OAUTH_CONSUMER_KEY, TWITTER_OAUTH_CONSUMER_SECRET, $_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);

/* Request access tokens from twitter */
$access_token = $connection->getAccessToken($_REQUEST['oauth_verifier']);

/* Save the access tokens. Normally these would be saved in a database for future use. */
$_SESSION['access_token'] = $access_token;

/* Remove no longer needed request tokens */
unset($_SESSION['oauth_token']);
unset($_SESSION['oauth_token_secret']);

$connection->post("http://twitter.com/friendships/create/tweenky.xml", array(), "POST");

/* If HTTP response is 200 continue otherwise send to connect page to retry */
if (200 == $connection->http_code) {
  /* The user has been verified and the access tokens can be saved for future use */
  $_SESSION['status'] = 'verified';
  header('Location: ./index.php');
} else {
  /* Save HTTP status for error dialog on connnect page.*/
  header('Location: ./?logout');
}
?>