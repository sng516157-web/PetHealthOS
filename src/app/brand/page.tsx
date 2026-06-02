"use client";

import * as React from "react";
import Image from "next/image";
import {
  Plus,
  Bell,
  Home,
  PawPrint,
  User,
  CalendarDays,
  ShieldCheck,
  Heart,
  ArrowRight,
} from "lucide-react";
import { PawSureLogo, PawSureMark, PawSureMarkTile } from "@/components/PawSureLogo";
import { PetAvatar } from "@/components/ui";
import {
  Button,
  Input,
  Textarea,
  SearchInput,
  Chip,
  StatusBadge,
  Card,
  PetCard,
  ProfileCard,
  Modal,
  BottomSheet,
  ToastProvider,
  useToast,
  TopAppBar,
  BottomTabBar,
  EmptyState,
  OnboardingCard,
} from "@/components/pawsure";

const SWATCHES = [
  { name: "Sage Trust", hex: "#6FAF98", className: "bg-sage" },
  { name: "Forest Calm", hex: "#24594C", className: "bg-forest" },
  { name: "Soft Paper", hex: "#FFF8EF", className: "bg-paper border border-border" },
  { name: "Sand", hex: "#EEDBC2", className: "bg-sand" },
  { name: "Ink", hex: "#26302D", className: "bg-ink" },
  { name: "Promise Gold", hex: "#F4C96B", className: "bg-gold" },
  { name: "Calm Blue", hex: "#9CC8D1", className: "bg-blue" },
  { name: "Gentle Alert", hex: "#E88975", className: "bg-alert" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-forest">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ToastButtons() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast({ title: "Saved", description: "Your changes are stored.", tone: "success" })
        }
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ title: "Heads up", description: "Vaccine due soon.", tone: "warn" })}
      >
        Warn toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ title: "Couldn’t send", tone: "alert" })}
      >
        Alert toast
      </Button>
    </div>
  );
}

