function App_Summize(settings)
{
	this.settings 			= settings;
	this.tweets				= [];
	this.since_id			= [];

	this.init = function()
	{
		this.display_menu();
	}

	this.new_state = function(params)
	{
		query = params.query;
	
		this.tweets[query] 		= [];
		this.since_id[query] 	= [];
		
		this.query(query);
		_tweet_refresh = setInterval('_applications["'+this.settings.application_key+'"].query("'+query+'")', 10000);
	}
	
	this.query = function(query)
	{
		
		search_url 	= "http://search.twitter.com/search.json?q="+query+"&since_id="+this.since_id[query];
		
		$.post(
			"/proxy.php", 
			{
				"url"	: search_url,
				"ak"	: this.settings.application_key
			}, 
			function(call){
				tweets = call.response.results;
				tweets.reverse();
				$.each(tweets, function(i, tweet) {
					tweet.unread 		= 'unread';
					if (tweet.id > _applications[call.params.ak].since_id[query])
					{
						_applications[call.params.ak].tweets[query]["tweetid-"+tweet.id] = tweet;
					}
					
					_applications[call.params.ak].since_id[query] = tweet.id;
					
				});
				
				_applications[call.params.ak].display_query(query);
			},
			"json"
		);
	}

	this.get_settings_menu = function()
	{
		html = '';
		html += '<h4>Search</h4>';
		html += '<div class="innertube">';
			html += '<div align="center">';
				//html += '<input type="button" onclick="_applications[\''+this.settings.application_key+'\'].save_settings()" value="Save Settings" /> <span class="small pseudolink" onclick="application_remove(\''+this.settings.application_key+'\')">Remove</span>';
				html += '<span class="small pseudolink" onclick="application_remove(\''+this.settings.application_key+'\')">Remove</span>';
			html += '</div>';
		html += '</div>';

		return html;
	}
	
	this.trigger_query = function()
	{
		query = $('#app-'+this.settings.application_key+'-query').val();
		window.location.hash = '#ak='+this.settings.application_key+'&query='+query;
	}

	this.display_menu = function()
	{
		html = '';
		html += '<div class="rounded section">';
		html += 	'<div class="title down-arrow">'+this.settings.data.title+'</div>';
		html += 	'<div class="innertube">';
		
			html += 	'<form id="search_form" onsubmit="return false;">';
				html += 	'<input type="text" id="app-'+this.settings.application_key+'-query" class="current_query" style="width:140px;" /><input type="submit" value="Find" onclick="_applications[\''+this.settings.application_key+'\'].trigger_query();"/><br />';
			html += 	'</form>';
		html += 	'</div>';
		html += '</div>';

		$("#leftcolumn").append(html);
	}
	
	this.display_query = function(query)
	{
		html = '<div style="float:left">'+this.settings.data.title + '/' + query + '</div><div style="float:right"><input type="button" onclick="_applications[\''+this.settings.application_key+'\'].tweets_mark_as_read(\''+query+'\')" value="Mark all Read"></div><div style="clear:both"></div>';
		$("#query-detail .header").html(html);
		a = 0;
		for(i in this.tweets[query])
		{
			tweet = this.tweets[query][i];
			if($('#tweetid-'+tweet.id).length < 1)
			{
				html = this.tweet_to_html(tweet);
				$('#tweet-list').prepend(html);
			}
			a = 1;			
		}

		if (a)
			$("#loading").hide();
	}
	
	this.tweets_mark_as_read = function(query)
	{
		that = this;
		$("#app_"+this.settings.application_key+"_count_"+query).hide();
		$("#app_"+this.settings.application_key+"_count_"+query+" span").html("0");
		$('.tweet-unread').each(function(i){
			$(this).removeClass('tweet-unread');
			that.tweets[query][$(this).attr('id')].unread = 0;
		});
	}	
	this.tweet_to_html = function(item)
	{
		//internal_link = "#view=tweets&service="+item.service+"&timeline=archive&username="+item.username;
		internal_link = "#view=tweets&service_id="+item.service_id+"&query=from:"+item.from_user;
		html = '';

		html += "<div class='tweet-"+item.unread+" tweet' style='clear:left;' id='tweetid-"+item.id+"'>";
		html += 	"<div class='tweet-image'>";
		html +=			"<a href='"+internal_link+"'>";
		html += 			"<img src='" + item.profile_image_url + "' height='50' width='50'>";
		html += 		"</a>";
		html +=		"</div>";
		html +=		"<div class='tweet-body'>";
		html += 		"<p class='tweet-text' style='display:none;'>"+item.text+"</p>";
		html += 		"<p class='tweet-tweet'><a href='"+internal_link+"' class='tweet-author'>"+item.from_user+"</a>: <span class='tweet-text'>" + (item.text) +"</span></p>";
		html += 		"<div class='tweet-footer'>" + item.from_user + " said <a href='" + "' target='_blank' title='" + (item.created_at) + "' class='timestamp'>"+(item.created_at)+"</a> on "+ this.settings.data.title + " ";
		html += 			" | <a onclick='create_status(\"@"+item.to_user+" \", \""+item.service_id+"\", "+item.to_user+");'>Reply</a> | ";
		html += 			"<a onclick='create_status(\"d "+item.to_user+" \", \""+item.service_id+" \")'>Direct</a> | ";
		html += 			"<a onclick='retweet(\""+item.id+"\")'>Retweet</a> | ";
		html += 			"Translate (<a onclick='translate(\""+item.id+"\", \"en\")'>en</a>) (<a onclick='translate(\""+item.id+"\", \"es\")'>es</a>)";
		html += 		"</div>";
		html += 	"</div>";
		html += 	"<div class='clear-fix'></div>";
		html += "</div>";

		return html;
	}
	
	
	/*
	tweet_to_html: function(item)
	{
		//internal_link = "#view=tweets&service="+item.service+"&timeline=archive&username="+item.username;
		internal_link = "#view=tweets&service_id="+item.service_id+"&query=from:"+item.from_user;
		html = '';

		html += "<div class='newest-tweet hidden tweet' style='clear:left;' id='tweetid-"+item.id+"'>";
		html += 	"<div class='tweet-image'>";
		html +=			"<a href='"+internal_link+"'>";
		html += 			"<img src='" + item.profile_image_url + "' height='50' width='50'>";
		html += 		"</a>";
		html +=		"</div>";
		html +=		"<div class='tweet-body'>";
		html += 		"<p class='tweet-text' style='display:none;'>"+item.text+"</p>";
		html += 		"<p class='tweet-tweet'><a href='"+internal_link+"' class='tweet-author'>"+item.from_user+"</a>: <span class='tweet-text'>" + (item.text) +"</span></p>";
		html += 		"<div class='tweet-footer'>" + item.from_user + " said <a href='" + "' target='_blank' title='" + (item.created_at) + "' class='timestamp'>"+(item.created_at)+"</a> on "+ item.service + " ";
		if (item.posting_app != null)
			html +=	"from " + item.source;
		//else if ( item.service_id == "2")
		//	html += " at <a href='http://search.twitter.com/' target='_blank'>search.twitter.com</a>";
		html += 			" | <a onclick='create_status(\"@"+item.to_user+" \", \""+item.service_id+"\", "+item.to_user+");'>Reply</a> | ";
		html += 			"<a onclick='create_status(\"d "+item.to_user+" \", \""+item.service_id+" \")'>Direct</a> | ";
		html += 			"<a onclick='retweet(\""+item.id+"\")'>Retweet</a> | ";
		html += 			"Translate (<a onclick='translate(\""+item.id+"\", \"en\")'>en</a>) (<a onclick='translate(\""+item.id+"\", \"es\")'>es</a>)";
		html += 		"</div>";
		html += 	"</div>";
		html += 	"<div class='clear-fix'></div>";
		html += "</div>";

		return html;
	}, 
	query: function(query)
	{
		service_id = 1;
		switch(service_id)
		{
			case 1:
				search_url 	= "http://search.twitter.com/search.json?q="+query;
				service_id = 1;
				service 	= "twitter";
				break;

			case 2:
				break;
		}

		url = "/proxy.php?&count=100&url="+search_url;

		$.getJSON(url, null, function(data){
			tweets = data.results;
			tweets.reverse();
			$.each(tweets, function(i, tweet) {

				tweet.service_id 	= service_id;
				tweet.service 		= service;
				if($('#tweetid-'+tweet.id).length < 1)
				{
					html = App_Search.tweet_to_html(tweet);
					$('#tweet-list').prepend(html);
				}
			});

			$("#tweet-list div").each(function(){
				$(this).slideDown('slow');
			});
		});
	}
	*/
}