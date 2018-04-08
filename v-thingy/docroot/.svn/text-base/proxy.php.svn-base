<?
		require ("../config.php");

		session_start();

		//$_POST['ak'] = "9940fa843e6c9de23c4bce6e44e6ab3c";
		//$_POST['url'] = "http://army.twit.tv/api/statuses/friends_timeline.json?count=100&since_id=1";

		/*$session_id = session_id();

		$sql = "SELECT user_id FROM session_data WHERE session_id = ?";
		$user_id = $GLOBALS['DB']->GetOne($sql, array($session_id));

		if ($user_id < 1)
		{
			die("no auth");
		}
		$User = new User($user_id);
		*/
		$clean 	= array_merge($_GET, $_POST);
		
		foreach($_SESSION['settings'] as $s)
		{
			if ($s->application_key == $clean['ak'])
			{
				$settings = $s->settings;
			}
		}
		
		
		if (isset($clean['ak']) && isset($settings->username))
		{
			$username = $settings->username;
			$password = $settings->password;
		}
		
		if (isset($clean['status']))
		{
			$clean['status'] = htmlentities(stripslashes($clean['status']));
		}
		$url 	= $clean['url'];
		//$auth = $User->get_application($clean['ak']);
		unset($clean['url']);
		unset($clean['callback']);
		$fields = $clean;
		unset($fields['ak']);

		if (!empty($fields))
			$url = $url . "?" . http_build_query($fields);

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 				$url );       
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,	1);
		if ($_SERVER['REQUEST_METHOD'] == "POST")
		{
			$postfields['source'] = "Tweenky";
			
			curl_setopt($ch, CURLOPT_POST, 				1 );
			curl_setopt($ch, CURLOPT_POSTFIELDS, 		$postfields );
		}
		if (isset($username))
			curl_setopt($ch, CURLOPT_USERPWD,			$username.":".$password);
		$response =  curl_exec( $ch );
		echo curl_error($ch);
		curl_close($ch);
		
		$a['params'] = $clean;
		$a['response'] = json_decode($response);

		echo json_encode($a);

?>