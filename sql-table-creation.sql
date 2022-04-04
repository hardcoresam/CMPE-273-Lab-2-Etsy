CREATE TABLE `member` (
    `id` int NOT NULL AUTO_INCREMENT,
    `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
    `password` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
    `first_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
    `last_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `gender` enum('MALE', 'FEMALE', 'RATHER_NOT_SAY') COLLATE utf8mb4_general_ci DEFAULT NULL,
    `photo` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `date_of_birth` date DEFAULT NULL,
    `phone_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `street_address` varchar(1000) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `apt_no` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `city` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `state` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `country` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `zipcode` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `currency` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'USD',
    `about` varchar(10000) COLLATE utf8mb4_general_ci DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 17 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci

CREATE TABLE `shop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `photo` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `owner_id` int NOT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `shop_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `member` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

INSERT INTO `category` (id, name) VALUES(1, 'Clothing');
INSERT INTO `category` (id, name) VALUES(2, 'Jewellery');
INSERT INTO `category` (id, name) VALUES(3, 'Entertainment');
INSERT INTO `category` (id, name) VALUES(4, 'Home Decor');
INSERT INTO `category` (id, name) VALUES(5, 'Art');

CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `photo` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category_id` int NOT NULL,
  `description` varchar(10000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` decimal(10,3) unsigned NOT NULL,
  `quantity_available` smallint unsigned NOT NULL,
  `shop_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `shop_id` (`shop_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`),
  CONSTRAINT `product_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

CREATE TABLE `favourite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `favourite_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`),
  CONSTRAINT `favourite_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

CREATE TABLE `cart_product` (
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` smallint unsigned NOT NULL,
  PRIMARY KEY (`cart_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_product_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`),
  CONSTRAINT `cart_product_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL DEFAULT (curdate()),
  `time` time NOT NULL DEFAULT (curtime()),
  `member_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

CREATE TABLE `order_product` (
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` smallint unsigned NOT NULL,
  `price` decimal(10,3) unsigned NOT NULL,
  PRIMARY KEY (`order_id`,`product_id`),
  KEY `order_product_ibfk_2` (`product_id`),
  CONSTRAINT `order_product_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`),
  CONSTRAINT `order_product_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci