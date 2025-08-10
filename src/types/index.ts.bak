// Основные типы для приложения VetFormuLab

export interface Animal {
  id: number;
  name: string;
  species: 'dog' | 'cat' | 'ferret';
  weight: number;
  age: number;
  gender: 'male' | 'female';
  breed?: string;
  is_neutered: boolean;
  activity_level: 'low' | 'moderate' | 'high' | 'very_high';
  physiological_state: 'normal' | 'pregnant' | 'lactating' | 'growth' | 'senior';
  metabolic_energy_need?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAnimalRequest {
  name: string;
  species: 'dog' | 'cat' | 'ferret';
  weight: number;
  age: number;
  gender: 'male' | 'female';
  breed?: string;
  is_neutered?: boolean;
  activity_level: 'low' | 'moderate' | 'high' | 'very_high';
  physiological_state?: 'normal' | 'pregnant' | 'lactating' | 'growth' | 'senior';
}

export interface Feed {
  id: number;
  name: string;
  brand?: string;
  type?: 'dry' | 'wet' | 'raw' | 'treats';
  metabolic_energy: number; // ккал/100г
  
  // Макронутриенты (%)
  protein?: number;
  fat?: number;
  carbohydrates?: number;
  fiber?: number;
  ash?: number;
  moisture?: number;
  
  // Минералы (мг/100г)
  calcium?: number;
  phosphorus?: number;
  sodium?: number;
  potassium?: number;
  magnesium?: number;
  iron?: number;
  zinc?: number;
  copper?: number;
  manganese?: number;
  
  // Микроэлементы (мкг/100г)
  selenium?: number;
  iodine?: number;
  
  // Витамины
  vitamin_a?: number; // МЕ/100г
  vitamin_d?: number; // МЕ/100г
  vitamin_e?: number; // мг/100г
  vitamin_k?: number; // мг/100г
  vitamin_b1?: number; // мг/100г
  vitamin_b2?: number; // мг/100г
  vitamin_b3?: number; // мг/100г
  vitamin_b5?: number; // мг/100г
  vitamin_b6?: number; // мг/100г
  vitamin_b7?: number; // мкг/100г
  vitamin_b9?: number; // мкг/100г
  vitamin_b12?: number; // мкг/100г
  vitamin_c?: number; // мг/100г
  
