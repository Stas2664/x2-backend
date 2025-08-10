/**
 * Рассчитывает идеальный (расчетный) вес животного на основе текущего веса и кондиции
 * @param currentWeight - текущий вес в кг
 * @param condition - оценка упитанности (BCS) от 1 до 9, где 5 - идеальная кондиция
 * @returns идеальный вес в кг
 */
export function calculateIdealWeight(currentWeight: number, condition: number): number {
  if (!currentWeight || currentWeight <= 0) return 0;
  if (!condition || condition < 1 || condition > 9) return currentWeight;

  // Кондиция 5 соответствует идеальному весу
  if (condition === 5) {
    return currentWeight;
  }

  // Коэффициенты коррекции веса на основе BCS
  // Каждая единица BCS соответствует примерно 10-15% изменения веса
  const correctionFactor = 0.12; // 12% на единицу BCS
  
  let targetWeight: number;
  
  if (condition < 5) {
    // Недостаточная масса тела - нужно увеличить вес
    const deficit = 5 - condition;
    targetWeight = currentWeight * (1 + deficit * correctionFactor);
  } else {
    // Избыточная масса тела - нужно уменьшить вес
    const excess = condition - 5;
    targetWeight = currentWeight * (1 - excess * correctionFactor);
  }

  // Округляем до одного знака после запятой
  return Math.round(targetWeight * 10) / 10;
}