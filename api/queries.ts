/**
 * API URL Configuration
 * Uses environment variables with sensible defaults
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://admin.houseofsenses.vn";
export const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace(/\/$/, "") ||
  `${API_URL}/api/graphql`;
const GRAPHQL_PROXY_ENDPOINT = "/api/backend/graphql";
const REST_PROXY_PREFIX = "/api/backend";

/**
 * Lightweight GraphQL fetch helper – replaces Apollo Client.
 * Swallows errors and returns null so callers can handle gracefully.
 */
async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T | null> {
  const endpoints = [GRAPHQL_ENDPOINT, GRAPHQL_PROXY_ENDPOINT];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 60 },
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json.data) return json.data as T;
    } catch {}
  }

  return null;
}

/**
 * Mutation helper – re-throws errors so callers can handle them.
 */
async function gqlMutate<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const endpoints = [GRAPHQL_ENDPOINT, GRAPHQL_PROXY_ENDPOINT];
  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
      const json = await res.json();
      if (json.errors?.length) throw new Error(json.errors[0].message);
      return json.data as T;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("GraphQL request failed");
}

async function restFetch<T>(path: string): Promise<T | null> {
  const urls = [`${API_URL}${path}`, `${REST_PROXY_PREFIX}${path}`];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 60 },
      });
      if (!res.ok) continue;
      return (await res.json()) as T;
    } catch {}
  }

  return null;
}

/**
 * Type Definitions
 */

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  heroImagesList?: Array<{
    image?: {
      url: string;
      filename: string;
    };
    id?: string;
  }>;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  shortAboutTitle?: string;
  shortAboutText?: string;
  galleryTitle?: string;
  galleryText?: string;
  ctaTitle?: string;
  ctaText?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  shortAboutCollages?: Array<{
    image?: {
      url: string;
      filename: string;
    };
    id?: string;
  }>;
  aboutusHero?: {
    url: string;
    filename: string;
  };
  aboutus?: any;
  menu?: {
    url: string;
    filename: string;
  };
  newMenu?: Array<{
    src?: {
      url: string;
      filename: string;
    };
    id?: string;
  }>;
  logo?: {
    url: string;
  };
  address?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  topbarNotification?: {
    enabled?: boolean;
    message?: string;
  };
  mainColor?: string;
  /** "open" | "temporarily-closed" (REST) / "temporarily_closed" (GraphQL) */
  status?: string;
  /** Free text from the CMS, e.g. "15:00–22:00" */
  openingHours?: string;
  meta?: {
    title?: string;
    description?: string;
    image?: {
      url: string;
      filename?: string;
    };
  };
}

export interface HomeInformation {
  name?: string;
  logo?: {
    url: string;
  } | null;
  CatchPhrase1: string;
  CatchPhrase2: string;
  quote_s_: Array<{ quote: string; id: string }>;
  BackgroundImage_forMobile_?: {
    url: string;
  } | null;
}

export interface GalleryItem {
  id: string;
  image?: {
    url: string;
    filename: string;
    alt?: string;
  };
  caption?: string;
  branch?: {
    id: string;
    name: string;
  };
}

export interface MenuItem {
  id: string;
  title: string;
  branch?: {
    id: string;
    name: string;
    domain?: string;
  };
  file?: {
    url: string;
    filename: string;
    originalName?: string;
    mimeType?: string;
  };
  pages?: Array<{
    url: string;
    filename: string;
    originalName?: string;
    mimeType?: string;
    id?: string;
  }>;
  status?: "Draft" | "Published" | "Archived";
}

interface TenantsResponse {
  Tenants: {
    docs: Tenant[];
    totalDocs: number;
    limit: number;
  };
}

interface TenantResponse {
  Tenants: {
    docs: Tenant[];
  };
}

interface HomeInformationResponse {
  HomeInformation: HomeInformation;
}

interface GalleryResponse {
  Galleries: {
    docs: GalleryItem[];
    totalDocs: number;
  };
}

interface MenusRestResponse {
  docs: MenuItem[];
  totalDocs: number;
}

interface CustomerResponse {
  Customers: {
    docs: Array<{
      id: string;
      customerName: string;
      customerPhone: string;
    }>;
  };
}

/**
 * QUERIES
 */

