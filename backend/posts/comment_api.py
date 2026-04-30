"""Sérialisation des fils de commentaires (arbre) et annotations des réactions."""

from collections import defaultdict

from django.db.models import CharField, Count, OuterRef, Q, Subquery, Value
from .models import Comment, CommentReaction
from .serializers import PostAuthorSerializer


def annotate_comments_for_request(qs, user):
    qs = qs.select_related("author", "author__profile").annotate(
        reaction_like_count=Count(
            "reactions",
            filter=Q(reactions__type=CommentReaction.TYPE_LIKE),
            distinct=True,
        ),
        reaction_love_count=Count(
            "reactions",
            filter=Q(reactions__type=CommentReaction.TYPE_LOVE),
            distinct=True,
        ),
    )
    if user is not None and user.is_authenticated:
        mine = CommentReaction.objects.filter(comment_id=OuterRef("pk"), user_id=user.id).values("type")[:1]
        qs = qs.annotate(my_reaction_type=Subquery(mine))
    else:
        qs = qs.annotate(my_reaction_type=Value(None, output_field=CharField()))
    return qs


def _author_payload(comment, context):
    return PostAuthorSerializer(comment.author, context=context).data


def _comment_node_dict(comment, children_map, context):
    return {
        "id": comment.id,
        "text": comment.text,
        "created_at": comment.created_at,
        "parent_id": comment.parent_id,
        "author": _author_payload(comment, context),
        "like_count": int(getattr(comment, "reaction_like_count", 0) or 0),
        "love_count": int(getattr(comment, "reaction_love_count", 0) or 0),
        "my_reaction": getattr(comment, "my_reaction_type", None),
        "replies": [
            _comment_node_dict(ch, children_map, context)
            for ch in sorted(children_map.get(comment.id, []), key=lambda x: x.created_at)
        ],
    }


def build_comment_tree_response(post_id, user, context):
    qs = Comment.objects.filter(post_id=post_id).order_by("created_at")
    qs = annotate_comments_for_request(qs, user)
    flat = list(qs)
    children = defaultdict(list)
    roots = []
    for c in flat:
        if c.parent_id:
            children[c.parent_id].append(c)
        else:
            roots.append(c)
    roots.sort(key=lambda x: x.created_at)
    return [_comment_node_dict(c, children, context) for c in roots]


def single_comment_payload(comment, user, context):
    """Réponse plate pour PATCH (réponses vides, compteurs à jour)."""
    qs = Comment.objects.filter(pk=comment.pk).select_related("author", "author__profile")
    qs = annotate_comments_for_request(qs, user)
    c = qs.first()
    children = defaultdict(list)
    return _comment_node_dict(c, children, context)
