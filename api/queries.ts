/**
 * API URL Configuration
 * Uses environment variables with sensible defaults
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://admin.houseofsenses.vn";
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

/** An uploaded photo as the CMS returns it */
export interface CmsMedia {
  url: string;
  filename?: string;
  alt?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
}

/** One filter of the photo index ("The room", "The table"…) */
export interface PhotoSet {
  id?: string;
  title: string;
  photos?: CmsMedia[];
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  /** Ordered photo sets; each is one filter on the home page and Gallery */
  photoSets?: PhotoSet[];
  /** The two photos beside the About page story */
  aboutPhotos?: CmsMedia[];
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
  aboutusHero?: CmsMedia;
  aboutus?: any;
  /** PDF (or single image) shown as the flip book */
  menu?: {
    url: string;
    filename: string;
  };
  /** Optional page images, used instead of `menu` when present */
  menuPages?: Array<{
    image?: {
      url: string;
      filename: string;
    };
    id?: string;
  }>;
  /** The menu as plain text ("## Section", "Name | description | price"), shown under the flip book */
  menuText?: string | null;
  /** English guide and FAQ at the bottom of the home page (CMS tab "Guide & FAQ") */
  guide?: GuideContent | null;
  /** The branch page in Vietnamese at /vi (CMS tab "Vietnamese page") */
  vi?: (GuideContent & {
    enabled?: boolean | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    bookLabel?: string | null;
    menuLabel?: string | null;
    switchLabel?: string | null;
    englishLabel?: string | null;
  }) | null;
  /** Lucky wheel slices, in order */
  spinWheelPrizes?: Array<{ label: string; id?: string }>;
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
    /** Search title/description per page (SEO tab → Other pages); empty = default */
    pages?: Partial<
      Record<"menu" | "reservation" | "about" | "contact" | "gallery", { title?: string | null; description?: string | null } | null>
    > | null;
  };
}

/** Search-friendly text blocks written in the CMS (guide sections and questions) */
export interface GuideContent {
  label?: string | null;
  title?: string | null;
  intro?: string | null;
  sections?: Array<{
    heading?: string | null;
    body?: string | null;
    linkLabel?: string | null;
    linkHref?: string | null;
    id?: string | null;
  }> | null;
  faqTitle?: string | null;
  faq?: Array<{ question?: string | null; answer?: string | null; id?: string | null }> | null;
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
        photoSets {
          id
          title
          photos {
            url
            filename
            alt
            caption
            width
            height
          }
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
        aboutPhotos {
          url
          filename
          alt
          caption
        }
        aboutus
        aboutusHero {
          url
          filename
          alt
          caption
        }
        menu {
          url
          filename
        }
        menuPages {
          image {
            url
            filename
          }
          id
        }
        spinWheelPrizes {
          label
          id
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
        photoSets {
          id
          title
          photos {
            url
            filename
            alt
            caption
            width
            height
          }
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
        aboutPhotos {
          url
          filename
          alt
          caption
        }
        aboutus
        aboutusHero {
          url
          filename
          alt
          caption
        }
        menu {
          url
          filename
        }
        menuPages {
          image {
            url
            filename
          }
          id
        }
        spinWheelPrizes {
          label
          id
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
        vi {
          enabled
          switchLabel
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


/** Flip book source for a branch: page images if uploaded, otherwise the menu file */
export const getMenuSource = (tenant?: Pick<Tenant, "menu" | "menuPages"> | null) => {
  const pages = (tenant?.menuPages ?? [])
    .map((p) => p.image)
    .filter((img): img is NonNullable<typeof img> => Boolean(img?.url));
  return { file: pages[0] ?? tenant?.menu ?? null, pages };
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
 * Record a spin of the lucky wheel. Only the wheel page does this, signed in
 * as the staff member running it; the CMS checks the prize is on the wheel.
 */
export const recordSpin = async (token: string, reward: string, branchId: string) => {
  const res = await fetch(`${API_URL}/api/spin-history/record`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `JWT ${token}` },
    body: JSON.stringify({ branch: branchId, reward }),
  });
  if (!res.ok) throw new Error(`Could not record the spin (${res.status})`);
};

/* END OF MUTATIONS */
