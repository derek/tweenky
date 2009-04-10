	var current_query   = null;
	var current_refresh = null;
	var _last_hash      = null;
	var overlay 		= null;
	var loading_timeout = null;
	try { console.log(''); } catch(e) { console = { log: function() {} } }
	
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
		//load_groups();
		load_queries();
		
		setInterval("check_state()", 50);
		setInterval("recalculate_timestamps()", 60000 );
		setInterval('show_tweet()', 700);
		setInterval('cleanup()', 6000);
	})
	
	function load_groups()
	{
		group_id = 0;
		proxy({
			url: "http://derekgathright.com/tweetgroups/groups.opml",
			dataType: "xml", 
			success: function(xml){
				$(xml).find('body').each(function(){
					$(this).find('outline').each(function(){
						
						xmlUrl 	= $(this).attr("xmlUrl");
						id 		= hex_md5(xmlUrl);
						
						proxy({
							url: xmlUrl,
							dataType: "xml", 
							success: function(xml){
								$(xml).find('tweetgroup').each(function(i){
									html  = "<h3>"+ $(this).attr("title") +"</h3>";
									html += "<ul style='list-style-type:none; padding-left:10px;'>";
									$(this).children().each(function(i){
										if (this.nodeName == "list")
										{
											group_id++;
									    	title = $(this).attr("title");
									
											html += '<li id="groupid-'+group_id+'"> \
												<span class="pseudolink arrow-right" onclick="toggle_group('+group_id+')"></span> \
												<span class="pseudolink" onclick="group_search('+group_id+')">'+title+'</span> \
												<ul class="group-list" style="display:none;"> \
											';
											
											$($(this)).find('item').each(function(){
												qtitle = $(this).attr("title");
												query = $(this).attr("query");
												html += '<li><a href="#query='+query+'">'+qtitle+'</a></li>';
											});
											
											html += '</ul></li>';							
										}
										else
										{
											query = $(this).attr("query").replace("#", "%23");
											title = $(this).attr("title");
											html += '<li><a href="#query='+query+'">'+title+'</a></li>';
										}
									});	
									html += "</ul><br />";
									$('#tweetgroups').append(html);
								}
							)}
						});
					})
				})
			}
		});
	}
	function group_search(group_id)
	{
		query = '';
		delimeter = '';
		$("#groupid-"+group_id+" li a").each(function(){
			query = query + delimeter + $(this).attr("href").replace("#query=", "");
			delimeter = " OR ";
		});
		
		window.location.hash = "#query=" + query;
	}
	
	function load_queries()
	{
		proxy({
			url: "http://derekgathright.com/tweetgroups.xml",
			dataType: "xml", 
			success: function(xml){
				$('#query-list').html("<ul></ul>");
				$(xml).find('settings1').each(function(){
					$(this).find('queries').each(function(){
						html = '';
						$(this).find('query').each(function(){
						    query = $(this).text();
							html += '<li><a href="#query='+query+'">'+query+'</a></li>';
						});
						$('#query-list ul').append(html);
					});
				});
			}
		});
	}
	
	function reset_trends()
	{
		proxy({
			url: "http://search.twitter.com/trends.json",
			dataType: "json", 
			success: function(response){
				//console.log("Trends reset");
				
				$("#trends ol li a").each(function(i){
					for(j in response.trends)
					{
						if (response.trends[j].name == $(this).html())
						{
							if (i > j)
							{
							//	alert(response.trends[j].name + " is getting hotter.  was ("+i+") now ("+j+")");
							}
							if (j > i)
							{
							//	alert(response.trends[j].name + " is getting cooler.  was ("+i+") now ("+j+")");
							}
							//console.log(response.trends[j].name + " & " + $(this).html() + ": " + i + " - " + j)
						}
					}
				})
				
				
				
				$("#twitter-trends").empty().html("<ol></ol>");
				for(i in response.trends)
				{
					q = response.trends[i].url.substr( response.trends[i].url.lastIndexOf("=") + 1, response.trends[i].url.length)
					q = q.replace('"', "%22").replace(' ', "+"); 
					
					$("#twitter-trends ol").append('<li><a href="#query='+q+'">'+ response.trends[i].name +'</a></li>');
				}
			}
		});
		
		proxy({
			url: "http://www.google.com/trends/hottrends/atom/hourly",
			dataType: "text", 
			success: function(response){
				var regex = new RegExp('<a href="(.*)">(.*)</a></span></li>', "g");
				google_trends = new Array();
				while(match = regex.exec(response))
					google_trends[google_trends.length] = match[2];
				
				$("#google-trends").empty().html("<ol></ol>");
				for(i in google_trends)
				{
					if (i < 20)
						$("#google-trends ol").append('<li><a href="#query=%22' + google_trends[i] + '%22 -trend">'+ google_trends[i] +'</a></li>');
				}
			}
		});
	}
	
	function proxy(opt)
	{
		opt.url = "proxy.php?original_url="+opt.url
		//console.log(opt);
		$.ajax(opt);				
	}
	
	function get_timeline(timeline, new_search)
	{
	
		switch(timeline)
		{
			case "friends":
				var url = 'http://www.twitter.com/statuses/friends_timeline.json';
				var type = "GET";
				break;

			case "replies":
				var url = 'http://www.twitter.com/statuses/replies.json';
				var type = "GET";
				break;

			case "archive":
				var url = 'http://www.twitter.com/statuses/user_timeline.json';
				var type = "GET";
				break;

			case "public":
				var url = 'http://www.twitter.com/statuses/public_timeline.json';
				var type = "GET";
				break;

			case "directs":
				var url = 'http://www.twitter.com/direct_messages.json';
				var type = "GET";
				break;
		}
		
		var since_id = 1;
		
		if (new_search)
		{
			$("#tweets").empty();
			$("#search_query").val('');
		}
		else
		{
			$(".tweet").each(function(i, t){
				id = $(t).attr('id').replace("tweetid-", "");
				if (id > since_id)
					since_id = id;
			})
		}
		
		current_query = "timeline:"+timeline;
		
		loading_show();
		

		current_refresh = setTimeout('get_timeline("'+timeline+'", false)', 60000);
		//console.log(url);
		proxy({
			type    : type,
			url     : url,
			data    : {
				"count" : 20,
				"since_id" : since_id
			},
			dataType: "json",
			success : function(tweets){
				if (tweets.error)
				{	
					$("#login_link").overlay().load();
				}
				else
				{
					loading_hide();
					
					tweets.reverse();
					if (!new_search)
					{
						$("#tweets").prepend("<fieldset style='border-top:solid 1px #999999;'><legend align='right' style='color:#999999; padding-left:5px;' >"+tweets.length + ' new tweets at '+get_time()+'</legend> </fieldset>');
					}   

					$.each(tweets, function(i, tweet) {
						values = tweet.created_at.split(" ");
						tweet.created_at = Date.parse( values[1] + " " + values[2] + ", " + values[5] + " " + values[3]);

						if ($(tweet.source).html() != null)
						{
							tweet.source = "<a href='"+$(tweet.source).attr("href")+"' target='_blank'>"+$(tweet.source).html()+"</a>";
						}
						
						if ($("#tweetid-"+tweet.id).length == 0)
						{
							if (timeline == "directs")
							{
								tweet.user = tweet.sender;
								tweet.source = '';
							}
							//console.log(tweet);
							$("#tweets").prepend(tweet_to_html({
								id                      : tweet.id,
								text                    : tweet.text, 
								date_created            : tweet.created_at,
								from_user_id            : tweet.user.id,
								from_screen_name        : tweet.user.screen_name,
								from_name               : tweet.user.name,
								from_profile_image_url  : tweet.user.profile_image_url,
								source                  : tweet.source,
								in_reply_to_status_id   : tweet.in_reply_to_status_id,
								in_reply_to_user_id     : tweet.in_reply_to_user_id,
								in_reply_to_screen_name : tweet.in_reply_to_screen_name
							}));
						}
					});

					if (new_search)
					{
						$(".tweet").show();
					}
				}
			}
		});
	}
	
	function show_tweet()
	{
		if ($(".tweet:hidden").length > 0)
		{
			$(".tweet:hidden:last").slideDown();
		}
	}
	
	function cleanup()
	{
		while($(".tweet:visible").length > 200)
		{
			$(".tweet:visible:last").slideUp().remove();
		}				
	}
	

	function get_querystring_object()
	{
		queryString = new Object();

		var parameters = window.location.hash.substring(1).split('&');
		for (var i=0; i<parameters.length; i++) {
			var pos = parameters[i].indexOf('=');
			if (pos > 0) {
				var paramname = parameters[i].substring(0,pos);
				var paramval = parameters[i].substring(pos+1);
				queryString[paramname] = unescape(paramval.replace(/\+/g,' '));
			} else {
				queryString[parameters[i]]="";
			}
		}
		return queryString;
	}
	
	function check_state()
	{
		if (window.location.hash != _last_hash)
		{
			_last_hash = window.location.hash;
			new_state();
		}
		else if (window.location.hash == "")
		{
			window.location.hash = "timeline=friends";
		}
		
		return true;
	}

	function new_state()
	{   
		clearTimeout(current_refresh);
		//$("#loading").show();
		var params = get_querystring_object();
		
		if (params.timeline)
		{
			get_timeline(params.timeline, true)
		}
		else if (params.query)
		{
			get_search(params.query, true);
		}
		else if (params.group)
		{
			group_load_by_id(params.group);
		}
		else if (params.logout)
		{
			var d = new Date();
		    document.cookie = "PHPSESSID=0;path=/;expires=" + d.toGMTString() + ";" + ";";
		    
			window.location.href = "/oauth.php?logout";
		}
	}
	
	function get_time()
	{
		var a_p = "";
		var d = new Date();

		var curr_hour = d.getHours();

		if (curr_hour < 12)
		   {
		   a_p = "AM";
		   }
		else
		   {
		   a_p = "PM";
		   }
		if (curr_hour == 0)
		   {
		   curr_hour = 12;
		   }
		if (curr_hour > 12)
		   {
		   curr_hour = curr_hour - 12;
		   }

		var curr_min = d.getMinutes();
		if (curr_min < 10)
			curr_min = "0" + curr_min.toString();

		var curr_sec = d.getSeconds();
		if (curr_sec < 10)
			curr_sec = "0" + curr_sec.toString();
			
		return curr_hour + ":" + curr_min + ":" + curr_sec + " " + a_p;
		
	}
	
	function get_search(query, new_search)
	{
		since_id = 0;
		
		if (!new_search)
		{
			$(".tweet").each(function(i, t){
				id = $(t).attr('id').replace("tweetid-", "");
				if (id > since_id)
				{
					//console.log(id + " is greater than " + since_id);
					since_id = id;
				}
				else
				{
					//console.log(id + " is NOT greater than " + since_id);
				}
			});
		}
		else
		{
			$("#search_query").val(query);
		}
		search_url  = "http://search.twitter.com/search.json?q="+(query.replace("#", "%23")) + "&rpp=50";
		
		if (since_id > 0)
			search_url += "&since_id="+since_id;
			
		loading_show();
		
			
		current_refresh = setTimeout('get_search("'+addslashes(query)+'", false)', 20000);
		console.log(search_url);
		proxy({
			type    : "GET",
			url     : search_url,
			dataType: "json",
			success : function(response){
				loading_hide();
				response.results.reverse();
				
				if (new_search)
				{
					$("#tweets").empty();
					//$("#content").prepend(" <span style='float:right; padding-left:10px;'>"+response.results.length + ' tweets at '+get_time()+'</span> <hr />');
				}
				else    
				{   
					$("#tweets").prepend("<fieldset style='border-top:solid 1px #999999;'><legend align='right' style='color:#999999; padding-left:5px;' >"+response.results.length + ' new tweets at '+get_time()+'</legend> </fieldset>');
				}   
				
				$.each(response.results, function(i, tweet) {
					values = tweet.created_at.split(" ");
					tweet.created_at = Date.parse(values[2] + " " + values[1] + ", " + values[3] + " " + values[4]);
					
					
					if ($("#tweetid-"+tweet.id).length == 0)
					{
						$("#tweets").prepend(tweet_to_html({
							id                      : tweet.id,
							profile_image_url       : tweet.profile_image_url,
							from_user               : tweet.from_user,
							text                    : tweet.text, 
							date_created            : tweet.created_at,
							from_user_id            : tweet.from_user_id,
							from_screen_name        : tweet.from_user,
							from_name               : tweet.from_user,
							from_profile_image_url  : tweet.profile_image_url,
							to_user                 : tweet.to_user,
							source                  : ''
						}));
					}
				});
				
				if (new_search)
				{
					$(".tweet").show();
				}
			}
		});
	}
	function addslashes( str ) {
	    return (str+'').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
	}
	
	function tweet_wrap(text)
	{
		var params = get_querystring_object();
		if (params.query)
		{
			params.query = params.query.replace(/"/g, "");
			regex = new RegExp("("+params.query+")", "gi");
			text = text.replace(regex,'<span style="background-color:yellow; font-weight:bold;">$1<\/span>');
		}
		text = text.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi,'<a href="$1" target="_blank">$1<\/a>');
		text = text.replace(/@([a-zA-Z0-9_]+)/gi,'<a class="query" href="http://www.twitter.com/$1" target="_blank">@$1<\/a>');
		text = text.replace(/<a[^>]+>(http:\/\/tinyurl.com\/[^<]+)<\/a>/g,'<a href="$1" target="_blank" onmouseover="decode_tinyurl(\'$1\')">$1<\/a>');
		//text = text.replace(/<a[^>]+>([http:\/\/]*[a-zA-Z0-9_\.]*youtube.com\/watch\?v=([^<]+))<\/a>/g,'<a class="{frameWidth: 425, frameHeight: 355}" href="http://ddev.tweenky.com/youtube.php?key=$2" onmouseover="log(\'$2\')">$1<\/a>');

		return text;
	}
	
	function decode_tinyurl()
	{
		
	}
	
	function tweet_to_html(tweet)
	{
		user_link = "http://www.twitter.com/"+tweet.from_screen_name;
		external_url = user_link + "/statuses/" + tweet.id;
		
		html = "\
			<div class='tweet' style='clear:left; display:none' id='tweetid-"+tweet.id+"'> \
				<div><div id='reply-to-tweetid-"+tweet.id+"'></div></div> \
				<div> \
					<a  class='tweet-image fancybox' href='"+user_link+"' class='timestamp' target='_blank'> \
						<img src='" + tweet.from_profile_image_url + "' height='50' width='50'> \
					</a> \
				</div> \
				<div class='tweet-body'> \
					<p class='tweet-text' style='display:none;'>"+tweet_wrap(tweet.text)+"</p> \
					<p class='tweet-tweet'><a href='"+user_link+"' class='tweet-author' target='_blank'>"+tweet.from_screen_name+"</a>: <span class='tweet-text'>" + tweet_wrap(tweet.text) +"</span></p> \
					<div class='tweet-footer'><a href='" + external_url + "' title='" + (tweet.date_created) + "' class='timestamp' target='_blank'>"+relative_time(tweet.date_created)+"</a> " + ((tweet.source != '') ? "from "+ tweet.source : "");

						if (tweet.in_reply_to_status_id > 0)
						{
							html += " | in reply to <a href='http://www.twitter.com/"+ tweet.in_reply_to_screen_name+"/status/"+tweet.in_reply_to_status_id+"' target='_blank'>"+ tweet.in_reply_to_screen_name+"</a>";
						}   

				html += " | <span class='pseudolink' onclick='compose_new_tweet(\"@"+tweet.from_screen_name+" \", "+tweet.id+")'>Reply</span> | \
						<span class='pseudolink' onclick='compose_new_tweet(\"d "+tweet.from_screen_name+" \")'>Direct</span> | \
						<span class='pseudolink' onclick='retweet(\""+tweet.id+"\")'>Retweet</span> \
					</div> \
				</div> \
				<div class='clear-fix'></div> \
			</div> \
		";
		return html;                
	}

	function relative_time(parsed_date) {
	   var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
	   var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);  
	   delta = delta + (relative_to.getTimezoneOffset() * 60);
	
	   if (delta < 60) {
		 return 'less than a minute ago';
	   } else if(delta < 120) {
		 return 'a minute ago';
	   } else if(delta < (45*60)) {
		 return (parseInt(delta / 60)).toString() + ' minutes ago';
	   } else if(delta < (90*60)) {
		 return 'an hour ago';
	   } else if(delta < (24*60*60)) {
		 return '' + (parseInt(delta / 3600)).toString() + ' hours ago';
	   } else if(delta < (48*60*60)) {
		 return '1 day ago';
	   } else {
		 return (parseInt(delta / 86400)).toString() + ' days ago';
	   }
	 };



	function recalculate_timestamps()
	{
		$(".timestamp").each(function(){
			$(this).html(relative_time($(this).attr('title')));
		});
	}
	
	
	
	function toggle_group(group_id)
	{
		$('#groupid-'+group_id+' span:first').toggleClass('arrow-right').toggleClass('arrow-down');
		$('#groupid-'+group_id+' .group-list').toggle();
	}
	/*
	function show_group_page(group)
	{
		loading_hide();
		html =  "\
		<h1 style='text-decoration:underline;'>Group Edit</h1> \
		<h2>Title: " + group.title + "</h2> \
		<h2>Description: " + group.description + "</h2> \
		<h2>Users:</h2> \
		<ul>";
		
		for(j in group.users)
		{
			html += '<li>[<span class="pseudolink" onclick="tweetgroup_delete_user('+group.group_id+', \''+groups[i].users[j]+'\')">x</span>] '+groups[i].users[j]+'</li>';
		}
		html += ' \
		</ul> \
		<br /> \
		<h2>Add User:</h2> \
		<input type="text" id="new_username"><input type="button" value="add" onclick="tweetgroup_add_user('+group.group_id+')"> \
		';
		
		$("#tweets").html(html);
		
	}*/
	
	
	
	function textCounter(field) {
		if (field.value.length > 140)
		{
			$("#character_count").html(140 - field.value.length).css("color", "red");
		}
		else
		{
			$("#character_count").html(field.value.length).css("color", "black");
		}
	}
	
	function login(){
		proxy({
			type    : "POST",
			url     : "http://www.twitter.com/account/verify_credentials.json",
			data    : {
				"username"	: $("#form_login :input[name=username]").val(),
				"password"	: $("#form_login :input[name=password]").val()
			},
			dataType: "json",
			success : function(response){
				if(response && response.id)
					window.location.reload();
				else
					$("#invalid_login").show();
			}
		});
		
		
		return false;
	}
	
	function service_tinyurl()
	{
		orig_url = $("#url-to-tiny").val();
		
		if (isURL(orig_url))
		{
			proxy({
				type    : "POST",
				url     : "http://tinyurl.com/api-create.php?url="+orig_url,
				success : function(tinyurl){
					$("#status").val($("#status").val() + tinyurl);
					$("#tiny-info").slideUp();
					$("#url-to-tiny").val('http://');
				}
			});
		}
		else
		{
			alert('Invalid URL');
		}
	}
	
	function service_isgd()
	{
		orig_url = $("#url-to-isgd").val();
		
		if (isURL(orig_url))
		{
			proxy({
				type    : "POST",
				url     : "http://is.gd/api.php?longurl="+orig_url,
				success : function(tinyurl){
					$("#status").val($("#status").val() + tinyurl);
					$("#isgd-info").slideUp();
					$("#url-to-isgd").val('http://');
				}
			});
		}
		else
		{
			alert('Invalid URL');
		}
	}
	
	function service_tweetburner()
	{
		orig_url = $("#url-to-tweetburn").val();
		if (isURL(orig_url))
		{
			proxy({
				type    : "POST",
				url     : "http://tweetburner.com/links",
				data    : {
					"link[url]" : orig_url
				},
				success : function(tinyurl){
					$("#status").val($("#status").val() + tinyurl);
					$("#tweetburner-info").slideUp();
					$("#url-to-tweetburn").val('http://');
				}
			});
		}
		else
		{
			alert('Invalid URL');
		}
	}
	
	function service_twitpic()
	{
		$("#twitpic").ajaxSubmit({
			"url" : "/proxy.php?original_url=http://twitpic.com/api/upload",
			"type": "POST",
			"dataType": "xml",
			"success": function(xml){
				$(xml).find('mediaurl').each(function(){
					media_url = $(this).text();
				})
				
				$("#status").val($("#status").val() + media_url);
				$("#twitpic-info").slideUp();
			}
		}); 
		
	    return false; 
	}
	
	function isURL(s) {
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
		return regexp.test(s);
	}
	
	function send_new_tweet()
	{
		if($("#status").val().length < 141)
		{
			proxy({
				type    : "POST",
				url     : "http://www.twitter.com/statuses/update.json",
				data    : {
					"status"				: $("#status").val(),
					"in_reply_to_status_id" : $("#in_reply_to_id").val()
				},
				dataType:"json",
				success : function(response){
					if (response.id)
					{
						$("#character_count").html('0');
						$("#status").val('');
						$("#compose_tweet").click();
					}
					else
					{
						alert("Oops, something went wrong.");
					}

				}
			});
		}
		else
		{
			alert("Tweet must be 140 characters or less");
		}
	}
	
	function compose_new_tweet(status, in_reply_to_id)
	{
		$("#status").val(status);
		$("#in_reply_to_id").val(in_reply_to_id);
		$('#new_tweet_box').slideDown();
	}
	
	function loading_show()
	{
		$("#loading").html("Loading...").show();
		loading_timeout = setTimeout("loading_error()", 5000);
		
	}
	
	function loading_hide()
	{
		$("#loading").fadeOut();
		clearTimeout(loading_timeout);
	}
	
	function loading_error()
	{
		$("#loading").html("Still loading...");
		setTimeout("loading_unable()", 15000);
	}
	
	function loading_unable()
	{
		$("#loading").append(" Try refreshing?");
	}
	
	function retweet(id)
	{
		proxy({
			type    : "GET",
			url     : "http://www.twitter.com/statuses/show/"+id+".json",
			dataType:"json",
			success : function(response){
				compose_new_tweet("Retweet @"+response.user.screen_name+": "+response.text);
			}
		});
	}
	

	
