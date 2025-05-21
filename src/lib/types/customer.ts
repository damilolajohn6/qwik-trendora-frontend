export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Avatar {
    public_id: string | null;
    url: string | null;
}

export interface Customer {
    _id: string;
    fullname: string;
    email: string;
    phoneNumber: string;
    role: "customer";
    dateJoined: string;
    orders: string[];
    shippingAddress: ShippingAddress;
    status: "active" | "inactive" | "pending";
    avatar: Avatar;
}
