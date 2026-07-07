export const promosQueryKeys = {
  all: ['admin', 'promos'] as const,
  list: () => [...promosQueryKeys.all, 'list'] as const,
};
