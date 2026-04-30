"""Filtrage et permissions liés au blocage utilisateur (symétrique pour le fil et les interactions)."""

from __future__ import annotations

from typing import FrozenSet

from django.db.models import Q


def get_blocked_user_ids(user) -> FrozenSet[int]:
    """
    Identifiants avec lesquels `user` ne doit pas voir de contenu ni interagir
    (j'ai bloqué + m'ont bloqué).
    """
    if not user or not user.is_authenticated:
        return frozenset()
    from .models import UserBlock

    blocked_by_me = UserBlock.objects.filter(blocker_id=user.id).values_list("blocked_id", flat=True)
    blocked_me = UserBlock.objects.filter(blocked_id=user.id).values_list("blocker_id", flat=True)
    return frozenset(blocked_by_me) | frozenset(blocked_me)


def are_users_blocked(user_id_a: int | None, user_id_b: int | None) -> bool:
    if user_id_a is None or user_id_b is None or user_id_a == user_id_b:
        return False
    from .models import UserBlock

    return UserBlock.objects.filter(
        Q(blocker_id=user_id_a, blocked_id=user_id_b) | Q(blocker_id=user_id_b, blocked_id=user_id_a)
    ).exists()
