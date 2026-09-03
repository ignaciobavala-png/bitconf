import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import MyAgendaButton from "@/components/home/MyAgendaButton";
import SpeakerProfileView from "@/components/speakers/SpeakerProfileView";
import { getSpeakerBySlug, getSpeakerSlugs } from "@/lib/speakers/queries";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getSpeakerSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const speaker = await getSpeakerBySlug(slug);
  if (!speaker) return { title: "Speaker — LABITCONF 2026" };

  const subtitle = [speaker.role, speaker.company].filter(Boolean).join(" · ");
  return {
    title: `${speaker.name} — LABITCONF 2026`,
    description: speaker.bio ?? subtitle ?? undefined,
    openGraph: {
      title: `${speaker.name} — LABITCONF 2026`,
      description: speaker.bio ?? subtitle ?? undefined,
      images: speaker.photoUrl ? [speaker.photoUrl] : undefined,
    },
  };
}

export default async function SpeakerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const speaker = await getSpeakerBySlug(slug);

  // 404 real y no una página vacía: un slug que no está publicado no debe
  // confirmarle a nadie que ese speaker existe en la planilla.
  if (!speaker) notFound();

  return (
    <main className="relative min-h-screen" style={{ background: "#171616" }}>
      <Navbar />
      <SpeakerProfileView speaker={speaker} />
      <Footer />
      <QaChatWidget />
      <MyAgendaButton />
    </main>
  );
}
