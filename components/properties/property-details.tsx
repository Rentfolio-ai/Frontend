'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent, calculateCashOnCash } from '@/lib/utils';
import { AIInsights } from './ai-insights';
import {
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Square,
  Calendar,
  MapPin,
  Share,
  Heart,
  FileText
} from 'lucide-react';
import type { Property } from '@/types';

interface PropertyDetailsProps {
  property: Property;
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const cashOnCash = calculateCashOnCash(property);

  // Calculate AI Score (mock logic for demo)
  const aiScore = Math.min(95, Math.max(60,
    (property.capRate * 10) +
    (cashOnCash * 8) +
    (property.yearBuilt > 2000 ? 15 : 5) +
    Math.random() * 10
  ));

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent Investment';
    if (score >= 70) return 'Good Investment';
    if (score >= 60) return 'Fair Investment';
    return 'Risky Investment';
  };  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Carousel */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            {property.images.length > 0 ? (
              <>
                <Image
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  fill
                  className="object-cover"
                />

                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No images available
              </div>
            )}
          </div>
        </div>

        {/* Property Summary */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {property.title}
            </h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address}, {property.city}, {property.state} {property.zip}
            </div>

            <div className="text-4xl font-bold text-gray-900 mb-4">
              {formatCurrency(property.price)}
            </div>

            {/* AI Score */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">AI Investment Score</span>
                <Badge className={`${getScoreColor(aiScore)} text-white`}>
                  {Math.round(aiScore)}/100
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`${getScoreColor(aiScore)} h-2 rounded-full transition-all`}
                  style={{ width: `${aiScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{getScoreLabel(aiScore)}</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Bed className="h-4 w-4 mr-1" />
                {property.beds} beds
              </div>
              <div className="flex items-center text-gray-600">
                <Bath className="h-4 w-4 mr-1" />
                {property.baths} baths
              </div>
              <div className="flex items-center text-gray-600">
                <Square className="h-4 w-4 mr-1" />
                {property.sqft.toLocaleString()} sqft
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                Built {property.yearBuilt}
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <Badge variant="outline" className="text-sm">
                {property.propertyType.split('-').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Badge>
              <Badge variant={property.capRate >= 6 ? 'default' : 'secondary'}>
                {formatPercent(property.capRate)} Cap Rate
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <Heart className="h-4 w-4 mr-2" />
              Save to AI Portfolio
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share Insights
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                AI Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Investment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>AI Investment Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Predicted Cap Rate</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercent(property.capRate)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">AI Cash-on-Cash</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercent(cashOnCash)}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Rent (AI Est.)</span>
                <span className="font-medium">
                  {formatCurrency(property.rentEst * 12)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Expenses (AI Est.)</span>
                <span className="font-medium">
                  {formatCurrency(property.expensesEst)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Property Taxes</span>
                <span className="font-medium">
                  {formatCurrency(property.taxes)}
                </span>
              </div>
              {property.hoa > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">HOA (Annual)</span>
                  <span className="font-medium">
                    {formatCurrency(property.hoa * 12)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Property Features */}
        <Card>
          <CardHeader>
            <CardTitle>Smart Property Features</CardTitle>
          </CardHeader>
          <CardContent>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {amenity}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No amenities listed</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <AIInsights property={property} />      {/* Description */}
      {property.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
