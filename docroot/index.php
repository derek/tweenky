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

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
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
		<link media="screen, projection" rel="stylesheet" type="text/css" href="/css/overlay-minimal.css" >
		
		<script type="text/javascript" src="/js/jquery/jquery-1.3.1.min.js"></script>
		<script type="text/javascript" src="/js/general.js"></script>
		<script type="text/javascript" src="/js/md5.js"></script>
		<script type="text/javascript" src="/js/jquery/jquery.overlay-1.0.1.js"></script>
		<script type="text/javascript" src="/js/jquery/jquery.form.js"></script>
		<script type="text/javascript" src="/js/jquery/jquery.expose-1.0.0.min.js"></script>
		<script type="text/javascript">
			user_id = '<?= $_SESSION["user_id"]?>';
			ip = '<?= $_SERVER["REMOTE_ADDR"] ?>';
			
			$(document).ready(function() {

				/*overlay = $("#compose_tweet").overlay({ 
			        onBeforeLoad: function() {
			            this.getBackgroundImage().expose({color: '#000000'}); 
			        },  
			        onClose: function() { 
			            $.expose.close(); 
						$("#status").val('');
						$("#in_reply_to_id").val('');
			        } 
			    });*/

				$("#login_link").overlay({ 
			        onBeforeLoad: function() {
			            this.getBackgroundImage().expose({color: '#000000'}); 
			        },  
			        onClose: function() { 
			            $.expose.close(); 
						$("#status").val('');
						$("#in_reply_to_id").val('');
			        } 
			    });


				reset_trends();
				load_saved_searches();
				load_userlists(<?= $_SESSION['user_id'] ?>);
				//load_groups();
				//load_queries();

				setInterval("check_state()", 50);
				setInterval("recalculate_timestamps()", 60000 );
				setInterval('show_tweet()', 700);
				setInterval('cleanup()', 6000);
				setInterval('reset_trends()', 60000);
			})
			
		</script>
	</head>
	
	<body>
		
		<div class="overlay" id="login-overlay">  
			<h2 style="font-size:18px; text-align:center;">Login</h2><br>
			<br>
			<p style="text-align:center;font-size:18px;">Looks like you need to log into your account.  Tweenky supports OAuth, the safe &amp; secure way to login to your Twitter account without needing to provide your password. All you need to do is click the button below.</p>
			<br>
			<div style="width:100%; text-align:center;"><a href="/?login"><img alt="sign in with twitter" src="/images/Sign-in-with-Twitter-lighter.png"></a></div>
		</div>		
		
		<div id="loading" style="font-size:12px; position:absolute;top:-2px;left:48%;background-color:yellow; width:200px; padding:5px; text-align:center;"></div>
		
		<div id="container">
			<div id="header">
				<img alt="tweenky header" src="/images/tweenky_header_01.png" style="float:left;">
				<div style="padding:5px;">
					<div style="float:right;"><a href="#logout=true">Logout</a></div>
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
										<textarea id="status" style="width:500px; height:120px; font-size:23px; font-family:arial;" onKeyDown="textCounter(this)" onKeyUp="textCounter(this)" cols="20" rows="10"><?= $status ?></textarea>
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
									<? if ($_SESSION['user_id'] == "1974") { ?>
										<li>
											<span class="pseudolink" onclick="$('#waly-info').toggle();">Wa.ly</span>
											<div id="waly-info" style="display:none">
												URL: <input type="text" id="url-to-waly" value="http://"><input type="button" value="Shorten URL" onclick="service_waly()">
											</div>	
										</li>
									<? } ?>
								</ul>
							</div>
							<div style="clear:both"></div>
						</div>
					</div>
					<div id="tweets"></div>
				</div>
			</div>
			
			<div id="navigation">
				<h3 style="display:none;">
					<a rel="#login-overlay" id="login_link">Login</a>
				</h3>


				<h3>Twitter</h3>

				<ul>
					<li><a href="#timeline=friends">Friends</a></li>
					<li><a href="#timeline=replies">Replies</a></li>
					<li><a href="#timeline=archive">Sent</a></li>
					<li><a href="#timeline=directs">Private</a></li>
				</ul>
				
				<br />
				
				<div id="tweetgroups" style="margin-bottom:10px;"></div>
				
				
				<div id="saved-searches" style="margin-bottom:10px;"></div>
				
				
				<div id="twitter-trends" style="margin-bottom:10px;"></div>
				
				<div style="font-size:10px; margin-top:60px;">
					<p>Tweenky is an <a href="http://www.twitter.com/derek" target="_blank">@Derek</a> Production.  Be sure to follow him and <a href="http://www.twitter.com/tweenky" target="_blank">@Tweenky</a>!</p>
					<p>&copy; 2008-2009</p>
				</div>
				
			</div>
			
			<div id="footer"><p>&nbsp;</p></div>
	
			<div style="clear:both"></div>
	
		</div>
		<script type="text/javascript">
		  var uservoiceJsHost = ("https:" == document.location.protocol) ? "https://uservoice.com" : "http://cdn.uservoice.com";
		  document.write(unescape("%3Cscript src='" + uservoiceJsHost + "/javascripts/widgets/tab.js' type='text/javascript'%3E%3C/script%3E"))
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
		})
		</script>
		<script type="text/javascript">
		var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
		document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
		</script>
		<script type="text/javascript">
		try {
		var pageTracker = _gat._getTracker("UA-51709-12");
		pageTracker._trackPageview();
		} catch(err) {}</script>
	</body>
</html>
