import type { AlDispatchTimelineStep } from '@autolokate/ui';

export const PWA_LOADING_COPY = {
  title: 'Opening Autolokate',
  description: 'No app needed. Loading the scanner securely.',
} as const;

type StepInput = Omit<AlDispatchTimelineStep, 'state'>;

function withStates(
  steps: readonly StepInput[],
  activeIndex: number,
  errorIndex?: number,
): AlDispatchTimelineStep[] {
  return steps.map((step, index) => {
    if (errorIndex !== undefined && index === errorIndex) {
      return { ...step, state: 'error' as const };
    }
    if (index < activeIndex) {
      return { ...step, state: 'complete' as const };
    }
    if (index === activeIndex) {
      return { ...step, state: 'active' as const };
    }
    return { ...step, state: 'pending' as const };
  });
}

function allComplete(steps: readonly StepInput[]): AlDispatchTimelineStep[] {
  return steps.map((step) => ({ ...step, state: 'complete' as const }));
}

const parkMeStepsChecking: StepInput[] = [
  { id: '1', label: 'Details verified', subtitle: 'Your number and name are confirmed' },
  { id: '2', label: 'Photos received', subtitle: 'We have both your photos' },
  {
    id: '3',
    label: 'Checking the photo',
    subtitle: 'Confirming the vehicle is blocking you',
    activeGlyph: 'shield-check',
  },
  {
    id: '4',
    label: 'Calling the owner',
    subtitle: 'On a private number to ask them to move it',
    activeGlyph: 'phone',
  },
  { id: '5', label: 'Owner notified', subtitle: 'Reached by call or WhatsApp' },
  { id: '6', label: 'Owner is moving it', subtitle: 'They have been asked to move the vehicle' },
];

const parkMeStepsCalling: StepInput[] = [
  { id: '1', label: 'Details verified', subtitle: 'Your number and name are confirmed' },
  { id: '2', label: 'Photos received', subtitle: 'We have both your photos' },
  { id: '3', label: 'Vehicle confirmed', subtitle: 'Confirmed it is blocking you' },
  {
    id: '4',
    label: 'Calling the owner',
    subtitle: 'On a private number to ask them to move it',
    activeGlyph: 'phone',
  },
  { id: '5', label: 'Owner notified', subtitle: 'Reached by call or WhatsApp' },
  { id: '6', label: 'Owner is moving it', subtitle: 'They have been asked to move the vehicle' },
];

const parkMeStepsResolved: StepInput[] = [
  { id: '1', label: 'Details verified', subtitle: 'Your number and name are confirmed' },
  { id: '2', label: 'Photos received', subtitle: 'We have both your photos' },
  { id: '3', label: 'Vehicle confirmed', subtitle: 'Confirmed it is blocking you' },
  { id: '4', label: 'Owner reached', subtitle: 'Reached on a private number' },
  { id: '5', label: 'Owner notified', subtitle: 'Sent your photo and a message' },
  { id: '6', label: 'Owner is moving it', subtitle: 'They have been asked to move the vehicle' },
];

const parkMeStepsPhotoError: StepInput[] = [
  { id: '1', label: 'Details verified', subtitle: 'Your number and name are confirmed' },
  { id: '2', label: 'Photos received', subtitle: 'We have both your photos' },
  {
    id: '3',
    label: 'Photo not clear',
    subtitle: 'We could not confirm the vehicle. Please retake.',
    activeGlyph: 'triangle-alert',
  },
  {
    id: '4',
    label: 'Calling the owner',
    subtitle: 'On a private number to ask them to move it',
    activeGlyph: 'phone',
  },
  { id: '5', label: 'Owner notified', subtitle: 'Reached by call or WhatsApp' },
  { id: '6', label: 'Owner is moving it', subtitle: 'They have been asked to move the vehicle' },
];

export const parkMeTimelineSteps = {
  checking: withStates(parkMeStepsChecking, 2),
  calling: withStates(parkMeStepsCalling, 3),
  resolved: allComplete(parkMeStepsResolved),
  photoError: withStates(parkMeStepsPhotoError, 2, 2),
};

