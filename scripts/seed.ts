/* CopperEye seed — demo engineers, sample jobs, reviews.
   Run: bunx tsx scripts/seed.ts  (or: bun scripts/seed.ts) */
import { PrismaClient } from "@prisma/client"
import { scryptSync, randomBytes } from "crypto"

const db = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

const PASSWORD = "copper123"

const engineers = [
  {
    email: "dave.hall@demo.coppereye.uk",
    name: "Dave Hall",
    businessName: "Hall Security Systems",
    headline: "CCTV & alarm specialist covering Greater Manchester — 4K IP systems, smart alarms, gate automation",
    bio: "Ex-BT engineer, now running a small family security firm. I fit 4K IP camera systems, wired and wireless alarms, and automate gates and garage doors. Every job gets a full handover with app setup on your phone, and I offer 12 months labour warranty on all installs.",
    tradeTypes: "CCTV,ALARMS,GATES,SMART",
    coverageArea: "Manchester + 25 miles",
    yearsExperience: 14,
    accreditations: "SSAIB, City & Guilds 3699, DBS checked",
    verified: true,
    jobsCompleted: 187,
    credits: 64,
  },
  {
    email: "aisha.khan@demo.coppereye.uk",
    name: "Aisha Khan",
    businessName: "KhanSecure Installations",
    headline: "Intruder alarm engineer — wired, wireless & smart alarms with pet-friendly PIRs",
    bio: "Specialist in residential alarms: Texecom and Pyronix-trained, police-style signalling, and smart app-controlled alarms. I design systems around pets, kids and real-life use, with full documentation for insurers.",
    tradeTypes: "ALARMS,SMART,COMMERCIAL",
    coverageArea: "Birmingham + 20 miles",
    yearsExperience: 9,
    accreditations: "SSAIB certified, ECS card, DBS checked",
    verified: true,
    jobsCompleted: 122,
    credits: 41,
  },
  {
    email: "tony.marsh@demo.coppereye.uk",
    name: "Tony Marsh",
    businessName: "Marsh Gate Automation",
    headline: "Electric gates & barriers — swing, slide, intercoms and access control",
    bio: "I automate gates properly: correct motors for the gate weight, safety edges, photocells and tidy armoured cable runs. Also fit video intercoms, fob and ANPR access for homes, flats and business yards.",
    tradeTypes: "GATES,ACCESS,COMMERCIAL",
    coverageArea: "Leeds + 30 miles",
    yearsExperience: 18,
    accreditations: "Gate Safe aware, C&G electrical, DBS checked",
    verified: true,
    jobsCompleted: 96,
    credits: 30,
  },
  {
    email: "jo.walsh@demo.coppereye.uk",
    name: "Jo Walsh",
    businessName: "Walsh CCTV & Data",
    headline: "Multi-camera commercial CCTV, maintenance contracts and camera fault repairs",
    bio: "Small team covering shops, offices, schools and warehouses. Hikvision/Dahua-trained with a 4-hour emergency callout. We service and upgrade systems other installers fitted — including password cleanups and port-forwarding security fixes.",
    tradeTypes: "CCTV,COMMERCIAL,REPAIR",
    coverageArea: "Liverpool + 40 miles",
    yearsExperience: 11,
    accreditations: "DBS checked, IPAF, working at height cert",
    verified: true,
    jobsCompleted: 210,
    credits: 88,
  },
  {
    email: "ry.lee@demo.coppereye.uk",
    name: "Ryan Lee",
    businessName: "Lee Smart Security",
    headline: "Smart locks, doorbells, smart alarms — tidy installs, patient app setup included",
    bio: "I help people who want keyless doors, video doorbells and alarms they control from their phone. I take the time to set everything up on the whole family's phones and teach you how it works before I leave.",
    tradeTypes: "SMART,CCTV,ACCESS",
    coverageArea: "Bristol + 15 miles",
    yearsExperience: 6,
    accreditations: "ECS card, DBS checked",
    verified: false,
    jobsCompleted: 34,
    credits: 12,
  },
  {
    email: "sam.otoole@demo.coppereye.uk",
    name: "Sam O'Toole",
    businessName: "O'Toole Security & Electrical",
    headline: "Home security upgrades — cameras, alarms and security lighting, all trades tidied in one visit",
    bio: "Part P electrician who focuses on security work: floodlighting with proper PIR placement, camera installs with neat cable routes, and alarm takeovers. Big on honesty with quoting — what I quote is what you pay.",
    tradeTypes: "CCTV,ALARMS,LIGHTING,REPAIR",
    coverageArea: "Sheffield + 20 miles",
    yearsExperience: 8,
    accreditations: "Part P registered, DBS checked",
    verified: false,
    jobsCompleted: 71,
    credits: 25,
  },
]

