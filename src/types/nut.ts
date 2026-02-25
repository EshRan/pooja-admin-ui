export interface Nut {
    id?: number;
    itemCode?: string;
    itemName: string;
    description?: string;
    totalQuantity?: number;
    price?: number;
    s3ImageKey?: string;
    quantityUnit?: string;
    isInStock?: boolean;
    stockInQuantity?: number;
    createdTsp?: string;
    updatedTsp?: string;
    createdBy?: string;
    updatedBy?: string;
}
