import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.cuttypaws.com";
const BRAND_NAME = "CuttyPaws";
const BRAND_VARIANTS = [
  "Cutty Paws",
  "cuttypaws",
  "cuttypaw",
  "cutypaws",
  "cutypaw",
  "cutepaws",
  "cutiepaws",
];
const DEFAULT_TITLE = "CuttyPaws | Social Pet Community & Pet Accessories Marketplace";
const DEFAULT_DESCRIPTION =
  "CuttyPaws (Cutty Paws) connects pet owners to share pet moments and discover trusted pet accessories, essentials, and deals.";

const PAGE_META = {
  "/": {
    title: "CuttyPaws | Social Pet Community & Pet Shop",
    description:
      "CuttyPaws (also written as Cutty Paws) is a social pet community where pet lovers connect, share pet moments, and shop pet products online.",
  },
  "/categories": {
    title: "Shop Pet Categories | CuttyPaws",
    description: "Browse pet products by category on CuttyPaws and find essentials for dogs, cats, birds, fish, and more.",
  },
  "/login": {
    title: "Login | CuttyPaws",
    description: "Login to your CuttyPaws account to post, shop, and manage your pet profile.",
  },
  "/register": {
    title: "Register | CuttyPaws",
    description: "Create your CuttyPaws account to join the pet community and start shopping pet products.",
  },
  "/about-us": {
    title: "About CuttyPaws",
    description: "Learn about CuttyPaws and our mission to build a trusted social and shopping platform for pet owners.",
  },
  "/faqs": {
    title: "FAQs | CuttyPaws",
    description: "Find answers to common questions about shopping, orders, accounts, and using the CuttyPaws platform.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | CuttyPaws",
    description: "Read how CuttyPaws handles your data, privacy, and account information.",
  },
  "/terms-and-conditions": {
    title: "Terms and Conditions | CuttyPaws",
    description: "Review the CuttyPaws terms and conditions for using our social and marketplace platform.",
  },
  "/new-arrivals": {
    title: "New Arrivals | CuttyPaws",
    description: "Discover the newest pet products and accessories added to CuttyPaws.",
  },
  "/trending": {
    title: "Trending Pet Products | CuttyPaws",
    description: "Explore trending pet products and popular picks on CuttyPaws.",
  },
  "/deals": {
    title: "Pet Deals | CuttyPaws",
    description: "Find current promotions and pet product deals on CuttyPaws.",
  },
  "/products-list": {
    title: "All Products | CuttyPaws",
    description: "Browse the complete pet product catalog on CuttyPaws.",
  },
};

const NOINDEX_PREFIXES = ["/admin", "/support", "/company", "/settings", "/notifications", "/edit-", "/add-"];
const NOINDEX_EXACT = new Set([
  "/request-password",
  "/reset-password",
  "/payment-callback",
  "/payment-success",
  "/payment-failed",
  "/customer-profile",
]);

const shouldNoIndex = (pathname) => {
  if (NOINDEX_EXACT.has(pathname)) return true;
  return NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

const SeoMeta = () => {
  const location = useLocation();
  const pathname = location.pathname || "/";
  const pageMeta = PAGE_META[pathname] || {};
  const canonical = `${SITE_URL}${pathname}`;
  const robots = shouldNoIndex(pathname) ? "noindex,nofollow" : "index,follow";
  const title = pageMeta.title || DEFAULT_TITLE;
  const description = pageMeta.description || DEFAULT_DESCRIPTION;
  const isDev = import.meta.env.DEV;
  const keywords =
    "CuttyPaws, Cutty Paws, cuttypaws, cuttypaw, cutypaws, cutypaw, cutepaws, cutiepaws, pet community, pet shop";
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    alternateName: BRAND_VARIANTS,
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    alternateName: BRAND_VARIANTS,
    url: SITE_URL,
    inLanguage: "en-US",
  };
  const navSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "Login",
        url: `${SITE_URL}/login`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Register",
        url: `${SITE_URL}/register`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "Categories",
        url: `${SITE_URL}/categories`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "Products",
        url: `${SITE_URL}/products-list`,
      },
    ],
  };

  useEffect(() => {
    document.title = title;
  }, [title]);

  if (isDev) {
    return null;
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="CuttyPaws" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${SITE_URL}/og-image.png`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(navSchema)}
      </script>
    </Helmet>
  );
};

export default SeoMeta;