const GET_TENANTS = `
  query getTenants($limit: Int = 100) {
    Tenants(limit: $limit) {
      docs {
        id
        name
        domain
        mainColor
        status
        openingHours
        heroImagesList {
          image {
            url
            filename
          }
          id
        }
        heroTitle
        heroSubtitle
        heroDescription
        shortAboutTitle
        shortAboutText
        galleryText
        ctaTitle
        ctaText
        aboutTitle
        aboutSubtitle
        shortAboutCollages {
          image {
            url
            filename
          }
          id
        }
        aboutus
        menu {
          url
          filename
        }
        newMenu {
          src {
            url
            filename
          }
          id
        }
        logo {
          url
        }
        address
        location {
          latitude
          longitude
        }
        phone
        email
        facebook
        instagram
        tiktok
        youtube
        topbarNotification {
          enabled
          message
        }
        meta {
          title
          description
          image {
            url
            filename
          }
        }
      }
    }
  }
`;

const GET_TENANT = `
  query getTenant($domain: String) {
    Tenants(where: { domain: { equals: $domain } }) {
      docs {
        id
        name
        domain
        mainColor
        status
        openingHours
        heroImagesList {
          image {
            url
            filename
          }
          id
        }
        heroTitle
        heroSubtitle
        heroDescription
        shortAboutTitle
        shortAboutText
        galleryTitle
        galleryText
        ctaTitle
        ctaText
        aboutTitle
        aboutSubtitle
        shortAboutCollages {
          image {
            url
            filename
          }
          id
        }
        aboutus
        aboutusHero {
          url
          filename
        }
        menu {
          url
          filename
        }
        newMenu {
          src {
            url
            filename
          }
          id
        }
        logo {
          url
        }
        address
        location {
          latitude
          longitude
        }
        phone
        email
        facebook
        instagram
        tiktok
        youtube
        topbarNotification {
          enabled
          message
        }
        meta {
          title
          description
          image {
            url
            filename
          }
        }
      }
    }
  }
`;

const GET_HOME_INFORMATION = `
  query getHomeInformation {
    HomeInformation {
      name
      logo {
        url
      }
      CatchPhrase1
      CatchPhrase2
      quote_s_ {
        quote
        id
      }
      BackgroundImage_forMobile_ {
        url
      }
    }
  }
`;

const GET_GALLERY = `
  query getGallery {
    Galleries(limit: 100) {
      docs {
        id
        image {
          url
          filename
          alt
        }
        caption
        branch {
          id
          name
        }
      }
      totalDocs
    }
  }
`;

const GET_CUSTOMER = `
  query getCustomer($customerPhone: String) {
    Customers(where: { customerPhone: { equals: $customerPhone } }) {
      docs {
        id
        customerName
        customerPhone
      }
    }
  }
`;

/**
 * MUTATIONS
 */

const CREATE_CUSTOMER = `
  mutation CreateCustomer($customerName: String!, $customerPhone: String!) {
    createCustomer(
      data: { customerName: $customerName, customerPhone: $customerPhone }
    ) {
      id
      customerName
      customerPhone
    }
  }
`;

const CREATE_RESERVATION = `
  mutation CreateReservation(
    $customer: String!
    $reservationDateTime: String!
    $numberOfGuests: Float!
    $specialRequests: String
    $branch: String!
    $status: Reservation_status_MutationInput!
  ) {
    createReservation(
      data: {
        customer: $customer
        reservationDateTime: $reservationDateTime
        numberOfGuests: $numberOfGuests
        specialRequests: $specialRequests
        branch: $branch
        status: $status
      }
    ) {
      id
      reservationDateTime
      numberOfGuests
    }
  }
`;

const CREATE_SPIN_HISTORY = `
  mutation CreateSpinHistory(
    $occurredAt: String!
    $reward: String!
    $branch: String!
  ) {
    createSpinHistory(
      data: {
        occurredAt: $occurredAt
        reward: $reward
        branch: $branch
      }
    ) {
      id
      occurredAt
      reward
      branch {
        id
        name
      }
    }
  }
`;

const CREATE_CONTACT_MESSAGE = `
  mutation CreateContactMessage(
    $customer: String!
    $message: String
    $branch: String!
    $status: ContactMessage_status_MutationInput!
  ) {
    createContactMessage(
      data: {
        customer: $customer
        message: $message
        branch: $branch
        status: $status
      }
    ) {
      id
      customer {
        id
        customerName
        customerPhone
      }
      message
      branch {
        id
        name
      }
      status
    }
  }
`;

/**
 * Query Functions
 */

/**
 * Fetch all tenants from the API
 * @param limit - Maximum number of tenants to fetch
 * @returns Promise with tenants data
 */
