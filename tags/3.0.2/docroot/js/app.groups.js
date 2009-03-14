
function App_TweetGroups(application_data)
{
	Tweenky.applications[application_data.application_key] = this;
	
	this.application_id		= application_data.application_id;
	this.application_key	= application_data.application_key;
	this.settings			= application_data.settings;
	this.allows_posting		= "true";
	this.tweets				= {};
	this.since_id			= {};
	this.groups				= {};
	that 					= this; // An alias
	
	this.install = function()
	{
		if(!this.settings)
			this.settings = {};
		
			
		if (!this.settings.title)
			this.settings.title = "TweetGroups";
			
		if (!this.settings.api_url)
			this.settings.api_url = "http://api.tweetgroups.net/index.php";
			
		if (!this.settings.username)
			this.settings.username = "";
			
		if (!this.settings.password)
			this.settings.password = "";
		
		this.display_menu();
		
		//setInterval('Tweenky.applications["'+this.application_key+'"].get_tweets("friends")', 60000); // 1 minute
		//setInterval('Tweenky.applications["'+this.application_key+'"].reset_trends()', 600000); //10 minutes
		
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
		$.ajax({
			type	: "POST",
			url		: "/proxy.php",
			data	: {
				"url"	: Tweenky.applications[this.application_key].settings.api_url + "?method=subscriptions",
				"ak"	: this.application_key
			},
			dataType: "json",
			success	: function(call){
				groups = Tweenky.applications[call.params.ak].groups = call.response;
				for(i in groups)
				{
					$('#app-'+call.params.ak+'-groups').append('<li><a class="query" href="#ak='+call.params.ak+'&group_id='+groups[i].group_id+'">'+groups[i].title+'</a></li>');
				}
			}
		});		
	}
	
	this.new_state = function(params)
	{
		if (params.group_id)
		{
			//this.tweets['search-'+params.query] 	= [];
			//this.since_id['search-'+params.query] 	= [];
			this.search_query(params.group_id);
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
					<ol id="app-'+this.application_key+'-groups"> \
					</ol>\
		';
		
		html +=	'\
				</div> \
			</div> \
		';
		$("#leftcolumn").append(html);		
	}
	
	
	/* SEARCH */
	
	this.search_trigger_query = function()
	{
		query = $('#app-'+this.application_key+'-query').val();
		window.location.hash = '#ak='+this.application_key+'&query='+query;
	}
	
	this.search_query = function(group_id)
	{
		groups = Tweenky.applications[this.application_key].groups;
		for(i in groups)
		{
			console.log(groups[i]);
			if (group_id == groups[i].group_id)
			{
				users = groups[i].users;
			}
		}
		query = '';
		for(i in users)
		{
			query += " OR from:"+users[i];
		}
		
		window.location.hash = "#ak=hK09LZZLHq&query="+(query);
		/*
				that = this;
				
				
				search_url 	= "http://search.twitter.com/search.json?q="+escape(query) + "&since_id="+this.since_id['search-'+query]+"&rpp=50";
				
				log("Searching - " + search_url);
				$.ajax({
					type	: "POST",
					url		: "/proxy.php",
					data	: {
						"url"	: search_url,
						"ak"	: this.application_key
					},
					dataType: "json",
					success	: function(call){
						tweets = call.response.results;
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
							tweet.source 					= '';
							
						    values = item.created_at.split(" ");
							tweet.created_at = Date.parse(values[2] + " " + values[1] + ", " + values[3] + " " + values[4]);
							timeline = 'search-'+query;

							$("#app_"+that.application_key+"_count_"+timeline).show();
							
							//unread_count = parseInt($("#app_"+that.application_key+"_count_"+timeline+" span").html()) + 1;
							//$("#app_"+that.application_key+"_count_"+timeline+" span").html(unread_count);
							document.title = Tweenky.applications[that.application_key].settings.title + ": " + timeline;

							if (i==tweets.length-1)
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
				});
				*/
	}
}