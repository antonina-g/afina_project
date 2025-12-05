import re
import requests

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from courses.models import Course


@api_view(['GET'])
@permission_classes([AllowAny])
def course_list(request):
    """
    Простой список первых 20 курсов.
    """
    courses = Course.objects.all()[:20]
    return Response({
        'count': courses.count(),
        'courses': [{
            'id': c.id,
            'title': c.title,
            'level': c.level,
            'url': c.url,
        } for c in courses]
    })


@api_view(['POST'])
@permission_classes([AllowAny])  # позже можно сменить на IsAuthenticated
def add_user_course(request):
    """
    Добавление курса по ссылке Stepik, с подтягиванием данных из Stepik API.
    Ожидает JSON: {"stepik_url": "https://stepik.org/course/XXXXX/"}.
    """
    url = request.data.get('stepik_url')

    if not url:
        return Response(
            {'error': 'stepik_url required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Извлекаем ID из URL вида https://stepik.org/course/58852/
    match = re.search(r'stepik\.org/course/(\d+)', url)
    if not match:
        return Response(
            {'error': 'Invalid Stepik URL format'},
            status=status.HTTP_400_BAD_REQUEST
        )

    stepik_id = int(match.group(1))

    # Если курс уже есть в БД — не дублируем
    if Course.objects.filter(stepik_id=stepik_id).exists():
        existing = Course.objects.get(stepik_id=stepik_id)
        return Response({
            'message': 'Course already exists',
            'course': {
                'id': existing.id,
                'title': existing.title,
                'level': existing.level,
                'language': existing.language,
                'url': existing.url,
            }
        }, status=status.HTTP_200_OK)

    # Тянем подробную информацию о курсе из Stepik API
    try:
        api_url = 'https://stepik.org/api/courses'
        resp = requests.get(api_url, params={'ids[]': stepik_id}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        courses = data.get('courses', [])
        if not courses:
            return Response(
                {'error': 'Course not found in Stepik API'},
                status=status.HTTP_404_NOT_FOUND
            )
        course_data = courses[0]
    except requests.RequestException as e:
        return Response(
            {'error': f'Stepik API request failed: {e}'},
            status=status.HTTP_502_BAD_GATEWAY
        )

    # Извлекаем поля с дефолтами
    title = course_data.get('title') or f'Course #{stepik_id}'
    summary = course_data.get('summary') or ''
    description = course_data.get('description') or ''
    full_description = (summary + '\n\n' + description).strip()
    level = course_data.get('difficulty') or 'beginner'
    language = course_data.get('language') or 'ru'

    # Создаём курс в нашей БД
    course = Course(
        stepik_id=stepik_id,
        title=title[:255],
        description=full_description[:1000],
        level=level,
        language=language,
        format_type=course_data.get('course_format') or 'mixed',
        url=f'https://stepik.org/course/{stepik_id}/',
        source='user_added',
        stepik_url=url,
    )
    course.save()

    return Response({
        'message': 'Курс успешно добавлен!',
        'course': {
            'id': course.id,
            'title': course.title,
            'level': course.level,
            'language': course.language,
            'url': course.url,
        }
    }, status=status.HTTP_201_CREATED)



