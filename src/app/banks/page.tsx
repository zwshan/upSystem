"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import BatchToolbar from "@/app/banks/components/batch-toolbar";
import ImportModal, { ImportSummary } from "@/app/banks/components/import-modal";

import styles from "./banks.module.css";

type QuestionItem = {
  id: string;
  summary: string;
  questionType: string;
  scoreValue: number;
};

type BankItem = {
  id: string;
  name: string;
};

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export default function BanksPage() {
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [activeBankId, setActiveBankId] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const createHref = activeBankId ? `/banks/new?bankId=${encodeURIComponent(activeBankId)}` : "/banks/new";

  const filteredItems = useMemo(() => {
    const key = keyword.trim();
    if (!key) return items;
    return items.filter((item) => item.summary.includes(key) || item.questionType.includes(key));
  }, [items, keyword]);

  useEffect(() => {
    void loadBanks();
  }, []);

  useEffect(() => {
    if (!activeBankId) {
      setItems([]);
      return;
    }

    void loadQuestions(activeBankId);
  }, [activeBankId]);

  async function loadBanks() {
    setError(null);

    try {
      const response = await fetch("/api/banks");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "题库加载失败"));
      }

      const data = (await response.json()) as { items?: BankItem[] };
      let bankItems = data.items ?? [];

      if (bankItems.length === 0) {
        const createResponse = await fetch("/api/banks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "默认题库",
            description: "自动创建的默认题库"
          })
        });

        if (!createResponse.ok) {
          throw new Error(await readErrorMessage(createResponse, "默认题库创建失败"));
        }

        const createdBank = (await createResponse.json()) as BankItem;
        bankItems = [createdBank];
      }

      setBanks(bankItems);
      setActiveBankId((current) => {
        if (current && bankItems.some((item) => item.id === current)) {
          return current;
        }
        return bankItems[0]?.id ?? "";
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "题库加载失败");
    }
  }

  async function loadQuestions(bankId: string) {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        bankId,
        page: "1",
        pageSize: "100"
      });

      const response = await fetch(`/api/questions/list?${query.toString()}`);
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "题目列表加载失败"));
      }

      const data = (await response.json()) as { items?: QuestionItem[] };
      setItems(data.items ?? []);
      setSelectedIds([]);
    } catch (loadError) {
      setItems([]);
      setError(loadError instanceof Error ? loadError.message : "题目列表加载失败");
    } finally {
      setLoading(false);
    }
  }

  function handleImported(summary: ImportSummary) {
    setImportSummary(`已导入 ${summary.importedCount} 条，跳过 ${summary.skippedCount} 条`);
    if (activeBankId) {
      void loadQuestions(activeBankId);
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function handleBatchDelete() {
    if (selectedIds.length === 0) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/questions/batch-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ids: selectedIds
        })
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "批量删除失败"));
      }

      setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "批量删除失败");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main data-theme="glass-dark" className={styles.page}>
      <div className={styles.shell}>
        <h1 className={styles.title}>题库管理</h1>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="搜索摘要或问题"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <select
            className={styles.select}
            aria-label="当前题库"
            value={activeBankId}
            onChange={(event) => setActiveBankId(event.target.value)}
          >
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
          <Link className={styles.btn} href={createHref}>
            新建题目
          </Link>
          <button className={styles.btn} type="button" onClick={() => setImportOpen(true)}>
            导入 JSON
          </button>
        </div>

        <div className={styles.sectionTitle}>
          <BatchToolbar
            selectedCount={selectedIds.length}
            deleting={deleting}
            onDelete={handleBatchDelete}
          />
        </div>

        {error ? <p className={styles.formError}>{error}</p> : null}
        {importSummary ? <p className={styles.formSuccess}>{importSummary}</p> : null}
        {loading ? <p className={styles.drawerInfo}>加载中...</p> : null}

        {!loading && filteredItems.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>选择</th>
                <th>摘要</th>
                <th>题型</th>
                <th>分值</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelected(item.id)}
                    />
                  </td>
                  <td>{item.summary}</td>
                  <td>{item.questionType}</td>
                  <td>{item.scoreValue}</td>
                  <td>
                    <Link className={styles.btn} href={`/banks/${item.id}/edit`}>
                      编辑
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !loading ? (
          <p className={styles.empty}>当前筛选无结果。</p>
        ) : null}

        <ImportModal
          open={importOpen}
          bankId={activeBankId}
          onClose={() => setImportOpen(false)}
          onImported={handleImported}
        />
      </div>
    </main>
  );
}
