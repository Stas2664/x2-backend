import axios, { AxiosResponse } from 'axios';
import {
  Animal,
  CreateAnimalRequest,
  Feed,
  CreateFeedRequest,
  FeedComparison,
  EnergyRequirementRequest,
  EnergyRequirementResponse,
  CompareFeedsRequest,
  Comparison,
  FeedStats,
  CalculationStats,
} from '../types';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://https://x2-backend-j0jk.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Ресурс не найден');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Неверные данные');
    } else if (error.response?.status >= 500) {
      throw new Error('Ошибка сервера. Попробуйте позже');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Превышено время ожидания');
    } else if (error.message === 'Network Error') {
      throw new Error('Ошибка сети. Проверьте подключение');
    }
    
    throw error;
  }
);

// API для работы с животными
export const animalsApi = {
  // Получить всех животных
  getAll: (): Promise<AxiosResponse<Animal[]>> =>
    api.get('/animals'),

  // Получить животное по ID
  getById: (id: number): Promise<AxiosResponse<Animal>> =>
    api.get(`/animals/${id}`),

  // Создать новое животное
  create: (data: CreateAnimalRequest): Promise<AxiosResponse<Animal>> =>
    api.post('/animals', data),

  // Обновить животное
  update: (id: number, data: Partial<CreateAnimalRequest>): Promise<AxiosResponse<Animal>> =>
    api.put(`/animals/${id}`, data),

  // Удалить животное
  delete: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/animals/${id}`),

  // Рассчитать энергетическую потребность для животного
  calculateEnergy: (id: number): Promise<AxiosResponse<{ animal_id: number; metabolic_energy_need: number; message: string }>> =>
    api.post(`/animals/${id}/calculate-energy`),
};

// API для работы с кормами
export const feedsApi = {
  // Получить все корма с фильтрацией
  getAll: (params?: {
    search?: string;
    type?: string;
    brand?: string;
    limit?: number;
    offset?: number;
  }): Promise<AxiosResponse<Feed[]>> =>
    api.get('/feeds', { params }),

  // Получить список брендов
  getBrands: (): Promise<AxiosResponse<string[]>> =>
    api.get('/feeds/brands'),

  // Получить корм по ID
  getById: (id: number): Promise<AxiosResponse<Feed>> =>
    api.get(`/feeds/${id}`),

  // Создать новый корм
  create: (data: CreateFeedRequest): Promise<AxiosResponse<Feed>> =>
    api.post('/feeds', data),

  // Обновить корм
  update: (id: number, data: Partial<CreateFeedRequest>): Promise<AxiosResponse<Feed>> =>
    api.put(`/feeds/${id}`, data),

  // Удалить корм
  delete: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/feeds/${id}`),

  // Получить корма для сравнения
  getForComparison: (feedIds: number[]): Promise<AxiosResponse<Feed[]>> =>
    api.post('/feeds/compare', { feedIds }),

  // Получить статистику по кормам
  getStats: (): Promise<AxiosResponse<FeedStats>> =>
    api.get('/feeds/stats/overview'),
};

// API для расчетов
export const calculationsApi = {
  // Рассчитать энергетическую потребность
  calculateEnergyRequirement: (data: EnergyRequirementRequest): Promise<AxiosResponse<EnergyRequirementResponse>> =>
    api.post('/calculations/energy-requirement', data),

  // Сравнить корма для животного (с сохранением)
  compareFeeds: (data: CompareFeedsRequest): Promise<AxiosResponse<FeedComparison & { comparison_id?: number }>> =>
    api.post('/calculations/compare-feeds', data),

  // Быстрое сравнение кормов (без сохранения животного)
  compareFeedsQuick: (data: CompareFeedsRequest): Promise<AxiosResponse<FeedComparison>> =>
    api.post('/calculations/compare-feeds-quick', data),

  // Получить историю сравнений для животного
  getComparisonsForAnimal: (animalId: number, params?: {
    limit?: number;
    offset?: number;
  }): Promise<AxiosResponse<Comparison[]>> =>
    api.get(`/calculations/comparisons/animal/${animalId}`, { params }),

  // Получить конкретное сравнение по ID
  getComparison: (id: number): Promise<AxiosResponse<Comparison>> =>
    api.get(`/calculations/comparisons/${id}`),

  // Рассчитать суточную норму корма
  calculateDailyAmount: (data: {
    energy_need: number;
    feed_calories: number;
  }): Promise<AxiosResponse<{
    energy_need: number;
    feed_calories: number;
    daily_amount_grams: number;
    daily_amount_cups: number;
  }>> =>
    api.post('/calculations/daily-amount', data),

  // Рассчитать питательные вещества в суточной норме
  calculateDailyNutrients: (data: {
    daily_amount: number;
    feed_nutrients: any;
  }): Promise<AxiosResponse<{
    daily_amount_grams: number;
    daily_nutrients: any;
  }>> =>
    api.post('/calculations/daily-nutrients', data),

  // Получить статистику расчетов
  getStats: (): Promise<AxiosResponse<CalculationStats>> =>
    api.get('/calculations/stats'),
};

// API для проверки здоровья сервера
export const healthApi = {
  check: (): Promise<AxiosResponse<{ status: string; message: string }>> =>
    api.get('/health'),
};

// Экспортируем основной экземпляр API
export default api; 