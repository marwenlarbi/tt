# Colonne parent_id sur publications_commentaires (MySQL) + table posts_comment_reaction.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def add_comment_parent_column(apps, schema_editor):
    if schema_editor.connection.vendor != "mysql":
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'publications_commentaires'
              AND COLUMN_NAME = 'parent_id'
            """
        )
        if cursor.fetchone()[0]:
            return
        cursor.execute(
            """
            ALTER TABLE `publications_commentaires`
            ADD COLUMN `parent_id` bigint NULL AFTER `post_id`
            """
        )
        cursor.execute(
            """
            ALTER TABLE `publications_commentaires`
            ADD KEY `pub_com_parent_id_idx` (`parent_id`)
            """
        )
        cursor.execute(
            """
            ALTER TABLE `publications_commentaires`
            ADD CONSTRAINT `pub_com_parent_fk`
            FOREIGN KEY (`parent_id`) REFERENCES `publications_commentaires` (`id`)
            ON DELETE CASCADE
            """
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("posts", "0003_savedpost"),
    ]

    operations = [
        migrations.RunPython(add_comment_parent_column, noop_reverse),
        migrations.CreateModel(
            name="CommentReaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("type", models.CharField(choices=[("like", "like"), ("love", "love")], max_length=8)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "comment",
                    models.ForeignKey(
                        db_column="comment_id",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reactions",
                        to="posts.comment",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="comment_reactions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "posts_comment_reaction",
            },
        ),
        migrations.AddConstraint(
            model_name="commentreaction",
            constraint=models.UniqueConstraint(
                fields=("user", "comment"),
                name="posts_comment_reaction_user_comment_uniq",
            ),
        ),
    ]
