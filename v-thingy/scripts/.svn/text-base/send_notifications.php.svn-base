#!/usr/bin/php5
<?php



$base_dir = realpath(dirname($_SERVER['SCRIPT_FILENAME'])."/../");
require ($base_dir."/config.php");


$sql = "SELECT notification_id FROM notifications n LEFT JOIN tweets t ON n.tweet_id = t.tweet_id WHERE date_sent IS NULL ORDER BY t.date_published DESC";

$notifications = $GLOBALS['DB']->GetAll($sql);


foreach ($notifications as $notification_id)
{
	$Notification = new Notification($notification_id);
	
	$Notification->deliver();
}



//Send the Queued emails

$sql = "SELECT u.user_id, u.email, e.subject, e.email, e.headers FROM users u LEFT JOIN email_queue e ON u.user_id = e.user_id WHERE date_sent = NULL AND consolidate = 0";
$emails = $GLOBALS['DB']->GetAll($sql);

foreach ($emails as $email)
{
	
}

$sql = "SELECT u.user_id, e.subject FROM users u LEFT JOIN email_queue e ON u.user_id = e.user_id WHERE  consolidate = 1 AND date_sent IS NULL GROUP BY user_id, subject";
$emails = $GLOBALS['DB']->GetAll($sql);
foreach ($emails as $email)
{
	$sql = "SELECT email FROM email_queue WHERE user_id = ? AND subject = ? AND date_sent IS NULL AND consolidate = 1";
	$messages = $GLOBALS['DB']->GetCol($sql, array($email['user_id'], $email['subject']));
	
	$message = implode("", $messages);
	
	$User = new User($email['user_id']);
	$User->send_email($email['subject'], $message);

	$sql = "UPDATE email_queue SET date_sent = NOW()  WHERE user_id = ? AND subject = ? AND date_sent IS NULL AND consolidate = 1";
	$GLOBALS['DB']->Execute($sql, array($email['user_id'], $email['subject']));
}
	
die();
?>
