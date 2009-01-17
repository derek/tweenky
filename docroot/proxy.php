<?
		require ("../config.php");

		session_start();
		
		$clean 	= array_merge($_POST);
		
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
			$clean['status'] = urlencode(stripslashes(urldecode($clean['status'])));
		}
		
		$url 	= $clean['url'];
		
		unset($clean['url']);
		unset($clean['callback']);
		
		$fields = $clean;
		unset($fields['ak']);
		
		
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 				$url );       
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,	1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:')); 
		
		if ($_SERVER['REQUEST_METHOD'] == "POST")
		{
			$fields['source'] = "Tweenky";
			
			curl_setopt($ch, CURLOPT_POST, 				1 );
			curl_setopt($ch, CURLOPT_POSTFIELDS, 		$fields );
		}

		if (isset($username))
			curl_setopt($ch, CURLOPT_USERPWD,			$username.":".$password);
		
		$response =  curl_exec( $ch );
		//echo curl_error($ch);
		curl_close($ch);
		
		$return['params'] 	= $clean;
		$return['response'] = json_decode($response);

		echo json_encode($return);

?>