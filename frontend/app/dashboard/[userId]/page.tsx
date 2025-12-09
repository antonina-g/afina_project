'use client'
import { useEffect, useState } from 'react'

const API_BASE_URL = process.env.NEXTPUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/'

type StrategyItem = {
  courseid: number
  coursetitle: string
  createdat: string
  summary?: string
  pace?: string
}

type ProfileResponse = {
  userid: number
  username: string
  learningstyle: string | null
  memoryscore: number | null
  disciplinescore: number | null
  recommendedformat: string | null
  recommendedpace: string | null
  strategysummary: string
  goals: string
  interests: string
  strategies: StrategyItem[]
}

type RecommendationCourse = {
  id: number
  title: string
  level: string
  language: string
  formattype: string
  url: string
}

type RecommendationsResponse = {
  userid: number
  profile: {
    learningstyle: string | null
    memoryscore: number | null
    disciplinescore: number | null
    recommendedformat: string | null
    recommendedpace: string | null
    strategysummary: string
  }
  courses: RecommendationCourse[]
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [recs, setRecs] = useState<RecommendationsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stepikUrl, setStepikUrl] = useState('')
  const [addingCourse, setAddingCourse] = useState(false)

  const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) throw new Error('No token')

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.status === 401) {
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    return res
  }

  // 1) Берём userId из localStorage один раз
  useEffect(() => {
    const storedId = localStorage.getItem('userId')
    if (!storedId) {
      window.location.href = '/login'
      return
    }
    setUserId(storedId)
  }, [])

  // 2) Грузим данные только когда userId уже есть
  useEffect(() => {
    if (!userId) return

    async function loadData() {
      try {
        const profileRes = await fetchWithAuth(API_BASE_URL + 'profile/' + userId + '/')
        if (!profileRes.ok) throw new Error(`Profile error: ${profileRes.status}`)
        const profileData = await profileRes.json()

        if (!profileData.learningstyle) {
          window.location.href = '/onboarding'
          return
        }

        const recsRes = await fetchWithAuth(API_BASE_URL + 'recommendations/' + userId + '/')
        if (!recsRes.ok) throw new Error(`Recommendations error: ${recsRes.status}`)
        const recsData = await recsRes.json()

        setProfile(profileData)
        setRecs(recsData)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  const handleAddCourse = async () => {
    if (!stepikUrl || !userId) return
    setAddingCourse(true)

    try {
      const token = localStorage.getItem('accessToken')

      const courseRes = await fetch(API_BASE_URL + 'add-course/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token!}`
        },
        body: JSON.stringify({ stepik_url: stepikUrl })
      })

      if (!courseRes.ok) throw new Error('Failed to add course')
      const courseData = await courseRes.json()
      const courseId = courseData.course?.id || courseData.course_id
      if (!courseId) throw new Error('No course ID received')

      const strategyRes = await fetch(
        API_BASE_URL + `users/${userId}/strategies/generate/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ course_id: courseId })
        }
      )

      if (!strategyRes.ok) throw new Error('Failed to generate strategy')

      window.location.reload()
    } catch (e: any) {
      alert('Ошибка: ' + e.message)
    } finally {
      setAddingCourse(false)
      setStepikUrl('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-zinc-50">
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">ID: {userId}</p>
          <h1 className="text-3xl font-semibold">Афина</h1>
          <p className="text-sm text-zinc-400">Ваш персонализированный дашборд</p>
        </header>

        {loading && <p className="text-sm text-zinc-300">Загрузка дашборда...</p>}
        {error && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {/* ➕ НОВЫЙ БЛОК: Добавить курс */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
          <h2 className="mb-3 text-sm font-semibold text-zinc-100">➕ Добавить курс Stepik</h2>
          <div className="flex gap-2">
            <input
              type="url"
              value={stepikUrl}
              onChange={(e) => setStepikUrl(e.target.value)}
              placeholder="https://stepik.org/course/59426/syllabus"
              className="flex-1 p-2 border border-white/20 bg-slate-950 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              disabled={addingCourse}
            />
            <button
              onClick={handleAddCourse}
              disabled={!stepikUrl || addingCourse}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium disabled:cursor-not-allowed"
            >
              {addingCourse ? 'Генерируем...' : 'Добавить + стратегия'}
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Введите ссылку → парсинг → персональная стратегия
          </p>
        </section>

        {!loading && !error && profile && (
          <>
            {/* Профиль */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
                <h2 className="mb-3 text-sm font-semibold text-zinc-100">Профиль обучения</h2>
                <ul className="space-y-1 text-xs text-zinc-200">
                  <li>Стиль: <span className="font-medium">{profile.learningstyle ?? '-'}</span></li>
                  <li>Память: <span className="font-medium">{profile.memoryscore ?? '-'} / 10</span></li>
                  <li>Дисциплина: <span className="font-medium">{profile.disciplinescore ?? '-'} / 10</span></li>
                  <li>Формат: <span className="font-medium">{profile.recommendedformat ?? '-'}</span></li>
                  <li>Темп: <span className="font-medium">{profile.recommendedpace ?? '-'}</span></li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
                <h2 className="mb-3 text-sm font-semibold text-zinc-100">Рекомендации LLM</h2>
                <p className="text-xs leading-relaxed text-zinc-200 whitespace-pre-line">
                  {profile.strategysummary || 'Нет рекомендаций'}
                </p>
              </div>
            </section>

            {/* Стратегии */}
            {profile.strategies.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
                <h2 className="mb-3 text-sm font-semibold text-zinc-100">
                  Ваши стратегии ({profile.strategies.length})
                </h2>
                <ul className="space-y-3 text-xs text-zinc-200">
                  {profile.strategies.map((s) => (
                    <li key={`${s.courseid}-${s.createdat}`} className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                      <div className="text-sm font-medium text-zinc-50">{s.coursetitle}</div>
                      {s.summary && <p className="mt-1 text-xs text-zinc-200">{s.summary}</p>}
                      {s.pace && <p className="mt-1 text-xs text-zinc-400">Темп: {s.pace}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Рекомендации */}
            {recs && recs.courses.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg">
                <h2 className="mb-3 text-sm font-semibold text-zinc-100">Рекомендованные курсы</h2>
                <ul className="space-y-3 text-xs">
                  {recs.courses.map((c) => (
                    <li key={c.id} className="flex flex-col gap-1 rounded-xl border border-white/10 bg-slate-950/70 p-4">
                      <a 
                        href={c.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline"
                      >
                        {c.title}
                      </a>
                      <span className="text-[11px] text-zinc-400">
                        {c.level} • {c.language} • {c.formattype}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
