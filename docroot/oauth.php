<?php

	require_once('../config.php');

	$session_token 	= $_SESSION['oauth_request_token'];
	$oauth_token 	= $_REQUEST['oauth_token'];

	if ($_SESSION['oauth_access_token'] === NULL && $_SESSION['oauth_access_token_secret'] === NULL) {
	  $Twitter 	= new TwitterOAuth(TWITTER_OAUTH_CONSUMER_KEY, TWITTER_OAUTH_CONSUMER_SECRET, $_SESSION['oauth_request_token'], $_SESSION['oauth_request_token_secret']);
	  $token 	= $Twitter->getAccessToken();

	  $_SESSION['oauth_access_token'] = $token['oauth_token'];
	  $_SESSION['oauth_access_token_secret'] = $token['oauth_token_secret'];
	}
	$user_data = json_decode($Twitter->OAuthRequest("http://twitter.com/account/verify_credentials.json"), true);
	//print_r(	$user_data); die();
	$_SESSION['user_id'] 	= $user_data['id'];
	$_SESSION['username'] 	= $user_data['screen_name'];
	header("Location: index.php");
?>