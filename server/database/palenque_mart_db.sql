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
INSERT INTO `cart` VALUES (2,3,2,1,'2025-07-21 14:19:55','2025-07-21 14:19:55');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
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
  `vehicle_type` enum('motorcycle','bicycle','car','truck') NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `vehicle_registration` varchar(50) NOT NULL,
  `service_areas` json NOT NULL,
  `availability_hours` json NOT NULL,
  `emergency_contact_name` varchar(255) NOT NULL,
  `emergency_contact_phone` varchar(20) NOT NULL,
  `status` enum('pending','approved','rejected','under_review') DEFAULT 'pending',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_partner_applications`
--

LOCK TABLES `delivery_partner_applications` WRITE;
/*!40000 ALTER TABLE `delivery_partner_applications` DISABLE KEYS */;
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_document_type` (`document_type`),
  KEY `idx_verification_status` (`verification_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_partner_documents`
--

LOCK TABLES `delivery_partner_documents` WRITE;
/*!40000 ALTER TABLE `delivery_partner_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_partner_documents` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Karne','Fresh meats',120.00,150,'Meat','Pork Chop','per_kilo','Harvested  yesterday','2025-07-21',NULL,'{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/453e0f9e-5bb4-446b-a16e-0cd70e9027cb-photo.jpeg',1,'2025-07-21 11:17:15','2025-07-21 11:17:15'),(2,1,'Whole Chicken','',290.00,50,'Meat','Chicken','per_piece',NULL,'2025-07-21',NULL,'{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_2/5e7dc5c6-e28a-4a3c-9c86-7eb1d9912d68-photo.jpeg',1,'2025-07-21 11:42:34','2025-07-21 11:42:34'),(3,2,'Kamatis','',25.00,20,'Fruits','Other','per_250g','Harvested yesterday ','2025-07-21',NULL,'{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/b9184cee-be10-43a7-ab07-363730bcf94d-photo.jpeg',1,'2025-07-21 12:29:12','2025-07-21 12:29:12'),(4,2,'Apple','',20.00,50,'Fruits','Other','per_250g',NULL,'2025-07-21',NULL,'{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/b2ae2953-30bf-49b8-be40-04a882584a7f-photo.jpeg',1,'2025-07-21 12:42:28','2025-07-21 12:42:28'),(5,2,'Sibulyas','Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit',10.00,250,'Vegetables','Root Vegetables','per_piece',NULL,'2025-07-21',NULL,'{\"cut\": false, \"whole\": false, \"sliced\": false, \"cleaned\": false}','product-images/user_3/3f1e3928-68dc-4a4d-9884-f05de56bf71a-photo.jpeg',1,'2025-07-21 12:44:41','2025-07-21 12:44:41');
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
  `pickup_address` text NOT NULL,
  `return_address` text NOT NULL,
  `store_location` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_addresses`
--

LOCK TABLES `seller_addresses` WRITE;
/*!40000 ALTER TABLE `seller_addresses` DISABLE KEYS */;
INSERT INTO `seller_addresses` VALUES (1,1,'Panal, Tabaco City, Albay','Panal, Tabaco City, Albay',NULL,'2025-07-21 11:12:07','2025-07-21 11:12:07'),(2,2,'Guinobat, Tabaco City, Albay','Guinobat, Tabaco City, Albay',NULL,'2025-07-21 12:25:04','2025-07-21 12:25:04');
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
INSERT INTO `seller_applications` VALUES (1,2,'APP96323852','individual','approved',NULL,'2025-07-21 11:12:03','2025-07-21 11:15:27','2025-07-21 11:15:27',1),(2,3,'APP00700985','individual','approved',NULL,'2025-07-21 12:25:01','2025-07-21 12:38:53','2025-07-21 12:38:53',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_documents`
--

LOCK TABLES `seller_documents` WRITE;
/*!40000 ALTER TABLE `seller_documents` DISABLE KEYS */;
INSERT INTO `seller_documents` VALUES (1,1,'government_id','user_2/APP96323852/government_id-1753096323860.png','UMID_EMV_sample.png',3902179,'image/png','verified',NULL,'2025-07-21 11:12:07','2025-07-21 11:12:39'),(2,1,'selfie_with_id','user_2/APP96323852/selfie_with_id-1753096386803.jpeg','91cc44f1-adcc-4f5c-bd69-5c77250d0914.jpeg',19097,'image/jpeg','verified',NULL,'2025-07-21 11:12:07','2025-07-21 11:15:05'),(3,1,'bank_statement','user_2/APP96323852/bank_statement-1753096326968.png','images.png',19164,'image/png','verified',NULL,'2025-07-21 11:12:07','2025-07-21 11:15:09'),(5,2,'government_id','user_3/APP00700985/government_id-1753100701028.png','UMID_EMV_sample.png',1875925,'image/png','verified',NULL,'2025-07-21 12:25:04','2025-07-21 12:25:56'),(6,2,'selfie_with_id','user_3/APP00700985/selfie_with_id-1753100703365.jpeg','selfie_with_id.jpeg',635489,'image/jpeg','verified',NULL,'2025-07-21 12:25:04','2025-07-21 12:26:02'),(7,2,'bank_statement','user_3/APP00700985/bank_statement-1753100703907.png','images%20(1).png',19164,'image/png','pending',NULL,'2025-07-21 12:25:04','2025-07-21 12:25:04');
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
INSERT INTO `seller_store_profiles` VALUES (1,1,'James Store','Selling meats ','sellers/SELL96527952/store_logos/store_logo_1753096528967.jpeg','2025-07-21 11:12:07','2025-07-21 11:15:29'),(2,2,'Boy banat store','Selling fruits and vegetables Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit',NULL,'2025-07-21 12:25:04','2025-07-21 12:25:04');
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,2,1,'SELL96527952','individual','James Store','Selling meats ','sellers/SELL96527952/store_logos/store_logo_1753096528967.jpeg',1,'2025-07-21 11:15:27','2025-07-21 11:15:29'),(2,3,2,'SELL00767892','individual','Boy banat store','Selling fruits and vegetables Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit',NULL,1,'2025-07-21 12:26:07','2025-07-21 12:26:07'),(3,3,2,'SELL01332353','individual','Boy banat store','Selling fruits and vegetables Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit',NULL,1,'2025-07-21 12:35:32','2025-07-21 12:35:32'),(4,3,2,'SELL01469137','individual','Boy banat store','Selling fruits and vegetables Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit',NULL,1,'2025-07-21 12:37:49','2025-07-21 12:37:49'),(5,3,2,'SELL01533866','individual','Boy banat store','Selling fruits and vegetables Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit',NULL,1,'2025-07-21 12:38:53','2025-07-21 12:38:53');
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','User','admin@pm.com','$2a$12$fUYXFIMWIqLTACJ8.Qt5..Ku0JavZAlOv3BN9dLqB0jRbx87BawJu',NULL,NULL,NULL,NULL,'admin',1,'2025-07-17 14:43:52','2025-07-17 15:01:30'),(2,'James','Ricarte','uhenyou@gmail.com','$2b$10$QDJSH/XYM6U2Dqjga3DOyeITqsYx2S7qSBmpFTzka0R0lhsQli9ke','+639771495824',NULL,'2003-01-03','male','user',1,'2025-07-17 14:46:24','2025-07-17 14:47:16'),(3,'Boy','Banat','gdashrobtob@gmail.com','$2b$10$9tvwV4nMfjGKuaq4OvplB.o6YYCm20qEBAH9v9teNN9aJRM21eR2W','+639771495822',NULL,'2003-01-03','male','user',1,'2025-07-17 14:48:49','2025-07-17 14:49:45'),(4,'Jessie','Melgar','07110972@dwc-legazpi.edu','$2b$10$krXrMEKGa0r8CFKNKrFE6ek1snEX9HJzMkr7wg1RjfFede4cqE0lq','+639771495823',NULL,'2003-01-03','male','user',1,'2025-07-20 15:34:19','2025-07-20 15:35:17');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_number` varchar(20) NOT NULL,
  `status` enum('pending','confirmed','preparing','ready_for_pickup','out_for_delivery','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_method` enum('cash_on_delivery','online_payment') DEFAULT 'cash_on_delivery',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) DEFAULT '0.00',
  `voucher_discount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `voucher_id` int DEFAULT NULL,
  `delivery_address_id` int NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `item_status` enum('pending','confirmed','preparing','ready','cancelled') DEFAULT 'pending',
  `seller_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_item_status` (`item_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES 
(1,'WELCOME10','Welcome Discount','Get 10% off on your first order','percentage',10.00,100.00,50.00,NULL,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-07-22 08:00:00'),
(2,'SAVE20','Save ₱20','Get ₱20 off on orders above ₱200','fixed_amount',20.00,200.00,NULL,NULL,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-07-22 08:00:00'),
(3,'FREESHIP','Free Shipping','Free delivery on orders above ₱500','fixed_amount',50.00,500.00,NULL,100,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-07-22 08:00:00','2025-07-22 08:00:00');
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

-- Dump completed on 2025-07-21 22:45:02
