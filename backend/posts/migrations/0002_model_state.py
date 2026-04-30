# État des modèles non gérés (tables créées par 0001_mysql_publications).
# Aucune opération SQL : synchronise uniquement l’historique Django avec models.py.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0001_mysql_publications"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Post",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content", models.TextField()),
                ("type", models.CharField(max_length=20)),
                ("image", models.CharField(blank=True, max_length=100, null=True)),
                ("video", models.CharField(blank=True, max_length=100, null=True)),
                ("created_at", models.DateTimeField()),
                ("updated_at", models.DateTimeField()),
                (
                    "author",
                    models.ForeignKey(
                        db_column="author_id",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="posts",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "publications",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Comment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("text", models.TextField()),
                ("created_at", models.DateTimeField()),
                (
                    "author",
                    models.ForeignKey(
                        db_column="author_id",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="post_comments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "post",
                    models.ForeignKey(
                        db_column="post_id",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="comments",
                        to="posts.post",
                    ),
                ),
            ],
            options={
                "db_table": "publications_commentaires",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Like",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField()),
                (
                    "user",
                    models.ForeignKey(
                        db_column="user_id",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="post_likes",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "post",
                    models.ForeignKey(
                        db_column="post_id",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="likes",
                        to="posts.post",
                    ),
                ),
            ],
            options={
                "db_table": "publications_mentions_j_aime",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Report",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("type", models.CharField(max_length=20)),
                ("content_id", models.PositiveIntegerField()),
                ("reason", models.CharField(max_length=200)),
                ("description", models.TextField()),
                ("status", models.CharField(max_length=20)),
                ("priority", models.CharField(max_length=10)),
                ("admin_notes", models.TextField()),
                ("created_at", models.DateTimeField()),
                ("updated_at", models.DateTimeField()),
                (
                    "reported_by",
                    models.ForeignKey(
                        db_column="reported_by_id",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reports_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "reported_user",
                    models.ForeignKey(
                        blank=True,
                        db_column="reported_user_id",
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="reports_received",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "signalements",
                "managed": False,
            },
        ),
    ]
