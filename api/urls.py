from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.course_list, name='course_list'),
    path('courses/add/', views.add_user_course, name='add_user_course'),
    path('onboarding/questions/', views.onboarding_questions, name='onboarding_questions'),
    path('onboarding/answers/', views.onboarding_answers, name='onboarding_answers'),
]
