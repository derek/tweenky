<?


include ("../../config.php");

	$Utility = new Utility();

	$user_id = $Utility->add_user("derek", "drgath@gmail.com");
	
	$User = new User($user_id);
	
	$folders = $User->get_folders();
	print_r($folders);
?>