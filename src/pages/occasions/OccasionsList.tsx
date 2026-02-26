import React, { useState, useEffect } from 'react';
import { occasionService } from '../../api/occasionService';
import type { Occasion } from '../../types/occasion';
import { Modal } from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Edit2, Trash2, AlertCircle, ImageIcon } from 'lucide-react';
import { getS3ImageUrl, getS3ImageName } from '../../utils/s3';

const occasionSchema = z.object({
    occasionCode: z.string().optional(),
    occasionName: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    s3ImageKey: z.string().optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
});

type OccasionFormValues = z.infer<typeof occasionSchema>;

export const OccasionsList: React.FC = () => {
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm<OccasionFormValues>({
        resolver: zodResolver(occasionSchema) as any,
        defaultValues: { isActive: true }
    });

    const loadOccasions = async () => {
        setLoading(true);
        try {
            const data = await occasionService.getAll();
            setOccasions(data);
        } catch (error) {
            console.error('Failed to load occasions', error);
            setOccasions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOccasions();
    }, []);

    const filteredOccasions = occasions.filter(occ =>
        occ.occasionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (occ.occasionCode && occ.occasionCode.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleOpenModal = (occasion?: Occasion) => {
        if (occasion) {
            setEditingOccasion(occasion);
            (Object.keys(occasionSchema.shape) as Array<keyof OccasionFormValues>).forEach(key => {
                if (key !== 's3ImageKey') {
                    setValue(key as keyof OccasionFormValues, occasion[key as keyof Occasion] as any);
                }
            });
        } else {
            setEditingOccasion(null);
            reset();
        }
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingOccasion(null);
        setSelectedImage(null);
        reset();
    };

    const onSubmit = async (data: OccasionFormValues) => {
        try {
            if (editingOccasion && editingOccasion.id) {
                await occasionService.update(editingOccasion.id, data, selectedImage || undefined);
            } else {
                await occasionService.create(data as Occasion, selectedImage || undefined);
            }
            handleCloseModal();
            loadOccasions();
        } catch (error) {
            console.error('Failed to save occasion', error);
            alert('Failed to save record. Ensure the backend is running.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this occasion?')) {
            try {
                await occasionService.delete(id);
                loadOccasions();
            } catch (error) {
                console.error('Failed to delete occasion', error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Occasions / Kits</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage event-specific kits and occasions.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Occasion
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
                        placeholder="Search occasions by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-10 flex justify-center items-center text-slate-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Loading occasions...</span>
                    </div>
                ) : filteredOccasions.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p>No occasions found.</p>
                    </div>
                ) : (
                    filteredOccasions.map((occasion) => (
                        <div key={occasion.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {occasion.s3ImageKey ? (
                                            <img src={getS3ImageUrl(occasion.s3ImageKey) || ''} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{occasion.occasionName}</h3>
                                        <span className="text-xs text-slate-500 mt-0.5 block">Code: {occasion.occasionCode || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(occasion)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => occasion.id && handleDelete(occasion.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 flex-1 mb-4">{occasion.description}</p>

                            <div className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${occasion.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                    {occasion.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                    {occasion.category || 'Uncategorized'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingOccasion ? 'Edit Occasion' : 'Add New Occasion'}
            >
                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Occasion Name</label>
                            <input
                                {...register('occasionName')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                placeholder="Name"
                            />
                            {errors.occasionName && <p className="mt-1 text-xs text-rose-500">{errors.occasionName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Occasion Code</label>
                            <input
                                {...register('occasionCode')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                placeholder="CODE-123"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
                            placeholder="Brief description..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                {...register('category')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                            >
                                <option value="">-- Select Category --</option>
                                <option value="FESTIVE">FESTIVE</option>
                                <option value="MARRIAGE">MARRIAGE</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                S3 Image Key (Optional override)
                                {editingOccasion?.s3ImageKey && (
                                    <span className="font-normal text-[0.65rem] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md break-all" title={getS3ImageName(editingOccasion.s3ImageKey)}>
                                        Current: {getS3ImageName(editingOccasion.s3ImageKey)}
                                    </span>
                                )}
                            </label>
                            <input
                                {...register('s3ImageKey')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                placeholder="path/to/image.jpg"
                            />
                        </div>
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

                    <div className="flex items-center mt-4">
                        <input
                            type="checkbox"
                            id="isActive"
                            {...register('isActive')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">
                            Active Status
                        </label>
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
                            {isSubmitting ? 'Saving...' : 'Save Occasion'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OccasionsList;
