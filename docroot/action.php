<?
	set_time_limit(7);

	require_once("../config.php");

	session_start();

	switch($_REQUEST['a'])
	{
		
		//decode tinyurl
		case "55":
		
		
		$url = $_REQUEST['url'];
		$url = explode('.com/', $url);
		$url = 'http://preview.tinyurl.com/'.$url[1];
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url );       
			curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
			curl_setopt($ch, CURLOPT_POST, 1 );
			curl_setopt($ch, CURLOPT_POSTFIELDS, $params );

			if (!empty($_SESSION['username']))	
				curl_setopt($ch, CURLOPT_USERPWD, $_SESSION['username'].":".$_SESSION['password']);

			$response = curl_exec( $ch );
			curl_close($ch);
			preg_match('/redirecturl" href="(.*)">/',$response,$matches);
			echo json_encode(array(
				"url" => $_REQUEST['url'],
				"decoded" => $matches[1]
			));
			die();
		
			break;
		
		
		case "73": //shorten url
			$link 	= $_POST['url'];
			switch($_POST['service'])
			{
				case "is.gd":
					$url 	= "http://is.gd/api.php?longurl={$link}";
					break;
				case "snipurl":
					$url 	= "http://snipurl.com/site/snip?r=simple&link={$link}";
					break;
			}

			$ch = curl_init($url);
			curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
			$new_url = curl_exec($ch);

			echo $new_url;
			break;
			
		case "1000":
			$_SESSION['settings'] = null;
			$_SESSION['settings'] = json_decode(stripslashes($_POST['settings']));
			print_r($_SESSION);
			break;
		
		case "1010":
			echo json_encode(($_SESSION['settings']));
			//print_r($_SESSION);
			break;
	}		

	die();
?>