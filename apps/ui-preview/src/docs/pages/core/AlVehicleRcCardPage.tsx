import { AlIcon } from '@autolokate/icons';
import { AlVehicleRcCard } from '@autolokate/ui';

import {
  CoreComponentShowcase,
  type ShowcaseState,
} from '../../components/CoreComponentShowcase';

const vehicleFields = [
  { label: 'Owner', value: 'Shibu Shrivastva' },
  { label: 'Class', value: 'LMV · Car' },
  { label: 'Maker', value: 'Maruti Suzuki' },
  { label: 'Model', value: 'Swift VXi' },
  { label: 'Fuel', value: 'Petrol' },
  { label: 'Colour', value: 'Pearl White' },
  { label: 'Registered', value: '14 Mar 2021' },
  { label: 'Valid till', value: '13 Mar 2036' },
];

function renderVehicleRcCard(_state: ShowcaseState) {
  return (
    <AlVehicleRcCard
      registrationNumber="MH 12 AB 3456"
      verifiedLabel="Verified"
      verifiedIcon={<AlIcon name="circle-check" size={14} aria-hidden />}
      fields={vehicleFields}
    />
  );
}

export function AlVehicleRcCardPage() {
  return (
    <CoreComponentShowcase
      name="AlVehicleRcCard"
      description="R05 Registration Certificate card — gradient shell, verified chip, 2-column field grid."
      whenToUse="Vehicle confirmation screen (R05) showing RC details from API."
      whenNotToUse="Do not use for editable forms — fields are read-only via AlField."
      overview={
        <p>
          Figma node 170:79. Composes <code className="ds-inline-code">AlChip</code> (verified status)
          and <code className="ds-inline-code">AlField</code> rows in a 2-column grid. Registration
          number at 29px/700. Section labelled via{' '}
          <code className="ds-inline-code">aria-label=&quot;Vehicle registration details&quot;</code>.
        </p>
      }
      variants={
        <div className="preview-row" style={{ flexWrap: 'wrap' }}>
          {renderVehicleRcCard('default')}
          <AlVehicleRcCard
            registrationNumber="DL 01 CA 1234"
            fields={vehicleFields.slice(0, 4)}
          />
        </div>
      }
      renderStatePreview={renderVehicleRcCard}
      responsive={renderVehicleRcCard('default')}
      accessibility={
        <ul className="ds-list">
          <li>
            Root <code className="ds-inline-code">section</code> with descriptive aria-label.
          </li>
          <li>Verified chip includes visible label text for screen readers.</li>
          <li>AlField pairs provide label/value semantics for each data row.</li>
          <li>Long owner names and values wrap within grid cells.</li>
          <li>Read-only display — no interactive controls inside card.</li>
        </ul>
      }
      usage={renderVehicleRcCard('default')}
      code={`import { AlIcon } from '@autolokate/icons';
import { AlVehicleRcCard } from '@autolokate/ui';

<AlVehicleRcCard
  registrationNumber="MH 12 AB 3456"
  verifiedLabel="Verified"
  verifiedIcon={<AlIcon name="circle-check" size={14} aria-hidden />}
  fields={[
    { label: 'Owner', value: 'Shibu Shrivastva' },
    { label: 'Class', value: 'LMV · Car' },
  ]}
/>`}
      props={[
        { name: 'registrationNumber', type: 'string', description: 'Primary registration display.' },
        { name: 'verifiedLabel', type: 'string', defaultValue: 'Verified', description: 'Chip label text.' },
        { name: 'verifiedIcon', type: 'ReactNode', description: 'Optional icon inside verified chip.' },
        { name: 'fields', type: 'AlVehicleRcField[]', description: 'Label/value pairs (2-column grid).' },
      ]}
    />
  );
}
