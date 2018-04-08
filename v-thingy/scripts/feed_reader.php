#!/usr/bin/php5
<?php

$base_dir = realpath(dirname($_SERVER['SCRIPT_FILENAME'])."/../");
require ($base_dir."/config.php");

$sql = "SELECT q.* FROM queries q LEFT JOIN subscriptions s ON q.query_id = s.query_id WHERE subscription_type_id IN (1,2)";
$queries = $GLOBALS['DB']->GetCol($sql);

foreach($queries as $query_id)
{
	$Query = new Query($query_id);
	$Query->update_query();
}
?>
