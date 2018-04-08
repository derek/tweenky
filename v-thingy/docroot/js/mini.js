_refresh_timer = null;
var Tweenky = {
	jquery_url : "http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js",
	load : function(callback){
		
		this.loader = {
			
			current_step : 0,
			load_next_step : function(){
				this.current_step++;
				switch(this.current_step)
				{
					case 1:
						document.write('<script src="', Tweenky.jquery_url, '" type="text/javascript"></script>');
						_jquery_check = setInterval("Tweenky.loader.check_jquery_loaded()", 500);
						break;

					case 2:
						callback();
						break;
				}
			},
			
			check_jquery_loaded: function()
			{
				if (typeof ( $ ) != "undefined")
				{
					clearInterval(_jquery_check);
					this.load_next_step();
				}
			}
		}
		Tweenky.loader.load_next_step();
	},
	
	searchold : function(query, service_id){
		this.current_query = query;
		$.post(
			"action.php",
			{"query" : query, "service_id" : service_id,  "a" : 11},
			function(response)
			{
				tweets = response.tweets;
				Tweenky.display_tweets(tweets, true);
		  	},
			"json"
		);
	},
	
	search : function(){
		hash = window.location.hash.substring(1);
		$.ajax({
			type	: 	"POST",
			url		: 	"action.php",
			data	: 	{a:11,query:hash},
			cache	: 	false,
			dataType: 	"json",
			success	: 	function(response)
			{
				tweets = response.tweets;
				Tweenky.display_tweets(tweets, true);
				clearInterval(_refresh_timer);
				_refresh_timer = setInterval ( "Tweenky.update("+response.query_id+");", 25000 );
			},
			error	: 	function(){
				alert("Error");
			}
		});
	},	
	
	update : function(query_id){
		$.post(
			"action.php",
			{ "a" : 13, "query_id":query_id},
			function(response){
				Tweenky.display_tweets(response.tweets, false);
		  	},
			"json"
		);
	},
	
	display_tweets : function(tweets, new_search){
		if (tweets.length > 0)
		{
			delimeter = '';
			tweet_string = '';
			for(i=0; i < tweets.length; i++)
			{
				tweet_string += delimeter + tweets[i];
				delimeter = ',';
			}

			$.post(
				"action.php",
				{"tweets" : tweet_string, "a" : 22},
				function(items){
					
					
					if (new_search == true)
					{
						$('#tweet-list').empty();
					}
					
					html = "<div id='tweet-list'></div>";
					$('#tweets').append(html);
					
					for(i=0; i< items.length; i++)
					{
						html = Tweenky.tweet_to_html(items[i]);

						$('#tweet-list').prepend(html);

					}	
					var opts = {
											left: 0
										};
					
					$("img").dropShadow(opts);
					recalculate_timestamps();
					$(".tweet").each(function(){
						$(this).fadeIn("slow");
					})
			  	}, "json"
			);
		}
	},
	
	tweet_to_html : function(item){
		
		html = '';
		
		html += '<table class="tweet" id="tweetid-'+item.tweet_id+'" style="width:100%">';
		html += 	'<tr>';
		html += 		'<td valign="top" class="tweet-image" style="background:url('+item.image_url +') no-repeat;" onMouseOver="$(\'#tweetid-'+item.tweet_id+' .author-image-overlay\').toggle()" onMouseOut="$(\'#tweetid-'+item.tweet_id+' .author-image-overlay\').toggle()">';
		html +=			'<table class="author-image-overlay" cellpadding="3" cellspacing="3" ><tr><td>@</td><td></td></tr><tr><td>&hearts;</td><td>></td></tr></table>';
		html += 		'</td>';
		html += 		'<td align="left" class="tweet-content">';
		html += 				"<div class='tweet-tweet'>";
		html +=						"<a href='#query/from:"+item.username+"' class='tweet-author'>"+item.username+"</a>: <span class='tweet-text'>" + tweet_wrap(item) +"</span>";
		html += 				"</div>";
		html +=					"<div class='tweet-footer'>";		
		html += 					item.name + " said <a href='" + item.link_url + "' target='_blank' title='" + (item.date_published) + "' class='timestamp'></a> ";
		if (item.posting_app != null)
			html +=	"via " + item.posting_app;
		//else if ( item.source_id == "2")
		//	html += " at <a href='http://search.twitter.com/' target='_blank'>search.twitter.com</a>";
		html += 				"</div>";
		html += 		'</td>';
		html += 	'</tr>';
		html += '</table>';
		
		return html;
	}
}