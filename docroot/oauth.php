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

	header("Location: index.php");
?>