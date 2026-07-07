// types for course reserves

export interface Instructor {
    id: number;
    name: string;
    email: string;
    department: string;
}

export interface Course {
    id: number;
    code: string;
    name: string;
    instructorId: number;
    instructor?: Instructor;
    reserveLists?: CourseReserveList[];
}

export interface CourseReserveList {
    id: number;
    courseId: number;
    term: string;
    status: string;
    activeFrom: string;
    activeTo: string;
    items?: CourseReserveItem[];
}

export interface CourseReserveItem {
    id: number;
    courseReserveListId: number;
    physicalItemId: number;
    reservePolicy: string;
    physicalItem?: any; // To avoid circular imports for now, we can use any or define PhysicalItem here
}

export interface AddReserveItemRequest {
    courseReserveListId: number;
    physicalItemId: number;
    reservePolicy: string;
}
