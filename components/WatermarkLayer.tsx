"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";

const STATIC_LANES: { id: string; y: number; duration: number; phrases: string[] }[] = [
  {
    id: "l1", y: 6, duration: 28,
    phrases: ["por mi_//", "por mis amigos_//", "porque Bitcoin es lo mejor del mundo_//", "por mi visión_//", "por la comunidad_//"],
  },
  {
    id: "l2", y: 16, duration: 36,
    phrases: ["por mi familia_//", "por la comunidad_//", "por mi futuro_//", "por la libertad_//", "por mis amigos_//"],
  },
  {
    id: "l3", y: 27, duration: 22,
    phrases: ["por la libertad_//", "por lo imposible_//", "por mis amigos_//", "por mi_//", "Bitcoin es lo mejor del mundo_//"],
  },
  {
    id: "l4", y: 66, duration: 32,
    phrases: ["por mi futuro_//", "por la comunidad_//", "por mis_//", "por mi visión_//", "porque Bitcoin_//"],
  },
  {
    id: "l5", y: 77, duration: 25,
    phrases: ["comunidad_//", "por lo imposible_//", "por mis amigos_//", "por mi visión_//", "por la libertad_//"],
  },
  {
    id: "l6", y: 88, duration: 38,
    phrases: ["por la libertad_//", "porque Bitcoin es lo mejor del mundo_//", "por mi_//", "comunidad_//", "por lo imposible_//"],
  },
];

interface DBReason {
  id: string;
  text: string;
  lane_index: number;
}

export default function WatermarkLayer() {
  const [approved, setApproved] = useState<DBReason[]>([]);
  // IDs de frases nuevas para animarlas al entrar
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Cargar aprobadas existentes al montar
    supabase
      .from("reasons")
      .select("id, text, lane_index")
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setApproved(data);
      });

    // Suscripción Realtime: solo filas que pasan a 'approved'
    const channel = supabase
      .channel("approved-reasons")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reasons",
          filter: "status=eq.approved",
        },
        (payload) => {
          const row = payload.new as DBReason;
          setApproved((prev) => {
            if (prev.find((r) => r.id === row.id)) return prev;
            return [...prev, row];
          });
          setNewIds((prev) => new Set(prev).add(row.id));
          // Quitar de "nuevas" después de la animación
          setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev);
              next.delete(row.id);
              return next;
            });
          }, 2000);
        }
      )
      .subscribe();

    return () => { getSupabaseClient().removeChannel(channel); };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {STATIC_LANES.map((lane) => {
        const laneApproved = approved.filter((r) => r.lane_index === STATIC_LANES.indexOf(lane));
        const userPhrases = laneApproved.map((r) => ({ text: `${r.text}_//`, isUser: true, id: r.id }));
        const staticPhrases = lane.phrases.map((p) => ({ text: p, isUser: false, id: p }));
        const all = [...staticPhrases, ...userPhrases];
        const doubled = [...all, ...all];

        return (
          <div key={lane.id} className="absolute w-full" style={{ top: `${lane.y}%` }}>
            <motion.div
              className="flex items-center"
              style={{ gap: "80px", width: "max-content" }}
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: lane.duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
            >
              {doubled.map((item, i) => (
                <AnimatePresence key={`${item.id}-${i}`}>
                  <motion.span
                    initial={item.isUser && newIds.has(item.id) ? { opacity: 0, scale: 0.9 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{
                      fontFamily: "var(--font-neue-machina), sans-serif",
                      fontSize: "12px",
                      color: item.isUser ? "#9ACE6A" : "#4A6E2D",
                      whiteSpace: "nowrap",
                      opacity: item.isUser ? 0.9 : 0.75,
                    }}
                  >
                    {item.text}
                  </motion.span>
                </AnimatePresence>
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
