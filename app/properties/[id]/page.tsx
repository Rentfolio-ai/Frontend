import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { PropertyDetails } from '@/components/properties/property-details';
import { propertyRepository } from '@/lib/property-repository';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const property = await propertyRepository.findById(params.id);

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: `${property.title} - Property Details`,
    description: property.description || `${property.beds} bed, ${property.baths} bath property in ${property.city}, ${property.state}`,
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await propertyRepository.findById(params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PropertyDetails property={property} />
      </main>
    </div>
  );
}
