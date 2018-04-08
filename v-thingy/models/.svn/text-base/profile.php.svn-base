<?

	class Profile
	{
		function __construct($profile_id)
		{
			$this->profile_id = $profile_id;
		}
		
		function add_as_user($invite_code_id = null)
		{
			$this->update();
				
			$Utility = new Utility();
			
			$sql = "SELECT user_id FROM profile_to_user WHERE profile_id = ?";
			$user_id = $GLOBALS['DB']->GetOne($sql, array($this->profile_id));
			
			if ($user_id < 1)
			{	
				
				$sql = "INSERT INTO whitelist (twitter_username) SELECT username FROM profiles WHERE profile_id = ?";
				$GLOBALS['DB']->Execute($sql, array($this->profile_id));

				$sql = "INSERT INTO users (email, invite_code_id) VALUES (?, ?)";
				$GLOBALS['DB']->Execute($sql, array($email, $invite_code_id));

				$user_id = $GLOBALS['DB']->Insert_ID();

				$User = new User($user_id);
				$User->attach_profile($this->profile_id);

				$folder_id = $User->create_folder("Quick Links");

				$Tweenky_folder = new Folder($User->create_folder("Tweenky"));
				$Tweenky_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:derek"));
				$Tweenky_folder->add_query($Utility->query_to_query_id("service_id=1&query=tweenky"));
				$Tweenky_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:tweenky"));


				$Tech_folder = new Folder($User->create_folder("Tech"));
				$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:marshallk"));
				$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:scobleizer"));
				$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:techcrunch"));
				$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:techmeme"));
				$Tech_folder->add_query($Utility->query_to_query_id("service_id=1&query=from:orli"));
			}

			return $user_id;
			
		}
		
		function update($data = array())
		{
			if (count($data) > 0)
			{
				$sql = "UPDATE profiles SET ";
				$delimiter = '';
				foreach($data as $key => $value)
				{
					$sql .= $delimeter . $key . " = ? ";
					$update_data[] = $value;
					$delimeter = ", ";
				}
				$sql .= " WHERE profile_id = {$this->profile_id}";
				$GLOBALS['DB']->Execute($sql, $update_data);
			}
			else
			{
				$sql = "SELECT service_id, username, external_id FROM profiles WHERE profile_id = ?";
				$profile = $GLOBALS['DB']->GetRow($sql, array($this->profile_id));
				
				switch($profile['service_id'])
				{
					case "1": //Twitter

						$Utility 	= new Utility();
						$Twitter = $Utility->get_twitter();
						
						if ($profile['external_id'] > 0)
							$identifier = $profile['external_id'];
						else
							$identifier = $profile['username'];
							
						$xml = $Twitter->showUser("xml", $identifier);
						$user_info = new SimpleXMLElement($xml); 
						
						$update_data = array(
							"external_id" 		=> (integer)$user_info->id,
							"name" 				=> (string)$user_info->name,
							"description" 		=> (string)$user_info->description,
							"location" 			=> (string)$user_info->location,
							"username" 			=> (string)$user_info->screen_name,
							"protected" 		=> (((string)$user_info->protected == "true")?"1":"0"),
							"followers_count" 	=> (integer)$user_info->followers_count,
							"friends_count" 	=> (integer)$user_info->friends_count,
							"statuses_count" 	=> (integer)$user_info->statuses_count,
						  	"image_url" 		=> (string)$user_info->profile_image_url,
							"website_url" 		=> (string)$user_info->url
						);
						foreach ($update_data as $key => $val)
						{
							if (!empty($val))
							{
								$sql = "UPDATE profiles p SET $key = ? WHERE profile_id = ?";
								$GLOBALS['DB']->Execute($sql, array($val, $this->profile_id));
							}
						}
						
						break;

					case "2": //Identi.ca
						$xml = file_get_contents("http://identi.ca/api/users/show/{$profile['username']}.xml");
						$user_info = new SimpleXMLElement($xml);
						
						
						$update_data = array(
							"external_id" 		=> (integer)$user_info->id,
							"name" 				=> (string)$user_info->name,
							"description" 		=> (string)$user_info->description,
							"location" 			=> (string)$user_info->location,
							"username" 			=> (string)$user_info->screen_name,
							"protected" 		=> (((string)$user_info->protected == "true")?"1":"0"),
							"followers_count" 	=> (integer)$user_info->followers_count,
							"friends_count" 	=> (integer)$user_info->friends_count,
							"statuses_count" 	=> (integer)$user_info->statuses_count,
						  	"image_url" 		=> (string)$user_info->profile_image_url,
							"website_url" 		=> (string)$user_info->url
						);
						
						foreach ($update_data as $key => $val)
						{
							if (!empty($val))
							{
								$sql = "UPDATE profiles p SET $key = ? WHERE profile_id = ?";
								$GLOBALS['DB']->Execute($sql, array($val, $this->profile_id));
							}
						}
						break;
				}
			}
		
			
			
			
			$sql = "UPDATE profiles SET date_updated = NOW() WHERE profile_id = ?";
			$GLOBALS['DB']->Execute($sql, array($this->profile_id));
		}
		
		function is_stale()
		{
			$sql = "SELECT 'true' FROM profiles WHERE profile_id = ? AND date_updated < DATE_SUB(CURDATE(),INTERVAL 1 DAY)";
			$up_to_date = $GLOBALS['DB']->GetOne($sql, array($profile_id));
			
			if ($up_to_date == 'true')
				return false;
			else
				return true;
		}
		
		function get_info()
		{
			$sql = "SELECT * FROM profiles WHERE profile_id = ?";
			$data = $GLOBALS['DB']->GetRow($sql, array($this->profile_id));
			
			switch($data['service_id'])
			{
				case "1":
					$data['external_url'] = "http://www.twitter.com/" . $data['username'];
					break;
				
				case "2":
					$data['external_url'] = "http://www.identi.ca/" . $data['username'];
					break;
			}
			return $data;
		}
	}