const sosStepsReceived: StepInput[] = [
  { id: '1', label: 'Alert received', subtitle: 'Autolokate has your alert' },
  {
    id: '2',
    label: 'Assessing severity',
    subtitle: 'Checking your photo and location',
    activeGlyph: 'activity',
  },
  {
    id: '3',
    label: 'Ambulance',
    subtitle: 'Finding the nearest unit',
    activeGlyph: 'shield-check',
  },
  { id: '4', label: 'Emergency contacts', subtitle: 'Preparing to call and message' },
  { id: '5', label: 'WhatsApp to contacts', subtitle: 'Photo, location and map' },
  { id: '6', label: 'Roadside help', subtitle: 'If your plan covers towing' },
  { id: '7', label: 'Monitoring', subtitle: 'Live ETA updates' },
  { id: '8', label: 'Contact updates', subtitle: 'Status on WhatsApp' },
  { id: '9', label: 'Incident resolved', subtitle: 'When help reaches you' },
  { id: '10', label: 'Insurance log', subtitle: 'Saved for your claim' },
];

const sosStepsDispatched: StepInput[] = [
  { id: '1', label: 'Alert received', subtitle: 'Autolokate has your alert' },
  { id: '2', label: 'Severity assessed', subtitle: 'From your photo and location' },
  { id: '3', label: 'Ambulance dispatched', subtitle: 'Nearest unit · ETA ~8 min' },
  { id: '4', label: 'Calling your contacts', subtitle: "Auto-calling the owner's contacts" },
  { id: '5', label: 'WhatsApp sent to contacts', subtitle: 'Photo, location and map shared' },
  { id: '6', label: 'Roadside help', subtitle: 'On standby if your plan covers it' },
  {
    id: '7',
    label: "Monitoring until you're safe",
    subtitle: 'Live ETA updates',
    activeGlyph: 'activity',
  },
  { id: '8', label: 'Contact updates', subtitle: 'Status on WhatsApp' },
  { id: '9', label: 'Incident resolved', subtitle: 'When help reaches you' },
  { id: '10', label: 'Insurance log', subtitle: 'Saved for your claim' },
];

const sosStepsResolved: StepInput[] = [
  { id: '1', label: 'Alert received', subtitle: 'Autolokate had your alert' },
  { id: '2', label: 'Severity assessed', subtitle: 'From your photo and location' },
  { id: '3', label: 'Ambulance reached the scene', subtitle: 'Nearest unit arrived' },
  { id: '4', label: 'Contacts called', subtitle: "The owner's contacts were reached" },
  { id: '5', label: 'WhatsApp sent to contacts', subtitle: 'Photo, location and map shared' },
  { id: '6', label: 'Roadside help', subtitle: 'Arranged if the plan covered it' },
  { id: '7', label: 'Monitored to resolution', subtitle: 'Tracked until help arrived' },
  { id: '8', label: 'Updates sent to contacts', subtitle: 'Final status on WhatsApp' },
  { id: '9', label: 'Incident resolved', subtitle: 'Case closed' },
  { id: '10', label: 'Logged for insurance', subtitle: 'Photo, GPS and time saved' },
];

export const sosTimelineSteps = {
  received: withStates(sosStepsReceived, 1),
  dispatched: withStates(sosStepsDispatched, 6),
  resolved: allComplete(sosStepsResolved),
  contactsOnly: withStates(
    [
      { id: '1', label: 'Alert received', subtitle: 'Autolokate has your alert' },
      { id: '2', label: 'Message sent', subtitle: 'Photos and details by WhatsApp' },
      {
        id: '3',
        label: 'Calling their contacts',
        subtitle: 'On a private number',
        activeGlyph: 'phone',
      },
    ],
    2,
  ),
};

export const PWA_PARK_ME_LOOKUP_COPY = {
  title: 'Looking up your vehicle',
  description: 'Checking your number against records.',
} as const;