function Showcase() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [chip, setChip] = React.useState("dogs");
  const [tab, setTab] = React.useState("home");

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      {/* Hero */}
      <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-soft">
        <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-brand-500/15 to-sand/30 px-6 py-12 text-center">
          <PawSureMark className="h-16 w-16" />
          <div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-extrabold tracking-[-0.03em] text-forest">
                PawSure
              </span>
              <span className="font-cn text-2xl font-bold text-forest">宠诺</span>
            </div>
            <p className="mt-2 text-sm font-medium text-muted">
              Every pet comes with confidence. · 让每一次托付，都更安心。
            </p>
          </div>
        </div>
        <div className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-brand-700">
          Brand kit & UI components
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {/* Logo */}
        <Section title="Logo" description="Mark, lockup, tile and dark variants.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="flex items-center justify-center p-8">
              <PawSureLogo variant="horizontal" showTagline />
            </Card>
            <Card className="flex items-center justify-center gap-8 p-8">
              <PawSureMark className="h-14 w-14" />
              <PawSureMarkTile className="h-14 w-14" />
            </Card>
            <Card className="col-span-full flex items-center justify-center bg-ink p-8">
              {/* Dark-background lockup (provided SVG) */}
              <Image
                src="/brand/pawsure-logo-dark.svg"
                alt="PawSure 宠诺 on dark"
                width={360}
                height={85}
                priority
                unoptimized
              />
            </Card>
          </div>
        </Section>

        {/* Color */}
        <Section title="Palette" description="Cream surfaces, sage actions, forest headings.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SWATCHES.map((s) => (
              <div key={s.name} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
                <div className={`h-16 ${s.className}`} />
                <div className="px-3 py-2">
                  <p className="text-xs font-bold text-forest">{s.name}</p>
                  <p className="text-[11px] uppercase text-muted">{s.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography" description="Nunito for English, system CJK for Chinese.">
          <Card className="space-y-2 p-6">
            <p className="text-3xl font-extrabold text-forest">A warm welcome home</p>
            <p className="font-cn text-2xl font-bold text-forest">温暖的回家时刻</p>
            <p className="text-base text-foreground">
              Body text in Ink — readable, calm, and trustworthy.
            </p>
            <p className="text-sm text-muted">Muted supporting copy for hints and metadata.</p>
          </Card>
        </Section>

        {/* Buttons */}
        <Section title="Buttons" description="Primary, secondary, outline, ghost — with states.">
          <Card className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button leftIcon={<Plus size={16} />}>Add pet</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost" rightIcon={<ArrowRight size={16} />}>
                Ghost
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Card>
        </Section>

        {/* Inputs */}
        <Section title="Inputs" description="Text, search and multiline.">
          <Card className="grid gap-4 p-6 sm:grid-cols-2">
            <Input label="Pet name" placeholder="e.g. Mochi" />
            <Input label="Microchip" placeholder="000-000-000" hint="15 digits, optional." />
            <SearchInput placeholder="Search pets…" />
            <Input label="With error" placeholder="—" error="This field is required." />
            <div className="sm:col-span-2">
              <Textarea label="Notes" rows={3} placeholder="Observations, behaviour, diet…" />
            </div>
          </Card>
        </Section>

        {/* Chips & badges */}
        <Section title="Chips & status badges">
          <Card className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              {["all", "dogs", "cats", "puppies"].map((k) => (
                <Chip key={k} selected={chip === k} onClick={() => setChip(k)}>
                  {k}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="success" dot>
                Healthy
              </StatusBadge>
              <StatusBadge tone="info" dot>
                Observation
              </StatusBadge>
              <StatusBadge tone="warn" dot>
                Vaccine due
              </StatusBadge>
              <StatusBadge tone="alert" dot>
                Needs attention
              </StatusBadge>
              <StatusBadge tone="gold">
                <ShieldCheck size={12} /> Verified passport
              </StatusBadge>
              <StatusBadge tone="neutral">Transferred</StatusBadge>
            </div>
          </Card>
        </Section>

        {/* Cards */}
        <Section title="Cards" description="Base card, pet card and profile card.">
          <div className="grid gap-4 md:grid-cols-2">
            <Card interactive className="p-5">
              <h3 className="text-base font-bold text-forest">Health summary</h3>
              <p className="mt-1 text-sm text-muted">
                A soft, rounded surface on warm paper with a gentle shadow.
              </p>
            </Card>
            <PetCard
              name="Mochi"
              meta="Shiba Inu · 2 yrs"
              avatar={<PetAvatar species="DOG" name="Mochi" />}
              trailing={<StatusBadge tone="success">Healthy</StatusBadge>}
            />
            <div className="md:col-span-2">
              <ProfileCard
                avatar={<PetAvatar species="CAT" name="Luna" size="lg" />}
                title="Luna"
                subtitle="British Shorthair · Female · 3 yrs"
                badges={
                  <>
                    <StatusBadge tone="gold">
                      <ShieldCheck size={12} /> Verified
                    </StatusBadge>
                    <StatusBadge tone="info">Microchipped</StatusBadge>
                  </>
                }
                actions={
                  <>
                    <Button size="sm" leftIcon={<Heart size={15} />}>
                      Add log
                    </Button>
                    <Button size="sm" variant="outline">
                      Passport
                    </Button>
                  </>
                }
              />
            </div>
          </div>
        </Section>

        {/* Overlays */}
        <Section title="Overlays" description="Modal, bottom sheet and toasts.">
          <Card className="flex flex-wrap gap-3 p-6">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
            <Button variant="secondary" onClick={() => setSheetOpen(true)}>
              Open bottom sheet
            </Button>
            <ToastButtons />
          </Card>
        </Section>

        {/* App bars */}
        <Section title="App bars" description="Top app bar and bottom tab bar.">
          <div className="overflow-hidden rounded-3xl border border-border bg-paper shadow-soft">
            <TopAppBar
              leading={<PawSureMarkTile className="h-9 w-9" />}
              title="Mochi"
              subtitle="Shiba Inu · 2 yrs"
              actions={
                <Button size="sm" variant="ghost" aria-label="Notifications">
                  <Bell size={18} />
                </Button>
              }
            />
            <div className="px-4 py-10 text-center text-sm text-muted">Page content</div>
            <div className="relative h-20">
              <BottomTabBar
                className="!absolute"
                active={tab}
                onChange={setTab}
                items={[
                  { key: "home", label: "Home", icon: <Home size={20} /> },
                  { key: "pets", label: "Pets", icon: <PawPrint size={20} /> },
                  { key: "calendar", label: "Care", icon: <CalendarDays size={20} /> },
                  { key: "me", label: "Me", icon: <User size={20} /> },
                ]}
              />
            </div>
          </div>
        </Section>

        {/* Empty + onboarding */}
        <Section title="Empty & onboarding states">
          <div className="grid gap-4 md:grid-cols-2">
            <EmptyState
              icon={<PawPrint size={24} />}
              title="No pets yet"
              description="Add your first companion to start their lifelong health passport."
              action={<Button leftIcon={<Plus size={16} />}>Add pet</Button>}
            />
            <OnboardingCard
              art={<PawSureMark className="h-20 w-20" />}
              eyebrow="Welcome"
              title="A passport for every paw"
              description="Track health, share with confidence, and hand over a trusted record when a pet finds its family."
              steps={3}
              currentStep={0}
              actions={
                <>
                  <Button fullWidth rightIcon={<ArrowRight size={16} />}>
                    Get started
                  </Button>
                  <Button fullWidth variant="ghost">
                    I already have an account
                  </Button>
                </>
              }
            />
          </div>
        </Section>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Transfer passport"
        description="Hand Mochi’s health record to the new family. You’ll keep a read-only copy."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Confirm transfer</Button>
          </>
        }
      >
        <Input label="New owner email" placeholder="family@example.com" />
      </Modal>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Quick add">
        <div className="flex flex-col gap-2">
          <Button variant="secondary" fullWidth leftIcon={<Heart size={16} />}>
            Health log
          </Button>
          <Button variant="secondary" fullWidth leftIcon={<CalendarDays size={16} />}>
            Reminder
          </Button>
          <Button variant="secondary" fullWidth leftIcon={<ShieldCheck size={16} />}>
            Weight entry
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

export default function BrandPage() {
  return (
    <ToastProvider>
      <Showcase />
    </ToastProvider>
  );
}
