import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { Card } from '@/shared/ui/Card';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import type { AdminUniversityDetail } from '@/shared/types';

function formatDate(value: string | null) {
  if (!value) return 'не проверялась';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUniversityDetailPage() {
  const { universityId } = useParams<{ universityId: string }>();
  const [data, setData] = useState<AdminUniversityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successTime, setSuccessTime] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [ranking, setRanking] = useState('');
  const [website, setWebsite] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!universityId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const u = await adminApi.getUniversity(universityId!);
        if (cancelled) return;
        setData(u);
        setName(u.name || '');
        setCity(u.city || '');
        setCountry(u.country || '');
        setRanking(u.ranking !== null ? String(u.ranking) : '');
        setWebsite(u.website || '');
        setSourceUrl(u.source_url || '');
        setDescription(u.description || '');
      } catch {
        if (!cancelled) setError('Не удалось загрузить данные университета');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!universityId || !data) return;

    setSaving(true);
    setSuccessTime(null);
    try {
      const parsedRanking = ranking.trim() === '' ? null : parseInt(ranking.trim(), 10);
      const updated = await adminApi.updateUniversity(universityId, {
        name: name.trim(),
        city: city.trim(),
        country: country.trim(),
        ranking: isNaN(Number(parsedRanking)) ? null : parsedRanking,
        website: website.trim() || null,
        source_url: sourceUrl.trim() || null,
        description: description.trim() || null,
      });
      setData(updated);
      setSuccessTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      setError('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer className="space-y-4">
        <Link to="/admin/universities" className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
          <ArrowLeft size={16} /> Назад к списку
        </Link>
        <Card className="text-red-600 font-semibold">{error}</Card>
      </PageContainer>
    );
  }

  if (!data) return null;

  return (
    <PageContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/universities"
          className="inline-flex items-center gap-1 text-sm font-bold text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Назад к списку
        </Link>
        <div className="text-xs text-secondary font-semibold">
          Последняя проверка: <span className="font-extrabold text-primary">{formatDate(data.updated_at)}</span>
        </div>
      </div>

      <PageHeader
        title={data.name}
        subtitle="Редактирование общей информации об университете"
      />

      <form onSubmit={handleSave} className="space-y-5">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Название университета"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Рейтинг (ranking)"
              type="number"
              value={ranking}
              onChange={(e) => setRanking(e.target.value)}
              placeholder="Например, 10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Город"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              label="Страна"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Официальный сайт"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.edu.kz"
            />
            <Input
              label="Ссылка на источник верификации"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <Textarea
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Общая информация о вузе..."
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            {successTime && (
              <span className="text-emerald-600 font-extrabold text-sm">
                Сохранено в {successTime}
              </span>
            )}
            {error && (
              <span className="text-red-600 font-extrabold text-sm">
                {error}
              </span>
            )}
          </div>
        </Card>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-black text-primary">Образовательные программы ({data.programs.length})</h3>
        <Card className="p-0 overflow-hidden">
          {data.programs.length === 0 ? (
            <div className="p-6 text-center text-secondary font-semibold">У этого университета нет программ в базе</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-raised border-b border-default">
                  <tr>
                    <th className="text-left px-4 py-3 font-extrabold">Название программы</th>
                    <th className="text-left px-4 py-3 font-extrabold">Язык</th>
                    <th className="text-left px-4 py-3 font-extrabold">Стоимость в год</th>
                    <th className="text-right px-4 py-3 font-extrabold">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {data.programs.map((prog) => (
                    <tr key={prog.id} className="border-b border-default last:border-b-0">
                      <td className="px-4 py-3 font-bold text-primary">{prog.name}</td>
                      <td className="px-4 py-3 text-secondary">{prog.language}</td>
                      <td className="px-4 py-3 text-secondary">
                        {prog.cost_per_year !== null ? `${Number(prog.cost_per_year).toLocaleString('ru-RU')} ₸` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/universities/${universityId}/programs/${prog.id}`}
                          className="text-brand font-bold hover:underline"
                        >
                          Редактировать
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
