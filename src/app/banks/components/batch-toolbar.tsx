type BatchToolbarProps = {
  selectedCount: number;
  deleting?: boolean;
  onDelete: () => void;
};

export default function BatchToolbar({ selectedCount, deleting = false, onDelete }: BatchToolbarProps) {
  const disabled = selectedCount === 0 || deleting;

  return (
    <div>
      <span>批量操作</span>
      <button type="button" onClick={onDelete} disabled={disabled} style={{ marginLeft: 12 }}>
        {deleting ? "删除中..." : "批量删除"}
      </button>
    </div>
  );
}
