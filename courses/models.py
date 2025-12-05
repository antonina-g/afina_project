from django.db import models



class Course(models.Model):
    stepik_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    level = models.CharField(max_length=50, default='beginner')
    language = models.CharField(max_length=10, default='ru')
    format_type = models.CharField(max_length=50, default='video')  # video, text, mixed
    duration_hours = models.IntegerField(null=True, blank=True)
    url = models.URLField(blank=True)
    rating = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class UserProfile(models.Model):
    LEARNING_STYLES = [
        ('visual', 'Visual'),
        ('auditory', 'Auditory'),
        ('reading', 'Reading/Writing'),
        ('kinesthetic', 'Kinesthetic'),
    ]

    PACE_CHOICES = [
        ('slow', 'Slow'),
        ('normal', 'Normal'),
        ('fast', 'Fast'),
    ]

    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(null=True, blank=True)
    interests = models.TextField()  # JSON или comma-separated
    learning_style = models.CharField(max_length=20, choices=LEARNING_STYLES, default='visual')
    pace = models.CharField(max_length=20, choices=PACE_CHOICES, default='normal')
    level = models.CharField(max_length=50, default='beginner')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class CourseProgress(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='course_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress_percent = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.progress_percent}%)"
