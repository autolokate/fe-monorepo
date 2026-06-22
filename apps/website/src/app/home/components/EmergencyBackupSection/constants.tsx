import { Ambulance, AudioLines, QrCode, Shield, Smartphone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import type {
  EmergencyAction,
  EmergencyBackupSectionCopy,
  ProtectionLayerCard,
} from "./types";

export const EMERGENCY_BACKUP_COPY: EmergencyBackupSectionCopy = {
  eyebrow: "AUTOLOKATE EMERGENCY BACKUP",
  headlineLine1: "If the QR can’t be scanned,",
  headlineLine2: "Autolokate still helps.",
  description:
    "Autolokate is your first layer of emergency support, using supported phone-based signals to detect a possible emergency and trigger actions automatically. If the QR is accessible, QR Sticker Scan works as a backup when a bystander can scan and raise an emergency request instantly.",
  actionsEyebrow: "THREE EMERGENCY ACTIONS. AUTOMATICALLY.",
  disclaimer:
    "Emergency backup works when required app permissions, device conditions, and supported plan features are active.",
};

export const EMERGENCY_BACKUP_ACTIONS: EmergencyAction[] = [
  {
    id: "whatsapp-alert",
    step: "01",
    title: "WhatsApp Emergency Alert",
    body: "Emergency contacts receive an alert with location details so they can act quickly.",
    Icon: WhatsAppIcon,
  },
  {
    id: "ambulance-dispatch",
    step: "02",
    title: "Ambulance Dispatch",
    body: "For supported plans, emergency assistance can be routed to the detected location.",
    Icon: Ambulance,
  },
  {
    id: "voice-call-to-family",
    step: "03",
    title: "Voice Call to Family",
    body: "Autolokate can call emergency contacts and keep trying until someone responds.",
    Icon: AudioLines,
  },
];

export const EMERGENCY_BACKUP_LAYERS: ProtectionLayerCard[] = [
  {
    id: "autolokate-backup",
    layerLabel: "PRIMARY LAYER",
    title: "Autolokate Backup",
    body: "Best when the QR is damaged, the rider is unconscious, or no one is available to scan.",
    Icon: Smartphone,
    imageSrc: "/images/home/home_autolokate_backup_one.png",
    imageAlt: "Vehicle emergency scene with Autolokate backup protection active",
  },
  {
    id: "qr-sticker-scan",
    layerLabel: "BACKUP LAYER",
    title: "QR Sticker Scan",
    body: "Best when a bystander can scan the QR and raise an emergency request instantly.",
    Icon: QrCode,
    imageSrc: "/images/home/home_autolokate_backup_two.png",
    imageAlt: "Hand scanning an Autolokate QR code on a vehicle window",
  },
];

export const EMERGENCY_BACKUP_BADGE_ICON = Shield;
