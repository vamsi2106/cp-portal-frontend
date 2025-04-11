import React from 'react';
import { Typography, Button, Modal } from 'antd';
import {
    DownloadOutlined,
    FacebookOutlined,
    TwitterOutlined,
    WhatsAppOutlined,
    InstagramOutlined,
    LinkedinOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Brochure {
    id: number;
    title: string;
    image: string;
    description: string;
}

interface BrochurePreviewModalProps {
    open: boolean;
    brochure: Brochure | null;
    onCancel: () => void;
    onDownload: (brochure: Brochure) => void;
    onShare: (brochure: Brochure, platform: string) => void;
}

const BrochurePreviewModal: React.FC<BrochurePreviewModalProps> = ({
    open,
    brochure,
    onCancel,
    onDownload,
    onShare,
}) => {
    if (!brochure) return null;

    return (
        <Modal
            open={open}
            title={null}
            footer={null}
            onCancel={onCancel}
            width={{ xs: '95%', sm: '90%', md: 1000 }}
            centered
            className="brochure-preview-modal"
            bodyStyle={{ padding: '16px' }}
        >
            <div className="text-center">
                <Title level={4} className="mt-0 mb-2">{brochure.title}</Title>
                <Text className="text-gray-600 block mb-4">{brochure.description}</Text>
                <img
                    alt={brochure.title}
                    style={{ width: '100%', maxHeight: '50vh', objectFit: 'contain' }}
                    src={brochure.image}
                    loading="lazy"
                />
            </div>

            {/* Download Button - Full Width */}
            <div className="mt-6 mb-4">
                <Button
                    icon={<DownloadOutlined />}
                    onClick={() => onDownload(brochure)}
                    type="primary"
                    className="bg-[#cca95a] hover:bg-[#b89948] border-0 w-full h-10 text-base"
                >
                    Download
                </Button>
            </div>

            {/* Share Section */}
            <div className="text-center">
                <Text strong className="block mb-3 text-base">Share on:</Text>
                <div className="flex flex-wrap justify-center gap-3">
                    <Button
                        icon={<FacebookOutlined />}
                        onClick={() => onShare(brochure, 'facebook')}
                        className="bg-[#1877F2] text-white hover:bg-[#0E5FC3] border-0 min-w-[44px] h-10"
                        size="large"
                    />
                    <Button
                        icon={<TwitterOutlined />}
                        onClick={() => onShare(brochure, 'twitter')}
                        className="bg-[#1DA1F2] text-white hover:bg-[#0D8BCE] border-0 min-w-[44px] h-10"
                        size="large"
                    />
                    <Button
                        icon={<WhatsAppOutlined />}
                        onClick={() => onShare(brochure, 'whatsapp')}
                        className="bg-[#25D366] text-white hover:bg-[#1EAD54] border-0 min-w-[44px] h-10"
                        size="large"
                    />
                    <Button
                        icon={<InstagramOutlined />}
                        onClick={() => onShare(brochure, 'instagram')}
                        className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white hover:opacity-90 border-0 min-w-[44px] h-10"
                        size="large"
                    />
                    <Button
                        icon={<LinkedinOutlined />}
                        onClick={() => onShare(brochure, 'linkedin')}
                        className="bg-[#0A66C2] text-white hover:bg-[#0851A6] border-0 min-w-[44px] h-10"
                        size="large"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default BrochurePreviewModal; 