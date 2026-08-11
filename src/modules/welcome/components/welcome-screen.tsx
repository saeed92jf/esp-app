/* src/components/welcome/welcome-screen.tsx */

"use client";

import { useTranslations } from "next-intl";
import { PUBLIC_WELCOME_ITEMS } from "@/config/navigation";
import { FeatureCard } from "@/components/features/feature-card/feature-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";

/**
 * Public landing screen for unauthenticated visitors.
 */
export function WelcomeScreen(): import("react/jsx-runtime").JSX.Element {
  const tWelcome = useTranslations("Welcome");
  const tItems = useTranslations("Menu.items");
  const tDesc = useTranslations("Menu.descriptions");

  const freeItems = PUBLIC_WELCOME_ITEMS.filter((item) => item.free);
  const premiumItems = PUBLIC_WELCOME_ITEMS.filter((item) => !item.free);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-24 space-y-24">
      {/* Hero header */}
      <header className="mx-auto max-w-3xl text-center space-y-10 relative">
        <div className="absolute inset-0 -z-10 bg-primary/10 blur-[120px] rounded-full" />
        <div className="space-y-6">
          <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
            {tWelcome("title")}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed">
            {tWelcome("subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            <Link href="/register">
              {tWelcome("ctaRegister")}
              <Sparkles className="ms-2 size-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8 rounded-2xl bg-background/50 backdrop-blur-md hover:bg-muted/50 transition-all border-border/80">
            <Link href="/login">
              {tWelcome("ctaLogin")}
            </Link>
          </Button>
        </div>
      </header>

      {/* Free Services */}
      {freeItems.length > 0 && (
        <div className="space-y-8 relative">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl">
              <CheckCircle2 className="size-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{tWelcome("freeFeatures")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {freeItems.map((item) => (
              <FeatureCard
                key={item.href}
                href={item.href}
                title={tItems(item.labelKey)}
                description={tDesc(item.labelKey)}
                icon={item.icon}
                iconClassName="text-emerald-500"
                iconBgClassName="bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white transition-colors"
                borderClassName="hover:border-emerald-500/50"
              />
            ))}
          </div>
        </div>
      )}

      {/* Premium Services */}
      {premiumItems.length > 0 && (
        <div className="space-y-8 relative p-6 sm:p-10 rounded-[2.5rem] border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden shadow-2xl shadow-primary/5">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg shadow-primary/30">
              <Lock className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{tWelcome("premiumFeatures")}</h2>
              <p className="text-muted-foreground text-sm mt-1 font-medium">{tWelcome("readyToStart")}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
            {premiumItems.map((item) => (
              <FeatureCard
                key={item.href}
                href="/login" // Redirect to login since it's premium
                title={tItems(item.labelKey)}
                description={tDesc(item.labelKey)}
                icon={item.icon}
                className="opacity-95 hover:opacity-100 transition-opacity"
                cardBgClassName="bg-background/40 backdrop-blur-md"
                borderClassName="border-primary/20 hover:border-primary/50 hover:shadow-primary/10"
                iconClassName="text-primary"
                iconBgClassName="bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
