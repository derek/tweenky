
	
	//alert(window.navigator.language);
	_next_tweet_color_scheme 	= 1;
	_closed_icon 				= "/images/folder_collapse_icon.gif";
	_expand_icon 				= "/images/folder_expand_icon.gif";
	_folder_open_icon 			= "/images/folder_open.png";
	_folder_closed_icon 		= "/images/folder_closed.png";
	_query_history 				= new Array();
	_last_hash					= '';
	_reply_to_status_id			= null;
	_params						= null;
	_tweet_refresh				= null;
	_refresh_time	= 25;
	
	
	
	
	

	Tweenky 			 = {
		applications : {
			/*asdasd		: {
				application_id  : 1,
				settings		: {
					username	: "derek",
					password	: "tw1tter007",
					title		: "Twitter"
				}
			},*/
			
			install		: function(application_data){
				if (!application_data.application_key)
					application_data.application_key = random_string(10);
					
				switch(application_data.application_id)
				{
					case 1:
					case 2:
						Tweenky.applications[application_data.application_key] = new App_Twitter_API(application_data);
						break;
				}
				
				Tweenky.applications[application_data.application_key].install();
			},
			
			save		: function(){
				settings = [];
				for (application_key in Tweenky.applications)
				{
					if (typeof Tweenky.applications[application_key] == "object")
					{
						settings[settings.length] = {
							settings		: Tweenky.applications[application_key].settings,
							application_id  : Tweenky.applications[application_key].application_id,
							application_key : application_key
						}
					}
				}
				
				Tweenky.storage.set('saved_data', $.toJSON(settings));
				$.ajax({
					type	: "POST",
					url		: "/action.php",
					data	: {
						"a"			: 1000,
						"settings"	: $.toJSON(settings),
					},
					success	: function()
					{
						Tweenky.applications.restart();
				  	}
				});
			},
			
			load		: function(){
				Tweenky.storage.get('saved_data', function(ok, json_data) {
					if (ok)
					{
						settings = $.evalJSON(json_data);

						for (i in settings)
						{
							Tweenky.applications.install(settings[i]);
						}
						Tweenky.applications.save();
						render_settings();
					}
				});
			},
			
			restart		: function(){
				i=0;
				for (application_key in Tweenky.applications)
				{
					if (typeof Tweenky.applications[application_key] == "object")
					{
						if (i==0)
							first_app_key = application_key;
						Tweenky.applications[application_key].restart();
						i++;
					}
				}

				window.location.hash = "#ak="+first_app_key+"&timeline=friends";
			}
		},
		storage			: new Persist.Store('Tweenky')
	};
	
	

	function logout(auto)
	{
		if (auto == true)
			auto = "&auto";
		else
			auto = '';
		
		Tweenky.storage.remove('saved_data');
		
		window.location = "/index.php?logout"+auto;
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
		$("#leftcolumn .query-selected").removeClass("query-selected");
		$("#leftcolumn a[@href="+window.location.hash+"]").addClass("query-selected");
		
		if (readCookie("PHPSESSID") == null)
		{
			clearInterval(_state_interval);
			setTimeout('logout(true)', 100)
		}
		
		if (window.location.hash != _last_hash)
		{
			_last_hash = window.location.hash;
			new_state();
			return true;
		}
		else if (window.location.hash == "")
		{
			window.location.hash = "view=settings&tab=applications";
		}
		else
		{
			return false;
		}
	}
	
	function new_state()
	{	
		$("#loading").show();
		var params = get_querystring_object();
		
		switch(params.view)
		{
			case "settings":
				if (params.tab == undefined)
					window.location.hash = "view=settings&tab=applications";
				
				tab = params.tab;
				
				$("#maincontainer").show();
				if ($("#content-settings:visible").length == 0)
				{
					$("#content-tweets").hide();
					$("#content-settings").show();
					$("#content-settings .innertube").show();
					render_settings();
					show_settings(tab);
				}
				else
				{
					show_settings(tab);
				}
				break;
				
			default:
				$("#content-settings").hide();
				$("#content-tweets").show();
			 	$('#tweet-list').empty();
				if (Tweenky.applications)
					if (Tweenky.applications[params.ak])
						Tweenky.applications[params.ak].new_state(params);
					else
						window.location.hash = '';
				else
					window.location.hash = '';
				break;
				
			case "logout":
				clearInterval(_state_interval);
				$.post(
					"action.php",
					{ "a" : 74},
					function(){
						logout();
				  	}
				);
				break;
		}

	}
	
	/*function get_settings()
	{

		$("#leftcolumn").empty();
		
		$.ajax({
			type	: "POST",
			url		: "/action.php",
			data	: {
				"a"			: 1000,
				"settings"	: $.toJSON(Tweenky),
			},
			success	: function()
			{
				if (Tweenky == null)
				{
					window.location.hash = "#view=settings&tab=applications";
				}
				else
				{
					for (application_key in Tweenky.applications)
					{
						switch(Tweenky.applications[application_key].application_id)
						{
							case "1":
							case "2":
								application = new App_Twitter_API(application_key);
								application.init(Tweenky.applications[application_key]);
								Tweenky.applications[application_key] = application;
								break;
						}
					}
					//window.location.hash = "#ak="+application_key+"&timeline=friends";
				}
		  	}
		});
	}*/
	
	
	function save_settings()
	{
		$("#settings input").each(function(){
			blah = $(this).attr("id").split("-");
			application_key = blah[1];
			key = blah[2];
			value = $(this).val();
			//console.log(application_key + ' ' + key + ' ' + value);
			if (application_key != undefined)
			{
				Tweenky.applications[application_key].settings[key] = value;
			}
		});
		Tweenky.applications.save();
	}	
	
	
	function render_settings()
	{
		$("#new-tweet-services-list").empty();
		for(i in Tweenky.applications)
		{
			if (Tweenky.applications[i].allows_posting == "true")
			{
				html = '<li><input type="checkbox" class="post-to-service" value="'+Tweenky.applications[i].application_key+'" checked /> '+Tweenky.applications[i].settings.title+'</li>';
				$("#new-tweet-services-list").append(html);
			}
		}
		
		$("#settings-applications .innertube").empty();
		html = '';
		
		html += '<form id="settings">';
		// Applications tab
		html = '<ul>';
		
			html += '<li><hr style="border:solid 3px #FAD163" /></li>';
			html += '<li><h3>Active Applications</h3></li>';
				if (Tweenky.applications == undefined)
				{
					html += '<li>*** You have no applications installed. ***</li>';
				}
				else
				{
					for(application_key in Tweenky.applications)
					{
						if (typeof Tweenky.applications[application_key] == "object")
						{
							html += '<li><hr style="border:dotted 3px #FAD163" /></li>';
							html += '<li>';
								html += Tweenky.applications[application_key].get_settings_menu();
							html += '</li>';
						}
					}

					html += '<div align="center">';
						html += '<input type="button" onclick="save_settings()" value="Save Settings" />';
					html += '</div><br/>';
				}
				
			html += '<li><hr style="border:solid 3px #FAD163" /></li>';
			html += '<li><h3>Available Applications</h3></li>';
			html += '<li><hr style="border:dotted 3px #FAD163" /></li>';
			html += '<li>';
				html += '<input type="button" onclick="application_install(1)" value="Install"> Twitter ';
			html += '</li>';
			html += '<li>';
				html += '<input type="button" onclick="application_install(2)" value="Install"> Laconi.ca ';
			html += '</li>';
		html += '</ul>';
		html += "</form>";
		
		$("#settings-applications .innertube").html(html);
		
		if (Tweenky != null)
		{
			for(var i in Tweenky.applications)
			{
				application_id = Tweenky.applications[i].application_id;
			
				$("#settings-applicationid-"+application_id+" h4 input").click();
				$(".applicationid-"+application_id+"").show();
			}
		}
	}

	function application_install(application_id)
	{
		app = {
			"application_id" : application_id,
			"application_key" : random_string(10)
		}
		
		switch(app.application_id)
		{
			case 1:
			case 2:
				application = new App_Twitter_API(app);
				break;
		}
		application.install();
		render_settings();
	}

	function random_string(string_length) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return randomstring;
	}



	function application_remove(application_key)
	{
		Tweenky.applications[application_key].uninstall();
	}



	function toggle_application(node)
	{
		tmp = node.parentNode.parentNode.id.split("-", 3);
		application_id = tmp[2];
	
		switch(application_id)
		{
			case "1":
				$("#twitter").toggle();
				activate = false;
				break;
			
			case "2":
				$("#identica").toggle();
				activate = false;
				break;
			
			case "3":
				$("#search").toggle();
				activate = true;
				break;
			
			case "4":
				$("#app-hottopics").toggle();
				activate = true;
				break;
			
			case "5":
				$("#folders").toggle();
				$("#quick-links").toggle();
				activate = true;
				break;
			
			default:
				alert('uh oh');
				break;
		}
		
		if (activate == true)
		{
			$.post(
				"action.php",
				{"a" : 400, "application_id":application_id},
				function(data){
				}
			);
		}
		
		if ($("#"+node.parentNode.parentNode.id+" .innertube:visible").length < 1)
		{
			$("#"+node.parentNode.parentNode.id+" .innertube").show();
		}
		else
		{
			$("#"+node.parentNode.parentNode.id+" .innertube").hide();
			$.post(
				"action.php",
				{"a" : 402, "application_id":application_id},
				function(data){
					load_settings();
				}
			);
		}
	}

	function show_settings(tab)
	{
		$("#loading").hide();
		$("#content-tweets").hide();

		$("#settings .toolbar .selected").removeClass("selected");
		$("#settings-tab-"+tab).addClass('selected');

		$(".settings-menu:visible").hide();
		$("#settings-"+tab).show();
		
	}
	
	
	
	
	
	function update_status(status)
	{
		$(".post-to-service:checked").each(function(){
			application_key = $(this).val();
			Tweenky.applications[application_key].post_new_tweet(status)
		});

/*
		post_to_twitter 	= $("#post-to-twitter").attr("checked");
		post_to_identica 	= $("#post-to-identica").attr("checked");
		
		if (post_to_identica == true && status.substring(0, 2) == "d ")
		{
			alert("Sorry, Identi.ca does not yet support direct messaging");
			return false;
		}
		
		if (status.length <= 140)
		{
			$.post(
				"action.php",
				{"status" : status, "a" : 9, "reply_to_status_id" : _reply_to_status_id, "post_to_twitter":post_to_twitter, "post_to_identica":post_to_identica},
				function(response){
					_reply_to_status_id = null;
					if (response == null)
					{
						alert("Error sending update");
					}
					else if (post_to_twitter == "true" && response.twitter_tweet_id < 1)
					{
						//alert(response.toSource());
						alert("Error posting update to Twitter");
					}
					else if (post_to_identica == "true" && response.identica_tweet_id < 1)
					{
					//	alert(response.toSource());
						alert("Error posting update to Identica");
					}
					else
					{
						//alert(response.toSource());
						$('#new-status').val('');
						$('#new-status-char-count').html('0');
						$('#update-status').jFade({
								property: 'background',
								start: 'FFF8AF',
								end: 'EAEFBD',
								steps: 25,
								duration: 90
							});
						
						section_display_toggle('update-status', "slideToggle");
					}
				}, "json"
			);
		}
		else
		{
			alert("Tweet must be less than 140 characters");
			return false;
		}
		*/
	}

	
	
	function retweet(id)
	{
		create_status("Retweet @"+$("#tweetid-"+id+" .tweet-author").html()+": "+$("#tweetid-"+id+" .tweet-text").html());
	}


	function create_status(status, service_id, reply_to_status_id)
	{		
		if (reply_to_status_id > 0)
		{
			_reply_to_status_id = reply_to_status_id;
		}
		else
		{
			_reply_to_status_id = null;
		}
		service_id = parseInt(service_id);
		switch(service_id)
		{
			case 1:
				$("#post-to-twitter").attr('checked', true);
				$("#post-to-identica").attr('checked', false);
				
				break;
			
			case 2:
				$("#post-to-twitter").attr('checked', false);
				$("#post-to-identica").attr('checked', true);
				
				break;
			
			default:
				$("#post-to-twitter").attr('checked', true);
				$("#post-to-identica").attr('checked', true);
			
				break;
		}
		
		$('#update-status h3').removeClass('right-arrow').addClass('down-arrow');
		section_display_toggle("update-status", "show");
		$('#new-status').val(status);
		$('#new-status').focus();
	}

	
	
	function service_shorten_url(service)
	{
		original_url = prompt("Enter the URL you wish to shorten", "http://");
		switch(service)
		{
			case "is.gd":
				url 	= "http://is.gd/api.php?longurl="+original_url;
				break;
			case "snipurl":
				url 	= "http://snipurl.com/site/snip?r=simple&link="+original_url;
				break;
		}
		
		
		$.post(
			"proxy.php",
			{"url": url},
			function(call){
				if (call.response.toUpperCase().match("ERROR"))
					alert("Error retrieving short URL.  Did you include 'http://'?")
				else
					$('#new-status').val($('#new-status').val() + " " + call.response);
			},
			"json"
		);
	}
	
	function follow(profile_id)
	{
		$.post(
			"action.php",
			{"a": "87", "profile_id": profile_id},
			function(response){
				if (response.error)
				{
					alert(response.error)
				}
				else
				{
					$("#follow-button").toggle();
					$("#unfollow-button").toggle();
				}
			},
			"json"
		);
	}
	
	function unfollow(profile_id)
	{
		$.post(
			"action.php",
			{"a": "88", "profile_id": profile_id},
			function(response){
				if (response.error)
				{
					alert(response.error)
				}
				else
				{
					$("#follow-button").toggle();
					$("#unfollow-button").toggle();
				}
			},
			"json"
		);
	}
	
	
	function URLDecode (encodedString) {
	  var output = encodedString;
	  var binVal, thisString;
	  var myregexp = /(%[^%]{2})/;
	  while ((match = myregexp.exec(output)) != null
	             && match.length > 1
	             && match[1] != '') {
	    binVal = parseInt(match[1].substr(1),16);
	    thisString = String.fromCharCode(binVal);
	    output = output.replace(match[1], thisString);
	  }
	  return output;
	}
	

	function translate(tweet_id, language)
	{
		id = "tweetid-"+tweet_id+"-translate";
	
		if ($("#"+id).length < 1)
		{
			html = "<fieldset class='translation-box' id='"+id+"'>";
			html += "<legend>Translations</legend>";
			html += "<div class='translations'></div>";
			html += "</fieldset>";

			$("#tweetid-"+tweet_id + " .tweet-text").append(html);
			
		    google.language.getBranding(id);
		}
		
		$.post(
			"action.php",
			{"tweets" : tweet_id, "a" : 22},
			function(tweets){
				text = tweets[0].tweet;
				author = tweets[0].username;
				google.language.translate(text, "", language, function(result) {
				  if (!result.error) {
					html = "<div style='padding:10px;'>("+language+") "+author+": "+(result.translation)+"</div>";
					$("#"+id+" .translations").append(html);
				  }
				});
			},
			"json"
		);
	}	
		
	function update_account_info()
	{
		email 	= $('#settings-email').val();
		jabber 	= $('#settings-jabber').val();
		
		$.post(
			"action.php",
			{"a" : 209, "email":email, "jabber":jabber},
			function(data){
				window.location.hash = '';
			}
		);
	}
	
	