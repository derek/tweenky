	var current_query   = null;
	var current_refresh = null;
	var _last_hash      = null;
	var overlay 		= null;
	var loading_timeout = null;
	
	search_t = Object();
	search_numbers = Array();
//	try { console.log(''); } catch(e) { console = { log: function() {} } }
	
	
	
	$(document).ready(function() {
		
		

		setTimeout("load_tweetgroups()", 1500);
		setTimeout("load_saved_searches()", 2200);
		setTimeout("reset_trends()", 3000);
		
		setInterval("check_state()", 50);
		setInterval("recalculate_timestamps()", 60000 );
		setInterval('show_hidden_tweets()', 700);
		setInterval('cleanup()', 6000);
		setInterval('reset_trends()', 60000);
		
		$("#navigation a div").live("click", function(){
			$("#navigation .selected").removeClass("selected");
			$(this).addClass("selected");
		});
		/*$("#tweetgroups .inner a div").live("mouseover", function(e, myName, myValue){
			group_id = e.target.id.replace("group-title-", "");
			toggle_group(group_id);
		});*/
		
		
	})
	
	
	function show_login_overlay()
	{
		$("#facebox").overlay({

			// custom top position
			top: 100,

			// some expose tweaks suitable for facebox-looking dialogs
			expose: {

				// you might also consider a "transparent" color for the mask
				color: '#fff',

				// load mask a little faster
				loadSpeed: 200,

				// highly transparent
				opacity: 0.5
			},

			// disable this for modal dialog-type of overlays
			closeOnClick: false,

			// we want to use the programming API
			api: true

		// load it immediately after the construction
		}).load();
	}
	
	function load_tweetgroups()
	{
		group_id = 0;
		proxy({
			url: "http://tweetgroups.net/api/search/groups?list=" + user_id,
			dataType: "json", 
			success: function(response){
				$('#tweetgroups .inner').empty();
				if (response.data.length > 0)
				{
					for(i in response.data)
					{
						group = response.data[i];
						/*html = '<div id="groupid-'+group.group_id+'"> \
							<span class="pseudolink arrow-right" onclick="toggle_group('+group.group_id+')"></span> \
							<span class="pseudolink" onclick="group_search('+group.group_id+')">'+group.title+'</span> \
							<ul class="group-list" style="display:none;"> \
						';*/
						//html =  '<div id="groupid-'+group.group_id+'">';
						html = '<a href="#" onclick="group_search('+group.group_id+'); return false;"><div id="group-title-' + group.group_id + '">'+group.title+'</div></a>';
						html += '<ul id="group-list-'+group.group_id+'" class="group-list" style="display:none;">';
						for(i in group.users)
						{
							username = group.users[i];
							html += '<li><a href="#query=from:'+username+'">'+username+'</a></li>';
						}
						html += '</ul>';
						//html += '</div>';
						

						$('#tweetgroups .inner').append(html);
					}
				}
				else
				{
					$('#tweetgroups .inner').append("<div style='font-style:italic;color:#999999;'>None</div><ul></ul>");
				}
			}
		});
	}
	
	function group_search(group_id)
	{
		query = '';
		delimeter = '';
		toggle_group(group_id);
		$("#group-list-"+group_id+" li a").each(function(){
			query = query + delimeter + $(this).attr("href").replace("#query=from:", "");
			delimeter = ",";
		});
		
		window.location.hash = "#group=" + query;
	}
	
	function load_queries()
	{
		proxy({
			url: "http://derekgathright.com/tweetgroups.xml",
			dataType: "xml", 
			success: function(xml){
				$('#query-list').empty();
				$(xml).find('settings1').each(function(){
					$(this).find('queries').each(function(){
						html = '';
						$(this).find('query').each(function(){
						    query = $(this).text();
							html += '<div><a href="#query='+query+'">'+query+'</a></div>';
						});
						$('#query-list ul').append(html);
					});
				});
			}
		});
	}
	
	function load_saved_searches()
	{
		proxy({
			url: "http://www.twitter.com/saved_searches.json",
			dataType: "json", 
			success: function(response){
				if (response.length > 0)
				{
					$("#saved-searches .inner").empty();
					for(i in response)
					{
						search = response[i];
						$("#saved-searches .inner").append('<a href="#query=' + search.query + '"><div>'+ search.name +'</div></a>');
					}
				}
				else
				{
					$("#saved-searches .inner").html("<div style='font-style:italic;color:#999999;'>Empty</div>");
				}
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
				
				/*$("#trends ol li a").each(function(i){
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
				})*/
				
				$("#twitter-trends .inner").html("");
				for(i in response.trends)
				{
					q = response.trends[i].url.substr( response.trends[i].url.lastIndexOf("=") + 1, response.trends[i].url.length)
					q = q.replace('"', "%22").replace(' ', "+"); 
					
					$("#twitter-trends .inner").append('<a href="#query='+q+'"><div>'+ response.trends[i].name +'</div></a>');
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

			case "favorites":
				var url = 'http://www.twitter.com/favorites.json';
				var type = "GET";
				break;

			case "dmin":
				var url = 'http://www.twitter.com/direct_messages.json';
				var type = "GET";
				break;
				
			case "dmout":
				var url = 'http://www.twitter.com/direct_messages/sent.json';
				var type = "GET";
				break;
		}
		
		var since_id = 1;
		
		if (new_search)
		{
			$("#tweets").fadeOut(300, function(){$(this).show().html("<div align='center'><br /><br /><br /><img src='/image/ajaxsm.gif'></div>")});
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
					//alert("Twitter says: " + tweets.error);
					show_login_overlay();
				}
				else
				{
					loading_hide();
					
					tweets.reverse();
					if (!new_search)
					{
						$("#tweets").prepend("<fieldset style='border-top:solid 1px #999999;'><legend align='right' style='color:#999999; padding-left:5px;' >"+tweets.length + ' new tweets at '+get_time()+'</legend> </fieldset>');
					}
					else
					{
						$("#tweets").empty();
					}

					$.each(tweets, function(i, tweet) {
						values = tweet.created_at.split(" ");
						tweet.created_at = Date.parse( values[1] + " " + values[2] + ", " + values[5] + " " + values[3]);
						
						/*
						if ($(tweet.source).html() != null)
						{
							tweet.source = "<a href='"+$(tweet.source).attr("href")+"' target='_blank'>"+$(tweet.source).html()+"</a>";
						}
						*/
						
						if ($("#tweetid-"+tweet.id).length == 0)
						{
							var tw = new Tweet(tweet.id);
							if (timeline == "dmin")
							{
								tweet.user = tweet.sender;
								tweet.source = '';
							}
							
							if (timeline == "dmout")
							{
								tweet.user = tweet.sender;
								tweet.source = '';
								
								tweet.in_reply_to_user_id 		= tweet.recipient.id; 
								tweet.in_reply_to_screen_name 	= tweet.recipient.screen_name;
								tweet.in_reply_to_status_id 	= 0;
							}
							
							tw.text                    = tweet.text; 
							tw.date_created            = tweet.created_at;
							tw.from_user_id            = tweet.user.id;
							tw.from_screen_name        = tweet.user.screen_name;
							tw.from_name               = tweet.user.name;
							tw.from_profile_image_url  = tweet.user.profile_image_url;
							tw.source                  = tweet.source;
							tw.in_reply_to_status_id   = tweet.in_reply_to_status_id;
							tw.in_reply_to_user_id     = tweet.in_reply_to_user_id;
							tw.in_reply_to_screen_name = tweet.in_reply_to_screen_name;
							tw.favorited               = tweet.favorited;
							
							$("#tweets").prepend(tw.get_html());
						}
					});

					if (new_search)
					{
						$(".tweet").fadeIn();
					}
				}
			}
		});
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
			$(".group-list").slideUp(); // Since we definitely aren't viewing a group anymore
			$("#save-query").hide();
			get_timeline(params.timeline, true)
		}
		else if (params.query)
		{
			$("#save-query").show();
			$("#saved-searches li a").each(function(){
				if($(this).html() == params.query)
					$("#save-query").hide();
			});
			get_search(params.query, true, false);
		}
		else if (params.group)
		{
			$("#save-query").hide();
			get_search(params.group, true, true);
		}
		else if (params.group)
		{
			$("#save-query").hide();
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
	
	function get_search(query, new_search, group_search)
	{
		// Reset these values
		search_numbers = Array();
		search_t = Object();
		

		current_refresh = setTimeout('get_search("'+addslashes(query)+'", false)', 20000);
		
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
			$("#tweets").fadeOut(300, function(){$(this).show().html("<div align='center'><br /><br /><br /><img src='/image/ajaxsm.gif'></div>")});
			if (group_search)
				$("#search_query").val('');
			else
				$("#search_query").val(query);
		}
		
		queries = new Array();
		if (group_search)
		{
			users = query.split(",");

			var i = 0;
			for(var n in users)
			{
				if ((queries[i] + "from:" + users[n] + " OR ").length > 140)
					i++;
				if (queries[i])
					queries[i] += " OR ";
				else
					queries[i] = "";
				queries[i] += "from:" + users[n];
			}
		}
		else
		{
			queries[0] = query;
		}
		for (var i in queries)
		{
			queries_run = 0;
			search_url = "http://search.twitter.com/search.json?rpp=50&q=" + queries[i].replace("#", "%23") + "&callback=?";

			if (since_id > 0)
				search_url += "&since_id="+since_id;

			loading_show();
			
			$.getJSON(search_url,
		        function(response){
					queries_run++;
					if(response.results){
						for(var i=0; i < response.results.length; i++)
						{
							search_numbers[search_numbers.length] = response.results[i].id;
							search_t[response.results[i].id] = response.results[i];
						}
							if (queries_run == queries.length)
								display_search_tweets(new_search);
					}
					else
					{
						loading_hide();
						$("#tweets").html("<br /><br /><br /><div align='center'>No results found</div>");
					}
					
		        }
			);
		}
	}
	
	
	function display_search_tweets(new_search)
	{
		loading_hide();
		
		if (new_search)
		{
			$("#tweets").empty();
			//$("#content").prepend(" <span style='float:right; padding-left:10px;'>"+response.results.length + ' tweets at '+get_time()+'</span> <hr />');
		}
		else    
		{   
			$("#tweets").prepend("<fieldset style='border-top:solid 1px #999999;'><legend align='right' style='color:#999999; padding-left:5px;' >new tweets at "+get_time()+"</legend> </fieldset>");
		}
		
		search_numbers.sort();
		tweets = search_t;
		
		html = ''
		
		for(var i in search_numbers) {
			tweet = tweets[search_numbers[i]];
			
			values = tweet.created_at.split(" ");
			tweet.created_at = Date.parse(values[2] + " " + values[1] + ", " + values[3] + " " + values[4]);
			
			if ($("#tweetid-"+tweet.id).length == 0)
			{
				tw = new Tweet(tweet.id);
				tw.profile_image_url       = tweet.profile_image_url;
				tw.from_user               = tweet.from_user;
				tw.text                    = tweet.text;
				tw.date_created            = tweet.created_at;
				tw.from_user_id            = tweet.from_user_id;
				tw.from_screen_name        = tweet.from_user;
				tw.from_name               = tweet.from_user;
				tw.from_profile_image_url  = tweet.profile_image_url;
				tw.to_user                 = tweet.to_user;
				tw.source                  = '';
				
				$("#tweets").prepend(tw.get_html());
			}
		}
		
		if (new_search)
		{
			$(".tweet").fadeIn();
		}


	}
	
	function old_search()
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
			$("#tweets").fadeOut(300, function(){$(this).show().html("<div align='center'><br /><br /><br /><img src='/image/ajaxsm.gif'></div>")});
			$("#search_query").val(query);
		}
		search_url  = "http://search.twitter.com/search.json?q="+(query.replace("#", "%23")) + "&rpp=50";
		
		if (since_id > 0)
			search_url += "&since_id="+since_id;
			
		loading_show();
		
			
		current_refresh = setTimeout('get_search("'+addslashes(query)+'", false)', 20000);
		
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
						tw = new Tweet(tweet.id);
						tw.profile_image_url       = tweet.profile_image_url;
						tw.from_user               = tweet.from_user;
						tw.text                    = tweet.text;
						tw.date_created            = tweet.created_at;
						tw.from_user_id            = tweet.from_user_id;
						tw.from_screen_name        = tweet.from_user;
						tw.from_name               = tweet.from_user;
						tw.from_profile_image_url  = tweet.profile_image_url;
						tw.to_user                 = tweet.to_user;
						tw.source                  = '';
						
						$("#tweets").prepend(tw.get_html());
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
	
	function decode_tinyurl()
	{
		
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
		if ($('#group-list-'+group_id+':visible').length < 1)
		{
			$(".group-list").slideUp();
			$('#group-list-'+group_id).slideToggle();
		}
	}
	
	
	
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
	
	function service_trim()
	{
		orig_url = $("#url-to-trim").val();
		
		if (isURL(orig_url))
		{
			proxy({
				type    : "POST",
				url     : "http://api.tr.im/api/trim_simple?url="+orig_url,
				success : function(tinyurl){
					$("#status").val($("#status").val() + tinyurl);
					$("#trim-info").slideUp();
					$("#url-to-trim").val('http://');
				}
			});
		}
		else
		{
			alert('Invalid URL');
		}
	}
	
	function service_bitly()
	{
		orig_url = $("#url-to-bitly").val();
		if (isURL(orig_url))
		{
			proxy({
				type    : "POST",
				url     : "http://api.bit.ly/shorten?version=2.0.1&longUrl=" + orig_url + "&login=drgath&apiKey=R_0333378559d79e167d505a678a1779ce",
				dataType: "json",
				success : function(data){
					$("#status").val($("#status").val() + data.results[orig_url].shortUrl);
					$("#bitly-info").slideUp();
					$("#url-to-bitly").val('http://');
				}
			});
		}
		else
		{
			alert('Invalid URL');
		}
	}
	
	function service_waly()
	{
		orig_url = $("#url-to-waly").val();
		if (isURL(orig_url))
		{
			proxy({
				type    : "POST",
				url     : "http://wa.ly/api/url/create?url=" + orig_url,
				dataType: "json",
				success : function(data){
					$("#status").val($("#status").val() + data.url);
					$("#waly-info").slideUp();
					$("#url-to-waly").val('http://');
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
	
	function save_query()
	{
		var query = get_querystring_object().query;
		
		proxy({
			type    : "POST",
			url     : "http://www.twitter.com/saved_searches/create.json",
			dataType:"json",
			data	: {"query":query},
			success : function(response){
				$("#save-query").fadeOut();
				load_saved_searches();
			}
		});
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
		$("#loading").append(" Try <span class=\"pseudolink\" onclick=\"window.location.href = window.location.href\">refreshing</span>");
	}
	
	
	
	function retweetHandler(id, via)
	{
		proxy({
			type    : "GET",
			url     : "http://www.twitter.com/statuses/show/"+id+".json",
			dataType:"json",
			success : function(response){
				if (via)
					compose_new_tweet(response.text + " (via @"+response.user.screen_name+")");
				else
					compose_new_tweet("RT @"+response.user.screen_name+": "+response.text);
			}
		});
	}
	 
	function favoriteHandler(id, action)
	{
		tweet = new Tweet(id);
		tweet.favorite(action);
	}
	
	function show_hidden_tweets()
	{
		if ($(".tweet:hidden").length > 0)
		{
			$(".tweet:hidden:last").slideDown();
		}
	}
	
	
	
	
	
	
	
	
	
	
	
	function Tweet(tweet_id)
	{
		this.id = tweet_id;
		
		this.get_html = function()
		{
			//user_link = "http://www.twitter.com/"+tweet.from_screen_name;
			user_link = "http://www.twitter.com/"+this.from_screen_name;
			external_url = user_link + "/statuses/" + this.id;

			html = "\
				<div class='tweet' style='clear:left; display:none' id='tweetid-"+this.id+"'> \
					<div><div id='reply-to-tweetid-"+this.id+"'></div></div> \
					<div> \
						<a  class='tweet-image fancybox' href='"+user_link+"' class='timestamp' target='_blank'> \
							<img src='" + this.from_profile_image_url + "' height='60' width='60'> \
						</a> \
					</div> \
					<div class='tweet-body'> \
						<p class='tweet-tweet'><a href='"+user_link+"' class='tweet-author' target='_blank'>"+this.from_screen_name+"</a>: <span class='tweet-text'>" + this.wrap() +"</span></p> \
						<div class='tweet-footer'><a href='" + external_url + "' title='" + (this.date_created) + "' class='timestamp' target='_blank'>"+relative_time(this.date_created)+"</a> " + ((this.source != '') ? "from "+ this.source : "");

							if (this.in_reply_to_screen_name)
							{
								html += " | in reply to <a href='http://www.twitter.com/"+ this.in_reply_to_screen_name+"/status/"+this.in_reply_to_status_id+"' target='_blank'>"+ this.in_reply_to_screen_name+"</a>";
							}   

							html += " | <span class='pseudolink' title='Reply to this tweet' onclick='compose_new_tweet(\"@"+this.from_screen_name+" \", "+this.id+")'>Reply</span> | \
									<span class='pseudolink' title='Direct message this user' onclick='compose_new_tweet(\"d "+this.from_screen_name+" \")'>Direct</span> | ";

							if   (this.favorited )	html += "<span class='pseudolink' title='Unfavorite this tweet' onclick='favoriteHandler(\""+this.id+"\", \"destroy\")'>Unfavorite</span> | ";
							else					html += "<span class='pseudolink' title='Favorite this tweet' onclick='favoriteHandler(\""+this.id+"\", \"create\")'>Favorite</span> | ";

							html += "<span class='pseudolink' title='Retweet this tweet' onclick='retweetHandler(\""+this.id+"\")'>Retweet</span>";

					//html += "  | <span class='pseudolink' title='Via this tweet' onclick='retweet(\""+tweet.id+"\", true)'>Via</span> ";
					/*html += "| <span class='pseudolink chirper' title='Chirp this Tweet!  Will send it over to TopChirp.com which is kinda like Digg, but for Twitter!' onclick='topchirp_upchirp("+tweet.id+")'>Chirp it</span> \
							<span id='topchirp-box-"+tweet.id+"' style='display:none; background-color:white; position: relative; width:100px;height:50px; border:solid black; right:50px; top:38px; padding:20px;'>\
								Tags <input type='text' value='' id='topchirp-tags-"+tweet.id+"' />\
								<input type='button' value='Add' onclick='topchirp_save_tags("+tweet.id+")' />\
								<input type='button' value='Cancel' onclick='$(\"#topchirp-box-"+tweet.id+"\").hide()' />\
							</span>";
					*/
					html += " \
						</div> \
					</div> \
					<div class='clear-fix'></div> \
				</div> \
			";
			return html;                
		}
		
		this.wrap = function()
		{
			text = this.text;
			var params = get_querystring_object();
			if (params.query)
			{
				//params.query = params.query.replace(/"/g, "");
				//text = text.replace( new RegExp("("+params.query+")", "gi"),'<span style="background-color:yellow; font-weight:bold;">$1<\/span>');	
				//return text;
			}
			text = text.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi,'<a href="$1" target="_blank">$1<\/a>');
			text = text.replace(/@([a-zA-Z0-9_]+)/gi,'<a class="query" href="http://www.twitter.com/$1" target="_blank">@$1<\/a>');
			text = text.replace(/#([a-zA-Z0-9_]+)/gi,'<a class="query" href="#query=#$1">#$1<\/a>');
			//text = text.replace(/http:\/\/twitpic.com\/([a-z0-9]{5})/gi,'<a href="http://www.twitpic.com/$1" target="_blank"><img src="http://twitpic.com/show/large/$1" height="200" /></a>');
			//text = text.replace(/youtube/gi,'<object width="425" height="344"><param name="movie" value="http://www.youtube.com/v/D7ffQMer544&hl=en&fs=1&"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/D7ffQMer544&hl=en&fs=1&" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="425" height="344"></embed></object>');
			//text = text.replace(/<a[^>]+>(http:\/\/tinyurl.com\/[^<]+)<\/a>/g,'<a href="$1" target="_blank" onmouseover="decode_tinyurl(\'$1\')">$1<\/a>');
			//text = text.replace(/<a[^>]+>([http:\/\/]*[a-zA-Z0-9_\.]*youtube.com\/watch\?v=([^<]+))<\/a>/g,'<a class="{frameWidth: 425, frameHeight: 355}" href="http://ddev.tweenky.com/youtube.php?key=$2" onmouseover="log(\'$2\')">$1<\/a>');

			return text;
		}
		
		this.favorite = function(action)
		{
			
			proxy({
				type    : "POST",
				url     : "http://www.twitter.com/favorites/"+action+"/"+this.id+".json",
				dataType:"json",
				success : function(response){

				}
			});
		}
	}