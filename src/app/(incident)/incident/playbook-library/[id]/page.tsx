"use client";

import React from "react";
import { useParams } from "next/navigation";
import PlaybookDetailPage from "../_modules/components/detail/PlaybookDetailPage";

export default function Page(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return <PlaybookDetailPage playbookId={id ?? ""} />;
}
