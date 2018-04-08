<?
	class Utility
	{
		static function get_queue()
		{
			return new SQSClient(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SQS_ENDPOINT);
		}
		
		
		function get_twitter($username = null, $password = null)
		{
			if ($username == null)
				$username = $_SESSION['twitter']['username'];
				
			if ($password == null)
				$password = $_SESSION['twitter']['password'];
				
			$Twitter = new Twitter($username, $password);
		
			return $Twitter;
		}
		
		function get_profile_id_from_login($service_id, $username, $password)
		{
			switch($service_id)
			{
				case "1": //Twitter
				
					$Twitter = $this->get_twitter($username, $password);

					$reponse = $Twitter->showUser("json", $username);
					//print_r($reponse);
					$user_info = json_decode($reponse);
					
					if (isset($user_info->id) && $user_info->id > 0)
					{
						$external_id 	= (integer)$user_info->id;
						
						$profile_id 	= $this->get_profile_id_by_external_id($service_id, $external_id, false);
						
						if ($profile_id < 1)
						{
							$profile_id = $this->get_profile_id_by_username($service_id, $username, false);
						}
						
						if ($profile_id < 1)
						{
							$profile_id = $this->get_profile_id_by_external_id($service_id, $external_id, true);
						}
						
						return $profile_id;
					}
					else
					{
						return false;
					}
					
					break;
					
				case "2": //Identica
				
					break;
			}
			
			return false;
		}
		
		
		function query_to_query_id($query)
		{
			parse_str($query, $parsed);
			ksort($parsed);
			
			$query = http_build_query($parsed);
			
			$sql = "SELECT query_id FROM queries WHERE query = ?";
			$query_id = $GLOBALS['DB']->GetOne($sql, array($query));

			if ($query_id < 1)
			{
				$sql = "INSERT INTO queries (query) VALUES (?)";
				$GLOBALS['DB']->Execute($sql, array($query));
				
				$query_id = $GLOBALS['DB']->Insert_ID();
			}

			return $query_id;
		}
		
		function get_user_id_by_username($service_id, $username)
		{
			$sql = "SELECT u.user_id FROM users u LEFT JOIN profile_to_user ptu ON ptu.user_id = u.user_id LEFT JOIN profiles p ON p.profile_id = ptu.profile_id WHERE p.service_id = ? AND p.username = ?";
			$user_id = $GLOBALS['DB']->GetOne($sql, array($service_id, $username));
			
			return $user_id;
		}

		function get_user_id_by_external_id($service_id, $external_id)
		{
			$sql = "SELECT user_id FROM profile_to_user ptu LEFT JOIN profiles p ON p.profile_id = ptu.profile_id WHERE service_id = ? AND external_id = ?";
			$user_id = $GLOBALS['DB']->GetOne($sql, array($service_id, $external_id));
			
			return $user_id;
		}

		function get_profile_id_by_username($service_id, $username, $insert = true)
		{
		
			if (!empty($username))
			{
				//echo $sql = "SELECT profile_id FROM profiles WHERE service_id = $service_id AND username = '$username'";
				$sql = "SELECT profile_id FROM profiles WHERE service_id = ? AND username = ?";
				$profile_id = $GLOBALS['DB']->GetOne($sql, array($service_id, $username));
				
				if ($profile_id < 1 && $insert == true)
				{
					$sql = "INSERT INTO profiles (service_id, username) VALUES (?, ?)";
					$GLOBALS['DB']->Execute($sql, array($service_id, $username));
				
					$profile_id = $GLOBALS['DB']->Insert_ID();
					
					return $profile_id;
				}
				elseif ($profile_id > 0)
				{
					return $profile_id;
				}
				else
				{
					return false;
				}
			}
			else
			{
				return false;
			}
		}

		function get_profile_id_by_external_id($service_id, $external_id, $insert = true)
		{
			if ($external_id > 0)
			{
				$sql = "SELECT profile_id FROM profiles WHERE service_id = ? AND external_id = ?";
				$profile_id = $GLOBALS['DB']->GetOne($sql, array($service_id, $external_id));

				if ($profile_id < 1 && $insert == true)
				{
					$sql = "INSERT INTO profiles (service_id, external_id) VALUES (?, ?)";
					$GLOBALS['DB']->Execute($sql, array($service_id, $external_id));

					$profile_id = $GLOBALS['DB']->Insert_ID();
				}
				
				return $profile_id;
			}
			else
			{
				return false;
			}
		}
		
		function get_hot_queries()
		{
			$hotlist_query = "SELECT query FROM hotlist WHERE date_created > (CURRENT_TIMESTAMP - INTERVAL 1 HOUR)";
			$queries = $GLOBALS['DB']->GetCol($hotlist_query);
			
			if (count($queries) < 1)
			{
				$url = "http://search.twitter.com/";
				$ch = curl_init($url);
				curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
				$html = curl_exec($ch);
				curl_close ($ch);
				
				$this->log_api_request($url, $html);
				
				$dom = new DOMDocument();
				@$dom->loadHTML($html);
				$xpath = new DOMXPath($dom);
				$hrefs = $xpath->evaluate("/html/body//a");
				
				for ($i = 0; $i < $hrefs->length; $i++) {
					$href = $hrefs->item($i);
					$url = $href->getAttribute('href');
					if (stristr($url, "/search?q") && !empty($href->nodeValue))
						$queries[] = $href->nodeValue;
				}
				
				//$sql = "DELETE FROM hotlist";
				//$GLOBALS['DB']->Execute($sql);

				foreach ($queries as $query)
				{
					$sql = "INSERT INTO hotlist (query) VALUES (?)";
					$GLOBALS['DB']->Execute($sql, array($query));
				}
				
				$queries = $GLOBALS['DB']->GetCol($hotlist_query);
			}	

			
			return $queries;
		}
		
		function encrypt($text){

		    $iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
		    $iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
		    $key = "This is a very secret key";
		    return base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $key, $text, MCRYPT_MODE_ECB, $iv));

		}

		function decrypt($text){

		    $iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
		    $iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
		    $key = "This is a very secret key";
		 	//I used trim to remove trailing spaces
			return trim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $key, base64_decode($text), MCRYPT_MODE_ECB, $iv));
		}
		
		function log_api_request($request, $response)
		{
			$sql = "INSERT INTO api_requests (user_id, request, response) VALUES (?, ?, ?)";
			$GLOBALS['DB']->Execute($sql, array($_SESSION['user_id'], $request, $response));
		}
		
		function log_in_by_session()
		{
			$session_id = $_COOKIE['session_id'];
			$ip_address = $_SERVER['REMOTE_ADDR'];
			$user_agent = addslashes($_SERVER['HTTP_USER_AGENT']);
			
			$sql = "SELECT user_id FROM logins WHERE session_id = ? AND ip_address = ?";
			$user_id = $GLOBALS['DB']->GetOne($sql, array($session_id, $ip_address));
			
			if ($user_id > 0)
			{
				$User = new User($user_id);
				$User->login();
				
				header("Location: ".BASE_URL."manage.php");
			}
			else
			{
				return false;
			}
		}
		
		static function create_user($openid)
		{
			$sql = "INSERT INTO users (openid_identity) VALUES (?)";
			$GLOBALS['DB']->Execute($sql, array($openid));
			
			$user_id = $GLOBALS['DB']->Insert_ID();
			
			
			$User = new User($user_id);
			$folder_id = $User->create_folder("Quick Links");

			$Utility = new Utility();

			$Tweenky_folder = new Folder($User->create_folder("Tweenky"));
			$Tweenky_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:derek"));
			$Tweenky_folder->add_query($Utility->query_to_query_id("service_id=1&query=tweenky"));
			$Tweenky_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:tweenky"));


			$Tech_folder = new Folder($User->create_folder("Tech"));
			$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:marshallk"));
			$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:scobleizer"));
			$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:techcrunch"));
			$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:techmeme"));
			$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:orli"));
			//$sql = "INSERT INTO whitelist (twitter_username) SELECT username FROM profiles WHERE profile_id = ?";
			//$GLOBALS['DB']->Execute($sql, array($this->profile_id));
			
			
			
			return $user_id;
		}
	}

?>
