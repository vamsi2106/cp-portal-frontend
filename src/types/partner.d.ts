export interface Partner {
  id: string;
  Name: string;
  Phone_Number: string;
  Email: string;
}

export interface ParentPartner {
  name: string;
  id: string;
}

export interface PartnerDetail extends Partner {
  Parent_Partner: ParentPartner;
}

export interface PartnerHierarchy {
  partnerId: string;
  partnerName: string;
  subPartners: {
    partnerId: string;
    partnerName: string;
  }[];
}

export interface SignupRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface SignupResponse {
  message: string;
  partnerId: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}