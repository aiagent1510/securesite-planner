export type System = { id: number; brand: string; name: string; type: "Wired NVR" | "Wired DVR" | "Wireless" | "Battery" | "Alarm" | "Wireless Alarm"; res: string; channels: number; price: number; rating: number };
const brands: [string, string[]][] = [
  ["Hikvision", ["AcuSense Pro", "ColorVu 4K", "EasyIP 4.0", "Turbo HD X"]],
  ["Dahua", ["WizSense", "Full-Color 2.0", "TiOC Pro", "Lite Series"]],
  ["Uniview", ["Prime IV", "ColorHunter", "Easy Series"]],
  ["Axis", ["M-Line", "P-Line Pro"]],
  ["Reolink", ["RLK16 4K", "Duo 3 PoE", "Argus Eco", "Go Plus 4G"]],
  ["Ring", ["Spotlight Pro", "Stick Up Cam", "Alarm Pro"]],
  ["Arlo", ["Pro 5S", "Ultra 2", "Essential XL"]],
  ["Ajax", ["Hub 2 Plus", "StarterKit Cam", "MotionCam Outdoor"]],
  ["Texecom", ["Premier Elite", "Ricochet Wireless"]],
  ["Pyronix", ["Enforcer 32", "Euro 46"]],
  ["Yale", ["Sync Smart Alarm", "Smart Home CCTV"]],
  ["Hanwha", ["Wisenet X", "Wisenet Q"]],
  ["Eufy", ["S330 eufyCam 3", "4G Starlight"]],
  ["Swann", ["Master Series", "4K Enforcer"]],
  ["Annke", ["NC800", "C800"]],
  ["Risco", ["LightSYS+", "Agility 4"]],
  ["Honeywell", ["Galaxy Flex", "Evohome Secure"]],
  ["Verisure", ["Smart Alarm"]],
  ["Imou", ["Cruiser 2", "Ranger Pro"]],
  ["Tapo", ["C520WS", "C425 Battery"]],
];
const types: System["type"][] = ["Wired NVR", "Wired DVR", "Wireless", "Battery", "Alarm", "Wireless Alarm"];
const alarmBrands = ["Ajax", "Texecom", "Pyronix", "Risco", "Honeywell", "Verisure"];
export const systems: System[] = [];
let id = 1;
outer: for (let round = 0; round < 3; round++)
  for (const [brand, names] of brands)
    for (const n of names) {
      if (id > 100) break outer;
      const isAlarm = alarmBrands.includes(brand) || n.includes("Alarm");
      const type = isAlarm ? (n.match(/Wireless|Ricochet|Hub|Agility|Smart/) ? "Wireless Alarm" : "Alarm") : types[(id + round) % 4];
      const ch = [4, 8, 16, 32][(id + round) % 4];
      systems.push({ id, brand, name: round ? `${n} ${["Kit", "Bundle"][round - 1]} ${ch}` : n, type, res: isAlarm ? "Grade 2" : ["4MP", "5MP", "8MP 4K", "12MP"][(id * 3) % 4], channels: ch, price: Math.round(290 + ((id * 137) % 1900)), rating: +(4 + ((id * 7) % 10) / 10).toFixed(1) });
      id++;
    }

export const cameraStyles = [
  { name: "Turret / Eyeball", use: "Eaves, driveways. No IR glare, easy to angle.", tip: "Most popular UK domestic choice." },
  { name: "Bullet", use: "Long gardens, side passages, visible deterrent.", tip: "Mount 2.5–3m high, angle down 15–30°." },
  { name: "Dome (vandal)", use: "Low ceilings, shopfronts, reachable spots.", tip: "IK10 rated domes resist tampering." },
  { name: "PTZ", use: "Large sites, car parks, farms.", tip: "Auto-tracking follows people and vehicles." },
  { name: "Doorbell camera", use: "Front doors, parcel watch.", tip: "Needs 8–24V AC or battery." },
  { name: "Fisheye 360°", use: "Open-plan rooms, warehouses.", tip: "One camera replaces 3–4." },
  { name: "ANPR", use: "Driveways, gated entrances.", tip: "Reads number plates up to 15m." },
  { name: "Dual-lens", use: "Corners and wide frontages.", tip: "Two views from one cable." },
];

export const alarmParts = [
  { name: "Control panel", where: "Hidden, dry, near mains — under stairs or utility." },
  { name: "Keypad", where: "Within 30s walk of main entry, not visible through glass." },
  { name: "PIR detectors", where: "Room corners at 2.1–2.4m, facing across entry paths, not at windows/heaters." },
  { name: "Door contacts", where: "Top of the opening side of front, back, patio doors." },
  { name: "External siren", where: "High on front elevation, visible from the street." },
  { name: "Smoke / heat", where: "Hallways and landings; heat in kitchen." },
];

export type Installer = { id: string; name: string; company: string; area: string; rating: number; reviews: number; years: number; badges: string[]; jobs: number; responds: string; bio: string; phone: string };
export const installers: Installer[] = [
  { id: "mark-hughes", name: "Mark Hughes", company: "Copperline Security", area: "Manchester & Stockport", rating: 4.9, reviews: 312, years: 14, badges: ["NSI Gold", "SSAIB", "DBS checked", "£5m insured"], jobs: 1240, responds: "within 1 hour", bio: "Hikvision & Ajax specialist. Clean cable runs, no visible clips.", phone: "447700900111" },
  { id: "sara-patel", name: "Sara Patel", company: "Brightwatch CCTV", area: "Leeds & Bradford", rating: 4.8, reviews: 198, years: 9, badges: ["SSAIB", "DBS checked", "Reolink Pro"], jobs: 640, responds: "within 2 hours", bio: "Wireless and battery systems for rentals and new builds.", phone: "447700900222" },
  { id: "dan-oconnor", name: "Dan O'Connor", company: "Ironside Alarms", area: "Birmingham", rating: 4.7, reviews: 144, years: 21, badges: ["NSI Silver", "Texecom Pro", "Police response"], jobs: 2100, responds: "same day", bio: "Graded alarms with police URN, monitoring and keyholding.", phone: "447700900333" },
];

export const jobs = [
  { id: "J-2041", customer: "Emma R.", postcode: "M20", system: "4 x 4K turret + 8ch NVR", status: "New lead", photos: 14, value: "£1,150–£1,380" },
  { id: "J-2039", customer: "Tom B.", postcode: "SK4", system: "Ajax wireless alarm, 6 zones", status: "Quote sent", photos: 9, value: "£790" },
  { id: "J-2033", customer: "Priya K.", postcode: "M33", system: "6 x ColorVu + doorbell", status: "Booked 21 Nov", photos: 22, value: "£1,640" },
];
