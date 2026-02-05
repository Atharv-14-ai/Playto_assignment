from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db.models import Case, When, IntegerField
from django.core.exceptions import ValidationError


class Post(models.Model):
    """Post model for the community feed"""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # GenericRelation for likes - this creates a reverse relationship
    likes = GenericRelation('Like', content_type_field='content_type', object_id_field='object_id')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['author', '-created_at']),
        ]
    
    def __str__(self):
        return f"Post by {self.author.username}: {self.content[:50]}..."
    
    @property
    def like_count(self):
        """Optimized like count"""
        return self.likes.count()
    
    @property
    def comment_count(self):
        """Optimized comment count"""
        return self.comments.count()


class Comment(models.Model):
    """
    Comment model with hierarchical structure for nested threads.
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, 
                              related_name='replies')
    content = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # GenericRelation for likes - this creates a reverse relationship
    likes = GenericRelation('Like', content_type_field='content_type', object_id_field='object_id')
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'parent']),
            models.Index(fields=['post', 'created_at']),
            models.Index(fields=['author', 'created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.author.username}: {self.content[:50]}..."
    
    def clean(self):
        """Ensure a comment's parent belongs to the same post"""
        if self.parent and self.parent.post != self.post:
            raise ValidationError("Parent comment must belong to the same post.")
    
    def depth(self):
        """Calculate comment depth for nested display"""
        depth = 0
        parent = self.parent
        while parent:
            depth += 1
            parent = parent.parent
        return depth
    
    @property
    def like_count(self):
        """Optimized like count"""
        return self.likes.count()


class Like(models.Model):
    """
    Generic Like model using GenericForeignKey for polymorphic relations.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Generic foreign key to like both Posts and Comments
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    class Meta:
        unique_together = ['user', 'content_type', 'object_id']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id', 'user']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} liked {self.content_object}"