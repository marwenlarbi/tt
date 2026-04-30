# Renommage destinataire / expéditeur / type + valeurs d’énumération.

from django.db import migrations, models


def forwards_kind_values(apps, schema_editor):
    Notification = apps.get_model("notifications", "Notification")
    Notification.objects.filter(kind="like_post").update(kind="like")
    Notification.objects.filter(kind="comment_post").update(kind="comment")


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forwards_kind_values, noop_reverse),
        migrations.RenameField(
            model_name="notification",
            old_name="recipient",
            new_name="user",
        ),
        migrations.RenameField(
            model_name="notification",
            old_name="actor",
            new_name="sender",
        ),
        migrations.RenameField(
            model_name="notification",
            old_name="kind",
            new_name="notification_type",
        ),
        migrations.AlterField(
            model_name="notification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("like", "like"),
                    ("love", "love"),
                    ("comment", "comment"),
                    ("reply", "reply"),
                    ("share", "share"),
                ],
                max_length=16,
            ),
        ),
        migrations.AddIndex(
            model_name="notification",
            index=models.Index(fields=["user", "is_read", "-created_at"], name="app_notific_user_read_created_idx"),
        ),
    ]
