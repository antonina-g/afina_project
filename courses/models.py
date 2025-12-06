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
    
    SOURCE_CHOICES = [
        ('stepik_api', 'Stepik API'),
        ('user_added', 'User Added'),
    ]
    
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='stepik_api')
    stepik_url = models.URLField(blank=True, help_text="Full Stepik course URL")


class UserProfile(models.Model):
    LEARNING_STYLES = [
        ('visual', 'Visual'),
        ('auditory', 'Auditory'),
        ('read_write', 'Read/Write'),
        ('kinesthetic', 'Kinesthetic'),
        ('mixed', 'Mixed'),
    ]

    PACE_CHOICES = [
        ('slow', 'Slow'),
        ('normal', 'Normal'),
        ('fast', 'Fast'),
    ]

    FORMAT_CHOICES = [
        ('video', 'Video'),
        ('audio', 'Audio / Podcasts'),
        ('text', 'Text'),
        ('practice', 'Practice / Cases'),
        ('mixed', 'Mixed'),
    ]

    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='profile')

    # Результаты теста
    learning_style = models.CharField(
        max_length=20,
        choices=LEARNING_STYLES,
        default='mixed',
    )
    memory_score = models.IntegerField(null=True, blank=True)         # 1–10
    discipline_score = models.IntegerField(null=True, blank=True)     # 1–10

    # Рекомендации от LLM
    recommended_format = models.CharField(
        max_length=20,
        choices=FORMAT_CHOICES,
        default='mixed',
    )
    recommended_pace = models.CharField(
        max_length=20,
        choices=PACE_CHOICES,
        default='normal',
    )
    strategy_summary = models.TextField(blank=True)  # текстовая стратегия обучения

    # Базовые доп-поля (на будущее)
    age = models.IntegerField(null=True, blank=True)
    goals = models.TextField(blank=True)        # цели обучения (карьера/универ/хобби)
    interests = models.TextField(blank=True)    # интересы/темы в свободной форме

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(null=True, blank=True)
    interests = models.TextField()  # JSON или comma-separated
    learning_style = models.CharField(max_length=20, choices=LEARNING_STYLES, default='visual')
    pace = models.CharField(max_length=20, choices=PACE_CHOICES, default='normal')
    level = models.CharField(max_length=50, default='beginner', null=True, blank=True)
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
