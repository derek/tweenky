<?
	class Query
	{
		function __construct($query_id)
		{
			$this->query_id = $query_id;
		}
		
		function get_query_data()
		{
			$sql = "SELECT query_id, query, date_updated FROM queries WHERE query_id = ?";
			$data = $GLOBALS['DB']->GetRow($sql, array($this->query_id));
			
			parse_str($data['query'], $parsed);
			/*
			if (count($parsed) < 2)
			{
				$str = http_build_query(array(
					"query" => $data['query'],
					"service_id" => 1
				));
				$sql = "UPDATE queries SET query = ? WHERE query_id = ?";
				$GLOBALS['DB']->Execute($sql, array($str, $data['query_id']));
				
				$sql = "SELECT query_id, query, date_updated FROM queries WHERE query_id = ?";
				$data = $GLOBALS['DB']->GetRow($sql, array($this->query_id));
				parse_str($data['query'], $parsed);
			}
	//		print_r($parsed);*/
			unset($data['query']);
			$return = array_merge($data, $parsed);
			
			return $return;
		}
	
		function update_query()
		{
			$Utility = new Utility();
			$tweet_page = array();
			$mark_as_updated = false;
			
			$User = new User($_SESSION['user_id']);
			$app_data = $User->get_applications();

			foreach($app_data as $data)
			{
				if ($data['application_id'] == 1)
				{
					$twitter_data = $data['data'];
				}
				elseif ($data['application_id'] == 2)
				{
					$identica_data = $data['data'];
				}
			}
			
			
			
			$params = $this->get_query_data();
			
			if (!isset($params['service_id']))
			{
				$params['service_id'] = 1;
			}
			
			
			if ($params['service_id'] == 1 )
			{
				if (isset($params['timeline']))
				{
					switch($params['timeline'])
					{	
						case "archive":
						case "replies":
							if (strtolower($params['username']) == strtolower($_SESSION['twitter']['username']))
							{
								$source_id 	= 1;
							}
							else
							{
								$source_id = 2;
							}
							break;
						case "friends":
						case "public":
							$source_id 	= 1;
							break;
					}
			
				}
				elseif (isset($params['query']))
				{
					$source_id = 2;
				}			
			}
			else
			{	
				$source_id = 3;
			}
			
			if ($source_id == 1)
			{
				$Twitter = new Twitter($twitter_data->username, $twitter_data->password);
				$rate_status = $Twitter->getRateLimit("json");
				$rate_status = json_decode($rate_status);

				if (isset($rate_status->remaining_hits) && ($rate_status->remaining_hits > 0 || $rate_status->reset_time_in_seconds < mktime()))
				{
					//print_r($rate_status);
					$seconds_till_reset = $rate_status->reset_time_in_seconds - mktime();
					$seconds_between_hits  = $seconds_till_reset / $rate_status->remaining_hits;
					$seconds_since_late_check = mktime() - strtotime($params['date_updated']);

					//echo "is $seconds_since_late_check > $seconds_between_hits ?";
					if ($seconds_since_late_check > $seconds_between_hits)
					{
						$max_tweet = $this->get_max_tweet(1);

						//echo "d";
						//echo $rate_status->remaining_hits;
						for($page = 1; $page < 2; $page++)
						{
							switch($params['timeline'])
							{
								case "public":
									$response = $Twitter->getPublicTimeline("xml", $max_tweet['external_id']);
									break;
									
								case "friends":
									$response = $Twitter->getFriendsTimeline("xml", $params['username'], $max_tweet['external_id'], $page);
									break;
									
								case "replies":
									$response = $Twitter->getReplies("xml");
									break;
								
								case "archive":
									$response = $Twitter->getUserTimeline("xml", $params['username'], $max_tweet['external_id']);
									break;
							}
							//echo $response;
							//echo $Twitter->last_api_call;
							//echo "hitting twitter";
							//echo "reponse:".print_r($response, true);
							$tweet_page[$page] = new SimpleXMLElement($response);
							$mark_as_updated = true;

							$Utility->log_api_request($Twitter->last_api_call, $response);
						}
						//print_r($tweets);
					}
					else
					{
						//echo "too fast!";
					}
				}
				else
				{
					//Either twitter is down or there are no more requests available
				}

				foreach ($tweet_page as $page)
				{
					foreach ($page->status as $tweet)
					{
						//$tweets = $tweets->status;
						if (!empty($tweet->text))
						{
							$items[] = array(
								"source_id" 			=> 1,
								"external_id" 			=> (string)$tweet->id,
								"posting_app" 			=> (string)$tweet->source,
								"in_reply_to_status_id"	=> (string)$tweet->in_reply_to_status_id,
								"in_reply_to_user_id" 	=> (string)$tweet->in_reply_to_user_id,
								"tweet" 				=> (string)$tweet->text, 
								"date_published" 		=> (string)strtotime($tweet->created_at),
								"visible"				=> "1",
							);

							$profiles[(string)$tweet->id] = array(
								"service_id"		=> $params['service_id'],
								"username"			=> (string)$tweet->user->screen_name,
								"name"				=> (string)$tweet->user->name,
								"image_url"			=> (string)$tweet->user->profile_image_url,
								"website_url"		=> (string)$tweet->user->url,
							);
						}
						else
						{
							$items = array();
						}
					}
				}
			}
			
			else if ($source_id == 2)
			{
				$seconds_between_hits  = SUMMIZE_INTERVAL;
				$seconds_since_late_check = mktime() - strtotime($params['date_updated']);
				//echo "is $seconds_since_late_check > $seconds_between_hits?";
				if ($seconds_since_late_check >= $seconds_between_hits)
				//if (1)
				{	
					parse_str(urldecode($params['query']), $data);
					$query = $data['query'];
					
					if (empty($query))
					{
						$query = $params['query'];
					}
					
					$max_tweet = $this->get_max_tweet(2);

					$url = "http://search.twitter.com/search.atom?lang=all&rpp=50&since_id={$max_tweet['external_id']}&q=".urlencode($query);

					$feed_data = $this->get_data_from_url($url);
					
					$Utility->log_api_request($url, print_r($feed_data, true));

					$mark_as_updated = true;

					$tweets = $feed_data->items;
					//print_r($feed_data);
					foreach($tweets as $tweet)
					{
						preg_match('([0-9]{9})', $tweet['link'], $matches);

						$tweet_id = $matches[count($matches)-1];

						$tmp = explode(' ', $tweet['author_name']);
						$username = substr($tweet['author_name'], 0, strpos($tweet['author_name'], " "));
						$name = substr($tweet['author_name'], strlen($username)+2, strlen($tweet['author_name'])-strlen($username)-3);

						$items[] = array(
							"source_id" 		=> 2,
							"external_id" 		=> $tweet_id,
							"posting_app" 		=> NULL,
							"in_reply_to_status_id"	=> null,
							"in_reply_to_user_id" 	=> null,
							"tweet" 			=> $tweet['title'], 
							"date_published" 	=> strtotime($tweet['published']),
							"visible"			=> "1",
						);

						$profiles[$tweet_id] = array(
							"service_id"		=> $params['service_id'],
							"username"			=> $username,
							"name"				=> $name,
							"image_url"			=> $tweet['link_image']
						);
					}
				}
			}	
		
			//Identica
			elseif ($source_id == 3)
			{
				$Identica = new Identica($identica_data->username, $identica_data->password);
				$seconds_between_hits  = IDENTICA_INTERVAL;
				$seconds_since_late_check = mktime() - strtotime($params['date_updated']);
				//echo "is $seconds_since_late_check > $seconds_between_hits?";
				if ($seconds_since_late_check >= $seconds_between_hits)
				//if (1)
				{
					
					$mark_as_updated = true;
					if (!isset($params['timeline']) && strstr($params['query'], "from:"))
					{
						
						$params['timeline'] = "archive";
						$params['username'] = str_replace("from:", "", $params['query']);
						unset($params['query']);
					}
					
					switch($params['timeline'])
					{
						case "public":
							$response = $Identica->getPublicTimeline("xml", $max_tweet['external_id']);
							break;
							
						case "friends":
							$response = $Identica->getFriendsTimeline("xml");
							break;
							
						case "replies":
							$response = $Identica->getReplies("xml");
							break;
						
						case "archive":
							$response = $Identica->getUserTimeline("xml", $params['username'], $max_tweet['external_id']);
							break;
					}
					
					
					if (isset($response))
					{
						$tweet_page[0] = new SimpleXMLElement($response);
						foreach ($tweet_page as $page)
						{
							foreach ($page->status as $tweet)
							{
								//$tweets = $tweets->status;
								if (!empty($tweet->text))
								{
									$items[] = array(
										"source_id" 			=> 3,
										"external_id" 			=> (string)$tweet->id,
										"posting_app" 			=> (string)$tweet->source,
										"in_reply_to_status_id"	=> (string)$tweet->in_reply_to_status_id,
										"in_reply_to_user_id" 	=> (string)$tweet->in_reply_to_user_id,
										"tweet" 				=> (string)$tweet->text, 
										"date_published" 		=> (string)strtotime($tweet->created_at),
										"visible"				=> "1",
									);

									$profiles[(string)$tweet->id] = array(
										"service_id"		=> $params['service_id'],
										"username"			=> (string)$tweet->user->screen_name,
										"name"				=> (string)$tweet->user->name,
										"image_url"			=> (string)$tweet->user->profile_image_url,
										"website_url"		=> (string)$tweet->user->url,
									);
								}
								else
								{
									$items = array();
								}
							}
						}
					}
					else
					{
						switch($params['timeline'])
						{
							/*case "archive":
								$url = "http://identi.ca/{$params['username']}/rss";
								break;
							case "friends":
								$url = "http://identi.ca/{$params['username']}/all/rss";
								break;
							case "replies":
								$url = "http://identi.ca/{$params['username']}/replies/rss";
								break;
							case "public":
								$url = "http://identi.ca/rss";
								break;*/
							default:
								$url = "http://identi.ca/search/notice/rss?q=".urlencode(stripslashes($params['query']));
								break;
						}
				
						// Parse it
						$feed = new SimplePie();
						$feed->set_feed_url($url);
						$feed->enable_cache(false);
						$feed->init();
						$feed->handle_content_type();
				
						$Utility->log_api_request($url, "SimplePie Object");

						$tweets = $feed->get_items();
				
						foreach($tweets as $tweet)
						{
							//print_r($tweet);
							preg_match('([0-9]{1,})', $tweet->get_id(), $matches);

							$tweet_id = $matches[count($matches)-1];
							$username = substr($tweet->get_title(), 0, strpos($tweet->get_title(), ":"));
					
							$text = str_replace($username.": ", "", $tweet->get_title());
							$tmp = $tweet->get_item_tags("http://rdfs.org/sioc/ns#", "has_creator");
							$profile_url = $tmp[0]['attribs']['http://www.w3.org/1999/02/22-rdf-syntax-ns#']['resource'];
					
							preg_match('([0-9]{1,})', $profile_url, $matches);
							$profile_external_id = $matches[0];
					
							$tmp = $tweet->get_item_tags("http://laconi.ca/ont/", "postIcon");
							$image_url = $tmp[0]['attribs']['http://www.w3.org/1999/02/22-rdf-syntax-ns#']['resource'];
							//$name = substr($tweet['author_name'], strlen($username)+2, strlen($tweet['author_name'])-strlen($username)-3);

							$items[] = array(
								"source_id" 			=> 3,
								"external_id" 			=> $tweet_id,
								"posting_app" 			=> (string)$tweet->source,
								"in_reply_to_status_id"	=> (string)$tweet->in_reply_to_status_id,
								"in_reply_to_user_id" 	=> (string)$tweet->in_reply_to_user_id,
								"tweet" 				=> $text, 
								"date_published" 		=> strtotime($tweet->get_date()),
								"visible"				=> "1",
							);
					
							$profiles[$tweet_id] = array(
								"service_id"		=> $params['service_id'],
								"username"			=> $username,
								"external_id"		=> $profile_external_id,
								"name"				=> $tweet->get_author()->name,
								"image_url"			=> $image_url,
							);
						}					
					}
				}
			}
			
			if (!empty($items))
			{
				foreach($items as $item)
				{
					$profile_data 		= $profiles[$item['external_id']];
					$item['profile_id'] = $Utility->get_profile_id_by_username($profile_data['service_id'], $profile_data['username']);
					
					$Profile = new Profile($item['profile_id']);
					
					$Profile->Update($profile_data);
					
					//Get the ID or insert it
					$tweet_id = $this->add_tweet($item);
				}
			}		
				
			if ($mark_as_updated == true)
			{
				$this->log_as_checked();
			}

			
			return count($items);
		}

		function add_tweet($item_data)
		{
			$sql = "SELECT tweet_id FROM tweets t WHERE t.source_id = ? AND t.external_id = ?";
			$tweet_id = $GLOBALS['DB']->GetOne($sql, array($item_data['source_id'], $item_data['external_id']));

			if ($tweet_id < 1)
			{
			
				$data = array(
					$item_data['source_id'],
					$item_data['external_id'],
					$item_data['profile_id'],
					$item_data['in_reply_to_status_id'],
					$item_data['in_reply_to_user_id'],
					$item_data['posting_app'],
					$item_data['tweet'],
					$item_data['date_published'],
					$item_data['visible'],
				);

				$sql = "INSERT INTO tweets (source_id, external_id, profile_id, in_reply_to_status_id, in_reply_to_user_id, posting_app, tweet, date_published, visible) 
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
				$GLOBALS['DB']->Execute($sql, $data);
				
				$tweet_id = $GLOBALS['DB']->Insert_ID();
			
				if ($tweet_id < 1)
				{
					tweenky_debug("[Tweenky] Tweet Insert Error", "Failed to insert Tweet_id ". $tweet_id ."\n\nDB Error: " . $GLOBALS['DB']->ErrorMsg() . "\n\nTweet: ". print_r($data, true));		
				}
				else
				{
					$Tweet = new Tweet($tweet_id);

					$this->associate_to_tweet($tweet_id);
					
					$Tweet->notify_subscribers();
				}
			}
			else
			{
				$this->associate_to_tweet($tweet_id);
			}	
			
	
			return $tweet_id;
	
		}

		function get_max_tweet($source_id = null)
		{
			if ($source_id > 0)
				$where_source_id = " AND t.source_id = {$source_id} ";
				
			$sql = "SELECT t.tweet_id, t.external_id, t.source_id FROM tweets t LEFT JOIN tweet_to_query ttq ON t.tweet_id = ttq.tweet_id WHERE ttq.query_id = ? {$where_source_id} ORDER BY t.date_published DESC";
		 	$max_external_id = $GLOBALS['DB']->GetRow($sql, array($this->query_id));
			if ($max_external_id['tweet_id'] < 1)
				$max_external_id['tweet_id'] = 0;
			return $max_external_id;
		}
		

		function get_tweets($conditions = array())
		{
			$wheres[] = "ttq.query_id = {$this->query_id}";
			$wheres[] = "t.visible = 1";
			
			$limit = null;
			
			if (isset($conditions['min_id']))
			{
				$wheres[] = "t.date_published > (SELECT date_published FROM tweets WHERE tweet_id = {$conditions['min_id']})";
			}
			if (isset($conditions['limit']))
			{
				$limit = " LIMIT {$conditions['limit']} ";
			}
			$where = implode(" AND ", $wheres);
			
			//echo "SELECT $this->query_id t.tweet_id FROM tweet_to_query ttq LEFT JOIN tweets t ON t.tweet_id = ttq.tweet_id WHERE {$where} ORDER BY t.date_published DESC LIMIT 50";
			//echo "SELECT t.tweet_id FROM tweet_to_query ttq LEFT JOIN tweets t ON t.tweet_id = ttq.tweet_id WHERE {$where} ORDER BY t.date_published DESC LIMIT 50";
			$sql = "SELECT t.tweet_id FROM tweet_to_query ttq LEFT JOIN tweets t ON t.tweet_id = ttq.tweet_id WHERE {$where} ORDER BY t.date_published DESC {$limit}";
			//echo "<br />";
			
			$tweets = $GLOBALS['DB']->GetCol($sql);
			return $tweets;
		}
		
		
		function associate_to_tweet($tweet_id)
		{
			$sql = "SELECT tweet_to_query_id FROM tweet_to_query WHERE tweet_id = ? AND query_id = ?";
			$tweet_to_query_id = $GLOBALS['DB']->GetOne($sql, array($tweet_id, $this->query_id));
		
			if ($tweet_to_query_id < 1)
			{
				$sql = "INSERT INTO tweet_to_query (tweet_id, query_id) VALUES (?, ?)";
				$GLOBALS['DB']->Execute($sql, array($tweet_id, $this->query_id));
			
				$tweet_to_query_id = $GLOBALS['DB']->Insert_ID();
			}
			
			return $tweet_to_query_id;
		}
		
		function log_as_checked()
		{
			$sql = "UPDATE queries SET date_updated = NOW() WHERE query_id = ?";
			$GLOBALS['DB']->Execute($sql, array($this->query_id));
		}

		function get_data_from_url($url)
		{	
			$rss = fetch_rss($url);

			return $rss;
		}
	}


?>