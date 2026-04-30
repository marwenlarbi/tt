# Tables du fil social (publications) — création idempotente sous MySQL uniquement.

from django.db import migrations


POSTS_SQL = [
    """
    CREATE TABLE IF NOT EXISTS `publications` (
      `id` bigint NOT NULL AUTO_INCREMENT,
      `content` longtext NOT NULL,
      `type` varchar(20) NOT NULL,
      `image` varchar(100) NULL,
      `video` varchar(100) NULL,
      `created_at` datetime(6) NOT NULL,
      `updated_at` datetime(6) NOT NULL,
      `author_id` bigint NOT NULL,
      PRIMARY KEY (`id`),
      KEY `publications_author_id_7c2b8f_idx` (`author_id`),
      CONSTRAINT `publications_author_fk`
        FOREIGN KEY (`author_id`) REFERENCES `comptes_utilisateur` (`id`)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS `publications_commentaires` (
      `id` bigint NOT NULL AUTO_INCREMENT,
      `text` longtext NOT NULL,
      `created_at` datetime(6) NOT NULL,
      `author_id` bigint NOT NULL,
      `post_id` bigint NOT NULL,
      PRIMARY KEY (`id`),
      KEY `pub_com_author_id_idx` (`author_id`),
      KEY `pub_com_post_id_idx` (`post_id`),
      CONSTRAINT `pub_com_author_fk`
        FOREIGN KEY (`author_id`) REFERENCES `comptes_utilisateur` (`id`)
        ON DELETE CASCADE,
      CONSTRAINT `pub_com_post_fk`
        FOREIGN KEY (`post_id`) REFERENCES `publications` (`id`)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS `publications_mentions_j_aime` (
      `id` bigint NOT NULL AUTO_INCREMENT,
      `created_at` datetime(6) NOT NULL,
      `user_id` bigint NOT NULL,
      `post_id` bigint NOT NULL,
      PRIMARY KEY (`id`),
      KEY `pub_like_user_id_idx` (`user_id`),
      KEY `pub_like_post_id_idx` (`post_id`),
      CONSTRAINT `pub_like_user_fk`
        FOREIGN KEY (`user_id`) REFERENCES `comptes_utilisateur` (`id`)
        ON DELETE CASCADE,
      CONSTRAINT `pub_like_post_fk`
        FOREIGN KEY (`post_id`) REFERENCES `publications` (`id`)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
    """
    CREATE TABLE IF NOT EXISTS `signalements` (
      `id` bigint NOT NULL AUTO_INCREMENT,
      `type` varchar(20) NOT NULL,
      `content_id` int UNSIGNED NOT NULL,
      `reason` varchar(200) NOT NULL,
      `description` longtext NOT NULL,
      `status` varchar(20) NOT NULL,
      `priority` varchar(10) NOT NULL,
      `admin_notes` longtext NOT NULL,
      `created_at` datetime(6) NOT NULL,
      `updated_at` datetime(6) NOT NULL,
      `reported_by_id` bigint NOT NULL,
      `reported_user_id` bigint NULL,
      PRIMARY KEY (`id`),
      KEY `sig_reported_by_idx` (`reported_by_id`),
      KEY `sig_reported_user_idx` (`reported_user_id`),
      CONSTRAINT `sig_reported_by_fk`
        FOREIGN KEY (`reported_by_id`) REFERENCES `comptes_utilisateur` (`id`)
        ON DELETE CASCADE,
      CONSTRAINT `sig_reported_user_fk`
        FOREIGN KEY (`reported_user_id`) REFERENCES `comptes_utilisateur` (`id`)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """,
]


def forwards_posts(apps, schema_editor):
    if schema_editor.connection.vendor != "mysql":
        return
    with schema_editor.connection.cursor() as cursor:
        for stmt in POSTS_SQL:
            cursor.execute(stmt)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("accounts", "0003_userprofile"),
    ]

    operations = [
        migrations.RunPython(forwards_posts, noop_reverse),
    ]
