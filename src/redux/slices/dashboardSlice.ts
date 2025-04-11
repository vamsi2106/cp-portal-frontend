// dashboardSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/api';

// Response Types
interface LeadFunnelResponse {
    statusCounts: { [key: string]: number };
}

export interface PartnerPerformanceItem {
    partnerId: string;
    partnerName: string;
    leadCount: number;
}

interface PartnerPerformanceResponse {
    performance: PartnerPerformanceItem[];
}

interface TimelineResponse {
    timeline: { [key: string]: number };
}

export interface Lead {
    leadId: string;
    leadName: string;
}

export interface PartnerLeadPerformanceItem {
    partnerId: string;
    partnerName: string;
    leadCount: number;
    leads: Lead[];
}

interface PartnerLeadPerformanceResponse {
    partnerLeadPerformance: PartnerLeadPerformanceItem[];
}

// NEW: Deal Performance Types
export interface DealStageMetrics {
    count: number;
    value: number;
}

export interface DealMetricsResponse {
    dealMetrics: {
        totalDeals: number;
        totalValue: number;
        averageDealValue: number;
        dealsByStage: {
            [key: string]: DealStageMetrics;
        };
        dealsByMonth: {
            [key: string]: DealStageMetrics;
        };
    };
}

// NEW: Partner Deal Performance Types
export interface PartnerDealPerformanceItem {
    partnerId: string;
    partnerName: string;
    dealCount: number;
    dealValue: number;
    dealWinRate: number;
    averageDealValue: number;
    contactToDealsRatio: number;
    dealsByStage: {
        [key: string]: DealStageMetrics;
    };
}

interface PartnerDealPerformanceResponse {
    partnerDealPerformance: PartnerDealPerformanceItem[];
}

// NEW: Conversion Funnel Types
export interface ContactStatusMetrics {
    total: number;
    withDeals: number;
}

export interface ConversionResponse {
    conversionData: {
        totalContacts: number;
        contactsWithDeals: number;
        contactsByStatus: {
            [key: string]: ContactStatusMetrics;
        };
        conversionByStatus: {
            [key: string]: number;
        };
        conversionRate: number;
    };
}

// NEW: Revenue Forecast Types
export interface ForecastResponse {
    forecastData: {
        byMonth: {
            [key: string]: number;
        };
        byPartner: {
            [key: string]: number;
        };
        byStage: {
            [key: string]: number;
        };
        totalForecast: number;
    };
}

// NEW: Partner Analytics Types
export interface PartnerMetrics {
    contactCount: number;
    dealCount: number;
    totalDealValue: number;
    wonDealCount: number;
    wonDealValue: number;
    conversionRate: number;
    winRate: number;
    avgDealValue: number;
    subPartnerCount: number;
}

export interface PartnerAnalyticsItem {
    partnerId: string;
    partnerName: string;
    metrics: PartnerMetrics;
}

interface PartnerAnalyticsResponse {
    analytics: {
        partners: PartnerAnalyticsItem[];
    };
}

export interface DashboardState {
    leadFunnel: { [key: string]: number };
    partnerPerformance: PartnerPerformanceItem[];
    timeInsights: { [key: string]: number };
    partnerLeadPerformance: PartnerLeadPerformanceItem[];
    // NEW: Deal analytics states
    dealMetrics: DealMetricsResponse['dealMetrics'] | null;
    partnerDealPerformance: PartnerDealPerformanceItem[];
    conversionData: ConversionResponse['conversionData'] | null;
    forecastData: ForecastResponse['forecastData'] | null;
    partnerAnalytics: PartnerAnalyticsItem[];
    loading: boolean;
    error: string | null;
}

export const fetchLeadFunnel = createAsyncThunk<LeadFunnelResponse, string>(
    'dashboard/fetchLeadFunnel',
    async (partnerId, { rejectWithValue }) => {
        try {
            const response = await api.get<LeadFunnelResponse>(`/api/analytics/lead-funnel/${partnerId}`);
            console.log('Lead Funnel Response:', response);
            return response;
        } catch (err: any) {
            console.error('fetchLeadFunnel error:', err);
            return rejectWithValue(err.message || 'Failed to fetch lead funnel');
        }
    }
);

export const fetchPartnerPerformance = createAsyncThunk<PartnerPerformanceResponse, string>(
    'dashboard/fetchPartnerPerformance',
    async (partnerId, { rejectWithValue }) => {
        try {
            const response = await api.get<PartnerPerformanceResponse>(`/api/analytics/partner-performance/${partnerId}`);
            console.log('Partner Performance Response:', response);
            return response;
        } catch (err: any) {
            console.error('fetchPartnerPerformance error:', err);
            return rejectWithValue(err.message || 'Failed to fetch partner performance');
        }
    }
);

export const fetchTimeInsights = createAsyncThunk<TimelineResponse, string>(
    'dashboard/fetchTimeInsights',
    async (partnerId, { rejectWithValue }) => {
        try {
            const response = await api.get<TimelineResponse>(`/api/analytics/time-insights/${partnerId}`);
            console.log('Time Insights Response:', response);
            return response;
        } catch (err: any) {
            console.error('fetchTimeInsights error:', err);
            return rejectWithValue(err.message || 'Failed to fetch time insights');
        }
    }
);

