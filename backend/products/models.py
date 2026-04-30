from django.conf import settings
from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    category = models.CharField(max_length=50)
    brand = models.CharField(max_length=100)
    weight = models.CharField(max_length=50)
    stock = models.PositiveIntegerField()
    status = models.CharField(max_length=20)  # active|low_stock|out_of_stock
    image = models.CharField(max_length=100, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    reviews_count = models.PositiveIntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = "produits"
        managed = False


class Order(models.Model):
    status = models.CharField(max_length=20)  # processing|shipping|delivered|cancelled
    total = models.DecimalField(max_digits=10, decimal_places=2)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="customer_id", related_name="shop_orders"
    )

    class Meta:
        db_table = "commandes"
        managed = False


class OrderItem(models.Model):
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column="order_id", related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_column="product_id", related_name="order_items")

    class Meta:
        db_table = "lignes_commande"
        managed = False
