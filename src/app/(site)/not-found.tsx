import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-site flex flex-1 flex-col items-center justify-center py-20 text-center lg:py-24">
      <p className="h-display text-8xl text-berry">404</p>
      <h1 className="h-display mt-5 text-4xl">Страница не найдена</h1>
      <p className="mt-3 text-muted">Возможно, она переехала. Начните с главной или меню</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-line">
          На главную
        </Link>
        <Link href="/menu" className="btn btn-berry">
          Меню
        </Link>
      </div>
    </div>
  );
}
