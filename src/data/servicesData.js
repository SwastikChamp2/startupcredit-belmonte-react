const serviceSections = [
  { id: 'government-funding', title: 'Government Funding' },
  { id: 'startup-funding', title: 'Startup Funding' },
  { id: 'financing-options', title: 'Financing Options' },
  { id: 'special-categories', title: 'Special Categories' },
]

const allServices = [
  {
    title: "National Agricultural Infra Financing",
    description: "AIF-backed financing for post-harvest infrastructure, community farming assets, warehouses, cold chains, and agri-logistics projects.",
    image: "assets/img/project/project1.jpg",
    alt: "National Agricultural Infrastructure Financing",
    scheme: "national-agricultural-infra-financing",
    sectionId: "government-funding"
  },
  {
    title: "Funding through CGTMSE (up to 10Cr)",
    description: "Provides bank guarantees for MSMEs, enabling them to secure loans up to \u20B910Cr without collateral.",
    image: "assets/img/service/service-img-2.png",
    alt: "CGTMSE Funding",
    scheme: "cgtmse-scheme",
    sectionId: "government-funding"
  },
  {
    title: "Stand-Up India Funding (\u20B910L-1Cr)",
    description: "Facilitates bank loans between \u20B910L and \u20B91Cr specifically for Women, SC/ST entrepreneurs starting new ventures.",
    image: "assets/img/service/service-img-3.png",
    alt: "Stand-Up India Funding",
    scheme: "startup-india",
    sectionId: "government-funding"
  },
  {
    title: "Startup India Seed Fund Scheme",
    description: "Early-stage financial aid to build prototypes, prove concepts, and conduct product trials.",
    image: "assets/img/service/service-img-4.png",
    alt: "Startup India Seed Fund",
    scheme: "sisf-scheme",
    sectionId: "government-funding"
  },
  {
    title: "Prime Ministers Employment Generation Programme",
    description: "PMEGP: A credit-linked subsidy program for new enterprises offering up to 35% subsidy to boost employment.",
    image: "assets/img/service/service-img-1.png",
    alt: "Prime Minister's Employment Generation Programme",
    scheme: "pmegp-scheme",
    sectionId: "government-funding"
  },
  {
    title: "Angel Investment",
    description: "Capital provided by private investors including valuable networking, strategic guidance.",
    image: "assets/img/service/service-img-5.png",
    alt: "Angel Investment",
    scheme: "angel-investment",
    sectionId: "startup-funding"
  },
  {
    title: "Venture Capital",
    description: "Funding from professional firms for high-growth startups entering Series A or B rounds to scale operations.",
    image: "assets/img/service/service-img-6.png",
    alt: "Venture Capital",
    scheme: "venture-capital",
    sectionId: "startup-funding"
  },
  {
    title: "Seed Funding",
    description: "Early capital to go from idea to prototype and early market validation.",
    image: "assets/img/service/service-img-7.png",
    alt: "Seed Funding",
    scheme: "seed-to-scale",
    sectionId: "startup-funding"
  },
  {
    title: "Working Capital Loans",
    description: "Fast-tracked operational loans to cover daily costs, wages, and smooth cash flow.",
    image: "assets/img/service/service-img-8.png",
    alt: "Working Capital Loans",
    scheme: "working-capital",
    sectionId: "startup-funding"
  },
  {
    title: "Term Loans",
    description: "Long-term financing with low EMIs for major investments spread over several years.",
    image: "assets/img/service/service-img-9.png",
    alt: "Term Loans",
    scheme: "term-loans",
    sectionId: "financing-options"
  },
  {
    title: "Invoice Financing",
    description: "Instant cash against unpaid customer invoices without waiting for payment.",
    image: "assets/img/service/service-img-10.png",
    alt: "Invoice Financing",
    scheme: "invoice-financing",
    sectionId: "financing-options"
  },
  {
    title: "Equipment Financing",
    description: "Specialized loans covering up to 100% cost for new machinery and equipment upgrades.",
    image: "assets/img/service/service-img-11.png",
    alt: "Equipment Financing",
    scheme: "equipment-financing",
    sectionId: "financing-options"
  },
  {
    title: "Export Financing",
    description: "Financial assistance for international trade, managing forex and global market complexities.",
    image: "assets/img/service/service-img-12.png",
    alt: "Export Financing",
    scheme: "export-financing",
    sectionId: "financing-options"
  },
  {
    title: "Women Entrepreneurs",
    description: "Targeted schemes offering special benefits like lower interest rates for female founders.",
    image: "assets/img/service/service-img-13.png",
    alt: "Women Entrepreneurs",
    scheme: "women-entrepreneurs",
    sectionId: "special-categories"
  },
  {
    title: "Green Business",
    description: "Rewards sustainable ventures with eco-benefits, preferential rates for environmental impact.",
    image: "assets/img/service/service-img-14.png",
    alt: "Green Business",
    scheme: "green-business",
    sectionId: "special-categories"
  },
  {
    title: "Rural Industries",
    description: "Specialized subsidies and support for industrialization and job creation in rural areas.",
    image: "assets/img/service/service-img-15.png",
    alt: "Rural Industries",
    scheme: "rural-industries",
    sectionId: "special-categories"
  }
]

// Group services by section
const servicesBySection = {}
for (const service of allServices) {
  if (!servicesBySection[service.sectionId]) servicesBySection[service.sectionId] = []
  servicesBySection[service.sectionId].push(service)
}

// Legacy flat export for backward compatibility
export const servicesData = allServices

export { serviceSections, servicesBySection }
