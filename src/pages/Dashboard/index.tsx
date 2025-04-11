import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, List, Spin, Typography, Dropdown, Button, Skeleton, Pagination, message, Tabs, Select } from 'antd';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { Users, Target, Award, TrendingUp, Activity, Filter, MoreHorizontal, Download, Presentation, RefreshCw, DollarSign, BarChart2, PieChart, TrendingDown } from 'lucide-react';
import {
  fetchLeadFunnel,
  fetchPartnerPerformance,
  fetchTimeInsights,
  fetchPartnerLeadPerformance,
  fetchDealPerformance,
  fetchPartnerDealPerformance,
  fetchConversionFunnel,
  fetchRevenueForecast,
  fetchPartnerAnalytics,
  type PartnerLeadPerformanceItem,
  type PartnerDealPerformanceItem,
  type PartnerAnalyticsItem,
  type Lead,
  type DashboardState
} from '../../redux/slices/dashboardSlice';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

// Helper function to export data to CSV
const exportToCSV = (data: any[], filename: string) => {
  // Make sure data is an array
  if (!Array.isArray(data)) {
    message.error('No data to export');
    return;
  }

  // Handle empty data
  if (data.length === 0) {
    message.error('No data to export');
    return;
  }

  try {
    // Get headers from first item
    const headers = Object.keys(data[0]);

    // Convert data to CSV format
    const csvContent = [
      // Headers row
      headers.join(','),
      // Data rows
      ...data.map(row => {
        return headers.map(header => {
          // Handle values that need quoting (contain commas, quotes, or newlines)
          const value = row[header] != null ? String(row[header]) : '';
          const needsQuoting = value.includes(',') || value.includes('"') || value.includes('\n');
          return needsQuoting ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',');
      })
    ].join('\n');

    // Create file and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success(`${filename} has been exported successfully`);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    message.error('Failed to export data');
  }
};

// Get dynamic color based on lead status
const getLeadStatusColor = (status: string) => {
  const statusMap: Record<string, { bg: string, border: string, text: string }> = {
    'New Lead': {
      bg: 'rgba(204, 169, 90, 0.8)',
      border: 'rgba(204, 169, 90, 1)',
      text: '#132430'
    },
    'Contacted': {
      bg: 'rgba(236, 190, 117, 0.8)',
      border: 'rgba(236, 190, 117, 1)',
      text: '#132430'
    },
    'Qualified': {
      bg: 'rgba(100, 141, 174, 0.8)',
      border: 'rgba(100, 141, 174, 1)',
      text: '#ffffff'
    },
    'Proposal': {
      bg: 'rgba(42, 74, 103, 0.8)',
      border: 'rgba(42, 74, 103, 1)',
      text: '#ffffff'
    },
    'Negotiation': {
      bg: 'rgba(52, 97, 133, 0.8)',
      border: 'rgba(52, 97, 133, 1)',
      text: '#ffffff'
    },
    'Won': {
      bg: 'rgba(62, 121, 163, 0.8)',
      border: 'rgba(62, 121, 163, 1)',
      text: '#ffffff'
    },
    'Lost': {
      bg: 'rgba(99, 145, 180, 0.8)',
      border: 'rgba(99, 145, 180, 1)',
      text: '#ffffff'
    },
    'Pre-Qualified': {
      bg: 'rgba(145, 160, 190, 0.8)',
      border: 'rgba(145, 160, 190, 1)',
      text: '#ffffff'
    },
    'Not Contacted': {
      bg: 'rgba(180, 180, 180, 0.8)',
      border: 'rgba(180, 180, 180, 1)',
      text: '#132430'
    }
  };

  // Default fallback color if status not found
  const defaultColor = {
    bg: 'rgba(200, 200, 200, 0.8)',
    border: 'rgba(200, 200, 200, 1)',
    text: '#132430'
  };

  return statusMap[status] || defaultColor;
};

// NEW: Get dynamic color based on deal stage
const getDealStageColor = (stage: string) => {
  const stageMap: Record<string, { bg: string, border: string, text: string }> = {
    'Initial Contact': {
      bg: 'rgba(236, 190, 117, 0.8)',
      border: 'rgba(236, 190, 117, 1)',
      text: '#132430'
    },
    'Qualification': {
      bg: 'rgba(100, 141, 174, 0.8)',
      border: 'rgba(100, 141, 174, 1)',
      text: '#ffffff'
    },
    'Needs Analysis': {
      bg: 'rgba(42, 74, 103, 0.8)',
      border: 'rgba(42, 74, 103, 1)',
      text: '#ffffff'
    },
    'Proposal': {
      bg: 'rgba(52, 97, 133, 0.8)',
      border: 'rgba(52, 97, 133, 1)',
      text: '#ffffff'
    },
    'Negotiation': {
      bg: 'rgba(62, 121, 163, 0.8)',
      border: 'rgba(62, 121, 163, 1)',
      text: '#ffffff'
    },
    'Closed Won': {
      bg: 'rgba(76, 175, 80, 0.8)',
      border: 'rgba(76, 175, 80, 1)',
      text: '#ffffff'
    },
    'Closed Lost': {
      bg: 'rgba(244, 67, 54, 0.8)',
      border: 'rgba(244, 67, 54, 1)',
      text: '#ffffff'
    }
  };

  // Default fallback color if stage not found
  const defaultColor = {
    bg: 'rgba(200, 200, 200, 0.8)',
    border: 'rgba(200, 200, 200, 1)',
    text: '#132430'
  };

  return stageMap[stage] || defaultColor;
};

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    leadFunnel,
    partnerPerformance,
    timeInsights,
    partnerLeadPerformance,
    dealMetrics,
    partnerDealPerformance,
    conversionData,
    forecastData,
    partnerAnalytics,
    loading,
    error
  } = useSelector((state: RootState) => state.dashboard as DashboardState);

  const [partnerPage, setPartnerPage] = useState(1);
  const [partnersPerPage, setPartnersPerPage] = useState(5);
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('1');
  const [performanceView, setPerformanceView] = useState('partner-performance');
  const [forecastView, setForecastView] = useState('revenue-forecast');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Handle both mobile detection and partners per page adjustment
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      setPartnersPerPage(mobileView ? 3 : 5);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on component mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user?.id) {
      // console.log('Fetching dashboard data for user:', user.id);
      // void dispatch(fetchLeadFunnel(user.id));
      // void dispatch(fetchPartnerPerformance(user.id));
      // void dispatch(fetchTimeInsights(user.id));
      // void dispatch(fetchPartnerLeadPerformance(user.id));

      // NEW: Fetch deal analytics data
      void dispatch(fetchDealPerformance(user.id));
      void dispatch(fetchPartnerDealPerformance(user.id));
      void dispatch(fetchConversionFunnel(user.id));
      void dispatch(fetchRevenueForecast(user.id));
      void dispatch(fetchPartnerAnalytics(user.id));
    }
  }, [dispatch, user?.id]);

  const refreshData = (section: string) => {
    if (!user?.id) return;

    setRefreshing(prev => ({ ...prev, [section]: true }));

    // Refresh the appropriate data based on the section
    const fetchPromise = (() => {
      switch (section) {
        case 'Lead Growth':
          return dispatch(fetchTimeInsights(user.id));
        case 'Status Distribution':
          return dispatch(fetchLeadFunnel(user.id));
        case 'Partner Performance':
          return dispatch(fetchPartnerPerformance(user.id));
        case 'Partner Details':
          return dispatch(fetchPartnerLeadPerformance(user.id));
        case 'Deal Performance':
          return dispatch(fetchDealPerformance(user.id));
        case 'Partner Deal Performance':
          return dispatch(fetchPartnerDealPerformance(user.id));
        case 'Conversion Funnel':
          return dispatch(fetchConversionFunnel(user.id));
        case 'Revenue Forecast':
          return dispatch(fetchRevenueForecast(user.id));
        case 'Partner Analytics':
          return dispatch(fetchPartnerAnalytics(user.id));
        default:
          // Refresh all data
          return Promise.all([
            // dispatch(fetchLeadFunnel(user.id)),
            // dispatch(fetchPartnerPerformance(user.id)),
            // dispatch(fetchTimeInsights(user.id)),
            // dispatch(fetchPartnerLeadPerformance(user.id)),
            dispatch(fetchDealPerformance(user.id)),
            dispatch(fetchPartnerDealPerformance(user.id)),
            dispatch(fetchConversionFunnel(user.id)),
            dispatch(fetchRevenueForecast(user.id)),
            dispatch(fetchPartnerAnalytics(user.id))
          ]);
      }
    })();

    // Show success message and reset refreshing state
    fetchPromise
      .then(() => {
        message.success(`${section} data refreshed successfully`);
      })
      .catch(err => {
        message.error(`Failed to refresh ${section} data`);
        console.error(err);
      })
      .finally(() => {
        setRefreshing(prev => ({ ...prev, [section]: false }));
      });
  };

  // Export handlers for each section
  const handleExportLeadGrowth = () => {
    // Convert time insights data to exportable format
    const exportData = Object.entries(timeInsights).map(([date, count]) => ({
      Date: new Date(date).toLocaleDateString(),
      LeadCount: count
    }));

    exportToCSV(exportData, 'Lead_Growth_Trend');
  };

  const handleExportStatusDistribution = () => {
    // Convert lead funnel data to exportable format
    const exportData = Object.entries(leadFunnel).map(([status, count]) => ({
      Status: status,
      Count: count
    }));

    exportToCSV(exportData, 'Lead_Status_Distribution');
  };

  const handleExportPartnerPerformance = () => {
    // Export top partners performance data
    const exportData = topPartners.map(partner => ({
      PartnerName: partner.partnerName,
      LeadCount: partner.leadCount,
      PercentageOfTotal: ((partner.leadCount / totalLeads) * 100).toFixed(2) + '%'
    }));

    exportToCSV(exportData, 'Top_Partner_Performance');
  };

  const handleExportPartnerDetails = () => {
    // Export all partner details
    const exportData = allPartners.map(partner => ({
      PartnerName: partner.partnerName,
      LeadCount: partner.leadCount,
      PercentageOfTotal: ((partner.leadCount / totalLeads) * 100).toFixed(2) + '%',
      // Include comma-separated lead names if available
      LeadNames: partner.leads && partner.leads.length > 0
        ? partner.leads.map((lead: Lead) => lead.leadName).join(', ')
        : 'No leads'
    }));

    exportToCSV(exportData, 'Partner_Details');
  };

  const handleExportDealPerformance = () => {
    if (!dealMetrics) return;

    // Export deal stage distribution
    const exportData = Object.entries(dealMetrics.dealsByStage).map(([stage, metrics]) => ({
      Stage: stage,
      DealCount: metrics.count,
      TotalValue: metrics.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      AverageValue: (metrics.value / metrics.count).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    }));

    exportToCSV(exportData, 'Deal_Performance_By_Stage');
  };

  const handleExportDealTimeline = () => {
    if (!dealMetrics) return;

    // Export deal monthly distribution
    const exportData = Object.entries(dealMetrics.dealsByMonth).map(([month, metrics]) => ({
      Month: month,
      DealCount: metrics.count,
      TotalValue: metrics.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    }));

    exportToCSV(exportData, 'Deal_Growth_Timeline');
  };

  const handleExportPartnerDealPerformance = () => {
    // Export partner deal performance data
    const exportData = partnerDealPerformance.map(partner => ({
      PartnerName: partner.partnerName,
      DealCount: partner.dealCount,
      TotalDealValue: partner.dealValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      WinRate: partner.dealWinRate.toFixed(1) + '%',
      AverageDealValue: partner.averageDealValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      ContactToDealsRatio: partner.contactToDealsRatio.toFixed(2)
    }));

    exportToCSV(exportData, 'Partner_Deal_Performance');
  };

  const handleExportConversionData = () => {
    if (!conversionData) return;

    // Export conversion rates by status
    const exportData = Object.entries(conversionData.conversionByStatus).map(([status, rate]) => ({
      Status: status,
      ContactCount: conversionData.contactsByStatus[status]?.total || 0,
      ContactsWithDeals: conversionData.contactsByStatus[status]?.withDeals || 0,
      ConversionRate: rate.toFixed(1) + '%'
    }));

    exportToCSV(exportData, 'Contact_Conversion_Rates');
  };

  const handleExportForecastData = () => {
    if (!forecastData) return;

    // Export monthly revenue forecast
    const monthlyData = Object.entries(forecastData.byMonth).map(([month, value]) => ({
      Month: month,
      ForecastValue: value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    }));

    exportToCSV(monthlyData, 'Revenue_Forecast_By_Month');

    // Export partner revenue forecast
    const partnerData = Object.entries(forecastData.byPartner).map(([partner, value]) => ({
      Partner: partner,
      ForecastValue: value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      Percentage: ((value / forecastData.totalForecast) * 100).toFixed(1) + '%'
    }));

    exportToCSV(partnerData, 'Revenue_Forecast_By_Partner');
  };

  const handleExportPartnerAnalytics = () => {
    // Export comprehensive partner analytics
    const exportData = partnerAnalytics.map(partner => ({
      PartnerName: partner.partnerName,
      ContactCount: partner.metrics.contactCount,
      DealCount: partner.metrics.dealCount,
      TotalValue: partner.metrics.totalDealValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      WonDeals: partner.metrics.wonDealCount,
      WonValue: partner.metrics.wonDealValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      ConversionRate: partner.metrics.conversionRate.toFixed(1) + '%',
      WinRate: partner.metrics.winRate.toFixed(1) + '%',
      AvgDealValue: partner.metrics.avgDealValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      SubPartners: partner.metrics.subPartnerCount
    }));

    exportToCSV(exportData, 'Comprehensive_Partner_Analytics');
  };

  if (loading) {
    // Enhanced mobile-optimized loading state
    return (
      <div className="space-y-3">
        {/* Summary cards skeleton - 2 per row on mobile */}
        <Row gutter={[8, 8]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={12} sm={12} lg={6} key={i}>
              <Card
                className="rich-card-dark h-[120px] sm:h-[140px]"
                bodyStyle={{ padding: '12px', height: '100%' }}
              >
                <div className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <Skeleton.Button active size="small" style={{ width: 80, height: 16 }} />
                    <Skeleton.Avatar active size="small" shape="circle" />
                  </div>
                  <Skeleton.Input active size="large" style={{ width: '60%', height: 24 }} />
                  <Skeleton.Button active size="small" style={{ width: '100%', height: 12 }} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts skeleton - 1 per row on mobile */}
        <Row gutter={[8, 8]}>
          <Col xs={24} lg={12}>
            <Card
              className="rich-card"
              bodyStyle={{ padding: '12px' }}
            >
              <div className="mb-2 flex justify-between">
                <Skeleton.Button active size="small" style={{ width: 120, height: 20 }} />
                <Skeleton.Button active size="small" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              </div>
              <div className="h-[190px] sm:h-[280px] bg-gray-50 rounded-lg flex items-center justify-center">
                <Skeleton.Image active style={{ width: '80%', height: '80%' }} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              className="rich-card"
              bodyStyle={{ padding: '12px' }}
            >
              <div className="mb-2 flex justify-between">
                <Skeleton.Button active size="small" style={{ width: 120, height: 20 }} />
                <Skeleton.Button active size="small" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              </div>
              <div className="h-[190px] sm:h-[280px] bg-gray-50 rounded-lg flex items-center justify-center">
                <Skeleton.Image active style={{ width: '80%', height: '80%' }} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="rich-card-dark p-8 max-w-md text-center">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <div className="text-xl font-semibold mb-2">Error Loading Dashboard</div>
          <div className="text-sm opacity-80 mb-4">{error}</div>
          <Button
            onClick={() => window.location.reload()}
            className="btn-gold"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total leads from funnel
  const totalLeads = Object.values(leadFunnel).reduce((sum, count) => sum + (count as number), 0);

  // Calculate total partners and active partners
  const totalPartners = partnerLeadPerformance.length;
  const activePartners = partnerLeadPerformance.filter((partner: PartnerLeadPerformanceItem) => partner.leadCount > 0).length;

  // Calculate conversion rate
  const conversionRate = totalPartners ? ((activePartners / totalPartners) * 100).toFixed(1) : 0;

  // Calculate average leads per active partner
  const avgLeadsPerPartner = activePartners ? (totalLeads / activePartners).toFixed(1) : 0;

  // Get timeline data for the chart
  const timelineData = Object.entries(timeInsights).sort(([dateA], [dateB]) =>
    new Date(dateA).getTime() - new Date(dateB).getTime()
  );

  // Prepare data for lead funnel chart - with dynamic colors
  const funnelData = {
    labels: Object.keys(leadFunnel),
    datasets: [{
      data: Object.values(leadFunnel),
      backgroundColor: Object.keys(leadFunnel).map(status => getLeadStatusColor(status).bg),
      borderColor: Object.keys(leadFunnel).map(status => getLeadStatusColor(status).border),
      borderWidth: 1
    }]
  };

  // Prepare partner performance chart data
  const allPartners = [...partnerLeadPerformance].sort((a, b) => b.leadCount - a.leadCount);
  const topPartners = allPartners.slice(0, 5);

  // Pagination for partner details
  const indexOfLastPartner = partnerPage * partnersPerPage;
  const indexOfFirstPartner = indexOfLastPartner - partnersPerPage;
  const currentPagePartners = allPartners.slice(indexOfFirstPartner, indexOfLastPartner);

  const partnerPerformanceData = {
    labels: topPartners.map(partner => partner.partnerName),
    datasets: [{
      label: 'Lead Count',
      data: topPartners.map(partner => partner.leadCount),
      backgroundColor: [
        'rgba(204, 169, 90, 0.8)',
        'rgba(204, 169, 90, 0.7)',
        'rgba(204, 169, 90, 0.6)',
        'rgba(204, 169, 90, 0.5)',
        'rgba(204, 169, 90, 0.4)',
      ],
      borderColor: [
        'rgba(204, 169, 90, 1)',
        'rgba(204, 169, 90, 0.9)',
        'rgba(204, 169, 90, 0.8)',
        'rgba(204, 169, 90, 0.7)',
        'rgba(204, 169, 90, 0.6)',
      ],
      borderWidth: 1
    }]
  };

  // NEW: Calculate deal metrics for summary cards
  const totalDeals = dealMetrics?.totalDeals || 0;
  const totalDealValue = dealMetrics?.totalValue || 0;
  const avgDealValue = dealMetrics?.averageDealValue || 0;

  // NEW: Calculate conversion rates
  const overallConversionRate = conversionData?.conversionRate || 0;

  // NEW: Prepare data for deal stage chart
  const dealStageData = dealMetrics?.dealsByStage ? {
    labels: Object.keys(dealMetrics.dealsByStage),
    datasets: [{
      label: 'Deal Count',
      data: Object.values(dealMetrics.dealsByStage).map(stage => stage.count),
      backgroundColor: Object.keys(dealMetrics.dealsByStage).map(stage => getDealStageColor(stage).bg),
      borderColor: Object.keys(dealMetrics.dealsByStage).map(stage => getDealStageColor(stage).border),
      borderWidth: 1
    }]
  } : { labels: [], datasets: [] };

  // NEW: Prepare data for monthly deal timeline
  const dealTimelineData = dealMetrics?.dealsByMonth ?
    Object.entries(dealMetrics.dealsByMonth)
      .sort(([monthA], [monthB]) => new Date(monthA).getTime() - new Date(monthB).getTime()) : [];

  // NEW: Prepare chart data for monthly deals
  const monthlyDealData = {
    labels: dealTimelineData.map(([month]) => month),
    datasets: [
      {
        label: 'Deal Count',
        data: dealTimelineData.map(([, metrics]) => metrics.count),
        borderColor: '#cca95a',
        backgroundColor: 'rgba(204, 169, 90, 0.1)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y',
        pointBackgroundColor: '#132430',
        pointBorderColor: '#cca95a',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Deal Value',
        data: dealTimelineData.map(([, metrics]) => metrics.value),
        borderColor: '#2a4a67',
        backgroundColor: 'rgba(42, 74, 103, 0.1)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
        pointBackgroundColor: '#132430',
        pointBorderColor: '#2a4a67',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  // NEW: Prepare data for conversion funnel
  const conversionFunnelData = conversionData?.contactsByStatus ? {
    labels: Object.keys(conversionData.contactsByStatus),
    datasets: [
      {
        label: 'Total Contacts',
        data: Object.values(conversionData.contactsByStatus).map(status => status.total),
        backgroundColor: 'rgba(100, 141, 174, 0.8)',
        borderColor: 'rgba(100, 141, 174, 1)',
        borderWidth: 1
      },
      {
        label: 'Contacts with Deals',
        data: Object.values(conversionData.contactsByStatus).map(status => status.withDeals),
        backgroundColor: 'rgba(204, 169, 90, 0.8)',
        borderColor: 'rgba(204, 169, 90, 1)',
        borderWidth: 1
      }
    ]
  } : { labels: [], datasets: [] };

  // NEW: Prepare data for revenue forecast
  const forecastMonthlyData = forecastData?.byMonth ?
    Object.entries(forecastData.byMonth)
      .sort(([monthA], [monthB]) => new Date(monthA).getTime() - new Date(monthB).getTime()) : [];

  // NEW: Create chart data for forecast
  const revenueForecastData = {
    labels: forecastMonthlyData.map(([month]) => month),
    datasets: [
      {
        label: 'Forecast Revenue',
        data: forecastMonthlyData.map(([, value]) => value),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#132430',
        pointBorderColor: '#4caf50',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  // NEW: Prepare partner analytics for visualization
  const partnerAnalyticsData = [...partnerAnalytics]
    .sort((a, b) => b.metrics.totalDealValue - a.metrics.totalDealValue)
    .slice(0, 5);

  // NEW: Chart data for partner analytics
  const partnerAnalyticsChartData = {
    labels: partnerAnalyticsData.map(partner => partner.partnerName),
    datasets: [
      {
        label: 'Total Deal Value',
        data: partnerAnalyticsData.map(partner => partner.metrics.totalDealValue),
        backgroundColor: 'rgba(204, 169, 90, 0.8)',
        borderColor: 'rgba(204, 169, 90, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Win Rate (%)',
        data: partnerAnalyticsData.map(partner => partner.metrics.winRate),
        backgroundColor: 'rgba(42, 74, 103, 0.8)',
        borderColor: 'rgba(42, 74, 103, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };

  // Enhanced card actions menu with actual handlers
  const cardActions = (title: string) => {
    let exportHandler;
    switch (title) {
      case 'Lead Growth':
        exportHandler = handleExportLeadGrowth;
        break;
      case 'Status Distribution':
        exportHandler = handleExportStatusDistribution;
        break;
      case 'Partner Performance':
        exportHandler = handleExportPartnerPerformance;
        break;
      case 'Partner Details':
        exportHandler = handleExportPartnerDetails;
        break;
      case 'Deal Performance':
        exportHandler = handleExportDealPerformance;
        break;
      case 'Deal Timeline':
        exportHandler = handleExportDealTimeline;
        break;
      case 'Partner Deal Performance':
        exportHandler = handleExportPartnerDealPerformance;
        break;
      case 'Conversion Funnel':
        exportHandler = handleExportConversionData;
        break;
      case 'Revenue Forecast':
        exportHandler = handleExportForecastData;
        break;
      case 'Partner Analytics':
        exportHandler = handleExportPartnerAnalytics;
        break;
      default:
        exportHandler = () => message.info('Export not implemented for this section');
    }

    return {
      items: [
        {
          key: '1',
          label: 'Export as CSV',
          icon: <Download className="w-4 h-4 mr-2" />,
          onClick: exportHandler
        },
        {
          key: '2',
          label: 'View Details',
          icon: <Presentation className="w-4 h-4 mr-2" />,
          onClick: () => message.info(`Viewing details for ${title}`)
        },
        {
          key: '3',
          label: 'Refresh Data',
          icon: <RefreshCw className={`w-4 h-4 mr-2 ${refreshing[title] ? 'animate-spin' : ''}`} />,
          onClick: () => refreshData(title),
          disabled: refreshing[title]
        },
      ]
    };
  };

  // Status tag component with dynamic coloring
  const StatusTag = ({ status }: { status: string }) => {
    const colors = getLeadStatusColor(status);

    return (
      <span
        className="inline-flex items-center text-xs rounded-full px-2 py-1"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          fontWeight: 500
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {/* <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="rich-card-dark"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="rich-card-pattern"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="stat-title text-secondary-cream mb-1">Total Partners</div>
                <div className="stat-value text-white">{totalPartners}</div>
                <div className="text-secondary-cream/80 rounded-md  text-primary-gold">{activePartners} active partners</div>
              </div>
              <div className="p-3 rounded-full bg-[#1c3141] shadow-inner">
                <Users className="text-[#cca95a] w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <Progress
              percent={activePartners ? Math.round((activePartners / totalPartners) * 100) : 0}
              showInfo={false}
              strokeColor="#cca95a"
              trailColor="rgba(255,255,255,0.1)"
              className="mt-0"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="rich-card-dark"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="rich-card-pattern"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="stat-title text-secondary-cream mb-1">Total Leads</div>
                <div className="stat-value text-white">{totalLeads}</div>
                <div className="text-secondary-cream/80 rounded-md  text-primary-gold">{avgLeadsPerPartner} avg leads per active partner</div>
              </div>
              <div className="p-3 rounded-full bg-[#1c3141] shadow-inner">
                <Target className="text-[#cca95a] w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <Progress
              percent={totalPartners ? Math.round((totalLeads / (totalPartners * 5)) * 100) : 0}
              showInfo={false}
              strokeColor="#cca95a"
              trailColor="rgba(255,255,255,0.1)"
              className="mt-0"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="rich-card-dark"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="rich-card-pattern"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="stat-title text-secondary-cream mb-1">Active Partners</div>
                <div className="stat-value text-white">{activePartners}</div>
                <div className="text-secondary-cream/80 rounded-md  text-primary-gold">{((activePartners / totalPartners) * 100).toFixed(0)}% of total partners</div>
              </div>
              <div className="p-3 rounded-full bg-[#1c3141] shadow-inner">
                <Award className="text-[#cca95a] w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <Progress
              percent={totalPartners ? Math.round((activePartners / totalPartners) * 100) : 0}
              showInfo={false}
              strokeColor="#cca95a"
              trailColor="rgba(255,255,255,0.1)"
              className="mt-0"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="rich-card-dark"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="rich-card-pattern"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="stat-title text-secondary-cream mb-1">Partner Activity Rate</div>
                <div className="stat-value text-white">{conversionRate}%</div>
                <div className="text-secondary-cream/80 rounded-md  text-primary-gold">Based on lead generation</div>
              </div>
              <div className="p-3 rounded-full bg-[#1c3141] shadow-inner">
                <Activity className="text-[#cca95a] w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <Progress
              percent={Number(conversionRate)}
              showInfo={false}
              strokeColor="#cca95a"
              trailColor="rgba(255,255,255,0.1)"
              className="mt-0"
            />
          </Card>
        </Col>
      </Row> */}

      {/* Charts Row */}
      {/* <Row gutter={[12, 12]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex justify-between items-center">
                <Title level={5} className="text-primary-dark m-0 text-sm md:text-base">Lead Growth Trend</Title>
                <Dropdown menu={{ items: cardActions('Lead Growth').items }}
                  placement="bottomRight" trigger={['click']}>
                  <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} />
                </Dropdown>
              </div>
            }
            bordered={false}
            className="rich-card shadow-sm"
            bodyStyle={{ padding: '16px' }}
            headStyle={{ borderBottom: '1px solid #ede9df', background: '#f6f4ef' }}
          >
            <div className="rich-card-pattern" style={{ opacity: 0.01 }}></div>
            <div className="h-[250px] sm:h-[300px] relative z-10">
              <Line
                data={{
                  labels: timelineData.map(([date]) => new Date(date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Leads',
                      data: timelineData.map(([, count]) => count as number),
                      borderColor: '#cca95a',
                      backgroundColor: 'rgba(204, 169, 90, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: '#132430',
                      pointBorderColor: '#cca95a',
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    }
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        boxWidth: 6,
                        color: '#132430',
                        font: {
                          size: 11
                        }
                      }
                    },
                    title: {
                      display: true,
                      text: 'Daily Lead Acquisition',
                      color: '#132430',
                      font: {
                        size: 13,
                        weight: 500
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(237, 233, 223, 0.5)',
                      },
                      ticks: {
                        color: '#132430',
                        font: {
                          size: 10
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: '#132430',
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex justify-between items-center">
                <Title level={5} className="text-primary-dark m-0 text-sm md:text-base">Lead Status Distribution</Title>
                <Dropdown menu={cardActions('Status Distribution')} placement="bottomRight" trigger={['click']}>
                  <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} />
                </Dropdown>
              </div>
            }
            bordered={false}
            className="rich-card shadow-sm"
            bodyStyle={{ padding: '16px' }}
            headStyle={{ borderBottom: '1px solid #ede9df', background: '#f6f4ef' }}
          >
            <div className="rich-card-pattern" style={{ opacity: 0.01 }}></div>
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center relative z-10">
              <Doughnut
                data={funnelData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: window.innerWidth < 768 ? 'bottom' : 'right',
                      labels: {
                        usePointStyle: true,
                        boxWidth: 6,
                        color: '#132430',
                        padding: window.innerWidth < 768 ? 10 : 20,
                        font: {
                          size: 10
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(19, 36, 48, 0.8)',
                      titleColor: '#f6f4ef',
                      bodyColor: '#f6f4ef',
                      borderColor: '#cca95a',
                      borderWidth: 1,
                      padding: 12,
                      boxPadding: 6,
                      usePointStyle: true,
                      callbacks: {
                        label: function (context) {
                          const label = context.label || '';
                          const value = Number(context.raw);
                          const percentage = ((value / totalLeads) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: '70%'
                }}
              />
            </div>
          </Card>
        </Col>
      </Row> */}

      {/* Partner Performance and Details */}
      {/* <Row gutter={[12, 12]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex justify-between items-center">
                <Title level={5} className="text-primary-dark m-0 text-sm md:text-base">Top Partner Performance</Title>
                <Dropdown menu={cardActions('Partner Performance')} placement="bottomRight" trigger={['click']}>
                  <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} />
                </Dropdown>
              </div>
            }
            bordered={false}
            className="rich-card shadow-sm"
            bodyStyle={{ padding: '16px' }}
            headStyle={{ borderBottom: '1px solid #ede9df', background: '#f6f4ef' }}
          >
            <div className="rich-card-pattern" style={{ opacity: 0.01 }}></div>
            <div className="h-[250px] sm:h-[300px] relative z-10">
              <Bar
                data={partnerPerformanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(19, 36, 48, 0.8)',
                      titleColor: '#f6f4ef',
                      bodyColor: '#f6f4ef',
                      borderColor: '#cca95a',
                      borderWidth: 1,
                      padding: 12,
                      boxPadding: 6,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(237, 233, 223, 0.5)',
                      },
                      ticks: {
                        color: '#132430',
                        font: {
                          size: 10
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: '#132430',
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex justify-between items-center">
                <Title level={5} className="text-primary-dark m-0 text-sm md:text-base">Partner Details</Title>
                <div className="flex items-center gap-2">
                  <Button
                    type="text"
                    icon={<Filter className="w-4 h-4" />}
                    className="text-xs hidden sm:flex"
                  >
                    Filter
                  </Button>
                  <Button
                    type="text"
                    icon={<Filter className="w-4 h-4" />}
                    className="text-xs sm:hidden"
                  />
                  <Dropdown menu={cardActions('Partner Details')} placement="bottomRight" trigger={['click']}>
                    <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} />
                  </Dropdown>
                </div>
              </div>
            }
            bordered={false}
            className="rich-card shadow-sm"
            bodyStyle={{ padding: '0' }}
            headStyle={{ borderBottom: '1px solid #ede9df', background: '#f6f4ef' }}
          >
            <div className="rich-card-pattern" style={{ opacity: 0.01 }}></div>
            <div className="virtual-table relative z-10">
              <List
                dataSource={currentPagePartners}
                renderItem={(partner: PartnerLeadPerformanceItem, index) => (
                  <List.Item className={`py-3 px-4 sm:py-4 sm:px-6 border-b ${index % 2 === 0 ? 'bg-secondary-light-cream/30' : 'bg-white'}`}>
                    <List.Item.Meta
                      avatar={
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-dark flex items-center justify-center text-primary-gold font-medium text-sm">
                          {partner.partnerName.charAt(0)}
                        </div>
                      }
                      title={<Text className="font-medium text-primary-dark text-sm sm:text-base">{partner.partnerName}</Text>}
                      description={
                        <div>
                          <Text className="text-slate-500 text-xs sm:text-sm">{`${partner.leadCount} leads`}</Text>
                          {partner.leads && partner.leads.length > 0 && (
                            <div className="text-xs text-slate-400 mt-1 truncate w-full max-w-[200px] sm:max-w-[250px]">
                              {partner.leads.slice(0, 2).map((lead: Lead) => lead.leadName).join(', ')}
                              {partner.leads.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      }
                    />
                    <div className="w-16 sm:w-24">
                      <Progress
                        percent={totalLeads ? Math.round((partner.leadCount / totalLeads) * 100) : 0}
                        strokeColor={{
                          '0%': '#cca95a',
                          '100%': '#d4b979',
                        }}
                        size="small"
                      />
                    </div>
                  </List.Item>
                )}
              />
            </div>
            {allPartners.length > partnersPerPage && (
              <div className="p-3 sm:p-4 border-t border-secondary-cream relative z-10">
                <Pagination
                  current={partnerPage}
                  pageSize={partnersPerPage}
                  total={allPartners.length}
                  onChange={setPartnerPage}
                  size="small"
                  showSizeChanger={false}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row> */}

      {/* Deals Analytics Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 mb-3 sm:mt-8 sm:mb-4">
        <Title level={4} className="text-lg sm:text-xl md:text-2xl m-0 mb-2 sm:mb-0">Deal Analytics & Revenue Insights</Title>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="dashboard-tabs w-full sm:w-auto"
          size="small"
        >
          <TabPane tab="Summary" key="1" />
          <TabPane tab="Performance" key="2" />
          <TabPane tab="Forecast" key="3" />
        </Tabs>
      </div>

      {/* Deal Summary Cards */}
      {activeTab === '1' && (
        <>
          <Row gutter={[8, 8]} className="mb-2">
            <Col xs={12} sm={12} lg={6}>
              <Card
                bordered={false}
                className="rich-card-dark h-full"
                bodyStyle={{ padding: '12px', height: '100%' }}
              >
                <div className="rich-card-pattern"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="stat-title text-secondary-cream mb-1 text-xs sm:text-sm">Total Deals</div>
                    <div className="stat-value text-white text-lg sm:text-xl md:text-2xl">{totalDeals}</div>
                    <div className="text-secondary-cream/80 rounded-md text-primary-gold text-xs sm:text-sm">
                      {avgDealValue.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      })} avg value
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-[#1c3141] shadow-inner">
                    <TrendingUp className="text-[#cca95a] w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <Progress
                  percent={Math.min(100, Math.round((totalDeals / 100) * 100))}
                  showInfo={false}
                  strokeColor="#cca95a"
                  trailColor="rgba(255,255,255,0.1)"
                  className="mt-0"
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card
                bordered={false}
                className="rich-card-dark h-full"
                bodyStyle={{ padding: '12px', height: '100%' }}
              >
                <div className="rich-card-pattern"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="stat-title text-secondary-cream mb-1 text-xs sm:text-sm">Total Deal Value</div>
                    <div className="stat-value text-white text-lg sm:text-xl md:text-2xl">
                      {totalDealValue.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                        notation: totalDealValue > 1000000 ? 'compact' : 'standard'
                      })}
                    </div>
                    <div className="text-secondary-cream/80 rounded-md text-primary-gold text-xs sm:text-sm">
                      {totalDeals > 0 ?
                        `Across ${totalDeals} total deals` :
                        'No deals created yet'}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-[#1c3141] shadow-inner">
                    <DollarSign className="text-[#cca95a] w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <Progress
                  percent={Math.min(100, Math.round((totalDealValue / 1000000) * 100))}
                  showInfo={false}
                  strokeColor="#cca95a"
                  trailColor="rgba(255,255,255,0.1)"
                  className="mt-0"
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card
                bordered={false}
                className="rich-card-dark h-full"
                bodyStyle={{ padding: '12px', height: '100%' }}
              >
                <div className="rich-card-pattern"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="stat-title text-secondary-cream mb-1 text-xs sm:text-sm">Contact Conversion</div>
                    <div className="stat-value text-white text-lg sm:text-xl md:text-2xl">{overallConversionRate.toFixed(1)}%</div>
                    <div className="text-secondary-cream/80 rounded-md text-primary-gold text-xs sm:text-sm">
                      {conversionData ?
                        `${conversionData.contactsWithDeals} of ${conversionData.totalContacts} contacts` :
                        'No conversion data yet'}
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-[#1c3141] shadow-inner">
                    <PieChart className="text-[#cca95a] w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <Progress
                  percent={overallConversionRate}
                  showInfo={false}
                  strokeColor="#cca95a"
                  trailColor="rgba(255,255,255,0.1)"
                  className="mt-0"
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card
                bordered={false}
                className="rich-card-dark h-full"
                bodyStyle={{ padding: '12px', height: '100%' }}
              >
                <div className="rich-card-pattern"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="stat-title text-secondary-cream mb-1 text-xs sm:text-sm">Revenue Forecast</div>
                    <div className="stat-value text-white text-lg sm:text-xl md:text-2xl">
                      {(forecastData?.totalForecast || 0).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                        notation: (forecastData?.totalForecast || 0) > 1000000 ? 'compact' : 'standard'
                      })}
                    </div>
                    <div className="text-secondary-cream/80 rounded-md text-primary-gold text-xs sm:text-sm">
                      Next {forecastMonthlyData.length} months
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-[#1c3141] shadow-inner">
                    <BarChart2 className="text-[#cca95a] w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <Progress
                  percent={Math.min(100, Math.round(((forecastData?.totalForecast || 0) / 2000000) * 100))}
                  showInfo={false}
                  strokeColor="#cca95a"
                  trailColor="rgba(255,255,255,0.1)"
                  className="mt-0"
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* First Row of Deal Charts */}
          <Row gutter={[8, 8]} className="mt-4">
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-sm sm:text-base">Deal Stage Distribution</span>
                }
                className="rich-card"
                extra={
                  <Dropdown menu={cardActions('Deal Performance')} placement="bottomRight">
                    <Button type="text" size="small" className="flex items-center text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </Dropdown>
                }
                bodyStyle={{ padding: '12px' }}
              >
                <div className="h-[220px] sm:h-[300px] flex items-center justify-center relative z-10">
                  <Doughnut
                    data={dealStageData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                            color: '#132430',
                            padding: window.innerWidth < 768 ? 8 : 20,
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(19, 36, 48, 0.8)',
                          titleColor: '#f6f4ef',
                          bodyColor: '#f6f4ef',
                          borderColor: '#cca95a',
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                          usePointStyle: true,
                          callbacks: {
                            label: function (context) {
                              const label = context.label || '';
                              const value = Number(context.raw);
                              const percentage = ((value / totalDeals) * 100).toFixed(1);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      cutout: '70%'
                    }}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-sm sm:text-base">Deal Growth Timeline</span>
                }
                className="rich-card"
                extra={
                  <Dropdown menu={cardActions('Deal Timeline')} placement="bottomRight">
                    <Button type="text" size="small" className="flex items-center text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </Dropdown>
                }
                bodyStyle={{ padding: '12px' }}
              >
                <div className="h-[220px] sm:h-[300px] relative z-10">
                  <Line
                    data={monthlyDealData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 11
                            }
                          }
                        },
                        title: {
                          display: false,
                          text: 'Monthly Deal Count & Value',
                          color: '#132430',
                          font: {
                            size: 13,
                            weight: 500
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: window.innerWidth >= 768,
                            text: 'Deal Count',
                            color: '#cca95a'
                          },
                          grid: {
                            color: 'rgba(237, 233, 223, 0.5)',
                          },
                          ticks: {
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        },
                        y1: {
                          beginAtZero: true,
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                            display: window.innerWidth >= 768,
                            text: 'Deal Value',
                            color: '#2a4a67'
                          },
                          grid: {
                            display: false,
                          },
                          ticks: {
                            callback: (value) => {
                              return value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact'
                              });
                            },
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            },
                            maxRotation: 45,
                            minRotation: 45
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Deal Performance Tab */}
      {activeTab === '2' && (
        <>
          {/* Mobile selector for different performance views */}
          <div className="block sm:hidden mb-3">
            <Select
              className="w-full"
              value={performanceView}
              onChange={setPerformanceView}
              options={[
                { value: 'partner-performance', label: 'Partner Deal Performance' },
                { value: 'conversion', label: 'Contact-to-Deal Conversion' },
                { value: 'analytics', label: 'Partner Analytics' }
              ]}
              style={{
                borderColor: '#cca95a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              dropdownStyle={{
                borderColor: '#cca95a',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
              placeholder="Select metric to view"
              bordered
              size="middle"
            />
          </div>

          <Row gutter={[8, 8]} className="hidden sm:flex">
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-sm sm:text-base">Partner Deal Performance</span>
                }
                className="rich-card"
                extra={
                  <Dropdown menu={cardActions('Partner Deal Performance')} placement="bottomRight">
                    <Button type="text" size="small" className="flex items-center text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </Dropdown>
                }
                bodyStyle={{ padding: '12px' }}
              >
                <div className="h-[220px] sm:h-[300px] relative z-10">
                  <Bar
                    data={partnerAnalyticsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 11
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(19, 36, 48, 0.8)',
                          titleColor: '#f6f4ef',
                          bodyColor: '#f6f4ef',
                          borderColor: '#cca95a',
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: window.innerWidth >= 768,
                            text: 'Deal Value',
                            color: '#cca95a'
                          },
                          grid: {
                            color: 'rgba(237, 233, 223, 0.5)',
                          },
                          ticks: {
                            callback: (value) => {
                              return value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact'
                              });
                            },
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        },
                        y1: {
                          beginAtZero: true,
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                            display: window.innerWidth >= 768,
                            text: 'Win Rate %',
                            color: '#2a4a67'
                          },
                          max: 100,
                          grid: {
                            display: false,
                          },
                          ticks: {
                            callback: (value) => `${value}%`,
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-sm sm:text-base">Contact-to-Deal Conversion</span>
                }
                className="rich-card"
                extra={
                  <Dropdown menu={cardActions('Conversion Funnel')} placement="bottomRight">
                    <Button type="text" size="small" className="flex items-center text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </Dropdown>
                }
                bodyStyle={{ padding: '12px' }}
              >
                <div className="h-[220px] sm:h-[300px] relative z-10">
                  <Bar
                    data={conversionFunnelData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 11
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(19, 36, 48, 0.8)',
                          titleColor: '#f6f4ef',
                          bodyColor: '#f6f4ef',
                          borderColor: '#cca95a',
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                          callbacks: {
                            afterTitle: function (context) {
                              const status = context[0].label;
                              const conversionRate = conversionData?.conversionByStatus[status];
                              if (conversionRate !== undefined) {
                                return `Conversion Rate: ${conversionRate.toFixed(1)}%`;
                              }
                              return '';
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          stacked: false,
                          grid: {
                            color: 'rgba(237, 233, 223, 0.5)',
                          },
                          ticks: {
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Conditional mobile view based on selection */}
          <div className="block sm:hidden">
            {performanceView === 'partner-performance' && (
              <Card
                title={
                  <span className="text-sm sm:text-base">Partner Deal Performance</span>
                }
                className="rich-card"
                extra={
                  <Dropdown menu={cardActions('Partner Deal Performance')} placement="bottomRight">
                    <Button type="text" size="small" className="flex items-center text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </Dropdown>
                }
                bodyStyle={{ padding: '12px' }}
              >
                <div className="h-[250px] relative z-10">
                  <Bar
                    data={partnerAnalyticsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 11
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(19, 36, 48, 0.8)',
                          titleColor: '#f6f4ef',
                          bodyColor: '#f6f4ef',
                          borderColor: '#cca95a',
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: window.innerWidth >= 768,
                            text: 'Deal Value',
                            color: '#cca95a'
                          },
                          grid: {
                            color: 'rgba(237, 233, 223, 0.5)',
                          },
                          ticks: {
                            callback: (value) => {
                              return value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact'
                              });
                            },
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        },
                        y1: {
                          beginAtZero: true,
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                            display: window.innerWidth >= 768,
                            text: 'Win Rate %',
                            color: '#2a4a67'
                          },
                          max: 100,
                          grid: {
                            display: false,
                          },
                          ticks: {
                            callback: (value) => `${value}%`,
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            )}

            {performanceView === 'conversion' && (
              <Card
                title={
                  <span className="text-sm sm:text-base">Contact-to-Deal Conversion</span>
                }
                className="rich-card"
                extra={
                  <Dropdown menu={cardActions('Conversion Funnel')} placement="bottomRight">
                    <Button type="text" size="small" className="flex items-center text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </Dropdown>
                }
                bodyStyle={{ padding: '12px' }}
              >
                <div className="h-[250px] relative z-10">
                  <Bar
                    data={conversionFunnelData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 11
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(19, 36, 48, 0.8)',
                          titleColor: '#f6f4ef',
                          bodyColor: '#f6f4ef',
                          borderColor: '#cca95a',
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                          callbacks: {
                            afterTitle: function (context) {
                              const status = context[0].label;
                              const conversionRate = conversionData?.conversionByStatus[status];
                              if (conversionRate !== undefined) {
                                return `Conversion Rate: ${conversionRate.toFixed(1)}%`;
                              }
                              return '';
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          stacked: false,
                          grid: {
                            color: 'rgba(237, 233, 223, 0.5)',
                          },
                          ticks: {
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: '#132430',
                            font: {
                              size: window.innerWidth < 768 ? 8 : 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Partner Analytics Table */}
          {(performanceView === 'analytics' || !isMobile) && (
            <Row gutter={[8, 8]} className="mt-4">
              <Col xs={24}>
                <Card
                  title={
                    <span className="text-sm sm:text-base">Comprehensive Partner Performance</span>
                  }
                  className="rich-card"
                  extra={
                    <Dropdown menu={cardActions('Partner Analytics')} placement="bottomRight">
                      <Button type="text" size="small" className="flex items-center text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </Dropdown>
                  }
                  bodyStyle={{ padding: '12px' }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="py-2 px-2 sm:px-3 text-left">Partner</th>
                          <th className="py-2 px-1 sm:px-3 text-right">Contacts</th>
                          <th className="py-2 px-1 sm:px-3 text-right">Deals</th>
                          <th className="py-2 px-1 sm:px-3 text-right">Total Value</th>
                          <th className="py-2 px-1 sm:px-3 text-right">Conv.</th>
                          <th className="py-2 px-1 sm:px-3 text-right">Win Rate</th>
                          <th className="py-2 px-1 sm:px-3 text-right">Avg Deal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partnerAnalytics.slice(0, 10).map((partner, index) => (
                          <tr key={partner.partnerId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-2 px-2 sm:px-3 text-left truncate max-w-[80px] sm:max-w-none">{partner.partnerName}</td>
                            <td className="py-2 px-1 sm:px-3 text-right">{partner.metrics.contactCount}</td>
                            <td className="py-2 px-1 sm:px-3 text-right">{partner.metrics.dealCount}</td>
                            <td className="py-2 px-1 sm:px-3 text-right">
                              {partner.metrics.totalDealValue.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0,
                                notation: window.innerWidth < 768 ? 'compact' : 'standard'
                              })}
                            </td>
                            <td className="py-2 px-1 sm:px-3 text-right">{partner.metrics.conversionRate.toFixed(1)}%</td>
                            <td className="py-2 px-1 sm:px-3 text-right">{partner.metrics.winRate.toFixed(1)}%</td>
                            <td className="py-2 px-1 sm:px-3 text-right">
                              {partner.metrics.avgDealValue.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0,
                                notation: window.innerWidth < 768 ? 'compact' : 'standard'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* Revenue Forecast Tab */}
      {activeTab === '3' && (
        <>
          {/* Mobile selector for different forecast views */}
          <div className="block sm:hidden mb-3">
            <Select
              className="w-full"
              value={forecastView}
              onChange={setForecastView}
              options={[
                { value: 'revenue-forecast', label: 'Revenue Forecast' },
                { value: 'forecast-by-partner', label: 'Forecast by Partner' },
                { value: 'forecast-by-stage', label: 'Forecast by Deal Stage' }
              ]}
              style={{
                borderColor: '#cca95a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              dropdownStyle={{
                borderColor: '#cca95a',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
              placeholder="Select forecast view"
              bordered
              size="middle"
            />
          </div>

          {/* Revenue Forecast Chart - always visible on desktop, conditionally on mobile */}
          {(forecastView === 'revenue-forecast' || !isMobile) && (
            <Row gutter={[8, 8]}>
              <Col xs={24}>
                <Card
                  title={
                    <span className="text-sm sm:text-base">Revenue Forecast</span>
                  }
                  className="rich-card"
                  extra={
                    <Dropdown menu={cardActions('Revenue Forecast')} placement="bottomRight">
                      <Button type="text" size="small" className="flex items-center text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </Dropdown>
                  }
                  bodyStyle={{ padding: '12px' }}
                >
                  <div className="h-[220px] sm:h-[300px] relative z-10">
                    <Line
                      data={revenueForecastData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              usePointStyle: true,
                              boxWidth: 6,
                              color: '#132430',
                              font: {
                                size: 11
                              }
                            }
                          },
                          title: {
                            display: true,
                            text: 'Monthly Revenue Forecast',
                            color: '#132430',
                            font: {
                              size: 13,
                              weight: 500
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(19, 36, 48, 0.8)',
                            titleColor: '#f6f4ef',
                            bodyColor: '#f6f4ef',
                            borderColor: '#4caf50',
                            borderWidth: 1,
                            padding: 12,
                            boxPadding: 6,
                            callbacks: {
                              label: function (context) {
                                return `Forecast: ${Number(context.raw).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD'
                                })}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(237, 233, 223, 0.5)',
                            },
                            ticks: {
                              callback: (value) => {
                                return value.toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  notation: 'compact'
                                });
                              },
                              color: '#132430',
                              font: {
                                size: window.innerWidth < 768 ? 8 : 10
                              }
                            }
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                            ticks: {
                              color: '#132430',
                              font: {
                                size: window.innerWidth < 768 ? 8 : 10
                              },
                              maxRotation: 45,
                              minRotation: 45
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Forecast by Partner and Stage - desktop view */}
          <Row gutter={[8, 8]} className={`mt-4 ${isMobile ? 'hidden' : 'flex'}`}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-sm sm:text-base">Forecast by Partner</span>
                }
                className="rich-card"
                bodyStyle={{ padding: '12px' }}
              >
                <div className="h-[250px] sm:h-[300px] overflow-y-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="py-2 px-2 sm:px-3 text-left">Partner</th>
                        <th className="py-2 px-1 sm:px-3 text-right">Forecast Value</th>
                        <th className="py-2 px-1 sm:px-3 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData?.byStage ?
                        Object.entries(forecastData.byStage)
                          .sort(([, a], [, b]) => b - a)
                          .map(([stage, value], index) => (
                            <tr key={stage} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="py-2 px-3 text-left">
                                <span
                                  className="inline-flex items-center text-xs rounded-full px-2 py-1"
                                  style={{
                                    backgroundColor: getDealStageColor(stage).bg,
                                    color: getDealStageColor(stage).text,
                                    border: `1px solid ${getDealStageColor(stage).border}`,
                                    fontWeight: 500
                                  }}
                                >
                                  {stage}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                {value.toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  maximumFractionDigits: 0
                                })}
                              </td>
                              <td className="py-2 px-3 text-right">
                                {((value / forecastData.totalForecast) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          )) :
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-gray-500">No forecast data available</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-sm sm:text-base">Forecast by Deal Stage</span>
                }
                className="rich-card"
                bodyStyle={{ padding: '12px' }}
              >
                <div className="h-[250px] sm:h-[300px] overflow-y-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="py-2 px-2 sm:px-3 text-left">Deal Stage</th>
                        <th className="py-2 px-1 sm:px-3 text-right">Forecast Value</th>
                        <th className="py-2 px-1 sm:px-3 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData?.byStage ?
                        Object.entries(forecastData.byStage)
                          .sort(([, a], [, b]) => b - a)
                          .map(([stage, value], index) => (
                            <tr key={stage} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="py-2 px-2 sm:px-3 text-left">
                                <span
                                  className="inline-flex items-center text-xs rounded-full px-1 py-0.5 sm:px-2 sm:py-1"
                                  style={{
                                    backgroundColor: getDealStageColor(stage).bg,
                                    color: getDealStageColor(stage).text,
                                    border: `1px solid ${getDealStageColor(stage).border}`,
                                    fontWeight: 500
                                  }}
                                >
                                  {stage}
                                </span>
                              </td>
                              <td className="py-2 px-1 sm:px-3 text-right">
                                {value.toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  maximumFractionDigits: 0,
                                  notation: window.innerWidth < 768 ? 'compact' : 'standard'
                                })}
                              </td>
                              <td className="py-2 px-1 sm:px-3 text-right">
                                {((value / forecastData.totalForecast) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          )) :
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-gray-500">No forecast data available</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Mobile view for Partner forecast */}
          {isMobile && forecastView === 'forecast-by-partner' && (
            <Card
              title={
                <span className="text-sm sm:text-base">Forecast by Partner</span>
              }
              className="rich-card"
              bodyStyle={{ padding: '12px' }}
            >
              <div className="h-[300px] overflow-y-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="py-2 px-2 sm:px-3 text-left">Partner</th>
                      <th className="py-2 px-1 sm:px-3 text-right">Forecast Value</th>
                      <th className="py-2 px-1 sm:px-3 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData?.byPartner ?
                      Object.entries(forecastData.byPartner)
                        .sort(([, a], [, b]) => b - a)
                        .map(([partner, value], index) => (
                          <tr key={partner} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-2 px-2 sm:px-3 text-left truncate max-w-[100px] sm:max-w-none">{partner}</td>
                            <td className="py-2 px-1 sm:px-3 text-right">
                              {value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0,
                                notation: window.innerWidth < 768 ? 'compact' : 'standard'
                              })}
                            </td>
                            <td className="py-2 px-1 sm:px-3 text-right">
                              {((value / forecastData.totalForecast) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        )) :
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500">No forecast data available</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Mobile view for Stage forecast */}
          {isMobile && forecastView === 'forecast-by-stage' && (
            <Card
              title={
                <span className="text-sm sm:text-base">Forecast by Deal Stage</span>
              }
              className="rich-card"
              bodyStyle={{ padding: '12px' }}
            >
              <div className="h-[300px] overflow-y-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="py-2 px-2 sm:px-3 text-left">Deal Stage</th>
                      <th className="py-2 px-1 sm:px-3 text-right">Forecast Value</th>
                      <th className="py-2 px-1 sm:px-3 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData?.byStage ?
                      Object.entries(forecastData.byStage)
                        .sort(([, a], [, b]) => b - a)
                        .map(([stage, value], index) => (
                          <tr key={stage} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-2 px-2 sm:px-3 text-left">
                              <span
                                className="inline-flex items-center text-xs rounded-full px-1 py-0.5 sm:px-2 sm:py-1"
                                style={{
                                  backgroundColor: getDealStageColor(stage).bg,
                                  color: getDealStageColor(stage).text,
                                  border: `1px solid ${getDealStageColor(stage).border}`,
                                  fontWeight: 500
                                }}
                              >
                                {stage}
                              </span>
                            </td>
                            <td className="py-2 px-1 sm:px-3 text-right">
                              {value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0,
                                notation: window.innerWidth < 768 ? 'compact' : 'standard'
                              })}
                            </td>
                            <td className="py-2 px-1 sm:px-3 text-right">
                              {((value / forecastData.totalForecast) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        )) :
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500">No forecast data available</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
