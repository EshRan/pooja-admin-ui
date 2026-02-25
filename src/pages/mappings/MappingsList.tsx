import React, { useState, useEffect } from 'react';
import { mappingService } from '../../api/mappingService';
import { itemService } from '../../api/itemService';
import { occasionService } from '../../api/occasionService';
import type { PoojaItemOccasionMapping } from '../../types/mapping';
import type { PoojaItem } from '../../types/item';
import type { Occasion } from '../../types/occasion';
import { Modal } from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Trash2, AlertCircle } from 'lucide-react';

const mappingSchema = z.object({
    poojaItemId: z.coerce.number().min(1, 'Please select an Item'),
    occasionId: z.coerce.number().min(1, 'Please select an Occasion'),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
});

type MappingFormValues = z.infer<typeof mappingSchema>;

export const MappingsList: React.FC = () => {
    const [mappings, setMappings] = useState<PoojaItemOccasionMapping[]>([]);
    const [items, setItems] = useState<PoojaItem[]>([]);
    const [occasions, setOccasions] = useState<Occasion[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MappingFormValues>({
        resolver: zodResolver(mappingSchema) as any,
        defaultValues: { isActive: true, poojaItemId: 0, occasionId: 0 }
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [mapsData, itemsData, occasionsData] = await Promise.all([
                mappingService.getAll().catch(() => []),
                itemService.getAll().catch(() => []),
                occasionService.getAll().catch(() => [])
            ]);
            setMappings(mapsData);
            setItems(itemsData);
            setOccasions(occasionsData);
        } catch (error) {
            console.error('Failed to load mappings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter based on Item Name or Occasion Name
    const filteredMappings = mappings.filter(m =>
        (m.poojaItem?.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.occasion?.occasionName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenModal = () => {
        reset({ isActive: true, poojaItemId: 0, occasionId: 0 });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const onSubmit = async (data: MappingFormValues) => {
        try {
            const selectedItem = items.find(i => i.id === data.poojaItemId);
            const selectedOccasion = occasions.find(o => o.id === data.occasionId);

            if (!selectedItem || !selectedOccasion) {
                alert("Invalid Item or Occasion selection");
                return;
            }

            await mappingService.create(
                selectedItem.id!,
                selectedOccasion.id!,
                data.notes
            );
            handleCloseModal();
            loadData();
        } catch (error) {
            console.error('Failed to save mapping', error);
            alert('Failed to save record. Ensure the backend is running and valid references exist.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this mapping?')) {
            try {
                await mappingService.delete(id);
                loadData();
            } catch (error) {
                console.error('Failed to delete mapping', error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Item-Occasion Mappings</h1>
                    <p className="text-sm text-slate-500 mt-1">Map which Pooja Items belong to which Occasions/Kits.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Mapping
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
                        placeholder="Search by Item or Occasion name..."
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
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pooja Item</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Occasion</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="ml-3">Loading mappings...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMappings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                        <p>No mappings found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredMappings.map((mapping) => (
                                    <tr key={mapping.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800">{mapping.poojaItem?.itemName || 'Unknown Item'}</span>
                                                <span className="text-xs text-slate-500 mt-0.5">Code: {mapping.poojaItem?.itemCode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-800">{mapping.occasion?.occasionName || 'Unknown Occasion'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-500 truncate max-w-xs">{mapping.notes || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${mapping.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {mapping.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => mapping.id && handleDelete(mapping.id)}
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
                title={'Add New Mapping'}
            >
                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Pooja Item</label>
                        <select
                            {...register('poojaItemId')}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                        >
                            <option value={0}>-- Select Item --</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{item.itemName} ({item.itemCode})</option>
                            ))}
                        </select>
                        {errors.poojaItemId && <p className="mt-1 text-xs text-rose-500">{errors.poojaItemId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Occasion</label>
                        <select
                            {...register('occasionId')}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                        >
                            <option value={0}>-- Select Occasion --</option>
                            {occasions.map(occ => (
                                <option key={occ.id} value={occ.id}>{occ.occasionName}</option>
                            ))}
                        </select>
                        {errors.occasionId && <p className="mt-1 text-xs text-rose-500">{errors.occasionId.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Remarks</label>
                            <input
                                type="text"
                                {...register('notes')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                placeholder="Optional notes"
                            />
                        </div>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                {...register('isActive')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">
                                Mapping is Active
                            </label>
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
                            {isSubmitting ? 'Saving...' : 'Save Mapping'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MappingsList;
