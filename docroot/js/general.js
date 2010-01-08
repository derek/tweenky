"use strict";

// Create some globals

	var current_refresh;
	var _last_hash;
	var hash;
	var overlay;
	var loading_timeout;
	var search_t = {};
	var search_numbers = [];
	try { console.log(''); } catch(e) { console = { log: function() {}}; }





// Here's some of the behind the scenes stuff



	function check_state()
	{
		if (window.location.hash !== _last_hash)
		{
			_last_hash = window.location.hash;
			new_state();
		}
		else if (window.location.hash === "")
		{
			window.location.hash = "timeline=friends";
		}
	
		// Nothing changed
		return true;
	}

	function new_state()
	{
		// Repopulate the global hash object
		hash = get_querystring_object();
		
		if (current_refresh)
			clearTimeout(current_refresh);
		
		if (hash.timeline)
		{
			$(".group-list:visible").slideUp(); // Since we aren't viewing a group anymore
			$("#save-query").hide();
		
			get_timeline("timeline", hash.timeline, true);
		}
		if (hash.list)
		{
			get_list_content(hash.list);
			//$(".group-list:visible").slideUp(); // Since we aren't viewing a group anymore
			$("#save-query").hide();
		
			get_timeline("list", hash.list, true);
		}
		else if (hash.query || hash.trend)
		{
			var q = hash.query || hash.trend;
			$("#save-query").show();
			$("#saved-searches li a").each(function(){
				if($(this).html() === q)
				{	
					$("#save-query").hide();
				}
			});
			get_search(q, true, false, hash.trend ? true : false);
		}
		else if (hash.group)
		{
			$("#save-query").hide();
			get_search(hash.group, true, true);
		}
		else if (hash.logout)
		{
			var d = new Date();
		    document.cookie = "PHPSESSID=0;path=/;expires=" + d.toGMTString() + ";" + ";";
			window.location.href = "/oauth.php?logout";
		}
	}
	
	function get_querystring_object()
	{
		var queryString = {};
		var parameters  = window.location.hash.substring(1).split('&');
		var pos;
		var paramname;
		var paramval;
		
		for (var i in parameters) 
		{
			pos = parameters[i].indexOf('=');
			if (pos > 0)
			{
				paramname = parameters[i].substring(0,pos);
				paramval  = parameters[i].substring(pos+1);
				queryString[paramname] = unescape(paramval.replace(/\+/g,' '));
			}
			else
			{
				queryString[parameters[i]] = "";
			}
		}
		return queryString;
	}


	function cleanup()
	{
		while($(".tweet:visible").length > 200)
		{
			$(".tweet:visible:last").slideUp().remove();
		}				
	}


	function proxy(opt)
	{
		$.ajax({
			url: 		"/proxy.php?original_url=" + opt.url,
			type: 		opt.type,
			dataType: 	opt.dataType,
			data: 		opt.data || {},
			success: 	opt.success,
			error: 		opt.error || function(XHR, textStatus, errorThrown){
				throw(errorThrown);
			}, 
			complete: 	opt.complete || function(XHR, textStatus){
				// This is called after success or error.  Nothing really to do, for now.
			}, 
		});				
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
	}



	function recalculate_timestamps()
	{
		$(".timestamp").each(function(){
			$(this).html(relative_time($(this).attr('title')));
		});
	}











function get_list_content(uri)
{
	console.log(uri);
	if ($('#group-list-' + uri + ' li').length > 0)
	{
		toggle_group(uri);
	}
	else
	{
		$('#group-list-' + uri).html("<div align='center'><br /><br /><br /><img src='/image/ajaxsm.gif'></div>");
		proxy({
			url: "http://www.twitter.com/" + user_id + "" + uri + "/members.json",
			dataType: "json", 
			success: function(response){
				var html = '';
				for (var j in response.users)
				{
					screen_name = response.users[j].screen_name;
					html += '<li><a href="#query=from:' + screen_name + '">' + screen_name + '</a></li>';
				}	
				slug = this.url.replace("/proxy.php?original_url=http://www.twitter.com/" + user_id + "" + uri + "/", "").replace("/members.json", "");
				$('#group-list-' + uri).html(html);
				toggle_group(slug);
			}
		});		
	}
}



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
	lists = [];
	
	proxy({
		url: "http://api.twitter.com/1/" + user_id + "/lists.json",
		dataType: "json", 
		success: function(response){
			
			for (i in response.lists)	
				lists[lists.length] =response.lists[i];
			
			proxy({
				url: "http://api.twitter.com/1/" + user_id + "/lists/subscriptions.json",
				dataType: "json", 
				success: function(response){
					for (i in response.lists)	
						lists[lists.length] =response.lists[i];
					display_lists(lists);
				}
			});
		}
	});
}

