export interface Occasion {
    id?: number;
    occasionCode?: string;
    occasionName: string;
    description?: string;
    s3ImageKey?: string;
    category?: string;
    isActive?: boolean;
    createdTsp?: string;
    updatedTsp?: string;
    createdBy?: string;
    updatedBy?: string;
}
