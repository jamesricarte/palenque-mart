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
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_assignments`
--

LOCK TABLES `delivery_assignments` WRITE;
/*!40000 ALTER TABLE `delivery_assignments` DISABLE KEYS */;
INSERT INTO `delivery_assignments` VALUES (1,1,1,'delivered','2025-08-09 13:58:09','2025-08-09 14:02:19','2025-08-09 14:04:07',NULL,50.00,'Jamaica Mansions, Panal, Tabaco City, Albay 4511, Near you','Zone 5, Bangkilingan , Tabaco City, Albay 4511, Near melgar\'s bakery',NULL,'2025-08-09 10:44:26','2025-08-09 14:04:07'),(3,2,1,'delivered','2025-08-09 14:49:55','2025-08-09 14:50:04','2025-08-09 14:50:07',NULL,50.00,'Jamaica Mansions, Panal, Tabaco City, Albay 4511, Near you','Zone 5, Bangkilingan , Tabaco City, Albay 4511, Near melgar\'s bakery',NULL,'2025-08-09 14:15:07','2025-08-09 14:50:07'),(4,3,1,'delivered','2025-08-09 15:25:30','2025-08-09 15:30:00','2025-08-09 15:32:20',NULL,50.00,'Jamaica Mansions, Panal, Tabaco City, Albay 4511, Near you','Zone 5, Bangkilingan , Tabaco City, Albay 4511, Near melgar\'s bakery',NULL,'2025-08-09 15:24:40','2025-08-09 15:32:20'),(5,4,1,'delivered','2025-08-09 15:35:29','2025-08-09 15:36:18','2025-08-09 17:01:14',NULL,50.00,'Jamaica Mansions, Panal, Tabaco City, Albay 4511, Near you','Zone 5, Bangkilingan , Tabaco City, Albay 4511, Near melgar\'s bakery',NULL,'2025-08-09 15:34:51','2025-08-09 17:01:14'),(6,6,1,'delivered','2025-08-10 08:20:02','2025-08-10 08:20:16','2025-08-10 08:20:20',NULL,50.00,'Jamaica Mansions, Panal, Tabaco City, Albay 4511, Near you','Zone 5, Bangkilingan , Tabaco City, Albay 4511, Near melgar\'s bakery',NULL,'2025-08-10 07:38:53','2025-08-10 08:20:20'),(7,7,1,'delivered','2025-08-10 13:41:32','2025-08-10 14:22:35','2025-08-11 14:49:47',NULL,50.00,'Jamaica Mansions, Panal, Tabaco City, Albay 4511, Near you','Zone 5, Bangkilingan , Tabaco City, Albay 4511, Near melgar\'s bakery',NULL,'2025-08-10 08:46:43','2025-08-11 14:49:47'),(10,8,NULL,'looking_for_rider',NULL,NULL,NULL,NULL,50.00,'Ligao road, Bangkilingan, Tabaco City, Albay 4511','Jamaica Mansions, Panal, Tabaco City, Albay 4509',NULL,'2025-08-10 14:43:11','2025-08-10 14:43:11'),(12,9,1,'delivered','2025-08-10 17:10:19','2025-08-10 17:14:20','2025-08-11 14:46:22',NULL,50.00,'Ligao road, Bangkilingan, Tabaco City, Albay 4511','Jamaica Mansions, Panal, Tabaco City, Albay 4509',NULL,'2025-08-10 17:09:43','2025-08-11 14:46:22'),(13,10,1,'delivered','2025-08-10 17:16:51','2025-08-11 14:44:00','2025-08-11 14:44:17',NULL,50.00,'Ligao road, Bangkilingan, Tabaco City, Albay 4511','Jamaica Mansions, Panal, Tabaco City, Albay 4509',NULL,'2025-08-10 17:16:40','2025-08-11 14:44:17'),(22,11,1,'delivered','2025-08-11 14:38:50','2025-08-11 14:43:24','2025-08-11 14:43:43',NULL,50.00,'Ligao road, Bangkilingan, Tabaco City, Albay 4511','Jamaica Mansions, Panal, Tabaco City, Albay 4509',NULL,'2025-08-11 14:38:01','2025-08-11 14:43:43'),(23,12,1,'delivered','2025-08-11 14:52:20','2025-08-11 14:52:35','2025-08-11 14:52:44',NULL,50.00,'Ligao road, Bangkilingan, Tabaco City, Albay 4511','Jamaica Mansions, Panal, Tabaco City, Albay 4509',NULL,'2025-08-11 14:51:54','2025-08-11 14:52:44');
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_candidates`
--