  ingredients?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedRequest {
  name: string;
  brand?: string;
  type?: 'dry' | 'wet' | 'raw' | 'treats';
  metabolic_energy: number;
  protein?: number;
  fat?: number;
  carbohydrates?: number;
  fiber?: number;
  ash?: number;
  moisture?: number;
  calcium?: number;
  phosphorus?: number;
  sodium?: number;
  potassium?: number;
  magnesium?: number;
  iron?: number;
  zinc?: number;
  copper?: number;
  manganese?: number;
  selenium?: number;
  iodine?: number;
  vitamin_a?: number;
  vitamin_d?: number;
  vitamin_e?: number;
  vitamin_k?: number;
  vitamin_b1?: number;
  vitamin_b2?: number;
  vitamin_b3?: number;
  vitamin_b5?: number;
  vitamin_b6?: number;
  vitamin_b7?: number;
  vitamin_b9?: number;
  vitamin_b12?: number;
  vitamin_c?: number;
  ingredients?: string;
  notes?: string;
}

export interface ComparisonFeed {
  id: number;
  name: string;
  brand?: string;
  dailyAmount: number; // граммы
  costPerDay?: number;
  dailyNutrients: DailyNutrients;
  caloriesPerGram: number;
}

export interface DailyNutrients {
  protein?: number;
  fat?: number;
  carbohydrates?: number;
  fiber?: number;
  calcium?: number;
  phosphorus?: number;
  sodium?: number;
  potassium?: number;
  magnesium?: number;
  iron?: number;
  zinc?: number;
  copper?: number;
  manganese?: number;
  selenium?: number;
  iodine?: number;
  vitamin_a?: number;
  vitamin_d?: number;
  vitamin_e?: number;
  vitamin_k?: number;
  vitamin_b1?: number;
  vitamin_b2?: number;
  vitamin_b3?: number;
  vitamin_b5?: number;
  vitamin_b6?: number;
  vitamin_b7?: number;
  vitamin_b9?: number;
  vitamin_b12?: number;
  vitamin_c?: number;
}

export interface FeedComparison {
  animal: {
    name: string;
    energyNeed: number;
  };
  feeds: ComparisonFeed[];
}

export interface Comparison {
  id: number;
  animal_id: number;
  animal_name: string;
  feed_ids: number[];
  comparison_data: FeedComparison;
  created_at: string;
}

export interface EnergyRequirementRequest {
  weight: number;
  species: 'dog' | 'cat' | 'ferret';
  activity_level: 'low' | 'moderate' | 'high' | 'very_high';
  physiological_state?: 'normal' | 'pregnant' | 'lactating' | 'growth' | 'senior';
  is_neutered?: boolean;
  age: number;
}

export interface EnergyRequirementResponse {
  energy_requirement: number;
  animal_data: EnergyRequirementRequest;
}

export interface CompareFeedsRequest {
  animal_id?: number;
  animal_data?: Partial<Animal>;
  feed_ids: number[];
}

export interface ApiError {
  error: string;
}

export interface FeedStats {
  totalFeeds: number;
  totalBrands: number;
  feedTypes: Array<{ type: string; count: number }>;
  avgCalories: number;
}

export interface CalculationStats {
  totalComparisons: number;
  animalsWithComparisons: number;
  topAnimals: Array<{ animal_id: number; comparison_count: number }>;
}

// Локальные типы для UI
export interface AnimalFormData {
  name: string;
  species: 'dog' | 'cat' | 'ferret';
  weight: string;
  age: string;
  gender: 'male' | 'female';
  breed: string;
  is_neutered: boolean;
  activity_level: 'low' | 'moderate' | 'high' | 'very_high';
  physiological_state: 'normal' | 'pregnant' | 'lactating' | 'growth' | 'senior';
}

export interface FeedFormData {
  name: string;
  brand: string;
  type: 'dry' | 'wet' | 'raw' | 'treats' | '';
  metabolic_energy: string;
  protein: string;
  fat: string;
  carbohydrates: string;
  fiber: string;
  ash: string;
  moisture: string;
  calcium: string;
  phosphorus: string;
  sodium: string;
  potassium: string;
  magnesium: string;
  iron: string;
  zinc: string;
  copper: string;
  manganese: string;
  selenium: string;
  iodine: string;
  vitamin_a: string;
  vitamin_d: string;
  vitamin_e: string;
  vitamin_k: string;
  vitamin_b1: string;
  vitamin_b2: string;
  vitamin_b3: string;
  vitamin_b5: string;
  vitamin_b6: string;
  vitamin_b7: string;
  vitamin_b9: string;
  vitamin_b12: string;
  vitamin_c: string;
  ingredients: string;
  notes: string;
}

// Константы для UI
export const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Собака', icon: '🐕' },
  { value: 'cat', label: 'Кошка', icon: '🐱' },
  { value: 'ferret', label: 'Хорек', icon: '🦔' },
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Самец' },
  { value: 'female', label: 'Самка' },
] as const;

export const ACTIVITY_LEVEL_OPTIONS = [
  { value: 'low', label: 'Низкая', description: 'Малоподвижный образ жизни' },
  { value: 'moderate', label: 'Умеренная', description: 'Обычная активность' },
  { value: 'high', label: 'Высокая', description: 'Очень активный' },
  { value: 'very_high', label: 'Очень высокая', description: 'Рабочие/спортивные животные' },
] as const;

export const PHYSIOLOGICAL_STATE_OPTIONS = [
  { value: 'normal', label: 'Обычное' },
  { value: 'pregnant', label: 'Беременность' },
  { value: 'lactating', label: 'Лактация' },
  { value: 'growth', label: 'Рост' },
  { value: 'senior', label: 'Пожилой возраст' },
] as const;

export const FEED_TYPE_OPTIONS = [
  { value: 'dry', label: 'Сухой корм' },
  { value: 'wet', label: 'Влажный корм' },
  { value: 'raw', label: 'Сырой корм' },
  { value: 'treats', label: 'Лакомства' },
] as const; 

// Тип для расчёта энергетической потребности (МЭ)
export interface AnimalEnergyData {
  species: 'dog' | 'cat' | 'ferret' | 'собака' | 'кошка' | 'хорек';
  gender: 'male' | 'female' | 'самец' | 'самка';
  age: number;
  condition?: number;
  name?: string;
  breed?: string;
  status?: string; // кастрированный, интактный, беременность, лактация
  activity?: string; // склонность к ожирению, нормальная активность, высокая активность
  owner?: string;
  currentWeight?: number;
  targetWeight: number;
  adultWeight?: number;
  lactationWeeks?: number;
  contact?: string;
  meCoefficient?: number;
} 