type PublicFirestoreApi = Record<string, (...args: any[]) => any>;
type PublicDocument = { id: string; data: Record<string, any> };

export function findPublishedUMKM(db: unknown, slug: string, api: PublicFirestoreApi): Promise<PublicDocument | undefined>;
export function findActiveCategoryBySlug(db: unknown, slug: string, api: PublicFirestoreApi): Promise<PublicDocument | undefined>;
export function findActiveCategoryById(db: unknown, id: string, api: PublicFirestoreApi): Promise<PublicDocument | undefined>;
export function listPublishedByCategory(
  db: unknown,
  categoryId: string,
  api: PublicFirestoreApi,
  options?: { excludeSlug?: string; limit?: number },
): Promise<PublicDocument[]>;
