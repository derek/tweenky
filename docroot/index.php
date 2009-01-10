<?
	function detect_ie()
	{
	    if (isset($_SERVER['HTTP_USER_AGENT']) && 
	    (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false))
	        return true;
	    else
	        return false;
	}
	
?>

<html>

	<head>
		<title>Tweenky</title>
		<meta name="keywords" content="twitter, micro blogging, tweets, twitter client, twitter search, summize">
		<meta name="description" content="Tweenky.com is a Twitter client that let's you find and follow the conversations as they flow through the network.'">

		<script>
			$(document).ready(function() {
				<? if (!detect_ie()) { ?>
					$('.rounded').corner("20px");
				<? } ?>
				$('#twitter_username').focus();
			});
			
			function login()
			{
				window.location.href = "/tweet.php";
				
				return false;
			}
		</script>
		<style type="text/css"> @import "/css/main.css"; </style>
		<style type="text/css">
			body{
				background:url("/images/bg_green-1.jpg") #D0F4D5;
			}
			.formRow { margin: 10px auto; text-align: left; width: 280px; }
			form label {
				color: #666;
				font-size: 12px;
				margin-left: 10px;
				padding-bottom: 30px;
				text-transform: uppercase;
				text-align:left;
			}
			form input[type=text], form input[type=password] {
				border: 2px solid rgb(217,217,217);
				font-size: 16px;
				height: 35px;
				margin-bottom: 5px;
				padding-top: 6px;
				text-align: center;
				width: 280px;
			}
			form input[type=text]:focus, form input[type=password]:focus { 
				border: 2px solid #071C7F; 
				outline-style: none; 
			}
			h2{
			color:#666666;
			font-size:1.4em;
			}
			#faq-box p,
			#faq-box ul li{
				margin-left:20px;
				color:#666666;
			}
			#faq-box ul li{
				margin:0px 0px 10px 0px;
			}
			
			
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
		<div align="center" style="width:100%; margin:60px 0px 100px 0px;">
			<div id="main-box" style="width:400px; background-color:#ffffff; padding:10px 50px 20px 50px;" class="rounded">
				<img src="/images/tweenky_logo.png">
				<div style="border:solid 0px #333333; padding:0px;">

						<? if (detect_ie()) { ?>
							<div align="left">Party foul!!  It looks like you are using Internet Explorer.  We are still in an early beta phase and IE7 support is coming soon.</div>
							<br />
							<div>In the meantime, you should<br /> <a href="http://www.getfirefox.com/"> go download Firefox</a>!</div>
						<? } else {
							if (isset($_GET['auto'])) { ?>
								<p style="color:red;">Your session has expired. <br /> Please log in again.</p>
							<? } ?>
							
							<form method="GET" id="login-form" onSubmit="return login()">
								
								<br />
								
								<div align="center">
									<input type="submit" value="Start &gt;&gt;" style="float:none; font-size:16px;"/>
								</div>

							</form>
							
							<div align="center" style="color:red; font-size:12px;">Note: This version of Tweenky (0.3) is still a in development and I appreciate your <a href="mailto:feedback@tweenky.com">feedback</a> with any bugs or issues you may run into.  Thanks!</div>

						<? 
						}
					?>
				</div>
				<div class="clear-fix"></div>
			</div>	
			<br />
			<div id="faq-box" style="width:400px; background-color:#ffffff; padding:10px 50px 20px 50px;" class="rounded" align="left">
				<h2>What is Tweenky?</h2>
					<p>A web-based micro-blogging ("tweet") client that currently supports Twitter and Identi.ca/Laconi.ca.</p>
					<p>You can read about it on <a href="http://www.techcrunch.com/2008/07/24/tweenky-brings-gmails-good-looks-to-twitter/">TechCrunch</a></p>
				
				<h2>What are some of the features?</h2>
					<p>Glad you asked!</p>
					<ul>
						<li>Integration with search.twitter.com (formerly Summize) to allow you to find &amp; track content as it flows through the "Twitterverse".</li>
						<li>Ajax powered auto-tweet-updating goodness so you never have to reload.  You can just sit back... and wach the tweets roll through.</li>
						<li>A list of hot topics that fills you in on the latest buzz in the "Twitterverse".</li>
						<li>And more!</li>
					</ul>
					
				<h2>Who made it?</h2>
					<p><a href="http://www.twitter.com/derek">This guy</a></p>
				
				<h2>Anything else you want to tell me?</h2>
					<p>Nope, I'm done. But is there anything you'd like to <a href="mailto:feedback@tweenky.com">tell me</a>?</p>
			</div>			
		</div>
		<script type="text/javascript">
			var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
			document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
		</script>
		<script type="text/javascript">
			var pageTracker = _gat._getTracker("UA-51709-10");
			pageTracker._initData();
			pageTracker._trackPageview();
		</script>
	</body>
</html>