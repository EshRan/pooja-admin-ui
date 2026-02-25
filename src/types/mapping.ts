import type { PoojaItem } from './item';
import type { Occasion } from './occasion';

export interface PoojaItemOccasionMapping {
    id?: number;
    poojaItem?: PoojaItem;
    occasion?: Occasion;
    notes?: string;
    isActive?: boolean;
    createdTsp?: string;
    updatedTsp?: string;
    createdBy?: string;
    updatedBy?: string;
}
