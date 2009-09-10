<?

	require_once('../twitteroauth/twitterOAuth.php');

	session_start();

	if ($_SERVER['HTTP_HOST'] == "ddev.tweenky.com")
	{
		define("TWITTER_OAUTH_CONSUMER_KEY", 	"sdfbrekuerguigb43k4jb");
		define("TWITTER_OAUTH_CONSUMER_SECRET", "GPSiu7pGYWcLCfKnfwf443f4WwFTP9Mb28Xe9uHcs");
	}
	elseif ($_SERVER['HTTP_HOST'] == "new.tweenky.com")
	{
		define("TWITTER_OAUTH_CONSUMER_KEY", 	"RgsKsF20AmGfaaBggg4fr");
		define("TWITTER_OAUTH_CONSUMER_SECRET", "53EusUfNkMJKjfc9De1UKN0frfs33cUp8hqrLZ1VE");
	}
	


?>
