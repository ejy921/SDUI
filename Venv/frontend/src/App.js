import './App.css';
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
        {ly.components.map((component, index) => { // map through the components
          const HTMLTag =  component.gridArea || 'div';
          return React.createElement
            (
              HTMLTag, 
              {key: index, 
               style: {backgroundColor: component.color, gridArea: component.gridArea}},
               <>
                <h2 style={{ marginLeft: '30px'}}>{component.title}</h2>
                {component.component_type === 'products' && renderComponent(component)}
               </>
            ); 
        })}
      </div>
    )

  }

  // render individual UI component 
  const renderComponent = (UIcomponent) => {
    return <div>
      {components
        .filter(component => component.component === 'products')
        .map((component, index) => (
          <div key={index} style={{ display: 'flex', flexWrap: 'wrap'}}>
            {component.data.map((item, i) => {
              const hasBoolean = Object.values(item).some(value => typeof value === 'boolean');

              return (
                <div key={i}>
                  {/* If one of the fields has a boolean data type, it automatically renders to a box */}
                  {hasBoolean && (
                    <div style={{ backgroundColor: item.selected ? '#c5e0d8' : '#e1edea', width: '250px', height: '150px', margin: '10px', padding: '5px', textAlign: 'center', borderRadius: '5px', cursor: 'pointer'}}
                     onClick={() => productClicked(item.id)}>
                      <p style={{ paddingTop: '5px'}}>{item.name}</p>
                      <p>{item.price}</p>
                    </div>)}
                </div>);})}
          </div>))}
          <button onClick={submitOrder} style={{ backgroundColor: '#B6C4A2', width: '150px', height: '50px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer', border: 'None', margin: '10px'}}>Order items</button>
      </div>
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
