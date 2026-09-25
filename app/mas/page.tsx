import { redirect } from "next/navigation";

// /mas ya no es una página propia: el navbar ofrece las 5 secciones como
// dropdown (ver components/home/Navbar.tsx). Quien entre a /mas directo
// (link viejo, favorito) cae en la primera.
export default function MasIndexPage() {
  redirect("/mas/edu-hub");
}
