from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Prefetch, Q, Count
from django.db.models import Case, When, IntegerField

from .models import Post, Comment, Like
from .serializers import PostSerializer, CommentSerializer
from users.models import UserProfile


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Posts with optimized queries and thread-safe liking
    """
    queryset = Post.objects.all().select_related('author', 'author__profile')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Optimized queryset for posts with all related data"""
        queryset = super().get_queryset()
        
        # Prefetch likes with user information
        queryset = queryset.prefetch_related(
            Prefetch('likes', queryset=Like.objects.select_related('user')),
            Prefetch('comments', 
                queryset=Comment.objects.select_related('author', 'author__profile')
                .prefetch_related('likes')
                .order_by('created_at')
            )
        )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def like(self, request, pk=None):
        """
        Thread-safe like/unlike for posts
        Uses select_for_update to prevent race conditions
        """
        # Get post with row lock to prevent concurrent modifications
        post = Post.objects.select_for_update().get(id=pk)
        user = request.user
        
        content_type = ContentType.objects.get_for_model(Post)
        
        # Check if user already liked this post
        existing_like = Like.objects.filter(
            user=user,
            content_type=content_type,
            object_id=post.id
        ).first()
        
        if existing_like:
            # Unlike: delete the like
            existing_like.delete()
            
            # Update author's karma (atomic operation)
            profile = UserProfile.objects.select_for_update().get(user=post.author)
            profile.total_karma -= 5
            profile.save()
            
            liked = False
            message = 'Post unliked'
        else:
            # Like: create new like
            Like.objects.create(
                user=user,
                content_type=content_type,
                object_id=post.id
            )
            
            # Update author's karma (atomic operation)
            profile = UserProfile.objects.select_for_update().get(user=post.author)
            profile.total_karma += 5
            profile.save()
            
            liked = True
            message = 'Post liked'
        
        # Refresh like count
        post.refresh_from_db()
        
        return Response({
            'liked': liked,
            'like_count': post.like_count,
            'message': message,
            'author_karma': post.author.profile.total_karma
        })


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Comments with optimized queries and thread-safe liking
    """
    queryset = Comment.objects.all().select_related('author', 'author__profile', 'post')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Optimized queryset for comments"""
        queryset = super().get_queryset()
        
        # Prefetch likes with user information
        queryset = queryset.prefetch_related(
            Prefetch('likes', queryset=Like.objects.select_related('user'))
        )
        
        post_id = self.request.query_params.get('post_id')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def like(self, request, pk=None):
        """
        Thread-safe like/unlike for comments
        Uses select_for_update to prevent race conditions
        """
        # Get comment with row lock to prevent concurrent modifications
        comment = Comment.objects.select_for_update().get(id=pk)
        user = request.user
        
        content_type = ContentType.objects.get_for_model(Comment)
        
        # Check if user already liked this comment
        existing_like = Like.objects.filter(
            user=user,
            content_type=content_type,
            object_id=comment.id
        ).first()
        
        if existing_like:
            # Unlike: delete the like
            existing_like.delete()
            
            # Update author's karma (atomic operation)
            profile = UserProfile.objects.select_for_update().get(user=comment.author)
            profile.total_karma -= 1
            profile.save()
            
            liked = False
            message = 'Comment unliked'
        else:
            # Like: create new like
            Like.objects.create(
                user=user,
                content_type=content_type,
                object_id=comment.id
            )
            
            # Update author's karma (atomic operation)
            profile = UserProfile.objects.select_for_update().get(user=comment.author)
            profile.total_karma += 1
            profile.save()
            
            liked = True
            message = 'Comment liked'
        
        # Refresh like count
        comment.refresh_from_db()
        
        return Response({
            'liked': liked,
            'like_count': comment.like_count,
            'message': message,
            'author_karma': comment.author.profile.total_karma
        })


class FeedView(APIView):
    """
    Main feed view with optimized queries to avoid N+1 problem
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        """
        Efficiently loads feed with all nested comments in minimal queries
        """
        # Get content types for efficient filtering
        post_content_type = ContentType.objects.get_for_model(Post)
        comment_content_type = ContentType.objects.get_for_model(Comment)
        
        # Step 1: Get all posts with authors, profiles, and prefetched likes
        posts = Post.objects.all().select_related(
            'author', 'author__profile'
        ).prefetch_related(
            Prefetch('likes', queryset=Like.objects.select_related('user'))
        ).order_by('-created_at')
        
        # Get all post IDs for batch comment loading
        post_ids = list(posts.values_list('id', flat=True))
        
        if not post_ids:
            return Response([])
        
        # Step 2: Get all comments for these posts with authors, profiles, and prefetched likes
        all_comments = Comment.objects.filter(
            post_id__in=post_ids
        ).select_related(
            'author', 'author__profile', 'post'
        ).prefetch_related(
            Prefetch('likes', queryset=Like.objects.select_related('user'))
        ).order_by('created_at')
        
        # Step 3: Build data structures for efficient tree building
        comments_by_post = {}
        comments_by_parent = {}
        
        for comment in all_comments:
            # Group by post
            if comment.post_id not in comments_by_post:
                comments_by_post[comment.post_id] = []
            comments_by_post[comment.post_id].append(comment)
            
            # Group by parent for tree building
            parent_key = comment.parent_id if comment.parent_id else 'root'
            if parent_key not in comments_by_parent:
                comments_by_parent[parent_key] = []
            comments_by_parent[parent_key].append(comment)
        
        # Step 4: Check which posts/comments the current user has liked
        user_liked_posts = set()
        user_liked_comments = set()
        
        if request.user.is_authenticated:
            # Get post likes by current user
            post_likes = Like.objects.filter(
                user=request.user,
                content_type=post_content_type,
                object_id__in=post_ids
            ).values_list('object_id', flat=True)
            user_liked_posts = set(post_likes)
            
            # Get comment likes by current user
            comment_ids = list(all_comments.values_list('id', flat=True))
            if comment_ids:
                comment_likes = Like.objects.filter(
                    user=request.user,
                    content_type=comment_content_type,
                    object_id__in=comment_ids
                ).values_list('object_id', flat=True)
                user_liked_comments = set(comment_likes)
        
        # Step 5: Helper function to build nested comment tree
        def build_comment_tree(post_id, parent_id=None):
            """Recursively build nested comment structure for a specific post"""
            tree_comments = []
            key = parent_id if parent_id else 'root'
            
            for comment in comments_by_parent.get(key, []):
                # Only include comments for this post
                if comment.post_id == post_id and (parent_id is None or comment.parent_id == parent_id):
                    # Serialize comment
                    comment_data = CommentSerializer(comment, context={'request': request}).data
                    
                    # Add has_liked flag
                    comment_data['has_liked'] = comment.id in user_liked_comments if request.user.is_authenticated else False
                    
                    # Recursively add replies
                    comment_data['replies'] = build_comment_tree(post_id, comment.id)
                    
                    tree_comments.append(comment_data)
            
            return tree_comments
        
        # Step 6: Build response data
        posts_data = []
        for post in posts:
            # Get post data
            post_data = PostSerializer(post, context={'request': request}).data
            
            # Add has_liked flag
            post_data['has_liked'] = post.id in user_liked_posts if request.user.is_authenticated else False
            
            # Build comments tree for this post
            if post.id in comments_by_post:
                post_data['comments'] = build_comment_tree(post.id)
            else:
                post_data['comments'] = []
            
            posts_data.append(post_data)
        
        return Response(posts_data)