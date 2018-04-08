
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";



CREATE TABLE `hotlist` (
`hotlist_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
`query` VARCHAR( 100 ) NOT NULL ,
`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = INNODB ;


CREATE TABLE IF NOT EXISTS `invite_codes` (
  `invite_code_id` int(11) NOT NULL auto_increment,
  `invite_code` varchar(50) NOT NULL,
  `active` tinyint(1) NOT NULL default '1',
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`invite_code_id`)
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;




CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL auto_increment,
  `username` varchar(100) default NULL,
  `email` varchar(100) default NULL,
  `jabber` varchar(100) default NULL,
  `invite_code_id` int(11) NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`user_id`),
  FOREIGN KEY (invite_code_id) REFERENCES invite_codes(invite_code_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;



CREATE TABLE IF NOT EXISTS `queries` (
  `query_id` int(11) NOT NULL auto_increment,
  `query` varchar(100) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `date_updated` datetime NOT NULL,
  PRIMARY KEY  (`query_id`)
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;



CREATE TABLE IF NOT EXISTS `profiles` (
  `profile_id` int(11) NOT NULL auto_increment,
  `service_id` int(11) NOT NULL,
  `external_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `name` varchar(50) NULL,
  `website_url` varchar(100) NULL,
  `location` varchar(50) NULL,
  `image_url` varchar(200) NULL,
  `description` text NULL,
  `protected` tinyint(1) default '0',
  `followers_count` int(11) NOT NULL,
  `friends_count` int(11) default NULL,
  `statuses_count` int(11) default NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `date_updated` timestamp NOT NULL default '0000-00-00 00:00:00',
  PRIMARY KEY  (`profile_id`)
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci ;




CREATE TABLE IF NOT EXISTS `profile_to_user` (
  `profile_to_user_id` int(11) NOT NULL auto_increment,
  `profile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`profile_to_user_id`),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;







CREATE TABLE IF NOT EXISTS `folders` (
  `folder_id` int(11) NOT NULL auto_increment,
  `title` varchar(30) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`folder_id`)
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci ROW_FORMAT=DYNAMIC;






CREATE TABLE IF NOT EXISTS `user_to_folder` (
  `user_to_folder_id` int(11) NOT NULL auto_increment,
  `user_id` int(11) NOT NULL,
  `folder_id` int(11) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`user_to_folder_id`),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;






CREATE TABLE IF NOT EXISTS `query_to_folder` (
  `query_to_folder_id` int(11) NOT NULL auto_increment,
  `query_id` int(11) NOT NULL,
  `folder_id` int(11) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`query_to_folder_id`),
  FOREIGN KEY (query_id) REFERENCES queries(query_id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;








CREATE TABLE IF NOT EXISTS `tweets` (
  `tweet_id` int(11) NOT NULL auto_increment,
  `source_id` int(11) NOT NULL,
  `external_id` int(11) default NULL,
  `profile_id` int(11) NOT NULL,
  `posting_app` varchar(200) default NULL,
  `tweet` text NOT NULL,
  `date_published` int(11) NOT NULL,
  `visible` tinyint(1) NOT NULL default '1',
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`tweet_id`),
  FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;






CREATE TABLE IF NOT EXISTS `tweet_to_query` (
  `tweet_to_query_id` int(11) NOT NULL auto_increment,
  `tweet_id` int(11) NOT NULL,
  `query_id` int(11) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`tweet_to_query_id`),
  FOREIGN KEY (tweet_id) REFERENCES tweets(tweet_id) ON DELETE CASCADE,
  FOREIGN KEY (query_id) REFERENCES queries(query_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;








CREATE TABLE IF NOT EXISTS `subscriptions` (
  `subscription_id` int(11) NOT NULL auto_increment,
  `user_id` int(11) NOT NULL,
  `query_id` int(11) NOT NULL,
  `subscription_type_id` int(11) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`subscription_id`),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (query_id) REFERENCES queries(query_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;







CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` int(11) NOT NULL auto_increment,
  `subscription_id` int(11) NOT NULL,
  `tweet_id` int(11) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `date_sent` datetime default NULL,
  PRIMARY KEY  (`notification_id`),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,
  FOREIGN KEY (tweet_id) REFERENCES tweets(tweet_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;








CREATE TABLE IF NOT EXISTS `invitation_requests` (
  `invitation_request_id` int(11) NOT NULL auto_increment,
  `twitter_username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `sent` int(11) NOT NULL default '0',
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`invitation_request_id`)
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;







CREATE TABLE IF NOT EXISTS `logins` (
  `login_id` int(11) NOT NULL auto_increment,
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NULL,
  `ip_address` varchar(50) NOT NULL,
  `user_agent` varchar(100) NOT NULL,
  `referer` varchar(50) default NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`login_id`),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;








CREATE TABLE IF NOT EXISTS `searches` (
  `search_id` int(11) NOT NULL auto_increment,
  `query_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`search_id`),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (query_id) REFERENCES queries(query_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;






CREATE TABLE IF NOT EXISTS `email_queue` (
  `email_queue_id` int(11) NOT NULL auto_increment,
  `user_id` int(11) NOT NULL,
  `subject` text NULL,
  `email` text NULL,
  `headers` text NULL,
  `consolidate` tinyint(1) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `date_sent` datetime default NULL,
  PRIMARY KEY  (`email_queue_id`),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;



CREATE TABLE IF NOT EXISTS `session_data` (
  `session_id` varchar(32) NOT NULL default '',
  `http_user_agent` varchar(32) NOT NULL default '',
  `session_data` blob NOT NULL,
  `session_expire` int(11) NOT NULL default '0',
  PRIMARY KEY  (`session_id`)
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE IF NOT EXISTS `adodb_logsql` (
  created datetime NOT NULL,
  sql0 varchar(250) NOT NULL,
  sql1 text NOT NULL,
  params text NOT NULL,
  tracer text NOT NULL,
  timer decimal(16,6) NOT NULL
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;




CREATE TABLE IF NOT EXISTS `whitelist` (
  `whitelist_id` int(11) NOT NULL auto_increment,
  `twitter_username` varchar(50) NOT NULL,
  `date_created` timestamp NOT NULL default CURRENT_TIMESTAMP,
  PRIMARY KEY  (`whitelist_id`)
) ENGINE=INNODB  DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

