from django.contrib.auth import get_user_model

from accounts.blocking import are_users_blocked
from posts.models import Comment, Post

from .models import Notification

User = get_user_model()


def _create(*, user_id, sender, notification_type, post, comment=None):
    if not user_id or not sender or user_id == sender.id:
        return
    Notification.objects.create(
        user_id=user_id,
        sender=sender,
        notification_type=notification_type,
        post=post,
        comment=comment,
    )


def notify_post_liked(*, post: Post, sender: User):
    if are_users_blocked(sender.id, post.author_id):
        return
    _create(
        user_id=post.author_id,
        sender=sender,
        notification_type=Notification.TYPE_LIKE,
        post=post,
        comment=None,
    )


def notify_comment_reacted(*, comment: Comment, sender: User, reaction_type: str):
    """Réaction j’aime / j’adore sur un commentaire (pas si c’est son propre commentaire)."""
    if comment.author_id == sender.id:
        return
    if are_users_blocked(sender.id, comment.author_id):
        return
    ntype = Notification.TYPE_LOVE if reaction_type == "love" else Notification.TYPE_LIKE
    _create(
        user_id=comment.author_id,
        sender=sender,
        notification_type=ntype,
        post=comment.post,
        comment=comment,
    )


def notify_new_comment(*, comment: Comment, post: Post, sender: User):
    """Commentaire racine → auteur du post ; réponse → auteur du commentaire parent."""
    if are_users_blocked(sender.id, post.author_id):
        return
    if comment.parent_id:
        parent = Comment.objects.filter(pk=comment.parent_id).first()
        if not parent:
            return
        if are_users_blocked(sender.id, parent.author_id):
            return
        _create(
            user_id=parent.author_id,
            sender=sender,
            notification_type=Notification.TYPE_REPLY,
            post=post,
            comment=comment,
        )
        return
    _create(
        user_id=post.author_id,
        sender=sender,
        notification_type=Notification.TYPE_COMMENT,
        post=post,
        comment=comment,
    )


def notify_post_shared(*, original_post: Post, sender: User):
    """Quelqu’un a repartagé (profil / flux) en référence à votre publication."""
    if are_users_blocked(sender.id, original_post.author_id):
        return
    _create(
        user_id=original_post.author_id,
        sender=sender,
        notification_type=Notification.TYPE_SHARE,
        post=original_post,
        comment=None,
    )
