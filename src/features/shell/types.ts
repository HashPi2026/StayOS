import { NavigationPath } from '@/src/types';

export interface PmsSubMenuItem {
  key: string;
  path: NavigationPath;
  displayName: string;
  materialIcon: string;
  description?: string;
  badge?: string;
  plannedFeatures?: string[];
}

export interface PmsModuleInfo {
  moduleKey: string;
  displayName: string;
  iconKey: string;
  materialIcon: string;
  sortOrder: number;
  isBuilt: boolean;
  hasAccess: boolean;
  description: string;
  badge?: string;
  plannedFeatures: string[];
  subItems?: PmsSubMenuItem[];
}

export const FRONT_DESK_SUBMENUS: PmsSubMenuItem[] = [
  {
    key: 'search-reservation',
    path: 'search-reservation',
    displayName: 'Search Reservation',
    materialIcon: 'manage_search',
    description: 'Advanced multi-criteria reservation filtering, folios, guest history, and instant confirmation lookups.',
    badge: 'Directory',
  },
  {
    key: 'guest-ledger',
    path: 'guest-ledger',
    displayName: 'Guest Ledger',
    materialIcon: 'menu_book',
    description: 'Live operational ledger across In-House, To Check Out, Checked Out, Reservations, Room Changes, and Late Checkouts.',
    badge: 'Live Ledger',
  },
  {
    key: 'batch-folio',
    path: 'batch-folio',
    displayName: 'Batch Folio',
    materialIcon: 'receipt_long',
    description: 'Bulk folio generation, print spooling, registration forms, and mass guest email dispatch.',
    badge: 'Bulk Ops',
  },
  {
    key: 'change-room-status',
    path: 'change-room-status',
    displayName: 'Change Room Status',
    materialIcon: 'published_with_changes',
    description: 'Floor-by-floor interactive room cards with instant HK status update and occupancy conflict warnings.',
    badge: 'Room Rack',
  },
  {
    key: 'block-room',
    path: 'block-room',
    displayName: 'Block Room',
    materialIcon: 'domain_disabled',
    description: 'Maintenance holds, out-of-order designations, scheduled room blocks, and reservation conflict warnings.',
    badge: 'OOO / OOS',
  },
  {
    key: 'edit-group',
    path: 'edit-group',
    displayName: 'Edit Group',
    materialIcon: 'groups',
    description: 'Master corporate billing directives, AR headroom management, and group member reservation coordination.',
    badge: 'Groups',
  },
  {
    key: 'room-comments',
    path: 'room-comments',
    displayName: 'Room Comments',
    materialIcon: 'rate_review',
    description: 'Strictly append-only room operational audit log, shift handoffs, and guest preferences.',
    badge: 'Audit Trail',
  },
];

export const RATE_AVAILABILITY_SUBMENUS: PmsSubMenuItem[] = [
  {
    key: 'flash',
    path: 'rate-availability-flash',
    displayName: 'Flash',
    materialIcon: 'bolt',
    description: 'Flash rate promotions, limited-time inventory sales, urgent distress pricing, and rapid discount pushes.',
    badge: 'Quick Sales',
    plannedFeatures: [
      'Instant Flash Rate Broadcast across OTAs',
      'Countdown Timer Limited Availability Campaign',
      'Last-Minute Room Inventory Liquidation',
      'Targeted Geo-Fenced Flash Deals',
      'Automatic Expiry & Rack Rate Reversion',
    ],
  },
  {
    key: 'forecasting',
    path: 'rate-availability-forecasting',
    displayName: 'Forecasting',
    materialIcon: 'trending_up',
    description: 'Predictive occupancy demand forecasting, pacing curve analysis, historical pickup, and revenue optimization models.',
    badge: 'Demand AI',
    plannedFeatures: [
      '30/60/90 Day Predictive Occupancy Modeling',
      'Pace Curve vs Previous Year & Budget Comparison',
      'Unconstrained Demand & Spillover Calculation',
      'Market Segment & Booking Window Pickup Analysis',
      'Revenue Sensitivity & ADR Elasticity Curves',
    ],
  },
  {
    key: 'rate',
    path: 'rate-availability-rate',
    displayName: 'Rate',
    materialIcon: 'sell',
    description: 'Base room rate grid, seasonal rate tiers, derivative rate plans, meal supplements, and dynamic yield rules.',
    badge: 'Rate Grid',
    plannedFeatures: [
      'Interactive Room Type × Rate Plan Matrix Grid',
      'Seasonal Surcharges & Day-of-Week Pricing Rules',
      'Derivative Rate Plans with Percentage/Fixed Offsets',
      'Extra Adult / Child & Meal Plan Supplements',
      'Bulk Rate Updates & Mass Pricing Adjustments',
    ],
  },
  {
    key: 'restriction',
    path: 'rate-availability-restriction',
    displayName: 'Restriction',
    materialIcon: 'block',
    description: 'Stay restrictions, Minimum Length of Stay (MLOS), Maximum Length of Stay (MaxLOS), Closed to Arrival (CTA), and Closed to Departure (CTD).',
    badge: 'Stay Controls',
    plannedFeatures: [
      'Minimum Length of Stay (MLOS) Calendar Matrix',
      'Closed to Arrival (CTA) & Closed to Departure (CTD) Toggles',
      'Maximum Length of Stay (MaxLOS) Overbooking Safeguards',
      'Stop-Sell Overrides by Room Category & Rate Plan',
      'Bulk Restriction Calendar Importer & Channel Sync',
    ],
  },
];

