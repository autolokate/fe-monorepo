import { AlAvatar } from '@autolokate/ui';

import {
  CoreComponentShowcase,
  type ShowcaseState,
} from '../../components/CoreComponentShowcase';

function renderAvatarState(state: ShowcaseState) {
  const opacity = state === 'disabled' ? 0.5 : 1;

  return (
    <div style={{ opacity }}>
      <AlAvatar initials="KS" size="md" />
    </div>
  );
}

export function AlAvatarPage() {
  return (
    <CoreComponentShowcase
      name="AlAvatar"
      description="User or entity avatar with image or initials fallback."
      whenToUse="Profile headers, contact lists, and rider cards."
      whenNotToUse="Decorative illustrations without identity meaning."
      overview={<p>Circular avatar supporting image src or initials across three sizes.</p>}
      variants={
        <div className="preview-row">
          <AlAvatar initials="AL" />
          <AlAvatar
            src="https://api.dicebear.com/9.x/initials/svg?seed=Autolokate"
            alt="User avatar"
          />
        </div>
      }
      sizes={
        <div className="preview-row">
          <AlAvatar initials="SM" size="sm" />
          <AlAvatar initials="MD" size="md" />
          <AlAvatar initials="LG" size="lg" />
        </div>
      }
      renderStatePreview={renderAvatarState}
      usage={<AlAvatar initials="KS" size="md" />}
      code={`import { AlAvatar } from '@autolokate/ui';

<AlAvatar initials="KS" size="md" />`}
      props={[
        { name: 'src', type: 'string', description: 'Image URL.' },
        { name: 'alt', type: 'string', description: 'Image alt text.' },
        { name: 'initials', type: 'string', description: 'Fallback initials.' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'md', description: 'Avatar scale.' },
      ]}
    />
  );
}
