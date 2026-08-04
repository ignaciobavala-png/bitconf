import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = {
  text: string;
  status: string;
  flagged: boolean;
  lane_index: number;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format") === "txt" ? "txt" : "csv";

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("reasons")
    .select("text, status, flagged, lane_index, created_at")
    .eq("is_static", false)
    .order("created_at", { ascending: false });

  if (error) {
    return new Response("No se pudieron leer las razones", { status: 500 });
  }

  const rows = (data ?? []) as Row[];
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "txt") {
    // Solo las aprobadas, una frase por línea
    const body = rows
      .filter((r) => r.status === "approved")
      .map((r) => r.text)
      .join("\n");

    return new Response(`﻿${body}\n`, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="hodl-frases-${stamp}.txt"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const header = ["Frase", "Estado", "Flagged", "Carril", "Fecha"];
  const lines = [
    header.map(csvCell).join(","),
    ...rows.map((r) =>
      [
        csvCell(r.text),
        csvCell(STATUS_LABELS[r.status] ?? r.status),
        csvCell(r.flagged ? "sí" : "no"),
        csvCell(String(r.lane_index + 1)),
        csvCell(formatDate(r.created_at)),
      ].join(",")
    ),
  ];

  // BOM para que Excel abra los acentos bien
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hodl-razones-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
