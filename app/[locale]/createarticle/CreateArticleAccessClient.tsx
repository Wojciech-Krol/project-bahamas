"use client";

import { Link } from "../../../src/i18n/navigation";
import { Icon } from "../../components/Icon";

type CreateArticleAccessCopy = {
  lock: {
    title: string;
    description: string;
    codePlaceholder: string;
    submitButton: string;
    invalidCode: string;
    backToHome: string;
  };
};

export default function CreateArticleAccessClient({
  locale,
  copy,
  invalidCode,
}: {
  locale: string;
  copy: CreateArticleAccessCopy;
  invalidCode: boolean;
}) {
  const unlockAction = `/${locale}/createarticle/unlock`;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-surface px-4 py-8 text-on-surface">
      <div className="w-full max-w-lg rounded-2xl border border-outline/30 bg-surface-container-low p-8 shadow-sm md:p-10">
        <form className="flex flex-col items-center gap-6" action={unlockAction} method="post">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-outline/40">
            <Icon name="lock" className="text-3xl text-on-surface" />
          </div>

          <div className="space-y-3 text-center">
            <h1 className="font-headline text-2xl font-bold tracking-tight">{copy.lock.title}</h1>
            <p className="text-sm text-on-surface/70 md:text-base">{copy.lock.description}</p>
          </div>

          <div className="w-full space-y-2">
            <input
              type="password"
              name="code"
              placeholder={copy.lock.codePlaceholder}
              className="w-full rounded-xl border border-outline/40 bg-surface-container-lowest px-4 py-4 text-base outline-none focus:border-primary"
            />
            {invalidCode ? (
              <p className="text-sm text-error" role="alert">
                {copy.lock.invalidCode}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary"
          >
            {copy.lock.submitButton}
          </button>

          <Link
            href="/"
            locale={locale}
            className="text-sm text-on-surface/60 underline underline-offset-4"
          >
            {copy.lock.backToHome}
          </Link>
        </form>
      </div>
    </main>
  );
}