const reviewTexts = [
  { rating: 5, comment: "Brilliant from start to finish. The quote was spot-on, turned up when said, and everything was tidied away. The app on my phone works perfectly — he stayed until I could use it myself." },
  { rating: 5, comment: "Used the walk-round photos to quote without visiting, and the price matched exactly. Camera positions were exactly where the survey said. Would recommend to anyone." },
  { rating: 4, comment: "Good tidy job and fair price. Ran a day behind due to another job overrunning but kept me informed the whole time." },
  { rating: 5, comment: "Really helpful with the app setup for my mum — she's 74 and now checks the cameras herself. Patient and clear." },
  { rating: 5, comment: "Second time using them — added two cameras to a system they fitted two years ago. Same tidy standard." },
  { rating: 4, comment: "Solid work on the alarm. Took slightly longer than quoted but no extra charge, which I appreciated." },
]

async function main() {
  console.log("Seeding CopperEye demo data...")

  // --- Engineers ---
  const engineerIds: Record<string, string> = {}
  for (const e of engineers) {
    const existing = await db.user.findUnique({ where: { email: e.email } })
    if (existing) {
      engineerIds[e.name] = existing.id
      continue
    }
    const user = await db.user.create({
      data: {
        email: e.email,
        passwordHash: hashPassword(PASSWORD),
        name: e.name,
        role: "ENGINEER",
        phone: "07700 90000" + Math.floor(Math.random() * 9),
        postcode: "M1 1AE",
        engineerProfile: {
          create: {
            businessName: e.businessName,
            headline: e.headline,
            bio: e.bio,
            tradeTypes: e.tradeTypes,
            coverageArea: e.coverageArea,
            yearsExperience: e.yearsExperience,
            accreditations: e.accreditations,
            verified: e.verified,
            credits: e.credits,
            jobsCompleted: e.jobsCompleted,
          },
        },
      },
      include: { engineerProfile: true },
    })
    engineerIds[e.name] = user.id
    await db.creditTransaction.create({
      data: { userId: user.id, amount: e.credits, type: "BONUS", description: "Demo account opening credits" },
    })
    console.log("  + engineer", e.businessName)
  }

  // --- Demo customer ---
  let customer = await db.user.findUnique({ where: { email: "customer@demo.coppereye.uk" } })
  if (!customer) {
    customer = await db.user.create({
      data: {
        email: "customer@demo.coppereye.uk",
        passwordHash: hashPassword(PASSWORD),
        name: "Sarah Thompson",
        role: "CUSTOMER",
        phone: "07700 900123",
        postcode: "SK4 2HA",
      },
    })
    console.log("  + customer Sarah Thompson")
  }

  const jobsCount = await db.job.count({ where: { customerId: customer.id } })
  if (jobsCount === 0) {
    // --- Job 1: OPEN CCTV with full AI brief ---
    const j1 = await db.job.create({
      data: {
        customerId: customer.id,
        category: "CCTV",
        title: "4-camera CCTV for semi-detached house in Stockport",
        description: "Had a bike stolen from the side alley last month. Want the front drive, alley, back garden and front door covered, viewable on my phone.",
        postcode: "SK4 2HA",
        town: "Stockport",
        propertyType: "House",
        budget: "£1,000 - £2,500",
        preferredDate: "Flexible, ideally within 3 weeks",
        survey: {
          create: {
            analyzed: true,
            answers: JSON.stringify({
              front: "Semi-detached, about 7m wide. Driveway fits one car on the left, path to front door on the right.",
              sides: "Left side has a 1.2m wooden gate into the alley where the bins and bikes are. Right side is attached to the neighbour, no access.",
              rear: "Back garden is about 15m long, patio by the house then lawn. Shed at the far end. Fence is 6ft panel all round.",
              eaves: "Roughly 4.5m eaves, grey uPVC fascia. Rendered walls on the ground floor, brick above.",
              entry: "Composite front door, uPVC back door. Two ground floor windows at the back.",
              recorder: "Under-stairs cupboard — has a double socket in there already. Cool and dry.",
              router: "Virgin Media hub in the living room, roughly 5m from the understairs cupboard.",
            }),
            aiBrief: `## Overview
Two-storey semi-detached house in Stockport (SK4) with a single-car driveway on the left, a 1.2m side gate leading to a rear alley (bin/bike storage — the reason for this install), and a 15m rear garden with a shed. Customer wants 4 cameras covering the front approach, the side alley, the rear garden and the front door, with phone viewing. Under-stairs cupboard is available for the recorder with an existing double socket.

## Recommended positions
1. **Front-left corner of the house, mounted on the render at approx 4m** — wide-angle turret covering the driveway, the car and the pavement approach. Corner position sees down the full side boundary.
2. **Above the side gate, mounted on the brick pier under the uPVC fascia approx 4m** — dedicated view down the alley covering bins and bikes. This is the high-risk zone after the bike theft.
3. **Rear of the house on the render, approx 4m, angled down the garden** — covers patio, lawn and the shed at the far end (approx 15m — within a 2.8-12mm varifocal or a good fixed turret range in daylight; check night performance at 15m).
4. **Front door side, mounted under the eaves approx 4m** — covers the front door, porch and parcel area; complements camera 1 without duplicating the driveway view.

## Cable routes & power
Recorder lives in the under-stairs cupboard. Neatest route is cupboard → skirting → exterior wall → up to eaves via rendered wall, using white external-grade clips. Drill through render above ground floor with proper sealing. Recordern  socket exists; suggest a small UPS if customer wants recording during power cuts (optional extra).

## Connectivity & setup notes
Virgin hub is approx 5m from the cupboard — Cat6 patch between hub and NVR is simple. Phone app setup on customer's phone plus a second family member if requested. Confirm remote viewing works on site before handover.

## Risks & access
Working at approx 4.5m — ladder or small tower needed; two-person job for safety. Render drilling needs dust sheets. Customer has pets? (not stated — confirm). Garden access via the side gate.

## Suggested kit & quantities
- 4x 4MP/8MP turret cameras (1x varifocal for the 15m garden run if night detail matters)
- 1x 8-channel PoE NVR with 2TB surveillance drive
- 1x PoE switch if NVR ports limited, or use NVR PoE ports
- Approx 60m Cat6 external cable + clips/seals
- 4x camera junction/anti-vandal mounts as needed
- UPS (optional), HDMI cable for TV preview during setup

## Open questions for the engineer
1. Does the customer want audible deterrent on the alley camera (two-way audio)?
2. Night detail at 15m to the shed — fixed turret vs varifocal?
3. Any wish to cover upstairs rear windows?
4. Confirm driveway ANPR-style plate capture is not required (wide-angle trade-off).
5. Who else needs app access (partner/family)?`,
          },
        },
      },
    })
    console.log("  + job 1 (OPEN, CCTV, analyzed)")
    void j1

    // --- Job 2: OPEN alarms ---
    await db.job.create({
      data: {
        customerId: customer.id,
        category: "ALARMS",
        title: "Wireless alarm for bungalow, two pets",
        description: "Mum's bungalow, she's 76. Wants an alarm with app alerts for me and my sister. Two cats, so pet-friendly sensors needed.",
        postcode: "SK3 8DX",
        town: "Stockport",
        propertyType: "Bungalow",
        budget: "£500 - £1,000",
        preferredDate: "Weekends preferred",
        survey: {
          create: {
            analyzed: true,
            answers: JSON.stringify({
              front: "Timber front door with a small porch. Brick wall beside the door — bell box would be clearly visible from the street.",
              hall: "Hallway runs from front door to kitchen. Socket behind the hall table near the door — panel/keypad could go there.",
              ground: "Two bedrooms, living room, kitchen/diner. All on one level. Cats sleep in the living room and kitchen.",
              entry: "Timber front door, uPVC back door in kitchen. Four windows: living room, kitchen, two bedrooms.",
              upstairs: "N/A — bungalow with boarded loft.",
              outbuildings: "Detached garage at the back, brick, door faces the garden.",
              router: "Router in living room, about 8m from the hallway panel spot.",
            }),
            aiBrief: `## Overview
Single-storey bungalow in Stockport for an elderly occupant, with two cats (pet-tolerant PIRs required) and family members receiving app alerts remotely. Timber front door with a porch, uPVC rear door, four ground-floor windows, and a detached brick garage. Wireless system is the obvious fit for a clean, fast install.

## Recommended positions
1. **Bell box** on the brick beside the front door, approx 3-3.5m, clearly visible from the street.
2. **Hallway PIR** (pet-tolerant) at the end of the hallway approx 2.1m covering the front door approach — or a door contact on the timber front door instead, avoiding cat false alarms entirely.
3. **Living room PIR** (pet-tolerant, approx 18kg+) in the corner approx 2m, angled over the sofa heads rather than the floor where cats climb.
4. **Kitchen/diner contact** on the uPVC back door (surface contact on the frame) plus a window contact on the kitchen opening light.
5. **Bedroom window contacts** on both bedrooms if windows aren't lockable.
6. **Garage** — door contact on the garage door; wireless range from panel approx 8-12m through an external brick wall — test signal before committing, may need a signal booster.

## Cable routes & power
Panel with mains spur behind the hall table socket — a local electrician or battery-backed panel keeps it simple. Fully wireless sensors mean no visible cabling in a nicely decorated bungalow.

## Connectivity & setup notes
Router approx 8m away in the living room — Wi-Fi alarm should reach; if weak, a small Wi-Fi extender is a cheap fix. Set up app alerts on customer's phone plus son and daughter (three app profiles). Big-button keypad for the occupant; show the panic function clearly.

## Risks & access
Occupant is 76 — schedule install during the day, keep pathways clear, tidy cables the same day. Cats must be kept in one room while doors are propped. Confirm exit/entry timing suits her walking speed (set generous entry delay).

## Suggested kit & quantities
- 1x wireless smart alarm panel with battery backup
- 1x external bell box (dummy + live decoy pairing optional)
- 2-3x pet-tolerant PIRs
- 3-4x door/window contacts
- 1x keypad (large keys)
- 3x app user accounts
- Optional: garage door contact + signal booster

## Open questions for the engineer
1. Do the family want monitored signalling (SIM backup) or app-only alerts?
2. Are bedroom windows lockable with keys?
3. Garage sensor wanted at install or later?
4. Confirm the hall table socket is free/usable for the panel.`,
          },
        },
      },
    })
    console.log("  + job 2 (OPEN, ALARMS, analyzed)")

    // --- Job 3: OPEN gates ---
    await db.job.create({
      data: {
        customerId: customer.id,
        category: "GATES",
        title: "Automate existing driveway gates",
        description: "Double swing metal gates between brick piers, driveway slopes down toward the house. Want an intercom that rings my phone.",
        postcode: "SK2 6NG",
        town: "Stockport",
        propertyType: "House",
        budget: "£2,500 - £5,000",
        preferredDate: "Flexible",
        survey: {
          create: {
            analyzed: true,
            answers: JSON.stringify({
              driveway: "Driveway about 12m long from gates to house, fits two cars nose to tail. Gates are metal double swing, each leaf about 1.8m wide.",
              gate: "Brick piers about 1.9m high, solid. Ground slopes downhill from gates to house — maybe 10cm over the driveway.",
              power: "There's an external socket on the house wall by the back door, about 10m from the gates along the fence line.",
              intercom: "Want the intercom on the left pier, and to answer from my phone when out.",
              safety: "Cars park clear of the gates usually. Kids do play on the driveway so safety edges matter.",
            }),
            aiBrief: `## Overview
Existing 2-leaf metal swing gates (approx 1.8m per leaf, total 3.6m) hung between solid brick piers approx 1.9m high. Driveway slopes downhill from gate to house (approx 10cm over 12m). Family with children — safety compliance is a priority. Customer wants phone-based video/audio answering when out.

## Recommended positions
1. **Underground or ram motors on each leaf** — a downhill slope toward the house usually rules out standard above-ground swing arms hitting the ground clearance; ram arms can still work if leaf rise permits, otherwise articulated arms or underground motors are the safe choice. Measure leaf rise when quoting.
2. **Photocells** mounted on the inner faces of both piers at approx 60cm, plus safety edges on both leaf leading edges (children use the driveway).
3. **Warning signage** both sides of the gates (required for automated gates).
4. **Intercom panel** on the left pier at approx 1.4m, IP-rated; GSM/IP unit so it rings the customer's phone — no wiring back to the house needed beyond power at the gate.

## Cable routes & power
Nearest power is an external socket approx 10m away along the fence line. Run armoured (SWA) cable in conduit along the fence base to a weatherproof fused-spur enclosure at the left pier. No new supply needed if spur taken correctly from that circuit (confirm circuit capacity).

## Connectivity & setup notes
GSM/IP intercom with SIM or the home Wi-Fi if it reaches the gate (test RSSI on site). Configure phone app, test answering from inside the house and from mobile data. Set hold-open times and pedestrian mode.

## Risks & access
Driveway slope + children = strict safety: force limits set and documented, safety edges wired and tested, photocells aligned. Metal gates on piers — check hinge condition and pier solidity before fitting motors; worn hinges should be replaced as part of the job.

## Suggested kit & quantities
- 2x swing gate motors (ram or underground per leaf rise check)
- 2x safety edges, 2x photocells, 1x control panel
- 1x GSM/IP video or audio intercom (SIM plan note)
- Approx 15m SWA armoured cable, conduit, weatherproof isolator + fused spur
- Manual release keys handed over + force test certificate

## Open questions for the engineer
1. Measure gate leaf rise against the slope — do ram arms clear the ground through the full swing?
2. Wi-Fi at the gate or SIM-based intercom?
3. Any pedestrian side gate to add for school-run access?
4. Confirm pier condition / hinge wear before quoting motors.`,
          },
        },
      },
    })
    console.log("  + job 3 (OPEN, GATES, analyzed)")

    // --- Job 4: COMPLETED CCTV with quotes + review (history for customer dashboard) ---
    const j4 = await db.job.create({
      data: {
        customerId: customer.id,
        category: "SMART",
        title: "Video doorbell + smart lock for front door",
        description: "Parcel thefts on the street. Want a video doorbell and a smart lock I can open for family remotely.",
        postcode: "SK4 2HA",
        town: "Stockport",
        propertyType: "House",
        budget: "£500 - £1,000",
        status: "COMPLETED",
        awardedEngineerId: engineerIds["Ryan Lee"],
        createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000),
        survey: {
          create: {
            analyzed: true,
            answers: JSON.stringify({
              overview: "Composite front door with existing yale-style nightlatch. Brick surround, under a small porch overhang.",
              entry: "Door is composite, about 6 years old. Existing lock is a nightlatch with a cylinder.",
              plant: "Would need the chime indoors; hallway has a socket.",
              router: "Router in the living room, signal at the front door seems fine on my phone.",
            }),
            aiBrief: `## Overview
Composite front door with nightlatch. Customer wants parcel-protection via video doorbell plus remote lock release for family. Straightforward upgrade job.

## Recommended positions
1. **Doorbell** mounted on the brick pier beside the door at approx 1.2m, clear of the porch overhang drip line.
2. **Chime** in the hallway near the kitchen for audibility.
3. **Smart lock** — replace the nightlatch cylinder with a compatible smart nightlatch keeping the mechanical key override, preserving emergency egress.

## Connectivity & setup notes
Wi-Fi at the front door reported as good. Set up app on customer and partner's phones, test remote open from mobile data, register backup keys.

## Risks & access
Door remains in use during install — fit lock the same visit. Verify thumb-turn internal operation for fire escape.

## Suggested kit & quantities
- 1x video doorbell (battery or wired per existing doorbell wiring)
- 1x smart nightlatch with app + keypad
- Chime + doorbell transformer check

## Open questions for the engineer
1. Existing mechanical doorbell wiring present for wired doorbell power?
2. Does customer need keypad entry for cleaners/family or app-only?`,
          },
        },
      },
    })
    const q4 = await db.quote.create({
      data: {
        jobId: j4.id,
        engineerId: engineerIds["Ryan Lee"],
        amount: 640,
        laborHours: 3.5,
        materialsNote: "Doorbell + smart nightlatch included in price",
        message: "Happy to fit on a Saturday morning and set the app up for everyone at home.",
        status: "ACCEPTED",
      },
    })
    await db.review.create({
      data: {
        jobId: j4.id,
        customerId: customer.id,
        engineerId: engineerIds["Ryan Lee"],
        rating: 5,
        comment: "Ryan fitted the doorbell and lock in one visit, set the app up on my whole family's phones and showed us all how it works. Very tidy.",
      },
    })
    console.log("  + job 4 (COMPLETED, SMART, reviewed)")
    void q4
  }

  // --- Reviews for engineers (tied to throwaway completed jobs) ---
  const reviewTargets = [
    { engineer: "Dave Hall", reviews: [0, 1] },
    { engineer: "Aisha Khan", reviews: [2, 3] },
    { engineer: "Tony Marsh", reviews: [4] },
    { engineer: "Jo Walsh", reviews: [1, 5] },
    { engineer: "Sam O'Toole", reviews: [3] },
  ]
  let counter = 0
  for (const t of reviewTargets) {
    const engineerId = engineerIds[t.engineer]
    const existing = await db.review.count({ where: { engineerId } })
    if (existing >= t.reviews.length) continue
    for (const idx of t.reviews) {
      counter++
      const r = reviewTexts[idx % reviewTexts.length]
      const job = await db.job.create({
        data: {
          customerId: customer.id,
          category: "CCTV",
          title: `Historic job #${counter} — ${t.engineer}`,
          postcode: "SK4 2HA",
          status: "COMPLETED",
          awardedEngineerId: engineerId,
          createdAt: new Date(Date.now() - (60 + counter) * 24 * 3600 * 1000),
        },
      })
      await db.quote.create({
        data: { jobId: job.id, engineerId, amount: 500 + counter * 40, status: "ACCEPTED" },
      })
      await db.review.create({
        data: {
          jobId: job.id,
          customerId: customer.id,
          engineerId,
          rating: r.rating,
          comment: r.comment,
        },
      })
    }
  }
  console.log("  + historic reviews")

  const totals = await Promise.all([db.user.count(), db.job.count(), db.quote.count(), db.review.count()])
  console.log(`Seed complete. users=${totals[0]} jobs=${totals[1]} quotes=${totals[2]} reviews=${totals[3]}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
