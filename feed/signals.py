from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Like, Post, Comment
from users.models import UserProfile

@receiver(post_save, sender=Like)
def update_karma_on_like_create(sender, instance, created, **kwargs):
    if created:
        content_object = instance.content_object
        if isinstance(content_object, Post):
            author = content_object.author
            karma_increment = 5
        elif isinstance(content_object, Comment):
            author = content_object.author
            karma_increment = 1
        else:
            return
        
        profile, _ = UserProfile.objects.get_or_create(user=author)
        profile.total_karma += karma_increment
        profile.save()

@receiver(post_delete, sender=Like)
def update_karma_on_like_delete(sender, instance, **kwargs):
    content_object = instance.content_object
    if isinstance(content_object, Post):
        author = content_object.author
        karma_decrement = 5
    elif isinstance(content_object, Comment):
        author = content_object.author
        karma_decrement = 1
    else:
        return
    
    profile, _ = UserProfile.objects.get_or_create(user=author)
    profile.total_karma -= karma_decrement
    profile.save()