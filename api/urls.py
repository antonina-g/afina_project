from django.urls import path
from .views import (
    course_list,
    onboarding_questions,
    get_profile,
    onboarding_answers,
    add_user_course,
    recommendations,
    course_strategy,
    test_llm_strategy,
)
from . import views_strategy

urlpatterns = [
    path('courses/', course_list, name='course-list'),
    path('onboarding/questions/', onboarding_questions, name='onboarding-questions'),
    path('onboarding/answers/', onboarding_answers, name='onboarding-answers'),

    path('profile/<int:user_id>/', get_profile, name='get-profile'),
    path('recommendations/<int:user_id>/', recommendations, name='recommendations'),

    path('add-course/', add_user_course, name='add-course'),
    path('course_strategy/', course_strategy, name='course-strategy'),
    path('test_llm_strategy/', test_llm_strategy, name='test-llm-strategy'),

    path('users/<int:user_id>/strategies/generate/', views_strategy.generate_strategy_view, name='generate-strategy'),
    path('users/<int:user_id>/strategies/', views_strategy.get_user_strategies, name='get-user-strategies'),
    path('users/<int:user_id>/strategies/<int:course_id>/', views_strategy.get_course_strategy, name='get-course-strategy'),
]