export const GUEST_SUBMENUS: PmsSubMenuItem[] = [
  {
    key: 'guest-database',
    path: 'guest-database',
    displayName: 'Guest Database',
    materialIcon: 'badge',
    description: 'Master individual guest profiles, identity documents, stay statistics, multi-channel contacts, and DNR safeguards.',
    badge: 'Profiles',
    plannedFeatures: [
      'Master Guest Profiles & In-House Tracking',
      'Multi-Channel Contact Dispatch & Folio Routing',
      'Passport & Biometric Document Verification',
      'Do Not Rent (DNR) Risk & Security Enforcement',
    ],
  },
  {
    key: 'contacts',
    path: 'contacts',
    displayName: 'Contacts',
    materialIcon: 'corporate_fare',
    description: 'B2B commercial directory, corporate accounts, travel management agencies, suppliers, and category credit terms.',
    badge: 'Commercial',
    plannedFeatures: [
      'Commercial Accounts & Legal Entity Records',
      'Category Credit Ceilings & Payment Terms',
      'Direct Billing to City Ledger Invoicing',
      'Corporate Contract Rates & Negotiated Tariffs',
    ],
  },
  {
    key: 'lost-and-found',
    path: 'lost-and-found',
    displayName: 'Lost and Found',
    materialIcon: 'inventory_2',
    description: 'Property custody ledger, recovered guest belongings, high-security vault safekeeping, and statutory disposition logs.',
    badge: 'Custody',
    plannedFeatures: [
      'Chain of Custody Safekeeping Ledger',
      'High-Security Vault Storage Allocation',
      'Guest Restitution & Verification Workflow',
      'Statutory Disposition & Donation Clearing',
    ],
  },
];

export const HOUSEKEEPING_SUBMENUS: PmsSubMenuItem[] = [
  {
    key: 'groups',
    path: 'housekeeping' as NavigationPath,
    displayName: 'Groups',
    materialIcon: 'groups',
    description: 'Operational housekeeping squads, shifts, and team parameters.',
    badge: 'Teams',
  },
  {
    key: 'members',
    path: 'housekeeping-members' as NavigationPath,
    displayName: 'Group Members',
    materialIcon: 'badge',
    description: 'Attendants duty rosters and task assignment capabilities matrix.',
    badge: 'Matrix',
  },
  {
    key: 'assignment',
    path: 'housekeeping-assignment' as NavigationPath,
    displayName: 'Room Assignment',
    materialIcon: 'meeting_room',
    description: 'Interactive room turnover quotas and live attendant load balancing.',
    badge: 'Live Board',
  },
  {
    key: 'tasks',
    path: 'housekeeping-tasks' as NavigationPath,
    displayName: 'Tasks',
    materialIcon: 'task_alt',
    description: 'Housekeeping routine checklist workflows and SOP specifications.',
    badge: 'Workflows',
  },
];

