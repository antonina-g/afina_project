import re
import requests

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from users.models import User
from courses.models import Course, UserProfile


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


@api_view(['POST'])
@permission_classes([AllowAny])  # позже можно завязать на авторизацию
def onboarding_answers(request):
    data = request.data
    user_id = data.get('user_id')
    answers = data.get('answers', {})

    if not user_id or not answers:
        return Response(
            {'error': 'user_id and answers are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # --- Шкала 1: Learning Style (по ответам a/b/c/d в вопросах 1–6) ---
    style_counts = {'a': 0, 'b': 0, 'c': 0, 'd': 0}
    for q in range(1, 7):  # вопросы 1–6
        ans = answers.get(str(q))
        if ans in style_counts:
            style_counts[ans] += 1

    # a=visual, b=auditory, c=read_write, d=kinesthetic
    max_style = max(style_counts, key=style_counts.get)
    counts = style_counts.values()
    # проверка на mixed, если разница маленькая
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
    for q in range(7, 13):  # 7–12 включительно
        ans = answers.get(str(q))
        if ans:
            memory_scores.append(score_letter(ans))
    memory_score = round(sum(memory_scores) / len(memory_scores)) if memory_scores else None

    # --- Шкала 3: Discipline Score (13–18) ---
    discipline_scores = []
    for q in range(13, 19):  # 13–18 включительно
        ans = answers.get(str(q))
        if ans:
            discipline_scores.append(score_letter(ans))
    discipline_score = round(sum(discipline_scores) / len(discipline_scores)) if discipline_scores else None

    # --- Обновляем/создаём профиль пользователя ---
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.learning_style = learning_style
    profile.memory_score = memory_score
    profile.discipline_score = discipline_score

    # Пока без реального LLM — зашлём простые дефолты
    if learning_style in ['visual', 'mixed']:
        profile.recommended_format = 'video'
    elif learning_style == 'auditory':
        profile.recommended_format = 'audio'
    elif learning_style == 'read_write':
        profile.recommended_format = 'text'
    else:
        profile.recommended_format = 'practice'

    # темп по дисциплине
    if discipline_score is not None:
        if discipline_score >= 8:
            profile.recommended_pace = 'fast'
        elif discipline_score >= 5:
            profile.recommended_pace = 'normal'
        else:
            profile.recommended_pace = 'slow'

    profile.strategy_summary = (
        "Черновая стратегия: "
        f"стиль={profile.learning_style}, "
        f"память={profile.memory_score}, "
        f"самодисциплина={profile.discipline_score}."
    )

    profile.save()

    return Response({
        'message': 'Profile updated from onboarding answers',
        'profile': {
            'learning_style': profile.learning_style,
            'memory_score': profile.memory_score,
            'discipline_score': profile.discipline_score,
            'recommended_format': profile.recommended_format,
            'recommended_pace': profile.recommended_pace,
            'strategy_summary': profile.strategy_summary,
        }
    }, status=status.HTTP_200_OK)


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



