CREATE DATABASE  IF NOT EXISTS `palenque_mart_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `palenque_mart_db`;
-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (arm64)
--
-- Host: localhost    Database: palenque_mart_db
-- ------------------------------------------------------
-- Server version	8.0.43

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bargain_offers`
--

LOCK TABLES `bargain_offers` WRITE;
/*!40000 ALTER TABLE `bargain_offers` DISABLE KEYS */;
INSERT INTO `bargain_offers` VALUES (1,366,1,15,150.00,120.00,120.00,'initial_offer','pending',0,'user',6,NULL,'2025-11-20 05:43:01',NULL,'2025-11-19 13:43:00','2025-11-19 13:43:00');
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
  CONSTRAINT `fk_cart_bargain_offer` FOREIGN KEY (`bargain_offer_id`) REFERENCES `bargain_offers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (4,6,16,1,'2025-11-19 13:46:37','2025-11-19 13:46:37',NULL),(6,5,5,1,'2025-11-19 20:47:41','2025-11-19 20:47:41',NULL),(7,5,2,2,'2025-11-19 20:47:52','2025-11-19 20:48:07',NULL);
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
  `order_id` int DEFAULT NULL,
  `conversation_type` enum('free_chat','order_chat') DEFAULT 'free_chat',
  `user_id` int DEFAULT NULL,
  `seller_id` int DEFAULT NULL,
  `delivery_partner_id` int DEFAULT NULL,
  `last_message_id` int DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `user_unread_count` int DEFAULT '0',
  `seller_unread_count` int DEFAULT '0',
  `delivery_partner_unread_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_last_message_at` (`last_message_at`),
  KEY `idx_is_active` (`is_active`),
  KEY `fk_conversations_last_message` (`last_message_id`),
  KEY `idx_conversations_user_updated` (`user_id`,`updated_at` DESC),
  KEY `idx_conversations_seller_updated` (`seller_id`,`updated_at` DESC),
  KEY `idx_delivery_partner_id` (`delivery_partner_id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_conversations_delivery_partner` FOREIGN KEY (`delivery_partner_id`) REFERENCES `delivery_partners` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversations_last_message` FOREIGN KEY (`last_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_conversations_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversations_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,NULL,'free_chat',6,2,NULL,366,'2025-11-19 13:43:00',0,2,0,1,'2025-11-19 13:42:47','2025-11-19 13:43:00'),(2,3,'order_chat',NULL,2,1,367,'2025-11-19 17:14:18',0,1,0,1,'2025-11-19 17:14:18','2025-11-19 17:14:18'),(3,3,'order_chat',6,NULL,1,368,'2025-11-19 17:14:27',1,0,0,1,'2025-11-19 17:14:27','2025-11-19 17:14:27');
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
  `proof_of_delivery_image` varchar(500) DEFAULT NULL,
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
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_delivery_assignments_delivery_partner` FOREIGN KEY (`delivery_partner_id`) REFERENCES `delivery_partners` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_delivery_assignments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_assignments`
--

LOCK TABLES `delivery_assignments` WRITE;
/*!40000 ALTER TABLE `delivery_assignments` DISABLE KEYS */;
INSERT INTO `delivery_assignments` VALUES (1,3,1,'delivered','2025-11-19 17:14:06','2025-11-19 17:14:37','2025-11-19 17:17:32','delivery-partners/DP94143778/proof_of_delivery_images/proof_of_delivery_1763572650979.jpg',NULL,30.00,'Bgy. 13, Ilawod West, Legazpi City, Albay 4500','South Road, Illawod, Legazpi City, Albay 4500',NULL,'2025-11-19 17:09:10','2025-11-19 17:17:32'),(2,2,1,'picked_up','2025-11-19 18:36:36','2025-11-19 18:38:21',NULL,NULL,NULL,30.00,'F. Imperial Street, Old Albay District, Legazpi City, Albay 4500','South Road, Illawod, Legazpi City, Albay 4500',NULL,'2025-11-19 18:36:28','2025-11-19 18:38:21');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_candidates`
--

LOCK TABLES `delivery_candidates` WRITE;
/*!40000 ALTER TABLE `delivery_candidates` DISABLE KEYS */;
INSERT INTO `delivery_candidates` VALUES (1,1,1,24.00,'accepted','2025-11-19 17:09:10','2025-11-19 17:14:06','2025-11-19 17:09:10','2025-11-19 17:14:06'),(2,2,1,1.80,'accepted','2025-11-19 18:36:28','2025-11-19 18:36:36','2025-11-19 18:36:28','2025-11-19 18:36:36');
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
  KEY `idx_reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_delivery_partner_applications_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_delivery_partner_applications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_partner_applications`
--

LOCK TABLES `delivery_partner_applications` WRITE;
/*!40000 ALTER TABLE `delivery_partner_applications` DISABLE KEYS */;
INSERT INTO `delivery_partner_applications` VALUES (1,5,'DPA94143778','motorcycle','N03-54-982143','4321-ABZ','Honda','Click 125i','2021','Matte Black','Independent','[]','{\"friday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"monday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"sunday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"tuesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"saturday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"thursday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"wednesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}}','Rafael Villanueva','09184452301','Brother','approved',NULL,'2025-11-19 00:52:25','2025-11-19 17:05:46','2025-11-19 17:05:46',1);
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
  KEY `idx_verification_status` (`verification_status`),
  CONSTRAINT `fk_delivery_partner_documents_application` FOREIGN KEY (`application_id`) REFERENCES `delivery_partner_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_partner_documents`
--

LOCK TABLES `delivery_partner_documents` WRITE;
/*!40000 ALTER TABLE `delivery_partner_documents` DISABLE KEYS */;
INSERT INTO `delivery_partner_documents` VALUES (1,1,'drivers_license','user_5/DPA94143778/drivers_license-1763513545149.jpeg','driver\'s_license.jpeg',53886,'image/jpeg','verified',NULL,'2025-11-19 00:52:26','2025-11-19 17:05:31'),(2,1,'vehicle_registration','user_5/DPA94143778/vehicle_registration-1763513546150.jpeg','vehicle_registration_certificate.jpeg',47849,'image/jpeg','verified',NULL,'2025-11-19 00:52:26','2025-11-19 17:05:34'),(4,1,'insurance','user_5/DPA94143778/insurance-1763513546896.png','vehicle_insurance.png',263659,'image/png','verified',NULL,'2025-11-19 00:52:27','2025-11-19 17:05:42');
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
  KEY `idx_profile_picture` (`profile_picture`),
  CONSTRAINT `fk_delivery_partners_application` FOREIGN KEY (`application_id`) REFERENCES `delivery_partner_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_delivery_partners_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_partners`
--

LOCK TABLES `delivery_partners` WRITE;
/*!40000 ALTER TABLE `delivery_partners` DISABLE KEYS */;
INSERT INTO `delivery_partners` VALUES (1,5,1,'DP94143778','motorcycle','N03-54-982143','4321-ABZ','Honda','Click 125i','2021','Matte Black','Independent','[]','{\"friday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"monday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"sunday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"tuesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"saturday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"thursday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"wednesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}}','Rafael Villanueva','09184452301','Brother','delivery-partners/DP94143778/profile_photos/profile_photo_1763571947095.jpeg',0,'occupied',NULL,NULL,5.00,0,1,'2025-11-19 17:05:47','2025-11-19 20:13:59');
/*!40000 ALTER TABLE `delivery_partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `livestream_analytics`
--

DROP TABLE IF EXISTS `livestream_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livestream_analytics` (
  `analytics_id` int NOT NULL AUTO_INCREMENT,
  `livestream_id` int NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `current_viewers` int DEFAULT '0',
  `total_comments` int DEFAULT '0',
  `total_sales` int DEFAULT '0',
  PRIMARY KEY (`analytics_id`),
  KEY `idx_livestream_time` (`livestream_id`,`timestamp`),
  CONSTRAINT `livestream_analytics_ibfk_1` FOREIGN KEY (`livestream_id`) REFERENCES `livestreams` (`livestream_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livestream_analytics`
--

LOCK TABLES `livestream_analytics` WRITE;
/*!40000 ALTER TABLE `livestream_analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `livestream_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `livestream_comments`
--

DROP TABLE IF EXISTS `livestream_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livestream_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `livestream_id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_pinned` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `idx_livestream_time` (`livestream_id`,`created_at`),
  KEY `idx_user` (`user_id`),
  KEY `idx_comment_livestream_created` (`livestream_id`,`created_at` DESC),
  CONSTRAINT `livestream_comments_ibfk_1` FOREIGN KEY (`livestream_id`) REFERENCES `livestreams` (`livestream_id`) ON DELETE CASCADE,
  CONSTRAINT `livestream_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livestream_comments`
--

LOCK TABLES `livestream_comments` WRITE;
/*!40000 ALTER TABLE `livestream_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `livestream_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `livestream_products`
--

DROP TABLE IF EXISTS `livestream_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livestream_products` (
  `livestream_product_id` int NOT NULL AUTO_INCREMENT,
  `livestream_id` int NOT NULL,
  `product_id` int NOT NULL,
  `is_pinned` tinyint(1) DEFAULT '0',
  `pinned_at` datetime DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`livestream_product_id`),
  UNIQUE KEY `unique_livestream_product` (`livestream_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_livestream` (`livestream_id`),
  KEY `idx_pinned` (`livestream_id`,`is_pinned`),
  CONSTRAINT `livestream_products_ibfk_1` FOREIGN KEY (`livestream_id`) REFERENCES `livestreams` (`livestream_id`) ON DELETE CASCADE,
  CONSTRAINT `livestream_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livestream_products`
--

LOCK TABLES `livestream_products` WRITE;
/*!40000 ALTER TABLE `livestream_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `livestream_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `livestream_viewers`
--

DROP TABLE IF EXISTS `livestream_viewers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livestream_viewers` (
  `viewer_id` int NOT NULL AUTO_INCREMENT,
  `livestream_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` timestamp NULL DEFAULT NULL,
  `watch_duration_seconds` int DEFAULT '0',
  PRIMARY KEY (`viewer_id`),
  KEY `idx_livestream_user` (`livestream_id`,`user_id`),
  KEY `idx_user_history` (`user_id`,`joined_at`),
  CONSTRAINT `livestream_viewers_ibfk_1` FOREIGN KEY (`livestream_id`) REFERENCES `livestreams` (`livestream_id`) ON DELETE CASCADE,
  CONSTRAINT `livestream_viewers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livestream_viewers`
--

LOCK TABLES `livestream_viewers` WRITE;
/*!40000 ALTER TABLE `livestream_viewers` DISABLE KEYS */;
/*!40000 ALTER TABLE `livestream_viewers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `livestreams`
--

DROP TABLE IF EXISTS `livestreams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livestreams` (
  `livestream_id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stream_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stream_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('setup','scheduled','live','ended','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'setup',
  `hls_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rtmp_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_start_time` datetime DEFAULT NULL,
  `actual_start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_seconds` int DEFAULT '0',
  `peak_viewers` int DEFAULT '0',
  `total_viewers` int DEFAULT '0',
  `total_comments` int DEFAULT '0',
  `total_sales` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`livestream_id`),
  UNIQUE KEY `stream_key` (`stream_key`),
  UNIQUE KEY `stream_id_UNIQUE` (`stream_id`),
  KEY `idx_seller_status` (`seller_id`,`status`),
  KEY `idx_status` (`status`),
  KEY `idx_stream_key` (`stream_key`),
  KEY `idx_livestream_status_time` (`status`,`actual_start_time` DESC),
  CONSTRAINT `livestreams_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livestreams`
--

LOCK TABLES `livestreams` WRITE;
/*!40000 ALTER TABLE `livestreams` DISABLE KEYS */;
INSERT INTO `livestreams` VALUES (1,1,'Selling for today! ??','','310b425a-4e1c-4765-a1da-a41adf140372','310b-u4xc-byaw-ngis',NULL,'ended','https://livepeercdn.studio/hls/310b8qpz1hqrgq30/index.m3u8','rtmp://rtmp.livepeer.com/live/310b-u4xc-byaw-ngis',NULL,'2025-11-20 04:36:02','2025-11-20 04:38:00',118,0,0,0,0,'2025-11-19 20:35:54','2025-11-19 20:38:00'),(2,1,'Live selling today! ??','','a8534c20-9f55-48e6-ac7d-8e64adc7786c','a853-ys70-ksha-2g65',NULL,'ended','https://livepeercdn.studio/hls/a853ecnmyebosjre/index.m3u8','rtmp://rtmp.livepeer.com/live/a853-ys70-ksha-2g65',NULL,'2025-11-20 04:46:18','2025-11-20 04:48:24',126,0,0,0,0,'2025-11-19 20:46:11','2025-11-19 20:48:24');
/*!40000 ALTER TABLE `livestreams` ENABLE KEYS */;
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
  `sender_type` enum('user','seller','delivery_partner') NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=369 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (365,1,6,'user','Hello po, pwede po 120 nalang sa chicken thighs?','text',NULL,NULL,0,'2025-11-19 13:42:47','2025-11-19 13:42:47',NULL),(366,1,6,'user','Made an offer for Chicken Thighs','bargain_offer',NULL,NULL,0,'2025-11-19 13:43:00','2025-11-19 13:43:00',1),(367,2,1,'delivery_partner','San po kayo banda?','text',3,NULL,1,'2025-11-19 17:14:18','2025-11-19 17:17:58',NULL),(368,3,1,'delivery_partner','Sir papunta na po.','text',3,NULL,0,'2025-11-19 17:14:27','2025-11-19 17:14:27',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Application Approved!','Congratulations, Roberto! You can now start selling on Palenque Mart.','system',NULL,'seller','open_application_status',NULL,'null',0,'2025-11-18 17:15:44','2025-11-18 17:15:44'),(2,3,'Application Approved!','Congratulations, Jenny! You can now start selling on Palenque Mart.','system',NULL,'seller','open_application_status',NULL,'null',0,'2025-11-18 19:26:18','2025-11-18 19:26:18'),(3,4,'Application Approved!','Congratulations, Maria! You can now start selling on Palenque Mart.','system',NULL,'seller','open_application_status',NULL,'null',0,'2025-11-19 01:47:03','2025-11-19 01:47:03'),(4,5,'Application Approved!','Congratulations, Carlo! You can now start delivering for Palenque Mart.','system',NULL,'delivery_partner','open_application_status',NULL,'null',0,'2025-11-19 17:05:47','2025-11-19 17:05:47');
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,9,1,1,55.00,55.00,'{}','pending',NULL,'2025-11-19 13:43:49','2025-11-19 13:43:49',NULL),(2,2,2,1,1,420.00,420.00,'{}','out_for_delivery',NULL,'2025-11-19 13:48:28','2025-11-19 18:38:21',NULL),(3,2,6,1,1,55.00,55.00,'{}','out_for_delivery',NULL,'2025-11-19 13:48:28','2025-11-19 18:38:21',NULL),(4,2,3,1,1,170.00,170.00,'{}','out_for_delivery',NULL,'2025-11-19 13:48:28','2025-11-19 18:38:21',NULL),(5,3,11,2,1,140.00,140.00,'{}','delivered',NULL,'2025-11-19 13:48:28','2025-11-19 17:17:32',NULL);
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
  KEY `idx_status` (`status`),
  KEY `fk_order_status_history_user_idx` (`updated_by`),
  CONSTRAINT `fk_order_status_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_order_status_history_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,1,'pending','Order placed successfully',NULL,'2025-11-19 13:43:49'),(2,2,'pending','Order placed successfully',NULL,'2025-11-19 13:48:28'),(3,3,'pending','Order placed successfully',NULL,'2025-11-19 13:48:28'),(4,3,'confirmed','Accept and confirm this order',3,'2025-11-19 15:46:11'),(5,3,'preparing','Begin preparing the order items',3,'2025-11-19 15:46:19'),(6,3,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-11-19 15:46:25'),(7,3,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-11-19 17:09:10'),(8,2,'confirmed','Accept and confirm this order',2,'2025-11-19 18:29:24'),(9,2,'preparing','Begin preparing the order items',2,'2025-11-19 18:29:27'),(10,2,'ready_for_pickup','Order is ready for pickup by delivery partner',2,'2025-11-19 18:36:27');
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
  `livestream_id` int DEFAULT NULL,
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
  KEY `idx_delivery_address_id` (`delivery_address_id`),
  KEY `livestream_id` (`livestream_id`),
  KEY `fk_orders_seller` (`seller_id`),
  CONSTRAINT `fk_orders_delivery_address` FOREIGN KEY (`delivery_address_id`) REFERENCES `user_addresses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`livestream_id`) REFERENCES `livestreams` (`livestream_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,6,NULL,1,'ORD1763559829813495','pending','cash_on_delivery','pending',55.00,30.00,0.00,85.00,NULL,1,'James Ricarte','+639771495824','South Road','Illawod','Legazpi City','Albay','4500','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-11-19 13:43:49','2025-11-19 13:43:49','preorder',0.00,0.00),(2,6,NULL,1,'ORD1763560108490335','out_for_delivery','cash_on_delivery','pending',645.00,30.00,16.43,658.57,2,1,'James Ricarte','+639771495824','South Road','Illawod','Legazpi City','Albay','4500','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-11-19 13:48:28','2025-11-19 18:38:21','regular',0.00,0.00),(3,6,NULL,2,'ORD1763560108498449','delivered','cash_on_delivery','paid',140.00,30.00,3.57,166.43,2,1,'James Ricarte','+639771495824','South Road','Illawod','Legazpi City','Albay','4500','',NULL,NULL,'',NULL,'2025-11-19 17:17:32',NULL,NULL,'2025-11-19 13:48:28','2025-11-19 17:17:32','regular',0.00,0.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preorder_items`
--

LOCK TABLES `preorder_items` WRITE;
/*!40000 ALTER TABLE `preorder_items` DISABLE KEYS */;
INSERT INTO `preorder_items` VALUES (1,1,'2025-11-24 21:06:00',0.00,55.00,'pending_availability',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (3,11,6,3,5,'The product is fresh!',1,0,'2025-11-19 18:43:58','2025-11-19 18:43:58');
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
  `original_price` decimal(10,2) DEFAULT NULL,
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
  KEY `idx_bargaining_enabled` (`bargaining_enabled`),
  CONSTRAINT `fk_products_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Pork Liempo','Premium pork belly ideal for grilling and roasting',300.00,260.00,35,'Meat',NULL,'per_kilo','Fresh Indicator: Freshly delivered every morning','2025-11-18','Sourced from backyard farms in Daraga, Albay','{\"cut\": true, \"whole\": true, \"sliced\": true, \"cleaned\": false}','product-images/user_2/632567a9-4602-4b78-b2c1-16c7291bf82d-photo.png',1,'2025-11-18 17:59:54','2025-11-18 20:59:40',5.00,0,1,NULL,0,NULL,0,NULL,NULL),(2,1,'Beef Kalitiran','Tender beef shoulder cut perfect for slow cooking',430.00,420.00,17,'Meat',NULL,'per_kilo','Premium pork belly ideal for grilling and roasting','2025-11-18','Local cattle farms in Camalig','{\"cut\": false, \"whole\": true, \"sliced\": true, \"cleaned\": false}','product-images/user_2/3161a7e4-7f4e-4fd6-b2b9-479d22caffa6-photo.jpeg',1,'2025-11-18 18:02:19','2025-11-19 13:48:28',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(3,1,'Whole Chicken','Fresh native chicken, medium-sized',200.00,170.00,49,'Poultry',NULL,'per_piece','Slaughtered early morning','2025-11-18','Poultry farms in Guinobatan','{\"cut\": true, \"whole\": true, \"sliced\": false, \"cleaned\": true}','product-images/user_2/66b975a5-b1ec-41c7-9c86-08acf2586002-photo.jpeg',1,'2025-11-18 18:08:13','2025-11-19 13:48:28',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(4,1,'Chicken Liver','Fresh chicken liver, perfect for adobe or sauté',90.00,75.00,70,'Poultry',NULL,'per_500g','Delivered chilled','2025-11-18','Local suppliers in Albay','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/3cc25208-649e-4c9d-89c3-93c452bfeeb1-photo.jpeg',1,'2025-11-18 18:12:31','2025-11-18 21:02:00',3.00,0,1,NULL,0,NULL,0,NULL,NULL),(5,1,'Cabage (Repolyo)','Crisp green cabbage, medium-sized',50.00,45.00,120,'Vegetables',NULL,'per_piece','Farm-fresh and crisp','2025-11-18','Highland farms in Manito, Albay','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/67737df8-dcf6-4c95-aabc-9d84634aaef7-photo.jpeg',1,'2025-11-18 18:20:13','2025-11-18 21:02:00',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(6,1,'Tomatoes','Ripe red tomatoes',70.00,55.00,39,'Vegetables',NULL,'per_kilo','Newly harvested','2025-11-18','Ligao City farms','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/9846ad14-1362-4da5-a845-aa7c0d57f963-photo.jpeg',1,'2025-11-18 18:23:50','2025-11-19 13:48:28',4.00,0,1,NULL,0,NULL,0,NULL,NULL),(7,1,'Saba Bananas','Perfect for maruya and turon',70.00,60.00,40,'Fruits',NULL,'per_dozen','Naturally ripened ','2025-11-18','Daraga, Albay','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/3128ec2c-34d4-4085-876f-c596824c49c8-photo.jpeg',1,'2025-11-18 18:25:03','2025-11-18 21:02:00',1.90,0,1,NULL,0,NULL,0,NULL,NULL),(8,1,'Pineapple ','Medium-sized pineapple ',100.00,80.00,20,'Fruits',NULL,'per_piece','Sweet and juicy','2025-11-18','Polangui, Albay','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/6ab1701d-89b9-46e1-b075-a35a1a8c2642-photo.jpeg',1,'2025-11-18 18:26:07','2025-11-18 21:02:00',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(9,1,'Dinorado Rice','Premium aronatic white rice',60.00,55.00,0,'Grains',NULL,'per_kilo','Newly milled','2025-11-18','Oas, Albay','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/5249c721-b57e-49f2-8114-b355319ab511-photo.jpeg',1,'2025-11-18 18:27:19','2025-11-18 21:06:59',0.00,0,1,NULL,1,'2025-11-24 21:06:00',0,NULL,3),(10,1,'Brown Sugar','Locally produced muscovado sugar',45.00,38.00,60,'Others',NULL,'per_kilo','Dry, clump-free','2025-11-18','Bicol Region','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/767347ab-3a25-468a-b8ba-9545a42a8694-photo.jpeg',1,'2025-11-18 18:29:13','2025-11-18 21:02:00',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(11,2,'Tilapia','Mediym-sized tilapia',170.00,140.00,44,'Seafood',NULL,'per_kilo','Fresh catch delivered on ice','2025-11-18','Rawis Fish Port, Legazpi City','{\"cut\": false, \"whole\": true, \"sliced\": false, \"cleaned\": true}','product-images/user_3/17bf9236-669f-4eb1-829f-0f779de668ae-photo.jpeg',1,'2025-11-18 19:28:18','2025-11-19 18:43:59',5.00,1,1,NULL,0,NULL,0,NULL,NULL),(12,2,'Bangus','Ideal for daing and sinigang',200.00,170.00,30,'Seafood',NULL,'per_kilo','Fresh and firm','2025-11-18','Tiwi, Albay coastal waters','{\"cut\": true, \"whole\": true, \"sliced\": false, \"cleaned\": true}','product-images/user_3/6ec16069-1768-4d16-a418-9c1fa3e6793d-photo.jpeg',1,'2025-11-18 19:35:45','2025-11-18 21:02:00',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(13,2,'Shrimp','Medium-sized fresh shrimp',220.00,190.00,40,'Seafood',NULL,'per_500g','Clear shells, no foul odor','2025-11-18','Bacacay, Albay','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": true}','product-images/user_3/dd50b448-3b80-413c-ac3a-6e16db4f4a8d-photo.jpeg',1,'2025-11-18 19:37:58','2025-11-18 21:02:00',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(14,2,'Pork Pigue','Lean pork for stews',280.00,240.00,25,'Meat',NULL,'per_kilo','Freshly delivered','2025-11-18','Daraga farms','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/58ff50a0-aaa5-4ac4-af05-7fbe8ade9c1a-photo.jpeg',1,'2025-11-18 19:39:10','2025-11-18 21:02:00',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(15,2,'Chicken Thighs','Fresh meaty thighs',170.00,150.00,40,'Poultry',NULL,'per_kilo','Delivered chilled','2025-11-18','Legazpi poultry growers','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/b6de8126-d411-4a85-9e1e-52844e56d087-photo.jpeg',1,'2025-11-18 19:40:31','2025-11-18 21:02:00',1.60,0,1,NULL,0,NULL,0,NULL,NULL),(16,2,'Eggplant (Talong)','Long purple eggplants',70.00,60.00,35,'Vegetables',NULL,'per_kilo','Firm, freshly picked','2025-11-18','Sto. Domingo farms','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/f0f4fd2c-9af7-4d8b-995c-bbbc76a8ac41-photo.jpeg',1,'2025-11-18 19:42:15','2025-11-18 21:02:00',1.70,0,1,NULL,0,NULL,0,NULL,NULL),(17,2,'Mango (Carabao)','Premium mangoes',140.00,120.00,25,'Fruits',NULL,'per_kilo','Sweet and ripe','2025-11-18','San Carlos, Legazpi City','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/cef30b50-c750-4313-ab9c-4e482220e916-photo.jpeg',1,'2025-11-18 19:43:14','2025-11-18 21:02:00',1.80,0,1,NULL,0,NULL,0,NULL,NULL),(18,2,'Regular milled rice','Everyday affordable rice',55.00,48.00,150,'Grains',NULL,'per_kilo','Newly milled','2025-11-18','Tabaco City','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/c84bfc40-3ec2-42a8-aa46-cd9db3e1c6d5-photo.jpeg',1,'2025-11-18 19:44:13','2025-11-18 21:02:00',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(19,2,'Table Salt','Iodized fine salt',20.00,12.00,80,'Others',NULL,'per_pack','Dry, iodized','2025-11-18','Local distributor in Albay','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/39c4a7ff-e94d-4f49-89e1-1a36891980a6-photo.jpeg',1,'2025-11-18 19:45:13','2025-11-18 21:02:00',0.00,0,1,NULL,0,NULL,0,NULL,NULL),(20,3,'Tomatoes','Red, ripe, and firm tomatoes commonly used for everyday cooking.',60.00,60.00,20,'Vegetables',NULL,'per_kilo','Fresh and newly harvested','2025-11-19','Local farms in Legazpi City','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_4/2b7f193f-4a33-4a82-875e-d573ca77c61b-photo.jpeg',1,'2025-11-19 02:57:03','2025-11-19 02:57:03',0.00,0,1,NULL,0,NULL,0,NULL,NULL);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_helpfulness`
--

LOCK TABLES `review_helpfulness` WRITE;
/*!40000 ALTER TABLE `review_helpfulness` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_media`
--

LOCK TABLES `review_media` WRITE;
/*!40000 ALTER TABLE `review_media` DISABLE KEYS */;
INSERT INTO `review_media` VALUES (1,3,'product','image','user_6/order_3/b62d336f-a003-4c6e-a5ef-e35fcd5f83aa-6a5490c8-9de1-4440-8391-3667534f6800.jpeg','6a5490c8-9de1-4440-8391-3667534f6800.jpeg',22548,'image/jpeg',NULL,'2025-11-19 18:43:59');
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
  KEY `idx_coordinates` (`latitude`,`longitude`),
  CONSTRAINT `fk_seller_addresses_application` FOREIGN KEY (`application_id`) REFERENCES `seller_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_addresses`
--

LOCK TABLES `seller_addresses` WRITE;
/*!40000 ALTER TABLE `seller_addresses` DISABLE KEYS */;
INSERT INTO `seller_addresses` VALUES (1,1,'pickup','F. Imperial Street','Old Albay District','Legazpi City','Albay','4500',NULL,13.14671304,123.74811949,'2025-11-18 16:21:13','2025-11-18 16:21:13'),(2,1,'return','F. Imperial Street','Old Albay District','Legazpi City','Albay','4500',NULL,13.14671169,123.74811729,'2025-11-18 16:21:13','2025-11-18 16:21:13'),(3,1,'store','Mega Mart Section','Legazpi Public Market','Legazpi City','Albay','4500',NULL,13.14696325,123.75064306,'2025-11-18 16:21:13','2025-11-18 16:21:13'),(4,2,'pickup','Bgy. 13','Ilawod West','Legazpi City','Albay','4500',NULL,13.13715076,123.73489602,'2025-11-18 19:25:10','2025-11-18 19:25:10'),(5,2,'return','Marquez Street','Ilawod West','Legazpi City','Albay','4500',NULL,13.13716048,123.73489191,'2025-11-18 19:25:10','2025-11-18 19:25:10'),(6,2,'store','F. Aquende Drive','Baño','Legazpi City','Albay','4500',NULL,13.14028973,123.73443011,'2025-11-18 19:25:10','2025-11-18 19:25:10'),(7,3,'pickup','Marquez Street','Ilawod West','Legazpi','Albay','4500',NULL,13.13718022,123.73521014,'2025-11-18 23:22:42','2025-11-18 23:22:42'),(8,3,'return','L. Rivera Street','Ilawod West','Legazpi','Albay','4500',NULL,13.13718333,123.73521083,'2025-11-18 23:22:42','2025-11-18 23:22:42'),(9,3,'store','Balintawak Street','Baño','Legazpi','Albay','4500',NULL,13.14029985,123.73441670,'2025-11-18 23:22:42','2025-11-18 23:22:42');
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
  KEY `idx_reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_seller_applications_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_seller_applications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_applications`
--

LOCK TABLES `seller_applications` WRITE;
/*!40000 ALTER TABLE `seller_applications` DISABLE KEYS */;
INSERT INTO `seller_applications` VALUES (1,2,'APP82871571','individual','approved',NULL,'2025-11-18 16:21:11','2025-11-18 17:15:42','2025-11-18 17:15:42',1),(2,3,'APP93907233','individual','approved',NULL,'2025-11-18 19:25:07','2025-11-18 19:26:15','2025-11-18 19:26:15',1),(3,4,'APP08160930','individual','approved',NULL,'2025-11-18 23:22:40','2025-11-19 01:47:01','2025-11-19 01:47:01',1);
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
  KEY `idx_application_id` (`application_id`),
  CONSTRAINT `fk_seller_business_details_application` FOREIGN KEY (`application_id`) REFERENCES `seller_applications` (`id`) ON DELETE CASCADE
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
  KEY `idx_verification_status` (`verification_status`),
  CONSTRAINT `fk_seller_documents_application` FOREIGN KEY (`application_id`) REFERENCES `seller_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_documents`
--

LOCK TABLES `seller_documents` WRITE;
/*!40000 ALTER TABLE `seller_documents` DISABLE KEYS */;
INSERT INTO `seller_documents` VALUES (1,1,'government_id','user_1/APP82871571/government_id-1763482871600.jpg','government_id.jpg',110977,'image/jpeg','verified',NULL,'2025-11-18 16:21:13','2025-11-18 17:15:25'),(2,1,'selfie_with_id','user_1/APP82871571/selfie_with_id-1763482872467.jpeg','selfie_with_id.jpeg',454337,'image/jpeg','verified',NULL,'2025-11-18 16:21:13','2025-11-18 17:15:30'),(3,1,'bank_statement','user_1/APP82871571/bank_statement-1763482872963.jpg','bank_statement.jpg',158440,'image/jpeg','verified',NULL,'2025-11-18 16:21:13','2025-11-18 17:15:35'),(5,2,'government_id','user_3/APP93907233/government_id-1763493907240.jpg','government_id.jpg',110977,'image/jpeg','verified',NULL,'2025-11-18 19:25:10','2025-11-18 19:25:57'),(6,2,'selfie_with_id','user_3/APP93907233/selfie_with_id-1763493908244.jpeg','selfie_with_id.jpeg',836681,'image/jpeg','verified',NULL,'2025-11-18 19:25:10','2025-11-18 19:26:02'),(7,2,'bank_statement','user_3/APP93907233/bank_statement-1763493909869.jpg','bank_statement.jpg',158440,'image/jpeg','verified',NULL,'2025-11-18 19:25:10','2025-11-18 19:26:07'),(9,3,'government_id','user_4/APP08160930/government_id-1763508160941.jpg','government_id.jpg',110977,'image/jpeg','verified',NULL,'2025-11-18 23:22:42','2025-11-19 01:46:54'),(10,3,'selfie_with_id','user_4/APP08160930/selfie_with_id-1763508161841.jpeg','selfie_with_id.jpeg',521554,'image/jpeg','verified',NULL,'2025-11-18 23:22:42','2025-11-19 01:46:58'),(11,3,'bank_statement','user_4/APP08160930/bank_statement-1763508162215.jpg','bank_statement.jpg',158440,'image/jpeg','pending',NULL,'2025-11-18 23:22:42','2025-11-18 23:22:42');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_reviews`
--

LOCK TABLES `seller_reviews` WRITE;
/*!40000 ALTER TABLE `seller_reviews` DISABLE KEYS */;
INSERT INTO `seller_reviews` VALUES (1,2,6,3,5,'Great!','{\"packaging\": 5, \"communication\": 5, \"delivery_speed\": 5}','2025-11-19 18:43:58','2025-11-19 18:43:58');
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
  `weekday_opening_time` time DEFAULT NULL COMMENT 'Opening time for Monday-Friday',
  `weekday_closing_time` time DEFAULT NULL COMMENT 'Closing time for Monday-Friday',
  `weekend_opening_time` time DEFAULT NULL COMMENT 'Opening time for Saturday-Sunday',
  `weekend_closing_time` time DEFAULT NULL COMMENT 'Closing time for Saturday-Sunday',
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  CONSTRAINT `fk_seller_store_profiles_application` FOREIGN KEY (`application_id`) REFERENCES `seller_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_store_profiles`
--

LOCK TABLES `seller_store_profiles` WRITE;
/*!40000 ALTER TABLE `seller_store_profiles` DISABLE KEYS */;
INSERT INTO `seller_store_profiles` VALUES (1,1,'Albay Fresh Meats & Produce','Provides daily fresh cuts of meat, poultry, and vegetables sourced from nearby farms in Albay. Known for clean processing and fast pickup.','sellers/SELL86142766/store_logos/store_logo_1763486143716.png','2025-11-18 16:21:13','2025-11-18 17:15:44','08:00:00','20:00:00','08:00:00','20:00:00'),(2,2,'Pacific Harvest Seafood Corner','Specialized in daily-caught seafood from Legazpi Port and Nearby coastal barangays. Ensure fresh, clean, and ready-to-cook selections.','sellers/SELL93975920/store_logos/store_logo_1763493977367.png','2025-11-18 19:25:10','2025-11-18 19:26:18','08:00:00','20:00:00','08:00:00','20:00:00'),(3,3,'Fresh Finds','A small local store offering assorted fresh produce and pantry essentials sourced from nearby Albay suppliers. Focused on clean, well packed items and fast pickup service.','sellers/SELL16821358/store_logos/store_logo_1763516822837.png','2025-11-18 23:22:42','2025-11-19 01:47:03','08:00:00','20:00:00','08:00:00','20:00:00');
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
  `weekday_opening_time` time DEFAULT NULL COMMENT 'Opening time for Monday-Friday',
  `weekday_closing_time` time DEFAULT NULL COMMENT 'Closing time for Monday-Friday',
  `weekend_opening_time` time DEFAULT NULL COMMENT 'Opening time for Saturday-Sunday',
  `weekend_closing_time` time DEFAULT NULL COMMENT 'Closing time for Saturday-Sunday',
  PRIMARY KEY (`id`),
  UNIQUE KEY `seller_id` (`seller_id`),
  KEY `application_id` (`application_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_average_rating` (`average_rating`),
  CONSTRAINT `fk_sellers_application` FOREIGN KEY (`application_id`) REFERENCES `seller_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sellers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,2,1,'SELL86142766','individual','Albay Fresh Meats & Produce','Provides daily fresh cuts of meat, poultry, and vegetables sourced from nearby farms in Albay. Known for clean processing and fast pickup.','sellers/SELL86142766/store_logos/store_logo_1763486143716.png',1,'2025-11-18 17:15:42','2025-11-18 17:15:44',0.00,0,'08:00:00','20:00:00','08:00:00','20:00:00'),(2,3,2,'SELL93975920','individual','Pacific Harvest Seafood Corner','Specialized in daily-caught seafood from Legazpi Port and Nearby coastal barangays. Ensure fresh, clean, and ready-to-cook selections.','sellers/SELL93975920/store_logos/store_logo_1763493977367.png',1,'2025-11-18 19:26:15','2025-11-19 18:43:59',5.00,1,'08:00:00','20:00:00','08:00:00','20:00:00'),(3,4,3,'SELL16821358','individual','Fresh Finds','A small local store offering assorted fresh produce and pantry essentials sourced from nearby Albay suppliers. Focused on clean, well packed items and fast pickup service.','sellers/SELL16821358/store_logos/store_logo_1763516822837.png',1,'2025-11-19 01:47:01','2025-11-19 01:47:03',0.00,0,'08:00:00','20:00:00','08:00:00','20:00:00');
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
  KEY `idx_coordinates` (`latitude`,`longitude`),
  CONSTRAINT `fk_user_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_addresses`
--

LOCK TABLES `user_addresses` WRITE;
/*!40000 ALTER TABLE `user_addresses` DISABLE KEYS */;
INSERT INTO `user_addresses` VALUES (1,6,'home','James Ricarte','+639771495824','South Road','Illawod','Legazpi City','Albay','4500','',13.14496088,123.73793475,0,'2025-11-19 10:12:41','2025-11-19 10:12:41');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','Panel','admin@pm.com','$2b$10$gzaIps.4YeUslrp8vSKzYeWDW1d8/S8gt7UqxVZ7v.ZEQHvz2X9fm',NULL,NULL,NULL,NULL,'admin',1,'2025-11-18 12:52:12','2025-11-18 13:51:14'),(2,'Roberto','Dela Cruz','uhenyou@gmail.com','$2b$10$gzaIps.4YeUslrp8vSKzYeWDW1d8/S8gt7UqxVZ7v.ZEQHvz2X9fm','+63215567842',NULL,'1988-11-05','male','user',1,'2025-11-18 13:52:12','2025-11-19 10:06:35'),(3,'Jenny','Abarrientos','gdashrobtob@gmail.com','$2b$10$C4Z7XKFxsLItS4c9DOLzbuD/2nldt8vkfWi3nzQ16vGeNdrELuwO2','+639389127705',NULL,'1992-06-28','female','user',1,'2025-11-18 18:31:26','2025-11-18 18:32:26'),(4,'Maria','Santos','maria.santos963012@gmail.com','$2b$10$ufy74Mz7mIWklBXeUlUKzutgD47Zmcn1LyJ8oTJg1KBzvwNxoGWFe','+639172458930',NULL,'1996-03-12','female','user',1,'2025-11-18 22:06:10','2025-11-18 23:16:55'),(5,'Carlo','Villianueva','jamesmickelricarte@gmail.com','$2b$10$PjH.yQWjFonQSxfB10yP8uYL4fSY6K3FkRDTtyeEEEiPir0PQFkgq','+639516623498',NULL,'1995-01-19','male','user',1,'2025-11-19 00:31:29','2025-11-19 00:49:51'),(6,'James','Ricarte','jamesricarte33@gmail.com','$2b$10$k3bJ/0./R9rUMNokvidvcei3CYFgD.DhB31wneIag.SWCYAvYzH1O','+639771495824',NULL,NULL,NULL,'user',1,'2025-11-19 10:05:06','2025-11-19 10:06:55');
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
INSERT INTO `vouchers` VALUES (1,'WELCOME10','Welcome Discount','Get 10% off on your first order','percentage',10.00,100.00,50.00,NULL,4,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-09-27 14:00:09'),(2,'SAVE20','Save ₱20','Get ₱20 off on orders above ₱200','fixed_amount',20.00,200.00,NULL,NULL,1,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-11-19 13:48:28'),(3,'FREESHIP','Free Shipping','Free delivery on orders above ₱500','fixed_amount',50.00,500.00,NULL,100,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-07-22 08:00:00');
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

-- Dump completed on 2025-11-22  2:02:33
