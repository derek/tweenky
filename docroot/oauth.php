<?php

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
	setcookie("oauth_access_token", 		$_SESSION['oauth_access_token'], 		time()+60*60*24*30);
	setcookie("oauth_access_token_secret", 	$_SESSION['oauth_access_token_secret'], time()+60*60*24*30);

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
?>