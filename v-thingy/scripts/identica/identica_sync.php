<?
	//require_once "../functions.php";
	require_once('../lib/magpierss-0.72/rss_fetch.inc');
	
	define('MAGPIE_USER_AGENT', "Tracker: drgath@gmail.com");
	define('MAGPIE_CACHE_AGE', 0);
	define('MAGPIE_CACHE_ON', false);
	define('USER_DATA_FILE', "data/theuserdata.json");
	define("DEBUG", true);
	
	//Set the username to sync
	$identica_username = "derek";
	$twitter_username = "derek";
	
	//Get the user's data
	$user_data = get_user_data($twitter_username);
	dbug("last_tweet_id: " . $user_data->last_tweet_id);
	
	//Log in to Identica
	$identica_session_id = identica_login($identica_username, $user_data->identica_password);
	if (empty($identica_session_id))
	{
		die("Unable to authenticate with Identi.ca");
	}
	
	dbug("Received session_id: ".$identica_session_id);
	
	//Get the identica posts to ensure you don't dupe post
	$identica_posts = get_identica_posts($identica_username);
	dbug("Received ".count($identica_posts)." Identi.ca posts");
	
	//Get the recent twitter posts to sync
	$twitter_posts 	= get_twitter_posts($twitter_username, $user_data->last_tweet_id);
	dbug("Received ".count($twitter_posts)." Twitter posts");
	dbug();
	
	//smoosh all the identica posts to remove any whitespacing issues that has caused problems before
	foreach($identica_posts as $post)
	{
		$notices[] = ereg_replace("[^A-Za-z0-9]", "", $post['title'] );
	}
	
	//Loop through each twitter post
	foreach ($twitter_posts as $post)
	{
		//First determine the tweet_id (aka: twitter's status_id)
		preg_match('([0-9]{9})', $post['link'], $matches);
		$post['tweet_id'] = $matches[count($matches)-1];
		
		//Remove any whitespacing that shouldn't exist
		$post['title'] = trim($post['title']);
		//dbug($post);
		
		//first, ensure it hasn't already been posted to identi.ca
		if (!in_array(ereg_replace("[^A-Za-z0-9]", "", $post['title'] ), $notices))
		{
			//now, make sure it isn't an @ reply since those have no signifigance on identi.ca
			if (strpos($post['title'], "@") === false)
			{
				//Post it
				identica_post($post['title'], $identica_session_id);
				
				//And log it
				$tweets_posted[] = $post['tweet_id'];
				dbug("Posting: \"".$post['title']."\"");
			}
			else
			{	
				dbug("Ignoring: \"".$post['title']."\"");
			}
		}	
		else
		{	
			dbug("Post already found: \"".$post['title']."\"");
		}
	}
	
	//If we actually posted some tweets to identi.ca, we need to update the last_tweet_id for the next go around to pick up where we left off
	if (isset($tweets_posted) && !empty($tweets_posted))
	{
		sort($tweets_posted);

		$data = array(
			'last_tweet_id' => $tweets_posted[count($tweets_posted)-1] //gotta be the last one
		);

		update_user_data($twitter_username, $data);
	}






	function update_user_data($username, $new_data)
	{
		$data = get_user_data();
		
		foreach($new_data as $key => $value)
		{
			$data->$username->$key = $value;
		}

		$filename = USER_DATA_FILE;

		if (is_writable($filename)) {

		    if (!$handle = fopen($filename, 'w+')) {
		         echo "Cannot open file ($filename)";
		         exit;
		    }

		    if (fwrite($handle, json_encode($data)) === FALSE) {
		        echo "Cannot write to file ($filename)";
		        exit;
		    }

		    //echo "Success";

		    fclose($handle);

		} else {
		    echo "The file $filename is not writable";
		}
		
		
	}
	
	
	
	
	function get_user_data($username = null)
	{
		$str = file_get_contents(USER_DATA_FILE);

		$data = json_decode($str);
		if (!empty($username))
			return $data->$username;
		else
			return $data;
	}	
	
	
	function get_identica_posts($username)
	{
		$url = "http://identi.ca/derek/rss";
		$rss = fetch_rss($url);
		$posts = $rss->items;
		
		$posts = array_reverse($posts);
		
		return $posts;
	}
	
	
	function get_twitter_posts($username, $last_tweet_id)
	{
		$url = "http://summize.com/search.atom?q=from%3A{$username}&since_id=".$last_tweet_id;
		$rss = fetch_rss($url);
		$posts = $rss->items;
		$posts = array_reverse($posts);
		
		return $posts;
	}
	
	function identica_login($username, $password)
	{
		$ch = curl_init("http://identi.ca/main/login");
		curl_setopt($ch, CURLOPT_COOKIEJAR, "cookies.txt");  //initiates cookie file if needed
		curl_setopt($ch, CURLOPT_REFERER, "");  //if server needs to think this post came from elsewhere
		curl_setopt($ch, CURLOPT_VERBOSE, 1);
		curl_setopt($ch, CURLOPT_HEADER, 1);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION,1); // follow redirects recursively
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, "nickname={$username}&password={$password}");

		// perform post
		$pnp_result_page = curl_exec($ch);
		curl_close ($ch);

		$test = file_get_contents("cookies.txt");
		$pos = strpos($test, "PHPSESSID");
		$session_id = trim(substr($test, $pos + 9, strlen($test)-$pos));
		
		return $session_id;
	}
	
	
	function dbug($msg = null)
	{
		if (DEBUG)
			print_r($msg);
		echo "<br />";
	}
	
	
	function identica_post($status, $session_id)
	{
		$ch = curl_init("http://identi.ca/notice/new");
	    //curl_setopt($ch, CURLOPT_COOKIEFILE, $username.".cookies.txt");  // Uses cookies from previous session if exist
	    curl_setopt($ch, CURLOPT_REFERER, "");  //if server needs to think this post came from elsewhere
	    curl_setopt($ch, CURLOPT_VERBOSE, 1);
	    curl_setopt($ch, CURLOPT_HEADER, 1);
	    curl_setopt($ch, CURLOPT_COOKIE, "PHPSESSID={$session_id}");
	    curl_setopt($ch, CURLOPT_FOLLOWLOCATION,1); // follow redirects recursively
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	    curl_setopt($ch, CURLOPT_POSTFIELDS, "");
	    curl_setopt($ch, CURLOPT_POSTFIELDS, "status_textarea=".urlencode($status)."&returnto=all");

	    // perform post
	    $pnp_result_page = curl_exec($ch);
	    curl_close ($ch);
	
	}

?>
