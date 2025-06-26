import './App.css';
import ComponentMap from './ComponentMap.js';
import React, { useEffect, useState } from 'react';

function App() {

  const [UIschema, setUIschema] = useState(null);
  const [components, setComponents] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  
  useEffect(() => {
    // fetch UI schema
    fetch('http://127.0.0.1:5000/schema/')
    .then(response => response.json())
    .then(json => setUIschema(json))
    .catch(err => console.error('Error fetching schema:', err));

    // fetch data (products, customers, orders)
    fetch('http://127.0.0.1:5000/data/')
      .then(response => response.json())
      .then(json => {
        setComponents(json.components);
      })
      .catch(err => console.error('Error fetching data', err));
  }, []);

  const renderPage = (page) => {
    const ly = page.layout;
    return (
      <div style={{ 
        height: '100vh', 
        display: ly.display, 
        gridTemplateRows: ly.gridRows, 
        gridTemplateColumns: ly.gridColumns, 
        gridTemplateAreas: `"${ly.gridAreas.join('" "')}"`
        }}>
        {ly.components.map((component, index) => {
          const HTMLTag =  component.gridArea || 'div';
          const ComponentToRender = ComponentMap[component.component_type];
          return React.createElement
            (
              HTMLTag, 
              {key: index, 
               style: {backgroundColor: component.color, gridArea: component.gridArea}},
               <>
                <h2 style={{ marginLeft: '30px'}}>{component.title}</h2>
                {ComponentToRender ? (
                <ComponentToRender
                  pages={UIschema.pages}
                  data={components.find(c => c.component === component.component_type)?.data || []}
                  onProductClick={productClicked} 
                  onSubmit={submitOrder}// for now
                />
              ) : (
                <p style={{ marginLeft: '30px' }}>Unsupported component type: {component.component_type}</p>
              )}
               </>
            ); 
        })}
      </div>
    )

  }

  // flips only selected value -> returns updated product as JSON
  const productClicked = (productId) => {
    fetch(`http://127.0.0.1:5000/data/products/${productId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'}, 
      mode: 'cors'})
      .then(response => response.json())
      .then(updatedProduct => { // receive updated product in React
        setComponents(prev => // React re-renders after update
          prev.map(component =>
            component.component === 'products' ? {
              ...component, data: component.data.map(p =>
                p.id === updatedProduct.id ? updatedProduct : p
              )
            } : component
          )
        );

        setSelectedProductIds(prev => 
          prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
      })
      .catch(err => console.error('Error updating product', err));
  }

  const submitOrder = () => {
    fetch('http://127.0.0.1:5000/data/assign/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        customer_id: 1,
        product_ids: selectedProductIds
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log("Order created:", data);

        // reset selected products when order is created
        setSelectedProductIds([]);
        setComponents(prev =>
          prev.map(component =>
            component.component === 'products'
              ? {
                  ...component,
                  data: component.data.map(product => ({
                    ...product,          
                    selected: false     
                  }))
                } : component
        ));
      })
      .catch(err => console.error(err));
  }

  return (
    <div>
      <div>{UIschema? renderPage(UIschema.pages[0]) : <p>Loading...</p>}</div>
    </div>
  );
}

export default App;
