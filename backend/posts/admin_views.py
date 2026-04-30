from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from posts.models import Comment, Like, Post, Report

User = get_user_model()


class AdminPostsListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        status_filter = request.query_params.get("status")  # pending|approved|flagged|rejected|all

        posts = (
            Post.objects.all()
            .select_related("author")
            .annotate(likes_count=Count("likes"), comments_count=Count("comments"))
            .order_by("-created_at")
        )

        if q:
            posts = posts.filter(content__icontains=q) | posts.filter(author__email__icontains=q)

        # Notre table n'a pas de status ; on le déduit:
        # - flagged si report pending/investigating existe
        # - sinon approved par défaut
        # On accepte un filtre UI simple.
        results = []
        for p in posts[:500]:
            reports_count = Report.objects.filter(type="post", content_id=p.id).count()
            flagged_count = Report.objects.filter(
                type="post", content_id=p.id, status__in=["pending", "investigating"]
            ).count()
            computed_status = "flagged" if flagged_count > 0 else "approved"

            if status_filter and status_filter != "all":
                if status_filter != computed_status:
                    continue

            results.append(
                {
                    "id": p.id,
                    "author": (f"{p.author.first_name} {p.author.last_name}".strip() or p.author.email),
                    "authorId": p.author_id,
                    "content": p.content,
                    "type": p.type,
                    "date": p.created_at.isoformat() if p.created_at else None,
                    "status": computed_status,
                    "likes": p.likes_count,
                    "comments": p.comments_count,
                    "reports": reports_count,
                    "image": p.image or p.video,
                    "tags": [],
                }
            )

        return Response(results, status=status.HTTP_200_OK)


class AdminPostDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, post_id: int):
        # On ne stocke pas encore le statut dans la table; on accepte l'action mais
        # "flagged" est reflété via reports.
        # Si admin met "rejected" => on supprime le post (approche simple).
        new_status = request.data.get("status")
        post = Post.objects.filter(id=post_id).first()
        if not post:
            return Response({"detail": "Post introuvable"}, status=status.HTTP_404_NOT_FOUND)

        if new_status == "rejected":
            post.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response({"detail": "OK"}, status=status.HTTP_200_OK)

    def delete(self, request, post_id: int):
        post = Post.objects.filter(id=post_id).first()
        if not post:
            return Response({"detail": "Post introuvable"}, status=status.HTTP_404_NOT_FOUND)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminReportsListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        status_filter = request.query_params.get("status")  # pending|investigating|resolved|rejected|all
        type_filter = request.query_params.get("type")  # post|comment|user|all

        reports = Report.objects.all().select_related("reported_by", "reported_user").order_by("-created_at")

        if q:
            reports = reports.filter(reason__icontains=q) | reports.filter(description__icontains=q)

        if status_filter and status_filter != "all":
            reports = reports.filter(status=status_filter)
        if type_filter and type_filter != "all":
            reports = reports.filter(type=type_filter)

        out = []
        for r in reports[:500]:
            reported_user = r.reported_user
            out.append(
                {
                    "id": r.id,
                    "type": r.type,
                    "contentId": r.content_id,
                    "reportedBy": (f"{r.reported_by.first_name} {r.reported_by.last_name}".strip() or r.reported_by.email),
                    "reporterEmail": r.reported_by.email,
                    "reportedUser": (f"{reported_user.first_name} {reported_user.last_name}".strip() if reported_user else "—"),
                    "reportedUserEmail": reported_user.email if reported_user else "",
                    "reason": r.reason,
                    "description": r.description,
                    "content": "",
                    "date": r.created_at.isoformat() if r.created_at else None,
                    "status": r.status,
                    "priority": r.priority,
                    "category": "other",
                }
            )

        return Response(out, status=status.HTTP_200_OK)


class AdminReportDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, report_id: int):
        report = Report.objects.filter(id=report_id).first()
        if not report:
            return Response({"detail": "Signalement introuvable"}, status=status.HTTP_404_NOT_FOUND)

        status_value = request.data.get("status")
        admin_notes = request.data.get("admin_notes")
        if status_value:
            report.status = status_value
        if admin_notes is not None:
            report.admin_notes = admin_notes
        report.save()
        return Response({"detail": "OK"}, status=status.HTTP_200_OK)

    def delete(self, request, report_id: int):
        report = Report.objects.filter(id=report_id).first()
        if not report:
            return Response({"detail": "Signalement introuvable"}, status=status.HTTP_404_NOT_FOUND)
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

