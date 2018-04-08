<?

	
	class User
	{
		
		function __construct($user_id)
		{
			$this->user_id = $user_id;
		}
		
		function login()
		{
			$ip_address = $_SERVER['REMOTE_ADDR'];
			$user_agent = addslashes($_SERVER['HTTP_USER_AGENT']);
			
			$sql = "SELECT DISTINCT session_id FROM logins WHERE user_id = ? AND ip_address = ? AND session_id IN (SELECT session_id FROM session_data)";
			$session_id = $GLOBALS['DB']->GetOne($sql, array($this->user_id, $ip_address));


			if (!empty($session_id))
			{
				//echo "setting session to $session_id";
				session_id($session_id);
			}
			elseif(isset($_COOKIE['PHPSESSID']))
			{
				$session_id = $_COOKIE['PHPSESSID'];
				session_id($session_id);
			}
			else
			{
				session_regenerate_id();
			}
			
			session_start();
			$session_id = session_id();
			$_SESSION['blank'] = true;
			
			//$sql = "DELETE FROM session_data WHERE session_id IN (SELECT session_id FROM logins WHERE user_id = ?) AND session_id NOT IN (?)";
			//$GLOBALS['DB']->Execute($sql, array($this->user_id, $session_id));
			
			$Utility = new Utility();
			
			$sql = "UPDATE session_data SET user_id = ? WHERE session_id = ?";
			$GLOBALS['DB']->Execute($sql, array($this->user_id, $session_id));
			
			$sql = "INSERT INTO logins (user_id, username, session_id, ip_address, user_agent, referer) VALUES (?, ?, ?, ?, ?, ?)";
			$GLOBALS['DB']->Execute($sql, array($this->user_id, $username, $session_id, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], $_SERVER['HTTP_REFERER']));
			$login_id = $GLOBALS['DB']->Insert_ID();
			
			return $login_id;
		}
		
		function logout()
		{
			session_destroy();
		}
		
		function attach_profile($profile_id)
		{
			//echo "INSERT profile_to_user (profile_id, user_id) VALUES ($profile_id, $this->user_id)";
			$sql = "SELECT profile_to_user_id FROM profile_to_user WHERE profile_id = ? AND user_id = ?";
			$assoc_id = $GLOBALS['DB']->GetOne($sql, array($profile_id, $this->user_id));
			
			if ($assoc_id < 1)
			{
				$sql = "INSERT profile_to_user (profile_id, user_id) VALUES (?, ?)";
				$GLOBALS['DB']->Execute($sql, array($profile_id, $this->user_id));

				$assoc_id = $GLOBALS['DB']->Insert_ID();
			}
			
			if ($assoc_id > 0)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		
		function detach_profile($service_id)
		{
			$sql = "DELETE profile_to_user.* FROM profile_to_user, profiles WHERE profiles.profile_id=profile_to_user.profile_id AND profiles.service_id = ? AND profile_to_user.user_id = ?";
			$GLOBALS['DB']->Execute($sql, array($service_id, $this->user_id));
			//echo "detached";
			return true;
		}
		
		function get_profiles()
		{
			$sql = "SELECT p.service_id, p.profile_id FROM profiles p LEFT JOIN profile_to_user ptu ON ptu.profile_id = p.profile_id LEFT JOIN users u ON u.user_id = ptu.user_id WHERE u.user_id = ?";
			$profiles = $GLOBALS['DB']->GetAssoc($sql, array($this->user_id));

			return $profiles;
		}
		
		function get_account_info()
		{
			$sql = "SELECT email, jabber, username, openid_identity FROM users WHERE user_id = ?";
			$data = $GLOBALS['DB']->GetRow($sql, array($this->user_id));
			
			return $data;
		}
		
		
		
		
		
		
		function send_email($subject, $message)
		{
			$sql = "SELECT email FROM users WHERE user_id = ?";
			$email = $GLOBALS['DB']->GetOne($sql, array($this->user_id));
		
			$type = "html";
			
			if ($type == "html")
			{
				// message
				$message = "
				<html>
					<head>
						<title>{$subject}</title>
					</head>
					<body>
						{$message}
					</body>
				</html>
				";

				$headers  = 'MIME-Version: 1.0' . "\r\n";
				$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
				$headers .= 'From: Tweenky <update@tweenky.com>' . "\r\n";
				//$headers .= 'Bcc: drgath@gmail.com' . "\r\n";

			}
			else
			{
				$headers  = 'MIME-Version: 1.0' . "\r\n";
				$headers .= 'From: <update@tweenky.com>' . "\r\n";
				//$headers .= 'Bcc: drgath@gmail.com' . "\r\n";
			}
			
			mail($email, $subject, $message, $headers);
		}
		
		/*function queue_email($template, $data = array())
		{	
			$token = $this->get_token();
			switch($template)
			{
				case "notification":
					$type 		= "html";
					$email 		= $GLOBALS['DB']->GetOne("SELECT email FROM users WHERE user_id = ?", array($this->user_id));
					$subject 	= "[Tweenky] Result for '".stripslashes($data['query'])."'!";
					$message 	= $data['message'] . "<hr /><p>To manage this track, please visit <a href='http://www.tweenky.com'>http://www.tweenky.com</a></p>";
					break; 

				case "verification":
					$type 		= "html";
					$email 		= $GLOBALS['DB']->GetOne("SELECT email FROM users WHERE user_id = ?", array($this->user_id));
					$subject 	= "Please verify your email with Tweenky";
					$message 	= BASE_URL."manage.php?token=".$token."&a=20";
					$footer 	= null;
					break;
				
				case "sms_tweet":
					$type 		= "text";
					$email 		= $GLOBALS['DB']->GetOne("SELECT sms FROM users WHERE user_id = ?", array($this->user_id));
					$subject 	= "";
					$message 	= $GLOBALS['DB']->GetOne("SELECT title FROM items WHERE item_id = ?", array($data['item_id']));
					break;

				default:
					return false;
					break;
			}
			
			if ($type == "html")
			{
				// message
				$message = "
				<html>
					<head>
						<title>{$subject}</title>
					</head>
					<body>
						{$message}
					</body>
				</html>
				";

				$headers  = 'MIME-Version: 1.0' . "\r\n";
				$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
				$headers .= 'From: Twitter Track <drgath@gmail.com>' . "\r\n";
				$headers .= 'Bcc: drgath@gmail.com' . "\r\n";

			}
			else
			{
				$headers  = 'MIME-Version: 1.0' . "\r\n";
				$headers .= 'From: <drgath@gmail.com>' . "\r\n";
				$headers .= 'Bcc: drgath@gmail.com' . "\r\n";
			}

			if (!empty($email) && !empty($subject) && !empty($message))
			{
				mail($email, $subject, $message, $headers);
				return true;
			}
			else
			{
				return false;
			}
		
		}*/
		
		
		
		
		function create_folder($title)
		{
			$sql = "INSERT INTO folders (title) VALUES (?)";
			$GLOBALS['DB']->Execute($sql, array($title));
			$folder_id = $GLOBALS['DB']->Insert_ID();
			
			if ($folder_id > 0)
			{
				$sql = "INSERT INTO user_to_folder (user_id, folder_id) VALUES (?, ?)";
				$GLOBALS['DB']->Execute($sql, array($this->user_id, $folder_id));

				return $folder_id;
			}
			else
			{
				return false;
			}
		}
		
		function get_folder_by_title($title, $create = false)
		{	
			$sql = "SELECT f.folder_id FROM folders f LEFT JOIN user_to_folder utf ON utf.folder_id = f.folder_id WHERE utf.user_id = ? AND f.title = ?";
			$folder_id = $GLOBALS['DB']->GetOne($sql, array($this->user_id, $title));
			
			if ($folder_id < 1 && $create == true)
			{
				$folder_id = $this->create_folder($title);
			}
			
			return $folder_id;
		}
		
		function get_folders()
		{
			$Utility = new Utility();
				
			$sql = "SELECT f.folder_id FROM user_to_folder u LEFT JOIN folders f ON f.folder_id = u.folder_id WHERE u.user_id = ? ORDER BY f.title";
			$folder_ids = $GLOBALS['DB']->GetCol($sql, array($this->user_id));
			foreach ($folder_ids as $folder_id)
			{
				$Folder = new Folder($folder_id);
				$folder_data = $Folder->get_info();
				
				$query_data = $Folder->get_queries();
				for ($i=0; $i < count($query_data); $i++)
				{
					if (0)
					{
						$sql = "SELECT max_tweet_id FROM searches WHERE user_id = ? AND query_id = ? ORDER BY search_id DESC";
						$last_viewed_tweet_id = $GLOBALS['DB']->GetOne($sql, array($this->user_id, $query_data[$i]['query_id']));
						
						$get_tweet_data = array();
						if ($last_viewed_tweet_id > 0)
							$get_tweet_data['min_id'] = $last_viewed_tweet_id;

						$Query 	= new Query($query_data[$i]['query_id']);
						$new_tweets = $Query->get_tweets($get_tweet_data);
						$query_data[$i]['new_count'] = count($new_tweets);
					}
					else
					{
						//$query_data[$i]['new_count'] = 0;
					}
				}
				$folders[] = $folder_data;
				$queries[$folder_data['folder_id']] = $query_data;
			}
			$response = array(
				"folders" => $folders,
				"queries" => $queries
			);
			
			return $response;
		}
		
		function get_bookmarks()
		{
			$sql = "SELECT q.query_id FROM queries q LEFT JOIN  query_to_folder qtf ON q.query_id = qtf.query_id LEFT JOIN user_to_folder utf ON utf.folder_id = qtf.folder_id WHERE user_id = ? GROUP BY q.query_id, q.query ORDER BY query";
			$queries = $GLOBALS['DB']->GetCol($sql, array($this->user_id));
			
			foreach ($queries as $query_id)
			{
				$Query = new Query($query_id);
				$query = $Query->get_query_data();
				//print_r($query);
				//echo $sql = "SELECT f.folder_id, f.title FROM folders f LEFT JOIN user_to_folder utf ON utf.folder_id = f.folder_id LEFT JOIN query_to_folder qtf ON qtf.folder_id = f.folder_id WHERE utf.user_id = {$this->user_id} AND qtf.query_id = {$query_id}";
				$sql = "SELECT f.folder_id, f.title, qtf.query_to_folder_id FROM folders f LEFT JOIN user_to_folder utf ON utf.folder_id = f.folder_id LEFT JOIN query_to_folder qtf ON qtf.folder_id = f.folder_id WHERE utf.user_id = ? AND qtf.query_id = ?";
				$query['folders'] = $GLOBALS['DB']->GetAll($sql, array($this->user_id, $query['query_id']));
				
				$sql = "SELECT subscription_type_id FROM subscriptions WHERE user_id = ? AND query_id = ?";
				$query['subscription_type_id'] = $GLOBALS['DB']->GetOne($sql, array($this->user_id, $query['query_id']));
				
				if ($query['subscription_type_id'] < 1)
					$query['subscription_type_id'] = 0;
					
				$return[] = $query;
			}
			//print_r($return);
			
			return $return;
			
		}
		
		function unsubscribe_folder($folder_id)
		{
			$sql = "DELETE FROM user_to_folder WHERE user_id = ? AND folder_id = ?";
			$GLOBALS['DB']->Execute($sql, array($this->user_id, $folder_id));
			return true;
		}
		
		function subscribe($query_id)
		{
		
			$sql = "SELECT subscription_id FROM subscriptions WHERE query_id = ? and user_id = ?";
			$subscription_id = $GLOBALS['DB']->GetOne($sql, array($query_id, $this->user_id));
			$GLOBALS['DB']->ErrorMsg();
			if ($subscription_id < 1)
			{
				$sql = "INSERT INTO subscriptions (user_id, query_id, subscription_type_id) VALUES (?, ?, ?)";
				$GLOBALS['DB']->Execute($sql, array($this->user_id, $query_id, 0));
				$GLOBALS['DB']->ErrorMsg();
				$subscription_id = $GLOBALS['DB']->Insert_ID();
			}
			
			return $subscription_id;
		}
		
		/*function get_queries()
		{
			$sql = "SELECT query FROM query_to_folder qtf LEFT JOIN user_to_folder utf ON utf.folder_id = qtf.folder_id WHERE utf.user_id = ? ORDER BY query";
			$queries = $GLOBALS['DB']->GetAll($sql, array($this->user_id));
			
			for ($i = 0; $i < count($queries); $i++)
			{
				$query = $queries[$i]['query'];
				$query = stripslashes($query);
				$queries[$i]['query'] = $query;
			}
			
			return $queries;
		}*/

		function notify($tweet_id)
		{
			$sql = "INSERT INTO notifications (user_id, tweet_id) VALUES (?, ?)";
			$GLOBALS['DB']->Execute($sql, array($this->user_id, $tweet_id));
			return true;
		}

		function log_search($query_id)
		{	
			$Query = new Query($query_id);
			$max_tweet = $Query->get_max_tweet();
			
			$sql = "INSERT INTO searches (query_id, user_id, max_tweet_id) VALUES (?, ?, ?)";
			$GLOBALS['DB']->Execute($sql, array($query_id, $this->user_id, $max_tweet['tweet_id']));
		}
		
		function get_notification_count()
		{
			$sql = "SELECT count(*) FROM notifications n LEFT JOIN subscriptions s ON s.subscription_id = n.subscription_id WHERE s.user_id = ? AND n.date_sent IS NULL";
			$notification_count = $GLOBALS['DB']->GetOne($sql, array($this->user_id));
			
			return $notification_count;
		}
		
		function clear_pending_notifications()
		{
			$sql = "SELECT notification_id FROM notifications n LEFT JOIN subscriptions s ON s.subscription_id = n.subscription_id WHERE s.user_id = ?";
			$notifications = $GLOBALS['DB']->GetCol($sql, array($this->user_id));
			
			if(count($notifications) > 0)
			{
				$sql = "DELETE FROM notifications WHERE notification_id IN (".implode(", ", $notifications).")";
				$GLOBALS['DB']->Execute($sql);
			}
			
			return true;
		}
		
		function update_account($data)
		{
			if (isset($data['email']))
			{
				$sql = "UPDATE users SET email = ? WHERE user_id = ?";
				$GLOBALS['DB']->Execute($sql, array($data['email'], $this->user_id));
			}
			if (isset($data['jabber']))
			{
				$sql = "UPDATE users SET jabber = ? WHERE user_id = ?";
				$GLOBALS['DB']->Execute($sql, array($data['jabber'], $this->user_id));
			}
			if (isset($data['username']))
			{
				$sql = "UPDATE users SET username = ? WHERE user_id = ?";
				$GLOBALS['DB']->Execute($sql, array($data['username'], $this->user_id));
			}
		}
		
		
		
		function tweet_search($query_id, $min_id = null)
		{
			$update_queries = true;
			
			$Query = new Query($query_id);
			if ($update_queries == true)
			{	
				$Query->update_query();
			}
			
			$conditions = array(
				"limit" => 50
			);
			
			if ($min_id > 0)
				$conditions['min_id'] = $min_id;
				
			$tweets = $Query->get_tweets($conditions);
			
			$this->log_search($query_id);
			
			if (empty($tweets))
			{
				return array();
			}
			else
			{
				$query_data = $Query->get_query_data();
				
				$_SESSION['last_search'] = array(
					"query_id" => $query_id,
					//"query" => $query_data['query'],
					//"newest_tweet_id" => $tweets[0]
				);

				//Flip to make oldest first
				$tweets = array_reverse($tweets );
				return $tweets;
			}
			

		}
		
		function get_application($application_key)
		{
			//echo "SELECT data FROM installs WHERE user_id = {$this->user_id} AND application_key = {$application_key}";
			$sql = "SELECT data FROM installs WHERE user_id = ? AND application_key = ?";
			$data = $GLOBALS['DB']->GetOne($sql, array($this->user_id, $application_key));
			
			$data = json_decode($data);
						
			return $data;
		}
		
		function get_applications()
		{
			$sql = "SELECT application_id, application_key, data FROM installs WHERE user_id = ?";
			$rows = $GLOBALS['DB']->GetAll($sql, array($this->user_id));
			
			for ($i=0; $i < count($rows); $i++)
			{
				$rows[$i]['data'] = json_decode($rows[$i]['data']);
			}
			
			return $rows;
		}
		
		
		function application_add($application_id)
		{
			$data = array();
			switch($application_id)
			{
				case "1":
					$data['title'] 		= "Twitter";
					$data['api_url'] 	= "http://twitter.com";
					$data['username'] 	= null;
					$data['password'] 	= null;
					break;
				case "2":
					$data['title'] 		= "Identi.ca";
					$data['api_url'] 	= "http://identi.ca/api";
					$data['username'] 	= null;
					$data['password'] 	= null;
					break;
				case "3":
					$data['title'] 		= "Search.Twitter.com";
					break;
			}
			$application_key = MD5($this->user_id . $application_id . rand(0,10000000));
			$data = json_encode($data);
			$sql = "INSERT INTO installs (user_id, application_id, data, application_key) VALUES (?, ?, ?, ?)";
			$GLOBALS['DB']->Execute($sql, array($this->user_id, $application_id, $data, $application_key));
		}
		
		function application_remove($application_key)
		{
			$sql = "DELETE FROM installs WHERE user_id = ? AND application_key = ?";
			$GLOBALS['DB']->Execute($sql, array($this->user_id, $application_key));
		}
		
		function application_update($application_key, $new_data)
		{	
			/*$old_data = $this->get_application($application_key);
			
			foreach($new_data as $key => $val)
			{
				if (!empty($val) || $val = "undefined")
					$old_data->$key = $val;
			}*/
			$data = json_encode($new_data);
			
			$sql = "UPDATE installs SET data = ? WHERE user_id = ? AND application_key = ?";
			$GLOBALS['DB']->Execute($sql, array($data, $this->user_id, $application_key));
		}
	}

?>