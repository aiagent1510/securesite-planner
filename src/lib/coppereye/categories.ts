// CopperEye — shared category + AI walk-round definitions (used by client and server)

export const CATEGORIES = [
  { id: "CCTV", label: "CCTV Systems", blurb: "Home & business camera systems, DVR/NVR installs" },
  { id: "ALARMS", label: "Intruder Alarms", blurb: "Wired & wireless burglar alarm installation" },
  { id: "GATES", label: "Gates & Automation", blurb: "Electric swing/slide gates, access control" },
  { id: "ACCESS", label: "Access Control & Intercoms", blurb: "Video intercoms, door entry, fob systems" },
  { id: "SMART", label: "Smart Locks & Home Security", blurb: "Smart locks, doorbell cameras, smart alarms" },
  { id: "COMMERCIAL", label: "Business & Commercial", blurb: "Shops, offices, warehouses — full coverage" },
  { id: "LIGHTING", label: "Security Lighting", blurb: "PIR floodlights, dusk-to-dawn, smart lighting" },
  { id: "REPAIR", label: "Maintenance & Repair", blurb: "Fault finding, upgrades, takeovers of existing kit" },
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"]

export interface WizardStep {
  id: string
  title: string
  instruction: string
  tips: string[]
}

const GENERAL_STEPS: WizardStep[] = [
  {
    id: "overview",
    title: "Front of the property",
    instruction: "Start at the street. Take 1-2 photos of the whole front of the building including the front door, driveway and any paths leading to it.",
    tips: [
      "Stand back far enough to catch the whole frontage in one shot",
      "Note where a visitor would walk up to the door",
      "If you want the doorbell/intercom covered, make sure the front door is visible",
    ],
  },
  {
    id: "sides",
    title: "Sides, boundary & gates",
    instruction: "Walk around the outside. Photograph each side of the property and any side gates, alleys, or fence lines someone could climb.",
    tips: [
      "Side alleys are the most common unobserved entry route",
      "Photograph any gates — width and height matter for alarms and gate automation",
      "Point out where neighbours could or couldn't see",
    ],
  },
  {
    id: "rear",
    title: "Rear of the property",
    instruction: "Photograph the back of the building, patio or garden, and any outbuildings (garage, shed, workshop) you want protected.",
    tips: [
      "Rear doors and low windows are the highest-risk entry points",
      "Note where equipment (bikes, tools, vehicles) is stored",
      "Include the far corner of the garden so coverage distance is visible",
    ],
  },
  {
    id: "entry",
    title: "Entry points close-up",
    instruction: "Take close photos of the front door, back door, and the ground-floor windows you are most worried about.",
    tips: [
      "Door material matters (uPVC, timber, composite) for alarm contacts and smart locks",
      "Note any existing alarm boxes, cameras or doorbells in these shots",
      "Count how many doors/windows you want protected",
    ],
  },
  {
    id: "plant",
    title: "Where the kit would live",
    instruction: "Photograph the place you think the recorder or alarm panel would go (under the stairs, a cupboard, the loft, an office) plus the mains sockets nearby.",
    tips: [
      "Recorders/panels need a mains socket and some ventilation",
      "Under-stairs and cupboards are ideal — out of sight, cool and dry",
      "If it's a business, say who needs access to that room",
    ],
  },
  {
    id: "router",
    title: "Broadband router & power",
    instruction: "Photograph your broadband router and, if you can, the wall sockets near where the kit would live.",
    tips: [
      "Smart alarms and remote viewing need internet at the recorder/panel",
      "Wi-Fi strength at the camera/panel locations affects wireless options",
      "Cable runs from recorder to eaves should follow the photo of the router location",
    ],
  },
]

const CCTV_STEPS: WizardStep[] = [
  {
    id: "front",
    title: "Front elevation & approach",
    instruction: "From the street take one wide photo of the whole front of the building, then one closer shot of the front door and driveway.",
    tips: [
      "The AI will use this to suggest camera positions covering the drive and front door",
      "Note (in text) roughly how wide the frontage is — e.g. 'about 8 metres'",
      "Include any parked car areas you want watched",
    ],
  },
  {
    id: "sides",
    title: "Both sides & alleyways",
    instruction: "Photograph each side of the property, including side gates or passages and anything someone could use to climb up.",
    tips: [
      "Bin stores and flat roofs are common climbing aids",
      "Note if side gates are locked or open",
      "Boundary walls tell the AI about detection distances",
    ],
  },
  {
    id: "rear",
    title: "Rear elevation & garden",
    instruction: "Photograph the back of the building and the garden, including outbuildings and the furthest point you want covered.",
    tips: [
      "Long gardens may need a varifocal or a second camera",
      "Note garages/sheds that could block views or need their own camera",
    ],
  },
  {
    id: "eaves",
    title: "Eaves, fascia & mounting surfaces",
    instruction: "Take a photo looking up at the eaves/gutter line and one of the wall surface where cameras would be mounted.",
    tips: [
      "Brick, render, pebbledash and uPVC fascia each need different fixings",
      "Eaves height (roughly, e.g. 'about 4m') helps plan camera angles",
      "Existing soffit holes or previous camera mounts are worth showing",
    ],
  },
  {
    id: "entry",
    title: "Doors & high-risk windows",
    instruction: "Close-up photos of the front door, rear door and ground-floor windows you want covered most.",
    tips: [
      "Numberplate capture on a driveway needs a dedicated angle — show the parking spot",
      "Note which doors are main entrances vs rarely used",
    ],
  },
  {
    id: "recorder",
    title: "NVR / recorder location",
    instruction: "Photograph where you'd want the recorder (cupboard, under stairs, loft, office) and the mains socket there.",
    tips: [
      "Needs a socket, ventilation and somewhere a cable route can start",
      "Loft installs need easy access for maintenance",
      "Keep it away from damp or direct heat",
    ],
  },
  {
    id: "router",
    title: "Broadband router",
    instruction: "Photograph your broadband router — this decides how remote viewing on your phone gets set up.",
    tips: [
      "Distance between router and recorder matters for the cable route",
      "Tell us if you have mesh Wi-Fi extenders",
    ],
  },
]

const ALARM_STEPS: WizardStep[] = [
  {
    id: "front",
    title: "Front entrance & alarm box spot",
    instruction: "Photograph the front door and porch, and the outside wall where the bell box would mount (high up, visible from the street).",
    tips: [
      "Bell boxes work best near the front door, 3-4m up, clearly visible",
      "Note the wall surface (brick/render) in your text",
    ],
  },
  {
    id: "hall",
    title: "Hallway, stairs & panel position",
    instruction: "Photograph the hallway and where you'd want the alarm panel/keypad (usually by the front door or on the landing).",
    tips: [
      "Keypad must be reachable from the front door for entry/exit timing",
      "Panel needs a nearby mains socket",
      "For pets, mention pet-friendly PIRs in your notes",
    ],
  },
  {
    id: "ground",
    title: "Ground-floor rooms",
    instruction: "Take one photo per ground-floor room (living room, kitchen, utility, dining). Stand in the doorway so the whole room shows.",
    tips: [
      "PIR sensors go in room corners, 2-2.2m high, covering doorways",
      "Kitchens with boilers/heaters need care with sensor choice",
      "Conservatories and extensions need special sensors",
    ],
  },
  {
    id: "entry",
    title: "Doors & window frames",
    instruction: "Close-ups of the front door, back door, French/patio doors, and ground-floor window frames you want contacted.",
    tips: [
      "uPVC doors need surface or recessed contacts — show the frame edge",
      "Count the windows you want covered so the engineer can quote contacts",
    ],
  },
  {
    id: "upstairs",
    title: "Upstairs landing & rooms",
    instruction: "One photo of the upstairs landing and any upstairs rooms you want sensors in (bedrooms, office).",
    tips: [
      "Landing PIR catches anyone moving upstairs",
      "Bedrooms with window locks often just get a contact or nothing",
    ],
  },
  {
    id: "outbuildings",
    title: "Garage, shed & outbuildings",
    instruction: "Photograph any garage, shed or workshop you want on the alarm, including inside if possible.",
    tips: [
      "Detached buildings need wireless sensors or armoured cabling",
      "Garage doors can take contacts or a curtain PIR",
    ],
  },
  {
    id: "router",
    title: "Broadband router",
    instruction: "Photograph your broadband router — smart alarms use it for app alerts and monitoring.",
    tips: [
      "App control and police-style signalling need internet",
      "Tell us if the router is far from the panel spot",
    ],
  },
]

const GATES_STEPS: WizardStep[] = [
  {
    id: "driveway",
    title: "Driveway & gate overview",
    instruction: "Stand back and photograph the whole driveway and gate area so the gate type and surroundings are visible.",
    tips: [
      "Say in the text if the gate swings or slides, or if there's no gate yet",
      "Note what the vehicle(s) are — car, van, HGV",
    ],
  },
  {
    id: "gate",
    title: "Gate opening & ground",
    instruction: "Photograph the gate opening square-on (including the ground between the piers) and the piers/posts themselves.",
    tips: [
      "Opening width decides single vs double swing or a slide gate",
      "Sloping driveways limit swing gates — show the slope",
      "Piers must be solid enough to mount motors",
    ],
  },
  {
    id: "power",
    title: "Power route to the gate",
    instruction: "Photograph the nearest wall socket or power source on the house side facing the gate, and the route the cable could take.",
    tips: [
      "Motors need a fused spur from the house electrics",
      "Long driveway runs may need armoured cable — show the route",
    ],
  },
  {
    id: "intercom",
    title: "Intercom & access position",
    instruction: "Photograph where you'd want the intercom keypad/panel at the gate and where you'd want to hear it inside the house.",
    tips: [
      "Video intercoms need Wi-Fi or cable back to the house",
      "GSM intercoms use a SIM — good for gates far from the house",
    ],
  },
  {
    id: "safety",
    title: "Safety & obstacles",
    instruction: "Photograph anything that swings through the gate arc — walls, vehicles, slopes, drainage channels.",
    tips: [
      "Safety edges and photocells are required on automated gates",
      "Note if children or pets use the driveway",
    ],
  },
]

const COMMERCIAL_STEPS: WizardStep[] = [
  {
    id: "exterior",
    title: "Building exterior & entrances",
    instruction: "Photograph the front entrance, staff/stock entrances, yard and loading areas, and the full perimeter you want watched.",
    tips: [
      "Note opening hours and who needs access",
      "Car parks and yards usually need separate wide-angle coverage",
    ],
  },
  {
    id: "interior",
    title: "Interior areas & stock",
    instruction: "Photograph the sales floor, stock rooms, office and till points as relevant.",
    tips: [
      "Till/cash handling usually needs a dedicated camera with a view of the counter",
      "Stock rooms need full coverage of aisles",
    ],
  },
  {
    id: "plant",
    title: "Plant room & IT location",
    instruction: "Photograph where the recorder/alarm panel would live and the mains supply there.",
    tips: [
      "Commercial recorders are larger — need rack or wall space",
      "Network points matter for IP systems",
    ],
  },
  {
    id: "router",
    title: "Broadband / network",
    instruction: "Photograph the router/network cabinet.",
    tips: ["Remote viewing and offsite backup depend on this"],
  },
]

export function wizardFor(category: string): WizardStep[] {
  switch (category) {
    case "CCTV":
      return CCTV_STEPS
    case "ALARMS":
      return ALARM_STEPS
    case "GATES":
      return GATES_STEPS
    case "COMMERCIAL":
      return COMMERCIAL_STEPS
    default:
      return GENERAL_STEPS
  }
}

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
)

export const PROPERTY_TYPES = ["House", "Flat / Apartment", "Bungalow", "Business / Shop", "Office", "Warehouse / Industrial", "School / Public building", "Other"]

export const BUDGETS = ["Flexible", "Under £500", "£500 - £1,000", "£1,000 - £2,500", "£2,500 - £5,000", "£5,000+"]