export const fetchPartnerLeadPerformance = createAsyncThunk<PartnerLeadPerformanceResponse, string>(
    'dashboard/fetchPartnerLeadPerformance',
    async (partnerId, { rejectWithValue }) => {
        try {
            const response = await api.get<PartnerLeadPerformanceResponse>(`/api/analytics/partner-lead-performance/${partnerId}`);
            console.log('Partner Lead Performance Response:', response);
            return response;
        } catch (err: any) {
            console.error('fetchPartnerLeadPerformance error:', err);
            return rejectWithValue(err.message || 'Failed to fetch partner lead performance');
        }
    }
);

// NEW: Deal Performance Data
export const fetchDealPerformance = createAsyncThunk<DealMetricsResponse, string>(
    'dashboard/fetchDealPerformance',
    async (partnerId, { rejectWithValue }) => {
        try {
            const response = await api.get<DealMetricsResponse>(`/api/analytics/deal-performance/${partnerId}`);
            console.log('Deal Performance Response:', response);
            return response;
        } catch (err: any) {
            console.error('fetchDealPerformance error:', err);
            return rejectWithValue(err.message || 'Failed to fetch deal performance');
        }
    }
);

// NEW: Partner Deal Performance
export const fetchPartnerDealPerformance = createAsyncThunk<PartnerDealPerformanceResponse, string>(
    'dashboard/fetchPartnerDealPerformance',
    async (partnerId, { rejectWithValue }) => {
        try {
            const response = await api.get<PartnerDealPerformanceResponse>(`/api/analytics/partner-deal-performance/${partnerId}`);
            console.log('Partner Deal Performance Response:', response);
            return response;
        } catch (err: any) {
            console.error('fetchPartnerDealPerformance error:', err);
            return rejectWithValue(err.message || 'Failed to fetch partner deal performance');
        }
    }
);

// NEW: Conversion Funnel
export const fetchConversionFunnel = createAsyncThunk<ConversionResponse, string>(
    'dashboard/fetchConversionFunnel',
    async (partnerId, { rejectWithValue }) => {
        try {
            const response = await api.get<ConversionResponse>(`/api/analytics/conversion-funnel/${partnerId}`);
            console.log('Conversion Funnel Response:', response);
            return response;
        } catch (err: any) {
            console.error('fetchConversionFunnel error:', err);
            return rejectWithValue(err.message || 'Failed to fetch conversion funnel');
        }
    }
);

// NEW: Revenue Forecast
export const fetchRevenueForecast = createAsyncThunk<ForecastResponse, string>(
    'dashboard/fetchRevenueForecast',
    async (partnerId, { rejectWithValue }) => {
        try {
            const response = await api.get<ForecastResponse>(`/api/analytics/revenue-forecast/${partnerId}`);
            console.log('Revenue Forecast Response:', response);
            return response;
        } catch (err: any) {
            console.error('fetchRevenueForecast error:', err);
            return rejectWithValue(err.message || 'Failed to fetch revenue forecast');
        }
    }
);

// NEW: Partner Analytics
export const fetchPartnerAnalytics = createAsyncThunk<PartnerAnalyticsResponse, string>(
    'dashboard/fetchPartnerAnalytics',
    async (partnerId, { rejectWithValue }) => {
        try {
            const response = await api.get<PartnerAnalyticsResponse>(`/api/analytics/partner-analytics/${partnerId}`);
            console.log('Partner Analytics Response:', response);
            return response;
        } catch (err: any) {
            console.error('fetchPartnerAnalytics error:', err);
            return rejectWithValue(err.message || 'Failed to fetch partner analytics');
        }
    }
);

const initialState: DashboardState = {
    leadFunnel: {},
    partnerPerformance: [],
    timeInsights: {},
    partnerLeadPerformance: [],
    // NEW: Initial deal analytics states
    dealMetrics: null,
    partnerDealPerformance: [],
    conversionData: null,
    forecastData: null,
    partnerAnalytics: [],
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeadFunnel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeadFunnel.fulfilled, (state, action) => {
                state.leadFunnel = action.payload?.statusCounts || {};
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchLeadFunnel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchPartnerPerformance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartnerPerformance.fulfilled, (state, action) => {
                state.partnerPerformance = action.payload?.performance || [];
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchPartnerPerformance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchTimeInsights.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTimeInsights.fulfilled, (state, action) => {
                state.timeInsights = action.payload?.timeline || {};
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchTimeInsights.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchPartnerLeadPerformance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartnerLeadPerformance.fulfilled, (state, action) => {
                state.partnerLeadPerformance = action.payload?.partnerLeadPerformance || [];
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchPartnerLeadPerformance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // NEW: Deal Performance Reducers
            .addCase(fetchDealPerformance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDealPerformance.fulfilled, (state, action) => {
                state.dealMetrics = action.payload?.dealMetrics || null;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchDealPerformance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // NEW: Partner Deal Performance Reducers
            .addCase(fetchPartnerDealPerformance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartnerDealPerformance.fulfilled, (state, action) => {
                state.partnerDealPerformance = action.payload?.partnerDealPerformance || [];
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchPartnerDealPerformance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // NEW: Conversion Funnel Reducers
            .addCase(fetchConversionFunnel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConversionFunnel.fulfilled, (state, action) => {
                state.conversionData = action.payload?.conversionData || null;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchConversionFunnel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // NEW: Revenue Forecast Reducers
            .addCase(fetchRevenueForecast.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRevenueForecast.fulfilled, (state, action) => {
                state.forecastData = action.payload?.forecastData || null;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchRevenueForecast.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // NEW: Partner Analytics Reducers
            .addCase(fetchPartnerAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartnerAnalytics.fulfilled, (state, action) => {
                state.partnerAnalytics = action.payload?.analytics?.partners || [];
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchPartnerAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default dashboardSlice.reducer;
