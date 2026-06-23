"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";

const STATIC_LANES: {
  id: string;
  y: number;
  duration: number;
  fontSize: string;
}[] = [
  { id: "l1",  y: 3,  duration: 28, fontSize: "12px" },
  { id: "l2",  y: 11, duration: 36, fontSize: "10px" },
  { id: "l3",  y: 20, duration: 22, fontSize: "15px" },
  { id: "l4",  y: 68, duration: 32, fontSize: "11px" },
  { id: "l5",  y: 78, duration: 25, fontSize: "13px" },
  { id: "l6",  y: 88, duration: 38, fontSize: "10px" },
  { id: "l7",  y: 30, duration: 45, fontSize: "17px" },
  { id: "l8",  y: 39, duration: 20, fontSize: "10px" },
  { id: "l9",  y: 49, duration: 34, fontSize: "14px" },
  { id: "l10", y: 59, duration: 27, fontSize: "11px" },
];

interface DBReason {
  id: string;
  text: string;
  lane_index: number;
  is_static: boolean;
}

export default function WatermarkLayer() {
  const [approved, setApproved] = useState<DBReason[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase
      .from("reasons")
      .select("id, text, lane_index, is_static")
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
          if (!row.is_static) {
            setNewIds((prev) => new Set(prev).add(row.id));
            setTimeout(() => {
              setNewIds((prev) => {
                const next = new Set(prev);
                next.delete(row.id);
                return next;
              });
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => { getSupabaseClient().removeChannel(channel); };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {STATIC_LANES.map((lane, laneIdx) => {
        const laneItems = approved
          .filter((r) => r.lane_index === laneIdx)
          .map((r) => ({ text: `${r.text}_//`, isStatic: r.is_static, id: r.id }));

        if (laneItems.length === 0) return null;

        const doubled = [...laneItems, ...laneItems];

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
                    initial={!item.isStatic && newIds.has(item.id) ? { opacity: 0, scale: 0.9 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{
                      fontFamily: "var(--font-neue-machina), sans-serif",
                      fontSize: lane.fontSize,
                      color: item.isStatic ? "#4A6E2D" : "#9ACE6A",
                      whiteSpace: "nowrap",
                      opacity: item.isStatic ? 0.75 : 0.9,
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
