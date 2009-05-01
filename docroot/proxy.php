<?

	require_once('../config.php');
	
	if (stristr( $_GET['original_url'], "www.twitter.com"))
	{	
	    $Twitter = new TwitterOAuth(TWITTER_OAUTH_CONSUMER_KEY, TWITTER_OAUTH_CONSUMER_SECRET, $_SESSION['oauth_access_token'], $_SESSION['oauth_access_token_secret']);

		$data = array_map("stripslashes", array_merge($_POST, $_GET));
		echo $Twitter->OAuthRequest($_GET['original_url'], $data, $_SERVER['REQUEST_METHOD']);

		die();
	}

	$ch = curl_init();
		
	if ($_SERVER['REQUEST_METHOD'] == "POST")
	{
		$_POST = array_map_r("stripslashes", $_POST);
		
		if (strstr($_GET['original_url'], "twitpic"))
		{
			$_POST['media'] = "@".$_FILES['media']['tmp_name'];
			$_POST['username'] = $username;
			$_POST['password'] = $password;
		}
		
		curl_setopt($ch, CURLOPT_POST, 				1 );
		curl_setopt($ch, CURLOPT_POSTFIELDS, 		$_POST );
	}
	else
	{
		if (strstr($_GET['original_url'], "search.twitter.com"))
		{
			$_GET['original_url'] = (stripslashes(str_replace("q=#", "q=%23", $_GET['original_url'])));
			//$_GET['original_url'] = 'http://search.twitter.com/search?q="John+Stewart"+OR+"Jon+Stewart"';
			$p = (parse_url($_GET['original_url']));
			$_GET['original_url'] = $p["scheme"]."://".$p["host"].$p["path"]."?".make_happy($p["query"]);
			
		}	
	}	
	$url = $_GET['original_url'];
	$get = $_GET;
	unset($get['original_url']);
	if (!empty($get))
		$url .= "&" . http_build_query($get);
	//die($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,	1);
	curl_setopt($ch, CURLOPT_URL, 				$url);
	curl_setopt($ch, CURLOPT_HTTPHEADER, 		array('Expect:')); 
	$response = curl_exec($ch);
	//print_r($_POST);die();
	//print_r($_GET);die();
	
	
	if (is_xml($response))
	{
		header("Content-type: text/xml");
	}	
	
	echo $response;

/*******************************************/

		function make_happy($str)
		{
			return str_replace(" ", "+", $str);
		}


		function array_map_r( $func, $arr )
		{
		    $newArr = array();

		    foreach( $arr as $key => $value )
		    {
		        $newArr[ $key ] = ( is_array( $value ) ? array_map_r( $func, $value ) : ( is_array($func) ? call_user_func_array($func, $value) : $func( $value ) ) );
		    }

		    return $newArr;
		}
		
		function is_xml($xml)
		{
			//return false;
			libxml_use_internal_errors(true);

			$doc = new DOMDocument('1.0', 'utf-8');
			$doc->loadXML($xml);

			$errors = libxml_get_errors();
			if (empty($errors))
			{
			        return true;
			}

			$error = $errors[ 0 ];
			if ($error->level < 3)
			{
			        return true;
			}

			$lines = explode("r", $xml);
			$line = $lines[($error->line)-1];

			$message = $error->message.' at line '.$error->line.':<br />'.htmlentities($line);

			return false;
		}
?>