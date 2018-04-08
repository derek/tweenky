#!/usr/bin/php5
<?php

	require_once "../config.php";
	
	//echo $sql = file_get_contents("db.sql");
	
	$GLOBALS['DB']->Execute("DROP DATABASE `".DB_DATABASE."`");
	$GLOBALS['DB']->Execute("CREATE DATABASE `".DB_DATABASE."`");
	
	//echo $GLOBALS['DB']->ErrorMsg();
?>