function display_lists(lists)
{
	$('#twitter-lists .inner').empty();
	//lists = sortObject(lists);
	//console.log(lists);
	if (lists.length > 0)
	{
		for (var i in lists)
		{
			list = lists[i];
			html  =  '<div><a href="#list=' + list.uri + '">' + list.name + '</a></div>';
			html  += '<ul id="group-list-' + list.uri + '" class="group-list"></ul>';
			
			$('#twitter-lists .inner').append(html);
		}
	}
	else
	{
		$('#twitter-lists .inner').append("<div style='font-style:italic;color:#999999;'>None</div><ul></ul>");
	}	
}


function load_queries()
{
	proxy({
		url: "http://derekgathright.com/tweetgroups.xml",
		dataType: "xml", 
		success: function(xml){
			var html;
			var query;
			
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
			var search;
			if (response.length > 0)
			{
				$("#saved-searches .inner").empty();
				for (var i in response)
				{
					search = response[i];
					$("#saved-searches .inner").append('<a href="#query=' + search.query + '"><div>'+ search.name +'</div></a>');
				}
			}
			else
			{
				$("#saved-searches .inner").html("<div style='font-style:italic;color:#999999;'>None</div>");
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
			var q;
			//console.log("Trends reset");
			
			/*$("#trends ol li a").each(function(i){
				for (j in response.trends)
				{
					if (response.trends[j].name === $(this).html())
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
			for (var i in response.trends)
			{
				q = response.trends[i].url.substr( response.trends[i].url.lastIndexOf("=") + 1, response.trends[i].url.length);
				q = q.replace('"', "%22").replace(' ', "+"); 
				
				$("#twitter-trends .inner").append('<a href="#trend='+q+'"><div>'+ response.trends[i].name +'</div></a>');
			}
		}
	});
	/*
	proxy({
		url: "http://www.google.com/trends/hottrends/atom/hourly",
		dataType: "text", 
		success: function(response){
			var regex = new RegExp('<a href="(.*)">(.*)</a></span></li>', "g");
			var google_trends = [];
			var match;
			
			while(match = regex.exec(response))
			{	
				google_trends[google_trends.length] = match[2];
			}
			
			$("#google-trends").empty().html("<ol></ol>");
			
			for (var i in google_trends)
			{
				if (i < 20)
				{
					$("#google-trends ol").append('<li><a href="#query=%22' + google_trends[i] + '%22 -trend">'+ google_trends[i] +'</a></li>');
				}
			}
		}
	});*/
}



function get_timeline(type, timeline, new_search)
{
	var url;
	var type;
	var id;
	var since_id = 1;
	
	// Show the loading message
	loading_show();
	
	// Figure out what timeline to pull
	if (type === "timeline")
	{
		switch(timeline)
		{
			case "friends":
				url = 'http://www.twitter.com/statuses/friends_timeline.json';
				http_method = "GET";
				break;

			case "replies":
				url = 'http://www.twitter.com/statuses/replies.json';
				http_method = "GET";
				break;

			case "archive":
				url = 'http://www.twitter.com/statuses/user_timeline.json';
				http_method = "GET";
				break;

			case "public":
				url = 'http://www.twitter.com/statuses/public_timeline.json';
				http_method = "GET";
				break;

			case "favorites":
				url = 'http://www.twitter.com/favorites.json';
				http_method = "GET";
				break;

			case "dmin":
				url = 'http://www.twitter.com/direct_messages.json';
				http_method = "GET";
				break;
			
			case "dmout":
				url = 'http://www.twitter.com/direct_messages/sent.json';
				http_method = "GET";
				break;
			
			default:
				throw("Unknown Timeline");
				break;
		}
	}
	else if (type === "list")
	{
		e = timeline.split("/");
		url = 'http://api.twitter.com/1/' + e[1] + '/lists/' + e[2] + '/statuses.json';
		//url = 'http://api.twitter.com/lists/' + timeline + '/statuses.json';
		http_method = "GET";
	}
	
	// Set the timer to refresh this timeline
	current_refresh = setTimeout('get_timeline("'+type+'", "'+timeline+'", false)', 60000);
	
	if (new_search)
	{
		$("#tweets").fadeOut(300, function(){
			$(this).show().html("<div align='center'><br /><br /><br /><img src='/image/ajaxsm.gif'></div>");
		});
		$("#search_query").val('');
	}
	else
	{
		$(".tweet").each(function(i, t){
			id = $(t).attr('id').replace("tweetid-", "");
			if (id > since_id)
			{
				since_id = id;
			}
		});
	}
	
	proxy({
		dataType: "json",
		type    : http_method,
		url     : url,
		data    : {
			"count" : 20,
			"since_id" : since_id
		},
		success : function(tweets, textStatus)
		{
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
					if (tweets.length > 0)
						$("#tweets").prepend("<fieldset class='updateTimstamp'><legend align='right'>"+tweets.length + ' new tweets at '+get_time()+'</legend></fieldset>');
				}
				else
				{
					$("#tweets").empty();
				}

				$.each(tweets, function(i, tweet) {
					var values; 
					values = tweet.created_at.split(" ");
					tweet.created_at = Date.parse( values[1] + " " + values[2] + ", " + values[5] + " " + values[3]);

					/*
					if ($(tweet.source).html() !== null)
					{
						tweet.source = "<a href='"+$(tweet.source).attr("href")+"' target='_blank'>"+$(tweet.source).html()+"</a>";
					}
					*/

					if ($("#tweetid-"+tweet.id).length === 0)
					{
						var tw = new Tweet(tweet.id);
						if (hash.timeline === "dmin")
						{
							tweet.user = tweet.sender;
							tweet.source = '';
						}

						if (hash.timeline === "dmout")
						{
							tweet.user = tweet.sender;
							tweet.source = '';

							tweet.in_reply_to_user_id = tweet.recipient.id; 
							tweet.in_reply_to_screen_name = tweet.recipient.screen_name;
							tweet.in_reply_to_status_id	= 0;
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


function get_time()
{
	var am_pm;
	
	var curr_hour;
	var curr_min;
	var curr_sec;
	
	curr_hour = new Date().getHours();
	curr_min  = new Date().getMinutes();
	curr_sec  = new Date().getSeconds();

	am_pm 		= curr_hour < 12  	? "AM" : "PM";
	curr_hour 	= am_pm === "PM" 	? curr_hour - 12 : curr_hour;
	curr_min	= curr_min < 10   	? "0" + curr_min.toString() : curr_min;
	curr_sec	= curr_sec < 10		? "0" + curr_sec.toString() : curr_sec;

	return curr_hour + ":" + curr_min + ":" + curr_sec + " " + am_pm;
}

function get_search(query, new_search, group_search, trend)
{	
	var since_id = 0;
	var queries = [];
	var users;
	var queries_run;
	var search_url;
	
	// Reset these values
	search_numbers = [];
	search_t = {};
	
	current_refresh = setTimeout('get_search("'+addslashes(query)+'", false)', 20000);
	
	if (!new_search)
	{
		$(".tweet").each(function(i, t){
			var id;
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
		$("#tweets").fadeOut(300, function(){
			$(this).show().html("<div align='center'><br /><br /><br /><img src='/image/ajaxsm.gif'></div>");
		});
		
		if (group_search)
		{
			$("#search_query").val('');
		}
		else
		{
			$("#search_query").val(query);
		}
	}
	
	if (trend)
	{
		proxy({
			type    : "GET",
			url     : "http://whatthetrend.com/api/trend/getByName/" + query + "/json",
			data    : {},
			dataType: "json",
			success : function(data){
				if (data.api.trend.blurb.text)
				{
					$("#whatthetrend #trend-text").html(data.api.trend.blurb.text);
					$("#whatthetrend").show();
				}
			}
		});
	}
	
	if (group_search)
	{
		users = query.split(",");

		var i = 0;
		for (var n in users)
		{
			if ((queries[i] + "from:" + users[n] + " OR ").length > 140)
			{	
				i = i + 1;
			}
			if (queries[i])
			{	
				queries[i] += " OR ";
			}
			else
			{	
				queries[i] = "";
			}
			
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
		{
			search_url += "&since_id="+since_id;
		}
		loading_show();
		
		$.getJSON(search_url,
	        function(response){
				queries_run = queries_run + 1;
				if(response.results){
					for (var i=0; i < response.results.length; i+=1)
					{
						search_numbers[search_numbers.length] = response.results[i].id;
						search_t[response.results[i].id] = response.results[i];
					}
						if (queries_run === queries.length)
						{	
							display_search_tweets(new_search);
						}
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
	var html;
	var tweet;
	var values;
	var tw;
	var tweets;
	
	loading_hide();
	
	if (new_search)
	{
		$("#tweets").empty();
		//$("#content").prepend(" <span style='float:right; padding-left:10px;'>"+response.results.length + ' tweets at '+get_time()+'</span> <hr />');
	}
	else    
	{   
		//$("#tweets").prepend("<fieldset style='border-top:solid 1px #999999;'><legend align='right' style='color:#999999; padding-left:5px;' >new tweets at "+get_time()+"</legend> </fieldset>");
	}
	
	search_numbers.sort();
	tweets = search_t;

	for (var i in search_numbers) {
		tweet = tweets[search_numbers[i]];
		
		values = tweet.created_at.split(" ");
		tweet.created_at = Date.parse(values[2] + " " + values[1] + ", " + values[3] + " " + values[4]);
		
		if ($("#tweetid-"+tweet.id).length === 0)
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











function addslashes( str ) {
    return (str+'').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
}

function decode_tinyurl()
{
	
}




function toggle_group(slug)
{
	if ($('#group-list-'+slug+':visible').length < 1)
	{
		$(".group-list").slideUp();
		$('#group-list-'+slug).slideDown();
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

function service_tinyurl()
{
	var orig_url = $("#url-to-tiny").val();
	
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
	var orig_url = $("#url-to-trim").val();
	
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
	var orig_url = $("#url-to-bitly").val();

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
	var orig_url = $("#url-to-waly").val();
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
			var media_url;
			$(xml).find('mediaurl').each(function(){
				media_url = $(this).text();
			});
			
			$("#status").val($("#status").val() + media_url);
			$("#twitpic-info").slideUp();
		}
	}); 
	
    return false; 
}

function isURL(s)
{
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
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
	loading_timeout = setTimeout(loading_error, 5000);
	
}

function loading_hide()
{
	$("#loading").fadeOut();
	clearTimeout(loading_timeout);
}

function loading_error()
{
	$("#loading").html("Still loading...");
	setTimeout(loading_unable, 15000);
}

function loading_unable()
{
	$("#loading").append(" Try <span class='pseudolink' onclick='window.location.reload()'>refreshing</span>");
}



function retweetHandler(id, via)
{
	proxy({
		type    : "GET",
		url     : "http://www.twitter.com/statuses/show/"+id+".json",
		dataType:"json",
		success : function(response){
			if (via)
			{
				compose_new_tweet(response.text + " (via @"+response.user.screen_name+")");
			}
			else
			{	
				compose_new_tweet("RT @"+response.user.screen_name+": "+response.text);
			}
		}
	});
}

function show_hidden_tweets()
{
	var distance_from_top = getScrollOffset()[1];
	//console.log(distance_from_top);
	if ($(".tweet:hidden").length > 0 && distance_from_top < 150)
	{
		$(".tweet:hidden:last").slideDown();
	}
}

function getScrollOffset() {
	return [ 
		window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
		window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
	];
}

function decodeBitly(url)
{
	proxy({
		type    : "GET",
		url     : "http://api.longurl.org/v2/expand?format=json&url=" + url + "",
		dataType:"json",
		success : function(response){
			var longURL = response["long-url"];
			$("a[href=" + url + "]").fadeOut(function(){
				$(this).html(longURL).attr("href", longURL).fadeIn();
			});
		}
	});
	
}

function oc(a)
{
	var o = {};
	for(var i=0;i<a.length;i++)
	{
		o[a[i]]='';
	}
	return o;
}

// This function creates a new anchor element and uses location
// properties (inherent) to get the desired URL data. Some String
// operations are used (to normalize results across browsers).
 
function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
    };
}





$(document).ready(function() {
	
	setTimeout(load_tweetgroups, 750);
	setTimeout(load_saved_searches, 1000);
	setTimeout(reset_trends, 2000);
	
	setInterval(check_state, 50);
	setInterval(recalculate_timestamps, 60000 );
	setInterval(show_hidden_tweets, 700);
	setInterval(cleanup, 6000);
	setInterval(reset_trends, 60000);
	
	$("#navigation a div").live("click", function(){
		$("#navigation .selected").removeClass("selected");
		$(this).addClass("selected");
	});
		
	$(".favoriteLink").live("click", function(){
		var id = $(this).parents(".tweet").get(0).id.replace("tweetid-", "");
		var tweet = new Tweet(id);
		tweet.favoriteToggle();
	});
	
	$(".retweetLink").live("click", function(){
		var id = $(this).parents(".tweet").get(0).id.replace("tweetid-", "");
		retweetHandler(id, false);
	});
	
	$(".viaLink").live("click", function(){
		var id = $(this).parents(".tweet").get(0).id.replace("tweetid-", "");
		retweetHandler(id, true);
	});
	
	$(".replyLink").live("click", function(){
		var id = $(this).parents(".tweet").get(0).id.replace("tweetid-", "");
		var username = $("#tweetid-" + id + " .tweet-author").html();
		compose_new_tweet("@" + username, id);
	});
		
	$(".dmLink").live("click", function(){
		var id = $(this).parents(".tweet").get(0).id.replace("tweetid-", "");
		var username = $("#tweetid-" + id + " .tweet-author").html();
		compose_new_tweet("d " + username);
	});
	
	$(".tweet a").live("mouseover", function(){
		url = $(this).attr("href");
		if(parseURL(url).host in oc(['bit.ly', 'is.gd', 'tinyurl.com', 'ff.im', 'tr.im']) ) {
			decodeBitly(url);
		}
	});
	
});
