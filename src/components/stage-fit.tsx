"use client";

import { useEffect, useRef } from "react";

/** Высота липкой шапки на компьютере и вертикальные отступы закреплённого блока (.stage-reveal) */
const HEADER = 76;
const PADDING = 32;

/**
 * Помечает блоки сцены, которые не помещаются в экран, классом stage-tall: такой блок
 * не закрепляется, а просто проезжает с появлением — иначе его низ был бы обрезан.
 * Нужен, потому что содержимое из админки (текст рекорда, промо) бывает разной длины.
 * Ищет блоки своей сцены — родителя, в который вставлен.
 */
export function StageFit() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = ref.current?.parentElement;
    if (!stage) return;
    const scenes = [...stage.querySelectorAll<HTMLElement>(":scope > .stage-scene")];
    const fit = () => {
      const available = window.innerHeight - HEADER - PADDING;
      for (const scene of scenes) {
        const content = scene.querySelector<HTMLElement>(".stage-reveal > *");
        scene.classList.toggle("stage-tall", Boolean(content && content.offsetHeight > available));
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    for (const scene of scenes) {
      const content = scene.querySelector(".stage-reveal > *");
      if (content) observer.observe(content);
    }
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return <span ref={ref} hidden />;
}
