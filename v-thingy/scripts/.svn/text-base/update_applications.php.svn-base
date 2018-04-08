#!/usr/bin/php5
<?php

require_once "../config.php";

$sql = "SELECT install_id, application_id, data FROM installs";
$applications = $GLOBALS['DB']->GetAll($sql);

foreach ($applications as $application)
{
	$settings = json_decode($application['data']);
	switch($application['application_id'])
	{
		case "1": //Twitter
			if (!isset($settings->username))
			{
				$settings->username = null;
			}
			if (!isset($settings->password))
			{
				$settings->password = null;
			}
			if (!isset($settings->api_url))
			{
				$settings->api_url = "http://twitter.com";
			}
			if (!isset($settings->title))
			{
				$settings->title = "Twitter";
			}
			
			$json = json_encode($settings);
			$sql = "UPDATE installs SET data = ? WHERE install_id = ?";
			$GLOBALS['DB']->Execute($sql, array($json, $application['install_id']));
			break;
			
		case "2": //Identi.ca
				if (!isset($settings->username))
				{
					$settings->username = null;
				}
				if (!isset($settings->password))
				{
					$settings->password = null;
				}
				if (!isset($settings->api_url))
				{
					$settings->api_url = "http://identi.ca/api";
				}
				if (!isset($settings->title))
				{
					$settings->title = "Identi.ca";
				}

				$json = json_encode($settings);
				$sql = "UPDATE installs SET data = ? WHERE install_id = ?";
				$GLOBALS['DB']->Execute($sql, array($json, $application['install_id']));
			break;
	}
}





?>