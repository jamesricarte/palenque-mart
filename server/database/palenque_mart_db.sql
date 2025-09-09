CREATE DATABASE  IF NOT EXISTS `palenque_mart_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `palenque_mart_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: palenque_mart_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bargain_offers`
--

DROP TABLE IF EXISTS `bargain_offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bargain_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `conversation_id` int NOT NULL,
  `product_id` int NOT NULL,
  `original_price` decimal(10,2) NOT NULL,
  `offered_price` decimal(10,2) NOT NULL,
  `current_price` decimal(10,2) NOT NULL,
  `offer_type` enum('initial_offer','counteroffer') NOT NULL,
  `status` enum('pending','accepted','rejected','responded','expired','withdrawn') DEFAULT 'pending',
  `is_final_offer` tinyint(1) DEFAULT '0',
  `offered_by_type` enum('user','seller') NOT NULL,
  `offered_by_id` int NOT NULL,
  `parent_offer_id` int DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_message_id` (`message_id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`),
  KEY `idx_offered_by` (`offered_by_type`,`offered_by_id`),
  KEY `idx_parent_offer_id` (`parent_offer_id`),
  CONSTRAINT `fk_bargain_offers_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bargain_offers_message` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bargain_offers_parent` FOREIGN KEY (`parent_offer_id`) REFERENCES `bargain_offers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bargain_offers_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bargain_offers`
--

