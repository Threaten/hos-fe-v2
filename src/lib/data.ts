import { gqlFetch, gqlMutate, restFetch } from "@/lib/graphql";
import type { Customer, GalleryItem, HomeInformation, Tenant } from "@/types/payload";

const TENANT_FIELDS = `
  id
  status
  name
  domain
  mainColor
  spinWheelPrizes { id label }
  heroImagesList { id image { id url filename alt } }
  heroTitle
  heroSubtitle
  heroDescription
  shortAboutCollages { id image { id url filename alt } }
  shortAboutTitle
  shortAboutText
  galleryTitle
  galleryText
  homeGalleryImage { id url filename alt }
  ctaTitle
  ctaText
  aboutTitle
  aboutSubtitle
  aboutusHero { id url filename alt }
  aboutus
  menu { id url filename }
  newMenu { id src { id url filename } }
  logo { id url filename alt }
  address
  location { latitude longitude }
  openingHours
  phone
  email
  facebook
  instagram
  tiktok
  youtube
  heroMarqueeWords { id word }
  topbarNotification { enabled message }
  meta { title description image { id url filename } }
`;

const GET_TENANTS = `
  query GetTenants($limit: Int = 100) {
    Tenants(limit: $limit, where: { status: { not_equals: closed } }) {
      docs { ${TENANT_FIELDS} }
    }
  }
`;

const GET_TENANT_BY_DOMAIN = `
  query GetTenantByDomain($domain: String) {
    Tenants(where: { domain: { equals: $domain } }, limit: 1) {
      docs { ${TENANT_FIELDS} }
    }
  }
`;

const GET_GALLERY = `
  query GetGallery($branch: JSON, $limit: Int = 24) {
    Galleries(limit: $limit, where: { branch: { equals: $branch } }) {
      docs {
        id
        caption
        image { id url filename alt }
        branch { id name }
      }
    }
  }
`;

const GET_CUSTOMER_BY_PHONE = `
  query GetCustomerByPhone($phone: String) {
    Customers(where: { customerPhone: { equals: $phone } }, limit: 1) {
      docs { id customerName customerPhone }
    }
  }
`;

const CREATE_CUSTOMER = `
  mutation CreateCustomer($customerName: String!, $customerPhone: String!) {
    createCustomer(data: { customerName: $customerName, customerPhone: $customerPhone }) {
      id
      customerName
      customerPhone
    }
  }
`;

const CREATE_RESERVATION = `
  mutation CreateReservation(
    $customer: String!
    $reservationDateTime: DateTime!
    $numberOfGuests: Float!
    $specialRequests: String
    $branch: String!
  ) {
    createReservation(
      data: {
        customer: $customer
        reservationDateTime: $reservationDateTime
        numberOfGuests: $numberOfGuests
        specialRequests: $specialRequests
        branch: $branch
        status: Pending
      }
    ) {
      id
    }
  }
`;

const CREATE_CONTACT_MESSAGE = `
  mutation CreateContactMessage($customer: String!, $message: String, $branch: String!) {
    createContactMessage(
      data: { customer: $customer, message: $message, branch: $branch, status: Pending }
    ) {
      id
    }
  }
`;

export async function fetchTenants(limit = 100): Promise<Tenant[]> {
  const data = await gqlFetch<{ Tenants: { docs: Tenant[] } }>(GET_TENANTS, { limit });
  return data?.Tenants?.docs ?? [];
}

export async function fetchTenantByDomain(domain: string): Promise<Tenant | null> {
  const data = await gqlFetch<{ Tenants: { docs: Tenant[] } }>(GET_TENANT_BY_DOMAIN, { domain });
  return data?.Tenants?.docs?.[0] ?? null;
}

/** HomeInformation field names contain spaces/parens and aren't valid GraphQL identifiers. */
export async function fetchHomeInformation(): Promise<HomeInformation | null> {
  return restFetch<HomeInformation>("/api/globals/home-information?depth=2");
}

export async function fetchGallery(branchId?: string, limit = 24): Promise<GalleryItem[]> {
  const data = await gqlFetch<{ Galleries: { docs: GalleryItem[] } }>(GET_GALLERY, {
    branch: branchId,
    limit,
  });
  return data?.Galleries?.docs ?? [];
}

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const data = await gqlFetch<{ Customers: { docs: Customer[] } }>(GET_CUSTOMER_BY_PHONE, {
    phone,
  });
  return data?.Customers?.docs?.[0] ?? null;
}

export async function createCustomer(name: string, phone: string): Promise<Customer> {
  const data = await gqlMutate<{ createCustomer: Customer }>(CREATE_CUSTOMER, {
    customerName: name,
    customerPhone: phone,
  });
  return data.createCustomer;
}

/** Finds an existing customer by phone, or creates one. */
export async function upsertCustomer(name: string, phone: string): Promise<Customer> {
  const existing = await getCustomerByPhone(phone);
  if (existing) return existing;
  return createCustomer(name, phone);
}

export async function createReservation(input: {
  customerId: string;
  reservationDateTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  branchId: string;
}): Promise<{ id: string }> {
  const data = await gqlMutate<{ createReservation: { id: string } }>(CREATE_RESERVATION, {
    customer: input.customerId,
    reservationDateTime: input.reservationDateTime,
    numberOfGuests: input.numberOfGuests,
    specialRequests: input.specialRequests,
    branch: input.branchId,
  });
  return data.createReservation;
}

export async function createContactMessage(input: {
  customerId: string;
  message?: string;
  branchId: string;
}): Promise<{ id: string }> {
  const data = await gqlMutate<{ createContactMessage: { id: string } }>(CREATE_CONTACT_MESSAGE, {
    customer: input.customerId,
    message: input.message,
    branch: input.branchId,
  });
  return data.createContactMessage;
}
