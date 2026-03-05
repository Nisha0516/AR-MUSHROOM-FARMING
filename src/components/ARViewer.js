import React from 'react';
import '@google/model-viewer';
import './ARViewer.css';

const ARViewer = ({ src, iosSrc, alt, poster }) => {
    return (
        <div className="ar-viewer-container">
            <model-viewer
                src={src}
                ios-src={iosSrc}
                alt={alt || "A 3D model"}
                poster={poster}
                shadow-intensity="1"
                camera-controls
                auto-rotate
                ar
                ar-modes="webxr scene-viewer quick-look"
                style={{ width: '100%', height: '300px', backgroundColor: '#fcfcfc', borderRadius: '10px' }}
            >
                <button slot="ar-button" variant="primary" className="ar-button">
                    View in your space
                </button>
            </model-viewer>
        </div>
    );
};

export default ARViewer;
