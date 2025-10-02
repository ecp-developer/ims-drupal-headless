export interface VendorData {
  id?: string;
  vendorCode: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  cityId: string;
  countryId: string;
  taxNumber: string;
  address: string;
  status?: boolean;
}

export interface VendorFormData extends VendorData {
  id?: string;
}
