import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { CommunityPage } from "@/modules/community/components/community-page";
import { RefreshCw } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HelpCommunityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <RefreshCw className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <CommunityPage />
    </Suspense>
  );
}
