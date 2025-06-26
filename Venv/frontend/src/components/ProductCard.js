import React from 'react';

const ProductCard = ({ data, onProductClick, onSubmit }) => {

const hasBoolean = item =>
    Object.values(item).some(value => typeof value === 'boolean');

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {data.map((item, i) => (
          <div key={i}>
            {hasBoolean(item) && (
              <div
                style={{
                  backgroundColor: item.selected ? '#c5e0d8' : '#e1edea',
                  width: '250px',
                  height: '150px',
                  margin: '10px',
                  padding: '5px',
                  textAlign: 'center',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
                onClick={() => onProductClick(item.id)}
              >
                <p style={{ paddingTop: '5px' }}>{item.name}</p>
                <p>{item.price}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onSubmit}
        style={{
          backgroundColor: '#B6C4A2',
          width: '150px',
          height: '50px',
          textAlign: 'center',
          borderRadius: '10px',
          cursor: 'pointer',
          border: 'None',
          margin: '10px',
        }}
      >
        Order items
      </button>
    </div>
  );
};

export default ProductCard;