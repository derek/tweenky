<?

	require_once('../twitteroauth/twitterOAuth.php');

	session_start();

	if ($_SERVER['HTTP_HOST'] == "ddev.tweenky.com")
	{
		define("TWITTER_OAUTH_CONSUMER_KEY", 	"lPkmfsdV4B3d2bLcnkdlg");
		define("TWITTER_OAUTH_CONSUMER_SECRET", "GPSiu7pGYWcLCfKnSsROfFYrQWwFTP9Mb28Xe9uHcs");
	}
	elseif ($_SERVER['HTTP_HOST'] == "new.tweenky.com")
	{
		define("TWITTER_OAUTH_CONSUMER_KEY", 	"RgsKsF20AmGfaaB9SQX0Q");
		define("TWITTER_OAUTH_CONSUMER_SECRET", "53EusUfNkMJKjfc9De1UKN0ischApcUp8hqrLZ1VE");
	}
	


?>