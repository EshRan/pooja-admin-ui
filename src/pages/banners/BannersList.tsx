import React, { useState, useEffect } from 'react';
import { bannerService } from '../../api/bannerService';
import type { Banner } from '../../types/banner';
import { Modal } from '../../components/ui/Modal';
import { ImageModal } from '../../components/ui/ImageModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Edit2, Trash2, AlertCircle, ImageIcon } from 'lucide-react';
import { getS3ImageUrl, getS3ImageName } from '../../utils/s3';

const bannerSchema = z.object({
    bannerName: z.string().min(1, 'Name is required'),
    bannerType: z.string().optional(),
    description: z.string().optional(),
    s3ImageKey: z.string().optional(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

export const BannersList: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema) as any,
    });

    const loadBanners = async () => {
        setLoading(true);
        try {
            const data = await bannerService.getAll();
            setBanners(data);
        } catch (error) {
            console.error('Failed to load banners', error);
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const filteredBanners = banners.filter(banner =>
        banner.bannerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenModal = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner);
            (Object.keys(bannerSchema.shape) as Array<keyof BannerFormValues>).forEach(key => {
                if (key !== 's3ImageKey') {
                    setValue(key as keyof BannerFormValues, banner[key as keyof Banner] as any);
                }
            });
        } else {
            setEditingBanner(null);
            reset();
        }
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
        setSelectedImage(null);
        reset();
    };

    const onSubmit = async (data: BannerFormValues) => {
        try {
            const payload = { ...data };
            if (!payload.s3ImageKey || payload.s3ImageKey.trim() === '') {
                delete payload.s3ImageKey;
            }

            if (editingBanner && editingBanner.id) {
                await bannerService.update(editingBanner.id, payload, selectedImage || undefined);
            } else {
                await bannerService.create(payload as Banner, selectedImage || undefined);
            }
            handleCloseModal();
            loadBanners();
        } catch (error) {
            console.error('Failed to save banner', error);
            alert('Failed to save record. Ensure the backend is running.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await bannerService.delete(id);
                loadBanners();
            } catch (error) {
                console.error('Failed to delete banner', error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Banners</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage promotional banners for the storefront.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="Search banners by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Banner Name</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="ml-3">Loading banners...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBanners.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                        <p>No banners found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBanners.map((banner) => (
                                    <tr key={banner.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <div
                                                className={`w-16 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden ${banner.s3ImageKey ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all shadow-sm' : ''}`}
                                                onClick={() => {
                                                    const url = getS3ImageUrl(banner.s3ImageKey);
                                                    if (url) setPreviewImage(url);
                                                }}
                                            >
                                                {banner.s3ImageKey ? (
                                                    <img src={getS3ImageUrl(banner.s3ImageKey) || ''} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-4 h-4 text-slate-300" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-800">{banner.bannerName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-600">{banner.bannerType || '(No Type)'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-500">{banner.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(banner)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => banner.id && handleDelete(banner.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingBanner ? 'Edit Banner' : 'Add New Banner'}
            >
                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Banner Name</label>
                        <input
                            {...register('bannerName')}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Summer Sale"
                        />
                        {errors.bannerName && <p className="mt-1 text-xs text-rose-500">{errors.bannerName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Banner Type</label>
                        <input
                            {...register('bannerType')}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="e.g. Hero, Highlight"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Describe what this banner promotes"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                S3 Image Key (Optional override)
                                {editingBanner?.s3ImageKey && (
                                    <span className="font-normal text-[0.65rem] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md break-all" title={getS3ImageName(editingBanner.s3ImageKey)}>
                                        Current: {getS3ImageName(editingBanner.s3ImageKey)}
                                    </span>
                                )}
                            </label>
                            <input
                                {...register('s3ImageKey')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                placeholder="path/to/image.jpg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Upload New Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 mt-6 border-t border-slate-100 space-x-3">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm shadow-blue-500/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Banner'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ImageModal
                isOpen={!!previewImage}
                imageUrl={previewImage || ''}
                onClose={() => setPreviewImage(null)}
            />
        </div>
    );
};

export default BannersList;
