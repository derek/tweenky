<?php
require_once('../lib/xmpphp/XMPPHP/XMPP.php');
$can_give_feedback = array();
$conn = new XMPPHP_XMPP('talk.google.com', 5222, 'tracker', 'tweenky007', 'xmpphp', 'tweenky.com', $printlog=true, $loglevel=XMPPHP_Log::LEVEL_INFO);
//$conn->disconnect();
$conn->connect();
$conn->autoSubscribe();
while(!$conn->disconnected) {
    $payloads = $conn->processUntil(array('message', 'presence', 'end_stream', 'session_start'));
    foreach($payloads as $event) {
        $pl = $event[1];
        switch($event[0]) {
            case 'message':
				if (strlen($pl['body']) > 1)
				{
					switch($pl['body'])
					{
						case "offfglkjdfglkdjfglkjdf":
							echo "Turning updates off\n";
							$reply = "Updates have been turned off";
							break;

						case "onlkjeglkjerglkjerglkj":
							echo "Turning updates on\n";
							$reply = "Updates have been turned on";
							break;

						default:
							if (in_array($pl['from'], $can_give_feedback))
							{
								mail("feedback@tweenky.com", "IM Feedback from ".$pl['from'], $pl['body']);
								$reply = "Thanks for the feedback. Anything else?";
								break;
							}
							
						case "help":
							//$reply = "Type \"on\" or \"off\" to toggle message delivery";
							$reply = "Interaction capabilities coming soon. In the meantime, tell me what you think this bot should do and I'll pass the message on! Go ahead, type your feedback...";
							$can_give_feedback[] = $pl['from'];
							break;
					}
				}
				
				if (isset($reply))
				{
					$conn->message($pl['from'], $reply, $type=$pl['type']);
					unset($reply);	
				}
                //if($pl['body'] == 'quit') $conn->disconnect();
                //if($pl['body'] == 'break') $conn->send("</end>");
            break;
            case 'presence':
                print "Presence: {$pl['from']} [{$pl['show']}] {$pl['status']}\n";
            break;
            case 'session_start':
                $conn->presence($status="Type \"help\" for options");
            break;
        }
    }
}
?>