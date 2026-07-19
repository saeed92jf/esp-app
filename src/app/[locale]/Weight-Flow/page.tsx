import type { Metadata } from 'next';
import { VesselWeightEditor } from '@/modules/vessel-weight/components/VesselWeightEditor';

export const metadata: Metadata = {
  title: 'Vessel Weight Calculator — ASME Sec. VIII',
  description: 'Comprehensive pressure vessel weight calculation engine with 6-condition MTO according to ASME Section VIII Div. 1 & 2.',
  keywords: 'pressure vessel, weight calculation, ASME, MTO, ReactFlow, ESP, weight estimation',
};

export default function VesselWeightPage() {
  return <VesselWeightEditor />;
}
