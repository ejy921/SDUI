import React from 'react';

const ProductCard = ({ pages, data, onProductClick, onSubmit }) => {

const hasBoolean = item =>
    Object.values(item).some(value => typeof value === 'boolean');
    const productStyle = pages[0].layout.components[1].components.product_list;
    const buttonStyle = pages[0]

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {data.map((item, i) => (
          <div key={i}>
            {hasBoolean(item) && (
              <div
                style={{
                  ...productStyle,
                  backgroundColor: item.selected ? productStyle.selectedColor : productStyle.unselectedColor,
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