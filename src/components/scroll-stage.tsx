import { StageFit } from "./stage-fit";

/**
 * «Сцена» на главной: фон закреплён на весь экран (sticky), а поверх него при прокрутке
 * сменяются блоки — каждый проявляется снизу и уходит вверх.
 * Фоны: «berries» — тёмный ботанический с морошкой, «moss» — стена ресторана из мха и камня.
 * Анимация — чистый CSS, привязанный к прокрутке (animation-timeline), стили .stage-* в globals.css.
 * Без поддержки в браузере или при «уменьшении движения» блоки просто видны, фон всё так же закреплён.
 */
export function ScrollStage({ children, bg = "berries" }: { children: React.ReactNode; bg?: "berries" | "moss" }) {
  return (
    <div className="relative isolate">
      {/* Слой на всю высоту сцены, в нём фон высотой в экран «прилипает» к окну и кончается ровно с концом сцены
          (с отрицательным отступом sticky-фон вылезал бы за сцену на целый экран и закрывал следующий раздел) */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className={`sticky top-0 h-svh ${bg === "moss" ? "stage-bg-moss" : "stage-bg"}`} />
      </div>
      {/* Верх и низ сцены растворяются в цвет сайта — без шва с соседними разделами и сценами */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-[5] h-32 bg-gradient-to-b from-night to-transparent" />
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-40 bg-gradient-to-b from-transparent to-night" />
      <StageFit />
    </div>
  );
}

/**
 * Один блок сцены. На компьютере контент «прилипает» к центру экрана, пока блок прокручивается,
 * гаснет и уходит вверх — и на его месте проявляется следующий. На телефоне — блоки друг за другом.
 * Раскладка и анимация — в globals.css (.stage-scene, .stage-reveal).
 * С подписью — это отдельный раздел (section); без неё — обёртка вокруг готовой секции.
 * Последнему блоку сцены — className="stage-last": он не гаснет, а уезжает вверх вместе с фоном.
 * id — якорь (/#booking): он на самом блоке, чтобы переход по ссылке приходил к началу блока,
 * когда его контент уже проявился.
 */
export function StageScene({
  children,
  label,
  id,
  className = "",
}: {
  children: React.ReactNode;
  label?: string;
  id?: string;
  className?: string;
}) {
  const Tag = label ? "section" : "div";
  return (
    <Tag id={id} aria-label={label} className={`stage-scene ${className}`}>
      <div className="stage-reveal">{children}</div>
    </Tag>
  );
}
