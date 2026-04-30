from django.conf import settings
from django.db import models


class Post(models.Model):
    content = models.TextField()
    type = models.CharField(max_length=20)  # text|image|video
    image = models.CharField(max_length=100, blank=True, null=True)
    video = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="author_id", related_name="posts"
    )
    shared_post = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        db_column="shared_post_id",
        related_name="reshares",
    )

    class Meta:
        db_table = "publications"
        managed = False


class Comment(models.Model):
    text = models.TextField()
    created_at = models.DateTimeField()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="author_id", related_name="post_comments"
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, db_column="post_id", related_name="comments")
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="replies",
        db_column="parent_id",
    )

    class Meta:
        db_table = "publications_commentaires"
        managed = False


class CommentReaction(models.Model):
    """Réaction unique par (utilisateur, commentaire) — type like | love."""

    TYPE_LIKE = "like"
    TYPE_LOVE = "love"
    TYPE_CHOICES = (
        (TYPE_LIKE, "like"),
        (TYPE_LOVE, "love"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comment_reactions",
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="reactions",
        db_column="comment_id",
    )
    type = models.CharField(max_length=8, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "posts_comment_reaction"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "comment"],
                name="posts_comment_reaction_user_comment_uniq",
            ),
        ]

    def __str__(self):
        return f"CommentReaction u{self.user_id} c{self.comment_id} {self.type}"


class Like(models.Model):
    created_at = models.DateTimeField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="user_id", related_name="post_likes"
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, db_column="post_id", related_name="likes")

    class Meta:
        db_table = "publications_mentions_j_aime"
        managed = False


class SavedPost(models.Model):
    """Publication enregistrée par un utilisateur (signet)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_posts_entries",
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="saved_entries")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "posts_saved"
        constraints = [
            models.UniqueConstraint(fields=["user", "post"], name="posts_saved_user_post_uniq"),
        ]

    def __str__(self):
        return f"SavedPost u{self.user_id} p{self.post_id}"


class Report(models.Model):
    type = models.CharField(max_length=20)  # post|comment|user
    content_id = models.PositiveIntegerField()
    reason = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20)  # pending|investigating|resolved|rejected
    priority = models.CharField(max_length=10)  # low|medium|high
    admin_notes = models.TextField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="reported_by_id", related_name="reports_created"
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        db_column="reported_user_id",
        related_name="reports_received",
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "signalements"
        managed = False

