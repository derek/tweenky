<?php
	
	session_start();
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
	<head>
		<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
	
		<title>Tweenky | A Tweet Client</title>
		
	 	<link rel="stylesheet" type="text/css" href="/css/main.css" />
	    
		<script type="text/javascript" src="http://www.google.com/jsapi"></script>
		<script type="text/javascript">
			google.load("language", "1");
			google.load("jquery", "1.2");
		</script>
		<script type="text/javascript" src="/js/jquery/jquery.json-1.2.js"></script>
		<script type="text/javascript" src="/js/jquery/jquery.tooltip.js"></script>
		<script type="text/javascript" src="/js/jquery/fancybox/jquery.metadata.js"></script>
		<script type="text/javascript" src="/js/jquery/fancybox/jquery.pngFix.pack.js"></script>
		<script type="text/javascript" src="/js/jquery/fancybox/jquery.fancybox-1.0.0.js"></script>
		<script type="text/javascript" src="/js/jquery/jfade.1.0.js"></script>
		<script type="text/javascript" src="/js/persist-js-0.1.0/persist.js"></script>
		<script type="text/javascript" src="/js/tweenky.js?68435483"></script>
		<script type="text/javascript" src="/js/helpers.js?68435483"></script>
		<script type="text/javascript" src="/js/app.twitter.js?68435483"></script>
		
		<link rel="stylesheet" href="http://jquery.bassistance.de/tooltip/jquery.tooltip.css" />
		<link rel="stylesheet" type="text/css" href="/js/jquery/fancybox/fancy.css" media="screen" />
		
		<script>
			_refresh_timer 	= null;
			_state_interval = null
			_home_hash		= "timeline=friends";
			
			google.setOnLoadCallback(function() {
				$(".section .title").bind("click", function(title){
					if ($(title.target).attr("class").match(/right-arrow/) != null || $(title.target).attr("class").match(/down-arrow/) != null)
					{
						section_display_toggle(title.target.parentNode.id)
					}
				});
			});
			
			_state_interval = setInterval ( "check_state()", _refresh_time );
			
			function section_display_toggle(section_title, method, action)
			{
				if (method == "slideToggle")
				{
					$("#" + section_title + " .title").toggleClass('right-arrow').toggleClass('down-arrow');
					$("#" + section_title + " .innertube").slideToggle();
					$("#" + section_title + " .footer").slideToggle();
				}
				else if (method == "slideUp")
				{
					$("#" + section_title + " .title").addClass('right-arrow').removeClass('down-arrow');
					$("#" + section_title + " .innertube").slideUp();
					$("#" + section_title + " .footer").slideUp();
				}
				else if (method == "show")
				{
					$("#" + section_title + " .title").removeClass('right-arrow').addClass('down-arrow');
					$("#" + section_title + " .innertube").show();
					$("#" + section_title + " .footer").show();
				}
				else if (method == "hide")
				{
					$("#" + section_title + " .title").addClass('right-arrow').removeClass('down-arrow');
					$("#" + section_title + " .innertube").hide();
					$("#" + section_title + " .footer").hide();
				}
				else
				{
					$("#" + section_title + " .title").toggleClass('right-arrow').toggleClass('down-arrow');
					$("#" + section_title + " .innertube").toggle();
					$("#" + section_title + " .footer").toggle();
				}
			}
			
		</script>
	</head>
	<body>

		<div id="loading" style="font-size:12px; position:absolute;top:-2px;left:48%;background-color:yellow; width:100px; padding:3px;">Loading...</div>
		<div id="maincontainer">

			<div id="topsection">
				<div style="float:right;">
					<a href="#view=settings" class="small">Settings</a> | 
					<a href="#view=logout" class="small">Sign Out</a>
				</div>
				<div style="width:230px; height:60px;" class="pseudolink" onclick="window.location.hash = _home_hash" align="center"><img height="50" src="http://beta.tweenky.com/images/tweenky_small.png" /></div>
				<div class="clear-fix"></div>
			</div>
			
			<div id="leftcolumn"></div>
			
			
			<div id="contentwrapper">
				<div id="content-settings" style="display:none;">
					<div id="settings" class="rounded section">
						<div class="title">Settings</div>
						<div class="toolbar">
							<ul>
								<li id="settings-tab-applications"><a href="#view=settings&tab=applications">Applications</a></li>
							</ul>
						</div>
						<div class="innertube">
							
							<div id="settings-account"  class="settings-menu">
								<div class="innertube">
								</div>
							</div>
							
							<div id="settings-applications"  class="settings-menu">
								<div class="innertube">
								</div>
							</div>
							
							<div id="settings-folders"  class="settings-menu">
								<div class="innertube">
								</div>
							</div>
							
							<div id="settings-bookmarks"  class="settings-menu">
								<div class="innertube">
								</div>
							</div>
							
							<div id="settings-notifications"  class="settings-menu">
								<div class="innertube">
								</div>
							</div>
							
							<div class="clear-fix"></div>
						</div>
					</div>
				</div>
				<div id="content-tweets">			
					<div id="update-status" class="rounded section">
						<div class="title right-arrow"> Post a New Tweet</div>
						<div class="innertube hidden">
							<div style="float:left; width:500px;">
								<textarea style="width:100%; height:150px;" id="new-status" onkeyup="$('#new-status-char-count').html(string_length_counter(this))"></textarea><br />
							
								<span id="new-status-char-count">0</span>/140
								<input type="button" value="Send Update" onclick="update_status($('#new-status').val())" />
							</div>
							<div style="float:left; margin-left:30px;">
								<ul id="new-tweet-services-list" style="list-style:none; margin:0px; padding:0px; vertical-align:top;" class="small">
								</ul>
							</div>
							<div style="float:left; margin-left:30px;">
								<ul style="list-style:none; margin:0px; padding:0px;" class="small">
									<li style="font-weight:bold;">Services</li>
									<li class="pseudolink" onclick="service_shorten_url('snipurl')">snipurl.com</li>
									<li class="pseudolink hidden" onclick="service_shorten_url('is.gd')">is.gd</li>
								</ul>
							</div>
							<div class="clear-fix"></div>
						</div>
					</div>
					
					<div id="query-detail" class="rounded section">
						<div class="header" style="padding:3px;"></div>
						<div id="query-detail-content" class="innertube" style="margin:0px;padding:0px;">
							<div id="profile-info" class="hidden" style="padding:10px; background:#C3D9FF; clear:right;"></div>
							<div id="tweet-list"></div>
							<div class="clear-fix"></div>
						</div>	
						<div class="clear-fix"></div>
					</div>
					<div class="clear-fix"></div>	
				</div>		
			</div>		
			
			<div id="footer">
				<p>Tweenky.com &copy; 2008-2009</p>
			</div>

		</div>
		<script>
		
		
		//Tweenky.storage.remove('saved_data');
		//Tweenky.applications.save();
		Tweenky.applications.load();
		</script>
		<script src="http://tweenky.uservoice.com/pages/general/widgets/tab.js?alignment=right&amp;color=00BCBA" type="text/javascript"></script>
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