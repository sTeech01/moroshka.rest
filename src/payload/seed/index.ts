import { convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import path from "node:path";
import type { Payload } from "payload";
import { buildAboutSections } from "./about";
import { businessLunchSeed } from "./business-lunch";
import { banquetsMarkdown, pages } from "./content";

const context = { disableRevalidate: true };

/**
 * Заполняет пустую базу текущим контентом сайта (тексты, фото, настройки).
 * Срабатывает один раз: если страницы уже есть — ничего не делает.
 */
export async function seed(payload: Payload): Promise<void> {
  const { totalDocs } = await payload.count({ collection: "pages" });
  if (totalDocs > 0) return;

  payload.logger.info("[seed] Пустая база — заполняем начальным контентом");

  try {
    const editorConfig = await editorConfigFactory.default({ config: payload.config });
    const rich = (markdown: string) => convertMarkdownToLexical({ editorConfig, markdown });

    const image = async (file: string, alt: string) => {
      const doc = await payload.create({
        collection: "media",
        data: { alt },
        filePath: path.join(process.cwd(), "public", "images", "home", file),
        context,
      });
      return doc.id;
    };

    const [hero, about, kitchen, bar, vip, gallery1, gallery2] = await Promise.all([
      image("hero.webp", "Основной зал ресторана «Морошка»"),
      image("about.webp", "Стол под деревом в зале «Морошки»"),
      image("kitchen.webp", "Уха по-северному с икрой"),
      image("bar.webp", "Коктейли с морошкой"),
      image("vip.webp", "VIP-зал: зелёные бархатные кресла"),
      image("gallery-1.webp", "Зал с декором из морошки"),
      image("gallery-2.webp", "Лестница в VIP-зал с моховой стеной"),
    ]);

    for (const [slug, page] of Object.entries(pages)) {
      await payload.create({
        collection: "pages",
        data: {
          slug: slug as keyof typeof pages,
          title: page.title,
          description: page.description,
          content: page.markdown ? rich(page.markdown) : null,
          // «О ресторане» — текст с фото входа и блок о рекорде России
          sections: slug === "about" ? await buildAboutSections(payload, rich, context) : [],
        },
        context,
      });
    }

    await payload.updateGlobal({
      slug: "settings",
      data: {
        phone: "+7 (922) 067-78-87",
        // Адрес и координаты — из настроек точки в myresto (iiko)
        address: "г. Губкинский, мкр. 13, д. 80",
        hours: [
          { days: "Пн–Сб", time: "12:00–00:00" },
          { days: "Вс", time: "13:00–00:00" },
        ],
        geo: { lat: 64.436706, lng: 76.504733 },
        vk: "https://vk.ru/moroshkarest",
        // Из карточки предприятия
        legal: "ООО «Морошка», ИНН 8911031960, ОГРН 1218900001935",
      },
      context,
    });

    await payload.updateGlobal({
      slug: "delivery",
      // Время доставки (60 мин) — из myresto; мин. сумма — от заказчика; стоимость — уточнить
      data: {
        enabled: true,
        minOrderSum: 1000,
        price: 0,
        acceptFrom: "12:00",
        acceptUntil: "23:00",
        leadTimeMinutes: 60,
        slotMinutes: 30,
        deliveryTimeText: "около 60 минут",
        pickupEnabled: true,
      },
      context,
    });

    await payload.updateGlobal({
      slug: "home",
      data: {
        heroTitle: "Новый взгляд на Север",
        heroSubtitle: "Авторская северная кухня, винная карта и VIP-зал. Деловой обед, ужин с друзьями или праздник — и доставка домой.",
        heroImage: hero,
        aboutTitle: "Домашнее тепло и ресторанный сервис",
        aboutText:
          "Черновик. [Финальный текст о ресторане — кухня, продукты Ямала, команда.] Живой мох, дерево и бархат в интерьере — ощущение северного леса в центре города.",
        aboutImage: about,
        kitchenText: "Рыба и дичь Ямала, супы, горячее, десерты",
        kitchenImage: kitchen,
        barText: "Авторские коктейли, настойки, винная карта",
        barImage: bar,
        banquetTitle: "Отдельный зал для своих",
        banquetText: "Дни рождения, корпоративы, деловые ужины. Составим банкетное меню под ваш формат и бюджет.",
        banquetCapacity: "до … гостей — уточнить",
        banquetImage: vip,
        gallery: [gallery1, gallery2, hero],
      },
      context,
    });

    await payload.updateGlobal({
      slug: "banquets",
      data: {
        title: "Банкеты и VIP-зал",
        intro: "Черновик. Проведём день рождения, корпоратив или деловой ужин. Составим банкетное меню под ваш бюджет.",
        halls: [
          { name: "Основной зал", capacity: "до … гостей — уточнить", description: "Черновик описания." },
          { name: "VIP-зал", capacity: "до … гостей — уточнить", description: "Отдельный зал на втором этаже. Черновик описания." },
        ],
        content: rich(banquetsMarkdown),
      },
      context,
    });

    await payload.updateGlobal({ slug: "business-lunch", data: businessLunchSeed, context });

    payload.logger.info("[seed] Готово. Создайте первого пользователя на /admin");
  } catch (error) {
    // При параллельной сборке сид может запуститься дважды — второй упрётся в уникальность
    payload.logger.error({ err: error }, "[seed] Не удалось заполнить базу");
  }
}
