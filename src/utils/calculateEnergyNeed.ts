import { AnimalEnergyData } from '../types';

export function calculateEnergyNeed(animal: AnimalEnergyData): number {
  if (!animal || !animal.targetWeight) return 0;
  const weight = animal.targetWeight;
  let rer = 70 * Math.pow(weight, 0.75);
  let activityMultiplier = 1.0;

  // Приведение к строке для совместимости
  const status = animal.status || '';
  const activity = animal.activity || '';
  const lactationWeeks = animal.lactationWeeks || 0;
  const meCoefficient = animal.meCoefficient || 1;

  if (status === 'кастрированный') {
    activityMultiplier = activity === 'склонность к ожирению' ? 1.2 : 1.4;
  } else if (status === 'интактный') {
    activityMultiplier = 1.6;
  } else if (status === 'беременность 1-4 недели') {
    activityMultiplier = 1.8;
  } else if (status === 'беременность >5 недель') {
    activityMultiplier = 2.0;
  } else if (status === 'лактация') {
    activityMultiplier = 2.0 + (0.25 * lactationWeeks);
  }

  const totalEnergy = rer * activityMultiplier * meCoefficient;
  return Math.round(totalEnergy * 100) / 100;
} 