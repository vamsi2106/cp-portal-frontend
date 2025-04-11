export interface Contact {
    id: string;
    ContactName: string;
    Email: string | null;
    Phone_Number: string | null;
    Contact_Status: string | null;
    Lead_Status: string | null;
    Product: string | null;
    Created_Time: string | null;
    Owner: {
        id: string;
        name: string;
    };
}

export interface ContactHierarchy {
    data: {
        partnerId: string;
        partnerName: string;
        Email: string | null;
        Phone_Number: string | null;
        Address: string | null;
        contacts: Contact[];
        subPartners: ContactHierarchy['data'];
    }[];
} 