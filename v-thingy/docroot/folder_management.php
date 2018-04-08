<?

	require_once "../config.php";

	session_start();

	$Utility = new Utility();

	$user_id = $_SESSION['user_id'];
	
	$User = new User($user_id);

	$user_folders = $User->get_folders();
	
	$subscriptions = $User->get_bookmarks();
	
	$notification_count = $User->get_notification_count();
	
	$account_info = $User->get_account_info();
	
?>

<html>
	<head>
 		<link rel="stylesheet" type="text/css" href="<?= BASE_URL . "css/main.css"?>" />
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js"></script>
		<script type="text/javascript" src="http://jqueryjs.googlecode.com/svn/trunk/plugins/corner/jquery.corner.js"></script>
		<script type="text/javascript" src="http://jqueryjs.googlecode.com/svn/trunk/plugins/selectboxes/jquery.selectboxes.js"></script>
		
		<script type="text/javascript" >
		
			$(document).ready(function() {
				$('.rounded').corner("5px");
			
				$(".section .title").bind("click", function(title){
					if (title.target.parentNode.parentNode.id != "query-detail")
					{
						 $(title.target).toggleClass('right-arrow').toggleClass('down-arrow');
						 $("#" + title.target.parentNode.id + " .innertube").toggle();
					}
				});
			});
			
			function toggle_subscription(query, folder_id)
			{
				/*folders = new String(folders);
				var tmp = folders.split(":");
				action = tmp[0];
				folder_id = tmp[2];
				return true;*/
				if (folder_id > 0)
				{
					$.post(
						"action.php",
						{"a" : 200, "query":query, "folder_id":folder_id},
						function(data){
						}
					);
				}
			}
			
			function delete_query(query, node)
			{
				if (confirm("Are you sure you wish to unsubscribe from '"+query+"' in all of your folders?"))
				{
					$.post(
						"action.php",
						{"a" : 201, "query":query},
						function(data){
							$(node.parentNode.parentNode).fadeOut();
						}
					);
					
				}
			}
			
			function unsubscribe_folder(title, folder_id, node)
			{
				if (confirm("Are you sure you wish to unsubscribe from '"+title+"'?"))
				{
					$.post(
						"action.php",
						{"a" : 202, "folder_id":folder_id},
						function(data){
							$(node.parentNode.parentNode).fadeOut();
						}
					);
				}
			}
			
			function edit_query_subscription(query, subscription_type_id)
			{
				if(subscription_type_id == 1)
				{
					email = $('#email').val();
					if (email.length < 1)
					{
						alert("Please enter your email address");
						$('#account .title').click();
						$("#email").focus();
						return false;
					}
				}
				
				if(subscription_type_id == 2)
				{
					jabber = $('#jabber').val();
					if (jabber.length < 1)
					{
						alert("Please enter your jabber address");
						$('#account .title').click();
						$("#jabber").focus();
						return false;
					}
				}
				
				$.post(
					"action.php",
					{"a" : 203, "query":query, "subscription_type_id":subscription_type_id},
					function(data){
					}
				);
			}
			
			function folder_privacy(folder_id, privacy_id)
			{
				$.post(
					"action.php",
					{"a" : 204, "privacy_id":privacy_id, "folder_id":folder_id},
					function(data){
					}
				);
				
			}
			
			function clear_notifications()
			{
				$.post(
					"action.php",
					{"a" : 208},
					function(data){
						$("#notification-count").html(data);
					}
				);
				
			}
			
			function update_account_info()
			{
				email = $('#email').val();
				jabber = $('#jabber').val();
				
				$.post(
					"action.php",
					{"a" : 209, "email":email, "jabber":jabber},
					function(data){
						$("#account-update-response").fadeIn().fadeOut("10000");
					}
				);
				
			}
		</script>
		
		<style type="text/css">
			.formRow { margin: 10px; text-align: left; width: 280px; }
			
		</style>
	</head>
	<body>
		<div style="text-align:left;">
			<div id="beta-info" class="rounded section hidden">
				<div class="title right-arrow"> Beta Information</div>
				<div class="innertube hidden">
					<div style="font-size:12px; color:red;">FYI: All of these functions should work, but the UI isn't very "responsive" yet.  More updates coming soon.</div>
				</div>
				<div class="clear-fix"></div>
			</div>
			<div id="twitter" class="rounded section" >
				<div class="title right-arrow"> Twitter </div>
				<div class="innertube hidden" style="width:100%; ">
					<div style="float:left;width:30%;text-align:left;" align="center">
						<div  >
							<div class="formRow">
								<label for="twitter-username">Username</label><br>
								<input type="text" id="twitter-username" name="twitter-username" value="<?= $_SESSION['twitter']['username'] ?>" /><br>
							</div>
							<div class="formRow">
								<label for="twitter_password">Password</label><br>
								<input type="text" id="twitter_password" name="twitter_password" value="*****" /><br>
							</div>	
							<div class="formRow">
								<input type="button" onclick="update_account_info()" value="Update account" /><br /><br /><span id="account-update-response" class="hidden" style="font-size:10px; color:red">Updated!</span>
							</div>
						</div>
					</div>
					<div style="clear:both;"></div>
				</div>
			</div>
			<div id="identica" class="rounded section" >
				<div class="title right-arrow"> Identi.ca </div>
				<div class="innertube hidden" style="width:100%; ">
					<div style="float:left;width:30%;text-align:left;" align="center">
						<div  >
							<div class="formRow">
								<label for="identica_username">Username</label><br>
								<input type="text" id="identica_username" name="identica_username" value="<?= $_SESSION['twitter']['username'] ?>" /><br>
							</div>
							<div class="formRow">
								<label for="identica_password">Password</label><br>
								<input type="password" id="identica_password" name="identica_password" value="*****" /><br>
							</div>	
							<div class="formRow">
								<input type="button" onclick="update_account_info()" value="Update account" /><br /><br /><span id="account-update-response" class="hidden" style="font-size:10px; color:red">Updated!</span>
							</div>
						</div>
					</div>
					<div style="clear:both;"></div>
				</div>
			</div>
			<div id="account" class="rounded section" >
				<div class="title right-arrow"> Account Information </div>
				<div class="innertube hidden" style="width:100%; ">
					<div style="float:left;width:30%;text-align:left;" align="center">
						<div  >
							<div class="formRow">
								<label for="email">Email-address:</label><br>
								<input type="text" id="email" name="email" value="<?= $account_info['email'] ?>" /><br>
							</div>
							<div class="formRow">
								<label for="jabber">Jabber/IM address:</label><br>
								<input type="text" id="jabber" name="jabber" value="<?= $account_info['jabber']?>" /><br>
							</div>	
							<div class="formRow">
								<input type="button" onclick="update_account_info()" value="Update account" /><br /><br /><span id="account-update-response" class="hidden" style="font-size:10px; color:red">Updated!</span>
							</div>
						</div>
					</div>
					<div style="float:left; width:50%;">
						<p>Please note that notifications are very experimental at this point. Make use of the clear notifications button below if you subscribe to a high volume query and need to clear your queue. Also, be sure to add tracker@tweenky.com to your jabber contacts if receiving IM updates, because otherwise you won't receive them.</p>
						<p>You currently have <span id="notification-count"><?= $notification_count ?></span> pending notification(s). <input type="button" value="clear" onclick="clear_notifications()" /></p>
					</div>
					<div style="clear:both;"></div>
				</div>
			</div>
			<div id="queries" class="rounded section">
				<div class="title down-arrow"> Subscriptions &amp; Alerts </div>
				<div class="innertube">
					<ul style="list-style:none; padding:0px; margin:0px;">
					<?
						if (!empty($subscriptions))
						{
							foreach($subscriptions as $query => $subscription_data)
							{
								$folders 				= $subscription_data['folders'];
								$subscription_type_id	= $subscription_data['subscription_type_id'];
								?>
								<li style="border-bottom:solid 1px black; padding:10px 0px 10px 0px; vertical-align:top;">
									<div style="width:300px; vertical-align:top; font-size:16px;float:left;"><?= $query ?></div>
									<div style="float:right">
										<select onChange="toggle_subscription('<?= $query ?>', $(this).selectedValues());$(this).selectOptions('0')">
											<option value="-2">Folder Management...</option>
											<option value="-1">Add to Folder</option>
											<? 
											foreach($user_folders['folders'] as $folder)
											{
												?>
												<option value="<?= $folder['folder_id']  ?>"> - <?= $folder['title']  ?></option>
												<? 
											} 
											?>
											<option value="0">Remove from folder</option>
											<? 
											foreach($folders as $folder)
											{
												?>
												<option value="<?= $folder['folder_id']  ?>"> - <?= $folder['title']  ?></option>
												<? 
											}
											?>
										</select>
										<select onchange="return edit_query_subscription('<?= $query ?>',  $(this).selectedValues());">
											<option value="0" <?= ($subscription_type_id == "0")?"SELECTED=\"SELECTED\"":""?>>No Tracking</option>
											<option value="1" <?= ($subscription_type_id == "1")?"SELECTED=\"SELECTED\"":""?>>Email</option>
											<option value="2" <?= ($subscription_type_id == "2")?"SELECTED=\"SELECTED\"":""?>>Jabber</option>
										</select>
										<img src="/images/trashcan.gif" class="pseudolink" onclick="delete_query('<?= $query ?>', this)">
									</div>
									<div style="clear:both"></div>
									<div style="font-size:12px; color:#999999; padding:0px 0px 0px 20px;">Folders: 
									<?
										$delimeter = "";
										foreach ($folders as $folder)
										{
											echo $delimeter . $folder['title'];
											$delimeter = ", ";
										}
							
									?>
									</div>
								</li>
								<?
							}
						}
						else
						{
							?><div align="center">No subscriptions</div><?
						}
					?>
					</ul>
				</div>
			</div>
		
			<div id="folders" class="rounded section">
				<div class="title down-arrow"> Folders </div>
				<div class="innertube">
					<ul style="list-style:none; padding:0px; margin:0px;">
					<?
					foreach($user_folders['folders'] as $folder)
					{
						$queries = $user_folders['queries'][$folder['folder_id']];
						
						$query_text = array();
						foreach ($queries as $query)
						{
							$query_text[] = $query['query'];
						}
						
						?>
						<li style="border-bottom:solid 1px black; padding:10px 0px 10px 0px;">
							<div style="width:300px; font-size:16px;float:left;"><?= $folder['title']  ?></div>
							
							
		
							<div style="float:right">
								<select style="display:none;" onchange="folder_access(<?= $folder['folder_id']?>, $(this).selectedValues())">
									<option value="1">View</option>
									<option value="2">Add Items</option>
								</select>
								<? if ($folder['title'] != "Quick Links") { ?>
								 <img src="/images/trashcan.gif" class="pseudolink" onclick="unsubscribe_folder('<?= $folder['title']  ?>', '<?= $folder['folder_id'] ?>', this)">
								<? } ?>
							</div>
							<div style="clear:both"></div>
							<div style="font-size:12px; color:#999999; padding:0px 0px 0px 20px;">Queries: <?= implode(", ", $query_text); ?></div>
						</li>
						<?
					}
					?>
					</ul>
				</div>
			</div>
		</div>
	</body>
</html>