<?

	$queries = array(
		"folder:derek",
		"folder:tech news",
		"with:bob",
		"friends:derek"
	);
	
	foreach($queries as $query)
	{
		preg_match("/([folder|with|friends]+):\"?([a-zA-Z0-9_\s\-]+)\"?/", $query, $matches);

		print_r($matches);
		
	}
?>