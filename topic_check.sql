-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: diandiandaka
-- ------------------------------------------------------
-- Server version	5.7.22-0ubuntu0.16.04.1

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
-- Table structure for table `topic_check`
--

DROP TABLE IF EXISTS `topic_check`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `topic_check` (
  `user_id` varchar(255) NOT NULL,
  `topic_name` varchar(255) NOT NULL,
  `check_time` varchar(255) NOT NULL DEFAULT '',
  `log` varchar(255) DEFAULT '',
  PRIMARY KEY (`user_id`,`topic_name`,`check_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topic_check`
--

LOCK TABLES `topic_check` WRITE;
/*!40000 ALTER TABLE `topic_check` DISABLE KEYS */;
INSERT INTO `topic_check` VALUES ('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-01','[2018-08-01 14:40]今天告诉自己，研究生就已经很不错了'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-02','[2018-08-02 10:22]'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-03','[2018-08-03 19:48]'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-04','[2018-08-04 08:32]写完优点感觉都自信了呢'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-05','[2018-08-05 04:55]今天感觉写不出来了。。。。'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','和妈妈说我爱你','2018-08-05','[2018-08-05 04:32]今天妈妈依旧很开心嗷~'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','2018-07-30','[2018-07-30 05:59]'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','2018-07-31','[2018-07-31 09:49]嗓子搞得很疼今天'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','2018-08-02','[2018-08-02 06:09]'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','2018-08-03','[2018-08-03 04:12]'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','2018-08-04','[2018-08-04 18:42]早起晨跑很舒服'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','2018-08-05','[2018-08-05 04:08]今天起的是真的早，很早就被外公吵醒了'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','练声','2018-08-05','[2018-08-05 04:08]嗓子优点累……'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','遛狗一小时','2018-07-31','[2018-07-31 09:49]嗓子搞得很疼今天'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','遛狗一小时','2018-08-05','[2018-08-05 04:08]al很乖今天');
/*!40000 ALTER TABLE `topic_check` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-08-05  9:37:28
