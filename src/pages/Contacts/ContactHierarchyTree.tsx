import React, { useState, useEffect } from 'react';
import { Tree, Input, Select, Button, Badge, Empty, Divider } from 'antd';
import { Search, Filter, RefreshCw, User, Phone, Mail, ChevronRight, Star } from 'lucide-react';

// Define types locally since the import is causing issues
interface Owner {
    id: string;
    name: string;
}

interface Contact {
    id: string;
    ContactName: string;
    Email?: string | null;
    Phone_Number?: string | null;
    Contact_Status?: string | null;
    Lead_Status?: string | null;
    Product?: string | null;
    Created_Time?: string | null;
    Owner?: Owner;
}

interface PartnerNode {
    partnerId: string;
    partnerName: string;
    Email?: string | null;
    Phone_Number?: string | null;
    Address?: string | null;
    contacts: Contact[];
    subPartners: PartnerNode[];
}

// Clean, Ridhira-themed visual styles
const styles = {
    nodeContainer: {
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '12px',
        width: '100%',
        backgroundColor: 'white',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        transition: 'all 0.3s',
        marginBottom: '6px',
    },
    nodeContainerHover: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        borderColor: 'rgb(204, 169, 90)',
    },
    primaryPartnerNode: {
        borderLeft: '3px solid rgb(204, 169, 90)',
    },
    subPartnerNode: {
        borderLeft: '3px solid rgba(204, 169, 90, 0.7)',
    },
    contactNode: {
        border: '1px solid #f0f0f0',
        borderRadius: '6px',
        padding: '8px 12px',
        margin: '4px 0',
        backgroundColor: 'rgb(246, 244, 239)',
        display: 'flex',
        alignItems: 'center',
    },
    contactIcon: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgb(237, 233, 223)',
        border: '1px solid #e6e6e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '8px',
        flexShrink: 0,
    },
    partnerIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'rgb(19, 36, 48)',
        color: 'rgb(204, 169, 90)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '8px',
        flexShrink: 0,
    },
    headerTitle: {
        fontWeight: 600,
        fontSize: '15px',
        color: 'rgb(19, 36, 48)',
        marginBottom: '2px',
    },
    statBadge: {
        backgroundColor: 'rgba(204, 169, 90, 0.1)',
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: '12px',
        color: 'rgb(19, 36, 48)',
        marginLeft: '6px',
        border: '1px solid rgba(204, 169, 90, 0.2)',
    },
    customStyles: `
        /* Theme variables */
        :root {
            --primary-gold: rgb(204, 169, 90);
            --primary-gold-light: rgba(204, 169, 90, 0.15);
            --dark-navy: rgb(19, 36, 48);
            --light-cream: rgb(246, 244, 239);
            --medium-cream: rgb(237, 233, 223);
        }
        
        /* Tree component styling */
        .partner-hierarchy-tree .ant-tree-switcher {
            color: var(--primary-gold);
        }
        
        .partner-hierarchy-tree .ant-tree-node-content-wrapper:hover {
            background-color: var(--light-cream);
        }
        
        .partner-hierarchy-tree .ant-tree-treenode-selected .ant-tree-node-content-wrapper {
            background-color: var(--light-cream) !important;
        }
        
        .partner-hierarchy-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
            background-color: var(--light-cream) !important;
        }
        
        /* Status Tag Styling */
        .status-tag {
            display: inline-flex;
            align-items: center;
            height: 22px;
            padding: 0 8px;
            font-size: 12px;
            border-radius: 4px;
            line-height: 20px;
        }
        
        .status-tag-new {
            background-color: rgba(204, 169, 90, 0.15);
            border: 1px solid rgba(204, 169, 90, 0.5);
            color: rgb(153, 118, 39);
        }
        
        .status-tag-contacted {
            background-color: rgba(236, 190, 117, 0.15);
            border: 1px solid rgba(236, 190, 117, 0.5);
            color: rgb(184, 126, 31);
        }
        
        .status-tag-qualified {
            background-color: rgba(100, 141, 174, 0.15);
            border: 1px solid rgba(100, 141, 174, 0.5);
            color: rgb(43, 90, 128);
        }
        
        .status-tag-converted {
            background-color: rgba(87, 148, 133, 0.15);
            border: 1px solid rgba(87, 148, 133, 0.5);
            color: rgb(43, 100, 87);
        }
        
        .status-tag-lost {
            background-color: rgba(179, 98, 96, 0.15);
            border: 1px solid rgba(179, 98, 96, 0.5);
            color: rgb(141, 58, 58);
        }
        
        /* Filter section styling */
        .hierarchy-filter-container {
            background-color: white;
            border: 1px solid #ede9df;
            border-radius: 6px;
            margin-bottom: 16px;
            overflow: hidden;
        }
        
        .hierarchy-filter-header {
            padding: 12px 16px;
            background-color: var(--dark-navy);
            color: white;
        }
        
        .hierarchy-actions .ant-btn {
            color: var(--dark-navy);
            border-color: var(--primary-gold);
        }
        
        .hierarchy-actions .ant-btn:hover {
            color: var(--primary-gold);
            border-color: var(--primary-gold);
            background-color: rgba(204, 169, 90, 0.05);
        }
        
        .gold-btn {
            background-color: var(--primary-gold);
            border-color: var(--primary-gold);
            color: white;
        }
        
        .gold-btn:hover {
            background-color: rgb(184, 149, 70);
            border-color: rgb(184, 149, 70);
            color: white;
        }
        
        /* Mobile optimizations */
        @media (max-width: 767px) {
            .hierarchy-controls {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .hierarchy-controls > * {
                margin-bottom: 8px;
                width: 100%;
            }
            
            .hierarchy-stats {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    `,
};

