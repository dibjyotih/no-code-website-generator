import React from 'react';

const ComponentLibrary = () => {
  const componentCategories = [
    {
      name: 'Navigation',
      icon: '🧭',
      color: 'from-blue-500 to-blue-600',
      components: [
        { name: 'Header', icon: '📄', description: 'Navigation bar with menu' },
        { name: 'Sidebar', icon: '📋', description: 'Side navigation menu' },
        { name: 'Breadcrumb', icon: '🍞', description: 'Page navigation trail' }
      ]
    },
    {
      name: 'Hero Sections',
      icon: '🦸',
      color: 'from-purple-500 to-purple-600',
      components: [
        { name: 'Hero Banner', icon: '🎯', description: 'Main landing section' },
        { name: 'Call to Action', icon: '📢', description: 'Action-focused section' },
        { name: 'Features Grid', icon: '⚡', description: 'Feature highlights' }
      ]
    },
    {
      name: 'Content',
      icon: '📝',
      color: 'from-green-500 to-green-600',
      components: [
        { name: 'Text Block', icon: '📄', description: 'Rich text content' },
        { name: 'Image Gallery', icon: '🖼️', description: 'Photo showcase' },
        { name: 'Video Player', icon: '🎥', description: 'Embedded video' }
      ]
    },
    {
      name: 'Interactive',
      icon: '🎮',
      color: 'from-red-500 to-red-600',
      components: [
        { name: 'Contact Form', icon: '📧', description: 'User contact form' },
        { name: 'Subscribe Form', icon: '✉️', description: 'Email subscription' },
        { name: 'Search Bar', icon: '🔍', description: 'Content search' }
      ]
    },
    {
      name: 'E-commerce',
      icon: '🛍️',
      color: 'from-yellow-500 to-yellow-600',
      components: [
        { name: 'Product Card', icon: '🏷️', description: 'Product showcase' },
        { name: 'Cart Button', icon: '🛒', description: 'Add to cart action' },
        { name: 'Price Display', icon: '💰', description: 'Product pricing' }
      ]
    },
    {
      name: 'Social',
      icon: '👥',
      color: 'from-indigo-500 to-indigo-600',
      components: [
        { name: 'Testimonial', icon: '💬', description: 'Customer reviews' },
        { name: 'Team Member', icon: '👤', description: 'Staff profiles' },
        { name: 'Social Links', icon: '🔗', description: 'Social media links' }
      ]
    }
  ];

  const handleDragStart = (e: React.DragEvent, componentName: string) => {
    e.dataTransfer.setData('text/plain', componentName);
  };

  return (
    <div className="space-y-6">
      {componentCategories.map((category) => (
        <div key={category.name} className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-sm`}>
              {category.icon}
            </div>
            <h3 className="font-semibold text-slate-800">{category.name}</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {category.components.map((component) => (
              <div
                key={component.name}
                draggable
                onDragStart={(e) => handleDragStart(e, component.name)}
                className="lovable-card p-3 cursor-move hover:shadow-md transition-all group"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                    {component.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-slate-800 text-sm truncate">{component.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{component.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-2xl mb-2">✨</div>
          <h3 className="font-semibold text-slate-800 mb-1">Drag & Drop</h3>
          <p className="text-sm text-slate-600">Drag components to the preview area to add them to your website</p>
        </div>
      </div>
    </div>
  );
};

export default ComponentLibrary;