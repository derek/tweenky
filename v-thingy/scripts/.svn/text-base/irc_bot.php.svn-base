#!/usr/bin/php5
<?php



	$base_dir = realpath(dirname($_SERVER['SCRIPT_FILENAME'])."/../");
	require ($base_dir."/config.php");


	// define your variables
	$host = "irc.freenode.net";
	$port=6667;
	$nick="tweenky";
	$ident="tweenky";
	$chan="#hghghghg";
	$readbuffer="";
	$realname = "Tweenky";
	$fp = fsockopen($host, $port, $erno, $errstr, 30);
	

	while(1)
	{	
		sleep(10);
		echo "go\n";
		$sql = "SELECT notification_id FROM notifications n LEFT JOIN tweets t ON n.tweet_id = t.tweet_id LEFT JOIN subscriptions s ON s.subscription_id = n.subscription_id WHERE s.subscription_type_id IN (3) AND date_sent IS NULL ORDER BY t.date_published DESC";

		$notifications = $GLOBALS['DB']->GetCol($sql);

		foreach ($notifications as $notification_id)
		{
			$sql = "SELECT q.query, s.subscription_type_id, n.tweet_id, s.user_id FROM subscriptions s LEFT JOIN notifications n ON n.subscription_id = s.subscription_id LEFT JOIN queries q ON q.query_id = s.query_id WHERE n.notification_id = ?";
			$notification_info = $GLOBALS['DB']->GetRow($sql, array($notification_id));

			$User = new User($notification_info['user_id']);
			$account_info = $User->get_account_info();
		
			$Tweet = new Tweet($notification_info['tweet_id']);
			$tweet_data = $Tweet->get_info();
		
			parse_str($notification_info['query'], $query);
			
			// print the error if ther eis no connection
			if (!$fp) {
			    echo $errstr." (".$errno.")<br />\n";
			} else {
			    // write data through the socket to join the channel
			    fwrite($fp, "NICK ".$nick."\r\n");
			    fwrite($fp, "USER ".$ident." ".$host." bla :".$realname."\r\n");
			    fwrite($fp, "JOIN :".$chan."\r\n");

			    // write data through the socket to print text to the channel
			    fwrite($fp, "PRIVMSG ".$chan." :".$tweet_data['username']." said on Twitter: ".$tweet_data['tweet']."!\r\n");

			    // loop through each line to look for ping
			    /*while (!feof($fp)) {

			        $line =  fgets($fp, 128);
			        echo $line."\n";

			        //$line = explode(":ping ", $line);

			        //echo $line[0]."\n";

			        if ($line[1]) {

			            fwrite($fp, "PONG ".$line[1]."\r\n"); 
			        }

			    }*/
			}
		
			$sql = "UPDATE notifications SET date_sent = NOW() WHERE notification_id = ?";
			$GLOBALS['DB']->Execute($sql, array($notification_id));
		}
	}
	
	

    fclose($fp);

?>