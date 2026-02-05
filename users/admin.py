# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'

class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline]
    list_display = ['username', 'email', 'total_karma', 'is_staff']
    
    def total_karma(self, obj):
        return obj.profile.total_karma if hasattr(obj, 'profile') else 0
    total_karma.short_description = 'Total Karma'

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)