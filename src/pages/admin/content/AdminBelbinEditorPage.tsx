import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSaveBar } from '@/shared/ui/admin/AdminSaveBar';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_INPUT, ADMIN_META, ADMIN_TEXTAREA, MONO_LABEL } from '@/shared/ui/admin/density';
import { AdminInlineItemTable, type AdminInlineItemColumn } from './AdminInlineItemTable';
import { useBelbinEditor } from './useBelbinEditor';
import type { BelbinBankItem } from '@/shared/types';

export default function AdminBelbinEditorPage() {
  const { t } = useTranslation('admin');
  const {
    isLoading,
    isLoadError,
    sectionsRu,
    sectionsKk,
    activeSectionIdx,
    setActiveSectionIdx,
    setSectionTitle,
    setItemText,
    dirty,
    saving,
    state,
    reset,
    save,
  } = useBelbinEditor();

  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);

  const selectSection = (idx: number) => {
    setActiveSectionIdx(idx);
    setSelectedItemIdx(null);
  };

  if (isLoadError) {
    return <AdminError message={t('belbinEditor.loadError')} />;
  }

  if (isLoading) {
    return <AdminLoading label={t('belbinEditor.loading')} />;
  }

  const activeSectionRu = sectionsRu[activeSectionIdx];
  const activeSectionKk = sectionsKk[activeSectionIdx];

  const columns: AdminInlineItemColumn<BelbinBankItem>[] = [
    { key: 'id', header: '№', width: '64px', cell: (item) => <span className={MONO_LABEL}>{item.id}</span> },
    { key: 'text', header: t('belbinEditor.colStatement'), cell: (item) => item.text.ru || '—' },
    { key: 'role', header: t('belbinEditor.colRole'), width: '176px', cell: (item) => item.role },
  ];

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: t('belbinEditor.crumb') }]}
        title="Belbin (BTRSPI)"
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            {t('belbinEditor.meta')}
          </p>
        }
        actions={dirty && <UnsavedBadge />}
      />

      <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label={t('belbinEditor.sectionsNav')} className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {sectionsRu.map((sec, idx) => (
            <button
              key={sec.section}
              type="button"
              onClick={() => selectSection(idx)}
              className={cn(
                MONO_LABEL,
                'text-left px-3.5 py-2.5 rounded-[14px] whitespace-nowrap lg:whitespace-normal transition-colors flex-shrink-0 lg:w-full',
                activeSectionIdx === idx
                  ? 'field-tile text-brand font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-hover',
              )}
            >
              {t('belbinEditor.section', { n: sec.section })}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-5 min-w-0">
          <AdminCard title={t('belbinEditor.sectionTitle')} description={t('belbinEditor.sectionTitleHint')}>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <AdminField label="RU">
                {({ id, describedBy }) => (
                  <textarea
                    id={id}
                    aria-describedby={describedBy}
                    className={cn(ADMIN_TEXTAREA, 'min-h-[60px]')}
                    value={activeSectionRu.title.ru}
                    onChange={(e) => setSectionTitle('ru', e.target.value)}
                  />
                )}
              </AdminField>
              <AdminField label="KK">
                {({ id, describedBy }) => (
                  <textarea
                    id={id}
                    aria-describedby={describedBy}
                    className={cn(ADMIN_TEXTAREA, 'min-h-[60px]')}
                    value={activeSectionKk.title.kk}
                    onChange={(e) => setSectionTitle('kk', e.target.value)}
                  />
                )}
              </AdminField>
            </div>
          </AdminCard>

          {selectedItemIdx === null ? (
            <AdminCard title={t('belbinEditor.statements')} description={t('belbinEditor.statementsHint')}>
              <AdminInlineItemTable label={t('belbinEditor.statementsTable')} columns={columns} rows={activeSectionRu.items} onRowClick={setSelectedItemIdx} />
            </AdminCard>
          ) : (
            <AdminCard
              title={t('belbinEditor.statement', { id: activeSectionRu.items[selectedItemIdx].id })}
              description={t('belbinEditor.statementRole', { role: activeSectionRu.items[selectedItemIdx].role })}
              aside={<BackButton onClick={() => setSelectedItemIdx(null)} />}
            >
              <div className="grid gap-3.5 sm:grid-cols-2">
                <AdminField label="RU">
                  {({ id, describedBy }) => (
                    <textarea
                      id={id}
                      aria-describedby={describedBy}
                      autoFocus
                      className={cn(ADMIN_INPUT, 'min-h-[120px] resize-y')}
                      value={activeSectionRu.items[selectedItemIdx].text.ru}
                      onChange={(e) => setItemText('ru', selectedItemIdx, e.target.value)}
                    />
                  )}
                </AdminField>
                <AdminField label="KK">
                  {({ id, describedBy }) => (
                    <textarea
                      id={id}
                      aria-describedby={describedBy}
                      className={cn(ADMIN_INPUT, 'min-h-[120px] resize-y')}
                      value={activeSectionKk.items[selectedItemIdx].text.kk}
                      onChange={(e) => setItemText('kk', selectedItemIdx, e.target.value)}
                    />
                  )}
                </AdminField>
              </div>
            </AdminCard>
          )}
        </div>
      </div>

      <AdminSaveBar dirty={dirty} saving={saving} changedLabels={[]} onSave={() => save()} onReset={reset} state={state} />
    </>
  );
}

function UnsavedBadge() {
  const { t } = useTranslation('admin');
  return (
    <span className={cn(MONO_LABEL, 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-warning-subtle text-warning')}>
      <span className="w-1.5 h-1.5 rounded-full bg-warning" aria-hidden="true" />
      {t('belbinEditor.unsaved')}
    </span>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('admin');
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-body-sm font-medium text-secondary hover:text-brand transition-colors"
    >
      <ArrowLeft size={14} />
      {t('belbinEditor.backToList')}
    </button>
  );
}
