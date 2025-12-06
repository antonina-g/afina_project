from typing import List, Dict
from courses.models import UserProfile, Course

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
