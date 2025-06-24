from flask import Flask, jsonify, request, make_response
from flask_restx import Api, Resource
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

api = Api(app)

@app.before_request
def log_request_info():
    print(f"Request: {request.method} {request.path}")

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    return response

@api.route('/schema/')
class UISchema(Resource):
    def get(self):
        with open('schema.json') as f:
            data = json.load(f)
        return data

@api.route('/data/')
class DatasetList(Resource):
    def get(self):
        with open('data.json') as f:
            data = json.load(f)
        return data
    
# if user clicks on product, 'selected' field is toggled
@api.route('/data/products/<int:id>')
class ProductSelect(Resource):
    # api for specific product selected
    def patch(self, id):
        print(f"PATCH /data/products/{id} called")

        with open('data.json', 'r') as f:
            data = json.load(f)

        for component in data['components']:
            if component['component'] == 'products':
                for product in component['data']:
                    if product['id'] == id:
                        product['selected'] = not product.get('selected', False)

                        with open('data.json', 'w') as fw:
                            json.dump(data, fw, indent=4)
                        return jsonify(product)
                    
        return {'message': "Error: data not found"}, 404
    
@api.route('/data/assign/')
class AssignProducts(Resource):
    @staticmethod # doesn't operate on instances
    def verify_order(order):
        customer_id = order["customer_id"]
        with open("data.json") as f:
            data = json.load(f)
        customer_comp = next((c for c in data["components"] if c["component"] == "customers"), None)
        customer = next((c for c in customer_comp["data"] if c["customer_id"] == customer_id), None)

        if not customer:
            return order
        address = customer.get("address", {})
        if all(k in address for k in ["street", "city", "state", "zip"]):
            order["current_state"] = "Verified"
        return order

    def post(self):
        payload = request.get_json() # read incoming HTTP request body
        print("Payload received:", payload)
        customerID = payload.get("customer_id")
        productIDs = payload.get("product_ids")

        if not customerID or not productIDs:
            return {"error": "Missing customer id or product ids"}, 400
        
        with open('data.json', 'r') as f:
            data = json.load(f)

        orders = next((c for c in data["components"] if c["component"] == "orders"), None)
        new_order = {
            "order_id": len(orders["data"]) + 1,
            "customer_id": customerID,
            "product_ids": productIDs,
            "current_state": "Placed"
        }
        orders["data"].append(new_order)
        self.verify_order(new_order)

        with open('data.json', "w") as f:
            json.dump(data, f, indent=4)

        return {
            "message": "Order placed and verified",
            "order": new_order
        }, 201

# def get_wftransitions():
#     with open("schema.json") as f:
#         schema = json.load(f)
#     return schema["workflow"]["transitions"]

# transitions = get_wftransitions()
# transitions.get(current, [])
    
if __name__ == "__main__":
    app.run(debug=True)