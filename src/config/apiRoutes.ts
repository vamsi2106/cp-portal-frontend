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
  CONTACTS: {
    LIST: '/api/contacts',
    HIERARCHY: (partnerId: string) => `/api/contacts/hierarchy/${partnerId}`,
    FUNNEL: (partnerId: string) => `/api/contacts/contact-funnel/${partnerId}`,
  },
} as const;