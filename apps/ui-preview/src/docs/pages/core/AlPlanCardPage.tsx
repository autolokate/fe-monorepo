import { AlIcon } from '@autolokate/icons';
import { AlPlanCard, AlStack } from '@autolokate/ui';

import { CoreComponentShowcase, type ShowcaseState } from '../../components/CoreComponentShowcase';

const secureFeatures = [
  'Automatic crash detection',
  'Ambulance + ₹3,000 cover',
  '3 contacts + AI calling',
  '₹1L accidental · ₹1k/day hospital',
  'Driver score & leaderboard',
];

function renderPlanCard(state: ShowcaseState) {
  const selected = state === 'selected' || state === 'active';
  const disabled = state === 'disabled';

  return (
    <AlPlanCard
      name="Secure"
      price="₹999/yr"
      badge="MOST POPULAR"
      includesLabel="Includes everything in Safe"
      features={secureFeatures}
      addon={{ label: 'Rider cover · up to 2 · add-on' }}
      selected={selected}
      featureIcon={<AlIcon name="circle-check" size={15} aria-hidden />}
      selectedIcon={<AlIcon name="circle-check" size={24} aria-hidden />}
      onSelect={disabled ? undefined : () => undefined}
      data-showcase-simulated={
        state === 'hover' || state === 'focus' || state === 'pressed' ? state : undefined
      }
    />
  );
}

export function AlPlanCardPage() {
  return (
    <CoreComponentShowcase
      name="AlPlanCard"
      description="Plan tier selection card — 270px max width, 20px radius, Figma AlPlanCardW."
      whenToUse="Subscription tier selection in plan carousel (R06 Choose plan)."
      whenNotToUse="Do not embed screen-level CTAs — pair with AlButton at screen footer."
      overview={
        <p>
          Figma node 231:80 / instance 232:102. Interactive cards render as{' '}
          <code className="ds-inline-code">button</code> with{' '}
          <code className="ds-inline-code">aria-pressed</code>. Static cards render as{' '}
          <code className="ds-inline-code">article</code>. Icons passed via{' '}
          <code className="ds-inline-code">featureIcon</code> and{' '}
          <code className="ds-inline-code">selectedIcon</code> props (consumer supplies{' '}
          <code className="ds-inline-code">AlIcon</code>).
        </p>
      }
      variants={
        <AlStack gap="lg" align="start">
          <AlPlanCard
            name="Safe"
            price="₹499/yr"
            features={['Crash detection', '1 emergency contact']}
            featureIcon={<AlIcon name="circle-check" size={15} aria-hidden />}
          />
          <AlPlanCard
            name="Secure"
            price="₹999/yr"
            badge="MOST POPULAR"
            includesLabel="Includes everything in Safe"
            features={secureFeatures.slice(0, 3)}
            selected
            featureIcon={<AlIcon name="circle-check" size={15} aria-hidden />}
            selectedIcon={<AlIcon name="circle-check" size={24} aria-hidden />}
            onSelect={() => undefined}
          />
        </AlStack>
      }
      renderStatePreview={renderPlanCard}
      responsive={renderPlanCard('default')}
      accessibility={
        <ul className="ds-list">
          <li>
            Interactive cards use native <code className="ds-inline-code">button</code> semantics.
          </li>
          <li>
            <code className="ds-inline-code">aria-pressed</code> reflects selected state for screen
            readers.
          </li>
          <li>Focus-visible ring on interactive cards (2px focus token).</li>
          <li>
            Feature icons and selected tick marked{' '}
            <code className="ds-inline-code">aria-hidden</code>.
          </li>
          <li>Long feature lists wrap naturally; card width capped at 270px.</li>
        </ul>
      }
      usage={
        <AlPlanCard
          name="Secure"
          price="₹999/yr"
          badge="MOST POPULAR"
          features={secureFeatures.slice(0, 2)}
          featureIcon={<AlIcon name="circle-check" size={15} aria-hidden />}
          onSelect={() => undefined}
        />
      }
      code={`import { AlIcon } from '@autolokate/icons';
import { AlPlanCard } from '@autolokate/ui';

<AlPlanCard
  name="Secure"
  price="₹999/yr"
  badge="MOST POPULAR"
  includesLabel="Includes everything in Safe"
  features={['Crash detection', 'Ambulance cover']}
  addon={{ label: 'Rider cover · up to 2 · add-on' }}
  selected
  featureIcon={<AlIcon name="circle-check" size={15} aria-hidden />}
  selectedIcon={<AlIcon name="circle-check" size={24} aria-hidden />}
  onSelect={() => setPlan('secure')}
/>`}
      props={[
        { name: 'name', type: 'string', description: 'Plan tier name (h3).' },
        { name: 'price', type: 'string', description: 'Price display string.' },
        { name: 'features', type: 'string[]', description: 'Feature checklist items.' },
        {
          name: 'badge',
          type: 'string',
          description: 'Optional uppercase badge (e.g. MOST POPULAR).',
        },
        { name: 'includesLabel', type: 'string', description: 'Optional includes pill label.' },
        {
          name: 'addon',
          type: 'AlPlanCardAddon',
          description: 'Optional add-on row below features.',
        },
        {
          name: 'selected',
          type: 'boolean',
          defaultValue: 'false',
          description: 'Selected border + tick mark.',
        },
        {
          name: 'featureIcon',
          type: 'ReactNode',
          description: 'Icon rendered before each feature.',
        },
        { name: 'selectedIcon', type: 'ReactNode', description: 'Tick icon when selected.' },
        {
          name: 'onSelect',
          type: '() => void',
          description: 'When set, renders interactive button.',
        },
      ]}
    />
  );
}
