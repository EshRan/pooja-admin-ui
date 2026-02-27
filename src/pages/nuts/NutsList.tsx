import React, { useState, useEffect } from 'react';
import { nutService } from '../../api/nutService';
import type { Nut } from '../../types/nut';
import { Modal } from '../../components/ui/Modal';
import { ImageModal } from '../../components/ui/ImageModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Edit2, Trash2, AlertCircle, ImageIcon } from 'lucide-react';
import { getS3ImageUrl, getS3ImageName } from '../../utils/s3';

const nutSchema = z.object({
    itemCode: z.string().optional(),
    itemName: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    totalQuantity: z.coerce.number().min(0).optional(),
    price: z.coerce.number().min(0).optional(),
    quantityUnit: z.string().optional(),
    isInStock: z.boolean().optional(),
    stockInQuantity: z.coerce.number().min(0).optional(),
    s3ImageKey: z.string().optional(),
});

type NutFormValues = z.infer<typeof nutSchema>;

export const NutsList: React.FC = () => {
    const [items, setItems] = useState<Nut[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<Nut | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm<NutFormValues>({
        resolver: zodResolver(nutSchema) as any,
        defaultValues: { isInStock: true, price: 0, totalQuantity: 0, stockInQuantity: 0 }
    });

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await nutService.getAll();
            setItems(data);
        } catch (error) {
            console.error('Failed to load nuts', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const filteredItems = items.filter(item =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.itemCode && item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleOpenModal = (item?: Nut) => {
        if (item) {
            setEditingItem(item);
            (Object.keys(nutSchema.shape) as Array<keyof NutFormValues>).forEach(key => {
                if (key !== 's3ImageKey') {
                    setValue(key as keyof NutFormValues, item[key as keyof Nut] as any);
                }
            });
        } else {
            setEditingItem(null);
            reset();
        }
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setSelectedImage(null);
        reset();
    };

    const onSubmit = async (data: NutFormValues) => {
        try {
            const payload = { ...data };
            if (!payload.s3ImageKey || payload.s3ImageKey.trim() === '') {
                delete payload.s3ImageKey;
            }

            if (editingItem && editingItem.id) {
                await nutService.update(editingItem.id, payload, selectedImage || undefined);
            } else {
                await nutService.create(payload as Nut, selectedImage || undefined);
            }
            handleCloseModal();
            loadItems();
        } catch (error) {
            console.error('Failed to save nut', error);
            alert('Failed to save record. Ensure the backend is running.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this specific nut?')) {
            try {
                await nutService.delete(id);
                loadItems();
            } catch (error) {
                console.error('Failed to delete nut', error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Nuts Inventory</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage dry fruits and nut catalog records.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Nut
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
                        placeholder="Search nuts by name..."
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
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="ml-3">Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                        <p>No nuts found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800">{item.itemName}</span>
                                                <span className="text-xs text-slate-500 mt-0.5">Code: {item.itemCode || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                                className={`w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden ${item.s3ImageKey ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all shadow-sm' : ''}`}
                                                onClick={() => {
                                                    const url = getS3ImageUrl(item.s3ImageKey);
                                                    if (url) setPreviewImage(url);
                                                }}
                                            >
                                                {item.s3ImageKey ? (
                                                    <img src={getS3ImageUrl(item.s3ImageKey) || ''} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-4 h-4 text-slate-300" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-800">{item.totalQuantity} {item.quantityUnit}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">In Stock: {item.stockInQuantity}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-emerald-600">₹{(item.price || 0).toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${item.isInStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {item.isInStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => item.id && handleDelete(item.id)}
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
                title={editingItem ? 'Edit Nut Data' : 'Add New Nut Data'}
            >
                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                            <input
                                {...register('itemName')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                placeholder="Product Name"
                            />
                            {errors.itemName && <p className="mt-1 text-xs text-rose-500">{errors.itemName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Item Code</label>
                            <input
                                {...register('itemCode')}
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            placeholder="Brief description"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Total Quantity</label>
                            <input
                                type="number"
                                {...register('totalQuantity')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                            {errors.totalQuantity && <p className="mt-1 text-xs text-rose-500">{errors.totalQuantity.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                            <select
                                {...register('quantityUnit')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                            >
                                <option value="">-- Select Unit --</option>
                                <option value="gms">Grams (gms)</option>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="piece">Piece (pcs)</option>
                                <option value="pack">Pack</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                            <input
                                type="number" step="0.01"
                                {...register('price')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">In-Stock Quantity</label>
                            <input
                                type="number"
                                {...register('stockInQuantity')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                        </div>
                        <div className="flex items-center mt-6">
                            <input
                                type="checkbox"
                                id="isInStock"
                                {...register('isInStock')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                            <label htmlFor="isInStock" className="ml-2 block text-sm text-slate-700">
                                Active in Catalog
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                S3 Image Key (Optional override)
                                {editingItem?.s3ImageKey && (
                                    <span className="font-normal text-[0.65rem] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md break-all" title={getS3ImageName(editingItem.s3ImageKey)}>
                                        Current: {getS3ImageName(editingItem.s3ImageKey)}
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
                            {isSubmitting ? 'Saving...' : 'Save Nut Data'}
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

export default NutsList;