export const fetchTenants = async (limit = 100) => {
  const data = await gqlFetch<TenantsResponse>(GET_TENANTS, { limit });
  if (data?.Tenants?.docs?.length) return data.Tenants.docs;

  const restData = await restFetch<TenantsResponse["Tenants"]>(
    `/api/tenants?depth=2&limit=${limit}`,
  );
  return restData?.docs || [];
};

/**
 * Fetch a single tenant by slug
 * @param slug - The tenant slug
 * @returns Promise with tenant data
 */
export const fetchTenantBySlug = async (slug: string) => {
  const data = await gqlFetch<TenantResponse>(GET_TENANT, { domain: slug });
  if (data?.Tenants?.docs?.[0]) return data.Tenants.docs[0];

  const restData = await restFetch<TenantResponse["Tenants"]>(
    `/api/tenants?where[domain][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`,
  );
  return restData?.docs?.[0] || null;
};

/**
 * Fetch home information global settings
 * @returns Promise with home information data
 */
export const fetchHomeInformation = async () => {
  const data = await gqlFetch<HomeInformationResponse>(GET_HOME_INFORMATION);
  return data?.HomeInformation ?? null;
};

/**
 * Fetch gallery images
 * @param branchId - Optional branch ID to filter by specific branch
 * @returns Promise with gallery items
 */
export const fetchGallery = async (branchId?: string) => {
  const data = await gqlFetch<GalleryResponse>(GET_GALLERY);
  let docs = data?.Galleries?.docs || [];
  if (branchId && docs.length > 0) {
    docs = docs.filter((item) => item.branch?.id === branchId);
  }
  return docs;
};

export const fetchMenus = async (branchId?: string) => {
  const path = branchId
    ? `/api/menus?where[branch][equals]=${encodeURIComponent(branchId)}&where[status][equals]=Published&depth=1&limit=100`
    : "/api/menus?where[status][equals]=Published&depth=1&limit=100";
  const data = await restFetch<MenusRestResponse>(path);
  return data?.docs || [];
};

export const fetchMenuByBranch = async (branchId: string) => {
  const docs = await fetchMenus(branchId);
  return docs[0] || null;
};

/* END OF QUERIES */

/**
 * Mutation Functions
 */

/**
 * Get customer by phone number
 * @param phone - Customer phone number
 * @returns Promise with customer data or null
 */
export const getCustomerByPhone = async (phone: string) => {
  const data = await gqlFetch<CustomerResponse>(GET_CUSTOMER, {
    customerPhone: phone,
  });
  return data?.Customers?.docs?.[0] || null;
};

/**
 * Create a new customer
 * @param name - Customer name
 * @param phone - Customer phone
 * @returns Promise with created customer data
 */
export const createCustomer = async (name: string, phone: string) => {
  const data = await gqlMutate<{
    createCustomer: { id: string; customerName: string; customerPhone: string };
  }>(CREATE_CUSTOMER, {
    customerName: name,
    customerPhone: phone,
  });
  return data?.createCustomer;
};

/**
 * Create a new reservation
 * @param customerId - Customer ID (from Customers collection)
 * @param reservationDateTime - ISO date-time string
 * @param numberOfGuests - Number of guests
 * @param specialRequests - Special requests/notes
 * @param branchId - Branch/Tenant ID
 * @returns Promise with created reservation data
 */
export const createReservation = async (
  customerId: string,
  reservationDateTime: string,
  numberOfGuests: number,
  specialRequests: string | undefined,
  branchId: string,
) => {
  return gqlMutate(CREATE_RESERVATION, {
    customer: customerId,
    reservationDateTime,
    numberOfGuests,
    specialRequests,
    branch: branchId,
    status: "Pending",
  });
};

/**
 * Create a new contact message
 * @param customerId - Customer ID (from Customers collection)
 * @param message - Message content
 * @param branchId - Branch/Tenant ID
 * @returns Promise with created contact message data
 */
export const createContactMessage = async (
  customerId: string,
  message: string | undefined,
  branchId: string,
) => {
  return gqlMutate(CREATE_CONTACT_MESSAGE, {
    customer: customerId,
    message: message || "",
    branch: branchId,
    status: "Pending",
  });
};

/**
 * Create a new spin history record
 * @param occurredAt - ISO datetime string of when the spin occurred
 * @param reward - The reward content the user landed on
 * @param branchId - Branch/Tenant ID
 * @returns Promise with created spin history data
 */
export const createSpinHistory = async (
  occurredAt: string,
  reward: string,
  branchId: string,
) => {
  return gqlMutate(CREATE_SPIN_HISTORY, {
    occurredAt,
    reward,
    branch: branchId,
  });
};

/* END OF MUTATIONS */
