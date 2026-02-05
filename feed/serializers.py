from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Comment, Like
from users.models import UserProfile
from django.contrib.contenttypes.models import ContentType


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['total_karma', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'profile']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    depth = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'parent', 'content', 
                 'created_at', 'like_count', 'replies', 'depth', 'has_liked']
        read_only_fields = ['author', 'created_at', 'like_count', 'depth']
    
    def get_like_count(self, obj):
        # Use cached value if available
        if hasattr(obj, '_like_count'):
            return obj._like_count
        return obj.like_count
    
    def get_replies(self, obj):
        # Replies are populated by the view layer
        return getattr(obj, 'serialized_replies', [])
    
    def get_depth(self, obj):
        return obj.depth()
    
    def get_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user has liked this comment
            return obj.likes.filter(user=request.user).exists()
        return False


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'created_at', 
                 'like_count', 'comment_count', 'has_liked', 'comments']
        read_only_fields = ['author', 'created_at', 'like_count', 'comment_count']
    
    def get_like_count(self, obj):
        # Use cached value if available
        if hasattr(obj, '_like_count'):
            return obj._like_count
        return obj.like_count
    
    def get_comment_count(self, obj):
        # Use cached value if available
        if hasattr(obj, '_comment_count'):
            return obj._comment_count
        return obj.comment_count
    
    def get_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user has liked this post
            return obj.likes.filter(user=request.user).exists()
        return False