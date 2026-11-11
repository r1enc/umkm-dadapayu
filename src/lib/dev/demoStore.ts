import { mockCategories, mockUMKMList } from '../../data/mockData';
import { createDemoStore } from './demoStoreCore.mjs';
import type { Category, UMKM } from '../../types';

const store = createDemoStore(mockUMKMList, mockCategories);

export const listDemoUMKM = (): UMKM[] => store.listUMKM();
export const getDemoUMKM = (id: string): UMKM | null => store.getUMKM(id);
export const createDemoUMKM = (data: Omit<UMKM, 'id'>): string => store.createUMKM(data);
export const updateDemoUMKM = (id: string, data: Partial<UMKM>): boolean => store.updateUMKM(id, data);
export const deleteDemoUMKM = (id: string): boolean => store.deleteUMKM(id);
export const listDemoCategories = (): Category[] => store.listCategories();
export const createDemoCategory = (data: Omit<Category, 'id'>): string => store.createCategory(data);
export const updateDemoCategory = (id: string, data: Partial<Category>): boolean => store.updateCategory(id, data);
export const deleteDemoCategory = (id: string): boolean => store.deleteCategory(id);
