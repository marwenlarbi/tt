from django.urls import path

from .views import (
    MyPostsView,
    UserPostsListView,
    SavedPostsView,
    PostCommentListCreateView,
    CommentDetailView,
    CommentReactionToggleView,
    PostCreateView,
    PostDetailView,
    PostFeedView,
    PostLikeToggleView,
    PostSaveToggleView,
    PostShareCreateView,
)

urlpatterns = [
    path("users/<int:user_id>/posts/", UserPostsListView.as_view(), name="posts-user-timeline"),
    path("user/<int:user_id>/", UserPostsListView.as_view(), name="posts-by-user"),
    path("feed/", PostFeedView.as_view(), name="posts-feed"),
    path("mine/", MyPostsView.as_view(), name="posts-mine"),
    path("bookmarked/", SavedPostsView.as_view(), name="posts-bookmarked"),
    path("bookmarks/<int:post_id>/", PostSaveToggleView.as_view(), name="post-bookmark"),
    path("create/", PostCreateView.as_view(), name="posts-create"),
    path("<int:post_id>/share/", PostShareCreateView.as_view(), name="post-share-create"),
    path("<int:post_id>/comments/", PostCommentListCreateView.as_view(), name="post-comments"),
    path("<int:post_id>/comments/<int:comment_id>/", CommentDetailView.as_view(), name="post-comment-detail"),
    path(
        "<int:post_id>/comments/<int:comment_id>/reaction/",
        CommentReactionToggleView.as_view(),
        name="post-comment-reaction",
    ),
    path("<int:post_id>/like/", PostLikeToggleView.as_view(), name="post-like-toggle"),
    path("<int:post_id>/save/", PostSaveToggleView.as_view(), name="post-save-toggle"),
    path("<int:post_id>/", PostDetailView.as_view(), name="post-detail"),
]
