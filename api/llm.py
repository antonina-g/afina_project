from typing import List, Dict
from courses.models import UserProfile, Course
import json
from typing import Dict
from courses.models import UserProfile, Course
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# ← ВАШИ SYSTEM_PROMPT и build_user_prompt остаются

def call_llm_for_strategy(profile, course):
    """Приоритет: Ollama → stub"""
    try:
        return call_ollama(profile, course)
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        return call_llm_for_strategy_stub(profile, course)

def call_ollama(profile, course):
    """Вызов локальной Ollama"""
    prompt = build_user_prompt(profile, course)
    
    response = requests.post(f"{settings.OLLAMA_URL}/api/chat", json={
        "model": "llama3.2:1b",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "format": "json", 
        "stream": False
    })
    
    if response.status_code == 200:
        content = response.json()['message']['content']
        return json.loads(content)
    else:
        raise Exception(f"Ollama error: {response.status_code}")



SYSTEM_PROMPT = """
Ты — ассистент по обучению. Твоя задача — на основе профиля ученика и информации о конкретном курсе составить персональную стратегию прохождения именно этого курса.

Всегда отвечай ТОЛЬКО в виде корректного JSON без пояснений, без комментариев и без дополнительного текста вокруг. Структура JSON должна быть строго такой:

{
  "summary": "строка",
  "pace": "строка",
  "format_tips": ["строка", "строка"],
  "steps": [
    {
      "title": "строка",
      "description": "строка",
      "recommended_time": "строка"
    }
  ]
}

- summary: краткое (2–3 предложения) описание общей стратегии обучения для этого пользователя и курса.
- pace: рекомендуемый темп обучения (например: "3 занятия по 45–60 минут в неделю", "по 30 минут каждый день").
- format_tips: 2–4 коротких совета по формату обучения (как использовать видео, текст, практику и т.п.), адаптированных под стиль обучения пользователя.
- steps: 3–6 шагов или этапов обучения (например, по неделям или по блокам курса) с понятными названиями, описанием и примерной оценкой времени.

Не используй переносы строк внутри значений JSON, кроме как в виде обычного текста. Не добавляй никаких полей, которых нет в описанной схеме.
""".strip()


def build_user_prompt(profile: UserProfile, course: Course) -> str:
    """
    Собирает текстовую часть промпта (user prompt) на основе профиля и курса.
    """
    learning_style = profile.learning_style or "не указан"
    memory_score = profile.memory_score if profile.memory_score is not None else "не указана"
    discipline_score = profile.discipline_score if profile.discipline_score is not None else "не указана"
    goals = profile.goals or "не указаны"
    interests = profile.interests or "не указаны"

    course_desc = (course.description or "").strip()
    if len(course_desc) > 600:
        course_desc = course_desc[:600] + "..."

    template = f"""
Дано:

Профиль пользователя:
- Стиль обучения: {learning_style}
- Оценка памяти (1-10): {memory_score}
- Оценка самодисциплины (1-10): {discipline_score}
- Цели обучения: {goals}
- Интересы: {interests}

Курс:
- Название: {course.title}
- Уровень: {course.level}
- Язык: {course.language}
- Формат: {course.format_type}
- Краткое описание: {course_desc}

На основе этих данных:

1. Проанализируй сильные и слабые стороны ученика (память, дисциплина, стиль обучения).
2. Учти уровень и формат курса.
3. Составь персональную стратегию прохождения ИМЕННО ЭТОГО КУРСА для данного ученика.

Напомню: ответ должен быть ТОЛЬКО в виде JSON со следующими полями:
- summary
- pace
- format_tips
- steps

Не добавляй никакого текста вне JSON.
""".strip()

    return template


def build_llm_profile_context(profile: UserProfile) -> str:
    """
    Собирает текстовое описание профиля пользователя для передачи в LLM.
    Это удобно объяснять на защите как 'user model'.
    """
    parts = [
        f"Learning style: {profile.learning_style}",
        f"Memory score (1-10): {profile.memory_score}",
        f"Discipline score (1-10): {profile.discipline_score}",
        f"Goals: {profile.goals or 'not specified'}",
        f"Interests: {profile.interests or 'not specified'}",
    ]
    return "\n".join(parts)

def build_llm_courses_context(courses: List[Course]) -> List[Dict]:
    """
    Превращает курсы из БД в компактный список словарей для передачи в LLM.
    Это то, с чем модель будет работать при выборе рекомендаций.
    """
    result = []
    for c in courses:
        result.append({
            "id": c.id,
            "stepik_id": c.stepik_id,
            "title": c.title,
            "level": c.level,
            "language": c.language,
            "format_type": c.format_type,
            "url": c.url,
        })
    return result

def generate_learning_strategy_stub(profile: UserProfile) -> Dict:
    """
    Заглушка вместо реального вызова LLM.
    Логика проста, но структура ответа такая же,
    как будет у настоящей модели.
    """
    if profile.learning_style in ['visual', 'mixed']:
        main_format = 'video + визуальные конспекты'
    elif profile.learning_style == 'auditory':
        main_format = 'аудио/подкасты + обсуждения'
    elif profile.learning_style == 'read_write':
        main_format = 'тексты + подробные заметки'
    else:
        main_format = 'практические задания и проекты'

    if profile.discipline_score is not None and profile.discipline_score >= 8:
        pace = 'интенсивный темп с ежедневными короткими сессиями'
    elif profile.discipline_score is not None and profile.discipline_score >= 5:
        pace = 'умеренный темп 3–4 раза в неделю'
    else:
        pace = 'медленный темп с небольшими, но регулярными шагами'

    summary = (
        f"Рекомендуется формат: {main_format}. "
        f"Рекомендуемый темп: {pace}. "
        "Начните с одного основного курса и фиксируйте прогресс после каждого модуля."
    )

    return {
        "recommended_format": main_format,
        "recommended_pace_description": pace,
        "summary": summary,
    }

def call_llm_for_strategy_stub(profile: UserProfile, course: Course) -> Dict:
    """
    Заглушка вместо реального вызова LLM.
    """
    summary = (
        f"Курс '{course.title}' рекомендуется проходить с учётом вашего стиля "
        f"'{profile.learning_style}' и уровня самодисциплины {profile.discipline_score}/10. "
        "Фокусируйтесь на регулярной практике и коротких, но частых занятиях."
    )

    data = {
        "summary": summary,
        "pace": "3 занятия по 45–60 минут в неделю",
        "format_tips": [
            "После каждого урока делайте краткий конспект ключевых идей.",
            "Раз в неделю повторяйте конспекты и выполняйте хотя бы одно практическое задание."
        ],
        "steps": [
            {
                "title": "Этап 1: знакомство с курсом",
                "description": "Пройдите первые 1–2 модуля и оформите визуальные заметки.",
                "recommended_time": "3–4 часа"
            },
            {
                "title": "Этап 2: закрепление основ",
                "description": "Повторите ключевые темы и выполните базовые задания.",
                "recommended_time": "4–5 часов"
            },
            {
                "title": "Этап 3: регулярная практика",
                "description": "Каждую неделю добавляйте 1 новый модуль и минимум один мини‑проект.",
                "recommended_time": "4–6 часов в неделю"
            }
        ]
    }

    json.dumps(data, ensure_ascii=False)
    return data