import { notFound } from 'next/navigation';
import { SERVICES } from '@/config/services';
import { ServiceDetail } from '@/app/components/ServiceDetail';

export function generateStaticParams() {
  return SERVICES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = SERVICES.find((s) => s.id === id);
  if (!service) return {};
  return {
    title: `${service.title} · หาบริการรัฐใกล้ฉัน`,
    description: `ข้อมูลบริการ ${service.title}: เอกสาร ค่าธรรมเนียม เวลาทำการ และสำนักงานใกล้บ้าน`,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = SERVICES.find((s) => s.id === id);
  if (!service) notFound();
  return <ServiceDetail service={service} />;
}
