<?

require_once('../config.php');

session_start();

if (isset($_GET['logout'])) {
  	session_destroy();
  	session_start();
	header("Location: index.php");
	die();
}

/* If oauth_token is missing get it */
if (!isset($_SESSION['oauth_token'])) {
	$Twitter = new TwitterOAuth(TWITTER_OAUTH_CONSUMER_KEY, TWITTER_OAUTH_CONSUMER_SECRET);
	$token = $Twitter->getRequestToken();

	/* Save tokens for later */
	$_SESSION['oauth_request_token'] 		= $token['oauth_token'];
	$_SESSION['oauth_request_token_secret'] = $token['oauth_token_secret'];

	/* Build the authorization URL */
	$request_link = $Twitter->getAuthorizeURL($_SESSION['oauth_request_token']);
}

?>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		
		<title>Tweenky</title>
		
		<meta http-equiv="content-type" content="text/html; charset=utf-8">
		
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/css/reset.css" >
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/css/layout.css" >
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/css/default.css" >
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/css/general.css" >
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/css/tweet.css" >
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/js/jquery/fancybox/fancy.css" >
		<link media="screen, projection" rel="stylesheet" type="text/css" href="http://flowplayer.org/tools/css/overlay-minimal.css" >
		
		<script type="text/javascript" src="/js/jquery/jquery-1.3.1.min.js"></script>
		<script type="text/javascript" src="/js/general.js"></script>
		<script type="text/javascript" src="/js/jquery/jquery.overlay-1.0.1.js"></script>
		<script type="text/javascript" src="/js/jquery/jquery.form.js"></script>
		<script type="text/javascript" src="http://static.flowplayer.org/js/jquery.expose-1.0.0.min.js"></script>
		
	</head>
	<body>
		
		<div class="overlay" id="overlay">
			<div class="wrap"></div>
		</div>
		
		<div class="overlay" id="login-overlay">  
			<h2 style="font-size:18px; text-align:center;">Tweenky</h2>
			<br /><br />
			<p align="center">Click <a href="<?= $request_link ?>">here</a> to login with your Twitter account</p>
			<div style="width:100%; text-align:center;"><img src="http://www.hueniverse.com/.a/6a00e00993be8888330112794442ee28a4-800wi" height="100" /></div>
		</div>		
		
		<div id="loading" style="font-size:12px; position:absolute;top:-2px;left:48%;background-color:yellow; width:200px; padding:5px; text-align:center;"></div>
		
		<div id="container">
			<div id="header">
				<img src="http://ddev.tweenky.com/images/tweenky_header_01.png" style="float:left;">
				<div style="padding:5px;">
					<div style="float:right;"><a href="#logout=true">Logout</a></div>
					<div style="padding-top:10px;">
					<form onsubmit="return false">
						<input type="text" id="search_query" style="width:110px; font-size:13px; width:200px;">&nbsp;
						<input type="submit" value="Search" onclick="window.location.hash='#query=' + $('#search_query').val();" style="font-size:13px;">
					</form>
					</div>
				</div>
			</div>
			
			<div id="wrapper">
				<div id="content">
					<!--<div style="background-color:#D2DBED; width:100%;" id="profile_box">
						<div style="float:left; padding-right:10px"><img src="http://s3.amazonaws.com/twitter_production/profile_images/63808765/self1.jpg" /></div>
						<div style="width:200px;float:left;">
							<p><span style="font-weight:bold">Name</span> Derek Gathright</p>
						    <p><span style="font-weight:bold">Location</span> Kansas City, MO</p>
						    <p><span style="font-weight:bold">Web</span> <a href="">http://www.derekville.net</a></p>
						    <p><span style="font-weight:bold">Bio</span> Web engineer, Linux, PHP, Javascript, blogger, mac user, music geek, fish owner</p>
						    
							<table style="width:180px;margin-left:10px;">
								<tr>
									<td style="border-right:solid 1px #999999; padding:5px;">626<br />Following</td>
									<td style="border-right:solid 1px #999999; padding:5px;">626<br />Followers</td>
									<td style=" padding:5px;">626<br />Updates</td>
								</tr>
							</table>
						</div>
						<div style="clear:both;"></div>
					</div>-->
					<div style="background-color:#D2DBED; width:100%; display:none;" id="new_tweet_box">
						<div style="width:500px; padding:10px; float:left;">
							<form method="POST" onsubmit="send_new_tweet(); return false;">
								<input type="hidden" id="in_reply_to_id"  name="in_reply_to_id" value="">
								<h1 style="text-align:left; font-size:20px;">
								<span style="font-size:26px; float:right" id="character_count">0</span>
									<img src="http://directory.fedoraproject.org/wiki/images/c/cc/Note.png" height="25"> What are you doing?
								</h1>
								<textarea id="status" style="width:500px; height:120px; font-size:23px; font-family:arial;" onKeyDown="textCounter(this)" onKeyUp="textCounter(this)" wrap="soft"><?= $status ?></textarea>
								<input type="submit" value="Update" style=" font-size:16px;float:right;">
							</form>
						</div>
						<div style="float:left; margin:27px 0px 0px 20px;">
							<h3>URL Shorteners</h3>
							<ul>
								<li>
									<span class="pseudolink" onclick="$('#tiny-info').toggle();">TinyURL</span>
									<div id="tiny-info" style="display:none">
										URL: <input type="text" id="url-to-tiny" value="http://"><input type="button" value="Shorten URL" onclick="service_tinyurl()">
									</div>	
								</li>
								<li>
									<span class="pseudolink" onclick="$('#isgd-info').toggle();">is.gd</span>
									<div id="isgd-info" style="display:none">
										URL: <input type="text" id="url-to-isgd" value="http://"><input type="button" value="Shorten URL" onclick="service_isgd()">
									</div>	
								</li>
								<li style="display:none;">
									<span class="pseudolink" onclick="$('#digg-info').toggle();">Digg</span>
									<div id="digg-info" style="display:none">
										URL: <input type="text" id="url-to-digg" value="http://"><input type="button" value="Shorten URL" onclick="service_digg()">
									</div>	
								</li>
							</ul>
							
							<br />
							<!--
							<h3>Other</h3>
							<ul>
								<li>
									<span class="pseudolink" onclick="$('#twitpic-info').toggle();">TwitPic</span>
									<form id="twitpic" method="POST" onsubmit="return service_twitpic()">
										<div id="twitpic-info" style="display:none">
											File: <input type="file" name="media"> <input type="submit" value="Upload">
										</div>	
									</form>
								</li>
							</ul>-->
						</div>
						<div style="float:right">
							<span class="pseudolink" onclick="$('#new_tweet_box').slideUp();">Close</span>
						</div>
						<div style="clear:both"></div>
					</div>
					<div id="tweets"></div>
				</div>
			</div>
			
			<div id="navigation">
				<h3 style="display:none;">
					<a rel="#login-overlay" id="login_link">Login</a>
				</h3>
				<h3>
					 <img src="http://directory.fedoraproject.org/wiki/images/c/cc/Note.png" height="15"> <span id="compose_tweet" class="pseudolink" onclick="$('#new_tweet_box').slideToggle();" style="font-size:15px;">New Tweet</span>
				</h3>
		
				<br />
		
				<h3>Timelines</h3>

				<ul>
					<li><a href="#timeline=friends">Followers</a></li>
					<li><a href="#timeline=replies">@</a></li>
					<li><a href="#timeline=archive">From </a></li>
					<li><a href="#timeline=directs">Directs</a></li>
					<li><a href="#timeline=public">Everyone</a></li>
				</ul>
				
				<br />
				<!--
				<h3>Groups</h3>
				<div style="list-style-type: none;" id="groups-list">
					<div style="text-align:center">
						<img src="http://ddev.tweenky.com/images/ajax.gif">
					</div>
				</div>
				
				<br />
				
				<h3>Search</h3>
				<div id="query-list">
					<div style="text-align:center">
						<img src="http://ddev.tweenky.com/images/ajax.gif">
					</div>
				</div>
						<br>
			-->
				<h3>Popular Topics</h3>
				<div id="trends">
					<div style="text-align:center">
						<img src="http://ddev.tweenky.com/images/ajax.gif">
					</div>
				</div>

				<br>
				<!-- 
				<h3>Links</h3>
				<ul>
					<li><a href="http://www.twitter.com/derek" target="_blank">twitter.com/derek</a></li>
					<li><a href="http://www.twitter.com/tweenky" target="_blank">twitter.com/tweenky</a></li>
					<li><a href="http://blog.tweenky.com" target="_blank">blog.tweenky.com</a></li>
				</ul>
			-->
			</div>
			
			<div id="footer">
				<p>&copy; Tweenky, 2008-2009</p>
			</div>
		</div>
	</body>
</html>
