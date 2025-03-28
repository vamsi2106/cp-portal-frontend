import React, { useState } from 'react';
import { Tree, Card, Input, Select, Button, Tooltip, Badge } from 'antd';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { LeadNode } from '../../types/lead';

const LeadHierarchyView: React.FC<{ data: LeadNode[] }> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'with-leads' | 'with-subpartners'>('all');
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

    const transformToTreeData = (nodes: LeadNode[]): any[] => {
        return nodes.map(node => ({
            key: node.partnerId,
            title: (
                <div className="flex items-center justify-between w-full pr-4">
                    <div>
                        <span className="font-medium">{node.partnerName}</span>
                        <span className="text-gray-500 text-sm ml-2">({node.Phone_Number})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge count={node.leads.length} className="site-badge-count-4" />
                        <Badge count={node.subPartners.length} className="site-badge-count-4" style={{ backgroundColor: '#52c41a' }} />
                    </div>
                </div>
            ),
            children: [
                ...node.leads.map(lead => ({
                    key: `lead-${lead.id}`,
                    title: (
                        <Tooltip title={`Owner: ${lead.Owner.name}`}>
                            <div className="flex items-center text-green-600">
                                <span>{lead.LeadName}</span>
                                <span className="text-gray-500 text-sm ml-2">({lead.Phone_Number})</span>
                            </div>
                        </Tooltip>
                    ),
                    isLeaf: true,
                })),
                ...transformToTreeData(node.subPartners)
            ],
        }));
    };

    const filterData = (nodes: LeadNode[]) => {
        if (selectedPartnerId) {
            const findSelectedPartner = (partners: LeadNode[]): LeadNode | null => {
                for (const partner of partners) {
                    if (partner.partnerId === selectedPartnerId) return partner;
                    const found = findSelectedPartner(partner.subPartners);
                    if (found) return found;
                }
                return null;
            };
            
            const selectedPartner = findSelectedPartner(nodes);
            if (selectedPartner) {
                return [selectedPartner];
            }
            return [];
        }

        return nodes.filter(node => {
            const matchesSearch =
                node.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.leads.some(lead =>
                    lead.LeadName.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesType =
                filterType === 'all' ||
                (filterType === 'with-leads' && node.leads.length > 0) ||
                (filterType === 'with-subpartners' && node.subPartners.length > 0);

            return matchesSearch && matchesType;
        });
    };

    return (
        <Card className="lead-hierarchy-view">
            <div className="flex flex-wrap gap-4 mb-4">
                <Input
                    prefix={<Search className="w-4 h-4" />}
                    placeholder="Search partners or leads..."
                    onChange={e => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
                <Select
                    defaultValue="all"
                    onChange={value => setFilterType(value)}
                    options={[
                        { value: 'all', label: 'All Partners' },
                        { value: 'with-leads', label: 'Partners with Leads' },
                        { value: 'with-subpartners', label: 'Partners with Sub-partners' },
                    ]}
                    className="min-w-[200px]"
                />
                <Button
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={() => {
                        setSearchTerm('');
                        setFilterType('all');
                    }}
                >
                    Reset Filters
                </Button>
            </div>
            <Tree
                showLine={{ showLeafIcon: false }}
                defaultExpandAll
                treeData={transformToTreeData(filterData(data))}
                className="custom-tree"
                onSelect={(selectedKeys) => {
                    const partnerId = selectedKeys[0]?.toString();
                    if (partnerId && !partnerId.startsWith('lead-')) {
                        setSelectedPartnerId(partnerId === selectedPartnerId ? null : partnerId);
                    }
                }}
                selectedKeys={selectedPartnerId ? [selectedPartnerId] : []}
            />
            {selectedPartnerId && (
                <Button
                    className="mt-4"
                    onClick={() => setSelectedPartnerId(null)}
                >
                    Clear Selection
                </Button>
            )}
        </Card>
    );
};

export default LeadHierarchyView;