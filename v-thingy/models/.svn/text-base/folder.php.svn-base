<?

	class Folder
	{
	
		function __construct($folder_id)
		{
			$this->folder_id = $folder_id;
		}
		
		function get_info()
		{
			$sql = "SELECT folder_id, title FROM folders WHERE folder_id = ?";
			$data = $GLOBALS['DB']->GetRow($sql, array($this->folder_id));
			
			return $data;
		}
		
		function add_query($query_id)
		{
			$sql = "INSERT INTO query_to_folder (query_id, folder_id) VALUES (?, ?)";
			$GLOBALS["DB"]->Execute($sql, array($query_id, $this->folder_id));

			if ($GLOBALS["DB"]->Insert_ID() > 0)
				return true;
			else
				return false;
		}
		
		function remove_query($query_id)
		{
			$sql = "DELETE FROM query_to_folder WHERE query_id = ? AND folder_id = ?";
			$GLOBALS["DB"]->Execute($sql, array($query_id, $this->folder_id));
		}
		
		function get_queries()
		{
			$info = array();
			$sql = "SELECT q.query_id, qtf.query_to_folder_id FROM queries q LEFT JOIN query_to_folder qtf ON q.query_id = qtf.query_id WHERE qtf.folder_id = ? ORDER BY query";
			$queries = $GLOBALS['DB']->GetAll($sql, array($this->folder_id));
			
			foreach($queries as $query)
			{
				$Query = new Query($query['query_id']);
				$data = $Query->get_query_data();
				$data['query_to_folder_id'] = $query['query_to_folder_id'];
				$info[] = $data;
			}
			return $info;
		}		
	}

?>