LOCK TABLES `bargain_offers` WRITE;
/*!40000 ALTER TABLE `bargain_offers` DISABLE KEYS */;
INSERT INTO `bargain_offers` VALUES (1,1,1,5,140.00,120.00,120.00,'initial_offer','responded',0,'user',4,NULL,'2025-09-04 00:17:09','2025-09-03 08:18:27','2025-09-03 08:17:09','2025-09-03 08:18:27'),(2,2,1,5,140.00,115.00,115.00,'counteroffer','responded',0,'seller',2,1,'2025-09-04 00:18:27','2025-09-03 08:18:45','2025-09-03 08:18:27','2025-09-03 08:18:45'),(3,3,1,5,140.00,112.00,112.00,'counteroffer','responded',0,'user',4,2,'2025-09-04 00:18:46','2025-09-03 08:18:59','2025-09-03 08:18:45','2025-09-03 08:18:59'),(4,4,1,5,140.00,112.00,112.00,'counteroffer','accepted',0,'seller',2,3,NULL,'2025-09-03 08:18:59','2025-09-03 08:18:59','2025-09-03 08:18:59'),(5,5,2,5,140.00,115.00,115.00,'initial_offer','pending',0,'user',3,NULL,'2025-09-04 17:57:51',NULL,'2025-09-04 01:57:51','2025-09-04 01:57:51'),(6,6,1,3,220.00,210.00,210.00,'initial_offer','responded',0,'user',4,NULL,'2025-09-04 20:20:18','2025-09-04 04:24:03','2025-09-04 04:20:17','2025-09-04 04:24:03'),(7,8,1,3,220.00,215.00,215.00,'counteroffer','responded',0,'seller',2,6,'2025-09-04 20:24:04','2025-09-04 04:24:36','2025-09-04 04:24:03','2025-09-04 04:24:36'),(8,9,1,3,220.00,110.00,110.00,'counteroffer','responded',0,'user',4,7,'2025-09-04 20:24:37','2025-09-04 04:27:55','2025-09-04 04:24:36','2025-09-04 04:27:55'),(9,10,1,3,220.00,110.00,110.00,'counteroffer','accepted',0,'seller',2,8,NULL,'2025-09-04 04:27:55','2025-09-04 04:27:55','2025-09-04 04:27:55'),(10,11,1,5,140.00,120.00,120.00,'initial_offer','responded',0,'user',4,NULL,'2025-09-04 21:43:54','2025-09-04 05:44:25','2025-09-04 05:43:53','2025-09-04 05:44:25'),(11,12,1,5,140.00,120.00,120.00,'counteroffer','accepted',0,'seller',2,10,NULL,'2025-09-04 05:44:25','2025-09-04 05:44:25','2025-09-04 05:44:25'),(12,13,1,4,60.00,40.00,40.00,'initial_offer','responded',0,'user',4,NULL,'2025-09-04 21:44:54','2025-09-04 05:45:13','2025-09-04 05:44:54','2025-09-04 05:45:13'),(13,14,1,4,60.00,40.00,40.00,'counteroffer','accepted',0,'seller',2,12,NULL,'2025-09-04 05:45:13','2025-09-04 05:45:13','2025-09-04 05:45:13'),(14,15,1,5,140.00,120.00,120.00,'initial_offer','responded',0,'user',4,NULL,'2025-09-05 21:46:05','2025-09-05 05:48:19','2025-09-05 05:46:04','2025-09-05 05:48:19'),(15,16,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,14,'2025-09-05 21:48:19','2025-09-05 06:10:34','2025-09-05 05:48:19','2025-09-05 06:10:34'),(16,17,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,15,'2025-09-05 22:10:34','2025-09-05 06:11:45','2025-09-05 06:10:34','2025-09-05 06:11:45'),(17,18,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,16,'2025-09-05 22:11:45','2025-09-05 06:13:15','2025-09-05 06:11:45','2025-09-05 06:13:15'),(18,19,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,17,'2025-09-05 22:13:16','2025-09-05 06:25:37','2025-09-05 06:13:15','2025-09-05 06:25:37'),(19,20,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,18,'2025-09-05 22:25:37','2025-09-05 06:27:59','2025-09-05 06:25:37','2025-09-05 06:27:59'),(20,21,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,19,'2025-09-05 22:27:59','2025-09-05 06:29:42','2025-09-05 06:27:59','2025-09-05 06:29:42'),(21,22,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,20,'2025-09-05 22:29:43','2025-09-05 06:31:08','2025-09-05 06:29:42','2025-09-05 06:31:08'),(22,23,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,21,'2025-09-05 22:31:09','2025-09-05 06:35:14','2025-09-05 06:31:08','2025-09-05 06:35:14'),(23,24,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,22,'2025-09-05 22:35:14','2025-09-05 06:36:16','2025-09-05 06:35:14','2025-09-05 06:36:16'),(24,25,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,23,'2025-09-05 22:36:17','2025-09-05 06:39:46','2025-09-05 06:36:16','2025-09-05 06:39:46'),(25,26,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,24,'2025-09-05 22:39:46','2025-09-05 06:42:44','2025-09-05 06:39:46','2025-09-05 06:42:44'),(26,27,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,25,'2025-09-05 22:42:45','2025-09-05 06:43:45','2025-09-05 06:42:45','2025-09-05 06:43:45'),(27,28,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,26,'2025-09-05 22:43:46','2025-09-05 06:46:48','2025-09-05 06:43:45','2025-09-05 06:46:48'),(28,29,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,27,'2025-09-05 22:46:48','2025-09-05 06:48:03','2025-09-05 06:46:48','2025-09-05 06:48:03'),(29,30,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,28,'2025-09-05 22:48:03','2025-09-05 06:49:45','2025-09-05 06:48:03','2025-09-05 06:49:45'),(30,31,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,29,'2025-09-05 22:49:46','2025-09-05 06:50:55','2025-09-05 06:49:45','2025-09-05 06:50:55'),(31,32,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,30,'2025-09-05 22:50:56','2025-09-05 06:51:11','2025-09-05 06:50:55','2025-09-05 06:51:11'),(32,33,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,31,'2025-09-05 22:51:11','2025-09-05 06:51:29','2025-09-05 06:51:11','2025-09-05 06:51:29'),(33,34,1,5,140.00,130.00,130.00,'counteroffer','responded',0,'seller',2,32,'2025-09-05 22:51:30','2025-09-05 06:51:44','2025-09-05 06:51:29','2025-09-05 06:51:44'),(34,35,1,5,140.00,125.00,125.00,'counteroffer','responded',0,'user',4,33,'2025-09-05 22:51:45','2025-09-05 06:51:53','2025-09-05 06:51:44','2025-09-05 06:51:53'),(35,36,1,5,140.00,125.00,125.00,'counteroffer','accepted',0,'seller',2,34,NULL,'2025-09-05 06:51:53','2025-09-05 06:51:53','2025-09-05 06:51:53'),(36,37,1,2,120.00,110.00,110.00,'initial_offer','responded',0,'user',4,NULL,'2025-09-05 22:52:59','2025-09-05 06:53:18','2025-09-05 06:52:58','2025-09-05 06:53:18'),(37,38,1,2,120.00,110.00,110.00,'counteroffer','rejected',0,'seller',2,36,NULL,'2025-09-05 06:53:18','2025-09-05 06:53:18','2025-09-05 06:53:18'),(38,39,1,2,120.00,110.00,110.00,'initial_offer','responded',0,'user',4,NULL,'2025-09-05 22:53:38','2025-09-05 06:54:03','2025-09-05 06:53:38','2025-09-05 06:54:03'),(39,40,1,2,120.00,115.00,115.00,'counteroffer','accepted',0,'seller',2,38,'2025-09-05 22:54:04','2025-09-05 06:54:10','2025-09-05 06:54:03','2025-09-05 06:54:10'),(40,41,1,1,120.00,110.00,110.00,'initial_offer','pending',0,'user',4,NULL,'2025-09-05 22:56:38',NULL,'2025-09-05 06:56:38','2025-09-05 06:56:38'),(41,44,1,6,300.00,280.00,280.00,'initial_offer','responded',0,'user',4,NULL,'2025-09-09 00:56:52','2025-09-08 09:11:20','2025-09-08 08:56:52','2025-09-08 09:11:20'),(42,45,1,6,300.00,290.00,290.00,'counteroffer','pending',1,'seller',2,41,'2025-09-09 01:11:21',NULL,'2025-09-08 09:11:20','2025-09-08 09:11:20'),(43,49,3,8,280.00,215.00,215.00,'initial_offer','responded',0,'user',4,NULL,'2025-09-09 23:05:22','2025-09-09 07:08:38','2025-09-09 07:05:22','2025-09-09 07:08:38'),(44,50,3,8,280.00,250.00,250.00,'counteroffer','pending',1,'seller',5,43,'2025-09-09 23:08:38',NULL,'2025-09-09 07:08:38','2025-09-09 07:08:38'),(45,51,1,2,120.00,100.00,100.00,'initial_offer','pending',0,'user',4,NULL,'2025-09-10 04:52:58',NULL,'2025-09-09 12:52:57','2025-09-09 12:52:57');
/*!40000 ALTER TABLE `bargain_offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bargain_offer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_bargain_offer_id` (`bargain_offer_id`),
  CONSTRAINT `fk_cart_bargain_offer` FOREIGN KEY (`bargain_offer_id`) REFERENCES `bargain_offers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (28,3,4,1,'2025-09-04 02:01:07','2025-09-04 02:01:07',NULL);
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `seller_id` int NOT NULL,
  `last_message_id` int DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `user_unread_count` int DEFAULT '0',
  `seller_unread_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_seller` (`user_id`,`seller_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_last_message_at` (`last_message_at`),
  KEY `idx_is_active` (`is_active`),
  KEY `fk_conversations_last_message` (`last_message_id`),
  KEY `idx_conversations_user_updated` (`user_id`,`updated_at` DESC),
  KEY `idx_conversations_seller_updated` (`seller_id`,`updated_at` DESC),
  CONSTRAINT `fk_conversations_last_message` FOREIGN KEY (`last_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_conversations_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,4,1,51,'2025-09-09 12:52:58',0,1,1,'2025-09-03 08:15:33','2025-09-09 12:52:58'),(2,3,1,5,'2025-09-04 01:57:51',0,0,1,'2025-09-04 01:57:51','2025-09-04 05:46:28'),(3,4,2,50,'2025-09-09 07:08:38',0,0,1,'2025-09-09 07:05:21','2025-09-09 07:08:45');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_assignments`
--

DROP TABLE IF EXISTS `delivery_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `delivery_partner_id` int DEFAULT NULL,
  `status` enum('looking_for_rider','rider_assigned','picked_up','delivered','cancelled') DEFAULT 'looking_for_rider',
  `assigned_at` timestamp NULL DEFAULT NULL,
  `pickup_time` timestamp NULL DEFAULT NULL,
  `delivery_time` timestamp NULL DEFAULT NULL,
  `estimated_delivery_time` timestamp NULL DEFAULT NULL,
  `delivery_fee` decimal(10,2) DEFAULT '0.00',
  `pickup_address` text,
  `delivery_address` text,
  `special_instructions` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_delivery_partner_id` (`delivery_partner_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_assignments`
--

LOCK TABLES `delivery_assignments` WRITE;
/*!40000 ALTER TABLE `delivery_assignments` DISABLE KEYS */;
INSERT INTO `delivery_assignments` VALUES (1,1,1,'delivered','2025-08-27 11:43:38','2025-08-27 11:43:55','2025-08-27 11:44:06',NULL,50.00,'Karangahan Boulevard, Bangkilingan, Tabaco, Albay 4511, Near Melgar Bakery','5 Tomas Cabiles Street, San Juan, Tabaco, Albay 4511',NULL,'2025-08-27 11:43:29','2025-08-27 11:44:06'),(2,2,1,'delivered','2025-08-27 11:51:31','2025-08-27 11:51:37','2025-08-27 11:51:47',NULL,50.00,'Karangahan Boulevard, Bangkilingan, Tabaco, Albay 4511, Near Melgar Bakery','5 Tomas Cabiles Street, San Juan, Tabaco, Albay 4511',NULL,'2025-08-27 11:51:24','2025-08-27 11:51:47'),(3,3,1,'delivered','2025-08-28 14:47:47','2025-08-28 14:48:27','2025-08-28 14:54:19',NULL,50.00,'Karangahan Boulevard, Bangkilingan, Tabaco, Albay 4511, Near Melgar Bakery','5 Tomas Cabiles Street, San Juan, Tabaco, Albay 4511',NULL,'2025-08-28 14:46:59','2025-08-28 14:54:19'),(4,6,1,'delivered','2025-09-08 06:19:17','2025-09-08 06:19:49','2025-09-08 06:22:31',NULL,50.00,'Karangahan Boulevard, Bangkilingan, Tabaco, Albay 4511, Near Melgar Bakery','5 Tomas Cabiles Street, San Juan, Tabaco, Albay 4511',NULL,'2025-09-08 06:18:38','2025-09-08 06:22:31'),(5,8,1,'delivered','2025-09-08 09:20:25','2025-09-08 09:23:00','2025-09-08 09:25:00',NULL,50.00,'Karangahan Boulevard, Bangkilingan, Tabaco, Albay 4511, Near Melgar Bakery','5 Tomas Cabiles Street, San Juan, Tabaco, Albay 4511',NULL,'2025-09-08 09:17:58','2025-09-08 09:25:00'),(6,7,1,'delivered','2025-09-08 09:37:43','2025-09-08 14:43:56','2025-09-08 14:43:59',NULL,50.00,'Karangahan Boulevard, Bangkilingan, Tabaco, Albay 4511, Near Melgar Bakery','5 Tomas Cabiles Street, San Juan, Tabaco, Albay 4511',NULL,'2025-09-08 09:37:30','2025-09-08 14:43:59'),(7,10,1,'delivered','2025-09-09 07:13:13','2025-09-09 07:13:51','2025-09-09 07:14:00',NULL,50.00,'Ligao Road, Bangkilingan, Tabaco, Albay 4511','5 Tomas Cabiles Street, San Juan, Tabaco, Albay 4511',NULL,'2025-09-09 07:12:28','2025-09-09 07:14:00'),(8,13,1,'delivered','2025-09-09 16:58:13','2025-09-09 18:17:31','2025-09-09 18:19:03',NULL,50.00,'Karangahan Boulevard, Bangkilingan, Tabaco, Albay 4511, Near Melgar Bakery','5 Tomas Cabiles Street, San Juan, Tabaco, Albay 4511',NULL,'2025-09-09 16:57:39','2025-09-09 18:19:03'),(9,14,1,'delivered','2025-09-09 18:21:16','2025-09-09 18:21:27','2025-09-09 18:21:34',NULL,50.00,'Karangahan Boulevard, Bangkilingan, Tabaco, Albay 4511, Near Melgar Bakery','5 Tomas Cabiles Street, San Juan, Tabaco, Albay 4511',NULL,'2025-09-09 18:21:12','2025-09-09 18:21:34');
/*!40000 ALTER TABLE `delivery_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_candidates`
--

DROP TABLE IF EXISTS `delivery_candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_candidates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `delivery_partner_id` int NOT NULL,
  `distance` decimal(8,2) DEFAULT NULL,
  `status` enum('pending','accepted','declined','expired') DEFAULT 'pending',
  `notified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_assignment_partner` (`assignment_id`,`delivery_partner_id`),
  KEY `idx_assignment_id` (`assignment_id`),
  KEY `idx_delivery_partner_id` (`delivery_partner_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_delivery_candidates_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `delivery_assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_delivery_candidates_partner` FOREIGN KEY (`delivery_partner_id`) REFERENCES `delivery_partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_candidates`
--

LOCK TABLES `delivery_candidates` WRITE;
/*!40000 ALTER TABLE `delivery_candidates` DISABLE KEYS */;
INSERT INTO `delivery_candidates` VALUES (7,1,1,0.74,'accepted','2025-08-27 11:43:29','2025-08-27 11:43:38','2025-08-27 11:43:29','2025-08-27 11:43:38'),(8,2,1,0.71,'accepted','2025-08-27 11:51:25','2025-08-27 11:51:31','2025-08-27 11:51:25','2025-08-27 11:51:31'),(9,3,1,0.70,'accepted','2025-08-28 14:46:59','2025-08-28 14:47:47','2025-08-28 14:46:59','2025-08-28 14:47:47'),(10,4,1,24.39,'accepted','2025-09-08 06:18:38','2025-09-08 06:19:17','2025-09-08 06:18:38','2025-09-08 06:19:17'),(11,5,1,11136.81,'accepted','2025-09-08 09:17:58','2025-09-08 09:20:25','2025-09-08 09:17:58','2025-09-08 09:20:25'),(12,6,1,24.44,'accepted','2025-09-08 09:37:30','2025-09-08 09:37:43','2025-09-08 09:37:30','2025-09-08 09:37:43'),(13,7,1,24.31,'accepted','2025-09-09 07:12:28','2025-09-09 07:13:13','2025-09-09 07:12:28','2025-09-09 07:13:13'),(14,8,1,11136.81,'accepted','2025-09-09 16:57:39','2025-09-09 16:58:13','2025-09-09 16:57:39','2025-09-09 16:58:13'),(15,9,1,24.44,'accepted','2025-09-09 18:21:12','2025-09-09 18:21:16','2025-09-09 18:21:12','2025-09-09 18:21:16');
/*!40000 ALTER TABLE `delivery_candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_partner_applications`
--

DROP TABLE IF EXISTS `delivery_partner_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_partner_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `application_id` varchar(20) NOT NULL,
  `vehicle_type` enum('motorcycle','tricycle','car','truck') NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `vehicle_registration` varchar(50) NOT NULL,
  `vehicle_make` varchar(100) DEFAULT NULL,
  `vehicle_model` varchar(100) DEFAULT NULL,
  `vehicle_year` varchar(4) DEFAULT NULL,
  `vehicle_color` varchar(50) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `service_areas` json NOT NULL,
  `availability_hours` json NOT NULL,
  `emergency_contact_name` varchar(255) NOT NULL,
  `emergency_contact_phone` varchar(20) NOT NULL,
  `emergency_contact_relation` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected','under_review','needs_resubmission') DEFAULT 'pending',
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_id` (`application_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_status` (`status`),
  KEY `idx_reviewed_by` (`reviewed_by`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_partner_applications`
--

LOCK TABLES `delivery_partner_applications` WRITE;
/*!40000 ALTER TABLE `delivery_partner_applications` DISABLE KEYS */;
INSERT INTO `delivery_partner_applications` VALUES (1,3,'DPA89506894','motorcycle','FSD0-343-FDFD-342','GDFD-345SF-DFDF-343','Honda','Click 125','2018','Red','Independent','[]','{\"friday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"monday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"sunday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"tuesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"saturday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"thursday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"wednesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}}','Marita C. Ricarte','0977345346546','Parent','approved',NULL,'2025-08-21 10:06:07','2025-08-21 10:19:46','2025-08-21 10:19:46',1);
/*!40000 ALTER TABLE `delivery_partner_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_partner_documents`
--

DROP TABLE IF EXISTS `delivery_partner_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_partner_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `document_type` enum('drivers_license','vehicle_registration','insurance','background_check','profile_photo') NOT NULL,
  `storage_key` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_document_type` (`document_type`),
  KEY `idx_verification_status` (`verification_status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_partner_documents`
--

LOCK TABLES `delivery_partner_documents` WRITE;
/*!40000 ALTER TABLE `delivery_partner_documents` DISABLE KEYS */;
INSERT INTO `delivery_partner_documents` VALUES (1,1,'drivers_license','user_3/DPA89506894/drivers_license-1755770767675.jpeg','images%20(6).jpeg',53886,'image/jpeg','verified',NULL,'2025-08-21 10:06:09','2025-08-21 10:19:11'),(2,1,'vehicle_registration','user_3/DPA89506894/vehicle_registration-1755770769482.jpeg','images%20(7).jpeg',47849,'image/jpeg','verified',NULL,'2025-08-21 10:06:09','2025-08-21 10:19:15'),(4,1,'insurance','user_3/DPA89506894/insurance-1755770769911.png','images%20(1).png',26986,'image/png','pending',NULL,'2025-08-21 10:06:10','2025-08-21 10:06:10');
/*!40000 ALTER TABLE `delivery_partner_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_partners`
--

DROP TABLE IF EXISTS `delivery_partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_partners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `application_id` int NOT NULL,
  `partner_id` varchar(20) NOT NULL,
  `vehicle_type` enum('motorcycle','tricycle','car','truck') NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `vehicle_registration` varchar(50) NOT NULL,
  `vehicle_make` varchar(100) DEFAULT NULL,
  `vehicle_model` varchar(100) DEFAULT NULL,
  `vehicle_year` varchar(4) DEFAULT NULL,
  `vehicle_color` varchar(50) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `service_areas` json DEFAULT NULL,
  `availability_hours` json DEFAULT NULL,
  `emergency_contact_name` varchar(255) NOT NULL,
  `emergency_contact_phone` varchar(20) NOT NULL,
  `emergency_contact_relation` varchar(100) DEFAULT NULL,
  `profile_picture` varchar(500) DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0',
  `status` enum('available','occupied') DEFAULT 'available',
  `current_location_lat` decimal(10,8) DEFAULT NULL,
  `current_location_lng` decimal(11,8) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '5.00',
  `total_deliveries` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `partner_id` (`partner_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_is_online` (`is_online`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_profile_picture` (`profile_picture`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_partners`
--

LOCK TABLES `delivery_partners` WRITE;
/*!40000 ALTER TABLE `delivery_partners` DISABLE KEYS */;
INSERT INTO `delivery_partners` VALUES (1,3,1,'DP89506894','motorcycle','FSD0-343-FDFD-342','GDFD-345SF-DFDF-343','Honda','Click 125','2018','Red','Independent','[]','{\"friday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"monday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"sunday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"tuesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"saturday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"thursday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"wednesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}}','Marita C. Ricarte','0977345346546','Parent','delivery-partners/DP89506894/profile_photos/profile_photo_1755771587260.jpeg',1,'available',13.13778940,123.72791720,5.00,0,1,'2025-08-21 10:19:47','2025-09-09 18:30:09');
/*!40000 ALTER TABLE `delivery_partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `sender_type` enum('user','seller') NOT NULL,
  `message_text` text NOT NULL,
  `message_type` enum('text','image','order_reference','bargain_offer') DEFAULT 'text',
  `order_id` int DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bargain_offer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_sender_type` (`sender_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_messages_conversation_created` (`conversation_id`,`created_at`),
  KEY `idx_bargain_offer_id` (`bargain_offer_id`),
  CONSTRAINT `fk_messages_bargain_offer` FOREIGN KEY (`bargain_offer_id`) REFERENCES `bargain_offers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,4,'user','Made an offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-03 08:17:09','2025-09-03 08:18:19',1),(2,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-03 08:18:27','2025-09-03 08:18:32',2),(3,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-03 08:18:45','2025-09-03 08:18:52',3),(4,1,2,'seller','Accepted the offer for Fresh meat at ₱112.00','bargain_offer',NULL,NULL,1,'2025-09-03 08:18:59','2025-09-03 08:19:02',4),(5,2,3,'user','Made an offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-04 01:57:51','2025-09-04 05:46:28',5),(6,1,4,'user','Made an offer for Whole chicken','bargain_offer',NULL,NULL,1,'2025-09-04 04:20:17','2025-09-04 04:23:14',6),(7,1,4,'user','Hello','text',NULL,NULL,1,'2025-09-04 04:22:30','2025-09-04 04:23:14',NULL),(8,1,2,'seller','Made a counter offer for Whole chicken','bargain_offer',NULL,NULL,1,'2025-09-04 04:24:03','2025-09-04 04:24:11',7),(9,1,4,'user','Made a counter offer for Whole chicken','bargain_offer',NULL,NULL,1,'2025-09-04 04:24:36','2025-09-04 04:26:44',8),(10,1,2,'seller','Accepted the offer for Whole chicken at ₱110.00','bargain_offer',NULL,NULL,1,'2025-09-04 04:27:55','2025-09-04 04:28:00',9),(11,1,4,'user','Made an offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-04 05:43:53','2025-09-04 05:44:22',10),(12,1,2,'seller','Accepted the offer for Fresh meat at ₱120.00','bargain_offer',NULL,NULL,1,'2025-09-04 05:44:25','2025-09-04 05:44:27',11),(13,1,4,'user','Made an offer for Sibuyas','bargain_offer',NULL,NULL,1,'2025-09-04 05:44:54','2025-09-04 05:45:11',12),(14,1,2,'seller','Accepted the offer for Sibuyas at ₱40.00','bargain_offer',NULL,NULL,1,'2025-09-04 05:45:13','2025-09-04 05:45:16',13),(15,1,4,'user','Made an offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 05:46:04','2025-09-05 05:46:05',14),(16,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 05:48:19','2025-09-05 06:10:19',15),(17,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:10:34','2025-09-05 06:11:18',16),(18,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:11:45','2025-09-05 06:13:08',17),(19,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:13:15','2025-09-05 06:25:07',18),(20,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:25:37','2025-09-05 06:27:50',19),(21,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:27:59','2025-09-05 06:29:28',20),(22,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:29:42','2025-09-05 06:30:46',21),(23,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:31:08','2025-09-05 06:35:00',22),(24,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:35:14','2025-09-05 06:36:07',23),(25,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:36:16','2025-09-05 06:39:34',24),(26,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:39:46','2025-09-05 06:41:51',25),(27,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:42:44','2025-09-05 06:43:25',26),(28,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:43:45','2025-09-05 06:46:28',27),(29,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:46:48','2025-09-05 06:47:50',28),(30,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:48:03','2025-09-05 06:48:23',29),(31,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:49:45','2025-09-05 06:50:45',30),(32,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:50:55','2025-09-05 06:50:57',31),(33,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:51:11','2025-09-05 06:51:12',32),(34,1,2,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:51:29','2025-09-05 06:51:31',33),(35,1,4,'user','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-05 06:51:44','2025-09-05 06:51:45',34),(36,1,2,'seller','Accepted the offer for Fresh meat at ₱125.00','bargain_offer',NULL,NULL,1,'2025-09-05 06:51:53','2025-09-05 06:51:55',35),(37,1,4,'user','Made an offer for Bulinaw','bargain_offer',NULL,NULL,1,'2025-09-05 06:52:58','2025-09-05 06:52:59',36),(38,1,2,'seller','Rejected the offer for Bulinaw','bargain_offer',NULL,NULL,1,'2025-09-05 06:53:18','2025-09-05 06:53:20',37),(39,1,4,'user','Made an offer for Bulinaw','bargain_offer',NULL,NULL,1,'2025-09-05 06:53:38','2025-09-05 06:53:39',38),(40,1,2,'seller','Made a counter offer for Bulinaw','bargain_offer',NULL,NULL,1,'2025-09-05 06:54:03','2025-09-05 06:54:05',39),(41,1,4,'user','Made an offer for Tilapia','bargain_offer',NULL,NULL,1,'2025-09-05 06:56:38','2025-09-05 06:56:39',40),(44,1,4,'user','Made an offer for Fresh meat ','bargain_offer',NULL,NULL,1,'2025-09-08 08:56:51','2025-09-08 09:09:22',41),(45,1,2,'seller','Made a counter offer for Fresh meat ','bargain_offer',NULL,NULL,1,'2025-09-08 09:11:20','2025-09-09 07:04:07',42),(46,1,2,'seller','Hello','text',NULL,NULL,1,'2025-09-08 09:11:45','2025-09-09 07:04:07',NULL),(47,1,4,'user','Majo','text',NULL,NULL,1,'2025-09-09 07:04:24','2025-09-09 07:06:48',NULL),(48,1,4,'user','Majo','text',NULL,NULL,1,'2025-09-09 07:04:24','2025-09-09 07:06:48',NULL),(49,3,4,'user','Made an offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-09 07:05:21','2025-09-09 07:08:00',43),(50,3,5,'seller','Made a counter offer for Fresh meat','bargain_offer',NULL,NULL,1,'2025-09-09 07:08:38','2025-09-09 07:08:45',44),(51,1,4,'user','Made an offer for Bulinaw','bargain_offer',NULL,NULL,0,'2025-09-09 12:52:57','2025-09-09 12:52:58',45);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('order','delivery','promotion','system','chat') NOT NULL DEFAULT 'system',
  `reference_id` int DEFAULT NULL,
  `reference_type` enum('order','product','seller','delivery_partner','chat') DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `deep_link` varchar(255) DEFAULT NULL,
  `extra_data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Application Approved!','Congratulations, Boy! You can now start selling on Palenque Mart.','system',NULL,'seller','open_application_status',NULL,'null',0,'2025-08-21 09:56:46','2025-08-21 10:05:30'),(2,3,'Application Approved!','Congratulations, James Mickel! You can now start delivering for Palenque Mart.','system',NULL,'delivery_partner','open_application_status',NULL,'null',1,'2025-08-21 10:19:47','2025-08-21 10:31:37'),(3,5,'Application Approved!','Congratulations, Marita! You can now start selling on Palenque Mart.','system',NULL,'seller','open_application_status',NULL,'null',0,'2025-09-09 02:35:43','2025-09-09 02:35:43');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `seller_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `preparation_options` json DEFAULT NULL,
  `item_status` enum('pending','confirmed','preparing','ready_for_pickup','rider_assigned','out_for_delivery','delivered','cancelled','refunded') DEFAULT 'pending',
  `seller_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bargain_offer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_item_status` (`item_status`),
  KEY `idx_bargain_offer_id` (`bargain_offer_id`),
  CONSTRAINT `fk_order_items_bargain_offer` FOREIGN KEY (`bargain_offer_id`) REFERENCES `bargain_offers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,3,1,1,220.00,220.00,'{}','pending',NULL,'2025-09-04 05:32:31','2025-09-04 05:32:31',NULL),(2,2,4,1,10,40.00,400.00,'{}','pending',NULL,'2025-09-04 05:46:07','2025-09-04 05:46:07',13),(3,2,5,1,1,120.00,120.00,'{}','pending',NULL,'2025-09-04 05:46:07','2025-09-04 05:46:07',11),(4,3,3,1,1,110.00,110.00,'{}','pending',NULL,'2025-09-04 05:46:23','2025-09-04 05:46:23',9),(5,4,4,1,1,60.00,60.00,'{}','pending',NULL,'2025-09-07 19:02:11','2025-09-07 19:02:11',NULL),(6,5,4,1,1,60.00,60.00,'{}','pending',NULL,'2025-09-08 04:46:29','2025-09-08 04:46:29',NULL),(7,6,5,1,1,125.00,125.00,'{}','delivered',NULL,'2025-09-08 05:59:42','2025-09-08 06:22:31',35),(8,7,6,1,1,300.00,300.00,'{}','delivered',NULL,'2025-09-08 08:21:27','2025-09-08 14:43:59',NULL),(9,8,6,1,2,300.00,600.00,'{}','delivered',NULL,'2025-09-08 09:00:36','2025-09-08 09:25:00',NULL),(10,9,4,1,2,60.00,120.00,'{}','confirmed',NULL,'2025-09-08 09:02:40','2025-09-09 14:28:03',NULL),(11,10,8,2,3,280.00,840.00,'{}','delivered',NULL,'2025-09-09 07:03:25','2025-09-09 07:14:00',NULL),(12,11,8,2,1,280.00,280.00,'{}','pending',NULL,'2025-09-09 12:51:18','2025-09-09 12:51:18',NULL),(13,12,4,1,1,60.00,60.00,'{}','cancelled',NULL,'2025-09-09 14:31:49','2025-09-09 14:43:08',NULL),(14,13,7,1,1,50.00,50.00,'{}','delivered',NULL,'2025-09-09 14:32:08','2025-09-09 18:19:03',NULL),(15,14,6,1,1,300.00,300.00,'{}','delivered',NULL,'2025-09-09 18:19:57','2025-09-09 18:21:34',NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `notes` text,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,1,'pending','Order placed successfully',NULL,'2025-08-27 11:43:02'),(2,1,'confirmed','Accept and confirm this order',2,'2025-08-27 11:43:13'),(3,1,'preparing','Begin preparing the order items',2,'2025-08-27 11:43:20'),(4,1,'ready_for_pickup','Order is ready for pickup by delivery partner',2,'2025-08-27 11:43:29'),(5,2,'pending','Order placed successfully',NULL,'2025-08-27 11:51:04'),(6,2,'confirmed','Accept and confirm this order',2,'2025-08-27 11:51:13'),(7,2,'preparing','Begin preparing the order items',2,'2025-08-27 11:51:18'),(8,2,'ready_for_pickup','Order is ready for pickup by delivery partner',2,'2025-08-27 11:51:24'),(9,3,'pending','Order placed successfully',NULL,'2025-08-28 14:12:14'),(10,3,'confirmed','Accept and confirm this order',2,'2025-08-28 14:38:19'),(11,3,'preparing','Begin preparing the order items',2,'2025-08-28 14:38:55'),(12,3,'ready_for_pickup','Order is ready for pickup by delivery partner',2,'2025-08-28 14:46:59'),(13,4,'pending','Order placed successfully',NULL,'2025-09-01 02:48:07'),(14,5,'pending','Order placed successfully',NULL,'2025-09-01 02:49:45'),(15,6,'pending','Order placed successfully',NULL,'2025-09-03 12:32:36'),(16,6,'pending','Order placed successfully',NULL,'2025-09-03 12:40:16'),(17,6,'pending','Order placed successfully',NULL,'2025-09-03 12:47:18'),(18,7,'pending','Order placed successfully',NULL,'2025-09-03 12:52:41'),(19,8,'pending','Order placed successfully',NULL,'2025-09-03 13:00:29'),(20,9,'pending','Order placed successfully',NULL,'2025-09-03 13:26:37'),(21,10,'pending','Order placed successfully',NULL,'2025-09-03 13:28:12'),(22,11,'pending','Order placed successfully',NULL,'2025-09-04 01:56:46'),(23,12,'pending','Order placed successfully',NULL,'2025-09-04 04:35:50'),(24,13,'pending','Order placed successfully',NULL,'2025-09-04 04:40:39'),(25,14,'pending','Order placed successfully',NULL,'2025-09-04 04:44:56'),(26,15,'pending','Order placed successfully',NULL,'2025-09-04 05:16:56'),(27,1,'pending','Order placed successfully',NULL,'2025-09-04 05:32:31'),(28,2,'pending','Order placed successfully',NULL,'2025-09-04 05:46:07'),(29,3,'pending','Order placed successfully',NULL,'2025-09-04 05:46:23'),(30,4,'pending','Order placed successfully',NULL,'2025-09-07 19:02:11'),(31,5,'pending','Order placed successfully',NULL,'2025-09-08 04:46:29'),(32,6,'pending','Order placed successfully',NULL,'2025-09-08 05:59:42'),(33,6,'confirmed','Accept and confirm this order',2,'2025-09-08 06:18:22'),(34,6,'preparing','Begin preparing the order items',2,'2025-09-08 06:18:30'),(35,6,'ready_for_pickup','Order is ready for pickup by delivery partner',2,'2025-09-08 06:18:38'),(36,7,'pending','Order placed successfully',NULL,'2025-09-08 08:21:27'),(37,8,'pending','Order placed successfully',NULL,'2025-09-08 09:00:36'),(38,9,'pending','Order placed successfully',NULL,'2025-09-08 09:02:40'),(39,8,'confirmed','Accept and confirm this order',2,'2025-09-08 09:17:26'),(40,8,'preparing','Begin preparing the order items',2,'2025-09-08 09:17:29'),(41,8,'ready_for_pickup','Order is ready for pickup by delivery partner',2,'2025-09-08 09:17:58'),(42,7,'confirmed','Accept and confirm this order',2,'2025-09-08 09:37:10'),(43,7,'preparing','Begin preparing the order items',2,'2025-09-08 09:37:22'),(44,7,'ready_for_pickup','Order is ready for pickup by delivery partner',2,'2025-09-08 09:37:30'),(45,10,'pending','Order placed successfully',NULL,'2025-09-09 07:03:25'),(46,10,'confirmed','Accept and confirm this order',5,'2025-09-09 07:11:59'),(47,10,'preparing','Begin preparing the order items',5,'2025-09-09 07:12:14'),(48,10,'ready_for_pickup','Order is ready for pickup by delivery partner',5,'2025-09-09 07:12:28'),(49,11,'pending','Order placed successfully',NULL,'2025-09-09 12:51:18'),(50,9,'confirmed','Accept and confirm this preorder',2,'2025-09-09 14:28:03'),(51,12,'pending','Order placed successfully',NULL,'2025-09-09 14:31:49'),(52,13,'pending','Order placed successfully',NULL,'2025-09-09 14:32:08'),(53,12,'cancelled','Decline this preorder',2,'2025-09-09 14:43:08'),(54,13,'confirmed','Accept and confirm this order',2,'2025-09-09 16:55:27'),(55,13,'preparing','Begin preparing the order items',2,'2025-09-09 16:56:56'),(56,13,'ready_for_pickup','Order is ready for pickup by delivery partner',2,'2025-09-09 16:57:39'),(57,14,'pending','Order placed successfully',NULL,'2025-09-09 18:19:57'),(58,14,'confirmed','Accept and confirm this order',2,'2025-09-09 18:20:55'),(59,14,'preparing','Begin preparing the order items',2,'2025-09-09 18:21:06'),(60,14,'ready_for_pickup','Order is ready for pickup by delivery partner',2,'2025-09-09 18:21:11');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `seller_id` int NOT NULL,
  `order_number` varchar(30) NOT NULL,
  `status` enum('pending','confirmed','preparing','ready_for_pickup','rider_assigned','out_for_delivery','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_method` enum('cash_on_delivery','online_payment') DEFAULT 'cash_on_delivery',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) DEFAULT '0.00',
  `voucher_discount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `voucher_id` int DEFAULT NULL,
  `delivery_address_id` int DEFAULT NULL,
  `delivery_recipient_name` varchar(255) NOT NULL,
  `delivery_phone_number` varchar(20) NOT NULL,
  `delivery_street_address` text NOT NULL,
  `delivery_barangay` varchar(100) NOT NULL,
  `delivery_city` varchar(100) NOT NULL,
  `delivery_province` varchar(100) NOT NULL,
  `delivery_postal_code` varchar(10) DEFAULT NULL,
  `delivery_landmark` varchar(255) DEFAULT NULL,
  `delivery_latitude` decimal(10,8) DEFAULT NULL,
  `delivery_longitude` decimal(11,8) DEFAULT NULL,
  `delivery_notes` text,
  `estimated_delivery_time` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancellation_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `order_type` enum('regular','preorder','mixed') DEFAULT 'regular',
  `preorder_deposit_paid` decimal(10,2) DEFAULT '0.00',
  `remaining_balance` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_voucher_id` (`voucher_id`),
  KEY `idx_delivery_address_id` (`delivery_address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,4,1,'ORD1756963951034497','pending','cash_on_delivery','paid',220.00,50.00,0.00,270.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-09-04 05:32:31','2025-09-04 05:50:30','regular',0.00,0.00),(2,4,1,'ORD1756964767760974','pending','cash_on_delivery','paid',520.00,50.00,0.00,570.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-09-04 05:46:07','2025-09-04 05:50:30','regular',0.00,0.00),(3,4,1,'ORD1756964783647963','pending','cash_on_delivery','paid',110.00,50.00,0.00,160.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-09-04 05:46:23','2025-09-04 05:50:30','regular',0.00,0.00),(4,4,1,'ORD1757271731842784','pending','cash_on_delivery','pending',60.00,50.00,0.00,110.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-09-07 19:02:11','2025-09-07 19:02:11','preorder',0.00,0.00),(5,4,1,'ORD1757306789698306','pending','cash_on_delivery','pending',60.00,50.00,0.00,110.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-09-08 04:46:29','2025-09-08 04:46:29','preorder',0.00,0.00),(6,4,1,'ORD1757311182322578','delivered','cash_on_delivery','pending',125.00,50.00,0.00,175.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'Pa door bell nalang po sa labas ng bahay',NULL,'2025-09-08 06:22:31',NULL,NULL,'2025-09-08 05:59:42','2025-09-08 06:22:31','regular',0.00,0.00),(7,4,1,'ORD1757319687416516','delivered','cash_on_delivery','paid',300.00,50.00,0.00,350.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,'2025-09-08 14:43:59',NULL,NULL,'2025-09-08 08:21:27','2025-09-08 14:43:59','regular',0.00,0.00),(8,4,1,'ORD1757322036476673','delivered','cash_on_delivery','pending',600.00,50.00,50.00,600.00,1,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,'2025-09-08 09:25:00',NULL,NULL,'2025-09-08 09:00:36','2025-09-08 09:25:00','regular',0.00,0.00),(9,4,1,'ORD1757322160813841','confirmed','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-09-08 09:02:40','2025-09-09 14:28:03','preorder',0.00,0.00),(10,4,2,'ORD1757401405182467','delivered','cash_on_delivery','paid',840.00,50.00,0.00,890.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,'2025-09-09 07:14:00',NULL,NULL,'2025-09-09 07:03:25','2025-09-09 07:14:00','regular',0.00,0.00),(11,4,2,'ORD1757422278754247','pending','cash_on_delivery','pending',280.00,50.00,0.00,330.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-09-09 12:51:18','2025-09-09 12:51:18','regular',0.00,0.00),(12,4,1,'ORD1757428309018708','cancelled','cash_on_delivery','pending',60.00,50.00,0.00,110.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,NULL,'2025-09-09 14:43:08','Decline this preorder','2025-09-09 14:31:49','2025-09-09 14:43:08','preorder',0.00,0.00),(13,4,1,'ORD1757428328453811','delivered','cash_on_delivery','paid',50.00,50.00,0.00,100.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,'2025-09-09 18:19:03',NULL,NULL,'2025-09-09 14:32:08','2025-09-09 18:19:03','regular',0.00,0.00),(14,4,1,'ORD1757441997474523','delivered','cash_on_delivery','paid',300.00,50.00,0.00,350.00,NULL,1,'James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',NULL,NULL,'',NULL,'2025-09-09 18:21:34',NULL,NULL,'2025-09-09 18:19:57','2025-09-09 18:21:34','regular',0.00,0.00);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preorder_items`
--

DROP TABLE IF EXISTS `preorder_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preorder_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_item_id` int NOT NULL,
  `expected_availability_date` timestamp NULL DEFAULT NULL,
  `deposit_amount` decimal(10,2) DEFAULT NULL,
  `remaining_balance` decimal(10,2) DEFAULT NULL,
  `status` enum('pending_availability','available','ready_for_final_payment','completed') DEFAULT NULL,
  `availability_notified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_item_id` (`order_item_id`),
  CONSTRAINT `preorder_items_ibfk_1` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preorder_items`
--

LOCK TABLES `preorder_items` WRITE;
/*!40000 ALTER TABLE `preorder_items` DISABLE KEYS */;
INSERT INTO `preorder_items` VALUES (1,5,'2025-09-10 18:54:27',0.00,60.00,'pending_availability',NULL),(2,6,'2025-09-11 18:54:27',0.00,60.00,'pending_availability',NULL),(3,10,'2025-09-11 18:54:27',0.00,120.00,'pending_availability',NULL),(4,13,'2025-09-11 18:54:27',0.00,60.00,'pending_availability',NULL);
/*!40000 ALTER TABLE `preorder_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `review_text` text,
  `is_verified_purchase` tinyint(1) DEFAULT '1',
  `helpful_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_order` (`user_id`,`product_id`,`order_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_product_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `category` varchar(100) DEFAULT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `unit_type` enum('per_kilo','per_250g','per_500g','per_piece','per_bundle','per_pack','per_liter','per_dozen') DEFAULT 'per_piece',
  `freshness_indicator` varchar(255) DEFAULT NULL,
  `harvest_date` date DEFAULT NULL,
  `source_origin` varchar(255) DEFAULT NULL,
  `preparation_options` json DEFAULT NULL,
  `image_keys` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `review_count` int DEFAULT '0',
  `bargaining_enabled` tinyint(1) DEFAULT '1' COMMENT 'Whether bargaining is enabled for this product',
  `minimum_offer_price` decimal(10,2) DEFAULT NULL COMMENT 'Minimum acceptable offer price set by seller',
  `is_preorder_enabled` tinyint(1) DEFAULT '0',
  `expected_availability_date` timestamp NULL DEFAULT NULL,
  `preorder_deposit_required` tinyint(1) DEFAULT '0',
  `preorder_deposit_amount` decimal(10,2) DEFAULT NULL,
  `max_preorder_quantity` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_category` (`category`),
  KEY `idx_average_rating` (`average_rating`),
  KEY `idx_bargaining_enabled` (`bargaining_enabled`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Tilapia','',120.00,20,'Fish','Tilapia','per_500g','Harvested this morning','2025-08-22','Sourced from Daraga Market','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/eb5f55da-d117-4a98-87a6-1db0b758fefc-photo.jpeg',1,'2025-08-22 13:55:24','2025-09-04 01:56:46',5.00,2,1,NULL,0,NULL,0,NULL,NULL),(2,1,'Bulinaw','Really fresh | labas',120.00,3,'Fish','Other','per_500g','Slaughtered this morning','2025-08-30','From Daraga morning','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/bef4f1a5-5691-4f11-9de6-b0a2beeb5be2-photo.jpeg',1,'2025-08-30 04:20:01','2025-09-04 04:44:56',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(3,1,'Whole chicken','Fresh whole chicken',220.00,0,'Poultry',NULL,'per_piece',NULL,'2025-08-27','From westwood poultries','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/1c813ab9-f8b4-4a7d-923c-d7f8bbd18849-photo.jpeg',1,'2025-08-30 04:42:03','2025-09-04 05:46:23',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(4,1,'Sibuyas','',60.00,0,'Vegetables','Root Vegetables','per_500g','Harvested around this summer season','2025-08-21','From vegetables supplier corp','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/fd74459f-73d3-43a2-89f2-80d7c78ae184-photo.jpeg',1,'2025-08-30 04:43:21','2025-09-08 04:45:35',0.00,0,1,NULL,1,'2025-09-11 18:54:27',0,NULL,8),(5,1,'Fresh meat','',140.00,3,'Meat','Pork Chop','per_500g','Slaughtered yesterday','2025-08-29','Source from ate nenang pigery business ','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/1dce5705-ad08-4bd4-a5da-f8cb3b743680-photo.jpeg',1,'2025-08-30 04:45:00','2025-09-08 05:59:42',0.00,0,1,NULL,1,'2025-09-10 17:49:30',0,NULL,5),(6,1,'Fresh meat ','',300.00,46,'Meat','Pork Chop','per_kilo',NULL,'2025-09-08',NULL,'{\"cut\": false, \"whole\": false, \"sliced\": true, \"cleaned\": false}','product-images/user_2/b4c4a67b-b591-4750-a460-ccb0aee76ebf-photo.jpeg',1,'2025-09-08 06:09:49','2025-09-09 18:19:57',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(7,1,'Apple','',50.00,99,'Fruits','Other','per_piece','Harvested yesterday','2025-09-07',NULL,'{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/0bdf2edf-4766-4f4c-97e9-09e9b8a31b2e-photo.jpeg',1,'2025-09-08 09:08:30','2025-09-09 14:32:08',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(8,2,'Fresh meat','',280.00,2,'Meat','Pork Chop','per_kilo','Slaughtered 3 days ago','2025-09-06','From Legazpi City market','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_5/ba42aa78-883b-4c05-8240-ec38bacbe19b-photo.jpeg',1,'2025-09-09 02:43:40','2025-09-09 12:51:18',0.00,0,1,NULL,0,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_helpfulness`
--

DROP TABLE IF EXISTS `review_helpfulness`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_helpfulness` (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_id` int NOT NULL,
  `review_type` enum('product','seller') NOT NULL,
  `user_id` int NOT NULL,
  `is_helpful` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_review` (`user_id`,`review_id`,`review_type`),
  KEY `idx_review_id_type` (`review_id`,`review_type`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_review_helpfulness_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_helpfulness`
--

LOCK TABLES `review_helpfulness` WRITE;
/*!40000 ALTER TABLE `review_helpfulness` DISABLE KEYS */;
INSERT INTO `review_helpfulness` VALUES (1,2,'product',4,1,'2025-08-27 14:29:10'),(2,2,'product',3,1,'2025-08-27 14:29:47');
/*!40000 ALTER TABLE `review_helpfulness` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_media`
--

DROP TABLE IF EXISTS `review_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_id` int NOT NULL,
  `review_type` enum('product','seller') NOT NULL,
  `media_type` enum('image','video') NOT NULL,
  `storage_key` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `thumbnail_key` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_review_id_type` (`review_id`,`review_type`),
  KEY `idx_media_type` (`media_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_media`
--

LOCK TABLES `review_media` WRITE;
/*!40000 ALTER TABLE `review_media` DISABLE KEYS */;
INSERT INTO `review_media` VALUES (1,1,'product','image','user_4/order_1/c956aedc-6e97-4315-96b7-1e8e8841d304-538ecddb-4438-47ee-8c6b-47d93273dc82.jpeg','538ecddb-4438-47ee-8c6b-47d93273dc82.jpeg',88887,'image/jpeg',NULL,'2025-08-27 14:13:12'),(2,2,'product','image','user_4/order_2/ed541414-3c16-4361-9722-846883d72e24-bcf01fc5-8dac-4221-ac3b-7a0336e688e0.jpeg','bcf01fc5-8dac-4221-ac3b-7a0336e688e0.jpeg',667938,'image/jpeg',NULL,'2025-08-27 14:28:11'),(3,2,'product','image','user_4/order_2/66a8a32e-7314-434f-9b2b-35dd3daa1a11-50ca4218-35df-44ea-af5e-3fd99de34b52.jpeg','50ca4218-35df-44ea-af5e-3fd99de34b52.jpeg',1412543,'image/jpeg',NULL,'2025-08-27 14:28:12');
/*!40000 ALTER TABLE `review_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_addresses`
--

DROP TABLE IF EXISTS `seller_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `type` enum('pickup','return','store') NOT NULL,
  `street_address` text NOT NULL,
  `barangay` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_application_type` (`application_id`,`type`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_type` (`type`),
  KEY `idx_coordinates` (`latitude`,`longitude`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_addresses`
--

LOCK TABLES `seller_addresses` WRITE;
/*!40000 ALTER TABLE `seller_addresses` DISABLE KEYS */;
INSERT INTO `seller_addresses` VALUES (1,1,'pickup','Karangahan Boulevard','Bangkilingan','Tabaco','Albay','4511','Near Melgar Bakery',13.35740334,123.71860340,'2025-08-21 09:55:58','2025-08-21 09:55:58'),(2,1,'return','Jamaica Mansions','Panal','Tabaco','Albay','4511','Behind of club house',13.35240352,123.72115351,'2025-08-21 09:55:58','2025-08-21 09:55:58'),(3,1,'store','Llorente Street','Quinale Cabasan','Tabaco','Albay','4511','Behind City mall',13.35888333,123.73111255,'2025-08-21 09:55:58','2025-08-21 09:55:58'),(4,2,'pickup','Ligao Road','Bangkilingan','Tabaco','Albay','4511',NULL,13.36077600,123.71684410,'2025-09-09 02:33:40','2025-09-09 02:33:40'),(5,2,'return','Karangahan Boulevard','Bangkilingan','Tabaco','Albay','4511',NULL,13.35691580,123.72173480,'2025-09-09 02:33:40','2025-09-09 02:33:40'),(6,2,'store','Riosa Street','Quinale Cabasan','Tabaco','Albay','4511',NULL,13.35805640,123.73230570,'2025-09-09 02:33:40','2025-09-09 02:33:40');
/*!40000 ALTER TABLE `seller_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_applications`
--

DROP TABLE IF EXISTS `seller_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `application_id` varchar(20) NOT NULL,
  `account_type` enum('individual','business') NOT NULL,
  `status` enum('pending','approved','rejected','under_review','needs_resubmission') DEFAULT 'pending',
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_id` (`application_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_status` (`status`),
  KEY `idx_reviewed_by` (`reviewed_by`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_applications`
--

LOCK TABLES `seller_applications` WRITE;
/*!40000 ALTER TABLE `seller_applications` DISABLE KEYS */;
INSERT INTO `seller_applications` VALUES (1,2,'APP70155528','individual','approved',NULL,'2025-08-21 09:55:55','2025-08-21 09:56:44','2025-08-21 09:56:44',1),(2,5,'APP85218839','individual','approved',NULL,'2025-09-09 02:33:38','2025-09-09 02:35:40','2025-09-09 02:35:40',1);
/*!40000 ALTER TABLE `seller_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_business_details`
--

DROP TABLE IF EXISTS `seller_business_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_business_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_registration_number` varchar(100) NOT NULL,
  `contact_person` varchar(255) NOT NULL,
  `business_address` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_business_details`
--

LOCK TABLES `seller_business_details` WRITE;
/*!40000 ALTER TABLE `seller_business_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `seller_business_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_documents`
--

DROP TABLE IF EXISTS `seller_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `document_type` enum('government_id','selfie_with_id','business_documents','bank_statement','store_logo') NOT NULL,
  `storage_key` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_document_type` (`document_type`),
  KEY `idx_verification_status` (`verification_status`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_documents`
--

LOCK TABLES `seller_documents` WRITE;
/*!40000 ALTER TABLE `seller_documents` DISABLE KEYS */;
INSERT INTO `seller_documents` VALUES (1,1,'government_id','user_2/APP70155528/government_id-1755770155565.png','UMID_EMV_sample.png',3902179,'image/png','verified',NULL,'2025-08-21 09:55:58','2025-08-21 09:56:32'),(2,1,'selfie_with_id','user_2/APP70155528/selfie_with_id-1755770157231.jpeg','selfie_with_id.jpeg',18972,'image/jpeg','verified',NULL,'2025-08-21 09:55:58','2025-08-21 09:56:36'),(3,1,'bank_statement','user_2/APP70155528/bank_statement-1755770157654.png','images%20(1).png',26986,'image/png','pending',NULL,'2025-08-21 09:55:58','2025-08-21 09:55:58'),(5,2,'government_id','user_5/APP85218839/government_id-1757385218877.png','UMID_EMV_sample.png',3902179,'image/png','verified',NULL,'2025-09-09 02:33:40','2025-09-09 02:35:31'),(6,2,'selfie_with_id','user_5/APP85218839/selfie_with_id-1757385220282.jpeg','selfie_with_id.jpeg',19213,'image/jpeg','verified',NULL,'2025-09-09 02:33:40','2025-09-09 02:35:36'),(7,2,'bank_statement','user_5/APP85218839/bank_statement-1757385220547.png','images.png',19164,'image/png','pending',NULL,'2025-09-09 02:33:40','2025-09-09 02:33:40');
/*!40000 ALTER TABLE `seller_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_reviews`
--

DROP TABLE IF EXISTS `seller_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `review_text` text,
  `service_aspects` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_seller_order` (`user_id`,`seller_id`,`order_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_seller_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_seller_reviews_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_seller_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `seller_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_reviews`
--

LOCK TABLES `seller_reviews` WRITE;
/*!40000 ALTER TABLE `seller_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `seller_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_store_profiles`
--

DROP TABLE IF EXISTS `seller_store_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_store_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `store_name` varchar(255) NOT NULL,
  `store_description` text NOT NULL,
  `store_logo_key` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_store_profiles`
--

LOCK TABLES `seller_store_profiles` WRITE;
/*!40000 ALTER TABLE `seller_store_profiles` DISABLE KEYS */;
INSERT INTO `seller_store_profiles` VALUES (1,1,'Boy Banat Store','Fresh seller','sellers/SELL70204724/store_logos/store_logo_1755770205878.jpeg','2025-08-21 09:55:58','2025-08-21 09:56:46'),(2,2,'Marits store','Selling fresh goods','sellers/SELL85340401/store_logos/store_logo_1757385342451.jpeg','2025-09-09 02:33:40','2025-09-09 02:35:42');
/*!40000 ALTER TABLE `seller_store_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellers`
--

DROP TABLE IF EXISTS `sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sellers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `application_id` int NOT NULL,
  `seller_id` varchar(20) NOT NULL,
  `account_type` enum('individual','business') NOT NULL,
  `store_name` varchar(255) NOT NULL,
  `store_description` text NOT NULL,
  `store_logo_key` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `review_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `seller_id` (`seller_id`),
  KEY `application_id` (`application_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_average_rating` (`average_rating`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,2,1,'SELL70204724','individual','Boy Banat Store','Fresh seller','sellers/SELL70204724/store_logos/store_logo_1755770205878.jpeg',1,'2025-08-21 09:56:44','2025-08-27 14:26:10',5.00,2),(2,5,2,'SELL85340401','individual','Marits store','Selling fresh goods','sellers/SELL85340401/store_logos/store_logo_1757385342451.jpeg',1,'2025-09-09 02:35:40','2025-09-09 02:35:42',0.00,0);
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `address_type` enum('home','work','other') DEFAULT 'home',
  `recipient_name` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `street_address` text NOT NULL,
  `barangay` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_coordinates` (`latitude`,`longitude`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_addresses`
--

LOCK TABLES `user_addresses` WRITE;
/*!40000 ALTER TABLE `user_addresses` DISABLE KEYS */;
INSERT INTO `user_addresses` VALUES (1,4,'home','James Ricarte','+639771495824','5 Tomas Cabiles Street','San Juan','Tabaco','Albay','4511','',13.35647071,123.72625172,0,'2025-08-22 13:57:20','2025-08-22 13:57:20'),(2,3,'home','James Mickel Ricarte','+639771495822','Rizal Avenue','Ilawod','Legazpi','Albay','4500','',13.13798790,123.73566220,1,'2025-09-04 01:56:40','2025-09-04 01:56:40');
/*!40000 ALTER TABLE `user_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `birth_date` varchar(100) DEFAULT NULL,
  `gender` enum('male','female','non-binary','prefer-not-to-say') DEFAULT NULL,
  `role` enum('user','admin','super_admin') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','User','admin@pm.com','$2b$10$.XCLqvtKmsvLjYlwJtFydesWreC1nDMsBZ06ScWr6DmQyA/9aOJLy',NULL,NULL,NULL,NULL,'admin',1,'2025-07-17 06:43:52','2025-07-17 07:01:30'),(2,'Boy','Banat','gdashrobtob@gmail.com','$2b$10$Yef/Ilvzh7I7cPCEXKnkEejwmNYoup7mujWOsJsil0MUVSuwdWc9K','+639771495823',NULL,'2003-01-03','male','user',1,'2025-08-21 07:03:31','2025-08-21 07:06:15'),(3,'James Mickel','Ricarte','jamesmickelricarte@gmail.com','$2b$10$3Z.5toj.ap4oFlg1TxUBtet6/PLdqGpn5QmMRdWzFDGMaNyGv0S/e','+639771495822',NULL,'2003-01-03','male','user',1,'2025-08-21 10:00:16','2025-08-21 10:01:58'),(4,'Jamess','Ricarte','uhenyou@gmail.com','$2b$10$LkH7AwAazGYdJDgq3ErQAuc1dH0xx41krItqxn7go9BViFWVYG11W','+639771495824',NULL,'2003-01-03',NULL,'user',1,'2025-08-21 10:49:44','2025-09-08 09:04:56'),(5,'Marita','Ricarte','maritaricarte@gmail.com','$2b$10$XltCDtGt192L0M2rWDIZD.vSgXm8ocULFcK9hHdmpdkA7zCiZZhuq','+639771495821',NULL,'2003-01-03','female','user',1,'2025-08-25 12:37:40','2025-09-09 02:13:10');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `discount_type` enum('percentage','fixed_amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_order_amount` decimal(10,2) DEFAULT '0.00',
  `maximum_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `valid_from` timestamp NOT NULL,
  `valid_until` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_valid_dates` (`valid_from`,`valid_until`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES (1,'WELCOME10','Welcome Discount','Get 10% off on your first order','percentage',10.00,100.00,50.00,NULL,2,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-09-08 09:00:36'),(2,'SAVE20','Save ₱20','Get ₱20 off on orders above ₱200','fixed_amount',20.00,200.00,NULL,NULL,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-07-22 08:00:00'),(3,'FREESHIP','Free Shipping','Free delivery on orders above ₱500','fixed_amount',50.00,500.00,NULL,100,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-07-22 08:00:00');
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-10  2:30:23
