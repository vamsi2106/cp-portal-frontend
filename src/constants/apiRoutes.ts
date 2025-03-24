export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/signup',
    LOGIN: '/login',
  },
  PARTNERS: {
    LIST: '/api/partners',
    DETAIL: (id: string) => `/api/partners/${id}`,
    HIERARCHY: (partnerId: string) => `/api/partners/hierarchy/${partnerId}`,
  },
  LEADS: {
    LIST: '/api/leads',
    HIERARCHY: (partnerId: string) => `/api/leads/hierarchy/${partnerId}`,
  },
} as const;