export const PMS_MODULES_CONFIG: Record<string, {
  materialIcon: string;
  description: string;
  badge?: string;
  plannedFeatures: string[];
}> = {
  dashboard: {
    materialIcon: 'space_dashboard',
    description: 'Central operational cockpit for hotel management, live occupancy metrics, and morning briefings.',
    badge: 'Operational Hub',
    plannedFeatures: [
      'Live Room Occupancy & RevPAR Metrics',
      'Today Arrivals, Departures & In-House Guests',
      'Housekeeping Clean / Dirty Room Split',
      'Daily Revenue & Average Daily Rate (ADR)',
      'VIP & Special Guest Arrival Alerts',
    ],
  },
  reservation: {
    materialIcon: 'calendar_month',
    description: 'Multi-calendar booking grid, group allocations, OTA channel reservations, and deposit tracking.',
    badge: 'Booking Engine',
    plannedFeatures: [
      'Tape Chart Interactive Room Allocation Grid',
      'Group Block & Corporate Corporate Bookings',
      'Split Billing & Deposit Management',
      'OTA Direct Ingestion (Booking.com, Expedia, Agoda)',
      'Automated Confirmation & Pre-Arrival SMS/Emails',
    ],
  },
  front_desk: {
    materialIcon: 'desk',
    description: 'Express check-in/check-out, digital key issuance, room moves, and guest folio management.',
    badge: 'Guest Operations',
    plannedFeatures: [
      'Fast 1-Click Guest Check-In & Passport Scanner Sync',
      'Room Key Encoding (VingCard, Salto, Assa Abloy)',
      'Real-Time Room Move & Upgrade Assistant',
      'Split Folio, Incidental Holds & Payment Settlement',
      'Wake-Up Calls, Lost & Found, and Concierge Tasks',
    ],
  },
  rate_availability: {
    materialIcon: 'sell',
    description: 'Dynamic rate management, yield optimization, restrictions (CTA/CTD, MLOS), and promotions.',
    badge: 'Revenue Management',
    plannedFeatures: [
      'Dynamic Pricing Grid by Room Type & Season',
      'Minimum Length of Stay (MLOS) & Closed to Arrival (CTA)',
      'Corporate & Travel Agent Contracted Rates',
      'Package Bundles (Breakfast, Spa, Airport Transfer)',
      'Automated Competitor Rate Intelligence',
    ],
  },
  audit: {
    materialIcon: 'fact_check',
    description: 'Automated night audit sequence, daily revenue rollover, cashier balancing, and shift closures.',
    badge: 'Financial Control',
    plannedFeatures: [
      'Automated 6-Step Night Audit Rollover Sequence',
      'Room Charge & Tax Automatic Posting Engine',
      'Cashier Balance Reconciliation & Cash Drop Logs',
      'Trial Balance & Discrepancy Exception Reports',
      'Daily Business Summary Export to Accounting (QuickBooks, SAP)',
    ],
  },
  business_channels: {
    materialIcon: 'hub',
    description: 'Two-way channel manager sync, GDS connectivity, metasearch integration, and commission tracking.',
    badge: 'Distribution Network',
    plannedFeatures: [
      'Two-Way Real-Time Rate & Inventory Push (ARI)',
      'Booking.com, Expedia, Airbnb & Agoda Connectors',
      'Global Distribution System (Amadeus, Sabre, Galileo)',
      'Google Hotels & Tripadvisor Direct Booking Links',
      'Channel Commission & Net Revenue Attribution',
    ],
  },
  guest: {
    materialIcon: 'group',
    description: 'Comprehensive guest CRM, stay history, guest preferences, loyalty tiers, and feedback tracking.',
    badge: 'Guest Relations',
    plannedFeatures: [
      'Unified Guest Profile with Cross-Stay History',
      'Preferences & Dietary / Room Feature Tags',
      'Loyalty Rewards Points & Tier Progression',
      'Do Not Rent (DNR) & Blacklist Verification',
      'Post-Stay Satisfaction Surveys & NPS Tracking',
    ],
  },
  housekeeping: {
    materialIcon: 'cleaning_services',
    description: 'Housekeeping board, mobile attendant task lists, room turn-down, and linen tracking.',
    badge: 'Housekeeping & Cleanliness',
    plannedFeatures: [
      'Color-Coded Floor-by-Floor Cleaning Matrix',
      'Attendant Mobile View for Marking Rooms Clean/Inspected',
      'Turndown Service Scheduling & Linen Inventory',
      'Maintenance Work Order Creation & Photo Attachments',
      'Minibar Consumption Billing Directly to Guest Folio',
    ],
  },
  utility: {
    materialIcon: 'build',
    description: 'Property equipment maintenance, energy monitoring, keycard terminal diagnostics, and data backups.',
    badge: 'Maintenance & Facilities',
    plannedFeatures: [
      'Preventative Maintenance Scheduling for HVAC & Elevators',
      'Door Lock Encoder Terminal Diagnostics',
      'Automated Cloud & Local Database Backups',
      'Bulk Data Import / Export Tools',
      'Energy Management System (EMS) Thermostat Sync',
    ],
  },
  reports: {
    materialIcon: 'bar_chart',
    description: 'Managerial BI reports, daily manager flash report, tax audit filings, and pace forecasting.',
    badge: 'Analytics & BI',
    plannedFeatures: [
      'Manager Daily Flash Report (ADR, RevPAR, Occupancy)',
      'Pace & Pickup Forecasting vs Same Period Last Year',
      'Tax Collection Breakdown by Jurisdiction',
      'Housekeeping Efficiency & Turnaround Timers',
      'Automated Scheduled PDF/Excel Deliveries to Ownership',
    ],
  },
  configuration: {
    materialIcon: 'settings',
    description: 'Comprehensive property setup, buildings, rooms, taxes, pricing policies, and system parameters.',
    badge: 'Live & Operational',
    plannedFeatures: [
      'Property Master & Multi-Property Group Hub',
      'Buildings, Floors, Room Types & Rooms Inventory',
      'Taxes, Tax Slabs & Effective Date Rule Engine',
      'Payment Gateways, Terminals & Scanners',
      'Roles, Privileges & Staff Access Control',
    ],
  },
};
