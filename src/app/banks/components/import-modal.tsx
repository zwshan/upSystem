"use client";

import { ChangeEvent, useState } from "react";

import { parseImportFile } from "@/app/banks/utils/import-file";
import styles from "@/app/banks/banks.module.css";

type ImportResult = {
  importedCount: number;
  validCount: number;
  skippedCount: number;
  errorCount: number;
  dryRun: boolean;
  importedIds?: string[];
  errors: Array<{
    index: number;
    message: string;
  }>;
};

export type ImportSummary = {
  importedCount: number;
  skippedCount: number;
  errorCount: number;
};

type ImportModalProps = {
  open: boolean;
  bankId?: string;
  onClose: () => void;
  onImported?: (summary: ImportSummary) => void;
};

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export default function ImportModal({ open, bankId, onClose, onImported }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [resolvedBankId, setResolvedBankId] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<unknown[] | null>(null);
  const [previewResult, setPreviewResult] = useState<ImportResult | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  function resetState() {
    setFile(null);
    setResolvedBankId(null);
    setParsedItems(null);
    setPreviewResult(null);
    setTotalCount(0);
    setIsPreviewing(false);
    setIsImporting(false);
    setError(null);
  }

  function handleClose() {
    if (isPreviewing || isImporting) {
      return;
    }

    resetState();
    onClose();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setResolvedBankId(null);
    setParsedItems(null);
    setPreviewResult(null);
    setTotalCount(0);
    setError(null);
  }

  async function handlePreview() {
    if (!file) {
      setError("请先选择 JSON 文件");
      return;
    }

    setError(null);
    setIsPreviewing(true);

    try {
      const targetBankId = await resolveImportBankId();
      const items = await parseImportFile(file);
      setResolvedBankId(targetBankId);
      setParsedItems(items);
      setTotalCount(items.length);

      const response = await fetch("/api/questions/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bankId: targetBankId,
          items,
          dryRun: true,
          skipInvalid: true
        })
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "预检失败，请重试"));
      }

      const result = (await response.json()) as ImportResult;
      setPreviewResult(result);
    } catch (previewError) {
      setPreviewResult(null);
      setError(previewError instanceof Error ? previewError.message : "预检失败，请重试");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleImport() {
    if (!parsedItems || !previewResult) {
      return;
    }

    setError(null);
    setIsImporting(true);

    try {
      const targetBankId = resolvedBankId ?? (await resolveImportBankId());

      const response = await fetch("/api/questions/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bankId: targetBankId,
          items: parsedItems,
          dryRun: false,
          skipInvalid: true
        })
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "导入失败，请重试"));
      }

      const result = (await response.json()) as ImportResult;
      onImported?.({
        importedCount: result.importedCount,
        skippedCount: result.skippedCount,
        errorCount: result.errorCount
      });
      handleClose();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "导入失败，请重试");
    } finally {
      setIsImporting(false);
    }
  }

  async function resolveImportBankId(): Promise<string> {
    if (bankId) {
      return bankId;
    }

    const response = await fetch("/api/banks");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response, "请先选择题库"));
    }

    const data = (await response.json()) as {
      items?: Array<{
        id: string;
      }>;
    };

    let target = data.items?.[0]?.id;
    if (!target) {
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
        throw new Error(await readErrorMessage(createResponse, "请先选择题库"));
      }
      const created = (await createResponse.json()) as { id: string };
      target = created.id;
    }

    return target;
  }

  return (
    <div className={styles.importMask}>
      <div role="dialog" aria-label="导入 JSON" className={styles.importDialog}>
        <div className={styles.importContent}>
          <h2 className={styles.importTitle}>导入 JSON</h2>
          <p className={styles.importHint}>上传文件后先预检，再确认导入。</p>

          <div className={`${styles.field} ${styles.importField}`}>
            <label className={`${styles.label} ${styles.importLabel}`} htmlFor="importFile">
              JSON 文件
            </label>
            <input
              id="importFile"
              className={styles.importFileInput}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
            />
            {file ? <p className={styles.importInfo}>已选择：{file.name}</p> : null}
          </div>

          <div className={styles.importActions}>
            <button
              className={`${styles.btn} ${styles.importActionBtn}`}
              type="button"
              onClick={handlePreview}
              disabled={!file || isPreviewing || isImporting}
            >
              {isPreviewing ? "预检中..." : "开始预检"}
            </button>
            <button
              className={`${styles.btn} ${styles.importActionBtn}`}
              type="button"
              onClick={handleImport}
              disabled={!previewResult || isPreviewing || isImporting}
            >
              {isImporting ? "导入中..." : "确认导入"}
            </button>
            <button
              className={`${styles.btn} ${styles.importActionBtn}`}
              type="button"
              onClick={handleClose}
              disabled={isPreviewing || isImporting}
            >
              关闭
            </button>
          </div>

          {error ? (
            <p role="alert" className={`${styles.formError} ${styles.importFeedback}`}>
              {error}
            </p>
          ) : null}

          {previewResult ? (
            <div className={styles.importReport}>
              <div className={styles.importStats}>
                <span>总数：{totalCount}</span>
                <span>可导入：{previewResult.validCount}</span>
                <span>错误：{previewResult.errorCount}</span>
              </div>
              {previewResult.errors.length > 0 ? (
                <ul className={styles.importErrors}>
                  {previewResult.errors.map((item) => (
                    <li key={`${item.index}-${item.message}`}>#{item.index + 1} {item.message}</li>
                  ))}
                </ul>
              ) : (
                <p className={`${styles.formSuccess} ${styles.importFeedback}`}>预检通过，无错误项。</p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
