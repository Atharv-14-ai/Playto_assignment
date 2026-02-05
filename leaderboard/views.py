from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q, Sum, Case, When, IntegerField
from datetime import timedelta


class LeaderboardView(APIView):
    """
    Dynamic leaderboard showing top 5 users by karma earned in last 24 hours
    Calculates karma on-the-fly without storing daily karma
    Post like = 5 karma, Comment like = 1 karma
    """
    
    def get(self, request):
        """
        Calculate leaderboard with a single optimized query
        """
        try:
            # Calculate time threshold (24 hours ago)
            time_threshold = timezone.now() - timedelta(hours=24)
            
            # Import models inside function
            from feed.models import Like
            from django.contrib.contenttypes.models import ContentType
            from feed.models import Post, Comment
            
            # Get content types for filtering
            post_content_type = ContentType.objects.get_for_model(Post)
            comment_content_type = ContentType.objects.get_for_model(Comment)
            
            # Single optimized query for leaderboard
            leaderboard_data = Like.objects.filter(
                created_at__gte=time_threshold
            ).values(
                'user__id', 
                'user__username'
            ).annotate(
                post_likes=Count(
                    'id',
                    filter=Q(content_type=post_content_type)
                ),
                comment_likes=Count(
                    'id',
                    filter=Q(content_type=comment_content_type)
                ),
                daily_karma=Sum(
                    Case(
                        When(content_type=post_content_type, then=5),
                        When(content_type=comment_content_type, then=1),
                        default=0,
                        output_field=IntegerField()
                    )
                )
            ).filter(
                Q(post_likes__gt=0) | Q(comment_likes__gt=0)
            ).order_by('-daily_karma')[:5]
            
            # Format response
            result = []
            for item in leaderboard_data:
                result.append({
                    'user_id': item['user__id'],
                    'username': item['user__username'],
                    'daily_karma': item['daily_karma'] or 0,
                    'post_likes_24h': item['post_likes'] or 0,
                    'comment_likes_24h': item['comment_likes'] or 0,
                })
            
            return Response(result)
            
        except Exception as e:
            # Log error for debugging
            import traceback
            print(f"Leaderboard error: {e}")
            print(traceback.format_exc())
            # Return empty array on error
            return Response([])