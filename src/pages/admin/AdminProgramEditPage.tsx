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
import type { AdminProgramDetail } from '@/shared/types';

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

export default function AdminProgramEditPage() {
  const { universityId, programId } = useParams<{ universityId: string; programId: string }>();
  const [data, setData] = useState<AdminProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successTime, setSuccessTime] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [costPerYear, setCostPerYear] = useState('');
  const [costLabel, setCostLabel] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [whoItsFor, setWhoItsFor] = useState('');

  // JSON states as strings
  const [requirementsJSON, setRequirementsJSON] = useState('{}');
  const [deadlinesJSON, setDeadlinesJSON] = useState('{}');
  const [grantsJSON, setGrantsJSON] = useState('[]');

  // JSON parse errors
  const [requirementsError, setRequirementsError] = useState('');
  const [deadlinesError, setDeadlinesError] = useState('');
  const [grantsError, setGrantsError] = useState('');

  useEffect(() => {
    if (!programId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const p = await adminApi.getProgram(programId!);
        if (cancelled) return;
        setData(p);
        setName(p.name || '');
        setLanguage(p.language || '');
        setCostPerYear(p.cost_per_year !== null ? String(p.cost_per_year) : '');
        setCostLabel(p.cost_label || '');
        setSourceUrl(p.source_url || '');
        setDescription(p.description || '');
        setWhoItsFor(p.who_its_for || '');

        setRequirementsJSON(JSON.stringify(p.requirements || {}, null, 2));
        setDeadlinesJSON(JSON.stringify(p.deadlines || {}, null, 2));
        setGrantsJSON(JSON.stringify(p.grants || [], null, 2));
      } catch {
        if (!cancelled) setError('Не удалось загрузить данные программы');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!programId || !data) return;

    setRequirementsError('');
    setDeadlinesError('');
    setGrantsError('');
    setSuccessTime(null);
    setError('');

    let hasErrors = false;
    let requirements: Record<string, unknown> = {};
    let deadlines: Record<string, unknown> = {};
    let grants: unknown[] = [];

    // Parse Requirements
    try {
      requirements = JSON.parse(requirementsJSON);
      if (typeof requirements !== 'object' || requirements === null || Array.isArray(requirements)) {
        throw new Error('Должно быть объектом {}');
      }
    } catch (err: any) {
      setRequirementsError(`Некорректный JSON: ${err.message}`);
      hasErrors = true;
    }

    // Parse Deadlines
    try {
      deadlines = JSON.parse(deadlinesJSON);
      if (typeof deadlines !== 'object' || deadlines === null || Array.isArray(deadlines)) {
        throw new Error('Должно быть объектом {}');
      }
    } catch (err: any) {
      setDeadlinesError(`Некорректный JSON: ${err.message}`);
      hasErrors = true;
    }

    // Parse Grants
    try {
      grants = JSON.parse(grantsJSON);
      if (!Array.isArray(grants)) {
        throw new Error('Должно быть массивом []');
      }
    } catch (err: any) {
      setGrantsError(`Некорректный JSON: ${err.message}`);
      hasErrors = true;
    }

    if (hasErrors) return;

    setSaving(true);
    try {
      const parsedCost = costPerYear.trim() === '' ? null : parseFloat(costPerYear.trim());
      const updated = await adminApi.updateProgram(programId, {
        name: name.trim(),
        language: language.trim(),
        cost_per_year: isNaN(Number(parsedCost)) ? null : parsedCost,
        cost_label: costLabel.trim() || null,
        source_url: sourceUrl.trim() || null,
        description: description.trim() || null,
        who_its_for: whoItsFor.trim() || null,
        requirements,
        deadlines,
        grants,
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
        <Link
          to={`/admin/universities/${universityId}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
        >
          <ArrowLeft size={16} /> Назад к университету
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
          to={`/admin/universities/${universityId}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Назад к университету
        </Link>
        <div className="text-xs text-secondary font-semibold">
          Последняя проверка: <span className="font-extrabold text-primary">{formatDate(data.updated_at)}</span>
        </div>
      </div>

      <PageHeader
        title={data.name}
        subtitle={`Программа вуза: ${data.university.name}`}
      />

      <form onSubmit={handleSave} className="space-y-5">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Название программы"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Input
              label="Язык обучения"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Стоимость обучения в год (тенге)"
              type="number"
              value={costPerYear}
              onChange={(e) => setCostPerYear(e.target.value)}
              placeholder="Например, 1200000"
            />
            <Input
              label="Стоимость текстом (если диапазон/другая валюта)"
              value={costLabel}
              onChange={(e) => setCostLabel(e.target.value)}
              placeholder="Например, 2 000 – 6 000 EUR в семестр"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ссылка на источник верификации"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <Textarea
            label="Описание программы"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Что изучают на данной программе..."
          />

          <Textarea
            label="Кому подходит"
            value={whoItsFor}
            onChange={(e) => setWhoItsFor(e.target.value)}
            rows={4}
            placeholder="Для каких студентов ориентирован курс..."
          />

          <div className="border-t border-default pt-4 space-y-4">
            <h3 className="text-base font-bold text-primary">Параметры программы (JSON)</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Textarea
                label="Требования (requirements)"
                value={requirementsJSON}
                onChange={(e) => setRequirementsJSON(e.target.value)}
                rows={12}
                className="font-mono text-xs"
                error={requirementsError}
              />
              <Textarea
                label="Сроки подачи (deadlines)"
                value={deadlinesJSON}
                onChange={(e) => setDeadlinesJSON(e.target.value)}
                rows={12}
                className="font-mono text-xs"
                error={deadlinesError}
              />
              <Textarea
                label="Гранты (grants)"
                value={grantsJSON}
                onChange={(e) => setGrantsJSON(e.target.value)}
                rows={12}
                className="font-mono text-xs"
                error={grantsError}
              />
            </div>
          </div>

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
    </PageContainer>
  );
}
