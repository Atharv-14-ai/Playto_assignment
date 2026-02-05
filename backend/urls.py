from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from feed.views import PostViewSet, CommentViewSet, FeedView
from leaderboard.views import LeaderboardView
from users.views import RegisterView, LoginView, LogoutView, CurrentUserView

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/feed/', FeedView.as_view(), name='feed'),
    path('api/leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    
    # Auth endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/user/', CurrentUserView.as_view(), name='current_user'),
    
    # DRF auth URLs for browsable API
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]