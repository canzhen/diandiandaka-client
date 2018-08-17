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
-- Table structure for table `topic`
--

DROP TABLE IF EXISTS `topic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `topic` (
  `topic_id` int(11) NOT NULL AUTO_INCREMENT,
  `topic_name` varchar(255) NOT NULL DEFAULT '',
  `topic_url` varchar(255) DEFAULT NULL,
  `use_people_num` int(11) DEFAULT '0',
  PRIMARY KEY (`topic_id`),
  UNIQUE KEY `card_name_unique` (`topic_name`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topic`
--

LOCK TABLES `topic` WRITE;
/*!40000 ALTER TABLE `topic` DISABLE KEYS */;
IINSERT INTO `topic` VALUES (1,'早起','http://pcjzq4ixp.bkt.clouddn.com/topic/zaoqi.png',91),(2,'跑步','http://pcjzq4ixp.bkt.clouddn.com/topic/paobu.png',75),(3,'早睡','http://pcjzq4ixp.bkt.clouddn.com/topic/zaoshui.png',87),(4,'减肥','http://pcjzq4ixp.bkt.clouddn.com/topic/jianfei.png',74),(5,'吃早餐','http://pcjzq4ixp.bkt.clouddn.com/topic/chizaocan.png',88),(6,'清晨一杯水','http://pcjzq4ixp.bkt.clouddn.com/topic/qingchenyibeishui.png',67),(19,'和女朋友说我爱你','http://pcjzq4ixp.bkt.clouddn.com/topic/fuqi.png',1),(21,'唱歌','http://pcjzq4ixp.bkt.clouddn.com/topic/huatong.png',1),(36,'带狗狗散步','http://pcjzq4ixp.bkt.clouddn.com/topic/dog.png',1),(37,'空中自行车','http://pcjzq4ixp.bkt.clouddn.com/topic/zixingche.png',8),(39,'写五个自己的优点','http://pcjzq4ixp.bkt.clouddn.com/topic/shufa.png',20),(40,'遛狗一小时','http://pcjzq4ixp.bkt.clouddn.com/topic/dog.png',1),(41,'健身','http://pcjzq4ixp.bkt.clouddn.com/topic/jianshen.png',73),(42,'和妈妈说我爱你','http://pcjzq4ixp.bkt.clouddn.com/topic/mama.png',19),(44,'练声','http://pcjzq4ixp.bkt.clouddn.com/topic/huatong.png',1),(45,'照顾外公','http://pcjzq4ixp.bkt.clouddn.com/topic/ile://tmp_8c3c0848ad919b8b96569126660f5041',1),(47,'观察生活','http://pcjzq4ixp.bkt.clouddn.com/topic/camera.png',1),(65,'读书','http://pcjzq4ixp.bkt.clouddn.com/topic/yuedu.png',1),(70,'好好学习','http://pcjzq4ixp.bkt.clouddn.com/topic/yuedu.png',1),(136,'练字','http://pcjzq4ixp.bkt.clouddn.com/http://pcjzq4ixp.bkt.clouddn.com/topic/qianbi.png',1);
/*!40000 ALTER TABLE `topic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topic_check`
--

DROP TABLE IF EXISTS `topic_check`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `topic_check` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `topic_name` varchar(255) NOT NULL,
  `check_time` varchar(255) NOT NULL DEFAULT '',
  `check_timestamp` varchar(255) NOT NULL DEFAULT '',
  `log` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topic_check`
--

LOCK TABLES `topic_check` WRITE;
/*!40000 ALTER TABLE `topic_check` DISABLE KEYS */;
INSERT INTO `topic_check` VALUES (1,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-01','14:40','今天告诉自己，研究生就已经很不错了'),(4,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-04','08:32','写完优点感觉都自信了呢'),(7,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-07','20:08:32','今天的我，仍然很自卑……'),(8,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-09','15:08:31','今天优点好少……'),(12,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','照顾外公','2018-08-06','08:08:28','外公昨天跟我发火，“不用你管”，我哭了一晚上，不是委屈，是觉得自己很没用。'),(13,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','照顾外公','2018-08-09','14:08:55','外公身体越来越好啦～'),(14,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早睡','2018-08-06','08:08:28','不知道这早睡是该今天打昨天的卡还是当天打卡呢，当天打卡怎么知道今晚会不会早睡呢？'),(15,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早睡','2018-08-07','07:08:00','昨天很早就睡了，大概十点多吧'),(28,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','遛狗一小时','2018-07-31','09:49','嗓子搞得很疼今天'),(29,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','遛狗一小时','2018-08-04','19:02','al今天很不乖，在电梯里拉屎，气死我了'),(30,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','遛狗一小时','2018-08-05','04:08','al很乖今天'),(31,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','照顾外公','2018-08-09','17:08:58','外公今天主动叫我吃饭，太感人了'),(49,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早睡','2018-08-10','18:08:47','11点睡的'),(60,'ovMv05eyuX8nzFQPz-f1YFaJnFBw','写日记','2018-08-12','12:08:35','今天还没写日记，等会儿去着写，今天妈妈要回厦门了'),(61,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','照顾外公','2018-08-12','18:08:36','今天妈妈和阿姨回去了，家里又zh只剩下我和姨丈和外公，人由多变少的冷清真的很难受。'),(62,'ovMv05eyuX8nzFQPz-f1YFaJnFBw','清晨一杯水','2018-08-12','19:08:08',''),(63,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早睡','2018-08-13','14:08:22',''),(65,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早睡','2018-08-14','17:08:56','没风扇好热'),(66,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','照顾外公','2018-08-15','11:08:40',''),(69,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早睡','2018-08-15','16:08:45',''),(71,'ovMv05dKQe3Ip0rdZuijxNRyFDm8','早睡','2018-08-16','07:08:06',''),(72,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','2018-08-16','07:08:40','今天六点多起的，一只母鸡不知道为什么叫得相当凄惨，把我凄惨醒了。'),(73,'ovMv05dKQe3Ip0rdZuijxNRyFDm8','清晨一杯水','2018-08-16','09:08:55',''),(74,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','照顾外公','2018-08-16','10:08:57','外公今天又跟我不耐烦，说，“这药有啥好吃的”，我很生气，刚好阿姨来了，我跟阿姨说以后她叫外公吃药，我不管了。'),(75,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早睡','2018-08-16','10:08:01','昨天和小宇去唱歌，今天早上六点多起的。'),(76,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早睡','2018-08-16','10:08:01','昨天和小宇去唱歌，今天早上六点多起的。'),(77,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','遛狗一小时','2018-08-16','10:08:25','不知道al想我了没'),(78,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','2018-08-16','10:08:01',''),(79,'ovMv05aNpgwDcJd4PEqfBfVtA3cU','清晨一杯水','2018-08-16','16:08:49','不仅喝一杯，我喝了好多杯，今天喝了六杯。'),(80,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','2018-08-16','16:08:36',''),(81,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','2018-08-17','06:08:19','又是一个被公鸡叫醒的早晨'),(82,'ovMv05dKQe3Ip0rdZuijxNRyFDm8','清晨一杯水','2018-08-17','08:08:06',''),(83,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','照顾外公','2018-08-17','14:08:44','今天仍旧不给外公喂药，让丽慧阿姨喂去。有女儿有儿子在，我这个外孙女，可以走了吧。反正他也不想让我管。');
/*!40000 ALTER TABLE `topic_check` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topic_url`
--

DROP TABLE IF EXISTS `topic_url`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `topic_url` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topic_url`
--

LOCK TABLES `topic_url` WRITE;
/*!40000 ALTER TABLE `topic_url` DISABLE KEYS */;
INSERT INTO `topic_url` VALUES (1,'http://pcjzq4ixp.bkt.clouddn.com/topic/cake.png',''),(2,'http://pcjzq4ixp.bkt.clouddn.com/topic/camera.png',''),(3,'http://pcjzq4ixp.bkt.clouddn.com/topic/cat.png',''),(4,'http://pcjzq4ixp.bkt.clouddn.com/topic/chizaocan.png',''),(5,'http://pcjzq4ixp.bkt.clouddn.com/topic/dog.png',''),(6,'http://pcjzq4ixp.bkt.clouddn.com/topic/feedback.png',''),(7,'http://pcjzq4ixp.bkt.clouddn.com/topic/fuqi.png',''),(8,'http://pcjzq4ixp.bkt.clouddn.com/topic/guozhi.png',''),(9,'http://pcjzq4ixp.bkt.clouddn.com/topic/huatong.png',''),(10,'http://pcjzq4ixp.bkt.clouddn.com/topic/jianfei.png',''),(11,'http://pcjzq4ixp.bkt.clouddn.com/topic/jianshen.png',''),(12,'http://pcjzq4ixp.bkt.clouddn.com/topic/medicine.png',''),(13,'http://pcjzq4ixp.bkt.clouddn.com/topic/paobu.png',''),(14,'http://pcjzq4ixp.bkt.clouddn.com/topic/qingchenyibeishui.png',''),(15,'http://pcjzq4ixp.bkt.clouddn.com/topic/saozhou.png',''),(18,'http://pcjzq4ixp.bkt.clouddn.com/topic/shufa.png',''),(20,'http://pcjzq4ixp.bkt.clouddn.com/topic/yijianfankui.png',''),(21,'http://pcjzq4ixp.bkt.clouddn.com/topic/yuedu.png',''),(22,'http://pcjzq4ixp.bkt.clouddn.com/topic/zaoqi.png',''),(23,'http://pcjzq4ixp.bkt.clouddn.com/topic/zaoshui.png',''),(24,'http://pcjzq4ixp.bkt.clouddn.com/topic/zixingche.png',''),(26,'http://pcjzq4ixp.bkt.clouddn.com/topic/rili.png',''),(28,'http://pcjzq4ixp.bkt.clouddn.com/topic/baobiao.png',''),(29,'http://pcjzq4ixp.bkt.clouddn.com/topic/lanqiu.png',''),(30,'http://pcjzq4ixp.bkt.clouddn.com/topic/pingpangqiu.png',''),(31,'http://pcjzq4ixp.bkt.clouddn.com/topic/yumaoqiu.png',''),(32,'http://pcjzq4ixp.bkt.clouddn.com/topic/zhijiayou.png',''),(33,'http://pcjzq4ixp.bkt.clouddn.com/topic/shuzi.png',''),(34,'http://pcjzq4ixp.bkt.clouddn.com/topic/wangqiu.png',''),(36,'http://pcjzq4ixp.bkt.clouddn.com/topic/wx51edf73b7674cbc5.o6zAJs40klsntv7KRAnRsSZl6UWI.rQglGzwuGbKwa1fa7a8ec2a9ecbe50b55633492ad4dd','ovMv05WNSF-fzJnoQ4UMSWtMWjFs'),(37,'http://pcjzq4ixp.bkt.clouddn.com/topic/wx51edf73b7674cbc5.o6zAJs40klsntv7KRAnRsSZl6UWI.nrMc3s9YSwmj3726dfeddd37d0d82db01bf9f4f24422','ovMv05WNSF-fzJnoQ4UMSWtMWjFs'),(38,'http://pcjzq4ixp.bkt.clouddn.com/topic/ile://tmp_8c3c0848ad919b8b96569126660f5041','ovMv05WNSF-fzJnoQ4UMSWtMWjFs'),(39,'http://pcjzq4ixp.bkt.clouddn.com/topic/wx51edf73b7674cbc5.o6zAJs40klsntv7KRAnRsSZl6UWI.YAcf8TW5EQxg82d0c1ec8f03a76ac284d0e6f6b45a2a','ovMv05WNSF-fzJnoQ4UMSWtMWjFs'),(40,'http://pcjzq4ixp.bkt.clouddn.com/topic/fasheng.png',''),(42,'http://pcjzq4ixp.bkt.clouddn.com/topic/xuexi.png',''),(43,'http://pcjzq4ixp.bkt.clouddn.com/topic/yinzhang.png',''),(44,'http://pcjzq4ixp.bkt.clouddn.com/topic/tuding.png',''),(45,'http://pcjzq4ixp.bkt.clouddn.com/topic/jiandao.png',''),(46,'http://pcjzq4ixp.bkt.clouddn.com/topic/yingwen.png',''),(47,'http://pcjzq4ixp.bkt.clouddn.com/topic/qianbi.png',''),(48,'http://pcjzq4ixp.bkt.clouddn.com/topic/aixin.png',''),(49,'http://pcjzq4ixp.bkt.clouddn.com/topic/gongji.png',''),(50,'http://pcjzq4ixp.bkt.clouddn.com/topic/bijiben.png',''),(51,'http://pcjzq4ixp.bkt.clouddn.com/topic/shuohua.png',''),(52,'http://pcjzq4ixp.bkt.clouddn.com/topic/yinger.png',''),(53,'http://pcjzq4ixp.bkt.clouddn.com/topic/nainai.png',''),(54,'http://pcjzq4ixp.bkt.clouddn.com/topic/gongsi.png',''),(55,'http://pcjzq4ixp.bkt.clouddn.com/topic/fuqin.png',''),(56,'http://pcjzq4ixp.bkt.clouddn.com/topic/mama.png',''),(57,'http://pcjzq4ixp.bkt.clouddn.com/topic/shangke.png',''),(58,'http://pcjzq4ixp.bkt.clouddn.com/topic/fo.png','');
/*!40000 ALTER TABLE `topic_url` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_id` varchar(255) NOT NULL,
  `user_name` varchar(255) DEFAULT '',
  `avatar_url` varchar(255) DEFAULT '',
  `country` varchar(255) DEFAULT '',
  `province` varchar(255) DEFAULT '',
  `city` varchar(255) DEFAULT '',
  `county` varchar(255) DEFAULT '',
  `gender` int(11) DEFAULT '-1' COMMENT '0代表男，1代表女',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_delete` int(11) DEFAULT '0',
  `timezone` int(11) DEFAULT '0' COMMENT '代表与0时区的差值，东边为负，西边为正',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('ovMv05aNpgwDcJd4PEqfBfVtA3cU','','','','北京市','市辖区','海淀区',0,'2018-08-16 08:22:12','2018-08-16 08:29:16',0,480),('ovMv05dKQe3Ip0rdZuijxNRyFDm8','','','','北京市','市辖区','东城区',-1,'2018-08-13 06:50:04','2018-08-16 01:07:27',0,480),('ovMv05e-qUXZqYwbDfIdWFm8qLpI','','','','北京市','市辖区','海淀区',1,'2018-08-16 09:16:13','2018-08-16 23:48:54',0,480),('ovMv05eyuX8nzFQPz-f1YFaJnFBw','','http://pcjzq4ixp.bkt.clouddn.com/avatar/ile://tmp_8d320af6790787b3ac88a070cecd7e79?imageView2/1/w/90/h/90/q/75|imageslim','','','','',-1,'2018-08-03 11:58:49','2018-08-14 12:34:19',0,480),('ovMv05RhfAx0CxrdXjgr429o4OiY','','','','','','',-1,'2018-08-11 04:23:40','2018-08-16 08:15:50',0,480),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','小静','http://pcjzq4ixp.bkt.clouddn.com/avatar/ile://tmp_58c8bc18f0a7108873715c6d15247719?imageView2/1/w/90/h/90/q/75|imageslim','','福建省','厦门市','思明区',1,'2018-08-02 07:29:40','2018-08-17 06:19:24',0,480);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_message`
--

DROP TABLE IF EXISTS `user_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_message` (
  `user_id` varchar(255) NOT NULL,
  `topic_list` varchar(255) DEFAULT '',
  `remind_time` varchar(100) DEFAULT '',
  `form_id_list` longtext,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_message`
--

LOCK TABLES `user_message` WRITE;
/*!40000 ALTER TABLE `user_message` DISABLE KEYS */;
INSERT INTO `user_message` VALUES ('ovMv05aNpgwDcJd4PEqfBfVtA3cU','','08:00','1534408147024,1534408155346,1534408179578,1534408202854,1534408330810,1534408449612,1534409594174,1534409598904,1534410332678,1534411229617,','2018-08-17 03:57:06'),('ovMv05dKQe3Ip0rdZuijxNRyFDm8','早睡,清晨一杯水','08:00','1534381574883,1534381579650,1534381579808,1534381579966,1534381580107,1534381580267,1534381580435,1534381580592,1534381580758,1534381580935,1534381581094,1534381581281,1534381581444,1534381581568,1534381585955,1534381586131,1534381586290,1534381586474,1534381586642,1534381586816,1534381586951,1534381587101,1534381646266,1534381648741,1534386372946,1534386373123,1534386373297,1534386373472,1534386373649,1534386373807,1534386373957,1534386374149,1534386374325,1534386374508,1534386374669,1534386374841,1534386375026,1534386375202,1534386375377,1534386375553,1534386375748,1534386375927,1534386376096,1534386376255,1534386376412,1534386376579,1534386376740,1534386376924,1534386377138,1534386377314,1534386377483,1534386385028,1534386385178,1534386385346,1534386385502,1534386385671,1534386385829,1534386386231,1534386386373,1534386386507,1534386386631,1534386386758,1534386386899,1534386387040,1534386387191,1534386387340,1534386387500,1534386387651,1534386387793,1534386387968,1534386388136,1534386388294,1534386388445,1534386388586,1534386388752,1534386388912,1534386389072,1534386389378,1534416477534,1534416482733,1534416492747,1534416498250,1534416507533,1534416510932,1534464305053,','2018-08-17 03:57:06'),('ovMv05e-qUXZqYwbDfIdWFm8qLpI','','08:30','c924f895d041c2b11a77c3712e252975,8f6223af5f101ab3c9d30a8cdc5c0666,aa439fa7df9fc9fb3cf34b4c81c1635f,9e65d7a789dd43329f70c3aac500b27d,cd740433b58f5b7bf03f1edcbce8b37d,7d2a1b0574c26546fb9a6ca9067df8de,','2018-08-17 03:57:06'),('ovMv05RhfAx0CxrdXjgr429o4OiY','','','1534407394710,1534407483350,1534407526317,1534407540634,1534408226153,1534408339178,1534408366162,1534408374639,1534408381003,1534408383352,1534408389607,','2018-08-16 08:33:21'),('ovMv05WNSF-fzJnoQ4UMSWtMWjFs','','08:00','96631a90fc3ac5975e25909b85ffa1ba,660b56ed5a15533d7e0d2dc679a63046,992d317fe195e14bea610abb6476169e,436310afa5e81dc5d92650f7416ea591,b96be964e0c129696ce68a27068f6250,1d03c229d25fc1fe0521172a5dc62771,406e628c7e2d89fc6a1da143af25eec1,8907f218d808c57155d016fd878588a0,3dbfd9d5c811ae6c2d3d7b372b4f7139,66f9235ba0bd7acbd1413b002618cde3,a631d146b403bebcb8d665bce3a2c7b9,574c18064ebffa88a194c593864040ec,b6a7b7053e5db300b6a22f82a163c434,89690dc8473c643afcb3c6869a569d7a,853f1b1de97eb2a284ecdbc6f6af380f,8d6231db18721f47a579eb98b1ac2450,e3d3149e861de9ce31de8f36df5739c0,537691c7bc90b2ada0bdab8e175446ec,4c45e150c3c8faa268c4161b444a0531,1919b78b31b255c8d1d899a0584cc682,9e72b143133b91f3080e127ff803426b,3076302a775db03cce33db76d6e50191,9ff239af24efbea2b1516dc9fe20a127,c4196d56855900fc524251c13774da63,b6edcdf39bc1d61b830a7fcb6a12e680,be9a8d9ee7795cd6c6c3f2e016130814,bc89adcae1a5ee668928970aaad59924,2c917b60b2316f486d18ae4d0a342555,cb4c66a97df2c25dd60de78027985f4b,5f408200bd6e595ab4e322925069ea48,05a543d0f239e1483f5497776891e9e8,a4cace945c4c8f4152a4e4432ec61c17,13b3751b97b8d74767fa9757a986ef16,40914e5fd12a4b21b4db85dee8dc1c31,9a686e7cbe6860106062845bef32b7c8,6676bfcb57ef3aa3253a0ee1dfe5d900,e5d2b390ae33872fed6305dc0650beda,dfa3a4aa9d79ed37d803a84e4849fd52,23febc399a3667886d31b7b41b725a27,23d664b12fa1b7798260bdad3e7b5309,99c34eae680f188ed94382dd42d7732d,68c3ed945a9a32a218d2828bb2c26a71,a6c17b6c193062e9e30047313108d9ec,b48cd09105d4e9b4094cb79e0cd22429,a9377d37b37cd98cfa8d5e1b0c3796d8,750e17a74de9b8d88d372b366c303cf0,4f47e6a5b9f9a4b663f572b35cde1eab,4a425447b767a10fd9b2eeb0b38e18ed,dd698291431f3d1507849f81a36867b7,4bce6d23fd2473d6a2d1b429b3b7266b,c09518aa7a82e1e5c4595e07d9e97dea,5de75c00fd3245c7764c74d82770c87d,0527cd3ebd49778a645f63e25c2de081,1620e0abc7b0e363f3359de0a8351a9f,560e82f34c7bcf638687d09a9226db79,3b064dfaec1c390d99797b6b14b39eca,6f5015eb8b334da9cefe7b527897e5a5,d1811361fdd62d5019e448add8a4803e,6abf55b95ac314f0cc1363640a76f5f8,64ed948f7b09609aff1c257e9ac4a7c9,a7837fd50e5663bf198910e4f22d58fd,821e15a5ed8c61deb9b54c3e3aaf946e,c925a3b776356a2b3f2a444502fb282c,1ab70b6174462b6094d9dae0344dd58f,b40f61f4b30479e8615fea137c55b7a6,96e0bf545999bfc53899a09479b692b6c4c8d602b9565da2bdd9cf0c123d4fcd,69b929b1450ea5440d8bf0a62795bfb4,8981882f7602e185fd5b96e204345abc,856137652f5cb0e3abef23bf3ecf2e31,4496484d22c67a3c4a5cdb5c8cf7da8a,bba941fe987ce7359d976d2710a13101,8b0a8da943a7df3ba6a688f94ab87f9a,60b4656529174128da083aa9e90752ca,c9d91510c7726b77982884991d7586f5,3150729d5c0365c3f3c5df6ced458c38,d4afaa6b5718254037177e10c843fa61,572c127a9ff622cbc18c581880d9b502,e869741ccbf436cc5ef8a659dd63158e,84aaf4a06f30b820f5d54b99eaf3e085,eba86b306c9b5e68d9ecd39f94360e2c,09e3b59b059f0234c42ec5c727996edd,bce6e7e752e486a438fb890a83044705,348478004134ea0cb7149cca0829a8fd,49c150d5ff3c9792fb1d565a02580540,4dca4c3389f452f0f52e70c6ede86734,8868ba546496c4d3d7721d75adcee95c,6b33b7d55ef75b1818cbda90ae2b7190,b30ede6defd4b74bd3c1412d1f6eb5f6,45dfd1abf38b31f24202b81a2c054104,1c7ed8f60b2a43d69f6cbf757518acd5,7ff1de41a67ec3a96ab35005c56a4471,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,the formId is a mock one,','2018-08-17 07:05:04');
/*!40000 ALTER TABLE `user_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_topic`
--

DROP TABLE IF EXISTS `user_topic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_topic` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL COMMENT '打卡用户id：open_id，微信用户唯一标识',
  `topic_name` varchar(255) NOT NULL,
  `topic_url` varchar(255) DEFAULT '',
  `insist_day` int(255) DEFAULT '0' COMMENT '连续坚持的天数',
  `total_day` int(255) DEFAULT '0' COMMENT '总共坚持的天数',
  `start_date` varchar(255) DEFAULT '',
  `end_date` varchar(255) DEFAULT '',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_check_time` varchar(255) DEFAULT '',
  `if_show_log` int(255) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_topic` (`user_id`,`topic_name`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_topic`
--

LOCK TABLES `user_topic` WRITE;
/*!40000 ALTER TABLE `user_topic` DISABLE KEYS */;
INSERT INTO `user_topic` VALUES (73,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','写五个自己的优点','http://pcjzq4ixp.bkt.clouddn.com/topic/wx51edf73b7674cbc5.o6zAJs40klsntv7KRAnRsSZl6UWI.rQglGzwuGbKwa1fa7a8ec2a9ecbe50b55633492ad4dd',1,5,'2018-08-01','2018-10-12','2018-08-03 06:37:53','2018-08-16',0),(74,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','遛狗一小时','http://pcjzq4ixp.bkt.clouddn.com/topic/dog.png',1,4,'2018-07-31','永不结束','2018-08-03 13:14:07','2018-08-16',1),(82,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早睡','http://pcjzq4ixp.bkt.clouddn.com/topic/zaoshui.png',4,7,'2018-08-06','永不结束','2018-08-04 05:04:03','2018-08-16',1),(84,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','照顾外公','http://pcjzq4ixp.bkt.clouddn.com/topic/ile://tmp_8c3c0848ad919b8b96569126660f5041',3,6,'2018-08-05','2019-11-19','2018-08-05 13:44:02','2018-08-17',1),(99,'ovMv05RhfAx0CxrdXjgr429o4OiY','遛狗','http://pcjzq4ixp.bkt.clouddn.com/topic/dog.png',0,0,'2018-08-11','永不结束','2018-08-11 04:34:50','',1),(100,'ovMv05eyuX8nzFQPz-f1YFaJnFBw','写日记','http://pcjzq4ixp.bkt.clouddn.com/topic/yijianfankui.png',1,1,'2018-08-11','永不结束','2018-08-11 04:35:57','2018-08-12',1),(101,'ovMv05eyuX8nzFQPz-f1YFaJnFBw','早起','http://pcjzq4ixp.bkt.clouddn.com/topic/zaoqi.png',0,0,'2018-08-12','永不结束','2018-08-12 11:13:42','',1),(102,'ovMv05eyuX8nzFQPz-f1YFaJnFBw','清晨一杯水','http://pcjzq4ixp.bkt.clouddn.com/topic/qingchenyibeishui.png',1,1,'2018-08-12','永不结束','2018-08-12 11:14:47','2018-08-12',1),(103,'ovMv05eyuX8nzFQPz-f1YFaJnFBw','减肥','http://pcjzq4ixp.bkt.clouddn.com/topic/jianfei.png',0,0,'2018-08-12','永不结束','2018-08-12 11:15:52','',1),(104,'ovMv05eyuX8nzFQPz-f1YFaJnFBw','跑步','http://pcjzq4ixp.bkt.clouddn.com/topic/paobu.png',0,0,'2018-08-12','永不结束','2018-08-12 11:17:01','',1),(106,'ovMv05eyuX8nzFQPz-f1YFaJnFBw','空中自行车五分钟','http://pcjzq4ixp.bkt.clouddn.com/topic/zixingche.png',0,0,'2018-08-12','永不结束','2018-08-12 11:17:49','',1),(112,'ovMv05dKQe3Ip0rdZuijxNRyFDm8','早睡','http://pcjzq4ixp.bkt.clouddn.com/topic/zaoshui.png',1,1,'2018-08-15','永不结束','2018-08-15 02:46:41','2018-08-16',1),(118,'ovMv05dKQe3Ip0rdZuijxNRyFDm8','清晨一杯水','http://pcjzq4ixp.bkt.clouddn.com/topic/qingchenyibeishui.png',2,2,'2018-08-16','永不结束','2018-08-15 23:17:22','2018-08-17',1),(119,'ovMv05WNSF-fzJnoQ4UMSWtMWjFs','早起','http://pcjzq4ixp.bkt.clouddn.com/topic/zaoqi.png',2,2,'2018-08-16','永不结束','2018-08-15 23:17:54','2018-08-17',1),(120,'ovMv05RhfAx0CxrdXjgr429o4OiY','唱歌','http://pcjzq4ixp.bkt.clouddn.com/topic/huatong.png',0,0,'2018-08-16','永不结束','2018-08-16 08:16:00','',1),(121,'ovMv05RhfAx0CxrdXjgr429o4OiY','吃早餐','http://pcjzq4ixp.bkt.clouddn.com/topic/chizaocan.png',0,0,'2018-08-16','永不结束','2018-08-16 08:16:16','',1),(122,'ovMv05RhfAx0CxrdXjgr429o4OiY','清晨一杯水','http://pcjzq4ixp.bkt.clouddn.com/topic/qingchenyibeishui.png',0,0,'2018-08-16','永不结束','2018-08-16 08:16:30','',1),(123,'ovMv05RhfAx0CxrdXjgr429o4OiY','早起','http://pcjzq4ixp.bkt.clouddn.com/topic/zaoqi.png',0,0,'2018-08-16','永不结束','2018-08-16 08:16:50','',1),(124,'ovMv05RhfAx0CxrdXjgr429o4OiY','减肥','http://pcjzq4ixp.bkt.clouddn.com/topic/jianfei.png',0,0,'2018-08-16','永不结束','2018-08-16 08:17:00','',1),(125,'ovMv05RhfAx0CxrdXjgr429o4OiY','带狗狗散步','http://pcjzq4ixp.bkt.clouddn.com/topic/dog.png',0,0,'2018-08-16','永不结束','2018-08-16 08:17:12','',1),(126,'ovMv05RhfAx0CxrdXjgr429o4OiY','跑步','http://pcjzq4ixp.bkt.clouddn.com/topic/paobu.png',0,0,'2018-08-16','永不结束','2018-08-16 08:17:23','',1),(127,'ovMv05RhfAx0CxrdXjgr429o4OiY','早睡','http://pcjzq4ixp.bkt.clouddn.com/topic/zaoshui.png',0,0,'2018-08-16','永不结束','2018-08-16 08:17:36','',1),(128,'ovMv05RhfAx0CxrdXjgr429o4OiY','空中自行车五分钟','http://pcjzq4ixp.bkt.clouddn.com/topic/zixingche.png',0,0,'2018-08-16','永不结束','2018-08-16 08:17:50','',1),(131,'ovMv05aNpgwDcJd4PEqfBfVtA3cU','跑步','http://pcjzq4ixp.bkt.clouddn.com/topic/paobu.png',1,1,'2018-08-16','永不结束','2018-08-16 08:22:55','2018-08-16',1),(132,'ovMv05aNpgwDcJd4PEqfBfVtA3cU','清晨一杯水','http://pcjzq4ixp.bkt.clouddn.com/topic/qingchenyibeishui.png',1,1,'2018-08-16','永不结束','2018-08-16 08:34:07','2018-08-16',1),(133,'ovMv05e-qUXZqYwbDfIdWFm8qLpI','早睡','http://pcjzq4ixp.bkt.clouddn.com/topic/zaoshui.png',0,0,'2018-08-16','永不结束','2018-08-16 09:16:30','',1),(134,'ovMv05e-qUXZqYwbDfIdWFm8qLpI','练字','http://pcjzq4ixp.bkt.clouddn.com/topic/qianbi.png',0,0,'2018-08-16','永不结束','2018-08-16 13:51:35','',1);
/*!40000 ALTER TABLE `user_topic` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-08-17 15:09:22
