import { getTranslations } from "next-intl/server";
import { TeamClient } from "@/modules/team/components/team-client";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Common" });
  return { title: `R&D Team | ${t("appName.lead")}` };
}

export default function TeamPage() {
  return (
    <main className="w-full">
      <TeamClient />
    </main>
  );
}
