
function App_Twitter_API(application_data)
{
	Tweenky.applications[application_data.application_key] = this;
	
	this.application_id		= application_data.application_id;
	this.application_key	= application_data.application_key;
	this.settings			= application_data.settings;
	this.allows_posting		= "true";
	this.tweets				= {};
	this.since_id			= {};
	that 					= this; // An alias
	
	this.install = function()
	{
		if(!this.settings)
			this.settings = {};
		
		
		switch(this.application_id)
		{
			case 1:
				if (!this.settings.title)
					this.settings.title = "Twitter";
					
				if (!this.settings.api_url)
					this.settings.api_url = "http://twitter.com";
					
				if (!this.settings.username)
					this.settings.username = "";
					
				if (!this.settings.password)
					this.settings.password = "";
				break;
			
			case 2:
				if (!this.settings.title)
					this.settings.title = "Identi.ca";

				if (!this.settings.api_url)
					this.settings.api_url = "http://identi.ca/api";

				if (!this.settings.username)
					this.settings.username = "";

				if (!this.settings.password)
					this.settings.password = "";
				break;
		}
		
		this.display_menu();
		
		setInterval('Tweenky.applications["'+this.application_key+'"].get_tweets("friends")', 60000); // 1 minute
		setInterval('Tweenky.applications["'+this.application_key+'"].get_tweets("replies")', 360000); // 6 minutes
		setInterval('Tweenky.applications["'+this.application_key+'"].reset_trends()', 600000); //10 minutes
		
		return true;
	}
	
	this.uninstall = function()
	{
		delete(Tweenky.applications[this.application_key]);
		$('#nav-'+this.application_key).remove();
		Tweenky.applications.save();
	}
	
	this.restart = function()
	{
		if (1)
		{
			this.get_tweets("friends");
			this.get_tweets("replies");
		}
	}
	
	this.new_state = function(params)
	{
		if (params.timeline)
		{
			switch(params.timeline)
			{
				case "public":
				case "direct":
				case "archive":
					this.get_tweets(params.timeline);
					break;
				
				case "replies":
				case "friends":
					this.display(params.timeline);
					break;
			}
			
			//document.title = "Tweenky: " + params.timeline + "(" + $('#app_'+this.application_key+'_count_'+params.timeline+' span').html() + ")";
		}
		else if (params.query)
		{
			this.tweets['search-'+params.query] 	= [];
			this.since_id['search-'+params.query] 	= [];
			this.search_query(params.query);
		}
	}
	
	this.get_settings_menu = function()
	{
		html = '';
		html += '<h4>'+this.settings.title+' <span class="small pseudolink" onclick="application_remove(\''+this.application_key+'\')">remove</span></h4>';
		html += '<div class="innertube">';
			html += '<ul>';
				html += '<li>';
					html += '<div style="width:130px;float:left;">Title:</div>';
					html += '<input type="text" id="settings-'+this.application_key+'-title" value="'+this.settings.title+'" /><br>';
				html += '</li>';
				if (this.application_id == 2)
				{
					html += '<li>';
						html += '<div style="width:130px;float:left;">API URL:</div>';
						html += '<input type="text" id="settings-'+this.application_key+'-api_url" value="'+this.settings.api_url+'" /><br>';
					html += '</li>';
				}	
				else
				{
					html += '<input type="hidden" id="settings-'+this.application_key+'-api_url" value="'+this.settings.api_url+'" />';
				}
				html += '<li>';
					html += '<div style="width:130px;float:left;">Username:</div>';
					html += '<input type="text" id="settings-'+this.application_key+'-username" value="'+this.settings.username+'" /><br>';
				html += '</li>';
				html += '<li>';
					html += '<div style="width:130px;float:left;">Password:</div>';
					html += '<input type="password" id="settings-'+this.application_key+'-password" value="'+this.settings.password+'"  /><br>';
				html += '</li>';
			html += '</ul>';
		html += '</div>';
		return html;
	}
	
	this.display_menu = function()
	{
		html = '\
			<div class="rounded section" id="nav-'+this.application_key+'"> \
				<div class="title down-arrow">'+this.settings.title+'</div> \
				<div class="innertube"> \
					<ol> \
						<li><a class="query" href="#ak='+this.application_key+'&timeline=friends">Friends <span style="display:none;" class="small" id="app_'+this.application_key+'_count_friends">(<span>0</span>)</span></a></li> \
						<li><a class="query" href="#ak='+this.application_key+'&timeline=replies">Replies <span style="display:none;" class="small" id="app_'+this.application_key+'_count_replies">(<span>0</span>)</span></a></li> \
						<li><a class="query" href="#ak='+this.application_key+'&timeline=archive">Archive</a></li> \
						<li><a class="query" href="#ak='+this.application_key+'&timeline=public">Public</a></li> \
					</ol>\
		';
		
		if (this.application_id == 1)
		{
			html +=	'\
					<br /> \
					<span class="small bold">Search</span> \
					<ol> \
						<li> \
							<form id="search_form" onsubmit="return false;"> \
								<input type="text" id="app-'+this.application_key+'-query" value="" onfocus="" class="current_query" style="width:115px;;" /> \
								<input type="submit" value="Search" onclick="Tweenky.applications[\''+this.application_key+'\'].search_trigger_query();"/> \
							</form> \
						</li> \
					</ol> \
					<br /> \
					<span class="small bold">Trending Topics</span> \
					<ol id="app-'+this.application_key+'-trends"></ol> \
			';
			
		}
		
		html +=	'\
				</div> \
			</div> \
		';
		$("#leftcolumn").append(html);
		this.reset_trends();
		
		
	}
	
	this.reset_trends = function()
	{
		////console.log("Trends reset");
		$.post(
			"/proxy.php", 
			{
				"url"	: "http://search.twitter.com/trends.json",
				"ak"	: this.application_key
			}, 
			function(call){
				html = '';
				$('#app-'+Tweenky.applications[call.params.ak].application_key+'-trends').empty();
				for(i in call.response.trends)
				{
					html +=	'<li><a class="small query" href="#ak='+Tweenky.applications[call.params.ak].application_key+'&query='+escape(call.response.trends[i].name)+'">'+call.response.trends[i].name+'</a></li>';
				}
				$('#app-'+Tweenky.applications[call.params.ak].application_key+'-trends').html(html);
			},
			"json"
		);
	}
	
	
	this.tweet_to_html = function(item, level)
	{
		external_url = this.get_external_url(item.from_screen_name, item.id);
		//<div><img src='http://www.medicaredrugplans.com/img/reply_arrow.gif'><div id='reply-to-tweetid-"+item.id+"'></div></div> \
		
		internal_link = "#ak="+this.application_key+"&query=from:"+item.from_screen_name;
		
		if (level == 0)
		{
			tweet_style = 'padding:5px 0px 0px 20px;border-top:dashed 1px #999999;';
		}
		else
		{
			tweet_style = 'padding:0px 0px 0px 20px;';
		}
		
		html = "\
			<div class='tweet-"+item.unread+" tweet' style='clear:left; display:none' id='tweetid-"+item.id+"'> \
				<div style='"+tweet_style+"'><div id='reply-to-tweetid-"+item.id+"'></div></div> \
				<div> \
					<a href='"+internal_link+"'> \
						<img class='tweet-image' src='" + item.from_profile_image_url + "' height='50' width='50'> \
					</a> \
				</div> \
				<div class='tweet-body'> \
					<p class='tweet-text' style='display:none;'>"+item.text+"</p> \
					<p class='tweet-tweet'><a href='"+internal_link+"' class='tweet-author'>"+item.from_screen_name+"</a>: <span class='tweet-text'>" + this.tweet_wrap(item) +"</span></p> \
					<div class='tweet-footer'> \
						" + item.from_name + " said <a href='" + external_link + "' target='_blank' title='" + (item.created_at) + "' class='timestamp'>"+relative_time(item.created_at)+"</a> from "+ item.source +" on "+ this.settings.title + " \
						| <a onclick='create_status(\"@"+item.from_screen_name+" \", \""+item.service_id+"\", "+item.from_user_id+");'>Reply</a> | \
						<a onclick='create_status(\"d "+item.from_screen_name+" \", \""+item.service_id+" \")'>Direct</a> | \
						<a onclick='retweet(\""+item.id+"\")'>Retweet</a>\
						</div>\
					</div> \
				<div class='clear-fix'></div> \
			</div> \
		";
		
		if (item.in_reply_to_status_id > 0)
		{
			$.ajax({
				type	: "POST",
				url		: "/proxy.php",
				data	: {
					"url"	: 'http://twitter.com/status/show/'+item.in_reply_to_status_id+'.json',
					"ak"	: this.application_key,
				},
				dataType: "json",
				success	: function(call){
					if (call.response.error)
					{
						// This is likely because the status is protected 
					}
					else
					{
						reply = call.response;
						
						tweet 							= new Object();
						tweet.unread 					= 'unread';
						tweet.id 						= reply.id
						tweet.text 						= reply.text;
						tweet.from_user_id 				= reply.user.id;
						tweet.from_screen_name 			= reply.user.screen_name;
						tweet.from_name 				= reply.user.name;
						tweet.from_profile_image_url 	= reply.user.profile_image_url;
						tweet.to_user 					= '------';
						tweet.service 					= Tweenky.applications[call.params.ak].settings.title;
						tweet.source 					= reply.source;
						tweet.in_reply_to_status_id 	= reply.in_reply_to_status_id;
						tweet.in_reply_to_user_id 		= reply.in_reply_to_user_id;
						
					    values = reply.created_at.split(" ");
						tweet.created_at = Date.parse( values[1] + " " + values[2] + ", " + values[5] + " " + values[3]);
						
						html = Tweenky.applications[call.params.ak].show_tweet(tweet, $('#reply-to-tweetid-'+item.id), level+1);
					}
				}
			})
		}

		return html;
	}
	
	this.get_tweets = function(timeline)
	{
		if (this.tweets[timeline] == undefined)
			this.tweets[timeline] = {};
			
		if (this.since_id[timeline] == undefined)
			this.since_id[timeline] = 1;
			
		switch(timeline)
		{
			case "friends":
				var url = this.settings.api_url + '/statuses/friends_timeline.json';
				break;
			
			case "replies":
				var url = this.settings.api_url + '/statuses/replies.json';
				break;
				
			case "archive":
				var url = this.settings.api_url + '/statuses/user_timeline.json';
				break;
			
			case "public":
				var url = this.settings.api_url + '/statuses/public_timeline.json';
				break;
			
			case "direct":
				var url = this.settings.api_url + '/direct_messages.json';
				break;
		}


		$.ajax({
			type	: "POST",
			url		: "/proxy.php",
			data	: {
				"url"	: url,
				"ak"	: this.application_key,
				"count" : 20,
				"since_id" : this.since_id[timeline]
			},
			dataType: "json",
			success	: function(call){
				if (call.response.error)
					alert("[" + Tweenky.applications[call.params.ak].settings.title +"] " + call.response.error);
				
				if (call.response.reverse)
				{
					call.response.reverse();
					$.each(call.response, function(i, item) {

						if (item.id > Tweenky.applications[call.params.ak].since_id[timeline])
						{
							tweet 							= new Object();
							tweet.unread 					= 'unread';
							tweet.id 						= item.id
							tweet.text 						= item.text;
							tweet.from_user_id 				= item.user.id;
							tweet.from_screen_name 			= item.user.screen_name;
							tweet.from_name 				= item.user.name;
							tweet.from_profile_image_url 	= item.user.profile_image_url;
							tweet.to_user 					= '------';
							tweet.service 					= Tweenky.applications[call.params.ak].settings.title;
							tweet.source 					= item.source;
							tweet.in_reply_to_status_id 	= item.in_reply_to_status_id;
							tweet.in_reply_to_user_id 		= item.in_reply_to_user_id;
							
						    values = item.created_at.split(" ");
						
							tweet.created_at = Date.parse( values[1] + " " + values[2] + ", " + values[5] + " " + values[3]);


							$("#app_"+Tweenky.applications[call.params.ak].application_key+"_count_"+timeline).show();

							$("#app_"+call.params.ak+"_count_"+timeline+" span").html(parseInt($("#app_"+call.params.ak+"_count_"+timeline+" span").html()) + 1);

							if (i==call.response.length-1)
							{
								Tweenky.applications[call.params.ak].since_id[timeline] = tweet.id;
							}

							Tweenky.applications[call.params.ak].tweets[timeline]["tweetid-"+tweet.id] = tweet;

							if (window.location.hash == "#ak="+call.params.ak+"&timeline="+timeline)
							{

								Tweenky.applications[call.params.ak].display(timeline);
							}
						}
					});		
				}
		}});
	}
	
	this.show_tweet = function(tweet, parent, level)
	{
		if (parent == null)
			parent = $('#tweet-list');
		
		if (!level)
			level = 0;
			
		$("#maincontainer").show();
		parent.prepend(this.tweet_to_html(tweet, level));
		
		$("#tweetid-"+tweet.id).fadeIn();
		
		
		$('.tweet-image').tooltip({ 
		    delay: 0, 
		    showURL: false, 
		    opacity: 0,
		    fade: 250,
		    bodyHandler: function() {
		        return $("<img/>").attr('height', '300').attr("src", $(this).attr('src').replace(/_normal/, "").replace(/_bigger/, ""));
		    } 
		});
	}
	
	this.display = function(timeline)
	{
		$("#loading").hide();
		
		html = '\
			<div style="float:left">'+this.settings.title + ' // ' + timeline + '</div> \
			<div style="float:right"> \
				<input type="button" onclick="Tweenky.applications[\''+this.application_key+'\'].tweets_mark_as_read(\''+timeline+'\')" value="Mark as Read"> \
				<input type="button" onclick="Tweenky.applications[\''+this.application_key+'\'].tweets_clear(\''+timeline+'\')" value="Clear Read"> \
			</div> \
			<div style="clear:both"></div> \
		';
		$("#query-detail .header").html(html);
		//console.log($(this.tweets[timeline]).length);
		for(var i in this.tweets[timeline])
		{
			tweet = this.tweets[timeline][i];
		//	console.log(tweet.toSource());
			if (tweet)
			{
				if($('#tweetid-'+tweet.id).length < 1)
				{
					this.show_tweet(tweet);
				}
			}
		}
	}
	
	this.tweets_mark_as_read = function(timeline)
	{ 
		that = this;
		////console.log("Marking tweets as read for " + timeline);
		$("#app_"+this.application_key+"_count_"+timeline).hide();
		$("#app_"+this.application_key+"_count_"+timeline+" span").html("0");
		$('.tweet-unread').each(function(i){
			// Neccesary 'if' because some tweets are replies and not stored in a timeline
			if (that.tweets[timeline][$(this).attr('id')])
				that.tweets[timeline][$(this).attr('id')].unread = "read";
			$(this).addClass('tweet-read');
			$(this).removeClass('tweet-unread');
		});
	}
	
	this.tweets_clear = function(timeline)
	{
		////console.log("clearing tweets for " + timeline);
		$('.tweet-read').each(function(i){
			that.tweets[timeline][$(this).attr('id')] = null;
			$(this).remove();
		});
	}
	
	
	
	
	this.post_new_tweet = function(tweet)
	{
		var url = this.settings.api_url + '/statuses/update.json';
		$.post(
			"/proxy.php", 
			{
				"url"	: url,
				"ak"	: this.application_key,
				"status": tweet
			},
			function(call){
				$('#new-status').val('');
				$('#new-status-char-count').html('0');
				$('#update-status').jFade({
						property: 'background',
						start	: 'FFF8AF',
						end		: 'EAEFBD',
						steps	: 25,
						duration: 90
					});
				
				external_url = Tweenky.applications[call.params.ak].get_external_url(call.response.user.screen_name, call.response.id)
				
				html = "<div class='small tweet'>You posted to <b>"+Tweenky.applications[call.params.ak].settings.title+"</b>. <span style='font-style: italic;'>\""+call.response.text+"\"</span> (<a href='"+external_url+"' target='_blank'>#"+call.response.id+"</a>)</div>";
				$('#tweet-list').prepend(html);
				section_display_toggle('update-status', "slideUp");
			}, "json"
		);
	}
	
	this.get_external_url = function(username, tweet_id)
	{
	
		switch(this.application_id)
		{
			case 1:
				external_link = this.settings.api_url+"/"+username+"/statuses/" + tweet_id;
				break;

			case 2:
				external_link = this.settings.api_url.replace("api", "notice/"+tweet_id);
				break;
		}
		
		return external_link;
	}
	
	
	
	
	
	
	
	/* SEARCH */
	
	this.search_trigger_query = function()
	{
		query = $('#app-'+this.application_key+'-query').val();
		window.location.hash = '#ak='+this.application_key+'&query='+query;
	}
	
	this.search_query = function(query)
	{
		switch (this.application_id)
		{
			case 1:
				//search_url 	= "http://search.twitter.com/search.json";
				that = this;
				search_url 	= "http://search.twitter.com/search.json?q="+query.replace("#", "%23")+"&since_id="+this.since_id['search-'+query]+"&rpp=100&callback=?";
				console.log("Searching - " + search_url);
				$.getJSON(search_url,
				   function(call){
						tweets = call.results;
						tweets.reverse();
						$.each(tweets, function(i, item) {
							tweet 							= new Object();
							tweet.unread 					= 'unread';
							tweet.id 						= item.id
							tweet.text 						= item.text;
							tweet.from_user_id 				= item.from_user_id;
							tweet.from_screen_name			= item.from_user;
							tweet.from_name 				= item.from_user;
							tweet.from_profile_image_url 	= item.profile_image_url
							tweet.to_user 					= item.to_user;
							tweet.service 					= that.settings.title;
							
						    values = item.created_at.split(" ");
							tweet.created_at = Date.parse(values[2] + " " + values[1] + ", " + values[3] + " " + values[4]);
							timeline = 'search-'+query;

							$("#app_"+that.application_key+"_count_"+timeline).show();

							$("#app_"+that.application_key+"_count_"+timeline+" span").html(parseInt($("#app_"+that.application_key+"_count_"+timeline+" span").html()) + 1);

							if (i==call.results.length-1)
							{
								that.since_id[timeline] = tweet.id;
							}

							that.tweets[timeline]["tweetid-"+tweet.id] = tweet;

							if (window.location.hash == "#ak="+that.application_key+"&query="+query)
							{
								that.display(timeline);
							}
						});
				      }
				   );
				
				break;
				
				
				
				case 2:
					alert("Search not yet supported on Laconi.ca applications");
					break;
				
		}
	}
	
	/* HELPERS */
	
	this.tweet_wrap = function(tweet)
	{
		//This is wrapped around every tweet displayed to make it more user friendly
		text = this.reply_wrap(tweet); // wrap any @ replies to go to search the user
		text = this.link_wrap(text); // wrap the links

		return text;
	}

	this.reply_wrap = function(tweet) {
	    var userRegex = /@([a-zA-Z0-9_]+)/gi;
		var tweetText = tweet.text.replace(userRegex,'<a class="query" href="#ak='+this.application_key+'&query=from:$1">@$1</a>');

		return tweetText;
	}

	this.link_wrap = function(tweetText) {
		var urlRegex = /((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi;
		var tweetText = tweetText.replace(urlRegex,'<a href="$1" target="_blank">$1</a>');

		return tweetText;
	}
	
}