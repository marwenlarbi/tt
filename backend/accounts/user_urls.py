from django.urls import include, path

from .block_views import BlockedUserIdsView, BlockedUsersView, UserBlockStatusView, UserBlockView, UserUnblockView
from .chat_views import (
    ChatMessageDetailView,
    ChatPartnersView,
    ChatThreadView,
    FollowedPresenceSplitView,
    PresenceDirectoryView,
    PresencePingView,
    UserSearchView,
)
from .public_views import (
    PublicUserProfileView,
    PublicVetDirectoryView,
    FollowView,
    FollowersView,
    FollowingView,
    IsFollowingView,
)
from .views import MeProfileView, VetScheduleView

urlpatterns = [
    path("notifications/", include("notifications.urls")),
    path("profile/", MeProfileView.as_view(), name="user-profile"),
    path("vets/schedule/", VetScheduleView.as_view(), name="vet-schedule"),
    path("vets/", PublicVetDirectoryView.as_view(), name="public-vets"),
    path("profiles/<int:user_id>/", PublicUserProfileView.as_view(), name="public-user-profile"),
    path("follow/", FollowView.as_view(), name="user-follow"),
    path("followers/<int:user_id>/", FollowersView.as_view(), name="user-followers"),
    path("following/<int:user_id>/", FollowingView.as_view(), name="user-following"),
    path("is-following/<int:user_id>/", IsFollowingView.as_view(), name="user-is-following"),
    path("block/", UserBlockView.as_view(), name="user-block"),
    path("block/<int:user_id>/", UserUnblockView.as_view(), name="user-unblock"),
    path("unblock/", UserBlockView.as_view(), name="user-unblock-alias"),
    path("block/status/<int:user_id>/", UserBlockStatusView.as_view(), name="user-block-status"),
    path("block/ids/", BlockedUserIdsView.as_view(), name="user-block-ids"),
    path("blocked-users/", BlockedUsersView.as_view(), name="blocked-users"),
    path("users/search/", UserSearchView.as_view(), name="users-search"),
    path("presence/ping/", PresencePingView.as_view(), name="presence-ping"),
    path("presence/directory/", PresenceDirectoryView.as_view(), name="presence-directory"),
    path("presence/followed/", FollowedPresenceSplitView.as_view(), name="presence-followed"),
    path("chat/partners/", ChatPartnersView.as_view(), name="chat-partners"),
    path("chat/<int:user_id>/", ChatThreadView.as_view(), name="chat-thread"),
    path("chat/message/<int:message_id>/", ChatMessageDetailView.as_view(), name="chat-message-detail"),
]
