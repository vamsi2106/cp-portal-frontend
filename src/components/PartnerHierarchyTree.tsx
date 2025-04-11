import React, { useRef, useEffect, useState } from 'react';
import Tree from 'react-d3-tree';
import { toPng } from 'html-to-image';
import { Button } from 'antd';
import { Download } from 'lucide-react';
import { User } from 'lucide-react';

interface PartnerNode {
    id: string;
    Name: string;
    Email: string | null;
    Phone_Number: string;
    Sub_Partners: PartnerNode[];
}

const PartnerHierarchyTree = ({ data }: { data: PartnerNode }) => {
    const treeWrapperRef = useRef<HTMLDivElement>(null);
    const treeContainer = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        if (treeContainer.current) {
            const { width, height } = treeContainer.current.getBoundingClientRect();
            setDimensions({ width, height });
        }
    }, []);

    const transformData = (node: PartnerNode, level: number = 0): any => ({
        name: node?.Name,
        attributes: {
            Phone: node?.Phone_Number,
            Email: node?.Email || '-',
        },
        level,
        children: node?.Sub_Partners?.map((child) => transformData(child, level + 1)) || [],
    });

    const renderCustomNode = ({ nodeDatum }: any) => {
        const colors = ['border-primary-gold', 'border-primary-dark', 'border-primary-gold/70', 'border-primary-dark/70'];
        const level = nodeDatum.__rd3t?.depth || 0;

        return (
            <foreignObject width={180} height={120} x={-90} y={-60}>
                <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    className={`rounded-lg border-l-4 ${colors[level % colors.length]} bg-white p-3 text-center shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary-gold`}
                >
                    <div className="flex justify-center mb-1">
                        <div className="bg-secondary-light-cream p-2 rounded-full w-10 h-10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-gold" />
                        </div>
                    </div>
                    <div className="font-semibold text-primary-dark text-sm">{nodeDatum?.name}</div>
                    <div className="text-xs text-gray-500">{nodeDatum?.attributes?.Phone}</div>
                    {nodeDatum?.attributes?.Email && (
                        <div className="text-xs text-gray-400 truncate">{nodeDatum?.attributes?.Email}</div>
                    )}
                </div>
            </foreignObject>
        );
    };

    const handleExportImage = () => {
        if (!treeWrapperRef.current) return;

        toPng(treeWrapperRef.current, { cacheBust: true, quality: 1 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'partner-hierarchy.png';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Export failed:', err);
            });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    icon={<Download className="w-4 h-4" />}
                    onClick={handleExportImage}
                    className="bg-white border-primary-gold/30 text-primary-dark hover:bg-secondary-light-cream hover:border-primary-gold"
                >
                    Export as PNG
                </Button>
            </div>

            <div ref={treeWrapperRef} className="border rounded-lg shadow-inner bg-secondary-light-cream p-4 border-secondary-cream">
                <div ref={treeContainer} className="w-full h-[80vh] overflow-hidden">
                    <Tree
                        data={transformData(data)}
                        orientation="vertical"
                        translate={{ x: dimensions.width / 2, y: 100 }}
                        zoom={0.8}
                        zoomable
                        collapsible
                        pathFunc="elbow"
                        separation={{ siblings: 1.5, nonSiblings: 2 }}
                        renderCustomNodeElement={renderCustomNode}
                        enableLegacyTransitions
                        pathClassFunc={() => 'stroke-primary-gold stroke-2 opacity-70'}
                    />
                </div>
            </div>
        </div>
    );
};

export default PartnerHierarchyTree;
