// import React, { useEffect } from 'react';
// import { Tree, Card, Spin } from 'antd';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../redux/store';
// import { fetchLeadHierarchy } from '../../redux/slices/leadSlice';
// import type { LeadHierarchy } from '../../types/lead';

// const LeadHierarchyTree: React.FC<{ partnerId: string }> = ({ partnerId }) => {
//     const dispatch = useDispatch<AppDispatch>();
//     const { hierarchy, loading } = useSelector((state: RootState) => state.lead);

//     useEffect(() => {
//         if (partnerId) {
//             dispatch(fetchLeadHierarchy(partnerId));
//         }
//     }, [dispatch, partnerId]);

//     // Convert Lead Hierarchy to Ant Design Tree Data Structure
//     const convertToTreeData = (lead: LeadHierarchy | null) => {
//         if (!lead) return [];
//         return [
//             {
//                 title: lead.Name,
//                 key: lead.id,
//                 children: lead.Sub_Partners ? lead.Sub_Partners.map(convertToTreeData).flat() : [],
//             },
//         ];
//     };

//     return (
//         <Card title="Lead Hierarchy" className="w-full">
//             {loading ? (
//                 <Spin />
//             ) : (
//                 <Tree treeData={convertToTreeData(hierarchy)} defaultExpandAll />
//             )}
//         </Card>
//     );
// };

// export default LeadHierarchyTree;


import React, { useState } from 'react';
import {
    Card,
    Collapse,
    Badge,
    Typography,
    Tooltip,
    Empty,
    Input,
    Select
} from 'antd';
import {
    PhoneCall,
    Mail,
    User,
    Filter,
    Search,
    ChevronRight
} from 'lucide-react';

const { Panel } = Collapse;
const { Text } = Typography;
const { Option } = Select;

interface LeadNode {
    partnerId: string;
    partnerName: string;
    Phone_Number: string;
    Email?: string | null;
    leads: {
        id: string;
        LeadName: string;
        Phone_Number: string;
        Email?: string | null;
        Owner: {
            id: string;
            name: string;
            email: string;
        }
    }[];
    subPartners: LeadNode[];
}

const LeadHierarchyView: React.FC<{ data: LeadNode[] }> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'with-leads' | 'with-subpartners'>('all');

    // Custom filter function
    const filterData = (nodes: LeadNode[]) => {
        return nodes.filter(node => {
            // Search filter
            const matchesSearch =
                node.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.leads.some(lead =>
                    lead.LeadName.toLowerCase().includes(searchTerm.toLowerCase())
                );

            // Type filter
            const matchesType =
                filterType === 'all' ||
                (filterType === 'with-leads' && node.leads.length > 0) ||
                (filterType === 'with-subpartners' && node.subPartners.length > 0);

            return matchesSearch && matchesType;
        });
    };

    const renderLeadItem = (lead: LeadNode['leads'][0]) => (
        <div
            key={lead.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
        >
            <div className="flex items-center space-x-3">
                <PhoneCall className="text-green-600 w-5 h-5" />
                <div>
                    <Text strong>{lead.LeadName}</Text>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <span>{lead.Phone_Number}</span>
                        {lead.Email && (
                            <Tooltip title={lead.Email}>
                                <Mail className="w-3 h-3 text-gray-400" />
                            </Tooltip>
                        )}
                    </div>
                    <div className="text-xs text-gray-500">
                        Owner: {lead.Owner.name}
                    </div>
                </div>
            </div>
            <Badge
                count={1}
                color="green"
                className="transform scale-75"
            />
        </div>
    );

    const renderPartnerPanel = (partner: LeadNode) => (
        <Panel
            key={partner.partnerId}
            header={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <User className="text-blue-600 w-5 h-5" />
                        <div>
                            <Text strong>{partner.partnerName}</Text>
                            <div className="text-xs text-gray-500">
                                {partner.Phone_Number}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {partner.leads.length > 0 && (
                            <Badge
                                count={partner.leads.length}
                                color="green"
                            />
                        )}
                        {partner.subPartners.length > 0 && (
                            <Badge
                                count={partner.subPartners.length}
                                color="blue"
                            />
                        )}
                    </div>
                </div>
            }
        >
            <div className="space-y-2">
                {partner.leads.length > 0 && (
                    <div>
                        <Text type="secondary" className="text-xs uppercase">Leads</Text>
                        {partner.leads.map(renderLeadItem)}
                    </div>
                )}

                {partner.subPartners.length > 0 && (
                    <div>
                        <Text type="secondary" className="text-xs uppercase">Sub Partners</Text>
                        <Collapse ghost>
                            {partner.subPartners.map(renderPartnerPanel)}
                        </Collapse>
                    </div>
                )}
            </div>
        </Panel>
    );

    const filteredData = filterData(data);

    return (
        <Card
            title="Lead Hierarchy"
            extra={
                <div className="flex items-center space-x-2">
                    <Input
                        prefix={<Search className="text-gray-400" />}
                        placeholder="Search partners or leads"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-48"
                    />
                    <Select
                        value={filterType}
                        onChange={(value) => setFilterType(value)}
                        className="w-48"
                    >
                        <Option value="all">All Partners</Option>
                        <Option value="with-leads">Partners with Leads</Option>
                        <Option value="with-subpartners">Partners with Sub-Partners</Option>
                    </Select>
                </div>
            }
        >
            {filteredData.length > 0 ? (
                <Collapse
                    accordion
                    expandIcon={({ isActive }) => (
                        <ChevronRight
                            className={`transform transition-transform ${isActive ? 'rotate-90' : ''}`}
                        />
                    )}
                >
                    {filteredData.map(renderPartnerPanel)}
                </Collapse>
            ) : (
                <Empty description="No partners found" />
            )}
        </Card>
    );
};

export default LeadHierarchyView;