LOCK TABLES `delivery_candidates` WRITE;
/*!40000 ALTER TABLE `delivery_candidates` DISABLE KEYS */;
INSERT INTO `delivery_candidates` VALUES (2,1,1,0.06,'accepted','2025-08-09 10:44:26','2025-08-09 13:58:09','2025-08-09 10:44:26','2025-08-09 13:58:09'),(3,3,1,0.02,'accepted','2025-08-09 14:15:07','2025-08-09 14:49:55','2025-08-09 14:15:07','2025-08-09 14:49:55'),(4,4,1,0.06,'accepted','2025-08-09 15:24:40','2025-08-09 15:25:30','2025-08-09 15:24:40','2025-08-09 15:25:30'),(5,5,1,0.06,'accepted','2025-08-09 15:34:51','2025-08-09 15:35:29','2025-08-09 15:34:51','2025-08-09 15:35:29'),(6,6,1,0.02,'accepted','2025-08-10 07:38:53','2025-08-10 08:20:02','2025-08-10 07:38:53','2025-08-10 08:20:02'),(7,7,1,0.02,'accepted','2025-08-10 08:46:43','2025-08-10 13:41:32','2025-08-10 08:46:43','2025-08-10 13:41:32'),(8,12,1,11136.99,'accepted','2025-08-10 17:09:43','2025-08-10 17:10:19','2025-08-10 17:09:43','2025-08-10 17:10:19'),(9,13,1,11136.99,'accepted','2025-08-10 17:16:40','2025-08-10 17:16:51','2025-08-10 17:16:40','2025-08-10 17:16:51'),(18,22,1,0.78,'accepted','2025-08-11 14:38:01','2025-08-11 14:38:50','2025-08-11 14:38:01','2025-08-11 14:38:50'),(19,23,1,0.77,'accepted','2025-08-11 14:51:54','2025-08-11 14:52:20','2025-08-11 14:51:54','2025-08-11 14:52:20');
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
INSERT INTO `delivery_partner_applications` VALUES (1,5,'DPA25062122','tricycle','DMW023-234-5422','PD-345D-D34-2344','Yamaha','Max','2018','Greeni','independent','[]','{\"friday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"monday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"sunday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"tuesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"saturday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"thursday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"wednesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}}','Marita C. Ricarte','09704954656','Parent','approved',NULL,'2025-08-03 13:44:59','2025-08-03 13:45:50','2025-08-03 13:45:50',1);
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
INSERT INTO `delivery_partner_documents` VALUES (1,1,'drivers_license','user_5/DPA25062122/drivers_license-1754228699944.jpeg','images%20(6).jpeg',53886,'image/jpeg','verified',NULL,'2025-08-03 13:45:00','2025-08-03 13:45:24'),(2,1,'vehicle_registration','user_5/DPA25062122/vehicle_registration-1754228700886.jpeg','images%20(7).jpeg',47849,'image/jpeg','verified',NULL,'2025-08-03 13:45:01','2025-08-03 13:45:31'),(4,1,'insurance','user_5/DPA25062122/insurance-1754228701404.png','images%20(1).png',26986,'image/png','pending',NULL,'2025-08-03 13:45:01','2025-08-03 13:45:01');
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
INSERT INTO `delivery_partners` VALUES (1,5,1,'DP25062122','tricycle','DMW023-234-5422','PD-345D-D34-2344','Yamaha','Max','2018','Greeni','independent','[]','{\"friday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"monday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"sunday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"tuesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"saturday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"thursday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}, \"wednesday\": {\"end\": \"17:00\", \"start\": \"09:00\", \"available\": false}}','Marita C. Ricarte','09704954656','Parent','delivery-partners/DP25062122/profile_photos/profile_photo_1754228751888.jpeg',1,'available',13.35193920,123.72180740,5.00,0,1,'2025-08-03 13:45:52','2025-08-11 14:53:31');
/*!40000 ALTER TABLE `delivery_partners` ENABLE KEYS */;
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
  `item_status` enum('pending','confirmed','preparing','ready_for_pickup','out_for_delivery','delivered','cancelled','refunded') DEFAULT 'pending',
  `seller_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_item_status` (`item_status`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-09 10:38:56','2025-08-09 10:44:26'),(2,2,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-09 14:11:34','2025-08-09 14:15:07'),(3,3,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-09 15:22:32','2025-08-09 15:24:40'),(4,4,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-09 15:33:23','2025-08-09 15:34:51'),(5,5,1,1,1,120.00,120.00,'{}','cancelled',NULL,'2025-08-10 07:36:01','2025-08-10 07:36:30'),(6,6,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-10 07:38:13','2025-08-10 07:38:53'),(7,7,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-10 08:46:19','2025-08-10 08:46:43'),(8,8,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-10 14:38:35','2025-08-10 14:43:11'),(9,9,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-10 17:04:35','2025-08-10 17:09:42'),(10,10,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-10 17:16:03','2025-08-10 17:16:40'),(11,11,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-11 13:32:32','2025-08-11 14:38:01'),(12,12,1,1,1,120.00,120.00,'{}','ready_for_pickup',NULL,'2025-08-11 14:50:54','2025-08-11 14:51:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (5,1,'pending','Order placed successfully',NULL,'2025-08-09 10:38:56'),(6,1,'confirmed','Accept and confirm this order',3,'2025-08-09 10:44:13'),(7,1,'preparing','Begin preparing the order items',3,'2025-08-09 10:44:15'),(8,1,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-09 10:44:26'),(9,2,'pending','Order placed successfully',NULL,'2025-08-09 14:11:34'),(10,2,'confirmed','Accept and confirm this order',3,'2025-08-09 14:12:01'),(11,2,'preparing','Begin preparing the order items',3,'2025-08-09 14:12:06'),(12,2,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-09 14:12:41'),(13,2,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-09 14:14:02'),(14,2,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-09 14:15:07'),(15,3,'pending','Order placed successfully',NULL,'2025-08-09 15:22:32'),(16,3,'confirmed','Accept and confirm this order',3,'2025-08-09 15:22:51'),(17,3,'preparing','Begin preparing the order items',3,'2025-08-09 15:23:37'),(18,3,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-09 15:24:40'),(19,4,'pending','Order placed successfully',NULL,'2025-08-09 15:33:23'),(20,4,'confirmed','Accept and confirm this order',3,'2025-08-09 15:34:15'),(21,4,'preparing','Begin preparing the order items',3,'2025-08-09 15:34:21'),(22,4,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-09 15:34:51'),(23,5,'pending','Order placed successfully',NULL,'2025-08-10 07:36:01'),(24,5,'cancelled','Decline this order',3,'2025-08-10 07:36:30'),(25,6,'pending','Order placed successfully',NULL,'2025-08-10 07:38:13'),(26,6,'confirmed','Accept and confirm this order',3,'2025-08-10 07:38:33'),(27,6,'preparing','Begin preparing the order items',3,'2025-08-10 07:38:45'),(28,6,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-10 07:38:53'),(29,7,'pending','Order placed successfully',NULL,'2025-08-10 08:46:19'),(30,7,'confirmed','Accept and confirm this order',3,'2025-08-10 08:46:30'),(31,7,'preparing','Begin preparing the order items',3,'2025-08-10 08:46:39'),(32,7,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-10 08:46:43'),(33,8,'pending','Order placed successfully',NULL,'2025-08-10 14:38:35'),(34,8,'confirmed','Accept and confirm this order',3,'2025-08-10 14:39:02'),(35,8,'preparing','Begin preparing the order items',3,'2025-08-10 14:39:08'),(36,8,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-10 14:39:11'),(37,8,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-10 14:41:02'),(38,8,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-10 14:43:11'),(39,9,'pending','Order placed successfully',NULL,'2025-08-10 17:04:35'),(40,9,'confirmed','Accept and confirm this order',3,'2025-08-10 17:05:41'),(41,9,'preparing','Begin preparing the order items',3,'2025-08-10 17:05:45'),(42,9,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-10 17:05:55'),(43,9,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-10 17:09:42'),(44,10,'pending','Order placed successfully',NULL,'2025-08-10 17:16:03'),(45,10,'confirmed','Accept and confirm this order',3,'2025-08-10 17:16:32'),(46,10,'preparing','Begin preparing the order items',3,'2025-08-10 17:16:35'),(47,10,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-10 17:16:40'),(48,11,'pending','Order placed successfully',NULL,'2025-08-11 13:32:32'),(49,11,'confirmed','Accept and confirm this order',3,'2025-08-11 13:32:52'),(50,11,'preparing','Begin preparing the order items',3,'2025-08-11 13:32:59'),(51,11,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 13:33:28'),(52,11,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 13:44:01'),(53,11,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 13:49:18'),(54,11,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 13:54:32'),(55,11,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 13:58:15'),(56,11,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 14:04:00'),(57,11,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 14:29:55'),(58,11,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 14:36:43'),(59,11,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 14:38:01'),(60,12,'pending','Order placed successfully',NULL,'2025-08-11 14:50:54'),(61,12,'confirmed','Accept and confirm this order',3,'2025-08-11 14:51:15'),(62,12,'preparing','Begin preparing the order items',3,'2025-08-11 14:51:27'),(63,12,'ready_for_pickup','Order is ready for pickup by delivery partner',3,'2025-08-11 14:51:54');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_voucher_id` (`voucher_id`),
  KEY `idx_delivery_address_id` (`delivery_address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,1,'ORD1754735936902263','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,3,'James Ricarte','+639771495824','Zone 5','Bangkilingan ','Tabaco City','Albay','4511','Near melgar\'s bakery',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-09 10:38:56','2025-08-09 14:04:07'),(2,2,1,'ORD1754748694259024','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,3,'James Ricarte','+639771495824','Zone 5','Bangkilingan ','Tabaco City','Albay','4511','Near melgar\'s bakery',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-09 14:11:34','2025-08-09 14:50:07'),(3,2,1,'ORD1754752952160231','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,3,'James Ricarte','+639771495824','Zone 5','Bangkilingan ','Tabaco City','Albay','4511','Near melgar\'s bakery',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-09 15:22:32','2025-08-09 15:32:20'),(4,2,1,'ORD1754753603672063','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,3,'James Ricarte','+639771495824','Zone 5','Bangkilingan ','Tabaco City','Albay','4511','Near melgar\'s bakery',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-09 15:33:23','2025-08-09 17:01:14'),(5,5,1,'ORD1754811361945700','cancelled','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,8,'James Mickel','+639771495821','006 Karangahan Boulevard','Panal','Tabaco City','Albay','4511','',NULL,NULL,'',NULL,NULL,'2025-08-10 07:36:30','Decline this order','2025-08-10 07:36:01','2025-08-10 07:36:30'),(6,2,1,'ORD1754811493293921','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,3,'James Ricarte','+639771495824','Zone 5','Bangkilingan ','Tabaco City','Albay','4511','Near melgar\'s bakery',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-10 07:38:13','2025-08-10 08:20:20'),(7,2,1,'ORD1754815579717736','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,3,'James Ricarte','+639771495824','Zone 5','Bangkilingan ','Tabaco City','Albay','4511','Near melgar\'s bakery',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-10 08:46:19','2025-08-11 14:49:47'),(8,2,1,'ORD1754836715790823','ready_for_pickup','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,9,'James Ricarte','+639771495824','Jamaica Mansions','Panal','Tabaco City','Albay','4509','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-10 14:38:35','2025-08-10 14:43:11'),(9,2,1,'ORD1754845475036015','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,9,'James Ricarte','+639771495824','Jamaica Mansions','Panal','Tabaco City','Albay','4509','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-10 17:04:35','2025-08-11 14:46:22'),(10,2,1,'ORD1754846163560958','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,9,'James Ricarte','+639771495824','Jamaica Mansions','Panal','Tabaco City','Albay','4509','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-10 17:16:03','2025-08-11 14:44:17'),(11,2,1,'ORD1754919152421539','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,9,'James Ricarte','+639771495824','Jamaica Mansions','Panal','Tabaco City','Albay','4509','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-11 13:32:32','2025-08-11 14:43:43'),(12,2,1,'ORD1754923854378002','delivered','cash_on_delivery','pending',120.00,50.00,0.00,170.00,NULL,9,'James Ricarte','+639771495824','Jamaica Mansions','Panal','Tabaco City','Albay','4509','',NULL,NULL,'',NULL,NULL,NULL,NULL,'2025-08-11 14:50:54','2025-08-11 14:52:44');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Tilapia','Wala lang',120.00,6,'Fish','Tilapia','per_500g','Slaugthered this morning','2025-08-05','From Daraga Market','{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/c79f8188-c20f-49dd-9b66-17c408581624-photo.jpeg',1,'2025-08-05 18:03:52','2025-08-11 14:50:54');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_addresses`
--

LOCK TABLES `seller_addresses` WRITE;
/*!40000 ALTER TABLE `seller_addresses` DISABLE KEYS */;
INSERT INTO `seller_addresses` VALUES (1,2,'pickup','Ligao road','Bangkilingan','Tabaco City','Albay','4511',NULL,13.35694665,123.71678252,'2025-08-05 15:48:58','2025-08-10 05:23:11'),(2,2,'return','Jamaica Mansions','Panal','Tabaco City','Albay','4511','Near me',13.35258860,123.72160200,'2025-08-05 15:48:58','2025-08-10 05:23:11'),(3,2,'store','Jamaica Mansions','Panal','Tabaco City','Albay','4511','Near us',13.35179807,123.72197628,'2025-08-05 15:48:58','2025-08-10 05:23:11'),(30,3,'pickup','Zone 2','Panal','Tabaco City','Albay','4511','Near us',13.35240810,123.72177890,'2025-08-07 07:09:37','2025-08-07 07:09:37'),(31,3,'return','Zone 2','Panal','Tabaco City','Albay','4511','Near us',13.35196170,123.72180000,'2025-08-07 07:09:37','2025-08-07 07:09:37'),(32,3,'store','Zone 2','Panal','Tabaco City','Albay','4511','Near me',13.35220420,123.72170020,'2025-08-07 07:09:37','2025-08-07 07:09:37');
/*!40000 ALTER TABLE `seller_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_addresses_backup`
--

DROP TABLE IF EXISTS `seller_addresses_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_addresses_backup` (
  `id` int NOT NULL DEFAULT '0',
  `application_id` int NOT NULL,
  `pickup_address` text NOT NULL,
  `return_address` text NOT NULL,
  `store_location` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_addresses_backup`
