// Define interfaces for Partner and FlattenedPartner
interface Partner {
    id: string;
    Name: string;
    Email?: string | null;
    Phone_Number?: string | null;
    Organization_Name?: string | null;
    Reporting_To_Partner?: { name: string; id: string | number } | null;
    Sub_Partners?: Partner[];
}

interface FlattenedPartner {
    id: string;
    Name: string;
    Email: string;
    Phone_Number: string;
    Organization_Name?: string;
    Reporting_To_Partner?: { name: string; id: string | number } | {};
}

// Function to flatten the partner hierarchy
const flattenPartners = (partner: Partner, parentName: string | null = null, parentId: string | null = null): FlattenedPartner[] => {
    let flatList: FlattenedPartner[] = [];

    // Add the current partner with the parent reference
    flatList.push({
        id: partner.id,
        Name: partner.Name,
        Email: partner.Email || '—',
        Phone_Number: partner.Phone_Number || '—',
        Organization_Name: partner.Organization_Name || '—',
        Reporting_To_Partner: parentName ? { name: parentName, id: parentId } : {}, // Maintain reporting hierarchy
    });

    // Recursively flatten the sub-partners
    if (partner.Sub_Partners && partner.Sub_Partners.length > 0) {
        partner.Sub_Partners.forEach(subPartner => {
            flatList = [...flatList, ...flattenPartners(subPartner, partner.Name, partner.id)];
        });
    }

    return flatList;
};

export default flattenPartners;
