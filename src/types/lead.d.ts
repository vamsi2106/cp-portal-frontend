export interface Lead {
  id: string;
  LeadName: string;
  Phone_Number: string;
  Lead_Status: string;
  Associated_Partner: {
    id: string;
    name: string;
  };
}

export interface LeadHierarchy {
  data: {
    partnerId: string;
    partnerName: string;
    leads: {
      id: string;
      LeadName: string;
    }[];
  }[];
}


export interface ContactHierarchy {
  data: {
    partnerId: string;
    partnerName: string;
    contacts: {
      id: string;
      ContactName: string;
    }[];
  }[];
}