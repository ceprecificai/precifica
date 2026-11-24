"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { List, X } from "@phosphor-icons/react";

export interface LoadingBarRef {
  start: () => void;
  finish: () => void;
}

export const LoadingBar = forwardRef<LoadingBarRef>((_, ref) => {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  useImperativeHandle(ref, () => ({
    start: () => {
      setActive(true);
      setProgress(10);
    },
    finish: () => {
      setProgress(100);
      setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 500);
    },
  }));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (active && progress < 90) {
      timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 10, 90));
      }, 200);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [active, progress]);

  if (!active && progress === 0) return null;

  return (
    <div className="fixed left-0 top-0 z-[9999] h-[2px] w-full">
      <div
        className="h-full bg-neutral-900 transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});

LoadingBar.displayName = "LoadingBar";

interface DashboardHeaderProps {
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

const navigationItems = [
  { title: "Precificação", href: "/dashboard/precificacao" },
  { title: "Custos", href: "/dashboard/custos" },
];

export default function DashboardHeader(_props: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const loadingRef = useRef<LoadingBarRef>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sombra reforçada apenas quando o usuário rola a página.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu com Esc e trava o scroll do body enquanto ele está aberto.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);

  // Fecha o menu mobile ao voltar para o desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;

    e.preventDefault();
    setMobileMenuOpen(false);

    if (pathname === href) return;

    loadingRef.current?.start();
    router.push(href);

    setTimeout(() => {
      loadingRef.current?.finish();
    }, 600);
  };

  return (
    <>
      <LoadingBar ref={loadingRef} />

      <header
        className={`sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
          scrolled
            ? "shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-10px_rgb(0_0_0/0.12)]"
            : "shadow-[0_1px_2px_rgb(0_0_0/0.03),0_2px_8px_-4px_rgb(0_0_0/0.06)]"
        }`}
      >
        {/* MOBILE */}
        <div className="flex h-16 items-center justify-between px-4 md:hidden">
          <div className="relative h-8 w-[140px]">
            <Image
              src="/header/precifica.png"
              alt="Precifica"
              fill
              priority
              sizes="140px"
              draggable={false}
              className="select-none object-contain object-left"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-neutral-900 transition-all duration-200 hover:bg-neutral-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
          >
            <List className="h-5 w-5" />
          </button>
        </div>

        {/* DESKTOP — grid de 3 colunas para manter a navegação realmente centralizada */}
        <div className="mx-auto hidden h-16 max-w-[1880px] grid-cols-3 items-center px-6 md:grid lg:px-8">
          <div className="relative h-10 w-[180px]">
            <Image
              src="/header/precifica.png"
              alt="Precifica"
              fill
              priority
              sizes="180px"
              draggable={false}
              className="select-none object-contain object-left"
            />
          </div>

          <nav className="flex items-center justify-center">
            <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-50 p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.04)]">
              {navigationItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavigate(e, item.href)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 ${
                      active
                        ? "bg-neutral-900 text-white shadow-[0_2px_8px_-2px_rgb(0_0_0/0.35)]"
                        : "text-neutral-600 hover:bg-white hover:text-neutral-900 hover:shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div aria-hidden className="justify-self-end" />
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-neutral-900/30 backdrop-blur-[2px] transition-opacity md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="fixed left-0 top-0 z-50 flex h-dvh w-[300px] max-w-[85vw] flex-col bg-white shadow-[0_24px_60px_-20px_rgb(0_0_0/0.25)] md:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-4">
              <span className="text-sm font-semibold tracking-tight text-neutral-900">
                Navegação
              </span>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-neutral-900 transition-all duration-200 hover:bg-neutral-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-3">
              {navigationItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavigate(e, item.href)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-medium transition-all duration-200 ${
                      active
                        ? "bg-neutral-900 text-white shadow-[0_4px_12px_-4px_rgb(0_0_0/0.35)]"
                        : "text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    {item.title}
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
