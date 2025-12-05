from django.contrib import admin

from .models import Course, UserProfile, CourseProgress

admin.site.register(Course)
admin.site.register(UserProfile)
admin.site.register(CourseProgress)
