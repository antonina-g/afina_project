from typing import List, Dict
import json
import logging
import requests

from django.conf import settings
from django.utils import timezone

from courses.models import UserProfile, Course, LearningStrategy


logger = logging.getLogger(__name__)


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
    Текстовое описание профиля пользователя (на будущее, для других промптов).
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


def call_ollama(profile: UserProfile, course: Course) -> Dict:
    """
    Вызов локальной Ollama. При успехе возвращает dict с полями:
    summary, pace, format_tips, steps.
    """
    prompt = build_user_prompt(profile, course)

    response = requests.post(
        f"{settings.OLLAMA_URL}/api/chat",
        json={
            "model": "qwen2.5:3b",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "format": "json",
            "stream": False,
        },
        timeout=60,
    )

    if response.status_code != 200:
        raise Exception(f"Ollama error: {response.status_code} {response.text}")

    data = response.json()
    if "message" not in data or "content" not in data["message"]:
        raise Exception("Ollama response missing 'message.content'")

    content = data["message"]["content"]

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse LLM JSON: {e}")

    # Минимальная валидация структуры
    if not isinstance(parsed, dict):
        raise Exception("LLM JSON is not an object")

    for key in ["summary", "pace", "format_tips", "steps"]:
        if key not in parsed:
            raise Exception(f"LLM JSON missing key: {key}")

    return parsed


def call_llm_for_strategy(profile: UserProfile, course: Course) -> Dict:
    """
    Основной вызов: сначала пытается пойти в Ollama, при ошибке — заглушка.
    """
    try:
        logger.info(f"Calling Ollama for strategy: user_profile={profile.id}, course={course.id}")
        return call_ollama(profile, course)
    except Exception as e:
        logger.error(f"Ollama error, using stub: {e}")
        return call_llm_for_strategy_stub(profile, course)


def call_llm_for_strategy_stub(profile: UserProfile, course: Course) -> Dict:
    """
    Заглушка вместо реального вызова LLM.
    Структура ответа такая же, как у настоящей модели.
    """
    learning_style = profile.learning_style or "mixed"

    if learning_style in ["visual", "mixed"]:
        main_format = "video + визуальные конспекты"
    elif learning_style == "auditory":
        main_format = "аудио/подкасты + обсуждения"
    elif learning_style == "read_write":
        main_format = "тексты + подробные заметки"
    else:
        main_format = "практические задания и проекты"

    if profile.discipline_score is not None and profile.discipline_score >= 8:
        pace_text = "интенсивный темп с ежедневными короткими сессиями"
    elif profile.discipline_score is not None and profile.discipline_score >= 5:
        pace_text = "умеренный темп 3–4 раза в неделю"
    else:
        pace_text = "медленный темп с небольшими, но регулярными шагами"

    summary = (
        f"Курс «{course.title}» рекомендуется проходить с учётом вашего стиля "
        f"«{learning_style}» и уровня самодисциплины {profile.discipline_score or 'n/a'}/10. "
        "Фокусируйтесь на регулярной практике и коротких, но частых занятиях."
    )

    data = {
        "summary": summary,
        "pace": "3 занятия по 45–60 минут в неделю",
        "format_tips": [
            "После каждого урока делайте краткий конспект ключевых идей.",
            "Раз в неделю повторяйте конспекты и выполняйте хотя бы одно практическое задание.",
        ],
        "steps": [
            {
                "title": "Этап 1: знакомство с курсом",
                "description": "Пройдите первые 1–2 модуля и оформите визуальные заметки.",
                "recommended_time": "3–4 часа",
            },
            {
                "title": "Этап 2: закрепление основ",
                "description": "Повторите ключевые темы и выполните базовые задания.",
                "recommended_time": "4–5 часов",
            },
            {
                "title": "Этап 3: регулярная практика",
                "description": "Каждую неделю добавляйте 1 новый модуль и минимум один мини‑проект.",
                "recommended_time": "4–6 часов в неделю",
            },
        ],
    }

    return data


def generate_and_save_strategy(profile: UserProfile, course: Course) -> Dict:
    """
    Генерирует стратегию через LLM/заглушку и сохраняет/обновляет её в БД.
    Возвращает dict с полями:
    - status: "success" или "fallback"
    - created: bool
    - strategy: dict (summary, pace, format_tips, steps)
    """
    try:
        strategy_data = call_llm_for_strategy(profile, course)

        strategy, created = LearningStrategy.objects.update_or_create(
            user=profile,
            course=course,
            defaults={
                "summary": strategy_data.get("summary", ""),
                "pace": strategy_data.get("pace", ""),
                "format_tips": strategy_data.get("format_tips", []),
                "steps": strategy_data.get("steps", []),
                "updated_at": timezone.now(),
            },
        )

        logger.info(
            f"{'Created' if created else 'Updated'} strategy "
            f"for user_profile={profile.id}, course={course.id}"
        )

        return {
            "status": "success",
            "strategy": strategy_data,
            "created": created,
        }

    except Exception as e:
        logger.error(f"Error generating strategy (hard failure): {e}")

        # На всякий случай ещё раз подстрахуемся заглушкой
        fallback_data = call_llm_for_strategy_stub(profile, course)

        strategy, created = LearningStrategy.objects.update_or_create(
            user=profile,
            course=course,
            defaults={
                "summary": fallback_data.get("summary", ""),
                "pace": fallback_data.get("pace", ""),
                "format_tips": fallback_data.get("format_tips", []),
                "steps": fallback_data.get("steps", []),
                "updated_at": timezone.now(),
            },
        )

        return {
            "status": "fallback",
            "strategy": fallback_data,
            "created": created,
            "error": str(e),
        }
