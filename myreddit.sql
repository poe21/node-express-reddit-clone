-- MySQL dump 10.13  Distrib 5.5.49, for debian-linux-gnu (x86_64)
--
-- Host: 0.0.0.0    Database: reddit
-- ------------------------------------------------------
-- Server version	5.5.49-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(10000) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `userId` int(11) DEFAULT NULL,
  `postId` int(11) DEFAULT NULL,
  `parentId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `postId` (`postId`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`),
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'omg I love it','2016-04-29 14:31:41','2016-04-29 14:31:41',1,2,NULL),(2,'aren\'t I the cutest? :3','2016-04-29 14:32:48','2016-04-29 14:32:48',2,2,1),(3,'totally!','2016-04-29 16:42:36','2016-04-29 16:42:36',3,2,2),(4,'hello!!!!!!!','2016-04-29 16:44:14','2016-04-29 16:44:14',3,1,NULL),(5,'best cat award','2016-04-29 17:57:18','2016-04-29 17:57:18',3,2,NULL),(6,'i agree','2016-04-29 18:04:57','2016-04-29 18:04:57',1,2,1),(7,'yesss','2016-04-29 20:18:19','2016-04-29 20:18:19',1,2,2),(8,'yay! ^0^','2016-04-29 20:19:00','2016-04-29 20:19:00',2,2,5);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `subredditId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `subredditId` (`subredditId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`subredditId`) REFERENCES `subreddits` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,'hi reddit!','https://www.reddit.com',1,'2016-04-28 18:07:36','2016-05-02 20:09:38',NULL),(2,'my cat selfie','https://www.reddit.com/my-cat-selfie',2,'2016-04-28 20:16:35','2016-05-03 19:55:26',NULL),(3,'meow','https://www.reddit.com/meow',2,'2016-04-28 20:51:57','2016-05-03 19:56:01',NULL),(4,'At DecodeMTL, we like cats too!','https://www.reddit.com/at-decodemtl-we-like-cats-too',3,'2016-04-28 22:53:25','2016-05-03 19:56:29',1),(5,'look at this cat','https://www.reddit.com/r/cats/look-at-this-cat',1,'2016-05-02 19:58:19','2016-05-02 20:13:04',NULL),(6,'my trip to Europe, post 1','https://www.reddit.com/trip-to-europe-post-1',1,'2016-05-02 19:58:35','2016-05-02 20:12:26',NULL),(7,'my trip to Europe, post 2','https://www.reddit.com/trip-to-europe-post-2',1,'2016-05-02 20:00:42','2016-05-02 20:14:21',NULL),(8,'my trip to Europe, post 3','https://www.reddit.com/trip-to-europe-post-3',1,'2016-05-02 20:01:01','2016-05-02 20:14:50',NULL),(9,'my trip to Europe, post 4','https://www.reddit.com/trip-to-europe-post-4',1,'2016-05-02 20:01:10','2016-05-02 20:15:29',NULL),(10,'my trip to Europe, post 5','https://www.reddit.com/trip-to-europe-post-5',1,'2016-05-02 20:01:21','2016-05-02 20:16:10',NULL),(11,'my trip to Europe, post 6','https://www.reddit.com/trip-to-europe-post-6',1,'2016-05-02 20:01:31','2016-05-02 20:19:15',NULL),(12,'my trip to Europe, post 7','https://www.reddit.com/trip-to-europe-post-7',1,'2016-05-02 20:01:47','2016-05-02 20:19:46',NULL),(13,'my trip to Europe, post 8','https://www.reddit.com/trip-to-europe-post-8',1,'2016-05-02 20:02:00','2016-05-02 20:20:30',NULL),(14,'my trip to Europe, post 9','https://www.reddit.com/trip-to-europe-post-9',1,'2016-05-02 20:02:21','2016-05-02 20:21:23',NULL),(15,'my trip to Europe, post 10','https://www.reddit.com/trip-to-europe-post-10',1,'2016-05-02 20:02:36','2016-05-02 20:21:50',NULL),(16,'my trip to Europe, post 11','https://www.reddit.com/trip-to-europe-post-11',1,'2016-05-02 20:02:50','2016-05-02 20:22:17',NULL),(17,'my trip to Europe, post 12','https://www.reddit.com/trip-to-europe-post-12',1,'2016-05-02 20:03:07','2016-05-02 20:22:43',NULL),(18,'my trip to Europe, post 13 - THE END','https://www.reddit.com/trip-to-europe-post-13-the-end',1,'2016-05-02 20:03:33','2016-05-02 20:23:11',NULL),(19,'Look at these cats','/cute-cats',6,'2016-05-04 19:11:39','2016-05-04 19:17:08',NULL),(20,'wow this is a link','www.link.co',NULL,'2016-05-04 19:22:49','2016-05-04 19:22:49',NULL),(21,'cats cats cats','http://www.cats.com',NULL,'2016-05-04 19:25:01','2016-05-04 19:25:01',NULL),(22,'Cats website','http://www.cats.com',NULL,'2016-05-04 19:29:03','2016-05-04 19:29:03',NULL),(23,'wow cats','/cute-cats-meow',6,'2016-05-04 19:35:09','2016-05-04 19:35:09',NULL),(24,'facebook','www.facebook.com',NULL,'2016-05-04 19:39:53','2016-05-04 19:39:53',NULL),(25,'meow','meow',6,'2016-05-04 19:41:29','2016-05-04 19:41:29',NULL),(26,'cats =(^-^)=','cats',6,'2016-05-05 14:16:22','2016-05-05 14:16:22',NULL),(27,'oicdsjfsl','fergrfs',6,'2016-05-05 15:00:10','2016-05-05 15:00:10',NULL);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `token` varchar(200) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('342p2d3s265y733e1g93mb2p28x6q2v5x203h4b6f6657591g5q4d12k536454q4o3d5i34jm484j1h3f3nl6u1c3n3q574s526v2u6e271n332n4z153u3p4z6j186l6g5s1o3d324jv6m2c1m4n4p3y6e6s4p1u5864182z44u606c3u2u4m3l60381r',6);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subreddits`
--

DROP TABLE IF EXISTS `subreddits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subreddits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subreddits`
--

LOCK TABLES `subreddits` WRITE;
/*!40000 ALTER TABLE `subreddits` DISABLE KEYS */;
INSERT INTO `subreddits` VALUES (1,'CATS','everything cats!! =(^ㅅ^)=','2016-04-28 22:25:39','2016-04-28 22:51:39'),(2,'funny','lol','2016-04-28 22:38:43','2016-04-28 22:38:43');
/*!40000 ALTER TABLE `subreddits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(60) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'hello23','$2a$10$2lefoQ8RpZrVQ1lTOteJAedsitpsQyDn8qrzioecuIp0PwKKWCpDi','2016-04-28 18:07:36','2016-04-28 18:07:36'),(2,'cat21','$2a$10$Skg9IVRF15ZX1w0I96nuiuIpltU/h2uBoMroudnf8r2JXkni4.TyC','2016-04-28 20:13:23','2016-04-28 20:13:23'),(3,'decodemtl','$2a$10$vybEagOKDrH3pd2Z4gCTueGfjT4Og/GrXIno5pCPdqiqdvLO9RrEC','2016-04-28 20:13:48','2016-04-28 20:13:48'),(4,'test','$2a$10$tUzoMKU36jgkPLNlED1xbOdxu/8llkQ6817fUwn5qUssOU/cJ.5Um','2016-05-03 20:38:33','2016-05-03 20:38:33'),(5,'butts','$2a$10$DNoGHpaZBZVfy0ue93ROc.Bxnvm68HVBYfOFQup325eZyD8OUaeYq','2016-05-03 20:43:31','2016-05-03 20:43:31'),(6,'cats','$2a$10$uPLesTJsKkbLfNVvYlYDWeuuyOO7/6yeldu4GlE4sJZ1Rk00YsXjm','2016-05-03 20:43:54','2016-05-03 20:43:54'),(7,'cats2','$2a$10$dfyGseSXgKYkkmqrulpva.9pnz5GEg0CIiaFGJQIjtPCPiF3vClZO','2016-05-03 20:44:05','2016-05-03 20:44:05'),(8,'dfds','$2a$10$pblcCyCFYYBennaLDJfgke1Ry1MLJD5D8R5ZVvDNzRe2bl7f5FEF.','2016-05-03 20:46:10','2016-05-03 20:46:10');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votes`
--

DROP TABLE IF EXISTS `votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `votes` (
  `postId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `vote` tinyint(4) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`postId`,`userId`),
  KEY `userId` (`userId`),
  CONSTRAINT `votes_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votes`
--

LOCK TABLES `votes` WRITE;
/*!40000 ALTER TABLE `votes` DISABLE KEYS */;
/*!40000 ALTER TABLE `votes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-05-05 15:23:52
