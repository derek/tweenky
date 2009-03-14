<?
		session_start();
		
		if (strstr($_GET['original_url'], "tweetburner"))
		{
			echo `curl http://tweetburner.com/links -d link[url]={$_POST['link']['url']}`;
			die();
		}
		
		$ch = curl_init();
			
			
		if (isset($_POST['username'])) 											$username = $_SESSION['username'] = $_POST['username'];
		elseif (isset($_SESSION['username']) && !empty($_SESSION['username']))	$username = $_SESSION['username'];

		if (isset($_POST['password'])) 											$password = $_SESSION['password'] = $_POST['password'];	
		elseif (isset($_SESSION['password']) && !empty($_SESSION['password'])) 	$password = $_SESSION['password'];
		//die($username . $password);
		if (isset($username) && isset($password))
			curl_setopt($ch, CURLOPT_USERPWD,			$username.":".$password);
			
		if ($_SERVER['REQUEST_METHOD'] == "POST")
		{
			$_POST = array_map_r("stripslashes", $_POST);
				
			$_POST['source'] = "Tweenky";
			
			if (isset($_POST['status']))
			{
				$status = urlencode(stripslashes(urldecode($_POST['status'])));
				unset($_POST['status']);
				
				$_GET['original_url'] = sprintf($_GET['original_url'] . "?status=%s", $status);
				if (isset($_POST['in_reply_to_status_id'])) {
					$_GET['original_url'] .= sprintf("&reply_to_status_id=%s", $_POST['in_reply_to_status_id']);
					unset($_POST['in_reply_to_status_id']);
				}
			}
			
			if (strstr($url, "twitpic"))
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
		
		//die($_GET['original_url']);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,	1);
		curl_setopt($ch, CURLOPT_URL, 				$_GET['original_url'] );
		curl_setopt($ch, CURLOPT_HTTPHEADER, 		array('Expect:')); 
		
		//print_r($_POST);die();
		//print_r($_GET);die();
		
		
		$response =  curl_exec( $ch );
		//echo curl_error($ch);
		curl_close($ch);
		
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