"use client";

import { useSearchParams } from "next/navigation";

import QuestionEditorPage from "@/app/banks/components/question-editor-page";

export default function NewQuestionPage() {
  const searchParams = useSearchParams();
  const bankId = searchParams.get("bankId") ?? undefined;

  return <QuestionEditorPage initialMode="create" bankId={bankId} />;
}
