<?
	set_time_limit(7);

	require_once("../config.php");

	session_start();

	switch($_REQUEST['a'])
	{
		
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