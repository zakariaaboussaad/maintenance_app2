// components/common/StatCard.jsx
import React, { useState } from 'react';

const StatCard = ({ title, value, Icon: IconComponent, bgColor, iconColor }) => {
    const [isHovered, setIsHovered] = useState(false);

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: isHovered ? '0 8px 25px rgba(0, 0, 0, 0.08)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #f1f5f9',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'pointer'
    };

    return (
        <div
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div>
                <h3 style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginBottom: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {title}
                </h3>
                <div style={{fontSize: '36px', fontWeight: '800', color: '#1e293b'}}>
                    {value}
                </div>
            </div>
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <IconComponent size={28} style={{color: iconColor}} />
            </div>
        </div>
    );
};

export default StatCard;
