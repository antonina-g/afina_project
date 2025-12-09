import re
import requests
import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from users.models import User
from courses.models import Course, UserProfile, LearningStrategy
from .llm import generate_learning_strategy_stub, call_llm_for_strategy_stub, call_llm_for_strategy

logger = logging.getLogger(__name__)

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

@api_view(['GET'])
@permission_classes([AllowAny])
def onboarding_questions(request):
    questions = [
        {
            "id": 1,
            "section": "learning_style",
            "text": "Когда вы изучаете новую тему, вам проще понять материал, если...",
            "options": [
                {"value": "a", "label": "есть иллюстрации или схемы"},
                {"value": "b", "label": "кто-то объясняет устно"},
                {"value": "c", "label": "вы записываете конспект"},
                {"value": "d", "label": "вы пробуете что-то сделать сами"},
            ],
        },
        {
        "id": 2,
        "section": "learning_style",
        "text": "2.	Когда вы вспоминаете, как дойти до места, вы ориентируетесь по:",
        "options": [
            {"value": "a", "label": "карте или визуальному образу"},
            {"value": "b", "label": "рассказу или объяснению другого человека"},
            {"value": "c", "label": "заметкам с указанием направлений"},
            {"value": "d", "label": "памяти о собственных действиях"},
        ],
    },
        {
            "id": 3,
            "section": "learning_style",
            "text": "Вы быстрее учитесь, когда:",
            "options": [
                {"value": "a", "label": "видите примеры"},
                {"value": "b", "label": "слышите объяснение"},
                {"value": "c", "label": "читаете инструкции"},
                {"value": "d", "label": "пробуете сами"},
            ],
        },
        {
            "id": 4,
            "section": "learning_style",
            "text": "На лекции вы лучше усваиваете, если:",
            "options": [
                {"value": "a", "label": "преподаватель показывает слайды"},
                {"value": "b", "label": "объясняет вслух"},
                {"value": "c", "label": "даёт раздаточный материал"},
                {"value": "d", "label": "разрешает выполнять практику"},
            ],
        },
        {
            "id": 5,
            "section": "learning_style",
            "text": "Если нужно запомнить новый термин, вы:",
            "options": [
                {"value": "a", "label": "представляете, как он выглядит"},
                {"value": "b", "label": "повторяете его вслух"},
                {"value": "c", "label": "записываете его несколько раз"},
                {"value": "d", "label": "связываете его с движением или действием"},
            ],
    },
       {
            "id": 6,
            "section": "learning_style",
            "text": "При просмотре видеоурока вы чаще:",
            "options": [
                {"value": "a", "label": "обращаете внимание на изображения"},
                {"value": "b", "label": "слушаете голос"},
                {"value": "c", "label": "читаете субтитры"},
                {"value": "d", "label": "пробуете повторить действия"},
            ],
    },   {
            "id": 7,
            "section": "memory",
            "text": "Вы легко запоминаете длинные списки слов?",
            "options": [
                {"value": "a", "label": "всегда"},
                {"value": "b", "label": "часто"},
                {"value": "c", "label": "редко"},
                {"value": "d", "label": "почти никогда"},
            ],
    },   {
            "id": 8,
            "section": "memory",
            "text": "Вам легко вспомнить, что вы делали неделю назад?",
            "options": [
                {"value": "a", "label": "да, в деталях"},
                {"value": "b", "label": "в общих чертах"},
                {"value": "c", "label": "только после подсказки"},
                {"value": "d", "label": "затрудняюсь"},
            ],
    },   {
            "id": 9,
            "section": "memory",
            "text": "После прочтения текста вы обычно помните:",
            "options": [
                {"value": "a", "label": "почти всё"},
                {"value": "b", "label": "основные идеи"},
                {"value": "c", "label": "немного"},
                {"value": "d", "label": "почти ничего"},
            ],
    },   {
            "id": 10,
            "section": "memory",
            "text": "Если вы изучаете новый язык, слова запоминаются вам:",
            "options": [
                {"value": "a", "label": "очень легко"},
                {"value": "b", "label": "с умеренными усилиями"},
                {"value": "c", "label": "с трудом"},
                {"value": "d", "label": "очень тяжело"},
            ],
    },   {
            "id": 11,
            "section": "memory",
            "text": "Когда вы слышите цифры или факты, вы:",
            "options": [
                {"value": "a", "label": "запоминаете сразу"},
                {"value": "b", "label": "иногда запоминаете"},
                {"value": "c", "label": "быстро забываете"},
                {"value": "d", "label": "не запоминаете вообще"},
            ],
    },   {
            "id": 12,
            "section": "memory",
            "text": "Ваша способность вспоминать детали из фильмов или книг:",
            "options": [
                {"value": "a", "label": "отличная"},
                {"value": "b", "label": "хорошая"},
                {"value": "c", "label": "средняя"},
                {"value": "d", "label": "слабая"},
            ],
    },   {
            "id": 13,
            "section": "discipline",
            "text": "Если у вас нет настроения учиться, вы всё равно садитесь за работу?",
            "options": [
                {"value": "a", "label": "всегда"},
                {"value": "b", "label": "чаще всего"},
                {"value": "c", "label": "иногда"},
                {"value": "d", "label": "нет"},
            ],
    },   {
            "id": 14,
            "section": "discipline",
            "text": "Вы способны заниматься без напоминаний и дедлайнов?",
            "options": [
                {"value": "a", "label": "да"},
                {"value": "b", "label": "иногда"},
                {"value": "c", "label": "редко"},
                {"value": "d", "label": "нет"},
            ],
    },   {
            "id": 15,
            "section": "discipline",
            "text": "Если задание сложное, вы:",
            "options": [
                {"value": "a", "label": "разбиваете его на части и делаете постепенно"},
                {"value": "b", "label": "откладываете, но всё же делаете"},
                {"value": "c", "label": "ждёте вдохновения"},
                {"value": "d", "label": "бросаете"},
            ],
    },
     {
            "id": 16,
            "section": "discipline",
            "text": "Когда вы учитесь, вас легко отвлечь?",
            "options": [
                {"value": "a", "label": "нет"},
                {"value": "b", "label": "редко"},
                {"value": "c", "label": "часто"},
                {"value": "d", "label": "постоянно"},
            ],
    }, {
            "id": 17,
            "section": "discipline",
            "text": "Вы придерживаетесь расписания обучения?",
            "options": [
                {"value": "a", "label": "да, строго"},
                {"value": "b", "label": "стараюсь"},
                {"value": "c", "label": "не всегда"},
                {"value": "d", "label": "нет"},
            ],
    }, {
            "id": 18,
            "section": "discipline",
            "text": "Вы чувствуете удовлетворение, когда выполняете поставленную цель?",
            "options": [
                {"value": "a", "label": "всегда"},
                {"value": "b", "label": "часто"},
                {"value": "c", "label": "редко"},
                {"value": "d", "label": "нет"},
            ],
    },
        
    ]
    return Response({"questions": questions})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_profile(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    strategies = LearningStrategy.objects.filter(user=profile).select_related('course')
    strategies_data = []
    for s in strategies:
        data = s.strategy_json or {}
        strategies_data.append({
            "courseid": s.course.id,
            "coursetitle": s.course.title,
            "createdat": s.created_at,
            "summary": data.get("summary"),
            "pace": data.get("pace"),
        })

    return Response({
        "userid": user.id,
        "username": user.username,
        "learningstyle": profile.learning_style,
        "memoryscore": profile.memory_score,
        "disciplinescore": profile.discipline_score,
        "recommendedformat": profile.recommended_format,
        "recommendedpace": profile.recommended_pace,
        "strategysummary": profile.strategy_summary,
        "goals": profile.goals,
        "interests": profile.interests,
        "strategies": strategies_data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def onboarding_answers(request):
    user = request.user
    data = request.data
    answers = data.get('answers', {})

    if not answers:
        return Response(
            {'error': 'answers are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Шкала 1: Learning Style (1–6) ---
    style_counts = {'a': 0, 'b': 0, 'c': 0, 'd': 0}
    for q in range(1, 7):
        ans = answers.get(str(q))
        if ans in style_counts:
            style_counts[ans] += 1

    max_style = max(style_counts, key=style_counts.get)
    counts = style_counts.values()
    sorted_counts = sorted(counts, reverse=True)
    if len(sorted_counts) >= 2 and (sorted_counts[0] - sorted_counts[1] < 2):
        learning_style = 'mixed'
    else:
        mapping = {
            'a': 'visual',
            'b': 'auditory',
            'c': 'read_write',
            'd': 'kinesthetic',
        }
        learning_style = mapping.get(max_style, 'mixed')

    # --- Шкала 2: Memory Score (7–12) ---
    def score_letter(letter: str) -> int:
        if letter == 'a':
            return 10
        if letter == 'b':
            return 7
        if letter == 'c':
            return 4
        if letter == 'd':
            return 1
        return 0

    memory_scores = []
    for q in range(7, 13):
        ans = answers.get(str(q))
        if ans:
            memory_scores.append(score_letter(ans))
    memory_score = round(sum(memory_scores) / len(memory_scores)) if memory_scores else None

    # --- Шкала 3: Discipline Score (13–18) ---
    discipline_scores = []
    for q in range(13, 19):
        ans = answers.get(str(q))
        if ans:
            discipline_scores.append(score_letter(ans))
    discipline_score = round(sum(discipline_scores) / len(discipline_scores)) if discipline_scores else None

    # --- Профиль пользователя ---
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.learning_style = learning_style
    profile.memory_score = memory_score
    profile.discipline_score = discipline_score

    # Рекомендации по формату
    if learning_style in ['visual', 'mixed']:
        profile.recommended_format = 'video'
    elif learning_style == 'auditory':
        profile.recommended_format = 'audio'
    elif learning_style == 'read_write':
        profile.recommended_format = 'text'
    else:
        profile.recommended_format = 'practice'

    # Генерация стратегии (твоя функция-заглушка)
    strategy = generate_learning_strategy_stub(profile)
    profile.strategy_summary = strategy["summary"]

    fmt = strategy["recommended_format"]
    if "video" in fmt:
        profile.recommended_format = "video"
    elif "аудио" in fmt or "подкаст" in fmt:
        profile.recommended_format = "audio"
    elif "текст" in fmt or "заметки" in fmt:
        profile.recommended_format = "text"
    elif "практичес" in fmt:
        profile.recommended_format = "practice"
    else:
        profile.recommended_format = "mixed"

    profile.save()

    # === ГЕНЕРАЦИЯ СТРАТЕГИЙ ДЛЯ РЕКОМЕНДОВАННЫХ КУРСОВ ===
    strategies_generated = []
    
    try:
        # Простой вариант: берем несколько популярных курсов
        top_courses = Course.objects.filter(is_active=True)[:3]
        
        for course in top_courses:
            try:
                # Генерируем стратегию через LLM
                strategy_data = call_llm_for_strategy(profile, course)
                
                # Сохраняем стратегию в БД
                learning_strategy, created = LearningStrategy.objects.update_or_create(
                    user=profile,  # Исправлено: user=profile, а не user_id
                    course=course,
                    defaults={
                        'strategy_json': strategy_data,
                        'updated_at': timezone.now()
                    }
                )
                
                strategies_generated.append({
                    'course_id': course.id,
                    'course_title': course.title,
                    'status': 'success',
                    'created': created,
                    'strategy_summary': strategy_data.get('summary', '')[:100] + '...'
                })
                
                logger.info(f"Generated strategy for user {user.id} and course {course.id}")
                
            except Exception as e:
                logger.error(f"Error generating strategy for course {course.id}: {e}")
                # В случае ошибки используем заглушку
                strategy_data = call_llm_for_strategy_stub(profile, course)
                
                learning_strategy, created = LearningStrategy.objects.update_or_create(
                    user=profile,
                    course=course,
                    defaults={
                        'strategy_json': strategy_data,
                        'updated_at': timezone.now()
                    }
                )
                
                strategies_generated.append({
                    'course_id': course.id,
                    'course_title': course.title,
                    'status': 'fallback',
                    'created': created,
                    'strategy_summary': strategy_data.get('summary', '')[:100] + '...',
                    'note': 'Использована заглушка из-за ошибки LLM'
                })
    
    except Exception as e:
        logger.error(f"Error in strategy generation: {e}")
        strategies_generated = []

    # Возвращаем ответ
    return Response({
        'message': 'Profile updated from onboarding answers',
        'profile': {
            'learning_style': profile.learning_style,
            'memory_score': profile.memory_score,
            'discipline_score': profile.discipline_score,
            'recommended_format': profile.recommended_format,
            'recommended_pace': profile.recommended_pace,
            'strategy_summary': profile.strategy_summary,
        },
        'strategies_generated': strategies_generated,
        'strategies_count': len(strategies_generated)
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def add_user_course(request):
    """
    Добавление курса по ссылке Stepik.
    """
    url = request.data.get('stepik_url')

    if not url:
        return Response(
            {'error': 'stepik_url required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    match = re.search(r'stepik\.org/course/(\d+)', url)
    if not match:
        return Response(
            {'error': 'Invalid Stepik URL format'},
            status=status.HTTP_400_BAD_REQUEST
        )

    stepik_id = int(match.group(1))

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

    title = course_data.get('title') or f'Course #{stepik_id}'
    summary = course_data.get('summary') or ''
    description = course_data.get('description') or ''
    full_description = (summary + '\n\n' + description).strip()
    level = course_data.get('difficulty') or 'beginner'
    language = course_data.get('language') or 'ru'

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

@api_view(['GET'])
@permission_classes([AllowAny])
def recommendations(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        profile = user.profile
    except (User.DoesNotExist, UserProfile.DoesNotExist):
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    qs = Course.objects.all()
    scored_courses = []

    for course in qs:
        score = 0

        if profile.learning_style in ['visual', 'mixed']:
            if course.format_type in ['video', 'mixed']:
                score += 3
        if profile.learning_style == 'auditory':
            if course.format_type in ['audio', 'video', 'mixed']:
                score += 3
        if profile.learning_style == 'read_write':
            if course.format_type in ['text', 'mixed']:
                score += 3
        if profile.learning_style == 'kinesthetic':
            if course.format_type in ['practice', 'mixed']:
                score += 3

        if profile.discipline_score is not None and profile.discipline_score < 5:
            if str(course.level).lower() in ['easy', 'beginner', 'basic']:
                score += 2

        if course.language == 'ru':
            score += 1

        scored_courses.append((score, course))

    scored_courses.sort(key=lambda x: x[0], reverse=True)
    top = [c for s, c in scored_courses if s > 0][:5]

    response_courses = [
        {
            'id': c.id,
            'title': c.title,
            'level': c.level,
            'language': c.language,
            'format_type': c.format_type,
            'url': c.url,
        }
        for c in top
    ]

    return Response({
        'user_id': user.id,
        'profile': {
            'learning_style': profile.learning_style,
            'memory_score': profile.memory_score,
            'discipline_score': profile.discipline_score,
            'recommended_format': profile.recommended_format,
            'recommended_pace': profile.recommended_pace,
            'strategy_summary': profile.strategy_summary,
        },
        'courses': response_courses,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def course_strategy(request):
    """Генерирует и сохраняет стратегию обучения"""
    data = request.data
    
    try:
        user = request.user
        profile = user.profile
        course_id = data.get('course_id')
        
        if not course_id:
            return Response({"error": "course_id is required"}, status=400)
        
        course = Course.objects.get(id=course_id)
        
        # Генерируем стратегию
        strategy_json = call_llm_for_strategy(profile, course)
        
        # Сохраняем
        LearningStrategy.objects.update_or_create(
            user=profile,  # Исправлено: user=profile
            course=course,
            defaults={'strategy_json': strategy_json}
        )
        
        return Response({
            "status": "success",
            "message": "Стратегия создана и сохранена!",
            "user_id": user.id,
            "course_title": course.title,
            "strategy": strategy_json
        })
        
    except UserProfile.DoesNotExist:
        return Response({"error": "Профиль не найден"}, status=404)
    except Course.DoesNotExist:
        return Response({"error": f"Курс id={data.get('course_id')} не найден"}, status=404)
    except Exception as e:
        logger.error(f"Error in course_strategy: {e}")
        return Response({"error": f"Ошибка: {str(e)}"}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_llm_strategy(request):
    """Тест LLM стратегии"""
    try:
        data = request.data
        user = request.user
        profile = user.profile
        course_id = data.get('course_id')
        
        if not course_id:
            return Response({"error": "course_id is required"}, status=400)
            
        course = Course.objects.get(id=course_id)
        
        strategy = call_llm_for_strategy(profile, course)
        return Response({
            "status": "success",
            "strategy": strategy
        })
    except Exception as e:
        logger.error(f"Error in test_llm_strategy: {e}")
        return Response({
            "status": "error", 
            "message": str(e)
        }, status=400)