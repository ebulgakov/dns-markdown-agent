import { z } from "zod";
import { queryItems } from "./itemsRagQuery.js";

export const itemsSearchToolDefinition = {
  name: "ItemsSearch",
  parameters: z.object({
    query: z.string().describe("Поисковый запрос для поиска товаров с ДНС")
    // price: z.number().optional().nullable().describe("Фильтровать товары по цене")
  }),
  description:
    "Поиск товаров с ДНС и информации о них, включая название, цену, категорию, выгоду для покупателя, характеристики, причины уценки и описание. Используйте это, чтобы ответить на вопросы о товарах с ДНС."
};

export const itemsSearch = async ({ toolArgs }) => {
  const { query, price } = toolArgs;

  const filters = {
    ...(price && { price })
  };

  let results;
  try {
    results = await queryItems(query, filters);
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
