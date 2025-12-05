from rest_framework import serializers
from courses.models import Course
from users.models import User

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class UserCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['stepik_url']