--

LOCK TABLES `seller_addresses_backup` WRITE;
/*!40000 ALTER TABLE `seller_addresses_backup` DISABLE KEYS */;
/*!40000 ALTER TABLE `seller_addresses_backup` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_applications`
--

LOCK TABLES `seller_applications` WRITE;
/*!40000 ALTER TABLE `seller_applications` DISABLE KEYS */;
INSERT INTO `seller_applications` VALUES (2,3,'APP08830004','individual','approved',NULL,'2025-08-05 15:47:10','2025-08-05 18:02:32','2025-08-05 18:02:32',1),(3,2,'APP50575021','individual','pending',NULL,'2025-08-07 07:09:35','2025-08-07 07:09:35',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_documents`
--

LOCK TABLES `seller_documents` WRITE;
/*!40000 ALTER TABLE `seller_documents` DISABLE KEYS */;
INSERT INTO `seller_documents` VALUES (1,2,'government_id','user_3/APP08830004/government_id-1754408830016.png','UMID_EMV_sample.png',1875925,'image/png','verified',NULL,'2025-08-05 15:48:58','2025-08-05 17:56:09'),(2,2,'selfie_with_id','user_3/APP08830004/selfie_with_id-1754408929232.jpeg','selfie_with_id.jpeg',806519,'image/jpeg','verified',NULL,'2025-08-05 15:48:58','2025-08-05 17:58:22'),(3,2,'bank_statement','user_3/APP08830004/bank_statement-1754408937968.png','images%20(1).png',19164,'image/png','verified',NULL,'2025-08-05 15:48:58','2025-08-05 17:59:42'),(4,3,'government_id','user_2/APP50575021/government_id-1754550575029.png','UMID_EMV_sample.png',1875925,'image/png','pending',NULL,'2025-08-07 07:09:37','2025-08-07 07:09:37'),(5,3,'selfie_with_id','user_2/APP50575021/selfie_with_id-1754550576269.jpeg','selfie_with_id.jpeg',1002227,'image/jpeg','pending',NULL,'2025-08-07 07:09:37','2025-08-07 07:09:37'),(6,3,'bank_statement','user_2/APP50575021/bank_statement-1754550577303.png','images%20(1).png',19164,'image/png','pending',NULL,'2025-08-07 07:09:37','2025-08-07 07:09:37');
/*!40000 ALTER TABLE `seller_documents` ENABLE KEYS */;
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
INSERT INTO `seller_store_profiles` VALUES (1,2,'James Store','Happy Selling',NULL,'2025-08-05 15:48:58','2025-08-05 17:56:26'),(2,3,'James Store','Sad selling ?',NULL,'2025-08-07 07:09:37','2025-08-07 07:09:37');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `seller_id` (`seller_id`),
  KEY `application_id` (`application_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,3,2,'SELL16952234','individual','Boy Banat Store','Happy Selling',NULL,1,'2025-08-05 18:02:32','2025-08-10 05:23:11');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_addresses`
--

LOCK TABLES `user_addresses` WRITE;
/*!40000 ALTER TABLE `user_addresses` DISABLE KEYS */;
INSERT INTO `user_addresses` VALUES (3,2,'home','James Ricarte','+639771495824','Zone 5','Bangkilingan ','Tabaco City','Albay','4511','Near melgar\'s bakery',13.35872410,123.72536130,0,'2025-07-23 17:18:44','2025-08-10 10:17:34'),(4,4,'home','Jessie Melgar','+639771495823','Zone 3','Guinobat','Tabaco City','Albay','4511','Near basketball court',13.35872410,123.72536130,0,'2025-07-24 12:26:23','2025-08-10 10:17:34'),(5,5,'home','James Mickel','+639771495821','Jamaica Mansions','Panal','Tabaco City','Albay','4511','Near church',13.35872410,123.72536130,0,'2025-08-04 08:07:46','2025-08-10 10:17:34'),(6,5,'home','James Mickel','+639771495821','Tabaco City','Albay','Tabaco City','Bicol','','',13.35872410,123.72536130,0,'2025-08-04 12:05:44','2025-08-10 10:17:34'),(7,5,'home','James Mickel','+639771495821','8PXC+9C','Albay','Tabaco City','Bicol','4511','',13.35872410,123.72536130,0,'2025-08-04 12:14:51','2025-08-10 10:17:34'),(8,5,'home','James Mickel','+639771495821','006 Karangahan Boulevard','Panal','Tabaco City','Albay','4511','',13.35872410,123.72536130,0,'2025-08-04 15:12:48','2025-08-10 10:17:34'),(9,2,'home','James Ricarte','+639771495824','Jamaica Mansions','Panal','Tabaco City','Albay','4509','',13.35872410,123.72536130,0,'2025-08-10 10:14:10','2025-08-10 10:14:10');
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
INSERT INTO `users` VALUES (1,'Admin','User','admin@pm.com','$2a$12$fUYXFIMWIqLTACJ8.Qt5..Ku0JavZAlOv3BN9dLqB0jRbx87BawJu',NULL,NULL,NULL,NULL,'admin',1,'2025-07-17 14:43:52','2025-07-17 15:01:30'),(2,'James','Ricarte','uhenyou@gmail.com','$2b$10$QDJSH/XYM6U2Dqjga3DOyeITqsYx2S7qSBmpFTzka0R0lhsQli9ke','+639771495824',NULL,'2003-01-03','male','user',1,'2025-07-17 14:46:24','2025-07-17 14:47:16'),(3,'Boy','Banat','gdashrobtob@gmail.com','$2b$10$9tvwV4nMfjGKuaq4OvplB.o6YYCm20qEBAH9v9teNN9aJRM21eR2W','+639771495822',NULL,'2003-01-03','male','user',1,'2025-07-17 14:48:49','2025-07-17 14:49:45'),(4,'Jessie','Melgar','07110972@dwc-legazpi.edu','$2b$10$krXrMEKGa0r8CFKNKrFE6ek1snEX9HJzMkr7wg1RjfFede4cqE0lq','+639771495823',NULL,'2003-01-03','male','user',1,'2025-07-20 15:34:19','2025-07-20 15:35:17'),(5,'James','Mickel','jamesmickelricarte@gmail.com','$2b$10$oIRgpnR0W1G0mq7M1feh3.jhC83WLdMGyRwRuv2tviXeiX4TGcphm','+639771495821',NULL,'2003-01-03','male','user',1,'2025-07-29 10:41:43','2025-08-03 13:50:28');
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
INSERT INTO `vouchers` VALUES (1,'WELCOME10','Welcome Discount','Get 10% off on your first order','percentage',10.00,100.00,50.00,NULL,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-07-22 08:00:00'),(2,'SAVE20','Save ₱20','Get ₱20 off on orders above ₱200','fixed_amount',20.00,200.00,NULL,NULL,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-07-22 08:00:00'),(3,'FREESHIP','Free Shipping','Free delivery on orders above ₱500','fixed_amount',50.00,500.00,NULL,100,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-07-22 08:00:00');
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

-- Dump completed on 2025-08-11 22:54:53
