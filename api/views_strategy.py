# api/views_strategy.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from courses.models import UserProfile, Course, LearningStrategy
from .llm import generate_and_save_strategy
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_strategy_view(request, user_id):
    """
    Генерирует стратегию обучения для пользователя и курса
    Пример тела запроса:
    {
        "course_id": 1
    }
    """
    try:
        # Проверяем, что пользователь запрашивает свой профиль
        if request.user.id != int(user_id):
            return Response(
                {"error": "Unauthorized access to user profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Получаем профиль пользователя
        profile = get_object_or_404(UserProfile, user_id=user_id)
        
        # Получаем course_id из запроса
        course_id = request.data.get('course_id')
        if not course_id:
            return Response(
                {"error": "course_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем курс
        course = get_object_or_404(Course, id=course_id)
        
        # Генерируем и сохраняем стратегию
        result = generate_and_save_strategy(profile, course)
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in generate_strategy_view: {e}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_strategies(request, user_id):
    """
    Возвращает все стратегии пользователя
    """
    try:
        if request.user.id != int(user_id):
            return Response(
                {"error": "Unauthorized access to user profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        profile = get_object_or_404(UserProfile, user_id=user_id)
        strategies = LearningStrategy.objects.filter(user=profile).select_related('course')
        
        data = []
        for strategy in strategies:
            data.append({
                "id": strategy.id,
                "course": {
                    "id": strategy.course.id,
                    "title": strategy.course.title,
                    "level": strategy.course.level,
                    "url": strategy.course.url
                },
                "summary": strategy.summary,
                "pace": strategy.pace,
                "format_tips": strategy.format_tips,
                "steps": strategy.steps,
                "created_at": strategy.created_at,
                "updated_at": strategy.updated_at
            })
        
        return Response({"strategies": data})
        
    except Exception as e:
        logger.error(f"Error in get_user_strategies: {e}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_strategy(request, user_id, course_id):
    """
    Возвращает стратегию для конкретного курса пользователя
    Если стратегии нет - создаёт её
    """
    try:
        if request.user.id != int(user_id):
            return Response(
                {"error": "Unauthorized access to user profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        profile = get_object_or_404(UserProfile, user_id=user_id)
        course = get_object_or_404(Course, id=course_id)
        
        # Проверяем, есть ли уже стратегия
        try:
            strategy = LearningStrategy.objects.get(user=profile, course=course)
            
            data = {
                "id": strategy.id,
                "course": {
                    "id": strategy.course.id,
                    "title": strategy.course.title,
                    "level": strategy.course.level
                },
                "summary": strategy.summary,
                "pace": strategy.pace,
                "format_tips": strategy.format_tips,
                "steps": strategy.steps,
                "created_at": strategy.created_at,
                "updated_at": strategy.updated_at,
                "is_cached": True
            }
            
        except LearningStrategy.DoesNotExist:
            # Если стратегии нет - генерируем её
            result = generate_and_save_strategy(profile, course)
            strategy_data = result["strategy"]
            
            # Получаем свежесозданную стратегию
            strategy = LearningStrategy.objects.get(user=profile, course=course)
            
            data = {
                "id": strategy.id,
                "course": {
                    "id": strategy.course.id,
                    "title": strategy.course.title,
                    "level": strategy.course.level
                },
                "summary": strategy.summary,
                "pace": strategy.pace,
                "format_tips": strategy.format_tips,
                "steps": strategy.steps,
                "created_at": strategy.created_at,
                "updated_at": strategy.updated_at,
                "is_cached": False,
                "generation_status": result.get("status", "unknown")
            }
        
        return Response(data)
        
    except Exception as e:
        logger.error(f"Error in get_course_strategy: {e}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )