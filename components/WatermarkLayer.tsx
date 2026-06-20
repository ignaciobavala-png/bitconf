"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";

const STATIC_LANES: {
  id: string;
  y: number;
  duration: number;
  fontSize: string;
  phrases: string[];
}[] = [
  {
    id: "l1", y: 3, duration: 28, fontSize: "12px",
    phrases: ["por mi_//", "por mis amigos_//", "porque Bitcoin es lo mejor del mundo_//", "por mi visión_//", "por la comunidad_//"],
  },
  {
    id: "l2", y: 11, duration: 36, fontSize: "10px",
    phrases: ["por mi familia_//", "por la comunidad_//", "por mi futuro_//", "por la libertad_//", "por mis amigos_//"],
  },
  {
    id: "l3", y: 20, duration: 22, fontSize: "15px",
    phrases: ["por la libertad_//", "por lo imposible_//", "por mis amigos_//", "por mi_//", "Bitcoin es lo mejor del mundo_//"],
  },
  {
    id: "l4", y: 68, duration: 32, fontSize: "11px",
    phrases: ["por mi futuro_//", "por la comunidad_//", "por mis sats_//", "por mi visión_//", "porque Bitcoin_//"],
  },
  {
    id: "l5", y: 78, duration: 25, fontSize: "13px",
    phrases: ["comunidad_//", "por lo imposible_//", "por mis amigos_//", "por mi visión_//", "por la libertad_//"],
  },
  {
    id: "l6", y: 88, duration: 38, fontSize: "10px",
    phrases: ["por la libertad_//", "porque Bitcoin es lo mejor del mundo_//", "por mi_//", "comunidad_//", "por lo imposible_//"],
  },
  {
    id: "l7", y: 30, duration: 45, fontSize: "17px",
    phrases: ["por soberanía_//", "por el futuro de mis hijos_//", "por la desentralización_//", "por la verdad_//", "por lo que viene_//"],
  },
  {
    id: "l8", y: 39, duration: 20, fontSize: "10px",
    phrases: ["por mi_//", "por Bitcoin_//", "por la red_//", "por la comunidad_//", "por mis convicciones_//", "por la libertad financiera_//"],
  },
  {
    id: "l9", y: 49, duration: 34, fontSize: "14px",
    phrases: ["porque no hay vuelta atrás_//", "por el protocolo_//", "por mis hijos_//", "por la escasez_//", "por la revolución_//"],
  },
  {
    id: "l10", y: 59, duration: 27, fontSize: "11px",
    phrases: ["por mis valores_//", "por la red de nodos_//", "por la soberanía individual_//", "por mis sats_//", "por la cadena_//"],
  },
];

interface DBReason {
  id: string;
  text: string;
  lane_index: number;
}

export default function WatermarkLayer() {
  const [approved, setApproved] = useState<DBReason[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase
      .from("reasons")
      .select("id, text, lane_index")
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setApproved(data);
      });

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
                      fontSize: lane.fontSize,
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
