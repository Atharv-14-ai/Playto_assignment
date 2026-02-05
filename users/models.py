from django.db import models
from django.contrib.auth.models import User
from django.db.models import Count
from django.contrib.contenttypes.models import ContentType
from feed.models import Like, Post, Comment

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    total_karma = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def update_total_karma(self):
        """Update total karma from all likes"""
        # Calculate post karma (5 points per like)
        post_content_type = ContentType.objects.get_for_model(Post)
        post_likes_count = Like.objects.filter(
            content_type=post_content_type,
            object_id__in=self.user.posts.values_list('id', flat=True)
        ).count()
        
        # Calculate comment karma (1 point per like)
        comment_content_type = ContentType.objects.get_for_model(Comment)
        comment_likes_count = Like.objects.filter(
            content_type=comment_content_type,
            object_id__in=self.user.comments.values_list('id', flat=True)
        ).count()
        
        self.total_karma = (post_likes_count * 5) + comment_likes_count
        self.save()
        return self.total_karma