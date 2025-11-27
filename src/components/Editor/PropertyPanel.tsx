import React, { useState, useEffect } from 'react';

interface SelectedElement {
  id: string;
  type: string;
  styles: CSSStyleDeclaration;
  content: string;
  classes: string;
  element: HTMLElement;
}

interface PropertyPanelProps {
  selectedElement: SelectedElement | null;
  onApplyChanges: (changes: PendingChanges) => void;
  onClose: () => void;
  onDeleteElement?: () => void;
}

interface PendingChanges {
  styles: Record<string, string>;
  content?: string;
  imageUrl?: string;
  imageFile?: File;
  imagePrompt?: string;
  optimize?: string;
  background?: string;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedElement, onApplyChanges, onClose, onDeleteElement }) => {
  const [activeTab, setActiveTab] = useState<'style' | 'content' | 'layout' | 'background'>('style');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('16');
  const [padding, setPadding] = useState('0');
  const [margin, setMargin] = useState('0');
  const [borderRadius, setBorderRadius] = useState('0');
  const [opacity, setOpacity] = useState('100');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isImageElement, setIsImageElement] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [optimizeDesign, setOptimizeDesign] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<string>('none');

  useEffect(() => {
    if (selectedElement) {
      setBackgroundColor(rgbToHex(selectedElement.styles.backgroundColor) || '#FFFFFF');
      setColor(rgbToHex(selectedElement.styles.color) || '#000000');
      setFontSize(String(parseInt(selectedElement.styles.fontSize) || 16));
      setPadding(String(parseInt(selectedElement.styles.padding) || 0));
      setMargin(String(parseInt(selectedElement.styles.margin) || 0));
      setBorderRadius(String(parseInt(selectedElement.styles.borderRadius) || 0));
      setOpacity(String(Math.round((parseFloat(selectedElement.styles.opacity) || 1) * 100)));
      setContent(selectedElement.content);
      
      // Check if it's an image element
      const isImg = selectedElement.type === 'img';
      setIsImageElement(isImg);
      if (isImg && selectedElement.element instanceof HTMLImageElement) {
        const srcUrl = selectedElement.element.src || '';
        setImageUrl(srcUrl);
        setOriginalImageUrl(srcUrl);
        setImagePreview(srcUrl);
      }
      
      // Reset changes flag
      setHasChanges(false);
      setImageFile(null);
    }
  }, [selectedElement]);

  const rgbToHex = (rgb: string): string => {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return '#FFFFFF';
    const match = rgb.match(/\d+/g);
    if (!match) return '#FFFFFF';
    const [r, g, b] = match.map(Number);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const handleApplyChanges = () => {
    if (!selectedElement) return;

    const changes: PendingChanges = {
      styles: {
        backgroundColor,
        color,
        fontSize: fontSize + 'px',
        padding: padding + 'px',
        margin: margin + 'px',
        borderRadius: borderRadius + 'px',
        opacity: (parseInt(opacity) / 100).toString()
      }
    };

    // Add content changes
    if (content !== selectedElement.content) {
      changes.content = content;
    }

    // Add image changes - prioritize base64 data from uploaded file
    if (imageFile && imageUrl.startsWith('data:')) {
      // Image file was uploaded - use the base64 data
      changes.imageUrl = imageUrl;
      changes.optimize = optimizeDesign ? 'true' : 'false';
      console.log('📷 PropertyPanel: Image file uploaded, base64 length:', imageUrl.length);
      console.log('  - First 50 chars:', imageUrl.substring(0, 50));
      console.log('  - Has imageFile object:', !!imageFile);
    } else if (imageUrl && imageUrl !== originalImageUrl) {
      // Image URL was changed
      changes.imageUrl = imageUrl;
      console.log('🔗 PropertyPanel: Image URL changed to:', imageUrl.substring(0, 100));
    }

    if (imagePrompt.trim()) {
      changes.imagePrompt = imagePrompt.trim();
      console.log('🎨 PropertyPanel: Image prompt:', imagePrompt);
    }

    // Add background changes
    if (selectedBackground !== 'none') {
      changes.background = selectedBackground;
      console.log('🎨 PropertyPanel: Background selected:', selectedBackground);
    }

    console.log('PropertyPanel: Applying changes:', {
      hasContent: !!changes.content,
      hasImageUrl: !!changes.imageUrl,
      hasImagePrompt: !!changes.imagePrompt,
      hasStyles: Object.keys(changes.styles).length
    });
    onApplyChanges(changes);
    
    // Reset state after applying
    setHasChanges(false);
    setOptimizeDesign(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setHasChanges(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const markAsChanged = () => {
    setHasChanges(true);
  };

  if (!selectedElement) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        gap: '20px',
        padding: '40px 20px'
      }}>
        <div style={{ fontSize: '48px', opacity: 0.3 }}>🎯</div>
        <div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#EAEAEA',
            marginBottom: '8px'
          }}>
            No Selection
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#888888',
            lineHeight: '1.6'
          }}>
            Click on any element in the preview to customize
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 12px;
          background: #2E2E2E;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(90deg, #7C00FF, #FF007F);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(124, 0, 255, 0.5);
          transition: all 0.25s ease-in-out;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(124, 0, 255, 0.8);
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(90deg, #7C00FF, #FF007F);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(124, 0, 255, 0.5);
          transition: all 0.25s ease-in-out;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(124, 0, 255, 0.8);
        }

        .property-input:focus {
          border-color: #7C00FF !important;
          box-shadow: 0 0 0 3px rgba(124, 0, 255, 0.15) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '24px 0',
        borderBottom: '1px solid #2A2A2A'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#FFFFFF',
            margin: 0
          }}>
            Customize Element
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
              transition: 'all 0.25s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EAEAEA';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#888888';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            ×
          </button>
        </div>
        
        {/* Apply Changes Button */}
        <button
          onClick={handleApplyChanges}
          disabled={!hasChanges}
          style={{
            width: '100%',
            padding: '14px',
            background: hasChanges 
              ? 'linear-gradient(90deg, #7C00FF, #FF007F)' 
              : '#2A2A2A',
            color: hasChanges ? '#FFFFFF' : '#666666',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            if (hasChanges) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 0, 255, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {hasChanges 
            ? 'Apply Changes' 
            : '✓ No Changes'
          }
        </button>
        
        {/* Delete Element Button */}
        {onDeleteElement && (
          <button
            onClick={onDeleteElement}
            style={{
              width: '100%',
              padding: '12px',
              background: '#2A2A2A',
              color: '#FF4444',
              border: '1px solid #FF4444',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FF4444';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2A2A2A';
              e.currentTarget.style.color = '#FF4444';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🗑️ Delete Element
          </button>
        )}
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Element Type */}
          <div style={{
            fontSize: '13px',
            color: '#888888',
            fontFamily: 'monospace',
            backgroundColor: '#1A1A1A',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #2A2A2A'
          }}>
            &lt;{selectedElement.type}&gt;
          </div>
          
          {/* Element ID */}
          {selectedElement.id && (
            <div style={{
              fontSize: '12px',
              color: '#7C00FF',
              fontFamily: 'monospace',
              backgroundColor: '#1A1A1A',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #2A2A2A',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: '#888888' }}>🆔</span>
              <span>{selectedElement.id}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 0',
        borderBottom: '1px solid #2A2A2A'
      }}>
        {(['style', 'content', 'background', 'layout'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.25s ease-in-out',
              background: activeTab === tab ? 'linear-gradient(90deg, #7C00FF, #FF007F)' : 'transparent',
              color: activeTab === tab ? '#FFFFFF' : '#888888'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = '#252525';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 0'
      }}>
        {activeTab === 'style' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Background Color */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#B0B0B0',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Background Color
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value);
                    markAsChanged();
                  }}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '2px solid #2A2A2A',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: 'transparent'
                  }}
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value);
                    markAsChanged();
                  }}
                  className="property-input"
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '12px',
                    color: '#EAEAEA',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.25s ease-in-out'
                  }}
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#B0B0B0',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Text Color
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    markAsChanged();
                  }}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '2px solid #2A2A2A',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: 'transparent'
                  }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    markAsChanged();
                  }}
                  className="property-input"
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '12px',
                    color: '#EAEAEA',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.25s ease-in-out'
                  }}
                />
              </div>
            </div>

            {/* Font Size Slider */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#B0B0B0',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Font Size: <span style={{ color: '#7C00FF' }}>{fontSize}px</span>
              </label>
              <input
                type="range"
                min="8"
                max="72"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  markAsChanged();
                }}
              />
            </div>

            {/* Border Radius Slider */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#B0B0B0',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Border Radius: <span style={{ color: '#7C00FF' }}>{borderRadius}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={borderRadius}
                onChange={(e) => {
                  setBorderRadius(e.target.value);
                  markAsChanged();
                }}
              />
            </div>

            {/* Opacity Slider */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#B0B0B0',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Opacity: <span style={{ color: '#7C00FF' }}>{opacity}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => {
                  setOpacity(e.target.value);
                  markAsChanged();
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {isImageElement && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#B0B0B0',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Change Image
                </label>
                
                {/* AI Image Generation Prompt */}
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Describe the image you want (e.g., 'red sports car', 'modern office')..."
                    value={imagePrompt}
                    onChange={(e) => {
                      setImagePrompt(e.target.value);
                      markAsChanged();
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#1A1A1A',
                      border: '2px solid #7C00FF',
                      borderRadius: '12px',
                      color: '#EAEAEA',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.25s ease-in-out'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#FF007F'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#7C00FF'}
                  />
                  <div style={{
                    color: '#888888',
                    fontSize: '12px',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '16px' }}>✨</span>
                    AI will generate a new image based on your description
                  </div>
                </div>

                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '12px',
                  margin: '12px 0',
                  fontWeight: '600'
                }}>
                  OR
                </div>
                
                {/* File Upload Option */}
                <label style={{
                  display: 'block',
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#1A1A1A',
                  border: '2px dashed #7C00FF',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FF007F';
                  e.currentTarget.style.backgroundColor = '#252525';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#7C00FF';
                  e.currentTarget.style.backgroundColor = '#1A1A1A';
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                  <div style={{ color: '#EAEAEA', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    Upload Local Image
                  </div>
                  <div style={{ color: '#888888', fontSize: '12px' }}>
                    Click to browse or drag & drop
                  </div>
                </label>

                {/* Optimize Design Checkbox */}
                {imageFile && (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #7C00FF',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF007F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#7C00FF';
                  }}>
                    <input
                      type="checkbox"
                      checked={optimizeDesign}
                      onChange={(e) => {
                        setOptimizeDesign(e.target.checked);
                        markAsChanged();
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#7C00FF'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#EAEAEA', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                        🎨 Optimize & Enhance Design
                      </div>
                      <div style={{ color: '#888888', fontSize: '12px' }}>
                        AI will improve layout, colors, spacing, and typography
                      </div>
                    </div>
                  </label>
                )}

                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '12px',
                  margin: '12px 0',
                  fontWeight: '600'
                }}>
                  OR
                </div>
                
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    markAsChanged();
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="property-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '12px',
                    color: '#EAEAEA',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.25s ease-in-out',
                    marginBottom: '8px'
                  }}
                />
                <p style={{
                  fontSize: '11px',
                  color: '#666',
                  marginTop: '8px',
                  lineHeight: '1.5'
                }}>
                  Try these free image sources:<br/>
                  • Unsplash: https://images.unsplash.com/photo-XXXXX?w=500<br/>
                  • Picsum: https://picsum.photos/500/300<br/>
                  • Placeholder: https://via.placeholder.com/500x300
                </p>
                {(imageUrl || imagePreview) && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#B0B0B0',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      Preview:
                    </div>
                    <img 
                      src={imagePreview || imageUrl} 
                      alt="Preview" 
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #7C00FF'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#B0B0B0',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Element Content
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  markAsChanged();  // Mark as changed
                }}
                rows={8}
                className="property-input"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '12px',
                  color: '#EAEAEA',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'all 0.25s ease-in-out'
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Padding Slider */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#B0B0B0',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Padding: <span style={{ color: '#7C00FF' }}>{padding}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={padding}
                onChange={(e) => {
                  setPadding(e.target.value);
                  markAsChanged();
                }}
              />
            </div>

            {/* Margin Slider */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#B0B0B0',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Margin: <span style={{ color: '#7C00FF' }}>{margin}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={margin}
                onChange={(e) => {
                  setMargin(e.target.value);
                  markAsChanged();
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'background' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#B0B0B0',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Page Background
              </label>
              
              {/* Background Options Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {/* Option 1: None/White */}
                <div
                  onClick={() => {
                    setSelectedBackground('none');
                    markAsChanged();
                  }}
                  style={{
                    aspectRatio: '16/9',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: selectedBackground === 'none' ? '3px solid #7C00FF' : '2px solid #2A2A2A',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBackground !== 'none') {
                      e.currentTarget.style.borderColor = '#444444';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBackground !== 'none') {
                      e.currentTarget.style.borderColor = '#2A2A2A';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {selectedBackground === 'none' && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      color: '#7C00FF',
                      fontSize: '20px'
                    }}>✓</div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#666666'
                  }}>Clean</div>
                </div>

                {/* Option 2: Purple Gradient */}
                <div
                  onClick={() => {
                    setSelectedBackground('gradient-purple');
                    markAsChanged();
                  }}
                  style={{
                    aspectRatio: '16/9',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: selectedBackground === 'gradient-purple' ? '3px solid #7C00FF' : '2px solid #2A2A2A',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBackground !== 'gradient-purple') {
                      e.currentTarget.style.borderColor = '#444444';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBackground !== 'gradient-purple') {
                      e.currentTarget.style.borderColor = '#2A2A2A';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {selectedBackground === 'gradient-purple' && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      color: '#FFFFFF',
                      fontSize: '20px'
                    }}>✓</div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#FFFFFF'
                  }}>Purple</div>
                </div>

                {/* Option 3: Ocean Gradient */}
                <div
                  onClick={() => {
                    setSelectedBackground('gradient-ocean');
                    markAsChanged();
                  }}
                  style={{
                    aspectRatio: '16/9',
                    background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: selectedBackground === 'gradient-ocean' ? '3px solid #7C00FF' : '2px solid #2A2A2A',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBackground !== 'gradient-ocean') {
                      e.currentTarget.style.borderColor = '#444444';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBackground !== 'gradient-ocean') {
                      e.currentTarget.style.borderColor = '#2A2A2A';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {selectedBackground === 'gradient-ocean' && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      color: '#FFFFFF',
                      fontSize: '20px'
                    }}>✓</div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#FFFFFF'
                  }}>Ocean</div>
                </div>

                {/* Option 4: Dark Mesh */}
                <div
                  onClick={() => {
                    setSelectedBackground('mesh-dark');
                    markAsChanged();
                  }}
                  style={{
                    aspectRatio: '16/9',
                    background: 'radial-gradient(circle at 20% 50%, rgba(124, 0, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 0, 127, 0.2) 0%, transparent 50%), #0F0F0F',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: selectedBackground === 'mesh-dark' ? '3px solid #7C00FF' : '2px solid #2A2A2A',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBackground !== 'mesh-dark') {
                      e.currentTarget.style.borderColor = '#444444';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBackground !== 'mesh-dark') {
                      e.currentTarget.style.borderColor = '#2A2A2A';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {selectedBackground === 'mesh-dark' && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      color: '#FFFFFF',
                      fontSize: '20px'
                    }}>✓</div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#FFFFFF'
                  }}>Mesh</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;
