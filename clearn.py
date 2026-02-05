import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from feed.models import Post, Comment, Like
from users.models import UserProfile

def cleanup_test_data():
    """Remove test users and their data"""
    print("Cleaning up test data...")
    
    # List of test users to keep (you can modify this)
    users_to_keep = ['admin']  # Keep the admin user
    
    # Delete test users (user1, user2, user3, user4, user5)
    test_usernames = ['user1', 'user2', 'user3', 'user4', 'user5', 'testuser']
    
    for username in test_usernames:
        try:
            user = User.objects.get(username=username)
            
            # Delete user's posts
            Post.objects.filter(author=user).delete()
            
            # Delete user's comments
            Comment.objects.filter(author=user).delete()
            
            # Delete user's likes
            Like.objects.filter(user=user).delete()
            
            # Delete user profile if exists
            UserProfile.objects.filter(user=user).delete()
            
            # Delete the user
            user.delete()
            
            print(f"✓ Deleted user: {username}")
            
        except User.DoesNotExist:
            print(f"  User {username} doesn't exist")
    
    # Reset admin's karma
    try:
        admin = User.objects.get(username='admin')
        if hasattr(admin, 'profile'):
            admin.profile.total_karma = 0
            admin.profile.save()
            print("✓ Reset admin karma to 0")
    except User.DoesNotExist:
        print("  Admin user doesn't exist")
    
    print("\n✓ Cleanup complete!")
    print(f"Total users: {User.objects.count()}")
    print(f"Total posts: {Post.objects.count()}")
    print(f"Total comments: {Comment.objects.count()}")
    print(f"Total likes: {Like.objects.count()}")

if __name__ == '__main__':
    cleanup_test_data()