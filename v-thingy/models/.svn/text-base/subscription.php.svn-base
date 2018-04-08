<?

	class Subscription
	{
	
		function __construct($subscription_id)
		{
			$this->subscription_id = $subscription_id;
		}
		
		
		function add_notification($tweet_id)
		{
			$sql = "SELECT subscription_type_id FROM subscriptions s WHERE subscription_id = ?";
			$subscription_type_id = $GLOBALS['DB']->GetOne($sql, array($this->subscription_id));
			switch($subscription_type_id)
			{
				case "1":
				case "2":
					$sql = "SELECT notification_id FROM notifications WHERE subscription_id = ? AND tweet_id = ?";
					$notification_id = $GLOBALS['DB']->GetOne($sql, array($this->subscription_id, $tweet_id));

					if ($notification_id < 1)
					{
						$sql = "INSERT INTO notifications (subscription_id, tweet_id) VALUES (?, ?)";
						$GLOBALS['DB']->Execute($sql, array($this->subscription_id, $tweet_id));

						$notificationd_id = $GLOBALS['DB']->Insert_ID();
					}

					return $notification_id;
					break;
				
			}
			
			return false;
		}
		
		
		
		function update($subscription_type_id)
		{
			switch($subscription_type_id)
			{
				case "0":
				case "1":
				case "2":
					$sql = "UPDATE subscriptions SET subscription_type_id = ? WHERE subscription_id = ?";
					$GLOBALS['DB']->Execute($sql, array($subscription_type_id, $this->subscription_id));
					echo $GLOBALS['DB']->ErrorMsg();
					break;
			}
		}
		
		
		
		
		
		
		/* old */
		function toggle_track_by_email()
		{
			$sql = "SELECT send_email FROM subscriptions WHERE subscription_id = ?";
			$send_email = $GLOBALS['DB']->GetOne($sql, array($this->subscription_id));

			if ($send_email == '0')
				$new_send_email = '1';
			else
				$new_send_email = '0';
				
			$sql = "UPDATE subscriptions SET send_email = ? WHERE subscription_id = ?";
			$GLOBALS['DB']->Execute($sql, array($new_send_email, $this->subscription_id));
			//echo "UPDATE subscriptions SET send_email = {$new_send_email} WHERE subscription_id = {$this->subscription_id} - " . $GLOBALS['DB']->ErrorMsg();
			return true;
		}
	
		function toggle_track_by_sms()
		{
			$sql = "SELECT send_sms FROM subscriptions WHERE subscription_id = ?";
			$send_sms = $GLOBALS['DB']->GetOne($sql, array($this->subscription_id));

			if ($send_sms == '0')
				$new_send_sms = '1';
			else
				$new_send_sms = '0';
				
			$sql = "UPDATE subscriptions SET send_sms = ? WHERE subscription_id = ?";
			$GLOBALS['DB']->Execute($sql, array($new_send_sms, $this->subscription_id));
			//echo "UPDATE subscriptions SET send_email = {$new_send_email} WHERE subscription_id = {$this->subscription_id} - " . $GLOBALS['DB']->ErrorMsg();
			return true;
		}

		function get_subscription_data()
		{
			$sql = "SELECT s.subscription_id, s.query_id, s.send_email, s.send_sms, q.query FROM subscriptions s LEFT JOIN queries q ON q.query_id = s.query_id WHERE subscription_id = ?";
			$row = $GLOBALS['DB']->GetRow($sql, array($this->subscription_id));
			return $row;
		}
		
		function get_feed_items()
		{
			$Utility = new Utility();
			
			$sql = "SELECT source_id, tweet, external_id, author_name, author_username, author_url, image_url, date_published FROM tweets t LEFT JOIN subscriptions s ON s.query_id = t.query_id WHERE subscription_id = ? ORDER BY date_published DESC LIMIT 100";
			$items = $GLOBALS['DB']->GetAll($sql, array($this->subscription_id));
	
			for($i=0; $i < count($items); $i++)
			{
				$items[$i]['published_ago'] = $Utility->ago($items[$i]['date_published']);
				switch($items[$i]['source_id'])
				{
					case 1:
						$items[$i]['link_url'] = "http://www.twitter.com/{$items[$i]['author_username']}/statuses/{$items[$i]['external_id']}";
						$items[$i]['external_url'] = "http://www.twitter.com/{$items[$i]['author_username']}/";
						break;
				}
			}
			
			return $items;
		}
		
	}

?>