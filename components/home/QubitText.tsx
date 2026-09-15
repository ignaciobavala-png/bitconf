"use client";

import type { ReactNode } from "react";

/**
 * Render mínimo de lo que devuelve el modelo.
 *
 * El widget pintaba el texto crudo, así que un `**Business**` llegaba con los
 * asteriscos a la vista. Se puede pedir en el prompt que no use markdown —y se
 * pide—, pero los modelos lo escupen igual cada tanto: la única forma de que no
 * se vea nunca es entenderlo del lado del cliente.
 *
 * Es deliberadamente chico: negrita, links y viñetas, que es todo lo que Qubit usa
 * al contestar una FAQ. No vale traer un parser de markdown entero (y su peso)
 * para una burbuja de chat.
 */

// Negrita o link. El resto del texto pasa tal cual.
const INLINE = /(\*\*[^*\n]+\*\*|\[[^\]\n]+\]\((?:https?:\/\/|mailto:)[^)\s]+\))/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((chunk, i) => {
    const key = `${keyPrefix}-${i}`;

    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return (
        <strong key={key} style={{ fontWeight: 900 }}>
          {chunk.slice(2, -2)}
        </strong>
      );
    }

    const link = /^\[([^\]]+)\]\((.+)\)$/.exec(chunk);
    if (link) {
      const [, label, href] = link;
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#ABF760", textDecoration: "underline" }}
        >
          {label}
        </a>
      );
    }

    return <span key={key}>{chunk}</span>;
  });
}

export default function QubitText({ text }: { text: string }) {
  const lines = text.split("\n");

  // Columna en vez de confiar en `white-space: pre-wrap`: las viñetas son
  // bloques flex y mezclarlas con saltos de línea preservados descuadra el
  // interlineado.
  return (
    <span className="flex flex-col">
      {lines.map((line, i) => {
        // Las viñetas se dibujan como tales en vez de dejar el guion suelto:
        // Qubit enumera bastante (qué incluye cada ticket, cómo llegar).
        const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
        if (bullet) {
          return (
            <span key={i} className="flex gap-2" style={{ paddingLeft: 2 }}>
              <span aria-hidden style={{ color: "#ABF760", flexShrink: 0 }}>
                ·
              </span>
              <span>{inline(bullet[1], `b${i}`)}</span>
            </span>
          );
        }

        // Los ### de un encabezado no aportan nada en una burbuja de chat.
        const heading = /^\s*#{1,4}\s+(.*)$/.exec(line);
        if (heading) {
          return (
            <strong key={i} style={{ fontWeight: 900 }}>
              {inline(heading[1], `h${i}`)}
            </strong>
          );
        }

        // Una línea vacía es un cambio de párrafo: sin alto propio se colapsa.
        if (!line.trim()) return <span key={i} style={{ height: "0.5em" }} />;

        return <span key={i}>{inline(line, `l${i}`)}</span>;
      })}
    </span>
  );
}
