"use client";

import { useParams } from "next/navigation";

import QuestionEditorPage from "@/app/banks/components/question-editor-page";

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>();
  const questionId = typeof params.id === "string" ? params.id : undefined;

  return <QuestionEditorPage initialMode="edit" initialQuestionId={questionId} />;
}
