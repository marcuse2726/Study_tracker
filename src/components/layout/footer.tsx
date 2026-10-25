import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>Study Tracker · 让学习看得见</div>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-foreground">
            声明
          </Link>
        </div>
      </div>
    </footer>
  );
}
