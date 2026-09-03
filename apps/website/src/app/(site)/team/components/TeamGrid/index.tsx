'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TEAM_MEMBERS, type TeamMember } from '../constants';
import styles from './index.module.css';

function MemberPortrait({ member, className }: { member: TeamMember; className: string }) {
  if (member.imageSrc) {
    return (
      <span className={className}>
        <Image
          src={member.imageSrc}
          alt={member.imageAlt ?? member.name}
          fill
          sizes="(max-width: 768px) 88px, 160px"
          className={styles.photo}
        />
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      {member.initials}
    </span>
  );
}

function MemberCard({ member, onOpen }: { member: TeamMember; onOpen: () => void }) {
  return (
    <li>
      <button type="button" className={styles.card} onClick={onOpen}>
        <MemberPortrait
          member={member}
          className={member.imageSrc ? styles.photoWrap : styles.initials}
        />
        <div className={styles.body}>
          <h3 className={styles.name}>{member.name}</h3>
          <p className={styles.role}>{member.role}</p>
          <p className={styles.summary}>{member.summary}</p>
          <span className={styles.more}>
            More about
            <ArrowUpRight className={styles.moreIcon} aria-hidden />
          </span>
        </div>
      </button>
    </li>
  );
}

export function TeamGrid() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const leaders = TEAM_MEMBERS.filter((member) => member.leadership);
  const team = TEAM_MEMBERS.filter((member) => !member.leadership);
  const selected = TEAM_MEMBERS.find((member) => member.id === selectedId) ?? null;

  return (
    <section className={styles.section} aria-labelledby="team-grid-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className="mkt-eyebrow">
            <span className="mkt-eyebrowLine" aria-hidden="true" />
            Core team
          </p>
          <h2 id="team-grid-heading" className={styles.heading}>
            The people building Autolokate.
          </h2>
          <p className={styles.lede}>
            Select anyone to read more about how they contribute to crash detection, Smart QR, and
            the Control Center.
          </p>
        </header>

        <div className={styles.leadershipBlock}>
          <p className={styles.rowLabel}>Leadership</p>
          <ul className={styles.leaders}>
            {leaders.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onOpen={() => {
                  setSelectedId(member.id);
                }}
              />
            ))}
          </ul>
        </div>

        <div>
          <p className={styles.rowLabel}>Team</p>
          <ul className={styles.grid}>
            {team.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onOpen={() => {
                  setSelectedId(member.id);
                }}
              />
            ))}
          </ul>
        </div>
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className={styles.dialog} aria-describedby={undefined}>
          {selected ? (
            <>
              <DialogHeader className={styles.dialogHeader}>
                <MemberPortrait
                  member={selected}
                  className={selected.imageSrc ? styles.dialogPhotoWrap : styles.dialogInitials}
                />
                <div>
                  <DialogTitle className={styles.dialogName}>{selected.name}</DialogTitle>
                  <DialogDescription className={styles.dialogRole}>
                    {selected.role}
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className={styles.dialogBody}>
                {selected.about.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <ul className={styles.focus}>
                  {selected.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
