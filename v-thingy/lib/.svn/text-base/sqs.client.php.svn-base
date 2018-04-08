<?php
//*********************************************************************************************************************
// Copyright 2008 Amazon Technologies, Inc.  
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in 
// compliance with the License. 
//
// You may obtain a copy of the License at:http://aws.amazon.com/apache2.0  This file is distributed on 
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
//
// See the License for the specific language governing permissions and limitations under the License. 
//*********************************************************************************************************************

class SQSClient {

	var $accessKey;
	var $secretKey;
	var $endpoint;
	var $queueName;
	var $activeQueueURL;
	
	//*********************************************************************************************************
	// SQSClient Constructor
	//*********************************************************************************************************
	function SQSClient($accessKey, $secretKey, $endpoint, $queueName = '')
	{
		$this->accessKey = $accessKey;
		$this->secretKey = $secretKey;
		$this->endpoint = $endpoint;
		if($queueName == '')
			$this->setactiveQueueURL($endpoint);
		else
			$this->setactiveQueueURL($endpoint . "/" . $queueName);
	}
	
	//*********************************************************************************************************
	// Set the full URI for the active queue
	//*********************************************************************************************************
	function setactiveQueueURL($queueURL)
	{
		$this->activeQueueURL = $queueURL;
	}
	
	//*********************************************************************************************************
	// Get an array of queues
	//*********************************************************************************************************
	function ListQueues()
	{
		$params = array();
		$result = $this->makeRequest('ListQueues', $params);
		if ($result->ListQueuesResult->QueueUrl != NULL)
		{
			return $result->ListQueuesResult->QueueUrl;
		}
		else
		{
			throw( new Exception($result->Error->Code) );
		}
	}
	
	//*********************************************************************************************************
	// Create a new queue, and set the active queue for this client
	//*********************************************************************************************************
	function CreateQueue($QueueName)
	{
		$params = array();
		$params['QueueName'] = $QueueName;
		$result = $this->makeRequest('CreateQueue', $params);
		if ($result->CreateQueueResult->QueueUrl != NULL)
		{
			$q = $result->CreateQueueResult->QueueUrl;
			$this->setactiveQueueURL($q);
			return $q;
		}
		else
		{
			throw( new Exception($result->Error->Code) );
		}
	}
	
	//*********************************************************************************************************
	// Set the active queue, and then delete it
	//
	// Note: this will delete ALL messages in your queue, so use this function with caution!
	//
	//*********************************************************************************************************
	function DeleteQueue($ActiveQueueURL)
	{
		$this->setactiveQueueURL($ActiveQueueURL);
		
		$params = array();
		$result = $this->makeRequest('DeleteQueue', $params);
		if ($result->Error->Code != NULL)
		{
			throw( new Exception($result->Error->Code) );	
		}
		return true;
	}
	
	//*********************************************************************************************************
	// Send a message to your queue
	//*********************************************************************************************************
	function SendMessage($MessageBody)
	{
		$params = array();
		$params['MessageBody'] = $MessageBody;
		$result = $this->makeRequest('SendMessage', $params);
		if ($result->SendMessageResult->MessageId != NULL)
		{
			return $result->SendMessageResult->MessageId;
		}
		else
		{
			throw( new Exception($result->Error->Code) );
		}
	}
	
	//*********************************************************************************************************
	// Get a queue attribute 
	//*********************************************************************************************************
	function GetQueueAttributes($Attribute)
	{
		$params = array();
		$params['AttributeName'] = $Attribute;
		$result = $this->makeRequest('GetQueueAttributes', $params);
		if ($result->GetQueueAttributesResult->Attribute != NULL)
		{
			return $result->GetQueueAttributesResult->Attribute->Value;
		}
		else
		{
			throw( new Exception($result->Error->Code) );
		}	
	}
	
	//*********************************************************************************************************
	// Get a message(s) from your queue
	//*********************************************************************************************************
	function ReceiveMessage($MaxNumberOfMessages = -1, $VisibilityTimeout = -1)
	{
		$params = array();
		if ($VisibilityTimeout > -1) $params['VisibilityTimeout'] = $VisibilityTimeout;
		if ($MaxNumberOfMessages > -1) $params['MaxNumberOfMessages'] = $MaxNumberOfMessages;
		$result = $this->makeRequest('ReceiveMessage', $params);
		if ($result->ReceiveMessageResult->Message != NULL)
		{
			return $result->ReceiveMessageResult->Message;
		}
		else
		{
			throw( new Exception($result->Error->Code) );
		}
	}
	
	//*********************************************************************************************************
	// Delete a message
	//*********************************************************************************************************
	function DeleteMessage($ReceiptHandle)
	{
		$params = array();
		$params['ReceiptHandle'] = $ReceiptHandle;
		$result= $this->makeRequest('DeleteMessage', $params);
		if ($result->Error->Code != NULL)
		{
			throw( new Exception($result->Error->Code) );	
		}
		return true;
	}

	//*********************************************************************************************************
	// Send a query request and return a SimpleXMLElement object
	//*********************************************************************************************************
	function makeRequest($action, $params)
	{
		if ($params == '') $params = array();
		
		$retryCount = 0;
		do
		{
			$retry = false;
			$timestamp = time();
			
			// Add Actions
			$params['Action'] = $action;
			$params['Expires'] = gmdate('Y-m-d\TH:i:s\Z', $timestamp + 10);
			$params['Version'] = '2008-01-01';
			$params['AWSAccessKeyId'] = $this->accessKey;
			$params['SignatureVersion'] = '1';
			
			// build our string to sign
			uksort($params, 'strcasecmp');
			$stringToSign = '';
			foreach ($params as $key => $val)
			{
				$stringToSign = $stringToSign . "$key$val";
			}
			
			// Sign the string
			$hasher =& new Crypt_HMAC($this->secretKey, "sha1");
			$params['Signature'] = $this->hex2b64($hasher->hash($stringToSign));
			$request = '';
			foreach ($params as $key => $val)
			{
				$request .= $key . '=' .  urlencode($val) . '&';
			}
			// get rid of the last &
			$request = substr($request, 0, strlen($request) - 1);
	
			// set our endpoint, keeping in mind that not all actions require a queue name in the URI
			$endpoint = $this->activeQueueURL;
			if ($action == 'ListQueues' || $action == 'CreateQueue')
			{
				$endpoint = $this->endpoint;
			}
			$req = new HTTP_Request($endpoint);
			$req->setMethod('GET');
			//echo $request;
			$req->addRawQueryString($request);
			$req->sendRequest();
			
			// check if we should retry this request
			$responseCode = $req->getResponseCode();
			
			// you should always retry a 5xx error, as some of these are expected
			if($responseCode >= 500 && $responseCode < 600 && $retryCount <= 5)
			{
				$retry = true;
				$retryCount++;
				echo "Response ".$responseCode, ': retrying ', $action, ' request (', $retryCount, ')', "\n<br />\n";
				sleep($retryCount / 4 * $retryCount);
			}
		}
		while($retry == true);
		
		$xml = $req->getResponseBody();
		
		// PHP 5 - The easier way!
		$data = new SimpleXMLElement($xml);
		
		return $data;
	}
	
	//*********************************************************************************************************
	// Base64 encode a string - used for signing a request
	//*********************************************************************************************************
	function hex2b64($str)
	{
		$raw = '';
		for ($i=0; $i < strlen($str); $i+=2)
		{
			$raw .= chr(hexdec(substr($str, $i, 2)));
		}
		return base64_encode($raw);
	}
}

?>
