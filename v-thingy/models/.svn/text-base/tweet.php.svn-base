<?
	
	class Tweet
	{
		function __construct($tweet_id)
		{
			$this->tweet_id = $tweet_id;
		}
		
		function get_info()
		{
			$Utility = new Utility();
			
			$sql = "SELECT t.tweet_id, t.source_id, t.posting_app, ttq.query_id, t.tweet, t.external_id, p.name, p.username, p.website_url, p.image_url, t.date_published FROM tweets t LEFT JOIN profiles p ON p.profile_id = t.profile_id LEFT JOIN tweet_to_query ttq ON ttq.tweet_id = t.tweet_id WHERE t.tweet_id = ?";
			$tweet = $GLOBALS['DB']->GetRow($sql, array($this->tweet_id));
			switch($tweet['source_id'])
			{
				case 1:
				case 2:
					$tweet['service']		= "Twitter";
					$tweet['service_id']	= 1;
					$tweet['link_url'] 		= "http://www.twitter.com/{$tweet['username']}/statuses/{$tweet['external_id']}";
					$tweet['external_url'] 	= "http://www.twitter.com/{$tweet['username']}/";
					//$tweet['tweet_html'] 	= ($tweet['tweet']);
					//$tweet['tweet_html'] = ereg_replace("[[:alpha:]]+://[^<>[:space:]]+[[:alnum:]/]", "<a href=\"\\0\" target='_blank'>\\0</a>", $tweet['tweet_html']);
					//$tweet['tweet_html'] = preg_replace("/@([a-zA-Z0-9_]+)/", '@<a title=\'from:$1\' class=\'query\'>$1</a>', $tweet['tweet_html']);
					break;
				case 3:
					$tweet['service']		= "Identi.ca";
					$tweet['service_id']	= 2;
					$tweet['link_url'] 		= "http://identi.ca/notice/{$tweet['external_id']}";
					$tweet['external_url'] 	= "http://identi.ca/{$tweet['username']}/";
					break;
			}
			
			return $tweet;
		}

		function notify_subscribers()
		{
			//echo "SELECT subscription_id FROM subscriptions s LEFT JOIN queries q ON s.query_id = q.query_id LEFT JOIN tweet_to_query ttq ON ttq.query_id = q.query_id WHERE ttq.tweet_id = '{$this->tweet_id}'";
			$sql = "SELECT subscription_id FROM subscriptions s LEFT JOIN queries q ON s.query_id = q.query_id LEFT JOIN tweet_to_query ttq ON ttq.query_id = q.query_id WHERE ttq.tweet_id = ?";
			$subscriptions = $GLOBALS['DB']->GetCol($sql, array($this->tweet_id));
			
			if (!empty($subscriptions))
			{
				foreach($subscriptions as $subscription_id)
				{
					$Subscription = new Subscription($subscription_id);
					$Subscription->add_notification($this->tweet_id);
				}
			}
		}
	}


?>