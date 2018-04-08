<?

	class Notification
	{
		function __construct($notification_id)
		{
			$this->notification_id = $notification_id;
		}
		
		function deliver()
		{
				$sql = "SELECT notification_id FROM notifications n LEFT JOIN tweets t ON n.tweet_id = t.tweet_id LEFT JOIN subscriptions s ON s.subscription_id = n.subscription_id WHERE s.subscription_type_id IN (0,1,2) AND date_sent IS NULL ORDER BY t.date_published DESC";
			$notification_info = $GLOBALS['DB']->GetRow($sql, array($this->notification_id));
			
			$User = new User($notification_info['user_id']);
			$account_info = $User->get_account_info();
			
			$Tweet = new Tweet($notification_info['tweet_id']);
			$tweet_data = $Tweet->get_info();
			
			parse_str($notification_info['query'], $query);
				
			switch($notification_info['subscription_type_id'])
			{	
				case "0":
					//Do nothing.
					break;
					
				case "1":
				
					$subject = "Tweenky Track for '{$query['query']}'";
					$message = "<p><b>".$tweet_data['username']." said</b>: ".$tweet_data['tweet']."</p><hr />";
					$sql = "INSERT INTO email_queue (user_id, subject, email, consolidate) VALUES (?, ?, ?, 1)";
					$GLOBALS['DB']->Execute($sql, array($notification_info['user_id'], $subject, $message));
					break;
					
				case "2":
					$conn = new XMPPHP_XMPP('talk.google.com', 5222, 'tracker', 'tweenky007', 'xmpphp', 'tweenky.com', $printlog=true, $loglevel=XMPPHP_Log::LEVEL_INFO);

					try {
					    $conn->connect();
					    $conn->processUntil('session_start');
					    $conn->presence();
					    $conn->autoSubscribe();
					    $conn->message($account_info['jabber'], "[{$query['query']}] ".$tweet_data['username']." said: ".$tweet_data['tweet'], 'chat', 'test');
					    $conn->disconnect();
					} catch(XMPPHP_Exception $e) {
					    die($e->getMessage());
					}
					
					break;
			}
			
			$sql = "UPDATE notifications SET date_sent = NOW() WHERE notification_id = ?";
			$GLOBALS['DB']->Execute($sql, array($this->notification_id));
			
		}
	}


?>