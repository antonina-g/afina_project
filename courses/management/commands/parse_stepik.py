import requests
from django.core.management.base import BaseCommand
from courses.models import Course
import json

class Command(BaseCommand):
    help = 'Parse courses from Stepik API with pagination'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=100, help='Total courses to parse')
        parser.add_argument('--clear', action='store_true', help='Clear existing courses first')

    def handle(self, *args, **options):
        total_limit = options['limit']
        clear_first = options['clear']
        
        if clear_first:
            deleted = Course.objects.all().delete()[0]
            self.stdout.write(f'Cleared {deleted} existing courses')
        
        self.stdout.write(f'Parsing up to {total_limit} courses from Stepik...')
        
        url = 'https://stepik.org/api/courses'
        page = 1
        saved = 0
        skipped = 0
        
        while saved < total_limit:
            params = {'page': page}
            self.stdout.write(f'Fetching page {page}...')
            
            try:
                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                courses = data.get('courses', [])
                if not courses:
                    self.stdout.write('No more courses')
                    break
                
                self.stdout.write(f'Page {page}: {len(courses)} courses')
                
                for course in courses:
                    if saved >= total_limit:
                        break
                        
                    stepik_id = course['id']
                    
                    if Course.objects.filter(stepik_id=stepik_id).exists():
                        skipped += 1
                        continue
                    
                    # Очистка HTML из полей
                    title = course.get('title', 'No title')
                    description = course.get('summary', '').replace('\n', ' ').strip()
                    
                    course_obj = Course(
                        stepik_id=stepik_id,
                        title=title[:255],  # Django max_length
                        description=description[:1000],
                        level=course.get('difficulty') or 'beginner',
                        language=course.get('language', 'ru'),
                        format_type=course.get('course_format', 'mixed'),
                        duration_hours=None,  # нет в API
                        url=f'https://stepik.org/course/{stepik_id}/',
                        rating=None  # нет в API
                    )
                    course_obj.save()
                    saved += 1
                    self.stdout.write(f'  ✅ {saved}: {title}')
                
                # Проверяем следующую страницу
                meta = data.get('meta', {})
                if not meta.get('has_next', False):
                    self.stdout.write('No more pages')
                    break
                
                page += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error on page {page}: {e}'))
                break
        
        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Done! Saved: {saved}, Skipped: {skipped}')
        )
