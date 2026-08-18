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
  const [shortName, setShortName] = useState('');
  const [aliases, setAliases] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [ranking, setRanking] = useState('');
  const [rankingLabel, setRankingLabel] = useState('');
  const [unirankKzRank, setUnirankKzRank] = useState('');
  const [unirankWorldRank, setUnirankWorldRank] = useState('');
  const [unirankNote, setUnirankNote] = useState('');
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
        setShortName(u.short_name || '');
        setAliases(u.aliases.join(', '));
        setLocation(u.location || '');
        setCity(u.city || '');
        setCountry(u.country || '');
        setRanking(u.ranking !== null ? String(u.ranking) : '');
        setRankingLabel(u.ranking_label || '');
        setUnirankKzRank(u.uniranks_kz_rank !== null ? String(u.uniranks_kz_rank) : '');
        setUnirankWorldRank(u.uniranks_world_rank !== null ? String(u.uniranks_world_rank) : '');
        setUnirankNote(u.uniranks_note || '');
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
      const parseIntOrNull = (value: string) => {
        const trimmed = value.trim();
        if (trimmed === '') return null;
        const parsed = parseInt(trimmed, 10);
        return isNaN(parsed) ? null : parsed;
      };
      const updated = await adminApi.updateUniversity(universityId, {
        name: name.trim(),
        short_name: shortName.trim() || null,
        aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean),
        location: location.trim() || null,
        city: city.trim(),
        country: country.trim(),
        ranking: parseIntOrNull(ranking),
        ranking_label: rankingLabel.trim() || null,
        uniranks_kz_rank: parseIntOrNull(unirankKzRank),
        uniranks_world_rank: parseIntOrNull(unirankWorldRank),
        uniranks_note: unirankNote.trim() || null,
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
              label="Короткое название"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Например, КБТУ"
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
              label="Адрес кампуса (location)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Город, улица, дом"
            />
            <Input
              label="Альтернативные названия (через запятую)"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              placeholder="Например, KBTU, Kazakhstan-British Technical University"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Рейтинг QS (число)"
              type="number"
              value={ranking}
              onChange={(e) => setRanking(e.target.value)}
              placeholder="Например, 10"
            />
            <Input
              label="Рейтинг QS (метка)"
              value={rankingLabel}
              onChange={(e) => setRankingLabel(e.target.value)}
              placeholder="Например, #651-700 (QS World)"
            />
            <Input
              label="Место в Казахстане (Uniranks)"
              type="number"
              value={unirankKzRank}
              onChange={(e) => setUnirankKzRank(e.target.value)}
              placeholder="Например, 21"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Мировое место (Uniranks)"
              type="number"
              value={unirankWorldRank}
              onChange={(e) => setUnirankWorldRank(e.target.value)}
              placeholder="Например, 7101"
            />
            <div className="md:col-span-2">
              <Input
                label="Примечание Uniranks (если не в рейтинге)"
                value={unirankNote}
                onChange={(e) => setUnirankNote(e.target.value)}
                placeholder="Например, Н/Р"
              />
            </div>
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
                      <td className="px-4 py-3 text-secondary max-w-[240px] truncate" title={prog.cost_label ?? undefined}>
                        {prog.cost_per_year !== null
                          ? `${Number(prog.cost_per_year).toLocaleString('ru-RU')} ₸`
                          : prog.cost_label ?? '—'}
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
