# MySQL : publications.shared_post_id + copie des lignes posts_post_share + suppression PostShare.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0005_userblock_and_postshare"),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "ALTER TABLE publications ADD COLUMN shared_post_id bigint NULL;",
                """
                ALTER TABLE publications
                ADD CONSTRAINT publications_shared_post_fk
                FOREIGN KEY (shared_post_id) REFERENCES publications(id)
                ON DELETE SET NULL;
                """,
                """
                INSERT INTO publications (content, type, image, video, created_at, updated_at, author_id, shared_post_id)
                SELECT '', 'share', NULL, NULL, ps.created_at, ps.created_at, ps.user_id, ps.post_id
                FROM posts_post_share ps;
                """,
            ],
            reverse_sql=[
                "ALTER TABLE publications DROP FOREIGN KEY publications_shared_post_fk;",
                "ALTER TABLE publications DROP COLUMN shared_post_id;",
            ],
        ),
        migrations.DeleteModel(
            name="PostShare",
        ),
    ]
