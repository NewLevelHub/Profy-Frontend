import { useParams } from 'react-router';
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
  const { versionId = '' } = useParams<{ versionId: string }>();
  const editor = useAsturVersionEditor(versionId);
  const { version, document, isDraft } = editor;

  if (editor.isError) return <AdminError message="Не удалось загрузить версию банка." />;
  if (editor.isLoading || !version || !document) return <AdminLoading label="Загрузка версии…" />;

  const title = isDraft ? 'Черновик банка АСТУР' : `Версия v${version.version}`;
  const canPublish = isDraft && !editor.dirty && version.has_changes && version.issues.length === 0;

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: 'АСТУР — версии банка', to: '/admin/content/tests' }, { label: title }]}
        title={title}
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            {isDraft
              ? 'Сохраните черновик, исправьте замечания и опубликуйте — опубликованная версия больше не меняется.'
              : `Опубликована ${version.published_at ? new Date(version.published_at).toLocaleString('ru-RU') : '—'} · попыток: ${version.attempt_count} · хеш ${version.content_hash?.slice(0, 12)}`}
          </p>
        }
        actions={
          isDraft ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={editor.discardDraft}>
                Удалить черновик
              </Button>
              <Button variant="primary" size="sm" onClick={editor.openPublish} disabled={!canPublish}>
                Опубликовать
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AdminBadge tone="quiet">только чтение</AdminBadge>
              <Button variant="ghost" size="sm" onClick={editor.branchNewDraft}>
                Изменить в новом черновике
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
          <AdminField label="Комментарий к версии">
            {({ id }) => (
              <textarea
                id={id}
                className={ADMIN_TEXTAREA}
                value={editor.notes}
                onChange={(e) => editor.setNotes(e.target.value)}
                placeholder="Что изменено и почему"
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
