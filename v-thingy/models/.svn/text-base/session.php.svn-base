<?php


	//error_reporting(E_ALL);

	class Session
	{
	    function __construct()
	    {
	        $this->session_lifetime = SESSION_LIFETIME;
			$this->db = $GLOBALS['DB'];
			
			$sql = "DELETE FROM session_data WHERE session_data = ''";
			$this->db->Execute($sql);
	    }
	
	    function open($save_path, $session_var_name)
	    {	
			//echo $session_id = $_COOKIE[$session_var_name];
			$session_id = session_id();
			
			$sql = "SELECT 'true' FROM session_data WHERE session_id = ?";
			$exists = $this->db->GetOne($sql, array($session_id));

			if (!empty($session_id) && $exists != 'true')
			{
				setcookie("PHPSESSID", $session_id, time() + SESSION_LIFETIME);
				
				$sql = "INSERT INTO session_data (session_id) VALUES (?)";
				$this->db->Execute($sql, array($session_id));
			}
			
			return true;
	    }
	
	    function close()
	    {
	        return true;
	    }
	
	    function read($session_id)
	    {	
			$sql = "SELECT session_data FROM session_data WHERE session_id = ?";
			$session_data = $this->db->GetOne($sql, array($session_id));
	
	        if (!empty($session_data)) 
			{
	            return $session_data;
	        }
			else
			{
				return "";
			}
	    }
	
	    function write($session_id, $session_data)
	    {
			if (!empty($session_data))
			{
				$sql = "UPDATE session_data SET session_data = ? WHERE session_id = ?";
				$this->db->Execute($sql, array($session_data, $session_id));
			}
			
			return true;
	    }
	
	    function destroy($session_id)
	    {
			setcookie ("PHPSESSID", "", time() - 3600);
			//setcookie ("session_id", "", time() - 3600);
			
	        $sql = "DELETE FROM session_data WHERE session_id = ?";
			$result = $this->db->Execute($sql, array($session_id));
			
	        if ($this->db->Affected_Rows() > 0) 
			{
	            return true;
	        }
	
	        return false;
	    }
	
	    function gc($maxlifetime)
	    {
	        $sql = "DELETE FROM session_data WHERE session_expire < unix_timestamp(CURRENT_TIMESTAMP))";
			$result = $this->db->Execute($sql);
	    }
	
	
	
	
	
		function regenerate_id()
	    {
		
	        $oldSessionID = session_id();
	
	        session_regenerate_id();
	
	        $this->destroy($oldSessionID);

	    }
	
	    function get_users_online()
	    {

	        // counts the rows from the database
	        $count = $this->db->GetOne("
	            SELECT
	                COUNT(session_id) as count
	            FROM session_data
	        ");

	        // return the number of found rows
	        return $count;

	    }

	}
	?>
