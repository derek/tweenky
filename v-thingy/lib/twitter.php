<?php
/*
 * A PHP interface for the Twitter REST API
 * Copyright (C) 2007 Nick Beam <beam@rbrw.net>
 * http://twitterlibphp.googlecode.com
 * http://tinydinosaur.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

class Twitter {

	private $credentials;
	
	private $http_status;
	
	public $last_api_call;
	
	function Twitter($username, $password) {
		$this->credentials = sprintf("%s:%s", $username, $password);
	}
	
	function getPublicTimeline($format, $since_id = 0) {
		$api_call = sprintf("http://twitter.com/statuses/public_timeline.%s", $format);
		if ($since_id > 0) {
			$api_call .= sprintf("?since_id=%d", $since_id);
		}
		return $this->APICall($api_call);
	}

	function getFriendsTimeline($format, $id = NULL, $since_id = NULL, $page = 1, $count = 200) {
		if ($id != NULL) {
			$api_call = sprintf("http://twitter.com/statuses/friends_timeline/%s.%s", $id, $format);
		}
		else {
			$api_call = sprintf("http://twitter.com/statuses/friends_timeline.%s", $format);
		}
		$api_call .= sprintf("?page=%s&count=%s", $page, $count);
		if ($since_id != NULL) {
			$api_call .= sprintf("&since_id=%s", $since_id);
		}
		return $this->APICall($api_call, true);
	}
	
	function getUserTimeline($format, $id = NULL, $since_id = null, $count = 50, $since = NULL) {
		if ($id != NULL) {
			$api_call = sprintf("http://twitter.com/statuses/user_timeline/%s.%s", $id, $format);
		}
		else {
			$api_call = sprintf("http://twitter.com/statuses/user_timeline.%s", $format);
		}
		if ($count != 20) {
			$api_call .= sprintf("?count=%d", $count);
		}
		if ($since != NULL) {
			$api_call .= sprintf("%ssince=%s", (strpos($api_call, "?count=") === false) ? "?" : "&", urlencode($since));
		}
		if ($since_id != NULL) {
			$api_call .= sprintf("&since_id=%s", $since_id);
		}
		return $this->APICall($api_call, true);
	}
	
	function showStatus($format, $id) {
		$api_call = sprintf("http://twitter.com/statuses/show/%d.%s", $id, $format);
		return $this->APICall($api_call);
	}
	
	function updateStatus($status, $reply_to_status_id = null) {
		$status = urlencode(stripslashes(urldecode($status)));
		$api_call = sprintf("http://twitter.com/statuses/update.xml?status=%s", $status);
		if ($reply_to_status_id != NULL) {
			$api_call .= sprintf("&reply_to_status_id=%s", $reply_to_status_id);
		}
		return $this->APICall($api_call, true, true);
	}
	
	function getReplies($format, $page = 0) {
		$api_call = sprintf("http://twitter.com/statuses/replies.%s", $format);
		if ($page) {
			$api_call .= sprintf("?page=%d", $page);
		}
		return $this->APICall($api_call, true);
	}
	
	function destroyStatus($format, $id) {
		$api_call = sprintf("http://twitter.com/statuses/destroy/%d.%s", $id, $format);
		return $this->APICall($api_call, true);
	}
	
	function getFriends($format, $id = NULL, $page = 1) {
		if ($id != NULL) {
			$api_call = sprintf("http://twitter.com/statuses/friends/%s.%s?page=%s", $id, $format, $page);
			$authenticate = false;
		}
		else {
			$api_call = sprintf("http://twitter.com/statuses/friends.%s?page=%s", $format, $page);
			$authenticate = true;
		}
		return $this->APICall($api_call, $authenticate);
	}
	
	function getFollowers($format, $lite = NULL) {
		$api_call = sprintf("http://twitter.com/statuses/followers.%s%s", $format, ($lite) ? "?lite=true" : NULL);
		return $this->APICall($api_call, true);
	}
	
	function getFeatured($format) {
		$api_call = sprintf("http://twitter.com/statuses/featured.%s", $format);
		return $this->APICall($api_call);
	}
	
	function friendshipExists($format, $user_a, $user_b) {
		$api_call = sprintf("http://twitter.com/friendships/exists.%s?user_a=%s&user_b=%s", $format, $user_a, $user_b);
		return $this->APICall($api_call, true);
	}
	
	function showUser($format, $id, $email = NULL) {
		if ($email == NULL) {
			$api_call = sprintf("http://twitter.com/users/show/%s.%s", $id, $format);
		}
		else {
			$api_call = sprintf("http://twitter.com/users/show.xml?email=%s", $email);
		}
		return $this->APICall($api_call, true);
	}
	
	function getMessages($format, $since = NULL, $since_id = 0, $page = 1) {
		$api_call = sprintf("http://twitter.com/direct_messages.%s", $format);
		if ($since != NULL) {
			$api_call .= sprintf("?since=%s", urlencode($since));
		}
		if ($since_id > 0) {
			$api_call .= sprintf("%ssince_id=%d", (strpos($api_call, "?since") === false) ? "?" : "&", $since_id);
		}
		if ($page > 1) {
			$api_call .= sprintf("%spage=%d", (strpos($api_call, "?since") === false) ? "?" : "&", $page);
		}
		return $this->APICall($api_call, true);
	}
	
	function getSentMessages($format, $since = NULL, $since_id = 0, $page = 1) {
		$api_call = sprintf("http://twitter.com/direct_messages/sent.%s", $format);
		if ($since != NULL) {
			$api_call .= sprintf("?since=%s", urlencode($since));
		}
		if ($since_id > 0) {
			$api_call .= sprintf("%ssince_id=%d", (strpos($api_call, "?since") === false) ? "?" : "&", $since_id);
		}
		if ($page > 1) {
			$api_call .= sprintf("%spage=%d", (strpos($api_call, "?since") === false) ? "?" : "&", $page);
		}
		return $this->APICall($api_call, true);
	}
	
	function newMessage($format, $user, $text) {
		$text = urlencode(stripslashes(urldecode($text)));
		$api_call = sprintf("http://twitter.com/direct_messages/new.%s?user=%s&text=%s", $format, $user, $text);
		return $this->APICall($api_call, true, true);
	}
	
	function destroyMessage($format, $id) {
		$api_call = sprintf("http://twitter.com/direct_messages/destroy/%s.%s", $id, $format);
		return $this->APICall($api_call, true);
	}
	
	function createFriendship($format, $id) {
		$api_call = sprintf("http://twitter.com/friendships/create/%s.%s", $id, $format);
		return $this->APICall($api_call, true, true);
	}
	
	function destroyFriendship($format, $id) {
		$api_call = sprintf("http://twitter.com/friendships/destroy/%s.%s", $id, $format);
		return $this->APICall($api_call, true, true);
	}
	
	function verifyCredentials() {
		$api_call = "http://twitter.com/account/verify_credentials.xml";
		$response = $this->APICall($api_call, true);
		

		if ($response == "<authorized>true</authorized>")
			return true;
		else
			return false;
	}
	
	function endSession() {
		$api_call = "http://twitter.com/account/end_session";
		return $this->APICall($api_call, true);
	}
	
	function getArchive($format, $page = 1) {
		$api_call = sprintf("http://twitter.com/account/archive.%s", $format);
		if ($page > 1) {
			$api_call .= sprintf("?page=%d", $page);
		}
		return $this->APICall($api_call, true);
	}
	
	function getFavorites($format, $id = NULL, $page = 1) {
		if ($id == NULL) {
			$api_call = sprintf("http://twitter.com/favorites.%s", $format);
		}
		else {
			$api_call = sprintf("http://twitter.com/favorites/%s.%s", $id, $format);
		}
		if ($page > 1) {
			$api_call .= sprintf("?page=%d", $page);
		}
		return $this->APICall($api_call, true);
	}
	
	function createFavorite($format, $id) {
		$api_call = sprintf("http://twitter.com/favourings/create/%d.%s", $id, $format);
		return $this->APICall($api_call, true);
	}
	
	function destroyFavorite($format, $id) {
		$api_call = sprintf("http://twitter.com/favourings/destroy/%d.%s", $id, $format);
		return $this->APICall($api_call, true);
	}
	
	function getRateLimit($format)
	{
		$api_call = sprintf("http://twitter.com/account/rate_limit_status.%s", $format);
		return $this->APICall($api_call, true);
	}
	
	private function APICall($api_url, $require_credentials = false, $http_post = false) {
		
		$post_vars = "source=tweenky";
		
		$curl_handle = curl_init();
		curl_setopt($curl_handle, CURLOPT_URL, $api_url);
		if ($require_credentials) {
			curl_setopt($curl_handle, CURLOPT_USERPWD, $this->credentials);
		}
		if ($http_post) {
			curl_setopt($curl_handle, CURLOPT_POST, true);
			curl_setopt($curl_handle, CURLOPT_POSTFIELDS    ,$post_vars);
		}
		curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, TWITTER_MAX_CONNECT_SECONDS);
		curl_setopt($curl_handle, CURLOPT_TIMEOUT, TWITTER_MAX_WAIT_SECONDS);
		
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, TRUE);
		$response = curl_exec($curl_handle);
		$this->http_status = curl_getinfo($curl_handle, CURLINFO_HTTP_CODE);
		$this->last_api_call = $api_url;
		
		if (curl_errno($curl_handle)) 
		{				
			//tweenky_debug("[Tweenky] Curl Error", "\n\n API URL: ". $api_url ."\n\nError: " .  curl_error($curl_handle));
		
            return  curl_error($curl_handle);
        } else {
			curl_close($curl_handle);
			return $response;
        }

	}
	
	function lastStatusCode() {
		return $this->http_status;
	}
	
	function lastAPICall() {
		return $this->last_api_call;
	}
}
?>
