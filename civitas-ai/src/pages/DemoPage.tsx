// FILE: src/pages/DemoPage.tsx
import React from 'react';
import AnimationDemo from '../components/demo/AnimationDemo';

export const DemoPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold">Component & Animation Demos</h1>
        <p className="text-muted-foreground">
          This page showcases various animation capabilities and component interactions.
        </p>
      </div>
      
      <div>
        <AnimationDemo />
      </div>
    </div>
  );
};

export default DemoPage;