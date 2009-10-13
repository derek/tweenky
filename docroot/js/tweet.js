function Tweet(tweet_id)
{
	this.id = tweet_id;
	
	this.get_html = function()
	{
		//user_link = "http://www.twitter.com/"+tweet.from_screen_name;
		user_link = "http://www.twitter.com/"+this.from_screen_name;
		external_url = user_link + "/statuses/" + this.id;

		html = "\
			<div class='tweet' id='tweetid-" + this.id + "'> \
				<div><div id='reply-to-tweetid-" + this.id + "'></div></div> \
				<div> \
					<a  class='tweet-image fancybox' href='" + user_link + "' class='timestamp' target='_blank'> \
						<img src='" + this.from_profile_image_url + "' height='60' width='60'> \
					</a> \
				</div> \
				<div class='tweet-body'> \
					<p class='tweet-tweet'><a href='" + user_link + "' class='tweet-author' target='_blank'>" + this.from_screen_name + "</a>: <span class='tweet-text'>" + this.wrap() +"</span></p> \
					<div class='tweet-footer'><a href='" + external_url + "' title='" + (this.date_created) + "' class='timestamp' target='_blank'>" + relative_time(this.date_created) + "</a> " + ((this.source != '') ? "from "+ this.source : "");

						if (this.in_reply_to_screen_name)
						{
							html += " | in reply to <a href='http://www.twitter.com/" + this.in_reply_to_screen_name + "/status/" + this.in_reply_to_status_id + "' target='_blank'>"+ this.in_reply_to_screen_name + "</a>";
						}   

						html += " | <span class='pseudolink' title='Reply to this tweet' onclick='compose_new_tweet(\"@" + this.from_screen_name + " \", " + this.id + ")'>Reply</span> | \
								<span class='pseudolink' title='Direct message this user' onclick='compose_new_tweet(\"d " + this.from_screen_name + " \")'>Direct</span> | ";

						if   (this.favorited )	html += "<span class='pseudolink' title='Unfavorite this tweet' onclick='favoriteHandler(\"" + this.id + "\", \"destroy\")'>Unfavorite</span> | ";
						else					html += "<span class='pseudolink' title='Favorite this tweet' onclick='favoriteHandler(\"" + this.id + "\", \"create\")'>Favorite</span> | ";

						html += "<span class='pseudolink' title='Retweet this tweet' onclick='retweetHandler(\"" + this.id + "\")'>Retweet</span>";

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