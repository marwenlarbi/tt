# Tables boutique — création idempotente sous MySQL uniquement.

from django.db import migrations


SHOP_SQL = [
    """
    CREATE TABLE IF NOT EXISTS `produits` (
      `id` bigint NOT NULL AUTO_INCREMENT,
      `name` varchar(200) NOT NULL,
      `description` longtext NOT NULL,
      `price` decimal(10,2) NOT NULL,
      `old_price` decimal(10,2) NULL,
      `category` varchar(50) NOT NULL,
      `brand` varchar(100) NOT NULL,
      `weight` varchar(50) NOT NULL,
      `stock` int UNSIGNED NOT NULL,
      `status` varchar(20) NOT NULL,
      `image` varchar(100) NULL,
      `rating` decimal(3,1) NOT NULL,
      `reviews_count` int UNSIGNED NOT NULL,
      `created_at` datetime(6) NOT NULL,
      `updated_at` datetime(6) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS `commandes` (
      `id` bigint NOT NULL AUTO_INCREMENT,
      `status` varchar(20) NOT NULL,
      `total` decimal(10,2) NOT NULL,
      `address` varchar(255) NOT NULL,
      `phone` varchar(20) NOT NULL,
      `created_at` datetime(6) NOT NULL,
      `updated_at` datetime(6) NOT NULL,
      `customer_id` bigint NOT NULL,
      PRIMARY KEY (`id`),
      KEY `commandes_customer_id_idx` (`customer_id`),
      CONSTRAINT `commandes_customer_fk`
        FOREIGN KEY (`customer_id`) REFERENCES `comptes_utilisateur` (`id`)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS `lignes_commande` (
      `id` bigint NOT NULL AUTO_INCREMENT,
      `quantity` int UNSIGNED NOT NULL,
      `price` decimal(10,2) NOT NULL,
      `order_id` bigint NOT NULL,
      `product_id` bigint NOT NULL,
      PRIMARY KEY (`id`),
      KEY `ligne_order_id_idx` (`order_id`),
      KEY `ligne_product_id_idx` (`product_id`),
      CONSTRAINT `ligne_order_fk`
        FOREIGN KEY (`order_id`) REFERENCES `commandes` (`id`)
        ON DELETE CASCADE,
      CONSTRAINT `ligne_product_fk`
        FOREIGN KEY (`product_id`) REFERENCES `produits` (`id`)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
]


def forwards_shop(apps, schema_editor):
    if schema_editor.connection.vendor != "mysql":
        return
    with schema_editor.connection.cursor() as cursor:
        for stmt in SHOP_SQL:
            cursor.execute(stmt)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
        ("accounts", "0003_userprofile"),
    ]

    operations = [
        migrations.RunPython(forwards_shop, noop_reverse),
    ]
