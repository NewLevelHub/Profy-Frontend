import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminField } from '@/shared/ui/admin/AdminField';
import { AdminSaveBar } from '@/shared/ui/admin/AdminSaveBar';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_META, ADMIN_TEXTAREA } from '@/shared/ui/admin/density';
import { useAsturVersionEditor } from './hooks/useAsturVersionEditor';
import { AsturIssuesPanel } from './components/AsturIssuesPanel';
import { AsturPublishModal } from './components/AsturPublishModal';
import { AsturDiffList } from './components/AsturDiffList';
import { AsturVersionContent } from './components/AsturVersionContent';

/** One bank version: an editable draft (text + options + keys, validated by
 *  the server, published with key confirmations) or a read-only published
 *  version. */
export default function AdminAsturVersionPage() {
  const { t } = useTranslation('admin');
  const { versionId = '' } = useParams<{ versionId: string }>();
  const editor = useAsturVersionEditor(versionId);
  const { version, document, isDraft } = editor;

  if (editor.isError) return <AdminError message={t('astur.version.loadError')} />;
  if (editor.isLoading || !version || !document) return <AdminLoading label={t('astur.version.loading')} />;

  const title = isDraft ? t('astur.version.draftTitle') : t('astur.version.versionTitle', { version: version.version });
  const canPublish = isDraft && !editor.dirty && version.has_changes && version.issues.length === 0;

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: t('astur.versions.crumb'), to: '/admin/content/tests' }, { label: title }]}
        title={title}
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            {isDraft
              ? t('astur.version.draftMeta')
              : t('astur.version.publishedMeta', {
                  date: version.published_at
                    ? formatDate(version.published_at, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—',
                  attempts: version.attempt_count,
                  hash: version.content_hash?.slice(0, 12),
                })}
          </p>
        }
        actions={
          isDraft ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={editor.discardDraft}>
                {t('astur.version.deleteDraft')}
              </Button>
              <Button variant="primary" size="sm" onClick={editor.openPublish} disabled={!canPublish}>
                {t('astur.version.publish')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AdminBadge tone="quiet">{t('astur.version.readOnly')}</AdminBadge>
              <Button variant="ghost" size="sm" onClick={editor.branchNewDraft}>
                {t('astur.version.branchDraft')}
              </Button>
            </div>
          )
        }
      />

      {editor.actionError && <p className={cn(ADMIN_META, 'text-danger m-0')}>{editor.actionError}</p>}

      {isDraft && (
        <>
          <AsturIssuesPanel
            issues={version.issues}
            stale={editor.docDirty}
            hasChanges={version.has_changes}
            onSelect={editor.selectItem}
          />
          <AdminField label={t('astur.version.notes')}>
            {({ id }) => (
              <textarea
                id={id}
                className={ADMIN_TEXTAREA}
                value={editor.notes}
                onChange={(e) => editor.setNotes(e.target.value)}
                placeholder={t('astur.version.notesPlaceholder')}
              />
            )}
          </AdminField>
        </>
      )}

      <AsturVersionContent editor={editor} document={document} readOnly={!isDraft} />

      <AsturDiffList versionId={versionId} />

      {isDraft && (
        <AdminSaveBar
          dirty={editor.dirty}
          saving={editor.saving}
          changedLabels={[]}
          onSave={() => void editor.saveAll()}
          onReset={editor.reset}
          state={editor.saveState}
        />
      )}

      <AsturPublishModal
        open={editor.publishOpen}
        keyChangedItemIds={version.key_changed_item_ids}
        publishing={editor.publishing}
        issues={editor.publishIssues}
        onPublish={editor.publish}
        onClose={editor.closePublish}
      />
    </>
  );
}
