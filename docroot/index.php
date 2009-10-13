<?

	require_once('../config.php');

	session_start();

	if (isset($_GET['logout'])) {
	  	session_destroy();
	  	session_start();
		header("Location: index.php");
		die();
	}

	if (isset($_GET['login'])) {
		$Twitter = new TwitterOAuth(TWITTER_OAUTH_CONSUMER_KEY, TWITTER_OAUTH_CONSUMER_SECRET);
		$token = $Twitter->getRequestToken();

		/* Save tokens for later */
		$_SESSION['oauth_request_token'] 		= $token['oauth_token'];
		$_SESSION['oauth_request_token_secret'] = $token['oauth_token_secret'];

		/* Build the authorization URL */
		$request_link = $Twitter->getAuthorizeURL($_SESSION['oauth_request_token']);
	
		header("Location: ".$request_link);
		die();
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<html>
	<head>
		<title>Tweenky</title>
		<meta name="keywords" content="Tweenky, Twitter, Twitter Client, Microblogging, Tweets" >
	    <meta name="description" content="Tweenky is an open-source Javascript Twitter client" >
		<meta http-equiv="content-type" content="text/html; charset=utf-8">
		
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/css/reset.css" >
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/css/default.css" >
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/css/general.css" >
		
		<script src="http://cdn.jquerytools.org/1.1.0/jquery.tools.min.js"></script>
		<script type="text/javascript" src="/js/jquery/jquery.form.js"></script>
		<script type="text/javascript" src="/js/general.js"></script>
		<script type="text/javascript" src="/js/tweet.js"></script>
		<script type="text/javascript">
			var user_id = '<?= $_SESSION["user_id"]?>';		
		</script>
	</head>
	
	<body>
		
		<div id="facebox">

			<div>
				<h2>Login</h2>
				
				<br />
				
				<p align="center">
					Twitter is requesting that you log in now
				</p>

				<p align="center">
					<span onclick="window.location.href= '/?login'" class="pseudolink"><img alt="sign in with twitter" src="/images/Sign-in-with-Twitter-lighter.png"></span>
					<span   class="close"></span>
				</p>
			</div>

		</div>
		
		
		<div id="loading"></div>
		
		<div id="container">
			<div id="header">
				<img alt="tweenky header" src="/images/tweenky_header_01.png" style="float:left;">
				<div style="padding:5px;">
					<div style="float:right;">Logged in as @<?= $_SESSION['username'] ?>, <a href="#logout=true">Logout</a></div>
					<div style="padding-top:10px;">
					<form onsubmit="return false" action="">
						<div>
							<input type="text" id="search_query" style="width:110px; font-size:13px; width:200px;">
							<input type="submit" value="Search" onclick="window.location.hash='#query=' + $('#search_query').val();" style="font-size:13px;">
							<span class="pseudolink" onclick="save_query()" id="save-query" style="display:none;">Save this search</span>
						</div>
					</form>
					</div>
				</div>
			</div>
			
			<div id="wrapper">
				<div id="content">
					<div style="background-color:#D2DBED; padding:10px;">
						<h1 style="text-align:left; font-size:20px; cursor:pointer" class="" onclick="$('#new_tweet_box').slideToggle();" id="compose_tweet">
							<img alt="thought-bubble" src="/images/thought.png" height="25"> What are you doing?
						</h1>
						<div style="display:none;" id="new_tweet_box">
							<div style="width:500px; padding:10px; float:left;">
								<form method="POST" onsubmit="send_new_tweet(); return false;" action="">
									<div>
										<input type="hidden" id="in_reply_to_id"  name="in_reply_to_id" value="">

										<textarea id="status" style="width:500px; height:120px; font-size:23px; font-family:arial;" onKeyDown="textCounter(this)" onKeyUp="textCounter(this)" cols="20" rows="10"></textarea>
										<h1 style="text-align:left; font-size:20px; float:right; padding-left:10px;" id="character_count">0</h1>
										<input type="submit" value="Update" style="font-size:16px; float:right;">
									</div>
								</form>
							</div>
							<div style="float:left; margin:10px 0px 0px 20px;">
								<h3>URL Shorteners</h3>

								<ul>
									<li>
										<span class="pseudolink" onclick="$('#tiny-info').toggle();">TinyURL</span>
										<div id="tiny-info" style="display:none">
											URL: <input type="text" id="url-to-tiny" value="http://"><input type="button" value="Shorten URL" onclick="service_tinyurl()">
										</div>	
									</li>
									<li>

										<span class="pseudolink" onclick="$('#trim-info').toggle();">Tr.im</span>
										<div id="trim-info" style="display:none">
											URL: <input type="text" id="url-to-trim" value="http://"><input type="button" value="Shorten URL" onclick="service_trim()">
										</div>	
									</li>
									<li>
										<span class="pseudolink" onclick="$('#bitly-info').toggle();">Bit.ly</span>
										<div id="bitly-info" style="display:none">

											URL: <input type="text" id="url-to-bitly" value="http://"><input type="button" value="Shorten URL" onclick="service_bitly()">
										</div>	
									</li>
																	</ul>
							</div>
							<div style="clear:both"></div>
						</div>
					</div>
					<div id="whatthetrend"><a href="http://www.whatthetrend.com" target="_blank">WhatTheTrend.com</a> says this trend is: <span id="trend-text"></span> <span class="pseudolink" onclick="$(this).parent().fadeOut();">hide</span></div>
					<div id="tweets"></div>

				</div>
			</div>
			
			<div id="navigation">
				
				<div class="box">
					<div class="title">Twitter</div>
					<div class="inner">
						<a href="#timeline=friends"><div>Home</div></a>
						<a href="#timeline=replies"><div>Replies</div></a>
						<a href="#timeline=archive"><div>Sent</div></a>
						<a href="#timeline=favorites"><div>Favorites</div></a>
						<a href="#timeline=dmin"><div>DM - Received</div></a>
						<a href="#timeline=dmout"><div>DM - Sent</div></a>
					</div>
				</div>
				
				<div id="tweetgroups" class="box">
					<div class="title">Groups <span style='font-size:11px;'>(<a href='http://www.tweetgroups.net/?tweenky' target='_blank'>Manage</a>)</span></div>
					<div class="inner">
						<img src="http://ddev.tweenky.com/images/ajax.gif" alt="ajax loading">
					</div>
				</div>
				
			
				<div id="saved-searches" class="box">
					<div class="title">Saved Searches</div>
					<div class="inner">
						<img src="http://ddev.tweenky.com/images/ajax.gif" alt="ajax loading">
					</div>
				</div>
				
				
				<div id="twitter-trends" class="box">
					<div class="title">Trends</div>
					<div class="inner">
						<img src="http://ddev.tweenky.com/images/ajax.gif" alt="ajax loading">
					</div>
				</div>
				
				<div style="font-size:10px; margin-top:60px;">
					<p>Tweenky is an <a href="http://www.twitter.com/derek" target="_blank">@Derek</a> Production</p>
				</div>
			</div>
			
			<div id="footer"><p>&nbsp;</p></div>
	
			<div style="clear:both"></div>
	
		</div>
		
		<script type="text/javascript">
			var uservoiceJsHost = ("https:" == document.location.protocol) ? "https://uservoice.com" : "http://cdn.uservoice.com";
			document.write(unescape("%3Cscript src='" + uservoiceJsHost + "/javascripts/widgets/tab.js' type='text/javascript'%3E%3C/script%3E"));
		</script>
		<script type="text/javascript">
			UserVoice.Tab.show({ 
				key: 'tweenky',
				host: 'feedback.tweenky.com', 
				forum: 'general', 
				alignment: 'right',
				background_color:'#0054AB', 
				text_color: 'white',
				hover_color: '#06C',
				lang: 'en'
			});
		</script>
		<script type="text/javascript">
			var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
			document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
		</script>
		<script type="text/javascript">
			try {
				var pageTracker = _gat._getTracker("UA-51709-12");
				pageTracker._trackPageview();
			} catch(err) {}
		</script>
	</body>
</html>