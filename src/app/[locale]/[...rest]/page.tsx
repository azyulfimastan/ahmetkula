import { notFound } from "next/navigation";

// Tanımsız her yol, yerelleştirilmiş özel 404 sayfasını gösterir.
export default function CatchAll() {
  notFound();
}