// Status colors with Ridhira theme
const getStatusTagClass = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'new':
            return 'status-tag status-tag-new';
        case 'contacted':
            return 'status-tag status-tag-contacted';
        case 'qualified':
            return 'status-tag status-tag-qualified';
        case 'converted':
            return 'status-tag status-tag-converted';
        case 'lost':
            return 'status-tag status-tag-lost';
        case 'in progress':
            return 'status-tag status-tag-contacted';
        case 'pending':
            return 'status-tag status-tag-new';
        case 'new lead':
            return 'status-tag status-tag-new';
        default:
            return 'status-tag status-tag-new';
    }
};

// Simplified hierarchy tree component
const ContactHierarchyTree: React.FC<{ data: PartnerNode[] }> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [productFilter, setProductFilter] = useState<string[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    useEffect(() => {
        // Auto-expand top-level nodes
        if (data && data.length > 0) {
            const defaultExpanded = data.map(partner => `partner-${partner.partnerId}`);
            setExpandedKeys(defaultExpanded);
        }
    }, [data]);

    // Generate tree keys for partner and contact nodes
    useEffect(() => {
        if (data) {
            const allKeys: string[] = [];
            const collectKeys = (nodes: PartnerNode[]) => {
                nodes.forEach(partner => {
                    allKeys.push(`partner-${partner.partnerId}`);
                    if (partner.subPartners && partner.subPartners.length > 0) {
                        collectKeys(partner.subPartners);
                    }
                });
            };
            collectKeys(data);
        }
    }, [data]);

    // Status tag component
    const StatusTag = ({ status }: { status: string }) => {
        return <span className={getStatusTagClass(status)}>{status || 'New'}</span>;
    };

    // Custom node renderer
    const renderCustomNode = (node: any) => {
        // Check if node has subpartners
        const hasSubpartners = (partner: PartnerNode) => partner.subPartners && partner.subPartners.length > 0;

        // If node is a partner
        if (node.nodeType === 'partner') {
            const partner = node.data;
            const contactCount = partner.contacts.length;
            const isHovered = hoveredNode === `partner-${partner.partnerId}`;
            const nodeStyle = {
                ...styles.nodeContainer,
                ...(isHovered ? styles.nodeContainerHover : {}),
                ...(node.depth === 0 ? styles.primaryPartnerNode : styles.subPartnerNode)
            };

            const subpartnersCount = hasSubpartners(partner) ? partner.subPartners.length : 0;

            return (
                <div
                    style={nodeStyle}
                    onMouseEnter={() => setHoveredNode(`partner-${partner.partnerId}`)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="partner-node"
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={styles.partnerIcon}>
                            <User size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={styles.headerTitle}>{partner.partnerName}</div>
                                    {partner.Email &&
                                        <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                            <Mail size={12} style={{ marginRight: '4px' }} />
                                            {partner.Email}
                                        </div>
                                    }
                                    {partner.Phone_Number &&
                                        <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center' }}>
                                            <Phone size={12} style={{ marginRight: '4px' }} />
                                            {partner.Phone_Number}
                                        </div>
                                    }
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Badge count={contactCount} overflowCount={999} style={{ backgroundColor: 'rgb(204, 169, 90)', marginBottom: '4px' }} />
                                    {subpartnersCount > 0 && (
                                        <span style={styles.statBadge}>{subpartnersCount} Subpartners</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // If node is a contact
        if (node.nodeType === 'contact') {
            const contact = node.data;
            return (
                <div style={styles.contactNode}>
                    <div style={styles.contactIcon}>
                        <User size={14} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 500 }}>{contact.ContactName}</div>
                            {contact.Contact_Status || contact.Lead_Status ? (
                                <StatusTag status={contact.Contact_Status || contact.Lead_Status} />
                            ) : null}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px', marginTop: '2px' }}>
                            {contact.Phone_Number && (
                                <div style={{ color: '#666', display: 'flex', alignItems: 'center' }}>
                                    <Phone size={12} style={{ marginRight: '4px' }} />
                                    {contact.Phone_Number}
                                </div>
                            )}
                            {contact.Email && (
                                <div style={{ color: '#666', display: 'flex', alignItems: 'center' }}>
                                    <Mail size={12} style={{ marginRight: '4px' }} />
                                    {contact.Email}
                                </div>
                            )}
                            {contact.Product && (
                                <div style={{ color: '#666' }}>
                                    Product: {contact.Product}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return <div>Unknown node type</div>;
    };

    // Transform data for Tree component
    const transformToTreeData = (nodes: PartnerNode[]): any[] => {
        return nodes.map((partner, index) => {
            // Create partner node
            const partnerNode = {
                key: `partner-${partner.partnerId}`,
                title: renderCustomNode({ nodeType: 'partner', data: partner, depth: 0 }),
                children: [
                    // Add contact children
                    ...partner.contacts.map(contact => ({
                        key: `contact-${contact.id}`,
                        title: renderCustomNode({ nodeType: 'contact', data: contact }),
                        isLeaf: true,
                    })),
                    // Add subpartner children recursively
                    ...(partner.subPartners && partner.subPartners.length > 0
                        ? transformToTreeData(partner.subPartners).map(subNode => ({
                            ...subNode,
                            title: renderCustomNode({
                                nodeType: 'partner',
                                data: partner.subPartners.find(p => `partner-${p.partnerId}` === subNode.key),
                                depth: 1
                            })
                        }))
                        : [])
                ],
            };
            return partnerNode;
        });
    };

    // Filter data based on search and filters
    const filterData = (nodes: PartnerNode[]): PartnerNode[] => {
        if (!searchTerm && statusFilter.length === 0 && productFilter.length === 0) {
            return nodes;
        }

        return nodes.map(partner => {
            // Filter contacts
            const filteredContacts = partner.contacts.filter(contact => {
                const matchesSearch = searchTerm
                    ? (contact.ContactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        contact.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        contact.Phone_Number?.toLowerCase().includes(searchTerm.toLowerCase()))
                    : true;

                const matchesStatus = statusFilter.length > 0
                    ? statusFilter.some(status =>
                        (contact.Contact_Status?.toLowerCase() === status.toLowerCase()) ||
                        (contact.Lead_Status?.toLowerCase() === status.toLowerCase()))
                    : true;

                const matchesProduct = productFilter.length > 0
                    ? productFilter.includes(contact.Product || '')
                    : true;

                return matchesSearch && matchesStatus && matchesProduct;
            });

            // Filter subpartners recursively
            const filteredSubPartners = partner.subPartners ? filterData(partner.subPartners) : [];

            // Only include partner if it has matching contacts or subpartners
            return {
                ...partner,
                contacts: filteredContacts,
                subPartners: filteredSubPartners,
            };
        }).filter(partner => partner.contacts.length > 0 || partner.subPartners.some(sp => sp.contacts.length > 0));
    };

    // Handle expanding/collapsing tree nodes
    const onExpand = (expandedKeys: React.Key[]) => {
        setExpandedKeys(expandedKeys);
    };

    // Get unique statuses for filter dropdown
    const getUniqueStatuses = () => {
        const statuses = new Set<string>();
        const collectStatuses = (nodes: PartnerNode[]) => {
            nodes.forEach(partner => {
                partner.contacts.forEach(contact => {
                    if (contact.Contact_Status) statuses.add(contact.Contact_Status);
                    if (contact.Lead_Status) statuses.add(contact.Lead_Status);
                });
                if (partner.subPartners) collectStatuses(partner.subPartners);
            });
        };
        if (data) collectStatuses(data);
        return Array.from(statuses);
    };

    // Get unique products for filter dropdown
    const getUniqueProducts = () => {
        const products = new Set<string>();
        const collectProducts = (nodes: PartnerNode[]) => {
            nodes.forEach(partner => {
                partner.contacts.forEach(contact => {
                    if (contact.Product) products.add(contact.Product);
                });
                if (partner.subPartners) collectProducts(partner.subPartners);
            });
        };
        if (data) collectProducts(data);
        return Array.from(products);
    };

    // Create tree data
    const treeData = transformToTreeData(filterData(data || []));

    // Calculate total contacts
    const countTotalContacts = (nodes: PartnerNode[]): number => {
        return nodes.reduce((total, partner) => {
            return total + partner.contacts.length + countTotalContacts(partner.subPartners || []);
        }, 0);
    };

    const totalContacts = data ? countTotalContacts(data) : 0;
    const filteredTotalContacts = data ? countTotalContacts(filterData(data)) : 0;
    const hasFilters = searchTerm || statusFilter.length > 0 || productFilter.length > 0;

    return (
        <>
            <style>{styles.customStyles}</style>
            <div className="hierarchy-filter-container">
                <div className="hierarchy-filter-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 500 }}>Contact Hierarchy</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Badge
                                count={totalContacts}
                                style={{ backgroundColor: 'rgb(204, 169, 90)' }}
                                overflowCount={999}
                            />
                            {hasFilters && filteredTotalContacts !== totalContacts && (
                                <span style={{ fontSize: '12px' }}>(Showing {filteredTotalContacts})</span>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }} className="hierarchy-controls">
                        <Input
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<Search size={16} />}
                            style={{ flex: 1 }}
                        />
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ minWidth: '200px' }}
                            placeholder={<div style={{ display: 'flex', alignItems: 'center' }}><Filter size={16} style={{ marginRight: '4px' }} /> Status</div>}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={getUniqueStatuses().map(status => ({ label: status, value: status }))}
                        />
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ minWidth: '200px' }}
                            placeholder={<div style={{ display: 'flex', alignItems: 'center' }}><Star size={16} style={{ marginRight: '4px' }} /> Product</div>}
                            value={productFilter}
                            onChange={setProductFilter}
                            options={getUniqueProducts().map(product => ({ label: product, value: product }))}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }} className="hierarchy-actions">
                        {hasFilters && (
                            <Button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter([]);
                                    setProductFilter([]);
                                }}
                                icon={<X size={16} />}
                            >
                                Clear Filters
                            </Button>
                        )}
                        <div style={{ flex: 1 }}></div>
                        <Button
                            className="gold-btn"
                            onClick={() => {
                                const defaultExpanded = data.map(partner => `partner-${partner.partnerId}`);
                                setExpandedKeys(defaultExpanded);
                            }}
                            icon={<RefreshCw size={16} />}
                        >
                            Reset View
                        </Button>
                    </div>
                    {treeData.length > 0 ? (
                        <Tree
                            className="partner-hierarchy-tree"
                            showLine={{ showLeafIcon: false }}
                            defaultExpandAll={false}
                            onExpand={onExpand}
                            expandedKeys={expandedKeys}
                            treeData={treeData}
                            blockNode
                            switcherIcon={<ChevronRight size={16} />}
                        />
                    ) : (
                        <Empty
                            description={hasFilters ? "No matching contacts found. Try adjusting your filters." : "No contacts found"}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default ContactHierarchyTree; 