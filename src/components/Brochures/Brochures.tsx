import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, Row, Col, Typography, Button, Modal, message, Space, Tooltip, Divider, Dropdown, Menu, Spin } from 'antd';
import {
    DownloadOutlined,
    ShareAltOutlined,
    FacebookOutlined,
    TwitterOutlined,
    WhatsAppOutlined,
    InstagramOutlined,
    LinkedinOutlined,
    EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Lazy load the modal content to improve initial load time
const BrochurePreviewModal = lazy(() => import('./BrochurePreviewModal'));

interface Brochure {
    id: number;
    title: string;
    image: string;
    description: string;
}

const Brochures: React.FC = () => {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [previewDescription, setPreviewDescription] = useState('');
    const [activeBrochure, setActiveBrochure] = useState<Brochure | null>(null);
    const [brochures, setBrochures] = useState<Brochure[]>([]);
    const [loading, setLoading] = useState(true);

    // Simulate loading brochures asynchronously
    useEffect(() => {
        const loadBrochures = async () => {
            setLoading(true);
            // In a real app, this would be an API call
            const data = [
                {
                    id: 1,
                    title: 'Brochure 1',
                    image: '/assets/cp-1.jpeg',
                    description: 'Ridhira Living - Luxury Villas Brochure'
                },
                {
                    id: 2,
                    title: 'Brochure 2',
                    image: '/assets/cp-2.jpeg',
                    description: 'Ridhira Living - Villa Features'
                },
                {
                    id: 3,
                    title: 'Brochure 3',
                    image: '/assets/cp-3.jpeg',
                    description: 'Ridhira Living - Villa Amenities'
                },
                {
                    id: 4,
                    title: 'Brochure 4',
                    image: '/assets/cp-4.jpeg',
                    description: 'Ridhira Living - Villa Floor Plans'
                },
                {
                    id: 5,
                    title: 'Brochure 5',
                    image: '/assets/cp-5.jpeg',
                    description: 'Ridhira Living - Villa Location'
                }
            ];

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));
            setBrochures(data);
            setLoading(false);
        };

        loadBrochures();
    }, []);

    const handlePreview = (brochure: Brochure) => {
        setPreviewImage(brochure.image);
        setPreviewTitle(brochure.title);
        setPreviewDescription(brochure.description);
        setActiveBrochure(brochure);
        setPreviewVisible(true);
    };

    const handleDownload = (brochure: Brochure) => {
        // Create a temporary link to download the image
        const link = document.createElement('a');
        link.href = brochure.image;
        link.download = `ridhira-${brochure.id}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('Download started');
    };

    const handleShare = (brochure: Brochure, platform: string) => {
        const shareUrl = window.location.origin + brochure.image;
        const shareText = `Check out this Ridhira Living brochure: ${brochure.description}`;

        let shareLink = '';

        switch (platform) {
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                break;
            case 'instagram':
                // Instagram doesn't have a direct share URL, so we'll just copy to clipboard
                navigator.clipboard.writeText(shareUrl);
                message.success('Image URL copied to clipboard. You can now share on Instagram.');
                return;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
            default:
                return;
        }

        window.open(shareLink, '_blank');
    };

    const IconButton = ({ icon, onClick }: { icon: React.ReactNode, onClick?: () => void }) => (
        <Button
            icon={icon}
            onClick={onClick}
            type="text"
            style={{ border: '1px solid rgba(204, 169, 90, 0.2)', color: '#132430', borderRadius: '4px', padding: '4px 8px', height: 'auto' }}
        />
    );

    const handleClosePreview = () => {
        setPreviewVisible(false);
    };

    return (
        <div className="p-6 bg-[#f6f4ef]">
            <div className="max-w-7xl mx-auto">
                <Title level={2} className="mb-2 text-[#132430]">Ridhira Living Brochures</Title>
                <Text className="block mb-8 text-gray-600">
                    Browse and download our collection of brochures showcasing Ridhira Living's luxury villas.
                    Share these brochures with your network to spread the word about our premium properties.
                </Text>
                <Divider className="mb-8 border-[rgba(204,169,90,0.2)]" />

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spin size="large" tip="Loading brochures..." />
                    </div>
                ) : (
                    <Row gutter={[24, 24]}>
                        {brochures.map((brochure) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={brochure.id}>
                                <Card
                                    bordered={false}
                                    bodyStyle={{ padding: 0 }}
                                    cover={
                                        <div className="overflow-hidden cursor-pointer relative bg-gray-100"
                                            style={{ minHeight: '180px' }}
                                            onClick={() => handlePreview(brochure)}>
                                            <img
                                                alt={brochure.title}
                                                src={brochure.image}
                                                className="w-full h-auto"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.src = '/assets/ridhira-banner.jpg'; // Fallback image
                                                }}
                                            />
                                        </div>
                                    }
                                    className="h-full shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="p-4">
                                        <Title level={5} className="mb-1">{brochure.title}</Title>
                                        <Text className="text-gray-600 text-sm block mb-4">{brochure.description}</Text>

                                        <div className="flex space-x-2">
                                            <IconButton
                                                icon={<EyeOutlined />}
                                                onClick={() => handlePreview(brochure)}
                                            />
                                            <IconButton
                                                icon={<DownloadOutlined />}
                                                onClick={() => handleDownload(brochure)}
                                            />
                                            <IconButton
                                                icon={<ShareAltOutlined />}
                                                onClick={() => handleShare(brochure, 'whatsapp')}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {previewVisible && (
                    <Suspense fallback={
                        <Modal
                            open={true}
                            title={null}
                            footer={null}
                            closable={false}
                            centered
                        >
                            <div className="flex justify-center items-center p-10">
                                <Spin size="large" tip="Loading preview..." />
                            </div>
                        </Modal>
                    }>
                        <BrochurePreviewModal
                            open={previewVisible}
                            brochure={activeBrochure}
                            onCancel={handleClosePreview}
                            onDownload={handleDownload}
                            onShare={handleShare}
                        />
                    </Suspense>
                )}
            </div>
        </div>
    );
};

export default Brochures; 