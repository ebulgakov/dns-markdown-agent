import { z } from "zod";
import { queryItems } from "./itemsRagQuery.js";

export const itemsSearchToolDefinition = {
  name: "ItemsSearch",
  parameters: z.object({
    query: z.string().describe("Поисковый запрос для поиска товаров с ДНС"),
    minPrice: z
      .number()
      .nullable(0)
      .describe("Фильтровать товары от указанной цены 0 до бесконечности"),
    maxPrice: z.number().nullable(1000000).describe("Фильтровать товары от нуля до указанной цены"),
    category: z.string().nullable("").describe("Фильтровать товары по категории")
  }),
  description:
    "Поиск товаров с ДНС и информации о них, включая название, цену, категорию, выгоду для покупателя, характеристики, причины уценки и описание. Используйте это, чтобы ответить на вопросы о товарах с ДНС."
};
export const itemsSearch = async ({ toolArgs }) => {
  const { query, category, minPrice, maxPrice } = toolArgs;

  const filters = {
    ...(category && { category }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice })
  };

  let results;
  try {
    results = await queryItems(query, filters, 10);
  } catch (error) {
    console.error(error);
    return "Ошибка: Не удалось найти товары";
  }

  const formattedResults = results.map(result => ({
    title: result.metadata?.title,
    category: result.metadata?.category,
    discountReasons: result.metadata?.discountReasons,
    link: result.metadata?.link,
    price: result.metadata?.price,
    priceOld: result.metadata?.priceOld || "-",
    profit: result.metadata?.profit || "-",
    code: result.metadata?.code,
    createdAt: result.metadata?.createdAt,
    description: result.data
  }));

  return JSON.stringify(formattedResults, null, 2);
};
