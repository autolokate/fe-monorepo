export type MediaVideoCategory =
  | 'Driving Safety'
  | 'Learn to Drive'
  | 'Car Knowledge'
  | 'Emergency & Safety'
  | 'Vehicle Tips'
  | 'Road Awareness'
  | 'Beginner Drivers'
  | 'Automotive';

export interface MediaVideo {
  id: string;
  title: string;
  description: string;
  category: MediaVideoCategory;
  duration: string;
  date: string;
  dateLabel: string;
  featured?: boolean;
  popular?: boolean;
}

export const IDG_CHANNEL_URL = 'https://www.youtube.com/@IndianDriveGuide';

export const MEDIA_VIDEO_CATEGORIES: MediaVideoCategory[] = [
  'Driving Safety',
  'Learn to Drive',
  'Car Knowledge',
  'Emergency & Safety',
  'Vehicle Tips',
  'Road Awareness',
  'Beginner Drivers',
  'Automotive',
];

export const MEDIA_VIDEOS: MediaVideo[] = [
  {
    id: 'qLdtkb8wwv4',
    title: 'Automatic car driving tips for beginners in hills',
    description:
      'Hill starts, descents, and clutch-free control for new automatic drivers. Practical habits that keep you calm on Indian mountain roads.',
    category: 'Learn to Drive',
    duration: '12:18',
    date: '2025-02-03',
    dateLabel: '3 Feb 2025',
    featured: true,
  },
  {
    id: 'wqDNL3k1X3Q',
    title: '3 tips to fight sleepiness while night driving',
    description:
      'Practical ways to stay alert on late highway runs. Pair with rest stops — do not push through exhaustion.',
    category: 'Driving Safety',
    duration: '0:42',
    date: '2026-03-01',
    dateLabel: '1 Mar 2026',
  },
  {
    id: 'uqvLg0tbam8',
    title: 'FASTag annual pass: ₹3000 for 200 trips',
    description:
      'How the FASTag annual pass works and who saves with it. Useful planning note for frequent highway users.',
    category: 'Road Awareness',
    duration: '0:50',
    date: '2026-02-19',
    dateLabel: '19 Feb 2026',
  },
  {
    id: 'p1xOxCKFwwk',
    title: 'What to watch for when driving at night',
    description:
      'Night-driving checklist: lights, speed, and fatigue. Habits that keep late trips safer.',
    category: 'Road Awareness',
    duration: '0:48',
    date: '2026-02-12',
    dateLabel: '12 Feb 2026',
  },
  {
    id: 'gYMlf7zYHO8',
    title: 'New FASTag rules: paste correctly or pay double',
    description:
      'Windscreen placement and rule updates that avoid FASTag penalties. Quick compliance tip before your next trip.',
    category: 'Road Awareness',
    duration: '0:45',
    date: '2026-01-30',
    dateLabel: '30 Jan 2026',
  },
  {
    id: 'dXNruxX7A9s',
    title: 'Basic road rules for pedestrians',
    description:
      'Pedestrian awareness that also helps drivers anticipate crossings. Shared-road habits for safer streets.',
    category: 'Road Awareness',
    duration: '0:40',
    date: '2026-01-27',
    dateLabel: '27 Jan 2026',
  },
  {
    id: 'cBXJuvi8U7I',
    title: 'Correct way to wear a seatbelt in the car',
    description:
      'Seatbelt position that actually protects you in a crash. Small adjustment with a big safety payoff.',
    category: 'Driving Safety',
    duration: '0:35',
    date: '2026-01-11',
    dateLabel: '11 Jan 2026',
  },
  {
    id: 'exOaUFqi8E0',
    title: 'Get at least 10% discount on a new vehicle',
    description:
      'Negotiation and timing tactics that actually move the invoice price. Useful when you are ready to book at the dealership.',
    category: 'Car Knowledge',
    duration: '7:39',
    date: '2026-01-06',
    dateLabel: '6 Jan 2026',
  },
  {
    id: 'kctKZTIBfWI',
    title: 'Push-start your car when stuck alone on a highway',
    description:
      'How to get moving again if the battery dies far from help. Practical roadside skill for solo highway trips.',
    category: 'Emergency & Safety',
    duration: '0:50',
    date: '2026-01-04',
    dateLabel: '4 Jan 2026',
  },
  {
    id: 'JQJryRYm-E4',
    title: 'Which car is right for you',
    description:
      'A beginner-friendly framework for size, budget, and use-case instead of chasing trends. Start your shortlist here.',
    category: 'Car Knowledge',
    duration: '12:06',
    date: '2025-12-21',
    dateLabel: '21 Dec 2025',
  },
  {
    id: 'BFO0H_5gjDQ',
    title: 'How to increase car mileage',
    description:
      'Tyre pressure, AC use, and driving style tweaks that raise kmpl. Focused on real Indian city and highway conditions.',
    category: 'Vehicle Tips',
    duration: '8:44',
    date: '2025-12-10',
    dateLabel: '10 Dec 2025',
  },
  {
    id: 'w3RomGIbr3U',
    title: 'Flex fuel vs E20 — what to know before buying',
    description:
      'Compatibility, efficiency, and long-term ownership notes before you commit. Helps future-proof your petrol purchase.',
    category: 'Car Knowledge',
    duration: '9:31',
    date: '2025-12-06',
    dateLabel: '6 Dec 2025',
  },
  {
    id: 'ghnLnDDGyvg',
    title: 'New Hyundai Venue 2025 overview',
    description:
      'What changed in the latest Venue and who it suits best. A quick buyer-facing look at features and driving character.',
    category: 'Automotive',
    duration: '11:47',
    date: '2025-11-22',
    dateLabel: '22 Nov 2025',
  },
  {
    id: 'pcQFo3Rt10g',
    title: 'Want to save petrol?',
    description:
      'Driving and maintenance habits that meaningfully cut fuel use without slow commuting. Practical tips for daily drivers.',
    category: 'Vehicle Tips',
    duration: '7:21',
    date: '2025-11-20',
    dateLabel: '20 Nov 2025',
  },
  {
    id: 'fgjaUSzjxsU',
    title: '9 tricks to protect a CVT gearbox',
    description:
      'Throttle, heat, and service habits that extend CVT life. Especially useful for city-driven Japanese and Korean automatics.',
    category: 'Vehicle Tips',
    duration: '9:06',
    date: '2025-11-06',
    dateLabel: '6 Nov 2025',
  },
  {
    id: 'TEBz8JlmAkE',
    title: '3 simple ways to instantly improve your driving skills',
    description:
      'Small technique upgrades that raise awareness and control on everyday roads. Ideal for drivers who want safer habits fast.',
    category: 'Learn to Drive',
    duration: '6:48',
    date: '2025-10-25',
    dateLabel: '25 Oct 2025',
  },
  {
    id: 'Y-52m4LzNcs',
    title: 'Move from a safe car to a reliable car',
    description:
      'How to think beyond crash ratings when reliability and uptime matter more. Helps you reframe the next buying decision.',
    category: 'Car Knowledge',
    duration: '10:02',
    date: '2025-10-20',
    dateLabel: '20 Oct 2025',
  },
  {
    id: 'FHwYsZF4IdM',
    title: 'Third-party vs comprehensive insurance',
    description:
      'Clear differences, when each makes sense, and what Autolokate users should check before renewing cover.',
    category: 'Emergency & Safety',
    duration: '9:14',
    date: '2025-10-07',
    dateLabel: '7 Oct 2025',
  },
  {
    id: 'EZEbR-SWCf0',
    title: "The MG Hector Tomahawk problem: why it's not for every Indian driver",
    description:
      'Honest take on who this powertrain suits — and who should skip it. Helps you match the car to your real driving mix.',
    category: 'Car Knowledge',
    duration: '11:09',
    date: '2025-10-06',
    dateLabel: '6 Oct 2025',
  },
  {
    id: '9ibLbAnz3gY',
    title: 'Honda Amaze: how to save money on service',
    description:
      'Practical service choices that cut ownership cost without skipping essentials. Aimed at Amaze owners who want longer-term savings.',
    category: 'Vehicle Tips',
    duration: '8:33',
    date: '2025-09-23',
    dateLabel: '23 Sep 2025',
  },
  {
    id: '7oAmmLyfPoo',
    title: '5 tips to protect your DCT / DSG gearbox',
    description:
      'Driving habits that reduce clutch wear and overheating in dual-clutch cars. Essential for owners stuck in city traffic.',
    category: 'Vehicle Tips',
    duration: '7:52',
    date: '2025-09-08',
    dateLabel: '8 Sep 2025',
  },
  {
    id: '6aW5NRLQ9Ag',
    title: 'EV cars can save more money than their resale value',
    description:
      'Running-cost maths that goes beyond sticker price and resale fear. Helps you decide if an EV fits your daily commute.',
    category: 'Car Knowledge',
    duration: '10:27',
    date: '2025-09-07',
    dateLabel: '7 Sep 2025',
  },
  {
    id: '19WRLlAoj_Y',
    title: 'Best car in India for each budget category',
    description:
      'Budget-wise picks across price bands so you can shortlist without the noise. A practical buying map for Indian buyers.',
    category: 'Car Knowledge',
    duration: '16:04',
    date: '2025-08-27',
    dateLabel: '27 Aug 2025',
  },
  {
    id: '0wOKeuCDLQ4',
    title: 'Qubo Pro 2.7K unboxing and real day & night test',
    description:
      'Hands-on look at image quality, night vision, and install fit for this dashcam. Useful if you are choosing a camera for Indian roads.',
    category: 'Automotive',
    duration: '11:36',
    date: '2025-08-13',
    dateLabel: '13 Aug 2025',
  },
  {
    id: '8RVVTb0aLSQ',
    title: 'Basic highway driving tips',
    description:
      'Core highway habits for safer long drives. Spacing, lane choice, and overtake discipline that reduce risk.',
    category: 'Learn to Drive',
    duration: '0:50',
    date: '2025-08-01',
    dateLabel: '1 Aug 2025',
  },
  {
    id: 'xn7TBuaWBoU',
    title: 'New excuses insurers use to reject claims',
    description:
      'Patterns behind modern claim pushbacks. Stay informed so you can challenge unfair rejections.',
    category: 'Emergency & Safety',
    duration: '0:48',
    date: '2025-07-31',
    dateLabel: '31 Jul 2025',
  },
  {
    id: 'xFhMkelDZB4',
    title: 'Basic traffic rules to avoid accidents',
    description:
      'Everyday rules that prevent common Indian road crashes. A quick refresher for new and returning drivers.',
    category: 'Road Awareness',
    duration: '0:48',
    date: '2025-07-30',
    dateLabel: '30 Jul 2025',
  },
  {
    id: 'x1ZnbLdttZA',
    title: 'Car reverse: basic tips',
    description:
      'Reverse control and mirror use for beginners. Safer bay and roadside reverse manoeuvres.',
    category: 'Learn to Drive',
    duration: '0:40',
    date: '2025-07-20',
    dateLabel: '20 Jul 2025',
  },
  {
    id: 'pjEoYZET2hA',
    title: '5 tips for manual drivers to reduce clutch and gear wear',
    description:
      'Manual habits that save clutch life in traffic. Protect the gearbox without changing how far you drive.',
    category: 'Learn to Drive',
    duration: '5:45',
    date: '2025-07-09',
    dateLabel: '9 Jul 2025',
  },
  {
    id: 'vk3hYVgKJYU',
    title: 'How to escape a car sinking in water',
    description:
      'Seconds-count tips if your vehicle floods or sinks. Emergency awareness every monsoon-season driver should rehearse.',
    category: 'Emergency & Safety',
    duration: '6:30',
    date: '2025-06-30',
    dateLabel: '30 Jun 2025',
  },
  {
    id: 'vUa2ulrQ5_4',
    title: 'How to drive through waterlogged roads',
    description:
      'Automatic and manual tips when streets flood. Reduce stall and water-ingress risk with calmer technique.',
    category: 'Driving Safety',
    duration: '6:20',
    date: '2025-06-13',
    dateLabel: '13 Jun 2025',
  },
  {
    id: 'vVTzstSHmZA',
    title: 'Low engine oil and high temperature — driving precautions',
    description:
      'What to do when the oil light or temp gauge warns you on the road. Simple steps that protect the engine until you reach a workshop.',
    category: 'Vehicle Tips',
    duration: '8:05',
    date: '2025-06-11',
    dateLabel: '11 Jun 2025',
  },
  {
    id: 'vOfJsbR5gzM',
    title: 'Prevent accidents: identifying and avoiding car tyre defects',
    description:
      'Spot bulges, uneven wear, and pressure issues before they become blowouts. A quick safety check every Indian driver should know.',
    category: 'Driving Safety',
    duration: '9:41',
    date: '2025-05-27',
    dateLabel: '27 May 2025',
  },
  {
    id: 'vDnpqRU_hAc',
    title: 'Uphill driving when the car stops on a flyover',
    description:
      'Recover calmly if you stall mid-climb. Essential beginner skill for flyovers and steep ramps.',
    category: 'Learn to Drive',
    duration: '5:20',
    date: '2025-05-17',
    dateLabel: '17 May 2025',
  },
  {
    id: 'DYnj4NYDBQg',
    title: 'Learn basic scooty driving',
    description:
      'Beginner scooty skills for first-time riders. Start slow, build balance, then handle city traffic.',
    category: 'Beginner Drivers',
    duration: '10:10',
    date: '2025-05-08',
    dateLabel: '8 May 2025',
  },
  {
    id: 't5SqGL1kCwE',
    title: 'Your story matters in an insurance claim',
    description:
      'How you describe the incident affects claim outcomes. Be accurate, consistent, and evidence-backed.',
    category: 'Emergency & Safety',
    duration: '0:45',
    date: '2025-04-27',
    dateLabel: '27 Apr 2025',
  },
  {
    id: 'sRaaDK_w82o',
    title: 'New car and bike tyre buying guide',
    description:
      'What to check before buying fresh rubber. Helps you compare brands, sizes, and fitment without guesswork.',
    category: 'Vehicle Tips',
    duration: '9:20',
    date: '2025-04-23',
    dateLabel: '23 Apr 2025',
  },
  {
    id: 'su9nZikodp4',
    title: 'Learn car driving: zero to hero',
    description:
      'End-to-end beginner driving basics in Hindi-friendly guidance. Build core skills before complex traffic.',
    category: 'Beginner Drivers',
    duration: '10:25',
    date: '2025-04-19',
    dateLabel: '19 Apr 2025',
  },
  {
    id: 's7NP9Vl4N60',
    title: 'Learn car driving: zero to hero — part 1',
    description:
      'Foundations for absolute beginners starting their driving journey. Structured first steps without overwhelm.',
    category: 'Beginner Drivers',
    duration: '8:10',
    date: '2025-04-15',
    dateLabel: '15 Apr 2025',
  },
  {
    id: 'rvMIJLMie4k',
    title: 'How to use an ABC fire extinguisher for car and home',
    description:
      'Quick fire-safety demo for ABC extinguishers. Keep one in the cabin and know the steps before you need them.',
    category: 'Emergency & Safety',
    duration: '5:12',
    date: '2025-03-25',
    dateLabel: '25 Mar 2025',
  },
  {
    id: 'rnx13ttyU5E',
    title: 'Vehicle insurance basics',
    description:
      'Foundational terms every car or bike owner should know. Start here if insurance jargon still feels opaque.',
    category: 'Emergency & Safety',
    duration: '7:40',
    date: '2025-03-20',
    dateLabel: '20 Mar 2025',
  },
  {
    id: 'r_CV68evi3g',
    title: 'Tata Altroz DCA safety feature overview',
    description:
      'Key safety tech on the Altroz DCA explained simply. Helps you weigh protection features on a shortlist.',
    category: 'Driving Safety',
    duration: '0:40',
    date: '2025-03-15',
    dateLabel: '15 Mar 2025',
  },
  {
    id: 'rJfsu9O6jpQ',
    title: 'Correct way to hold the steering wheel',
    description:
      'Hand position that improves control and reduces fatigue. Small form fix with big handling benefits.',
    category: 'Learn to Drive',
    duration: '0:35',
    date: '2025-03-07',
    dateLabel: '7 Mar 2025',
  },
  {
    id: 'rA87yJ1qc7I',
    title: 'Think your insurance covers everything?',
    description:
      'Gaps many owners miss until a claim fails. Review cover quickly and close holes before the next long trip.',
    category: 'Emergency & Safety',
    duration: '0:40',
    date: '2025-02-27',
    dateLabel: '27 Feb 2025',
  },
  {
    id: 'quMFf5O4V5c',
    title: 'Cason 6-in-1 car jump starter overview',
    description:
      'Portable jump starter that covers battery boost and more. A compact kit item for breakdowns away from home.',
    category: 'Emergency & Safety',
    duration: '0:55',
    date: '2025-02-13',
    dateLabel: '13 Feb 2025',
  },
  {
    id: 'q3x23mT2qvI',
    title: 'Learn tyre position while sitting in the car',
    description:
      'Visualise where each tyre sits relative to the cabin. Improves parking, curb awareness, and tight manoeuvres.',
    category: 'Learn to Drive',
    duration: '4:10',
    date: '2025-01-22',
    dateLabel: '22 Jan 2025',
  },
  {
    id: 'pmODq9AWNQw',
    title: 'Best GPS tracker for car and bike 2025',
    description:
      'Tracker options for theft recovery and family peace of mind. Pairs well with Autolokate emergency readiness.',
    category: 'Emergency & Safety',
    duration: '10:38',
    date: '2025-01-18',
    dateLabel: '18 Jan 2025',
    popular: true,
  },
  {
    id: 'nUeC9Zf8zCg',
    title: 'Best dashcam on Amazon 2026',
    description:
      'Amazon shortlist for Indian cars — resolution, night vision, and value. Compare before you commit to an install.',
    category: 'Automotive',
    duration: '0:55',
    date: '2025-01-06',
    dateLabel: '6 Jan 2025',
  },
  {
    id: 'pSkwM8pQwvo',
    title: 'Buy insurance from the company or online?',
    description:
      'Online vs insurer-office purchase and what changes at claim time. Choose the path that fits your comfort with paperwork.',
    category: 'Emergency & Safety',
    duration: '0:42',
    date: '2025-01-05',
    dateLabel: '5 Jan 2025',
  },
  {
    id: 'meWOB4ElxJc',
    title: 'Record front and rear cameras at the same time',
    description:
      'Dual-camera recording tips for dashcam-style evidence or moto vlogs. Useful when you want coverage beyond the windshield.',
    category: 'Automotive',
    duration: '0:48',
    date: '2024-12-26',
    dateLabel: '26 Dec 2024',
  },
  {
    id: 'maF2PLvKF4k',
    title: 'Best budget car dashcam 2026',
    description:
      'Affordable dashcam picks that still deliver usable day and night footage. Good starting point for first-time buyers in India.',
    category: 'Automotive',
    duration: '8:20',
    date: '2024-12-20',
    dateLabel: '20 Dec 2024',
  },
  {
    id: 'kekCv-cSySk',
    title: 'Correct way to ride a scooty',
    description:
      'Scooty posture, balance, and road habits for safer city rides. Two-wheeler basics every new rider needs.',
    category: 'Beginner Drivers',
    duration: '0:48',
    date: '2024-12-02',
    dateLabel: '2 Dec 2024',
  },
  {
    id: 'jbjtw_Zfw5U',
    title: 'Which automatics suit city traffic best',
    description:
      'CVT, AT, and EV strengths in stop-go traffic. Match gearbox type to your real commute.',
    category: 'Car Knowledge',
    duration: '0:50',
    date: '2024-11-28',
    dateLabel: '28 Nov 2024',
  },
  {
    id: 'inmpqiqyo24',
    title: 'How to check if brake pads are original or duplicate',
    description:
      'Quick checks that catch fake brake pads before they fail. Safety-critical parts deserve authentic fitment.',
    category: 'Driving Safety',
    duration: '0:45',
    date: '2024-11-15',
    dateLabel: '15 Nov 2024',
  },
  {
    id: 'iL31kVe23wE',
    title: 'Learn perfect car driving — day 2: gear 1',
    description:
      'First-gear control for new drivers. Smooth clutch and throttle coordination from the zero-to-hero series.',
    category: 'Beginner Drivers',
    duration: '7:35',
    date: '2024-11-02',
    dateLabel: '2 Nov 2024',
  },
  {
    id: 'hugYCl2iTgg',
    title: 'Automatic car myths',
    description:
      'Common myths that confuse new automatic owners. Separate folklore from what modern gearboxes actually need.',
    category: 'Beginner Drivers',
    duration: '0:48',
    date: '2024-10-30',
    dateLabel: '30 Oct 2024',
  },
  {
    id: 'zl3KhjQef5U',
    title: 'Myths about automatic transmission cars',
    description:
      'Automatic myths worth dropping. Helps beginners drive with facts instead of fear.',
    category: 'Beginner Drivers',
    duration: '0:42',
    date: '2024-10-25',
    dateLabel: '25 Oct 2024',
  },
  {
    id: 'gvtsOLZMeHc',
    title: 'Learn perfect L-shaped car parking',
    description:
      'L-parking technique that works in tight Indian spots. Practice the geometry until it feels automatic.',
    category: 'Learn to Drive',
    duration: '0:55',
    date: '2024-10-14',
    dateLabel: '14 Oct 2024',
  },
  {
    id: 'fegYX1HFPTI',
    title: 'High beams can kill: proper car lighting explained',
    description:
      'When to use high beams — and when they blind oncoming traffic. Lighting etiquette that prevents night crashes.',
    category: 'Driving Safety',
    duration: '6:05',
    date: '2024-09-26',
    dateLabel: '26 Sep 2024',
  },
  {
    id: 'fZeQnuc6Luo',
    title: 'Car insurance: third-party vs comprehensive',
    description:
      'Clear walkthrough of cover types, claim basics, and when upgrading protection is worth it.',
    category: 'Emergency & Safety',
    duration: '8:58',
    date: '2024-09-24',
    dateLabel: '24 Sep 2024',
  },
  {
    id: 'f47hhDceL6c',
    title: 'Best dashcam for cars in India 2026',
    description:
      'Updated picks for resolution, night performance, and value. Built for Indian heat, traffic, and parking scenarios.',
    category: 'Automotive',
    duration: '12:55',
    date: '2024-09-09',
    dateLabel: '9 Sep 2024',
    popular: true,
  },
  {
    id: 'mu7huEAgWU8',
    title: 'Learn free car PDI so no one fools you',
    description:
      'Pre-delivery inspection checklist for new cars. Catch defects before you drive out of the dealership.',
    category: 'Car Knowledge',
    duration: '9:15',
    date: '2024-09-09',
    dateLabel: '9 Sep 2024',
  },
  {
    id: 'cHAOgpFPzWA',
    title: 'Fog driving tips: follow the lane, skip hazard lights',
    description:
      'Lane focus and lighting choices when visibility drops. Highway-ready fog advice you can apply immediately.',
    category: 'Driving Safety',
    duration: '5:10',
    date: '2024-08-28',
    dateLabel: '28 Aug 2024',
  },
  {
    id: 'aa2oxYK1Moc',
    title: 'Automatic car guide 2026: AMT vs CVT vs DCT vs AT',
    description:
      'Plain-language comparison of automatic types so beginners pick the right gearbox for city and highway use.',
    category: 'Car Knowledge',
    duration: '15:28',
    date: '2024-08-20',
    dateLabel: '20 Aug 2024',
  },
  {
    id: '_hdBImQ8HuA',
    title: 'Best GPS tracker for car and bike in India 2025',
    description:
      'Real-time location and anti-theft tracker options for cars and bikes. Complements Autolokate emergency readiness.',
    category: 'Emergency & Safety',
    duration: '9:40',
    date: '2024-08-15',
    dateLabel: '15 Aug 2024',
  },
  {
    id: 'Z_oeHqKqhE0',
    title: '5 hand signals that help avoid accidents',
    description:
      'Hand signals still matter when indicators fail or visibility is poor. Learn five that other drivers actually understand.',
    category: 'Road Awareness',
    duration: '0:45',
    date: '2024-08-09',
    dateLabel: '9 Aug 2024',
  },
  {
    id: 'cZGA2DgWd60',
    title: 'EV vs petrol vs CNG vs diesel — which fuel type?',
    description:
      'Match fuel type to commute, parking, and yearly km. A clearer shortlist before you visit showrooms.',
    category: 'Car Knowledge',
    duration: '8:50',
    date: '2024-07-22',
    dateLabel: '22 Jul 2024',
  },
  {
    id: 'X0x7u91mtlM',
    title: 'How to remove fog from car mirror in rain',
    description:
      'How to remove fog from car mirror in rain. Safer habits for Indian traffic, weather, and night driving.',
    category: 'Driving Safety',
    duration: '1:04',
    date: '2024-07-15',
    dateLabel: '15 Jul 2024',
  },
  {
    id: 'WzTZjxmsQec',
    title: 'Learn perfect car driving — day 4: reverse gear',
    description:
      'Reverse-gear practice for new drivers. Build control before parking in tight Indian spots.',
    category: 'Beginner Drivers',
    duration: '15:34',
    date: '2024-07-04',
    dateLabel: '4 Jul 2024',
  },
  {
    id: 'WgII18gP0K4',
    title: 'Best tyre inflator for cars in India',
    description:
      'Portable inflators that actually work at the roadside. A must-have kit pick for long drives and monsoon season.',
    category: 'Vehicle Tips',
    duration: '8:19',
    date: '2024-06-22',
    dateLabel: '22 Jun 2024',
  },
  {
    id: 'WX2BGE4vH_o',
    title: 'Scooty slips and front tyre cracks',
    description:
      'How cracked front tyres contribute to two-wheeler falls. Inspect rubber before monsoon and city rides.',
    category: 'Driving Safety',
    duration: '0:48',
    date: '2024-06-19',
    dateLabel: '19 Jun 2024',
  },
  {
    id: 'W4LJKwQTH-Y',
    title: 'If your car floods, will insurance pay?',
    description:
      'Flood and water-damage cover realities in Indian policies. Know what comprehensive usually includes — and what to ask.',
    category: 'Emergency & Safety',
    duration: '0:50',
    date: '2024-06-09',
    dateLabel: '9 Jun 2024',
  },
  {
    id: 'Uq0LNTIVM9I',
    title: 'Best Sony Starvis 2 dashcam on Amazon — India 2026',
    description:
      'Shortlist of Starvis 2 dashcams that hold up in Indian day and night conditions. For drivers who want reliable evidence on the road.',
    category: 'Automotive',
    duration: '13:41',
    date: '2024-06-05',
    dateLabel: '5 Jun 2024',
    popular: true,
  },
  {
    id: 'UADpb2NozLY',
    title: 'Broken tail light, bald tyre, and black smoke challans',
    description:
      'Visible defects that invite fines and risk. Fix lights, tread, and smoke before they become tickets — or crashes.',
    category: 'Road Awareness',
    duration: '0:45',
    date: '2024-05-27',
    dateLabel: '27 May 2024',
  },
  {
    id: 'Td39ybqYWdM',
    title: "Don't shift automatic from D to N in traffic",
    description:
      'Why the D-to-N habit is a myth for modern DCT and automatic gearboxes. Protect the transmission in stop-and-go traffic.',
    category: 'Vehicle Tips',
    duration: '5:57',
    date: '2024-05-12',
    dateLabel: '12 May 2024',
  },
  {
    id: 'StiH42Bk1CI',
    title: 'Low tyre pressure can cause bursts and poor mileage',
    description:
      'Why underinflation is dangerous and expensive. Simple pressure habits that protect tyres and fuel economy.',
    category: 'Driving Safety',
    duration: '0:40',
    date: '2024-05-09',
    dateLabel: '9 May 2024',
  },
  {
    id: 'SVD0ingBy3w',
    title: 'Second-hand car tips: accidental vs non-accidental',
    description:
      'Spot accident history and why it changes value and risk. Part one of smarter used-car buying.',
    category: 'Car Knowledge',
    duration: '6:15',
    date: '2024-05-03',
    dateLabel: '3 May 2024',
  },
  {
    id: 'RNNTi7AsSSU',
    title: 'Learn perfect car driving — day 5: L-parking',
    description:
      'L-parking fundamentals for beginners. Geometry and mirror use that make bay parking calmer.',
    category: 'Learn to Drive',
    duration: '6:13',
    date: '2024-04-18',
    dateLabel: '18 Apr 2024',
  },
  {
    id: 'REO8LQNdxHs',
    title: 'Avoid overtaking on single-lane roads',
    description:
      'Why single-lane overtakes go wrong so often. Patience and positioning tips that prevent head-on risk.',
    category: 'Road Awareness',
    duration: '4:48',
    date: '2024-04-14',
    dateLabel: '14 Apr 2024',
  },
  {
    id: 'P9HTTfMD5Bo',
    title: 'Emergency triangle can save your life on the highway',
    description:
      'Why a warning triangle matters after a roadside stop. Basic traffic-rule habit that protects you and approaching traffic.',
    category: 'Emergency & Safety',
    duration: '0:40',
    date: '2024-03-27',
    dateLabel: '27 Mar 2024',
  },
  {
    id: 'OUYngswdkv8',
    title: '3 tips to avoid insurance claim rejection',
    description:
      'Simple mistakes that sink car and bike claims. Fix documentation and disclosures before trouble hits.',
    category: 'Emergency & Safety',
    duration: '0:55',
    date: '2024-03-22',
    dateLabel: '22 Mar 2024',
  },
  {
    id: 'MyzcN3W_jFU',
    title: 'Which automatic car is best for the city?',
    description:
      'City-focused automatic picks and what matters in stop-go traffic. A short shortlist framework for urban buyers.',
    category: 'Car Knowledge',
    duration: '0:35',
    date: '2024-03-08',
    dateLabel: '8 Mar 2024',
  },
  {
    id: 'MhLJl3Bzq4o',
    title: 'Learn perfect car driving — day 1: basic theory',
    description:
      'Theory foundations before you touch the pedals. Start the zero-to-hero series the right way.',
    category: 'Beginner Drivers',
    duration: '11:54',
    date: '2024-03-06',
    dateLabel: '6 Mar 2024',
  },
  {
    id: 'La6FOzAbK7g',
    title: 'How to remove fog from Car mirror in rain',
    description:
      'How to remove fog from Car mirror in rain. Safer habits for Indian traffic, weather, and night driving.',
    category: 'Driving Safety',
    duration: '0:52',
    date: '2024-02-24',
    dateLabel: '24 Feb 2024',
  },
  {
    id: 'KwV3g3A8DaU',
    title: 'What to know about car insurance claims',
    description:
      'Claim process basics every owner should know. Prepare documents and timelines so payouts move faster.',
    category: 'Emergency & Safety',
    duration: '8:30',
    date: '2024-02-10',
    dateLabel: '10 Feb 2024',
  },
  {
    id: 'Kkx0vCuAM3o',
    title: 'Get fog lamps fitted by the company',
    description:
      'Why factory fog-lamp fitment beats shady aftermarket work. Correct aiming matters for safety and legality.',
    category: 'Vehicle Tips',
    duration: '0:38',
    date: '2024-02-02',
    dateLabel: '2 Feb 2024',
  },
  {
    id: 'KG1SCVzQd_4',
    title: 'Will your car insurance pay out or not?',
    description:
      'Common claim scenarios and what decides approval. Helps you document better before you ever need Autolokate evidence.',
    category: 'Emergency & Safety',
    duration: '0:48',
    date: '2024-01-28',
    dateLabel: '28 Jan 2024',
  },
  {
    id: 'KCep6nK24GM',
    title: 'Follow traffic rules and wear a helmet',
    description:
      'Road discipline and helmet habits that cut injury risk. Short reminder for two-wheeler and family safety.',
    category: 'Driving Safety',
    duration: '0:32',
    date: '2024-01-24',
    dateLabel: '24 Jan 2024',
  },
  {
    id: 'K9SE_qglgO0',
    title: 'Sheesh khol kr gadi chalane se average pr kitna farak padta hh',
    description:
      'Sheesh khol kr gadi chalane se average pr kitna farak padta hh. Safer habits for Indian traffic, weather, and night driving.',
    category: 'Driving Safety',
    duration: '14:33',
    date: '2024-01-13',
    dateLabel: '13 Jan 2024',
  },
  {
    id: 'kud23pwZbgc',
    title: 'Planning to buy an EV? Watch this first',
    description:
      'EV ownership realities beyond the brochure. Charging, range, and costs for Indian buyers.',
    category: 'Car Knowledge',
    duration: '7:20',
    date: '2023-12-29',
    dateLabel: '29 Dec 2023',
  },
  {
    id: 'J01NuFwgx7Q',
    title: 'How to change a car tyre',
    description:
      'Step-by-step roadside tyre change you should practice before you need it at night.',
    category: 'Emergency & Safety',
    duration: '7:15',
    date: '2023-12-28',
    dateLabel: '28 Dec 2023',
  },
  {
    id: 'yP4aAqmj_bw',
    title: 'Learn to drive an automatic car',
    description:
      'Automatic basics for new drivers — modes, starts, and city flow. Lower stress path into everyday driving.',
    category: 'Beginner Drivers',
    duration: '0:55',
    date: '2023-12-14',
    dateLabel: '14 Dec 2023',
  },
  {
    id: 'IDR_a3DMUZE',
    title: 'Pay-as-you-drive car insurance explained',
    description:
      'Usage-based policies for low-mileage drivers. See if pay-as-you-drive fits your real annual kilometres.',
    category: 'Emergency & Safety',
    duration: '0:50',
    date: '2023-12-12',
    dateLabel: '12 Dec 2023',
  },
  {
    id: 'HRYr0gUswX4',
    title: 'How to protect your car tyres from theft',
    description:
      'Simple anti-theft habits for alloy and spare wheels. Peace of mind for street and overnight parking.',
    category: 'Emergency & Safety',
    duration: '0:42',
    date: '2023-11-22',
    dateLabel: '22 Nov 2023',
  },
  {
    id: 'HHo_hYaO2ps',
    title: 'Learn perfect car driving — day 3: gear changes',
    description:
      'Gear-change practice for new drivers building confidence. Continue the zero-to-hero progression smoothly.',
    category: 'Beginner Drivers',
    duration: '11:36',
    date: '2023-11-20',
    dateLabel: '20 Nov 2023',
  },
  {
    id: 'H55oncVryaw',
    title: 'Red, yellow, and white reflector meanings',
    description:
      'Decode vehicle reflectors so you read the road correctly at night. A short road-awareness lesson every driver needs.',
    category: 'Road Awareness',
    duration: '4:52',
    date: '2023-11-14',
    dateLabel: '14 Nov 2023',
    popular: true,
  },
  {
    id: 'GAFTTB6gQzo',
    title: 'How to remove fog from car glass in winter',
    description:
      'Defog habits that restore visibility fast on cold mornings. Safer winter starts without wiping blindly.',
    category: 'Vehicle Tips',
    duration: '16:11',
    date: '2023-11-05',
    dateLabel: '5 Nov 2023',
  },
  {
    id: 'FDPcAwL-Lmo',
    title: 'How to drive an automatic car: basics',
    description:
      'Starter automatic controls and habits for brand-new drivers. Get comfortable before busy Indian traffic.',
    category: 'Beginner Drivers',
    duration: '1:08',
    date: '2023-10-20',
    dateLabel: '20 Oct 2023',
  },
  {
    id: 'FxSHG2B3Its',
    title: 'Best use of hazard lights — army truck example',
    description:
      'When hazard lights communicate a real stop or obstruction. Learn from a clear roadside example.',
    category: 'Road Awareness',
    duration: '4:20',
    date: '2023-10-20',
    dateLabel: '20 Oct 2023',
  },
  {
    id: 'mTaxvB_qIZ4',
    title: 'Ultimate guide to buying a second-hand car',
    description:
      'What to inspect, ask, and verify on used cars. Reduce surprise repair bills after purchase.',
    category: 'Car Knowledge',
    duration: '11:40',
    date: '2023-10-01',
    dateLabel: '1 Oct 2023',
  },
  {
    id: 'DcunKPmybUA',
    title: 'Yellow rumble strip: highway driving safety tips',
    description:
      'What rumble strips mean and how to react safely. Small highway cues that warn before a bigger mistake.',
    category: 'Road Awareness',
    duration: '0:38',
    date: '2023-09-23',
    dateLabel: '23 Sep 2023',
  },
  {
    id: 'DEqWoneXqzg',
    title: 'Night drive mein high beam se dikkat? Anti-glare lenses se glare kam, vision clear',
    description:
      'Night drive mein high beam se dikkat? Anti-glare lenses se glare. Safer habits for Indian traffic, weather, and night driving.',
    category: 'Driving Safety',
    duration: '10:05',
    date: '2023-09-21',
    dateLabel: '21 Sep 2023',
  },
  {
    id: 'B5GFPievDyA',
    title: 'Where should you buy car insurance?',
    description:
      'Dealer, aggregator, or insurer-direct — trade-offs that affect claims later. Choose for service, not just price.',
    category: 'Emergency & Safety',
    duration: '0:42',
    date: '2023-09-08',
    dateLabel: '8 Sep 2023',
  },
  {
    id: 'AG288V6KS9o',
    title: 'Hazard lights in fog: safe or risky?',
    description:
      'When hazard lights help — and when they confuse others in fog. Clear guidance from the driving-and-safety series.',
    category: 'Driving Safety',
    duration: '4:55',
    date: '2023-08-28',
    dateLabel: '28 Aug 2023',
  },
  {
    id: '9DoKK0DT5ew',
    title: 'Say no to road rage, stay safe and follow traffic rules',
    description:
      'Say no to road rage, stay safe and follow traffic rules. Safer habits for Indian traffic, weather, and night driving.',
    category: 'Driving Safety',
    duration: '12:19',
    date: '2023-08-24',
    dateLabel: '24 Aug 2023',
  },
  {
    id: '8bxUIdFUYmk',
    title: "Don't use hazard lights in rain and fog",
    description:
      'Why constant hazards in rain or fog can hide real emergencies. Better lighting and visibility habits instead.',
    category: 'Driving Safety',
    duration: '0:42',
    date: '2023-08-17',
    dateLabel: '17 Aug 2023',
  },
  {
    id: '6lDG1p6k6o8',
    title: 'Check NCB and IDV at insurance renewal',
    description:
      'No-claim bonus and insured declared value decide what you pay and get. Review both before you renew.',
    category: 'Emergency & Safety',
    duration: '0:48',
    date: '2023-08-11',
    dateLabel: '11 Aug 2023',
  },
  {
    id: '6ZTWJ_pq4h8',
    title: 'DIY: repair a tyre puncture at home',
    description:
      'Home puncture repair basics when you have the right kit. Know limits — some damage still needs a shop.',
    category: 'Vehicle Tips',
    duration: '8:05',
    date: '2023-07-25',
    dateLabel: '25 Jul 2023',
  },
  {
    id: '5zLGRrEJXk0',
    title: 'E20 fuel insurance claim rejection is fake news',
    description:
      'Separating rumour from policy fact on E20 and claims. Know what insurers actually check.',
    category: 'Emergency & Safety',
    duration: '0:55',
    date: '2023-07-11',
    dateLabel: '11 Jul 2023',
  },
  {
    id: 'fRY9Sa--exI',
    title: 'EV vs CNG: which is best for you?',
    description:
      'Running cost, convenience, and infrastructure trade-offs. Decide with your real route in mind.',
    category: 'Car Knowledge',
    duration: '0:48',
    date: '2023-07-10',
    dateLabel: '10 Jul 2023',
  },
  {
    id: '52ZCp9WQRZU',
    title: 'Hill driving tips for beginners',
    description:
      'Beginner-friendly control on climbs and descents. Builds confidence before you face steep Indian hill roads.',
    category: 'Learn to Drive',
    duration: '0:48',
    date: '2023-07-08',
    dateLabel: '8 Jul 2023',
  },
  {
    id: '4qEwx0Mnw3k',
    title: 'Know when a left turn is not free at a signal',
    description:
      'Avoid red-light jump challans by reading free-left rules correctly. City driving clarity for Indian junctions.',
    category: 'Road Awareness',
    duration: '0:42',
    date: '2023-06-22',
    dateLabel: '22 Jun 2023',
  },
  {
    id: '4pGGHJXP5UQ',
    title: 'One rain-driving trick to avoid accidents',
    description:
      'A simple monsoon habit that reduces skids and sudden stops. Useful for wet-road confidence.',
    category: 'Driving Safety',
    duration: '0:40',
    date: '2023-06-19',
    dateLabel: '19 Jun 2023',
  },
  {
    id: '4o4Uccp2bKs',
    title: 'Use mParivahan so you never miss insurance renewals',
    description:
      'Digital RC, insurance, and PUC reminders in one place. Avoid lapses that leave you unprotected after a crash.',
    category: 'Emergency & Safety',
    duration: '0:45',
    date: '2023-06-03',
    dateLabel: '3 Jun 2023',
  },
  {
    id: '3JbmgMGEW7U',
    title: 'Tyre puncture scam in India',
    description:
      'How roadside puncture scams work and how to spot them. Stay calm, verify damage, and avoid panic repairs.',
    category: 'Driving Safety',
    duration: '0:50',
    date: '2023-05-26',
    dateLabel: '26 May 2023',
  },
  {
    id: '3peV1BI2TkY',
    title: 'Which insurance is right for your car?',
    description:
      'Pick cover that matches age, value, and risk — not just the cheapest quote. Useful before Autolokate users renew.',
    category: 'Emergency & Safety',
    duration: '0:50',
    date: '2023-05-19',
    dateLabel: '19 May 2023',
  },
  {
    id: '2z5UqdmuszU',
    title: 'Best car tyre pressure for your vehicle',
    description:
      'How to find the right PSI for your car and when to check it. A foundational safety and mileage habit.',
    category: 'Vehicle Tips',
    duration: '0:55',
    date: '2023-05-08',
    dateLabel: '8 May 2023',
  },
  {
    id: '1gPXbp0lLBw',
    title: 'Lane driving: stay in your lane for a safer drive',
    description:
      'Lane discipline that reduces side-swipe and sudden cut-ins. Core habit for Indian highways and city roads.',
    category: 'Driving Safety',
    duration: '5:40',
    date: '2023-04-29',
    dateLabel: '29 Apr 2023',
  },
  {
    id: '0hQv7jQ7ZD4',
    title: 'Stay focused while driving',
    description:
      'Distraction traps and focus habits for safer daily driving. Simple cues that keep attention on the road.',
    category: 'Driving Safety',
    duration: '0:38',
    date: '2023-04-16',
    dateLabel: '16 Apr 2023',
  },
  {
    id: '0bJDElyzIOs',
    title: 'Tips for buying a used car',
    description:
      'Inspection checklist, paperwork, and red flags before you hand over money. Built for first-time used-car buyers in India.',
    category: 'Car Knowledge',
    duration: '14:22',
    date: '2023-04-05',
    dateLabel: '5 Apr 2023',
  },
  {
    id: '-OHBIgvm1JM',
    title: 'How to jump-start a Toyota Hyryder hybrid',
    description:
      'Safe jump-start steps for hybrid 12V systems without damaging electronics. Keep this ready for roadside emergencies.',
    category: 'Emergency & Safety',
    duration: '6:14',
    date: '2023-03-31',
    dateLabel: '31 Mar 2023',
  },
  {
    id: '-lqCPIk9B90',
    title: 'Driving skills that can save you from a flat tyre',
    description:
      'Lane habits and responses that reduce tyre-related incidents. Pair with pressure checks and a working spare.',
    category: 'Driving Safety',
    duration: '0:45',
    date: '2023-03-28',
    dateLabel: '28 Mar 2023',
  },
  {
    id: 'i-yMpOUd8Yg',
    title: 'Download the IDG Autolokate app',
    description:
      'Where to get Autolokate on iOS and Android. Start with Smart QR, community, and day-to-day vehicle tools in one place.',
    category: 'Emergency & Safety',
    duration: '0:35',
    date: '2023-03-11',
    dateLabel: '11 Mar 2023',
    popular: true,
  },
  {
    id: 'PE5YJkP2bgs',
    title: 'Know your car service schedule on IDG Autolokate',
    description:
      'Track service intervals inside Autolokate so you never miss oil, filters, or warranty windows. Free on Play Store and App Store.',
    category: 'Vehicle Tips',
    duration: '0:52',
    date: '2023-03-04',
    dateLabel: '4 Mar 2023',
    popular: true,
  },
  {
    id: 'LKCvOmP2BtM',
    title: 'MG Windsor EV NVH test in IDG Autolokate',
    description:
      'Cabin noise check of the MG Windsor EV using Autolokate. See how the app helps compare real-world NVH before you buy.',
    category: 'Automotive',
    duration: '1:05',
    date: '2023-02-24',
    dateLabel: '24 Feb 2023',
    popular: true,
  },
  {
    id: 'oYyJo_ZVnOw',
    title: "Join India's car community on IDG Autolokate",
    description:
      "Free community features inside Autolokate for tips, discussions, and vehicle help. Plug into India's driving community in minutes.",
    category: 'Automotive',
    duration: '0:38',
    date: '2023-02-18',
    dateLabel: '18 Feb 2023',
    popular: true,
  },
  {
    id: 'eg0qyvFKz0k',
    title: 'Use your phone like a dashcam',
    description:
      'How to run phone-based dashcam recording for daily drives. Handy backup when you do not have a dedicated camera yet.',
    category: 'Emergency & Safety',
    duration: '0:42',
    date: '2023-02-09',
    dateLabel: '9 Feb 2023',
    popular: true,
  },
  {
    id: '_W0k5F5PV24',
    title: 'Free dashcam: use your phone with IDG Autolokate',
    description:
      'Record drives with your phone as a dashcam using Autolokate. A zero-cost way to stay protected if something goes wrong.',
    category: 'Emergency & Safety',
    duration: '0:45',
    date: '2023-02-01',
    dateLabel: '1 Feb 2023',
    popular: true,
  },
  {
    id: '8BL-2qFbWJY',
    title: 'How to connect Autolokate QR in the app',
    description:
      'Step-by-step setup so your Smart QR links to the right vehicle and emergency flow. Get protection live in a few minutes.',
    category: 'Emergency & Safety',
    duration: '4:18',
    date: '2023-01-15',
    dateLabel: '15 Jan 2023',
    popular: true,
  },
  {
    id: '0Ongqax9sY8',
    title: 'Use your phone as a dashcam with IDG Autolokate',
    description:
      'Turn your phone into a free dashcam with the Autolokate app on Android and iOS. Quick setup for everyday evidence on Indian roads.',
    category: 'Emergency & Safety',
    duration: '0:58',
    date: '2023-01-15',
    dateLabel: '15 Jan 2023',
    popular: true,
  },
];

export function getFeaturedMediaVideo(): MediaVideo {
  const featured = MEDIA_VIDEOS.find((video) => video.featured);
  if (!featured) {
    throw new Error('MEDIA_VIDEOS must include exactly one featured video');
  }
  return featured;
}
